import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import {
  getOAuth2Client,
  getAuthUrl,
  generateState,
  verifyState,
  revokeGoogleToken,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_TTL_MS,
} from '../config/google';
import { getSupabase } from '../config/db';
import {
  generateToken,
  authMiddleware,
  AuthRequest,
  setSessionCookie,
  clearSessionCookie,
} from '../middleware/auth.middleware';
import { revokeToken } from '../services/tokenDenylist';
import { encryptToken, decryptToken } from '../services/tokenCrypto';
import { config } from '../config';

const router = Router();

function authError(res: Response, message: string): void {
  // Error text is fixed and non-descriptive by design — the callback URL is
  // attacker-influenced, so nothing from it is ever reflected back.
  res.redirect(`${config.frontendUrl}/auth/error?message=${encodeURIComponent(message)}`);
}

/**
 * GET /auth/google
 * Starts the OAuth flow with a CSRF state nonce.
 */
router.get('/google', (_req: Request, res: Response) => {
  const state = generateState();

  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    maxAge: OAUTH_STATE_TTL_MS,
    path: '/',
  });

  res.redirect(getAuthUrl(state));
});

/**
 * GET /auth/google/callback
 * Verifies state, exchanges the code, upserts the user, sets a session cookie.
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const expectedState = req.cookies?.[OAUTH_STATE_COOKIE];

    // Consume the nonce immediately — it is valid for exactly one attempt.
    res.clearCookie(OAUTH_STATE_COOKIE, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      domain: config.cookie.domain,
      path: '/',
    });

    if (!verifyState(state, expectedState)) {
      console.warn('[Auth] OAuth state mismatch — possible CSRF attempt');
      authError(res, 'Authentication failed');
      return;
    }

    if (!code || typeof code !== 'string') {
      authError(res, 'Authentication failed');
      return;
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    if (!profile.id || !profile.email) {
      authError(res, 'Authentication failed');
      return;
    }

    // Google only returns a refresh token on first consent. Never overwrite a
    // stored one with undefined, or the account loses offline access silently.
    const record: Record<string, unknown> = {
      google_id: profile.id,
      email: profile.email,
      name: profile.name || '',
      picture_url: profile.picture || '',
      access_token: encryptToken(tokens.access_token),
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    };
    if (tokens.refresh_token) {
      record.refresh_token = encryptToken(tokens.refresh_token);
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .upsert(record, { onConflict: 'google_id' })
      .select('id, email')
      .single();

    if (error || !user) {
      console.error('[Auth] Upsert error:', error);
      authError(res, 'Authentication failed');
      return;
    }

    // The JWT travels in an httpOnly cookie, never in the URL — a token in a
    // query string ends up in browser history, referrer headers and proxy logs.
    setSessionCookie(res, generateToken({ userId: user.id, email: user.email }));
    res.redirect(`${config.frontendUrl}/auth/callback`);
  } catch (error) {
    console.error('[Auth] Callback error:', error);
    authError(res, 'Authentication failed');
  }
});

/**
 * GET /auth/me
 * Returns the current authenticated user.
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, picture_url, sync_status, last_sync_at, total_emails_synced, created_at')
      .eq('id', req.userId!)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('[Auth] Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/logout
 * Revokes the presented token and clears the cookie.
 */
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  const revoked = await revokeToken(req.token!, decodeExp(req.token!));
  clearSessionCookie(res);

  res.json({
    message: 'Logged out successfully',
    // Honest about the degraded case rather than reporting success regardless.
    serverSideRevocation: revoked,
  });
});

/**
 * DELETE /auth/account
 * Deletes the account, revokes our Google grant, and kills the session.
 */
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();

    // Revoke at Google first. If deletion succeeded but revocation failed, we
    // would be left holding a live grant with no record that we have it.
    const { data: user } = await supabase
      .from('users')
      .select('refresh_token, access_token')
      .eq('id', req.userId!)
      .single();

    const grant = decryptToken(user?.refresh_token) ?? decryptToken(user?.access_token);
    if (grant) {
      try {
        await revokeGoogleToken(grant);
      } catch (revokeError) {
        // Non-fatal: the user asked for deletion and must still get it.
        console.error('[Auth] Google token revocation failed:', (revokeError as Error).message);
      }
    }

    const { error } = await supabase.from('users').delete().eq('id', req.userId!);

    if (error) {
      console.error('[Auth] Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
      return;
    }

    await revokeToken(req.token!, decodeExp(req.token!));
    clearSessionCookie(res);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[Auth] Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Read `exp` from an already-verified token so the denylist entry expires with it. */
function decodeExp(token: string): number | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp : undefined;
  } catch {
    return undefined;
  }
}

export default router;

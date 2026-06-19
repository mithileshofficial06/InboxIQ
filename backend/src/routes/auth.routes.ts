import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { getOAuth2Client, getAuthUrl } from '../config/google';
import { getSupabase } from '../config/db';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { config } from '../config';

const router = Router();

/**
 * GET /auth/google
 * Redirects user to Google OAuth consent screen
 */
router.get('/google', (_req: Request, res: Response) => {
  const url = getAuthUrl();
  res.redirect(url);
});

/**
 * GET /auth/google/callback
 * Handles OAuth callback, exchanges code for tokens, upserts user, returns JWT
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.redirect(`${config.frontendUrl}/auth/error?message=Missing authorization code`);
      return;
    }

    // Exchange code for tokens
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    if (!profile.id || !profile.email) {
      res.redirect(`${config.frontendUrl}/auth/error?message=Failed to get user profile`);
      return;
    }

    // Upsert user in database
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          google_id: profile.id,
          email: profile.email,
          name: profile.name || '',
          picture_url: profile.picture || '',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || undefined,
          token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        },
        { onConflict: 'google_id' }
      )
      .select('id, email')
      .single();

    if (error || !user) {
      console.error('[Auth] Upsert error:', error);
      res.redirect(`${config.frontendUrl}/auth/error?message=Database error`);
      return;
    }

    // Generate JWT
    const token = generateToken({ userId: user.id, email: user.email });

    // Redirect to frontend with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('[Auth] Callback error:', error);
    res.redirect(`${config.frontendUrl}/auth/error?message=Authentication failed`);
  }
});

/**
 * GET /auth/me
 * Returns current authenticated user
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, picture_url, sync_status, last_sync_at, total_emails_synced, created_at')
      .eq('id', req.userId)
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
 * Clears authentication (client should also clear stored token)
 */
router.post('/logout', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

/**
 * DELETE /auth/account
 * Deletes user account and all associated data (cascading)
 */
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.userId);

    if (error) {
      console.error('[Auth] Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
      return;
    }

    res.clearCookie('token');
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[Auth] Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

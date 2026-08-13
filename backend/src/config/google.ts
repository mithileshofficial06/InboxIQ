import crypto from 'node:crypto';
import { google } from 'googleapis';
import { config } from './index';

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

/**
 * CSRF protection for the OAuth flow.
 *
 * Without a state parameter, an attacker can send a victim a crafted callback
 * URL containing the attacker's own authorization code, silently binding the
 * victim's session to the attacker's Google account. The nonce below is stored
 * in a short-lived httpOnly cookie and must match on return.
 */
export const OAUTH_STATE_COOKIE = 'inboxiq_oauth_state';
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export function generateState(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/** Constant-time comparison so the check can't be probed by timing. */
export function verifyState(received: unknown, expected: unknown): boolean {
  if (typeof received !== 'string' || typeof expected !== 'string') return false;
  if (received.length !== expected.length || received.length === 0) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function getAuthUrl(state: string): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: config.google.scopes,
    state,
  });
}

/**
 * Revoke a Google grant so deleting an account actually ends our access,
 * rather than leaving a live refresh token in Google's records.
 */
export async function revokeGoogleToken(token: string): Promise<void> {
  const oauth2Client = getOAuth2Client();
  await oauth2Client.revokeToken(token);
}

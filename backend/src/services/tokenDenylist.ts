import crypto from 'node:crypto';
import { getRedis, isRedisAvailable } from '../config/redis';

/**
 * Revocation list for issued JWTs.
 *
 * JWTs are stateless, so "logging out" by clearing a cookie leaves the token
 * itself valid until it expires — anyone who captured it can keep using it.
 * This records revoked tokens in Redis until their natural expiry, which is the
 * shortest-lived storage that still makes logout mean something.
 *
 * Redis is optional in this project, so this degrades gracefully: if Redis is
 * unavailable, revocation is skipped and the short JWT TTL is the only bound.
 * That is announced loudly rather than silently accepted.
 */

const PREFIX = 'inboxiq:revoked:';

/** Tokens are stored as a hash — never keep raw credentials in Redis. */
function keyFor(token: string): string {
  return PREFIX + crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Revoke a token until the given expiry (seconds since epoch, the JWT `exp`).
 * Returns false when revocation could not be recorded.
 */
export async function revokeToken(token: string, expSeconds?: number): Promise<boolean> {
  if (!isRedisAvailable()) {
    console.warn('[Denylist] Redis unavailable — token could not be revoked server-side');
    return false;
  }

  const redis = getRedis();
  if (!redis) return false;

  // Keep the entry only as long as the token could still be accepted.
  const ttlSeconds = expSeconds
    ? Math.max(1, expSeconds - Math.floor(Date.now() / 1000))
    : 12 * 60 * 60;

  try {
    await redis.set(keyFor(token), '1', 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.error('[Denylist] Failed to revoke token:', (err as Error).message);
    return false;
  }
}

/**
 * Check whether a token has been revoked.
 *
 * Fails open when Redis is down: rejecting every request because the denylist
 * is unreachable would turn a cache outage into a full outage. The tradeoff is
 * documented rather than hidden — pair this with a short JWT TTL.
 */
export async function isTokenRevoked(token: string): Promise<boolean> {
  if (!isRedisAvailable()) return false;

  const redis = getRedis();
  if (!redis) return false;

  try {
    return (await redis.exists(keyFor(token))) === 1;
  } catch (err) {
    console.error('[Denylist] Lookup failed:', (err as Error).message);
    return false;
  }
}

import crypto from 'node:crypto';
import { config } from '../config';

/**
 * Authenticated encryption for Google OAuth tokens at rest.
 *
 * A Google refresh token is durable, unexpiring read access to someone's entire
 * mailbox. Anyone who obtains a database dump — via a leaked connection string,
 * a backup, or a compromised service-role key — would otherwise be able to read
 * every user's Gmail indefinitely. Encrypting here means a database dump alone
 * is not enough; the attacker also needs TOKEN_ENCRYPTION_KEY, which never
 * leaves the application environment.
 *
 * Format: v1:<iv-b64>:<authTag-b64>:<ciphertext-b64>
 * The version prefix lets us rotate algorithms later without ambiguity.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit nonce, the GCM standard
const VERSION = 'v1';

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = config.tokenEncryptionKey;
  if (!raw) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not configured — cannot encrypt OAuth tokens.');
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (got ${key.length}). ` +
        'Generate one with: openssl rand -base64 32'
    );
  }

  cachedKey = key;
  return key;
}

/** Encrypt a token. Returns null for null/empty input so callers can pass through. */
export function encryptToken(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a token.
 *
 * Returns null when the value cannot be decrypted. Values written before
 * encryption was introduced are plaintext and have no version prefix — those
 * are returned as-is so existing users keep working until their next token
 * refresh rewrites them in encrypted form.
 */
export function decryptToken(stored: string | null | undefined): string | null {
  if (!stored) return null;

  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    // Legacy plaintext token — migrated on next write.
    return stored;
  }

  try {
    const [, ivB64, tagB64, dataB64] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch (err) {
    console.error('[TokenCrypto] Failed to decrypt token:', (err as Error).message);
    return null;
  }
}

/** True when a stored value is already in encrypted form. */
export function isEncrypted(stored: string | null | undefined): boolean {
  return Boolean(stored && stored.startsWith(`${VERSION}:`));
}

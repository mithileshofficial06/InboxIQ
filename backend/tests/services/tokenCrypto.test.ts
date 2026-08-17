/**
 * Google refresh tokens are durable mailbox access, so the at-rest encryption in
 * services/tokenCrypto.ts is the thing standing between a database dump and every
 * user's Gmail. These tests pin the format, the failure modes, and the legacy
 * plaintext passthrough that keeps pre-encryption rows working.
 */

type TokenCrypto = typeof import('../../src/services/tokenCrypto');

const VALID_KEY = Buffer.alloc(32, 7).toString('base64');

/**
 * The 32-byte key is read once and cached at module scope, so any test that
 * varies it has to load the module fresh.
 */
function loadCrypto(key: string = VALID_KEY): TokenCrypto {
  jest.resetModules();
  process.env.TOKEN_ENCRYPTION_KEY = key;
  return require('../../src/services/tokenCrypto') as TokenCrypto;
}

describe('tokenCrypto', () => {
  const originalKey = process.env.TOKEN_ENCRYPTION_KEY;

  afterAll(() => {
    process.env.TOKEN_ENCRYPTION_KEY = originalKey;
  });

  describe('encryptToken / decryptToken round trip', () => {
    it('recovers the original plaintext', () => {
      const { encryptToken, decryptToken } = loadCrypto();
      const secret = 'ya29.a0AfB_byC-some-google-refresh-token';

      expect(decryptToken(encryptToken(secret))).toBe(secret);
    });

    it('produces the versioned four-part format', () => {
      const { encryptToken } = loadCrypto();

      const parts = encryptToken('token')!.split(':');

      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('v1');
    });

    it('produces different ciphertext each time for the same input', () => {
      const { encryptToken } = loadCrypto();

      // A fresh random IV per encryption — identical tokens must not produce
      // identical rows, which would leak equality across the table.
      expect(encryptToken('same')).not.toBe(encryptToken('same'));
    });

    it('round trips unicode and long values', () => {
      const { encryptToken, decryptToken } = loadCrypto();
      const secret = `${'x'.repeat(4000)}-café-🔐`;

      expect(decryptToken(encryptToken(secret))).toBe(secret);
    });
  });

  describe('empty input passthrough', () => {
    it.each([null, undefined, ''])('encryptToken(%p) returns null', (input) => {
      const { encryptToken } = loadCrypto();

      expect(encryptToken(input as string | null | undefined)).toBeNull();
    });

    it.each([null, undefined, ''])('decryptToken(%p) returns null', (input) => {
      const { decryptToken } = loadCrypto();

      expect(decryptToken(input as string | null | undefined)).toBeNull();
    });
  });

  describe('legacy plaintext values', () => {
    it('returns unprefixed values as-is so pre-encryption rows keep working', () => {
      const { decryptToken } = loadCrypto();

      expect(decryptToken('ya29.plaintext-legacy-token')).toBe('ya29.plaintext-legacy-token');
    });

    it('returns colon-containing values without the v1 prefix as-is', () => {
      const { decryptToken } = loadCrypto();

      expect(decryptToken('v0:a:b:c')).toBe('v0:a:b:c');
    });
  });

  describe('tampered ciphertext', () => {
    it('returns null rather than throwing when the payload is altered', () => {
      const { encryptToken, decryptToken } = loadCrypto();
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const [version, iv, tag] = encryptToken('token')!.split(':');
      const forged = [version, iv, tag, Buffer.from('forged').toString('base64')].join(':');

      expect(decryptToken(forged)).toBeNull();
    });

    it('returns null when the auth tag does not match', () => {
      const { encryptToken, decryptToken } = loadCrypto();
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const [version, iv, , data] = encryptToken('token')!.split(':');
      const forged = [version, iv, Buffer.alloc(16, 1).toString('base64'), data].join(':');

      expect(decryptToken(forged)).toBeNull();
    });

    it('cannot be decrypted with a different key', () => {
      const encrypted = loadCrypto(VALID_KEY).encryptToken('token')!;
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const otherKey = loadCrypto(Buffer.alloc(32, 9).toString('base64'));

      expect(otherKey.decryptToken(encrypted)).toBeNull();
    });
  });

  describe('key validation', () => {
    it('throws when TOKEN_ENCRYPTION_KEY is missing', () => {
      const { encryptToken } = loadCrypto('');

      expect(() => encryptToken('token')).toThrow(/TOKEN_ENCRYPTION_KEY is not configured/);
    });

    it('throws when the key does not decode to 32 bytes', () => {
      const { encryptToken } = loadCrypto(Buffer.alloc(16, 1).toString('base64'));

      expect(() => encryptToken('token')).toThrow(/must decode to exactly 32 bytes/);
    });
  });

  describe('isEncrypted', () => {
    it('is true for values this module produced', () => {
      const { encryptToken, isEncrypted } = loadCrypto();

      expect(isEncrypted(encryptToken('token'))).toBe(true);
    });

    it.each([null, undefined, '', 'plaintext', 'v0:a:b:c'])('is false for %p', (input) => {
      const { isEncrypted } = loadCrypto();

      expect(isEncrypted(input as string | null | undefined)).toBe(false);
    });
  });
});

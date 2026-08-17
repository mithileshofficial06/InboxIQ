/**
 * validateEnvironment is the startup gate that stops the server booting with a
 * silent security downgrade — a forgeable JWT secret, unencrypted OAuth tokens,
 * or an unauthenticated AI service. Each fatal branch is pinned here.
 */

// config/index.ts calls dotenv.config() at import. Stubbing it keeps these tests
// deterministic — otherwise a developer's local .env would repopulate the very
// variables each case deliberately removes.
jest.mock('dotenv', () => ({ __esModule: true, default: { config: jest.fn() } }));

const VALID_ENV: Record<string, string> = {
  NODE_ENV: 'development',
  GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:3001/auth/google/callback',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  JWT_SECRET: 'a-sufficiently-long-random-secret-value',
  TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 3).toString('base64'),
  AI_SERVICE_URL: 'http://localhost:8000',
  AI_SERVICE_TOKEN: 'shared-service-token',
  NVIDIA_API_KEY: 'nvidia-key',
  REDIS_HOST: 'redis.example.com',
  FRONTEND_URL: 'http://localhost:3000',
};

const ORIGINAL_ENV = process.env;

/** Load validateEnvironment against a fresh env built from VALID_ENV + overrides. */
function runValidation(overrides: Record<string, string | undefined> = {}): void {
  jest.resetModules();

  const env: Record<string, string> = { ...VALID_ENV };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }
  process.env = env as NodeJS.ProcessEnv;

  const { validateEnvironment } = require('../../src/config/validation');
  validateEnvironment();
}

describe('validateEnvironment', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('passes with a fully configured environment', () => {
    expect(() => runValidation()).not.toThrow();
  });

  describe('fatal misconfiguration', () => {
    it.each([
      ['GOOGLE_CLIENT_ID missing', { GOOGLE_CLIENT_ID: undefined }],
      ['GOOGLE_CLIENT_SECRET missing', { GOOGLE_CLIENT_SECRET: undefined }],
      ['SUPABASE_URL missing', { SUPABASE_URL: undefined }],
      ['SUPABASE_SERVICE_ROLE_KEY missing', { SUPABASE_SERVICE_ROLE_KEY: undefined }],
      ['JWT_SECRET missing', { JWT_SECRET: undefined }],
      ['JWT_SECRET left at the public default', { JWT_SECRET: 'dev-secret-change-this' }],
      ['JWT_SECRET shorter than 32 chars', { JWT_SECRET: 'too-short' }],
      ['TOKEN_ENCRYPTION_KEY missing', { TOKEN_ENCRYPTION_KEY: undefined }],
      ['AI_SERVICE_TOKEN missing', { AI_SERVICE_TOKEN: undefined }],
    ])('throws when %s', (_label, overrides) => {
      expect(() => runValidation(overrides)).toThrow(/Environment validation failed/);
    });
  });

  describe('production hardening', () => {
    it('throws when FRONTEND_URL is not HTTPS in production', () => {
      expect(() =>
        runValidation({ NODE_ENV: 'production', FRONTEND_URL: 'http://app.example.com' })
      ).toThrow(/Environment validation failed/);
    });

    it('throws when GOOGLE_REDIRECT_URI is not HTTPS in production', () => {
      expect(() =>
        runValidation({
          NODE_ENV: 'production',
          FRONTEND_URL: 'https://app.example.com',
          GOOGLE_REDIRECT_URI: 'http://api.example.com/auth/google/callback',
        })
      ).toThrow(/Environment validation failed/);
    });

    it('passes in production when both URLs use HTTPS', () => {
      expect(() =>
        runValidation({
          NODE_ENV: 'production',
          FRONTEND_URL: 'https://app.example.com',
          GOOGLE_REDIRECT_URI: 'https://api.example.com/auth/google/callback',
        })
      ).not.toThrow();
    });

    it('allows plain HTTP outside production', () => {
      expect(() => runValidation({ NODE_ENV: 'development' })).not.toThrow();
    });
  });

  describe('non-fatal warnings', () => {
    it('warns but does not throw when NVIDIA_API_KEY is absent', () => {
      expect(() => runValidation({ NVIDIA_API_KEY: undefined })).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('NVIDIA_API_KEY'));
    });
  });
});

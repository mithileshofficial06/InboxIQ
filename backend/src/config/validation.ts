import { config } from './index';

const INSECURE_JWT_DEFAULT = 'dev-secret-change-this';

/**
 * Validates required environment variables at startup.
 *
 * Anything that would cause a silent security downgrade is fatal in every
 * environment, not just production — a dev server that quietly accepts forged
 * tokens is how those defaults reach production in the first place.
 */
export function validateEnvironment(): void {
  const fatal: string[] = [];
  const warnings: string[] = [];

  // --- Google OAuth ---
  if (!config.google.clientId) fatal.push('GOOGLE_CLIENT_ID is required');
  if (!config.google.clientSecret) fatal.push('GOOGLE_CLIENT_SECRET is required');

  // --- Supabase ---
  // The backend authenticates with the SERVICE ROLE key (see config/db.ts), so
  // that is the one that must be present. The anon key is not used server-side.
  if (!config.supabase.url) fatal.push('SUPABASE_URL is required');
  if (!config.supabase.serviceRoleKey) {
    fatal.push('SUPABASE_SERVICE_ROLE_KEY is required (the backend authenticates with it)');
  }

  // --- Redis ---
  if (!config.redis.host) warnings.push('REDIS_HOST is not set — email sync will be disabled');

  // --- JWT ---
  if (!config.jwt.secret || config.jwt.secret === INSECURE_JWT_DEFAULT) {
    fatal.push(
      'JWT_SECRET must be set to a strong random value. The built-in default is public ' +
        'and anyone who knows it can forge sessions.'
    );
  } else if (config.jwt.secret.length < 32) {
    fatal.push('JWT_SECRET must be at least 32 characters');
  }

  // --- Token encryption ---
  if (!config.tokenEncryptionKey) {
    fatal.push(
      'TOKEN_ENCRYPTION_KEY is required — Google refresh tokens are encrypted at rest with it. ' +
        'Generate one with: openssl rand -base64 32'
    );
  }

  // --- AI service ---
  if (!config.aiService.url) fatal.push('AI_SERVICE_URL is required');
  if (!config.aiService.token) {
    fatal.push(
      'AI_SERVICE_TOKEN is required — it authenticates this backend to the AI service. ' +
        'Generate one with: openssl rand -base64 32'
    );
  }

  // --- NVIDIA NIM ---
  if (!config.nvidiaApiKey) warnings.push('NVIDIA_API_KEY is not set — AI features will fail');

  // --- Production-only hardening ---
  if (config.nodeEnv === 'production') {
    if (!config.frontendUrl.startsWith('https://')) {
      fatal.push('FRONTEND_URL must use HTTPS in production');
    }
    if (!config.google.redirectUri.startsWith('https://')) {
      fatal.push('GOOGLE_REDIRECT_URI must use HTTPS in production');
    }
  }

  warnings.forEach((w) => console.warn(`[Config] ⚠️  ${w}`));

  if (fatal.length > 0) {
    console.error('[Config] Environment validation failed:');
    fatal.forEach((err) => console.error(`  ❌ ${err}`));
    throw new Error(`Environment validation failed with ${fatal.length} error(s)`);
  }

  console.log('[Config] ✅ All required environment variables are set');
}

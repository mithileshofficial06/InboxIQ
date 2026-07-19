import { config } from './index';

/**
 * Validates that all required environment variables are set
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Google OAuth
  if (!config.google.clientId) {
    errors.push('GOOGLE_CLIENT_ID is required');
  }
  if (!config.google.clientSecret) {
    errors.push('GOOGLE_CLIENT_SECRET is required');
  }

  // Supabase
  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }
  if (!config.supabase.anonKey) {
    errors.push('SUPABASE_ANON_KEY is required');
  }

  // Redis
  if (!config.redis.host) {
    errors.push('REDIS_HOST is required');
  }

  // JWT
  if (config.jwt.secret === 'dev-secret-change-this' && config.nodeEnv === 'production') {
    errors.push('JWT_SECRET must be set in production');
  }

  // AI Service
  if (!config.aiServiceUrl) {
    errors.push('AI_SERVICE_URL is required');
  }

  // NVIDIA NIM
  if (!config.nvidiaApiKey) {
    errors.push('NVIDIA_API_KEY is required');
  }

  if (errors.length > 0) {
    console.error('[Config] Environment validation failed:');
    errors.forEach((err) => console.error(`  ❌ ${err}`));
    
    if (config.nodeEnv === 'production') {
      throw new Error('Environment validation failed');
    } else {
      console.warn('[Config] Running in development mode with missing variables');
    }
  } else {
    console.log('[Config] ✅ All required environment variables are set');
  }
}

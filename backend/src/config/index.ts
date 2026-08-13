import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Redis (Upstash)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT — short-lived by design. Sessions are stateless, so the only bound on a
  // stolen or revoked token is its lifetime (plus the denylist in services/tokenDenylist).
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  },

  // Session cookie carrying the JWT. httpOnly so XSS cannot read it.
  cookie: {
    name: 'inboxiq_session',
    // Cross-site cookies (frontend and API on different hosts) require
    // SameSite=None, which browsers only accept alongside Secure.
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAgeMs: 12 * 60 * 60 * 1000,
  },

  // 32-byte key (base64) used to encrypt Google refresh tokens at rest.
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || '',

  // AI Microservice — private component, reached only via services/aiService.client.ts
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    // Shared secret the AI service requires on every /ai/* call.
    token: process.env.AI_SERVICE_TOKEN || '',
  },

  // NVIDIA NIM
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
};

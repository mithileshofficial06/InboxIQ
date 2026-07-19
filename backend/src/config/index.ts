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

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-this',
    expiresIn: '7d',
  },

  // AI Microservice
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',

  // NVIDIA NIM
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
};

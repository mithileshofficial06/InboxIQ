/**
 * Environment Variable Validation
 * Ensures all required credentials are present at startup
 */

export function validateEnvironment(): void {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_HOST',
    'REDIS_PASSWORD',
    'JWT_SECRET',
    'GEMINI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 Copy .env.example to .env and fill in your credentials');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

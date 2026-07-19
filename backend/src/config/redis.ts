import IORedis from 'ioredis';
import { config } from './index';

let redis: IORedis | null = null;
let redisAvailable = false; // Start as false until connection succeeds
let connectionAttempted = false;

export function getRedis(): IORedis | null {
  if (!redis && !connectionAttempted) {
    connectionAttempted = true;
    
    try {
      // Strip https:// or rediss:// prefixes if they exist in the host
      let host = config.redis.host;
      if (host.startsWith('https://')) host = host.replace('https://', '');
      if (host.startsWith('rediss://')) host = host.replace('rediss://', '');

      console.log(`[Redis] Attempting connection to ${host}:${config.redis.port}...`);

      redis = new IORedis({
        host: host,
        port: config.redis.port,
        password: config.redis.password,
        maxRetriesPerRequest: null, // Required by BullMQ
        tls: {}, // TLS is required for Upstash
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[Redis] ⚠️  Connection failed after 3 retries - Running WITHOUT Redis');
            console.warn('[Redis] ⚠️  Email sync functionality will be disabled');
            redisAvailable = false;
            return null; // Stop retrying
          }
          console.log(`[Redis] Retry attempt ${times}/3...`);
          return Math.min(times * 1000, 3000);
        },
      });

      redis.on('error', (err) => {
        console.error('[Redis] ❌ Connection error:', err.message);
        
        if (err.message.includes('ENOTFOUND')) {
          console.error('[Redis] ❌ Host not found - check REDIS_HOST value');
        } else if (err.message.includes('WRONGPASS') || err.message.includes('NOAUTH')) {
          console.error('[Redis] ❌ Authentication failed - check REDIS_PASSWORD value');
        } else if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
          console.error('[Redis] ❌ Connection timeout - check firewall/network');
        }
        
        redisAvailable = false;
      });

      redis.on('connect', () => {
        console.log('[Redis] ✅ Connected successfully');
        redisAvailable = true;
      });

      redis.on('ready', () => {
        console.log('[Redis] ✅ Ready to accept commands');
        redisAvailable = true;
      });

      redis.on('close', () => {
        console.log('[Redis] Connection closed');
        redisAvailable = false;
      });

    } catch (error: any) {
      console.error('[Redis] ❌ Failed to initialize:', error.message);
      console.warn('[Redis] ⚠️  Running WITHOUT Redis - Email sync disabled');
      redisAvailable = false;
      return null;
    }
  }
  return redis;
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redis !== null;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    connectionAttempted = false;
    redisAvailable = false;
  }
}


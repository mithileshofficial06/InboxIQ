import IORedis from 'ioredis';
import { config } from './index';

let redis: IORedis | null = null;
let redisAvailable = true;

export function getRedis(): IORedis | null {
  if (!redis && redisAvailable) {
    try {
      // Strip https:// or rediss:// prefixes if they exist in the host
      let host = config.redis.host;
      if (host.startsWith('https://')) host = host.replace('https://', '');
      if (host.startsWith('rediss://')) host = host.replace('rediss://', '');

      redis = new IORedis({
        host: host,
        port: config.redis.port,
        password: config.redis.password,
        maxRetriesPerRequest: null, // Required by BullMQ
        tls: {}, // TLS is required for Upstash regardless of environment
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[Redis] ⚠️  Connection failed - Running WITHOUT Redis (email sync disabled)');
            redisAvailable = false;
            return null; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        },
      });

      redis.on('error', (err) => {
        if (err.message.includes('ENOTFOUND') || err.message.includes('WRONGPASS')) {
          console.error('[Redis] ❌ Connection error:', err.message);
          console.warn('[Redis] ⚠️  Continuing WITHOUT Redis - Email sync will be disabled');
          redisAvailable = false;
        }
      });

      redis.on('connect', () => {
        console.log('[Redis] ✅ Connected successfully');
        redisAvailable = true;
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
  }
}


import IORedis from 'ioredis';
import { config } from './index';

let redis: IORedis | null = null;

export function getRedis(): IORedis {
  if (!redis) {
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
    });

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { validateEnvironment } from './config/validation';
import { getRedis } from './config/redis';
import { startSyncWorker, stopSyncWorker } from './queues/emailSync.worker';

// Route imports
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import analyticsRoutes from './routes/analytics.routes';
import peopleRoutes from './routes/people.routes';
import jobsRoutes from './routes/jobs.routes';
import subsRoutes from './routes/subs.routes';
import searchRoutes from './routes/search.routes';

// Validate environment variables at startup
validateEnvironment();

// Initialize Redis connection early
getRedis();

const app = express();

// Required for correct client IPs (and therefore correct rate limiting) when
// running behind a reverse proxy such as Railway, Render or Fly.
app.set('trust proxy', 1);

// ====================
// Middleware
// ====================
app.use(helmet());

// CORS configuration - allow multiple origins in development
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Requests with no Origin header (curl, Postman, server-to-server) are only
    // tolerated outside production. Now that sessions ride on cookies, blanket
    // -allowing them in production would weaken the CSRF story for no benefit.
    if (!origin) return callback(null, config.nodeEnv !== 'production');

    // In development, allow localhost and local network IPs
    if (config.nodeEnv === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/, // Local network
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/, // Local network
      ];
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') return origin === allowed;
        return allowed.test(origin);
      });
      
      if (isAllowed) return callback(null, true);
    } else {
      // In production, only allow configured frontend URL
      if (origin === config.frontendUrl) return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====================
// Rate limiting
// ====================
// Tiered by cost. The general limit protects the API; the strict limits guard
// endpoints that spend money or third-party quota (Gmail API, NVIDIA NIM) and
// were previously wide open at 1000 req/min.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

// Sync and AI endpoints trigger paid work — keep these tight.
const expensiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit reached for this operation. Please wait a moment.' },
});

app.use(generalLimiter);

// ====================
// Health Check
// ====================
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'inboxiq-backend',
    timestamp: new Date().toISOString(),
  });
});

// ====================
// Routes
// ====================
app.use('/auth', authLimiter, authRoutes);
app.use('/emails/sync', expensiveLimiter);
app.use('/emails', emailRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/people', peopleRoutes);
app.use('/jobs', jobsRoutes);
app.use('/subs', subsRoutes);
// Every /search route calls the AI service (embeddings + LLM) — strictly limited.
app.use('/search', expensiveLimiter, searchRoutes);

// ====================
// 404 Handler
// ====================
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ====================
// Error Handler
// ====================
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ====================
// Start Server
// ====================
const server = app.listen(config.port, async () => {
  console.log(`
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: ${config.port}                        ║
║        Env: ${config.nodeEnv}                ║
╚══════════════════════════════════════════╝
  `);

  // Start BullMQ sync worker (wait for Redis connection)
  try {
    // Give Redis 2 seconds to connect, then start worker
    await new Promise(resolve => setTimeout(resolve, 2000));
    startSyncWorker();
  } catch (err) {
    console.warn('[Server] Failed to start sync worker (Redis may not be available):', (err as Error).message);
  }
});

// ====================
// Graceful Shutdown
// ====================
async function shutdown() {
  console.log('[Server] Shutting down gracefully...');

  try {
    await stopSyncWorker();
  } catch (err) {
    console.error('[Server] Error stopping worker:', err);
  }

  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;

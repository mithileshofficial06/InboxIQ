import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { validateEnvironment } from './config/validation';
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

const app = express();

// ====================
// Middleware
// ====================
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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
app.use('/auth', authRoutes);
app.use('/emails', emailRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/people', peopleRoutes);
app.use('/jobs', jobsRoutes);
app.use('/subs', subsRoutes);
app.use('/search', searchRoutes);

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
const server = app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: ${config.port}                        ║
║        Env: ${config.nodeEnv}                ║
╚══════════════════════════════════════════╝
  `);

  // Start BullMQ sync worker
  try {
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

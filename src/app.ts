import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { securityHeaders, apiLimiter, authLimiter } from './middlewares/security.middleware.js';

/**
 * Creates and configures the Express application.
 * 
 * Sets up middleware (CORS, JSON parsing) and routes.
 * Error handler must be the last middleware.
 * Exported for use in server.ts and testing.
 * 
 * @returns Configured Express application
 * 
 * @example
 * ```typescript
 * import { createApp } from './app';
 * const app = createApp();
 * ```
 */
export function createApp(): Express {
  const app = express();

  // Sécurité : en-têtes HTTP en premier
  app.use(securityHeaders);

  // Middleware
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '10kb' })); // refuse les corps trop gros (413)
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Incoming request');
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Limitation du nombre de requêtes (la plus stricte d'abord)
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);

  // API routes
  app.use('/api', routes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

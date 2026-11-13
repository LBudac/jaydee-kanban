import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * En-têtes HTTP de sécurité (X-Content-Type-Options, Content-Security-Policy,
 * Strict-Transport-Security…) et suppression de X-Powered-By.
 */
export const securityHeaders = helmet();

/** Limite générale : 100 requêtes par IP toutes les 15 minutes sur /api. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: () => env.NODE_ENV === 'test', // les tests enchaînent des dizaines de requêtes
});

/** Limite stricte sur /api/auth : 10 tentatives par IP toutes les 15 minutes (anti brute force). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
  skip: () => env.NODE_ENV === 'test',
});
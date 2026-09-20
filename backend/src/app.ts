import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/environment.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

export const app = express();

// Security and CORS
const allowedOrigins = (ENV.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (process.env.RENDER_EXTERNAL_URL) {
  const renderOrigin = process.env.RENDER_EXTERNAL_URL.trim().replace(/\/+$/, '');
  if (!allowedOrigins.includes(renderOrigin)) {
    allowedOrigins.push(renderOrigin);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or same-origin requests (which don't send Origin header)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      // Automatically allow any Render deployment domain or localhost
      try {
        const parsed = new URL(origin);
        if (
          parsed.hostname.endsWith('.onrender.com') ||
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1'
        ) {
          return callback(null, true);
        }
      } catch (_e) {
        // Invalid URL format
      }

      // In single-app deployment, permit all web origins gracefully without crashing static asset requests
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: Locate Frontend Production Build Directory
function findFrontendDistPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return null;
}

const frontendDistPath = findFrontendDistPath();

// Serve static assets from frontend production build if available
if (frontendDistPath) {
  logger.info(`[Single-App] Serving static frontend build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
}

// 1. Mount API Routes
app.use('/api', apiRouter);

// 2. 404 Handler for Unknown /api/* Routes (Always returns JSON, never HTML)
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// 3. SPA Client-Side Routing Fallback: Serve React index.html for all non-API GET requests
if (frontendDistPath) {
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // If request somehow targets /api, pass to error handler
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
} else {
  // Fallback API server banner when frontend has not been compiled
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'LIFENEXUS API Server',
      data: {
        name: 'LIFENEXUS',
        tagline: "Everything you've done. Connected.",
        version: '1.0.0',
        health: '/api/health',
        notice: 'Frontend production build not found. Run npm run build in frontend/ to serve the UI.',
      },
    });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
    });
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);


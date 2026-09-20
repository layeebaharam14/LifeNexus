import express, { Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/environment.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Security and CORS
app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Information Route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LIFENEXUS API Server',
    data: {
      name: 'LIFENEXUS',
      tagline: "Everything you've done. Connected.",
      version: '1.0.0',
      health: '/api/health',
    },
  });
});

// API Routes
app.use('/api', apiRouter);

// 404 Catch-all Handler for Unknown Routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

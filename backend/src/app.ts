import express from 'express';
import cors from 'cors';
import { ENV } from './config/environment.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Security and utility middleware
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mount Master API Router
app.use('/api', apiRouter);

// Root informational endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'LIFENEXUS API Server',
    tagline: "Everything you've done. Connected.",
    version: '1.0.0',
    docs: '/api/health',
  });
});

// Centralized error handling
app.use(errorHandler);

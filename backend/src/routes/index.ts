import { Router, Request, Response } from 'express';
import { authRoutes } from './authRoutes.js';
import { documentRoutes } from './documentRoutes.js';
import { memoryRoutes } from './memoryRoutes.js';
import { searchRoutes } from './searchRoutes.js';
import { insightsRoutes } from './insightsRoutes.js';
import { ApiResponse } from '../types/api.js';

export const apiRouter = Router();

// Health Check Endpoint
apiRouter.get('/health', (_req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: 'LIFENEXUS API is running',
    data: {
      service: 'backend',
      status: 'healthy',
    },
  });
});

// Authentication Routes
apiRouter.use('/auth', authRoutes);

// Document Routes (Phase 3 + Phase 4A + Phase 4B trigger)
apiRouter.use('/documents', documentRoutes);

// Memory Routes (Phase 4B)
apiRouter.use('/memory', memoryRoutes);

// Life Search Routes (Phase 5)
apiRouter.use('/search', searchRoutes);

// Life Insights Routes (Phase 7)
apiRouter.use('/insights', insightsRoutes);


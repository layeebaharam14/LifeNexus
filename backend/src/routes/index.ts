import { Router, Request, Response } from 'express';
import { authRoutes } from './authRoutes.js';
import { documentRoutes } from './documentRoutes.js';
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

// Document Routes (Phase 3)
apiRouter.use('/documents', documentRoutes);


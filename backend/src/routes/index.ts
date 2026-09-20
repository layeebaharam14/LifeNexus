import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { documentRoutes } from './documentRoutes.js';
import { searchRoutes } from './searchRoutes.js';
import { graphRoutes } from './graphRoutes.js';
import { timelineRoutes } from './timelineRoutes.js';
import { insightsRoutes } from './insightsRoutes.js';
import { privacyRoutes } from './privacyRoutes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'LIFENEXUS API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/graph', graphRoutes);
apiRouter.use('/timeline', timelineRoutes);
apiRouter.use('/insights', insightsRoutes);
apiRouter.use('/privacy', privacyRoutes);

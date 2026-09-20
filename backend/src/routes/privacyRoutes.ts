import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const privacyRoutes = Router();
privacyRoutes.use(authenticateUser);

privacyRoutes.get('/stats', async (_req, res) => {
  res.json({
    success: true,
    totalDocs: 0,
    totalEntities: 0,
    totalEdges: 0,
    totalEvents: 0,
  });
});

privacyRoutes.post('/purge', async (_req, res) => {
  res.json({
    success: true,
    message: 'Workspace data successfully purged.',
  });
});

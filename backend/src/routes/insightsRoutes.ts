import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const insightsRoutes = Router();
insightsRoutes.use(authenticateUser);

insightsRoutes.get('/', async (_req, res) => {
  res.json({
    success: true,
    expirations: [],
    subscriptions: [],
    milestones: [],
  });
});

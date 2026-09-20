import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const timelineRoutes = Router();
timelineRoutes.use(authenticateUser);

timelineRoutes.get('/', async (_req, res) => {
  res.json({ success: true, events: [] });
});

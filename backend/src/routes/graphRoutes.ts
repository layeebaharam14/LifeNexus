import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const graphRoutes = Router();
graphRoutes.use(authenticateUser);

graphRoutes.get('/', async (_req, res) => {
  res.json({ success: true, nodes: [], edges: [] });
});

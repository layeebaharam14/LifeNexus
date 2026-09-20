import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const searchRoutes = Router();
searchRoutes.use(authenticateUser);

searchRoutes.post('/', async (req, res) => {
  res.json({
    success: true,
    query: req.body.query,
    answer: 'Life search engine ready.',
    sources: [],
    entities: [],
  });
});

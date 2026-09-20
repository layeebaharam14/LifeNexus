import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { getInsightsController } from '../controllers/insightsController.js';

export const insightsRoutes = Router();

// Protect all insights operations with user authentication
insightsRoutes.use(authenticateUser);

insightsRoutes.get('/', getInsightsController);

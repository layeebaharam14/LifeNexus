import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { searchController } from '../controllers/searchController.js';

export const searchRoutes = Router();

// Protect all search operations with user authentication
searchRoutes.use(authenticateUser);

// Support both GET /api/search?q=... and POST /api/search
searchRoutes.get('/', searchController);
searchRoutes.post('/', searchController);

import { Router } from 'express';
import {
  registerController,
  loginController,
  getMeController,
  logoutController,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const authRoutes = Router();

// Public Authentication Endpoints
authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.post('/logout', logoutController);

// Protected Authentication Endpoints
authRoutes.get('/me', authenticateUser, getMeController);

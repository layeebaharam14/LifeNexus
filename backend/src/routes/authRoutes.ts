import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const authRoutes = Router();

// Skeleton auth endpoints (ready for controllers)
authRoutes.post('/register', async (req, res) => {
  res.json({ success: true, message: 'Auth register endpoint ready' });
});

authRoutes.post('/login', async (req, res) => {
  res.json({ success: true, message: 'Auth login endpoint ready' });
});

authRoutes.get('/me', authenticateUser, async (req, res) => {
  res.json({ success: true, user: req.user });
});

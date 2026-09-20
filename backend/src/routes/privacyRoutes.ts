import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
  getPrivacyStatsController,
  exportWorkspaceController,
  purgeWorkspaceController,
} from '../controllers/privacyController.js';

export const privacyRoutes = Router();

// All privacy endpoints require authentication
privacyRoutes.use(authenticateUser);

// GET /api/privacy/stats — Live storage & knowledge record breakdown
privacyRoutes.get('/stats', getPrivacyStatsController);

// GET /api/privacy/export — User-scoped JSON export of documents & memory engine
privacyRoutes.get('/export', exportWorkspaceController);

// POST /api/privacy/purge — Permanent user workspace data purge
privacyRoutes.post('/purge', purgeWorkspaceController);

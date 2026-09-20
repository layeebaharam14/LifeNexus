/**
 * Memory Routes — Phase 4B
 *
 * All routes require authentication.
 *
 * GET /api/memory/entities         — list user's entities
 * GET /api/memory/relationships    — list user's relationships
 * GET /api/memory/memories         — list user's memory records
 * GET /api/memory/timeline         — list user's timeline events
 * GET /api/memory/stats            — memory summary statistics
 */

import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
  listEntitiesController,
  listRelationshipsController,
  listMemoriesController,
  listTimelineController,
  memoryStatsController,
} from '../controllers/memoryController.js';

export const memoryRoutes = Router();

memoryRoutes.use(authenticateUser);

memoryRoutes.get('/entities', listEntitiesController);
memoryRoutes.get('/relationships', listRelationshipsController);
memoryRoutes.get('/memories', listMemoriesController);
memoryRoutes.get('/timeline', listTimelineController);
memoryRoutes.get('/stats', memoryStatsController);

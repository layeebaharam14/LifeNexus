/**
 * Search Controller — Phase 5
 *
 * Handles HTTP requests for Life Search:
 * - GET /api/search?q=<query>&type=<type>
 * - POST /api/search
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';
import { searchUserMemories } from '../services/search/searchEngineService.js';
import { logger } from '../utils/logger.js';

export async function searchController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    // Support both query param and body for maximum flexibility
    const query = (req.query.q as string) || (req.body?.query as string) || '';
    const filterType = (req.query.type as string) || (req.body?.type as string) || 'all';

    const searchResponse = await searchUserMemories(userId, query, filterType);

    res.status(200).json({
      success: true,
      message: `${searchResponse.total} memories found.`,
      data: searchResponse as any,
    });
  } catch (error: any) {
    logger.error('Life Search query failed:', error?.message);
    res.status(500).json({
      success: false,
      error: error?.message || 'Search execution failed.',
    });
  }
}

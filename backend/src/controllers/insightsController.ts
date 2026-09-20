/**
 * Insights Controller — Phase 7
 *
 * Handles HTTP requests for Life Insights:
 * - GET /api/insights
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';
import { generateUserInsights } from '../services/insights/insightsService.js';
import { logger } from '../utils/logger.js';

export async function getInsightsController(
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

    const insightsData = await generateUserInsights(userId);

    res.status(200).json({
      success: true,
      message: `${insightsData.insights.length} grounded insights surfaced.`,
      data: insightsData as any,
    });
  } catch (error: any) {
    logger.error('Failed to generate insights:', error?.message);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to surface insights.',
    });
  }
}

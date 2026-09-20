/**
 * Privacy Controller — Phase 11
 *
 * User-isolated endpoints for workspace statistics, data export, and purge.
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';
import {
  getWorkspaceStats,
  exportWorkspaceData,
  clearWorkspace,
} from '../services/privacy/privacyService.js';
import { logger } from '../utils/logger.js';

export async function getPrivacyStatsController(
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

    const stats = await getWorkspaceStats(userId);
    res.status(200).json({
      success: true,
      message: 'Workspace privacy statistics retrieved.',
      data: { stats },
    });
  } catch (error: any) {
    logger.error('Failed to get privacy statistics:', error?.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve privacy statistics.',
    });
  }
}

export async function exportWorkspaceController(
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

    const exportData = await exportWorkspaceData(userId);
    res.status(200).json({
      success: true,
      message: 'Workspace data export generated.',
      data: { exportData },
    });
  } catch (error: any) {
    logger.error('Failed to export workspace data:', error?.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to export workspace data.',
    });
  }
}

export async function purgeWorkspaceController(
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

    const result = await clearWorkspace(userId);
    res.status(200).json({
      success: true,
      message: 'Workspace data successfully purged.',
      data: { result },
    });
  } catch (error: any) {
    logger.error('Failed to purge workspace data:', error?.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to purge workspace data.',
    });
  }
}

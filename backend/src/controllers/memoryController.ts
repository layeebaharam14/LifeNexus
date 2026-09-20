/**
 * Memory Controller — Phase 4B
 *
 * Handles HTTP requests for the memory layer:
 * - POST /api/documents/:id/build-memory   → build memory from a document's Phase 4A output
 * - GET  /api/memory/entities              → list user's entities
 * - GET  /api/memory/relationships         → list user's relationships
 * - GET  /api/memory/memories              → list user's memory records
 * - GET  /api/memory/timeline              → list user's timeline events
 * - GET  /api/memory/stats                 → summary stats
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';
import {
  buildMemoryForDocument,
  listUserEntities,
  listUserRelationships,
  listUserMemories,
  listUserTimeline,
  getUserMemoryStats,
} from '../services/memory/memoryEngineService.js';

// POST /api/documents/:id/build-memory
export async function buildMemoryController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Missing user session.' });
      return;
    }

    const result = await buildMemoryForDocument(userId, documentId);

    if (result.status === 'FAILED') {
      res.status(400).json({
        success: false,
        error: result.error || 'Memory construction failed.',
        data: { result },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Memory built from "${result.documentName}" — ${result.entitiesCreated} new entities, ${result.entitiesReused} reused, ${result.relationshipsCreated} relationships, ${result.memoriesCreated} memories, ${result.timelineEventsCreated} timeline events.`,
      data: { result },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Memory construction failed unexpectedly.',
    });
  }
}

// GET /api/memory/entities
export async function listEntitiesController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const entities = await listUserEntities(userId);
    res.status(200).json({
      success: true,
      message: `${entities.length} entities found.`,
      data: { entities },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to list entities.' });
  }
}

// GET /api/memory/relationships
export async function listRelationshipsController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const relationships = await listUserRelationships(userId);
    res.status(200).json({
      success: true,
      message: `${relationships.length} relationships found.`,
      data: { relationships },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list relationships.',
    });
  }
}

// GET /api/memory/memories
export async function listMemoriesController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const memories = await listUserMemories(userId);
    res.status(200).json({
      success: true,
      message: `${memories.length} memory records found.`,
      data: { memories },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to list memories.' });
  }
}

// GET /api/memory/timeline
export async function listTimelineController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const events = await listUserTimeline(userId);
    res.status(200).json({
      success: true,
      message: `${events.length} timeline events found.`,
      data: { events },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve timeline.',
    });
  }
}

// GET /api/memory/stats
export async function memoryStatsController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const stats = await getUserMemoryStats(userId);
    res.status(200).json({
      success: true,
      message: 'Memory statistics retrieved.',
      data: { stats },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve memory statistics.',
    });
  }
}

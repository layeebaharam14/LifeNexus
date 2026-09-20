/**
 * Privacy & Workspace Data Sovereignty Service — Phase 11
 *
 * User-isolated data management:
 * 1. Live knowledge statistics aggregation
 * 2. Complete workspace data purge (documents, files, understandings, memories, graph)
 * 3. Complete JSON data export
 */

import mongoose from 'mongoose';
import { listUserDocuments, clearAllUserDocuments } from '../ingestion/ingestionService.js';
import {
  getUserMemoryStats,
  listUserEntities,
  listUserRelationships,
  listUserMemories,
  listUserTimeline,
  clearAllUserMemory,
} from '../memory/memoryEngineService.js';
import {
  getAllUserDocumentUnderstandings,
  clearAllUserUnderstandings,
} from '../ai/documentUnderstandingService.js';
import { User } from '../../models/User.js';
import { logger } from '../../utils/logger.js';

export interface WorkspacePrivacyStats {
  totalDocs: number;
  totalSizeBytes: number;
  totalEntities: number;
  totalRelationships: number;
  totalMemories: number;
  totalTimelineEvents: number;
  totalKnowledgeRecords: number;
}

export interface WorkspaceExportData {
  exportMetadata: {
    system: string;
    version: string;
    exportedAt: string;
    userId: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
  summary: {
    totalDocuments: number;
    totalEntities: number;
    totalRelationships: number;
    totalMemories: number;
    totalTimelineEvents: number;
  };
  documents: any[];
  documentUnderstandings: any[];
  knowledgeGraph: {
    entities: any[];
    relationships: any[];
  };
  memories: any[];
  timeline: any[];
}

export interface WorkspacePurgeResult {
  documentsPurged: number;
  understandingsPurged: number;
  knowledgeRecordsPurged: number;
  purgedAt: string;
}

/**
 * Returns consolidated, live workspace statistics for the authenticated user
 */
export async function getWorkspaceStats(userId: string): Promise<WorkspacePrivacyStats> {
  const [docs, memoryStats] = await Promise.all([
    listUserDocuments(userId),
    getUserMemoryStats(userId),
  ]);

  const totalDocs = docs.length;
  const totalSizeBytes = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const totalKnowledgeRecords =
    (memoryStats.entities || 0) +
    (memoryStats.relationships || 0) +
    (memoryStats.memories || 0) +
    (memoryStats.timelineEvents || 0);

  return {
    totalDocs,
    totalSizeBytes,
    totalEntities: memoryStats.entities || 0,
    totalRelationships: memoryStats.relationships || 0,
    totalMemories: memoryStats.memories || 0,
    totalTimelineEvents: memoryStats.timelineEvents || 0,
    totalKnowledgeRecords,
  };
}

/**
 * Generates complete JSON export of user's personal memory and document records
 */
export async function exportWorkspaceData(userId: string): Promise<WorkspaceExportData> {
  // Fetch user record (sanitized, zero password exposure)
  let userProfile = { id: userId, name: 'LIFENEXUS User', email: '', createdAt: undefined as string | undefined };
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    const userDoc = await User.findById(userId).lean();
    if (userDoc) {
      userProfile = {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        createdAt: (userDoc as any).createdAt?.toISOString(),
      };
    }
  }

  // Fetch all user records concurrently
  const [docs, understandings, entities, relationships, memories, timeline] = await Promise.all([
    listUserDocuments(userId),
    getAllUserDocumentUnderstandings(userId),
    listUserEntities(userId),
    listUserRelationships(userId),
    listUserMemories(userId),
    listUserTimeline(userId),
  ]);

  return {
    exportMetadata: {
      system: 'LIFENEXUS Personal Memory Engine',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userId,
    },
    user: userProfile,
    summary: {
      totalDocuments: docs.length,
      totalEntities: entities.length,
      totalRelationships: relationships.length,
      totalMemories: memories.length,
      totalTimelineEvents: timeline.length,
    },
    documents: docs.map((d) => ({
      id: d.id,
      originalName: d.originalName,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      documentType: d.documentType,
      processingStatus: d.processingStatus,
      uploadedAt: d.uploadedAt,
    })),
    documentUnderstandings: understandings.map((u) => ({
      id: u.id,
      documentId: u.documentId,
      classification: u.documentClassification,
      summary: u.summary,
      entities: u.entities,
      dates: u.dates,
      amounts: u.amounts,
      events: u.events,
      identifiers: u.identifiers,
      relationships: u.relationships,
      processedAt: u.processedAt,
    })),
    knowledgeGraph: {
      entities,
      relationships,
    },
    memories,
    timeline,
  };
}

/**
 * Permanently and safely purges all data belonging to the authenticated user
 */
export async function clearWorkspace(userId: string): Promise<WorkspacePurgeResult> {
  logger.info(`Initiating complete workspace purge for user: ${userId}`);

  // Purge all physical storage files & document records
  const documentsPurged = await clearAllUserDocuments(userId);

  // Purge all AI document understandings
  const understandingsPurged = await clearAllUserUnderstandings(userId);

  // Purge all memory graph, timeline, and memory records
  const knowledgeRecordsPurged = await clearAllUserMemory(userId);

  logger.info(
    `Workspace purged for user ${userId}: ${documentsPurged} docs, ${understandingsPurged} understandings, ${knowledgeRecordsPurged} knowledge records.`
  );

  return {
    documentsPurged,
    understandingsPurged,
    knowledgeRecordsPurged,
    purgedAt: new Date().toISOString(),
  };
}

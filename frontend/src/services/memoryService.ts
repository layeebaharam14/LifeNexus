/**
 * Memory Service — Phase 4B
 *
 * Frontend API calls for the LIFENEXUS memory layer.
 */

import { apiPost, apiGet } from './api.js';
import { ApiResponse } from '../types/index.js';

export interface BuildMemoryResult {
  documentId: string;
  documentName: string;
  entitiesCreated: number;
  entitiesReused: number;
  relationshipsCreated: number;
  memoriesCreated: number;
  timelineEventsCreated: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  error?: string;
}

export interface EntityRecord {
  id: string;
  name: string;
  type: string;
  aliases: string[];
  attributes: Record<string, any>;
  sourceDocIds: string[];
  createdAt: string;
}

export interface RelationshipRecord {
  id: string;
  from: { id: string; name: string; type: string };
  to: { id: string; name: string; type: string };
  relationType: string;
  confidence: number;
  evidenceSnippet: string;
  sourceDocIds: string[];
  createdAt: string;
}

export interface MemoryRecord {
  id: string;
  type: 'entity' | 'event' | 'relationship' | 'derived';
  title: string;
  date: string | null;
  datePrecision: string;
  confidence: number;
  evidence: string;
  sourceDocIds: string[];
  entities: string[];
  createdAt: string;
}

export interface TimelineEventRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  datePrecision: string;
  category: string;
  entityIds: string[];
  sourceDocIds: string[];
  createdAt: string;
}

export interface MemoryStats {
  memories: number;
  entities: number;
  relationships: number;
  timelineEvents: number;
}

// Build memory for a specific document (POST /api/documents/:id/build-memory)
export async function buildMemoryForDocument(
  documentId: string
): Promise<ApiResponse<{ result: BuildMemoryResult }>> {
  return apiPost<{ result: BuildMemoryResult }>(`/documents/${documentId}/build-memory`, {});
}

// Get all entities for the current user
export async function getEntities(): Promise<ApiResponse<{ entities: EntityRecord[] }>> {
  return apiGet<{ entities: EntityRecord[] }>('/memory/entities');
}

// Get all relationships for the current user
export async function getRelationships(): Promise<ApiResponse<{ relationships: RelationshipRecord[] }>> {
  return apiGet<{ relationships: RelationshipRecord[] }>('/memory/relationships');
}

// Get all memory records for the current user
export async function getMemories(): Promise<ApiResponse<{ memories: MemoryRecord[] }>> {
  return apiGet<{ memories: MemoryRecord[] }>('/memory/memories');
}

// Get all timeline events for the current user
export async function getTimeline(): Promise<ApiResponse<{ events: TimelineEventRecord[] }>> {
  return apiGet<{ events: TimelineEventRecord[] }>('/memory/timeline');
}

// Get memory statistics summary
export async function getMemoryStats(): Promise<ApiResponse<{ stats: MemoryStats }>> {
  return apiGet<{ stats: MemoryStats }>('/memory/stats');
}

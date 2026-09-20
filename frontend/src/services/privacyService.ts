/**
 * Privacy & Workspace Data Sovereignty API Service — Phase 11
 */

import { apiGet, apiPost } from './api.js';
import { ApiResponse } from '../types/index.js';

export interface PrivacyStats {
  totalDocs: number;
  totalSizeBytes: number;
  totalEntities: number;
  totalRelationships: number;
  totalMemories: number;
  totalTimelineEvents: number;
  totalKnowledgeRecords: number;
}

export interface PurgeResult {
  documentsPurged: number;
  understandingsPurged: number;
  knowledgeRecordsPurged: number;
  purgedAt: string;
}

export async function getPrivacyStats(): Promise<ApiResponse<{ stats: PrivacyStats }>> {
  return apiGet<{ stats: PrivacyStats }>('/privacy/stats');
}

export async function exportWorkspace(): Promise<ApiResponse<{ exportData: any }>> {
  return apiGet<{ exportData: any }>('/privacy/export');
}

export async function purgeWorkspace(): Promise<ApiResponse<{ result: PurgeResult }>> {
  return apiPost<{ result: PurgeResult }>('/privacy/purge', {});
}

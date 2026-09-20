/**
 * Insights Service — Phase 7
 *
 * Frontend API client for LIFENEXUS Life Insights.
 */

import { apiGet } from './api.js';
import { ApiResponse } from '../types/index.js';

export interface GroundedInsight {
  id: string;
  type: 'attention' | 'expiration' | 'spending' | 'pattern' | 'milestone';
  priority: 'attention' | 'notable' | 'informational';
  title: string;
  category: string;
  description: string;
  date?: string | null;
  sourceDocumentIds: string[];
  sourceDocuments?: Array<{ id: string; name: string; type: string }>;
  evidence: string[];
  relatedEntityIds?: string[];
  relatedTimelineEventIds?: string[];
  metadata?: Record<string, any>;
}

export interface InsightsResponse {
  insights: GroundedInsight[];
  summary: {
    total: number;
    attention: number;
    notable: number;
    informational: number;
  };
}

/**
 * Fetch grounded life insights for authenticated user
 */
export async function getInsights(): Promise<ApiResponse<InsightsResponse>> {
  return apiGet<InsightsResponse>('/insights');
}

/**
 * Search Service — Phase 5
 *
 * Frontend client for LIFENEXUS Life Search.
 */

import { apiGet } from './api.js';
import { ApiResponse } from '../types/index.js';

export interface SearchResultItem {
  id: string;
  type: 'document' | 'entity' | 'memory' | 'relationship' | 'timeline';
  title: string;
  subtitle: string;
  snippet?: string;
  matchedFields: string[];
  score: number;
  date?: string | null;
  category?: string;
  sourceDocument?: {
    id: string;
    name: string;
    type: string;
  };
  details: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
  filterType: string;
}

/**
 * Execute search query against user's grounded documents & memories
 */
export async function executeSearch(
  query: string,
  filterType: string = 'all'
): Promise<ApiResponse<SearchResponse>> {
  const encodedQuery = encodeURIComponent(query.trim());
  const encodedType = encodeURIComponent(filterType);
  return apiGet<SearchResponse>(`/search?q=${encodedQuery}&type=${encodedType}`);
}

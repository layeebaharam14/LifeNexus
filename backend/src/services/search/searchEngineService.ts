/**
 * Life Search Engine Service — Phase 5
 *
 * Deterministic, grounded search engine across the user's personal memory engine:
 * - Documents & extracted text (Phase 3)
 * - Normalized entities & attributes (Phase 4B)
 * - Memory records & evidence (Phase 4B)
 * - Relationships & confidence (Phase 4B)
 * - Timeline events & chronological records (Phase 4B)
 *
 * User-isolated, grounded in real provenance, no hallucinations or vector dependencies.
 */

import { getAllUserDocumentsWithContent } from '../ingestion/ingestionService.js';
import {
  listUserEntities,
  listUserRelationships,
  listUserMemories,
  listUserTimeline,
} from '../memory/memoryEngineService.js';

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

// Stopwords commonly found in natural-language life questions
const STOPWORDS = new Set([
  'where', 'did', 'i', 'my', 'the', 'what', 'was', 'when', 'show', 'find',
  'related', 'to', 'information', 'about', 'a', 'an', 'in', 'on', 'at',
  'of', 'for', 'is', 'are', 'me', 'how', 'much', 'tell', 'get', 'give',
  'all', 'any', 'from', 'with', 'by', 'do', 'does', 'can', 'you',
]);

/**
 * Normalizes query string and splits into significant keyword tokens
 */
function tokenizeQuery(rawQuery: string): {
  normalized: string;
  tokens: string[];
  significantTokens: string[];
  intents: Set<'location' | 'date' | 'amount' | 'warranty'>;
} {
  const normalized = rawQuery.trim().toLowerCase();
  const rawTokens = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const significantTokens = rawTokens.filter((t) => !STOPWORDS.has(t) && t.length > 1);

  // Fallback to raw tokens if all tokens were filtered out (e.g. "when", "where")
  const tokensToUse = significantTokens.length > 0 ? significantTokens : rawTokens;

  // Detect semantic question intents
  const intents = new Set<'location' | 'date' | 'amount' | 'warranty'>();
  if (
    normalized.includes('where') ||
    normalized.includes('bought from') ||
    normalized.includes('store') ||
    normalized.includes('shop') ||
    normalized.includes('vendor') ||
    normalized.includes('location') ||
    normalized.includes('place')
  ) {
    intents.add('location');
  }

  if (
    normalized.includes('when') ||
    normalized.includes('date') ||
    normalized.includes('year') ||
    normalized.includes('month') ||
    normalized.includes('time') ||
    normalized.includes('day') ||
    normalized.includes('expire') ||
    normalized.includes('expiry')
  ) {
    intents.add('date');
  }

  if (
    normalized.includes('how much') ||
    normalized.includes('amount') ||
    normalized.includes('price') ||
    normalized.includes('cost') ||
    normalized.includes('paid') ||
    normalized.includes('total') ||
    normalized.includes('fee')
  ) {
    intents.add('amount');
  }

  if (
    normalized.includes('warranty') ||
    normalized.includes('guarantee') ||
    normalized.includes('care') ||
    normalized.includes('protection') ||
    normalized.includes('coverage')
  ) {
    intents.add('warranty');
  }

  return {
    normalized,
    tokens: rawTokens,
    significantTokens: tokensToUse,
    intents,
  };
}

/**
 * Extracts a concise surrounding window of text around the first matched token
 */
function extractSnippet(
  fullText: string,
  tokens: string[],
  maxLength: number = 180
): string | undefined {
  if (!fullText) return undefined;
  const lowerText = fullText.toLowerCase();

  let matchIndex = -1;
  let matchedWord = '';

  for (const token of tokens) {
    const idx = lowerText.indexOf(token);
    if (idx !== -1) {
      matchIndex = idx;
      matchedWord = token;
      break;
    }
  }

  if (matchIndex === -1) {
    return fullText.length > maxLength
      ? fullText.substring(0, maxLength).trim() + '...'
      : fullText.trim();
  }

  const start = Math.max(0, matchIndex - Math.floor(maxLength / 3));
  const end = Math.min(fullText.length, start + maxLength);
  let snippet = fullText.substring(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Execute search across the user's grounded data
 */
export async function searchUserMemories(
  userId: string,
  rawQuery: string,
  filterType: string = 'all'
): Promise<SearchResponse> {
  if (!rawQuery || !rawQuery.trim()) {
    return {
      query: '',
      total: 0,
      results: [],
      filterType,
    };
  }

  const { normalized, tokens, significantTokens, intents } = tokenizeQuery(rawQuery);

  // Retrieve user-scoped data across all memory and document layers
  const [docs, entities, relationships, memories, timelineEvents] = await Promise.all([
    getAllUserDocumentsWithContent(userId),
    listUserEntities(userId),
    listUserRelationships(userId),
    listUserMemories(userId),
    listUserTimeline(userId),
  ]);

  // Build document lookup map
  const docLookup = new Map<
    string,
    { id: string; name: string; type: string; uploadedAt: string }
  >();
  for (const doc of docs) {
    docLookup.set(doc.id, {
      id: doc.id,
      name: doc.originalName,
      type: doc.documentType,
      uploadedAt: doc.uploadedAt,
    });
  }

  const candidateResults: SearchResultItem[] = [];

  // ------------------------------------------------------------------ //
  // 1. Search Documents (Phase 3)
  // ------------------------------------------------------------------ //
  if (filterType === 'all' || filterType === 'document') {
    for (const doc of docs) {
      let score = 0;
      const matchedFields: string[] = [];
      const docNameLower = (doc.originalName || '').toLowerCase();
      const docTypeLower = (doc.documentType || '').toLowerCase();
      const textLower = (doc.extractedText || '').toLowerCase();

      // Exact phrase match
      if (normalized.length > 2 && docNameLower.includes(normalized)) {
        score += 120;
        matchedFields.push('filename');
      } else if (normalized.length > 2 && textLower.includes(normalized)) {
        score += 60;
        matchedFields.push('content');
      }

      // Token matches
      let matchedTokensCount = 0;
      for (const token of significantTokens) {
        let tokenMatched = false;
        if (docNameLower.includes(token)) {
          score += 25;
          tokenMatched = true;
          if (!matchedFields.includes('filename')) matchedFields.push('filename');
        }
        if (docTypeLower.includes(token)) {
          score += 20;
          tokenMatched = true;
          if (!matchedFields.includes('documentType')) matchedFields.push('documentType');
        }
        if (textLower.includes(token)) {
          score += 10;
          tokenMatched = true;
          if (!matchedFields.includes('extractedText')) matchedFields.push('extractedText');
        }
        if (tokenMatched) matchedTokensCount++;
      }

      if (matchedTokensCount === significantTokens.length && significantTokens.length > 1) {
        score += 35; // All tokens bonus
      }

      // Intent boosts
      if (intents.has('warranty') && (docTypeLower.includes('warranty') || docNameLower.includes('warranty'))) {
        score += 25;
      }
      if (intents.has('amount') && (docTypeLower.includes('invoice') || docTypeLower.includes('receipt'))) {
        score += 20;
      }

      if (score > 0) {
        const snippet = extractSnippet(doc.extractedText, significantTokens);
        candidateResults.push({
          id: `doc_${doc.id}`,
          type: 'document',
          title: doc.originalName,
          subtitle: `${doc.documentType || 'Document'} • ${new Date(doc.uploadedAt).toLocaleDateString()}`,
          snippet,
          matchedFields,
          score,
          category: doc.documentType,
          sourceDocument: {
            id: doc.id,
            name: doc.originalName,
            type: doc.documentType,
          },
          details: {
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            hasExtractedText: doc.hasExtractedText,
          },
        });
      }
    }
  }

  // ------------------------------------------------------------------ //
  // 2. Search Entities (Phase 4B)
  // ------------------------------------------------------------------ //
  if (filterType === 'all' || filterType === 'entity') {
    for (const entity of entities) {
      let score = 0;
      const matchedFields: string[] = [];
      const nameLower = (entity.name || '').toLowerCase();
      const typeLower = (entity.type || '').toLowerCase();
      const aliasesLower = (entity.aliases || []).map((a) => a.toLowerCase());
      const attribsString = JSON.stringify(entity.attributes || {}).toLowerCase();

      // Exact phrase match
      if (normalized.length > 2 && nameLower.includes(normalized)) {
        score += 130;
        matchedFields.push('name');
      }

      let matchedTokensCount = 0;
      for (const token of significantTokens) {
        let tokenMatched = false;
        if (nameLower.includes(token)) {
          score += 30;
          tokenMatched = true;
          if (!matchedFields.includes('name')) matchedFields.push('name');
        }
        if (aliasesLower.some((a) => a.includes(token))) {
          score += 25;
          tokenMatched = true;
          if (!matchedFields.includes('alias')) matchedFields.push('alias');
        }
        if (typeLower.includes(token)) {
          score += 15;
          tokenMatched = true;
          if (!matchedFields.includes('type')) matchedFields.push('type');
        }
        if (attribsString.includes(token)) {
          score += 20;
          tokenMatched = true;
          if (!matchedFields.includes('attributes')) matchedFields.push('attributes');
        }
        if (tokenMatched) matchedTokensCount++;
      }

      if (matchedTokensCount === significantTokens.length && significantTokens.length > 1) {
        score += 35;
      }

      // Intent boosts
      if (intents.has('location') && (typeLower.includes('location') || typeLower.includes('organization'))) {
        score += 25;
      }
      if (intents.has('amount') && (typeLower.includes('financial') || attribsString.includes('price') || attribsString.includes('amount'))) {
        score += 25;
      }
      if (intents.has('warranty') && (typeLower.includes('asset') || typeLower.includes('certificate'))) {
        score += 20;
      }

      if (score > 0) {
        const firstDocId = entity.sourceDocIds?.[0];
        const sourceDoc = firstDocId ? docLookup.get(firstDocId) : undefined;

        // Build a readable snippet from attributes
        let snippetText: string | undefined;
        if (entity.attributes && Object.keys(entity.attributes).length > 0) {
          snippetText = Object.entries(entity.attributes)
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
            .join(' • ');
        }

        candidateResults.push({
          id: `entity_${entity.id}`,
          type: 'entity',
          title: entity.name,
          subtitle: `${entity.type} Entity${entity.aliases?.length ? ` (${entity.aliases[0]})` : ''}`,
          snippet: snippetText,
          matchedFields,
          score,
          category: entity.type,
          sourceDocument: sourceDoc
            ? { id: sourceDoc.id, name: sourceDoc.name, type: sourceDoc.type }
            : undefined,
          details: {
            type: entity.type,
            aliases: entity.aliases,
            attributes: entity.attributes,
            sourceDocCount: entity.sourceDocIds?.length || 0,
          },
        });
      }
    }
  }

  // ------------------------------------------------------------------ //
  // 3. Search Memory Records (Phase 4B)
  // ------------------------------------------------------------------ //
  if (filterType === 'all' || filterType === 'memory') {
    for (const mem of memories) {
      let score = 0;
      const matchedFields: string[] = [];
      const titleLower = (mem.title || '').toLowerCase();
      const evidenceLower = (mem.evidence || '').toLowerCase();
      const typeLower = (mem.type || '').toLowerCase();

      if (normalized.length > 2 && titleLower.includes(normalized)) {
        score += 120;
        matchedFields.push('title');
      } else if (normalized.length > 2 && evidenceLower.includes(normalized)) {
        score += 65;
        matchedFields.push('evidence');
      }

      let matchedTokensCount = 0;
      for (const token of significantTokens) {
        let tokenMatched = false;
        if (titleLower.includes(token)) {
          score += 28;
          tokenMatched = true;
          if (!matchedFields.includes('title')) matchedFields.push('title');
        }
        if (evidenceLower.includes(token)) {
          score += 14;
          tokenMatched = true;
          if (!matchedFields.includes('evidence')) matchedFields.push('evidence');
        }
        if (typeLower.includes(token)) {
          score += 10;
          tokenMatched = true;
        }
        if (tokenMatched) matchedTokensCount++;
      }

      if (matchedTokensCount === significantTokens.length && significantTokens.length > 1) {
        score += 35;
      }

      // Intent boosts
      if (intents.has('date') && mem.date) {
        score += 25;
      }
      if (intents.has('amount') && (titleLower.includes('purchase') || evidenceLower.includes('₹') || evidenceLower.includes('$'))) {
        score += 25;
      }
      if (intents.has('location') && (evidenceLower.includes('croma') || evidenceLower.includes('at') || evidenceLower.includes('store'))) {
        score += 20;
      }

      if (score > 0) {
        const firstDocId = mem.sourceDocIds?.[0];
        const sourceDoc = firstDocId ? docLookup.get(firstDocId) : undefined;
        const snippet = mem.evidence
          ? extractSnippet(mem.evidence, significantTokens)
          : undefined;

        candidateResults.push({
          id: `mem_${mem.id}`,
          type: 'memory',
          title: mem.title,
          subtitle: `${mem.type.toUpperCase()} Memory${mem.date ? ` • ${mem.date}` : ''}`,
          snippet,
          matchedFields,
          score,
          date: mem.date,
          category: mem.type,
          sourceDocument: sourceDoc
            ? { id: sourceDoc.id, name: sourceDoc.name, type: sourceDoc.type }
            : undefined,
          details: {
            confidence: mem.confidence,
            precision: mem.datePrecision,
            entities: mem.entities,
          },
        });
      }
    }
  }

  // ------------------------------------------------------------------ //
  // 4. Search Relationships (Phase 4B)
  // ------------------------------------------------------------------ //
  if (filterType === 'all' || filterType === 'relationship') {
    for (const rel of relationships) {
      let score = 0;
      const matchedFields: string[] = [];
      const fromName = (rel.from?.name || '').toLowerCase();
      const toName = (rel.to?.name || '').toLowerCase();
      const relType = (rel.relationType || '').toLowerCase();
      const evidenceLower = (rel.evidenceSnippet || '').toLowerCase();

      if (
        (normalized.length > 2 && fromName.includes(normalized)) ||
        toName.includes(normalized)
      ) {
        score += 110;
        matchedFields.push('entities');
      }

      let matchedTokensCount = 0;
      for (const token of significantTokens) {
        let tokenMatched = false;
        if (fromName.includes(token) || toName.includes(token)) {
          score += 26;
          tokenMatched = true;
          if (!matchedFields.includes('entities')) matchedFields.push('entities');
        }
        if (relType.includes(token)) {
          score += 22;
          tokenMatched = true;
          if (!matchedFields.includes('relationType')) matchedFields.push('relationType');
        }
        if (evidenceLower.includes(token)) {
          score += 12;
          tokenMatched = true;
          if (!matchedFields.includes('evidence')) matchedFields.push('evidence');
        }
        if (tokenMatched) matchedTokensCount++;
      }

      if (matchedTokensCount === significantTokens.length && significantTokens.length > 1) {
        score += 30;
      }

      // Intent boosts
      if (intents.has('location') && (relType.includes('purchased') || relType.includes('at') || rel.to?.type === 'Location' || rel.to?.type === 'Organization')) {
        score += 30;
      }

      if (score > 0) {
        const firstDocId = rel.sourceDocIds?.[0];
        const sourceDoc = firstDocId ? docLookup.get(firstDocId) : undefined;
        const snippet = rel.evidenceSnippet
          ? extractSnippet(rel.evidenceSnippet, significantTokens)
          : undefined;

        candidateResults.push({
          id: `rel_${rel.id}`,
          type: 'relationship',
          title: `${rel.from?.name || 'Unknown'} → ${rel.relationType} → ${rel.to?.name || 'Unknown'}`,
          subtitle: `Discovered Connection (${Math.round((rel.confidence ?? 0.8) * 100)}% confidence)`,
          snippet,
          matchedFields,
          score,
          category: rel.relationType,
          sourceDocument: sourceDoc
            ? { id: sourceDoc.id, name: sourceDoc.name, type: sourceDoc.type }
            : undefined,
          details: {
            from: rel.from,
            to: rel.to,
            relationType: rel.relationType,
            confidence: rel.confidence,
          },
        });
      }
    }
  }

  // ------------------------------------------------------------------ //
  // 5. Search Timeline Events (Phase 4B)
  // ------------------------------------------------------------------ //
  if (filterType === 'all' || filterType === 'timeline') {
    for (const event of timelineEvents) {
      let score = 0;
      const matchedFields: string[] = [];
      const titleLower = (event.title || '').toLowerCase();
      const descLower = (event.description || '').toLowerCase();
      const catLower = (event.category || '').toLowerCase();
      const dateLower = (event.date || '').toLowerCase();

      if (normalized.length > 2 && titleLower.includes(normalized)) {
        score += 120;
        matchedFields.push('title');
      }

      let matchedTokensCount = 0;
      for (const token of significantTokens) {
        let tokenMatched = false;
        if (titleLower.includes(token)) {
          score += 26;
          tokenMatched = true;
          if (!matchedFields.includes('title')) matchedFields.push('title');
        }
        if (descLower.includes(token)) {
          score += 12;
          tokenMatched = true;
          if (!matchedFields.includes('description')) matchedFields.push('description');
        }
        if (catLower.includes(token)) {
          score += 15;
          tokenMatched = true;
        }
        if (dateLower.includes(token)) {
          score += 25;
          tokenMatched = true;
          if (!matchedFields.includes('date')) matchedFields.push('date');
        }
        if (tokenMatched) matchedTokensCount++;
      }

      if (matchedTokensCount === significantTokens.length && significantTokens.length > 1) {
        score += 35;
      }

      // Intent boosts
      if (intents.has('date')) {
        score += 30;
      }

      if (score > 0) {
        const firstDocId = event.sourceDocIds?.[0];
        const sourceDoc = firstDocId ? docLookup.get(firstDocId) : undefined;

        candidateResults.push({
          id: `timeline_${event.id}`,
          type: 'timeline',
          title: event.title,
          subtitle: `Timeline Event • ${event.date} (${event.category})`,
          snippet: event.description || undefined,
          matchedFields,
          score,
          date: event.date,
          category: event.category,
          sourceDocument: sourceDoc
            ? { id: sourceDoc.id, name: sourceDoc.name, type: sourceDoc.type }
            : undefined,
          details: {
            date: event.date,
            datePrecision: event.datePrecision,
            category: event.category,
          },
        });
      }
    }
  }

  // Sort descending by relevance score
  candidateResults.sort((a, b) => b.score - a.score);

  // Return top 30 most relevant matches
  const topResults = candidateResults.slice(0, 30);

  return {
    query: rawQuery,
    total: topResults.length,
    results: topResults,
    filterType,
  };
}

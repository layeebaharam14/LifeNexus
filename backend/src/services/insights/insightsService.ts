/**
 * Life Insights Service — Phase 7
 *
 * Generates deterministic, grounded observations and attention items from the user's
 * connected memory store:
 * - Expirations & Upcoming Renewals (from DocumentUnderstanding dates & timeline)
 * - Grounded Spending totals & largest purchases (from DocumentUnderstanding amounts)
 * - Frequency & Graph Patterns (from Entities & Relationships)
 * - Key Milestones (from TimelineEvents)
 *
 * NO Gemini calls. NO fake data. Every insight is traceable to real stored records.
 */

import { listUserDocuments, ProcessedDocumentDTO } from '../ingestion/ingestionService.js';
import { getAllUserDocumentUnderstandings, DocumentUnderstandingDTO } from '../ai/documentUnderstandingService.js';
import {
  listUserEntities,
  listUserRelationships,
  listUserTimeline,
} from '../memory/memoryEngineService.js';

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

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  return `${symbol}${amount.toLocaleString()}`;
}

export async function generateUserInsights(userId: string): Promise<InsightsResponse> {
  // Retrieve user-scoped data across all memory layers
  const [docs, understandings, entities, relationships, timelineEvents] = await Promise.all([
    listUserDocuments(userId),
    getAllUserDocumentUnderstandings(userId),
    listUserEntities(userId),
    listUserRelationships(userId),
    listUserTimeline(userId),
  ]);

  // Build lookup map of documents for grounded provenance
  const docLookup = new Map<string, { id: string; name: string; type: string }>();
  for (const doc of docs) {
    docLookup.set(doc.id, {
      id: doc.id,
      name: doc.originalName,
      type: doc.documentType,
    });
  }

  const insights: GroundedInsight[] = [];
  const now = new Date();
  const currentTimestamp = now.getTime();
  const ATTENTION_WINDOW_DAYS = 90; // Configurable upcoming window: 90 days
  const ATTENTION_WINDOW_MS = ATTENTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  // ------------------------------------------------------------------ //
  // 1. Expirations & Attention Items (from Document Understanding dates)
  // ------------------------------------------------------------------ //
  for (const und of understandings) {
    const docMeta = docLookup.get(und.documentId);
    const docName = docMeta?.name || 'Document';

    for (const dateFact of und.dates || []) {
      if (dateFact.type === 'EXPIRY' || dateFact.type === 'RENEWAL') {
        const dateStr = dateFact.value;
        const parsed = new Date(dateStr);

        if (!isNaN(parsed.getTime())) {
          const diffMs = parsed.getTime() - currentTimestamp;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          const sourceDocs = docMeta ? [docMeta] : [];
          const evidenceSnippet = dateFact.evidence || `Date: ${dateStr}`;

          if (diffDays > 0 && diffMs <= ATTENTION_WINDOW_MS) {
            // Upcoming within attention window
            insights.push({
              id: `insight_exp_upcoming_${und.documentId}_${dateFact.type}`,
              type: 'attention',
              priority: 'attention',
              title: `${dateFact.type === 'RENEWAL' ? 'Upcoming Renewal' : 'Upcoming Expiration'}: ${docName}`,
              category: 'Expiration',
              description: `Deadline is in ${diffDays} day(s) on ${parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}. Action may be required. Based on connected document.`,
              date: dateStr,
              sourceDocumentIds: [und.documentId],
              sourceDocuments: sourceDocs,
              evidence: [evidenceSnippet],
              metadata: { diffDays, status: 'UPCOMING' },
            });
          } else if (diffDays <= 0) {
            // Already past
            insights.push({
              id: `insight_exp_past_${und.documentId}_${dateFact.type}`,
              type: 'expiration',
              priority: 'notable',
              title: `${dateFact.type === 'RENEWAL' ? 'Past Renewal' : 'Expired Coverage'}: ${docName}`,
              category: 'Expiration',
              description: `Validity ended on ${parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} (${Math.abs(diffDays)} day(s) ago). Based on connected document.`,
              date: dateStr,
              sourceDocumentIds: [und.documentId],
              sourceDocuments: sourceDocs,
              evidence: [evidenceSnippet],
              metadata: { diffDays, status: 'EXPIRED' },
            });
          } else {
            // Future active coverage (> 90 days)
            insights.push({
              id: `insight_exp_future_${und.documentId}_${dateFact.type}`,
              type: 'expiration',
              priority: 'informational',
              title: `Active Coverage: ${docName}`,
              category: 'Expiration',
              description: `Valid through ${parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} (${Math.round(diffDays / 30)} months remaining). Based on connected document.`,
              date: dateStr,
              sourceDocumentIds: [und.documentId],
              sourceDocuments: sourceDocs,
              evidence: [evidenceSnippet],
              metadata: { diffDays, status: 'ACTIVE' },
            });
          }
        }
      }
    }
  }

  // ------------------------------------------------------------------ //
  // 2. Spending Insights (from Document Understanding amounts)
  // ------------------------------------------------------------------ //
  const amountsByCurrency = new Map<
    string,
    { total: number; count: number; docIds: Set<string>; largest: { amount: number; docId: string; evidence?: string } }
  >();

  for (const und of understandings) {
    const totalAmounts = (und.amounts || []).filter(
      (a: any) => a.type === 'TOTAL' || ((und.amounts || []).length === 1 && a.value > 0)
    );

    for (const amt of totalAmounts) {
      const curr = (amt.currency || 'INR').toUpperCase();
      const val = typeof amt.value === 'number' ? amt.value : parseFloat(amt.value);

      if (!isNaN(val) && val > 0) {
        if (!amountsByCurrency.has(curr)) {
          amountsByCurrency.set(curr, {
            total: 0,
            count: 0,
            docIds: new Set<string>(),
            largest: { amount: 0, docId: und.documentId, evidence: amt.evidence },
          });
        }
        const currData = amountsByCurrency.get(curr)!;
        currData.total += val;
        currData.count += 1;
        currData.docIds.add(und.documentId);

        if (val > currData.largest.amount) {
          currData.largest = { amount: val, docId: und.documentId, evidence: amt.evidence };
        }
      }
    }
  }

  for (const [curr, data] of amountsByCurrency.entries()) {
    const sourceDocs = Array.from(data.docIds)
      .map((id: string) => docLookup.get(id))
      .filter(Boolean) as Array<{ id: string; name: string; type: string }>;

    // Total recorded spending for currency
    insights.push({
      id: `insight_spend_total_${curr}`,
      type: 'spending',
      priority: 'notable',
      title: `${formatCurrency(data.total, curr)} Recorded Spending`,
      category: 'Financial',
      description: `${formatCurrency(data.total, curr)} recorded across ${data.count} connected purchase document(s). Based on connected documents.`,
      sourceDocumentIds: Array.from(data.docIds),
      sourceDocuments: sourceDocs,
      evidence: [`${data.count} financial transaction(s) verified`],
      metadata: { total: data.total, currency: curr, documentCount: data.count },
    });

    // Largest single recorded purchase (if count >= 1)
    if (data.largest.amount > 0) {
      const largestDoc = docLookup.get(data.largest.docId);
      insights.push({
        id: `insight_spend_largest_${curr}`,
        type: 'spending',
        priority: 'informational',
        title: `Largest Purchase: ${formatCurrency(data.largest.amount, curr)}`,
        category: 'Financial',
        description: `Highest recorded single expenditure is ${formatCurrency(data.largest.amount, curr)} from "${largestDoc?.name || 'Document'}". Based on connected documents.`,
        sourceDocumentIds: [data.largest.docId],
        sourceDocuments: largestDoc ? [largestDoc] : [],
        evidence: data.largest.evidence ? [data.largest.evidence] : [],
        metadata: { amount: data.largest.amount, currency: curr },
      });
    }
  }

  // ------------------------------------------------------------------ //
  // 3. Activity & Pattern Insights (from Entities & Relationships)
  // ------------------------------------------------------------------ //
  const orgAppearances = new Map<string, { entity: any; count: number; docIds: Set<string> }>();

  for (const ent of entities) {
    if (ent.type === 'Organization') {
      const docCount = ent.sourceDocIds?.length || 1;
      orgAppearances.set(ent.id, {
        entity: ent,
        count: docCount,
        docIds: new Set<string>(ent.sourceDocIds || []),
      });
    }
  }

  // Add relationship counts
  for (const rel of relationships) {
    if (rel.from?.type === 'Organization' && orgAppearances.has(rel.from.id)) {
      orgAppearances.get(rel.from.id)!.count += 1;
    }
    if (rel.to?.type === 'Organization' && orgAppearances.has(rel.to.id)) {
      orgAppearances.get(rel.to.id)!.count += 1;
    }
  }

  for (const [_, data] of orgAppearances.entries()) {
    if (data.count >= 2) {
      const sourceDocs = Array.from(data.docIds)
        .map((id: string) => docLookup.get(id))
        .filter(Boolean) as Array<{ id: string; name: string; type: string }>;

      insights.push({
        id: `insight_pattern_org_${data.entity.id}`,
        type: 'pattern',
        priority: 'informational',
        title: `Key Partner: ${data.entity.name}`,
        category: 'Pattern',
        description: `"${data.entity.name}" appears across ${data.count} connected records and relationships in your memory network.`,
        sourceDocumentIds: Array.from(data.docIds),
        sourceDocuments: sourceDocs,
        evidence: [`Organization entity with ${data.count} cross-references`],
        relatedEntityIds: [data.entity.id],
      });
    }
  }

  // Total Entities mapped insight
  if (entities.length >= 3) {
    insights.push({
      id: `insight_pattern_knowledge_graph`,
      type: 'pattern',
      priority: 'informational',
      title: `${entities.length} Entities Connected in Memory`,
      category: 'Pattern',
      description: `Your personal knowledge graph has connected ${entities.length} distinct entities across ${relationships.length} discovered relationships.`,
      sourceDocumentIds: [],
      evidence: [`${entities.length} entities, ${relationships.length} relationships`],
    });
  }

  // ------------------------------------------------------------------ //
  // 4. Milestone Insights (from TimelineEvents)
  // ------------------------------------------------------------------ //
  for (const event of timelineEvents) {
    if (['Career', 'Education', 'Asset'].includes(event.category)) {
      const sourceDocs = (event.sourceDocIds || [])
        .map((id: string) => docLookup.get(id))
        .filter(Boolean) as Array<{ id: string; name: string; type: string }>;

      insights.push({
        id: `insight_milestone_${event.id}`,
        type: 'milestone',
        priority: 'notable',
        title: `Milestone: ${event.title}`,
        category: event.category,
        description: `${event.title} recorded on ${event.date} (${event.category}). Grounded in connected documents.`,
        date: event.date,
        sourceDocumentIds: event.sourceDocIds || [],
        sourceDocuments: sourceDocs,
        evidence: event.description ? [event.description] : [],
        relatedTimelineEventIds: [event.id],
        relatedEntityIds: event.entityIds || [],
      });
    }
  }

  // ------------------------------------------------------------------ //
  // 5. Unmapped Documents Alert (if any document is without memory)
  // ------------------------------------------------------------------ //
  const docsWithUnderstanding = new Set(understandings.map((u: DocumentUnderstandingDTO) => u.documentId));
  const pendingUnderstandDocs = docs.filter((d: ProcessedDocumentDTO) => !docsWithUnderstanding.has(d.id));

  if (pendingUnderstandDocs.length > 0) {
    insights.push({
      id: 'insight_attention_pending_ai',
      type: 'attention',
      priority: 'attention',
      title: `${pendingUnderstandDocs.length} Document(s) Awaiting AI Understanding`,
      category: 'Action Item',
      description: `${pendingUnderstandDocs.length} document(s) have been uploaded but not yet processed with AI Understanding. Run "Understand AI" in Documents to discover connected entities and insights.`,
      sourceDocumentIds: pendingUnderstandDocs.map((d: ProcessedDocumentDTO) => d.id),
      sourceDocuments: pendingUnderstandDocs.map((d: ProcessedDocumentDTO) => ({ id: d.id, name: d.originalName, type: d.documentType })),
      evidence: [`Pending: ${pendingUnderstandDocs.map((d: ProcessedDocumentDTO) => d.originalName).join(', ')}`],
    });
  }

  // Summary counts
  const summary = {
    total: insights.length,
    attention: insights.filter((i) => i.priority === 'attention').length,
    notable: insights.filter((i) => i.priority === 'notable').length,
    informational: insights.filter((i) => i.priority === 'informational').length,
  };

  // Sort insights: 'attention' first, then 'notable', then 'informational'
  const priorityWeight: Record<string, number> = { attention: 3, notable: 2, informational: 1 };
  insights.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  return { insights, summary };
}

/**
 * Memory Engine Service — Phase 4B
 *
 * Transforms DocumentUnderstanding records into:
 *   - Normalized Entity records (with deduplication)
 *   - Relationship records (source-backed, with confidence)
 *   - Memory records (event/entity memories from events + amounts + dates)
 *   - TimelineEvent records (chronological placement)
 *
 * NO new Gemini calls are made — all data comes from Phase 4A output only.
 *
 * This is a fully deterministic pipeline.
 *
 * Supports BOTH:
 *  - MongoDB (when connected)
 *  - In-memory fallback (when MongoDB is not available in development)
 */

import mongoose from 'mongoose';
import { DocumentModel } from '../../models/Document.js';
import { DocumentUnderstandingModel } from '../../models/DocumentUnderstanding.js';
import { logger } from '../../utils/logger.js';

// ------------------------------------------------------------------ //
// DB connection helpers
// ------------------------------------------------------------------ //

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// ------------------------------------------------------------------ //
// In-memory fallback stores (used when MongoDB is not connected)
// ------------------------------------------------------------------ //

interface InMemEntity {
  id: string;
  userId: string;
  name: string;
  type: string;
  aliases: string[];
  attributes: Record<string, any>;
  sourceDocIds: string[];
  createdAt: Date;
}

interface InMemRelationship {
  id: string;
  userId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  confidence: number;
  evidenceSnippet: string;
  sourceDocIds: string[];
  createdAt: Date;
}

interface InMemMemory {
  id: string;
  userId: string;
  type: 'entity' | 'event' | 'relationship' | 'derived';
  title: string;
  date: string | null;
  datePrecision: string;
  entities: string[];
  sourceDocIds: string[];
  evidence: string;
  confidence: number;
  createdAt: Date;
}

interface InMemTimelineEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  datePrecision: string;
  category: string;
  entityIds: string[];
  sourceDocIds: string[];
  createdAt: Date;
}

const inMemEntities: InMemEntity[] = [];
const inMemRelationships: InMemRelationship[] = [];
const inMemMemories: InMemMemory[] = [];
const inMemTimeline: InMemTimelineEvent[] = [];

// Utility
function uid(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function canonicalize(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

// ------------------------------------------------------------------ //
// Public: Build Memory for a specific document
// ------------------------------------------------------------------ //

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

export async function buildMemoryForDocument(
  userId: string,
  documentId: string
): Promise<BuildMemoryResult> {
  const base: BuildMemoryResult = {
    documentId,
    documentName: '',
    entitiesCreated: 0,
    entitiesReused: 0,
    relationshipsCreated: 0,
    memoriesCreated: 0,
    timelineEventsCreated: 0,
    status: 'SUCCESS',
  };

  try {
    if (isDbConnected()) {
      return await buildMemoryWithMongo(userId, documentId, base);
    } else {
      return await buildMemoryInMemory(userId, documentId, base);
    }
  } catch (err: any) {
    logger.error(`Phase 4B: Memory build failed for document ${documentId}:`, err?.message);
    return {
      ...base,
      status: 'FAILED',
      error: err?.message || 'Unknown error during memory construction.',
    };
  }
}

// ------------------------------------------------------------------ //
// MongoDB implementation
// ------------------------------------------------------------------ //

async function buildMemoryWithMongo(
  userId: string,
  documentId: string,
  base: BuildMemoryResult
): Promise<BuildMemoryResult> {
  // Lazy import to avoid initialization errors
  const { EntityModel } = await import('../../models/Entity.js');
  const { RelationshipModel } = await import('../../models/Relationship.js');
  const { MemoryModel } = await import('../../models/Memory.js');
  const { TimelineEventModel } = await import('../../models/TimelineEvent.js');
  const { upsertEntity } = await import('./entityNormalizationService.js');

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new Error('Document not found or access denied.');
  }
  const docRecord = await DocumentModel.findOne({ _id: documentId, userId });
  if (!docRecord) throw new Error('Document not found or you do not have permission.');
  base.documentName = docRecord.originalName || 'Unknown';

  const understanding = await DocumentUnderstandingModel.findOne({ userId, documentId });
  if (!understanding || understanding.status !== 'COMPLETED') {
    throw new Error('Document understanding not found. Please run AI Understanding (Phase 4A) first.');
  }

  const identifierMap: Record<string, string> = {};
  for (const id of understanding.identifiers || []) {
    if (id.value) identifierMap[id.type] = id.value;
  }
  const primaryIdentifier =
    identifierMap['serial_number'] || identifierMap['order_id'] ||
    identifierMap['policy_number'] || identifierMap['invoice_number'] ||
    identifierMap['certificate_id'] || undefined;

  const entityIdMap = new Map<string, mongoose.Types.ObjectId>();
  const userOId = new mongoose.Types.ObjectId(userId);
  const docOId = new mongoose.Types.ObjectId(documentId);

  for (const ef of understanding.entities || []) {
    if (!ef.name?.trim()) continue;
    const attribs: Record<string, any> = {};
    if (primaryIdentifier && ef.type === 'PRODUCT') {
      const idType = Object.keys(identifierMap).find((k) => identifierMap[k] === primaryIdentifier);
      if (idType) attribs[idType] = primaryIdentifier;
    }
    const before = await EntityModel.countDocuments({ userId });
    const entity = await upsertEntity({ userId, name: ef.name, aiType: ef.type || 'OTHER', attributes: attribs, sourceDocId: documentId, identifierValue: primaryIdentifier });
    const after = await EntityModel.countDocuments({ userId });
    entityIdMap.set(ef.name, entity._id);
    after > before ? base.entitiesCreated++ : base.entitiesReused++;
  }

  for (const rf of understanding.relationships || []) {
    if (!rf.from || !rf.to) continue;
    let fromId = entityIdMap.get(rf.from);
    if (!fromId) {
      const e = await upsertEntity({ userId, name: rf.from, aiType: 'OTHER', sourceDocId: documentId });
      fromId = e._id; entityIdMap.set(rf.from, e._id);
    }
    let toId = entityIdMap.get(rf.to);
    if (!toId) {
      const e = await upsertEntity({ userId, name: rf.to, aiType: 'OTHER', sourceDocId: documentId });
      toId = e._id; entityIdMap.set(rf.to, e._id);
    }
    const existing = await RelationshipModel.findOne({ userId: userOId, sourceEntityId: fromId, targetEntityId: toId, relationType: rf.relationship });
    if (!existing) {
      await RelationshipModel.create({ userId: userOId, sourceEntityId: fromId, targetEntityId: toId, relationType: rf.relationship, confidence: rf.confidence ?? 0.8, evidenceSnippet: rf.evidence || '', sourceDocIds: [docOId] });
      base.relationshipsCreated++;
    } else {
      await RelationshipModel.findByIdAndUpdate(existing._id, { $addToSet: { sourceDocIds: docOId }, $set: { confidence: Math.min(1.0, (existing.confidence || 0.8) + 0.05) } });
    }
  }

  for (const evf of understanding.events || []) {
    if (!evf.title?.trim()) continue;
    const existing = await MemoryModel.findOne({ userId: userOId, title: evf.title, sourceDocIds: docOId });
    if (!existing) {
      await MemoryModel.create({ userId: userOId, type: 'event', title: evf.title, date: evf.date || null, datePrecision: normalizeTimePrecision(evf.datePrecision), entities: [...entityIdMap.values()].map((id) => id.toString()), sourceDocIds: [docOId], evidence: evf.evidence || '', confidence: evf.confidence ?? 0.8 });
      base.memoriesCreated++;
    }
  }

  for (const ef of understanding.entities || []) {
    if (!['PRODUCT', 'CERTIFICATE'].includes(ef.type || '')) continue;
    const existing = await MemoryModel.findOne({ userId: userOId, type: 'entity', title: ef.name, sourceDocIds: docOId });
    if (!existing) {
      const eId = entityIdMap.get(ef.name);
      await MemoryModel.create({ userId: userOId, type: 'entity', title: ef.name, entities: eId ? [eId.toString()] : [], sourceDocIds: [docOId], evidence: ef.evidence || '', confidence: ef.confidence ?? 0.8, datePrecision: 'unknown' });
      base.memoriesCreated++;
    }
  }

  const cat = mapDocTypeToCategory(understanding.documentClassification?.type || 'other');
  for (const evf of understanding.events || []) {
    if (!evf.date) continue;
    const prec = normalizeTimePrecision(evf.datePrecision);
    if (prec === 'unknown') continue;
    const existing = await TimelineEventModel.findOne({ userId: userOId, title: evf.title, date: evf.date, sourceDocIds: docOId });
    if (!existing) {
      await TimelineEventModel.create({ userId: userOId, title: evf.title, description: evf.description || '', date: evf.date, datePrecision: prec, category: cat, entityIds: [...entityIdMap.values()], sourceDocIds: [docOId] });
      base.timelineEventsCreated++;
    }
  }

  for (const df of understanding.dates || []) {
    if (!df.value || ['EXPIRY', 'DUE'].includes(df.type)) continue;
    const prec = normalizeTimePrecision(df.precision);
    if (prec === 'unknown') continue;
    const title = buildDateFactTitle(df, understanding.documentClassification?.type || 'other');
    const existing = await TimelineEventModel.findOne({ userId: userOId, title, date: df.value, sourceDocIds: docOId });
    if (!existing) {
      await TimelineEventModel.create({ userId: userOId, title, description: df.evidence || '', date: df.value, datePrecision: prec, category: cat, entityIds: [...entityIdMap.values()], sourceDocIds: [docOId] });
      base.timelineEventsCreated++;
    }
  }

  logger.info(`Phase 4B (MongoDB): Memory built for ${documentId} — entities: ${base.entitiesCreated}+${base.entitiesReused}, rels: ${base.relationshipsCreated}, mems: ${base.memoriesCreated}, timeline: ${base.timelineEventsCreated}`);
  return base;
}

// ------------------------------------------------------------------ //
// In-Memory fallback implementation
// ------------------------------------------------------------------ //

async function buildMemoryInMemory(
  userId: string,
  documentId: string,
  base: BuildMemoryResult
): Promise<BuildMemoryResult> {
  // Load document from ingestion service's in-memory store
  const { getUserDocumentById, getUserDocumentContent } = await import('../ingestion/ingestionService.js');
  const doc = await getUserDocumentById(userId, documentId);
  if (!doc) throw new Error('Document not found or you do not have permission.');
  base.documentName = doc.originalName;

  // Load understanding from documentUnderstandingService in-memory store
  const { getUserDocumentUnderstanding } = await import('../ai/documentUnderstandingService.js');
  const understanding = await getUserDocumentUnderstanding(userId, documentId);
  if (!understanding || understanding.status !== 'COMPLETED') {
    throw new Error('Document understanding not found. Please run AI Understanding (Phase 4A) first.');
  }

  const identifierMap: Record<string, string> = {};
  for (const id of understanding.identifiers || []) {
    if (id.value) identifierMap[id.type] = id.value;
  }
  const primaryIdentifier =
    identifierMap['serial_number'] || identifierMap['order_id'] ||
    identifierMap['policy_number'] || identifierMap['invoice_number'] ||
    identifierMap['certificate_id'] || undefined;

  // Map entityName → entity id
  const entityIdMap = new Map<string, string>();

  // Helper: find or create entity in inMemEntities
  const upsertInMemEntity = (name: string, aiType: string, attribs: Record<string, any> = {}): { entity: InMemEntity; isNew: boolean } => {
    const canonical = canonicalize(name);
    const mapped = mapAiTypeToEntityType(aiType);

    // Check by name match (case-insensitive)
    let existing = inMemEntities.find(
      (e) =>
        e.userId === userId &&
        e.type === mapped &&
        (canonicalize(e.name) === canonical || e.aliases.some((a) => canonicalize(a) === canonical))
    );
    // Check by identifier
    if (!existing && primaryIdentifier) {
      existing = inMemEntities.find(
        (e) => e.userId === userId && Object.values(e.attributes).includes(primaryIdentifier)
      );
    }

    if (existing) {
      if (!existing.aliases.includes(canonical)) existing.aliases.push(canonical);
      existing.sourceDocIds = [...new Set([...existing.sourceDocIds, documentId])];
      Object.assign(existing.attributes, attribs);
      return { entity: existing, isNew: false };
    }

    const entity: InMemEntity = {
      id: uid(),
      userId,
      name,
      type: mapped,
      aliases: [canonical],
      attributes: { ...attribs },
      sourceDocIds: [documentId],
      createdAt: new Date(),
    };
    inMemEntities.push(entity);
    return { entity, isNew: true };
  };

  // Process entities
  for (const ef of understanding.entities || []) {
    if (!ef.name?.trim()) continue;
    const attribs: Record<string, any> = {};
    if (primaryIdentifier && ef.type === 'PRODUCT') {
      const idType = Object.keys(identifierMap).find((k) => identifierMap[k] === primaryIdentifier);
      if (idType) attribs[idType] = primaryIdentifier;
    }
    const { entity, isNew } = upsertInMemEntity(ef.name, ef.type || 'OTHER', attribs);
    entityIdMap.set(ef.name, entity.id);
    isNew ? base.entitiesCreated++ : base.entitiesReused++;
  }

  // Process relationships
  for (const rf of understanding.relationships || []) {
    if (!rf.from || !rf.to) continue;
    let fromId = entityIdMap.get(rf.from);
    if (!fromId) {
      const { entity } = upsertInMemEntity(rf.from, 'OTHER');
      fromId = entity.id; entityIdMap.set(rf.from, entity.id);
    }
    let toId = entityIdMap.get(rf.to);
    if (!toId) {
      const { entity } = upsertInMemEntity(rf.to, 'OTHER');
      toId = entity.id; entityIdMap.set(rf.to, entity.id);
    }
    const existing = inMemRelationships.find(
      (r) => r.userId === userId && r.sourceEntityId === fromId && r.targetEntityId === toId && r.relationType === rf.relationship
    );
    if (!existing) {
      inMemRelationships.push({ id: uid(), userId, sourceEntityId: fromId, targetEntityId: toId, relationType: rf.relationship, confidence: rf.confidence ?? 0.8, evidenceSnippet: rf.evidence || '', sourceDocIds: [documentId], createdAt: new Date() });
      base.relationshipsCreated++;
    } else {
      if (!existing.sourceDocIds.includes(documentId)) existing.sourceDocIds.push(documentId);
      existing.confidence = Math.min(1.0, existing.confidence + 0.05);
    }
  }

  // Process event memories
  for (const evf of understanding.events || []) {
    if (!evf.title?.trim()) continue;
    const dup = inMemMemories.find((m) => m.userId === userId && m.title === evf.title && m.sourceDocIds.includes(documentId));
    if (!dup) {
      inMemMemories.push({ id: uid(), userId, type: 'event', title: evf.title, date: evf.date || null, datePrecision: normalizeTimePrecision(evf.datePrecision), entities: [...entityIdMap.values()], sourceDocIds: [documentId], evidence: evf.evidence || '', confidence: evf.confidence ?? 0.8, createdAt: new Date() });
      base.memoriesCreated++;
    }
  }

  // Entity memories for PRODUCT/CERTIFICATE
  for (const ef of understanding.entities || []) {
    if (!['PRODUCT', 'CERTIFICATE'].includes(ef.type || '')) continue;
    const dup = inMemMemories.find((m) => m.userId === userId && m.type === 'entity' && m.title === ef.name && m.sourceDocIds.includes(documentId));
    if (!dup) {
      const eId = entityIdMap.get(ef.name);
      inMemMemories.push({ id: uid(), userId, type: 'entity', title: ef.name, date: null, datePrecision: 'unknown', entities: eId ? [eId] : [], sourceDocIds: [documentId], evidence: ef.evidence || '', confidence: ef.confidence ?? 0.8, createdAt: new Date() });
      base.memoriesCreated++;
    }
  }

  // Timeline events
  const cat = mapDocTypeToCategory(understanding.documentClassification?.type || 'other');
  for (const evf of understanding.events || []) {
    if (!evf.date) continue;
    const prec = normalizeTimePrecision(evf.datePrecision);
    if (prec === 'unknown') continue;
    const dup = inMemTimeline.find((te) => te.userId === userId && te.title === evf.title && te.date === evf.date && te.sourceDocIds.includes(documentId));
    if (!dup) {
      inMemTimeline.push({ id: uid(), userId, title: evf.title, description: evf.description || '', date: evf.date, datePrecision: prec, category: cat, entityIds: [...entityIdMap.values()], sourceDocIds: [documentId], createdAt: new Date() });
      base.timelineEventsCreated++;
    }
  }

  for (const df of understanding.dates || []) {
    if (!df.value || ['EXPIRY', 'DUE'].includes(df.type)) continue;
    const prec = normalizeTimePrecision(df.precision);
    if (prec === 'unknown') continue;
    const title = buildDateFactTitle(df, understanding.documentClassification?.type || 'other');
    const dup = inMemTimeline.find((te) => te.userId === userId && te.title === title && te.date === df.value && te.sourceDocIds.includes(documentId));
    if (!dup) {
      inMemTimeline.push({ id: uid(), userId, title, description: df.evidence || '', date: df.value, datePrecision: prec, category: cat, entityIds: [...entityIdMap.values()], sourceDocIds: [documentId], createdAt: new Date() });
      base.timelineEventsCreated++;
    }
  }

  logger.info(`Phase 4B (InMemory): Memory built for ${documentId} — entities: ${base.entitiesCreated}+${base.entitiesReused}, rels: ${base.relationshipsCreated}, mems: ${base.memoriesCreated}, timeline: ${base.timelineEventsCreated}`);
  return base;
}

// ------------------------------------------------------------------ //
// Public: List memory records for user
// ------------------------------------------------------------------ //

export async function listUserMemories(userId: string) {
  if (isDbConnected()) {
    const { MemoryModel } = await import('../../models/Memory.js');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const memories = await MemoryModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean();
    return memories.map((m) => ({ id: m._id.toString(), type: m.type, title: m.title, date: m.date || null, datePrecision: m.datePrecision || 'unknown', confidence: m.confidence, evidence: m.evidence, sourceDocIds: (m.sourceDocIds || []).map((id: any) => id.toString()), entities: m.entities || [], createdAt: (m as any).createdAt }));
  }
  return inMemMemories.filter((m) => m.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((m) => ({ id: m.id, type: m.type, title: m.title, date: m.date, datePrecision: m.datePrecision, confidence: m.confidence, evidence: m.evidence, sourceDocIds: m.sourceDocIds, entities: m.entities, createdAt: m.createdAt }));
}

// ------------------------------------------------------------------ //
// Public: List entities for user
// ------------------------------------------------------------------ //

export async function listUserEntities(userId: string) {
  if (isDbConnected()) {
    const { EntityModel } = await import('../../models/Entity.js');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const entities = await EntityModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean();
    return entities.map((e) => ({ id: e._id.toString(), name: e.name, type: e.type, aliases: e.aliases || [], attributes: e.attributes ? Object.fromEntries(e.attributes as any) : {}, sourceDocIds: (e.sourceDocIds || []).map((id: any) => id.toString()), createdAt: (e as any).createdAt }));
  }
  return inMemEntities.filter((e) => e.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((e) => ({ id: e.id, name: e.name, type: e.type, aliases: e.aliases, attributes: e.attributes, sourceDocIds: e.sourceDocIds, createdAt: e.createdAt }));
}

// ------------------------------------------------------------------ //
// Public: List relationships for user
// ------------------------------------------------------------------ //

export async function listUserRelationships(userId: string) {
  if (isDbConnected()) {
    const { RelationshipModel } = await import('../../models/Relationship.js');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const rels = await RelationshipModel.find({ userId: userObjectId }).populate('sourceEntityId', 'name type').populate('targetEntityId', 'name type').sort({ createdAt: -1 }).lean();
    return rels.map((r: any) => ({ id: r._id.toString(), from: r.sourceEntityId ? { id: r.sourceEntityId._id?.toString(), name: r.sourceEntityId.name, type: r.sourceEntityId.type } : { id: r.sourceEntityId?.toString(), name: 'Unknown', type: 'Unknown' }, to: r.targetEntityId ? { id: r.targetEntityId._id?.toString(), name: r.targetEntityId.name, type: r.targetEntityId.type } : { id: r.targetEntityId?.toString(), name: 'Unknown', type: 'Unknown' }, relationType: r.relationType, confidence: r.confidence, evidenceSnippet: r.evidenceSnippet || '', sourceDocIds: (r.sourceDocIds || []).map((id: any) => id.toString()), createdAt: r.createdAt }));
  }
  const entities = inMemEntities.reduce((acc, e) => { acc[e.id] = e; return acc; }, {} as Record<string, InMemEntity>);
  return inMemRelationships.filter((r) => r.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((r) => ({ id: r.id, from: entities[r.sourceEntityId] ? { id: r.sourceEntityId, name: entities[r.sourceEntityId].name, type: entities[r.sourceEntityId].type } : { id: r.sourceEntityId, name: 'Unknown', type: 'Unknown' }, to: entities[r.targetEntityId] ? { id: r.targetEntityId, name: entities[r.targetEntityId].name, type: entities[r.targetEntityId].type } : { id: r.targetEntityId, name: 'Unknown', type: 'Unknown' }, relationType: r.relationType, confidence: r.confidence, evidenceSnippet: r.evidenceSnippet, sourceDocIds: r.sourceDocIds, createdAt: r.createdAt }));
}

// ------------------------------------------------------------------ //
// Public: List timeline events for user
// ------------------------------------------------------------------ //

export async function listUserTimeline(userId: string) {
  if (isDbConnected()) {
    const { TimelineEventModel } = await import('../../models/TimelineEvent.js');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const events = await TimelineEventModel.find({ userId: userObjectId }).sort({ date: -1 }).lean();
    return events.map((te) => ({ id: te._id.toString(), title: te.title, description: te.description || '', date: te.date, datePrecision: te.datePrecision, category: te.category, entityIds: (te.entityIds || []).map((id: any) => id.toString()), sourceDocIds: (te.sourceDocIds || []).map((id: any) => id.toString()), createdAt: (te as any).createdAt }));
  }
  return inMemTimeline.filter((te) => te.userId === userId).sort((a, b) => (b.date > a.date ? 1 : -1)).map((te) => ({ id: te.id, title: te.title, description: te.description, date: te.date, datePrecision: te.datePrecision, category: te.category, entityIds: te.entityIds, sourceDocIds: te.sourceDocIds, createdAt: te.createdAt }));
}

// ------------------------------------------------------------------ //
// Public: Memory summary stats
// ------------------------------------------------------------------ //

export async function getUserMemoryStats(userId: string) {
  if (isDbConnected()) {
    const { EntityModel } = await import('../../models/Entity.js');
    const { RelationshipModel } = await import('../../models/Relationship.js');
    const { MemoryModel } = await import('../../models/Memory.js');
    const { TimelineEventModel } = await import('../../models/TimelineEvent.js');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [memCount, entityCount, relCount, timelineCount] = await Promise.all([
      MemoryModel.countDocuments({ userId: userObjectId }),
      EntityModel.countDocuments({ userId: userObjectId }),
      RelationshipModel.countDocuments({ userId: userObjectId }),
      TimelineEventModel.countDocuments({ userId: userObjectId }),
    ]);
    return { memories: memCount, entities: entityCount, relationships: relCount, timelineEvents: timelineCount };
  }
  return {
    memories: inMemMemories.filter((m) => m.userId === userId).length,
    entities: inMemEntities.filter((e) => e.userId === userId).length,
    relationships: inMemRelationships.filter((r) => r.userId === userId).length,
    timelineEvents: inMemTimeline.filter((te) => te.userId === userId).length,
  };
}

// ------------------------------------------------------------------ //
// Helpers
// ------------------------------------------------------------------ //

function normalizeTimePrecision(aiPrecision?: string): 'exact' | 'month' | 'year' | 'range' | 'unknown' {
  switch ((aiPrecision || '').toUpperCase()) {
    case 'DAY': return 'exact';
    case 'MONTH': return 'month';
    case 'YEAR': return 'year';
    default: return 'unknown';
  }
}

function mapDocTypeToCategory(docType: string): 'Education' | 'Career' | 'Financial' | 'Asset' | 'Travel' | 'Administrative' | 'Personal' {
  switch (docType) {
    case 'invoice': case 'receipt': case 'subscription': case 'renewal': return 'Financial';
    case 'warranty': case 'repair': return 'Asset';
    case 'certificate': case 'resume': return 'Education';
    case 'travel': return 'Travel';
    case 'insurance': case 'contract': return 'Administrative';
    default: return 'Personal';
  }
}

function buildDateFactTitle(dateFact: any, docType: string): string {
  const typeLabel: Record<string, string> = { PURCHASE: 'Purchase date', START: 'Start date', END: 'End date', EVENT: 'Event date', ISSUE: 'Issue date', RENEWAL: 'Renewal date', OTHER: 'Date recorded' };
  return `${typeLabel[dateFact.type] || 'Date recorded'} — ${docType === 'other' ? 'document' : docType}`;
}

function mapAiTypeToEntityType(aiType: string): string {
  const map: Record<string, string> = { PERSON: 'Person', ORGANIZATION: 'Organization', PRODUCT: 'Asset', PLACE: 'Location', SERVICE: 'Financial', ACCOUNT: 'Financial', CERTIFICATE: 'Certificate', OTHER: 'Document' };
  return map[aiType?.toUpperCase()] ?? 'Document';
}

// ------------------------------------------------------------------ //
// Public: Unlink a specific document from memory (Cascade Integrity)
// ------------------------------------------------------------------ //

export async function unlinkDocumentFromMemory(userId: string, documentId: string): Promise<void> {
  if (isDbConnected()) {
    const { EntityModel } = await import('../../models/Entity.js');
    const { RelationshipModel } = await import('../../models/Relationship.js');
    const { MemoryModel } = await import('../../models/Memory.js');
    const { TimelineEventModel } = await import('../../models/TimelineEvent.js');

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const docObjectId = mongoose.Types.ObjectId.isValid(documentId)
      ? new mongoose.Types.ObjectId(documentId)
      : null;

    if (!docObjectId) return;

    // 1. Pull documentId from Entity sourceDocIds
    await EntityModel.updateMany(
      { userId: userObjectId, sourceDocIds: docObjectId },
      { $pull: { sourceDocIds: docObjectId } }
    );

    // 2. Identify and delete orphaned entities that have no remaining source documents
    const orphanedEntities = await EntityModel.find({
      userId: userObjectId,
      sourceDocIds: { $size: 0 },
    }).lean();

    const orphanedEntityIds = orphanedEntities.map((e) => e._id);
    if (orphanedEntityIds.length > 0) {
      await EntityModel.deleteMany({ _id: { $in: orphanedEntityIds } });
    }

    // 3. Pull documentId from Relationship sourceDocIds
    await RelationshipModel.updateMany(
      { userId: userObjectId, sourceDocIds: docObjectId },
      { $pull: { sourceDocIds: docObjectId } }
    );

    // 4. Delete relationships that have no source docs OR link to deleted entities
    const relOrFilter: any[] = [{ sourceDocIds: { $size: 0 } }];
    if (orphanedEntityIds.length > 0) {
      relOrFilter.push(
        { sourceEntityId: { $in: orphanedEntityIds } },
        { targetEntityId: { $in: orphanedEntityIds } }
      );
    }
    await RelationshipModel.deleteMany({
      userId: userObjectId,
      $or: relOrFilter,
    });

    // 5. Pull documentId from Memory records & remove orphaned memories
    await MemoryModel.updateMany(
      { userId: userObjectId, sourceDocIds: docObjectId },
      { $pull: { sourceDocIds: docObjectId } }
    );
    await MemoryModel.deleteMany({
      userId: userObjectId,
      sourceDocIds: { $size: 0 },
    });

    // 6. Pull documentId from TimelineEvent records & remove orphaned events
    await TimelineEventModel.updateMany(
      { userId: userObjectId, sourceDocIds: docObjectId },
      { $pull: { sourceDocIds: docObjectId } }
    );
    await TimelineEventModel.deleteMany({
      userId: userObjectId,
      sourceDocIds: { $size: 0 },
    });

    logger.info(`Unlinked document ${documentId} from memory for user ${userId}.`);
  } else {
    // In-memory fallback cascade
    const deletedEntityIds = new Set<string>();

    for (let i = inMemEntities.length - 1; i >= 0; i--) {
      const e = inMemEntities[i];
      if (e.userId === userId) {
        e.sourceDocIds = e.sourceDocIds.filter((id) => id !== documentId);
        if (e.sourceDocIds.length === 0) {
          deletedEntityIds.add(e.id);
          inMemEntities.splice(i, 1);
        }
      }
    }

    for (let i = inMemRelationships.length - 1; i >= 0; i--) {
      const r = inMemRelationships[i];
      if (r.userId === userId) {
        r.sourceDocIds = r.sourceDocIds.filter((id) => id !== documentId);
        if (
          r.sourceDocIds.length === 0 ||
          deletedEntityIds.has(r.sourceEntityId) ||
          deletedEntityIds.has(r.targetEntityId)
        ) {
          inMemRelationships.splice(i, 1);
        }
      }
    }

    for (let i = inMemMemories.length - 1; i >= 0; i--) {
      const m = inMemMemories[i];
      if (m.userId === userId) {
        m.sourceDocIds = m.sourceDocIds.filter((id) => id !== documentId);
        if (m.sourceDocIds.length === 0) {
          inMemMemories.splice(i, 1);
        }
      }
    }

    for (let i = inMemTimeline.length - 1; i >= 0; i--) {
      const te = inMemTimeline[i];
      if (te.userId === userId) {
        te.sourceDocIds = te.sourceDocIds.filter((id) => id !== documentId);
        if (te.sourceDocIds.length === 0) {
          inMemTimeline.splice(i, 1);
        }
      }
    }
  }
}

// ------------------------------------------------------------------ //
// Public: Clear all memory records for a user (Workspace Purge)
// ------------------------------------------------------------------ //

export async function clearAllUserMemory(userId: string): Promise<number> {
  let count = 0;
  if (isDbConnected()) {
    const { EntityModel } = await import('../../models/Entity.js');
    const { RelationshipModel } = await import('../../models/Relationship.js');
    const { MemoryModel } = await import('../../models/Memory.js');
    const { TimelineEventModel } = await import('../../models/TimelineEvent.js');

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [eRes, rRes, mRes, tRes] = await Promise.all([
      EntityModel.deleteMany({ userId: userObjectId }),
      RelationshipModel.deleteMany({ userId: userObjectId }),
      MemoryModel.deleteMany({ userId: userObjectId }),
      TimelineEventModel.deleteMany({ userId: userObjectId }),
    ]);

    count =
      (eRes.deletedCount || 0) +
      (rRes.deletedCount || 0) +
      (mRes.deletedCount || 0) +
      (tRes.deletedCount || 0);
  } else {
    for (let i = inMemEntities.length - 1; i >= 0; i--) {
      if (inMemEntities[i].userId === userId) {
        inMemEntities.splice(i, 1);
        count++;
      }
    }
    for (let i = inMemRelationships.length - 1; i >= 0; i--) {
      if (inMemRelationships[i].userId === userId) {
        inMemRelationships.splice(i, 1);
        count++;
      }
    }
    for (let i = inMemMemories.length - 1; i >= 0; i--) {
      if (inMemMemories[i].userId === userId) {
        inMemMemories.splice(i, 1);
        count++;
      }
    }
    for (let i = inMemTimeline.length - 1; i >= 0; i--) {
      if (inMemTimeline[i].userId === userId) {
        inMemTimeline.splice(i, 1);
        count++;
      }
    }
  }
  return count;
}


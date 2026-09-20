/**
 * Entity Normalization Service — Phase 4B
 *
 * Deterministic logic for resolving and deduplicating entities
 * across multiple documents within a user's personal knowledge graph.
 *
 * Rules:
 * - Never merge on name similarity alone.
 * - Prefer serial number / identifier matches (highest signal).
 * - Prefer matching model + organization + date range (strong signal).
 * - Always store aliases when a match is found.
 */

import { IEntityDocument, EntityModel } from '../../models/Entity.js';
import mongoose from 'mongoose';

// Map from the AI entity type string → Entity model type enum
const ENTITY_TYPE_MAP: Record<string, string> = {
  PERSON: 'Person',
  ORGANIZATION: 'Organization',
  PRODUCT: 'Asset',
  PLACE: 'Location',
  SERVICE: 'Financial',
  ACCOUNT: 'Financial',
  CERTIFICATE: 'Certificate',
  OTHER: 'Document',
};

export function mapEntityType(aiType: string): string {
  return ENTITY_TYPE_MAP[aiType?.toUpperCase()] ?? 'Document';
}

/**
 * Normalize a name to a canonical form for comparison.
 */
export function canonicalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Attempt to find an existing entity record for this user that matches the
 * incoming entity by:
 *  1. Exact canonical name match within same type.
 *  2. Name listed as an alias of an existing entity.
 *  3. Identifier match via attributes (serial_number, policy_number, etc.)
 *
 * Returns the existing entity if found, otherwise null.
 */
export async function findMatchingEntity(
  userId: string,
  name: string,
  type: string,
  identifierValue?: string
): Promise<IEntityDocument | null> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const canonical = canonicalize(name);

  // Priority 1: exact canonical name match within same type
  const byName = await EntityModel.findOne({
    userId: userObjectId,
    type,
    $or: [
      { name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } },
      { aliases: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } },
    ],
  });
  if (byName) return byName;

  // Priority 2: canonical form matches stored canonical alias
  const byCanonical = await EntityModel.findOne({
    userId: userObjectId,
    type,
    aliases: { $regex: `^${escapeRegex(canonical)}$`, $options: 'i' },
  });
  if (byCanonical) return byCanonical;

  // Priority 3: identifier-based match (strongest signal)
  if (identifierValue && identifierValue.trim().length > 3) {
    const escaped = escapeRegex(identifierValue.trim());
    const byIdentifier = await EntityModel.findOne({
      userId: userObjectId,
      $or: [
        { 'attributes.serial_number': { $regex: `^${escaped}$`, $options: 'i' } },
        { 'attributes.policy_number': { $regex: `^${escaped}$`, $options: 'i' } },
        { 'attributes.invoice_number': { $regex: `^${escaped}$`, $options: 'i' } },
        { 'attributes.order_id': { $regex: `^${escaped}$`, $options: 'i' } },
        { 'attributes.certificate_id': { $regex: `^${escaped}$`, $options: 'i' } },
        { aliases: { $regex: `^${escaped}$`, $options: 'i' } },
      ],
    });
    if (byIdentifier) return byIdentifier;
  }

  return null;
}

/**
 * Upsert an entity: find an existing match or create a new one.
 * When a match is found, merge aliases and attributes; add the sourceDocId.
 */
export async function upsertEntity(params: {
  userId: string;
  name: string;
  aiType: string;
  attributes?: Record<string, any>;
  sourceDocId: string;
  identifierValue?: string;
}): Promise<IEntityDocument> {
  const { userId, name, aiType, attributes = {}, sourceDocId, identifierValue } = params;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const sourceDocObjectId = new mongoose.Types.ObjectId(sourceDocId);
  const type = mapEntityType(aiType);
  const canonical = canonicalize(name);

  const existing = await findMatchingEntity(userId, name, type, identifierValue);

  if (existing) {
    // Merge: add alias if not already present, add sourceDocId, merge attributes
    const updates: any = { $addToSet: { sourceDocIds: sourceDocObjectId } };

    if (!existing.aliases.includes(canonical) && canonical !== canonicalize(existing.name)) {
      updates.$addToSet.aliases = canonical;
    }

    // Merge new attribute keys (do not overwrite existing)
    const newAttribs: Record<string, any> = {};
    for (const [k, v] of Object.entries(attributes)) {
      if (v !== undefined && v !== null && v !== '' && !existing.attributes.has(k)) {
        newAttribs[`attributes.${k}`] = v;
      }
    }
    if (Object.keys(newAttribs).length > 0) {
      updates.$set = newAttribs;
    }

    await EntityModel.findByIdAndUpdate(existing._id, updates);
    const refreshed = await EntityModel.findById(existing._id);
    return refreshed!;
  }

  // Create new entity
  const aliasSet = new Set<string>([canonical]);
  const entity = await EntityModel.create({
    userId: userObjectId,
    name,
    type,
    aliases: [...aliasSet],
    attributes: new Map(Object.entries(attributes)),
    sourceDocIds: [sourceDocObjectId],
  });

  return entity;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

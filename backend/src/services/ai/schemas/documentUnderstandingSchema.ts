import { z } from 'zod';

export const DocumentClassificationSchema = z.object({
  type: z.enum([
    'invoice',
    'receipt',
    'warranty',
    'repair',
    'certificate',
    'travel',
    'subscription',
    'renewal',
    'insurance',
    'contract',
    'note',
    'resume',
    'medical',
    'other',
  ]).default('other'),
  confidence: z.number().min(0).max(1).default(0.5),
});

export const EntityFactSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'PERSON',
    'ORGANIZATION',
    'PRODUCT',
    'PLACE',
    'SERVICE',
    'ACCOUNT',
    'CERTIFICATE',
    'OTHER',
  ]).default('OTHER'),
  normalizedName: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.8),
  evidence: z.string().default(''),
});

export const DateFactSchema = z.object({
  value: z.string().min(1),
  type: z.enum([
    'PURCHASE',
    'EXPIRY',
    'START',
    'END',
    'EVENT',
    'ISSUE',
    'RENEWAL',
    'DUE',
    'OTHER',
  ]).default('OTHER'),
  precision: z.enum(['DAY', 'MONTH', 'YEAR', 'UNKNOWN']).default('DAY'),
  confidence: z.number().min(0).max(1).default(0.8),
  evidence: z.string().default(''),
});

export const AmountFactSchema = z.object({
  value: z.number(),
  currency: z.string().default('INR'),
  type: z.enum(['PURCHASE', 'PAYMENT', 'PREMIUM', 'REFUND', 'TAX', 'OTHER']).default('PAYMENT'),
  confidence: z.number().min(0).max(1).default(0.8),
  evidence: z.string().default(''),
});

export const EventFactSchema = z.object({
  title: z.string().min(1),
  date: z.string().nullable().optional(),
  datePrecision: z.enum(['DAY', 'MONTH', 'YEAR', 'UNKNOWN']).default('UNKNOWN'),
  description: z.string().default(''),
  confidence: z.number().min(0).max(1).default(0.8),
  evidence: z.string().default(''),
});

export const IdentifierFactSchema = z.object({
  type: z.enum([
    'invoice_number',
    'policy_number',
    'booking_reference',
    'certificate_id',
    'order_id',
    'serial_number',
    'account_number',
    'tax_id',
    'other',
  ]).default('other'),
  value: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.8),
  evidence: z.string().default(''),
});

export const RelationshipFactSchema = z.object({
  from: z.string().min(1),
  relationship: z.enum([
    'purchased_from',
    'covered_by',
    'belongs_to',
    'occurred_at',
    'issued_by',
    'repaired_by',
    'related_to',
    'signed_by',
    'other',
  ]).default('related_to'),
  to: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.8),
  evidence: z.string().default(''),
});

export const DocumentUnderstandingSchema = z.object({
  documentClassification: DocumentClassificationSchema,
  summary: z.string().default(''),
  entities: z.array(EntityFactSchema).default([]),
  dates: z.array(DateFactSchema).default([]),
  amounts: z.array(AmountFactSchema).default([]),
  events: z.array(EventFactSchema).default([]),
  identifiers: z.array(IdentifierFactSchema).default([]),
  relationships: z.array(RelationshipFactSchema).default([]),
});

export type DocumentClassification = z.infer<typeof DocumentClassificationSchema>;
export type EntityFact = z.infer<typeof EntityFactSchema>;
export type DateFact = z.infer<typeof DateFactSchema>;
export type AmountFact = z.infer<typeof AmountFactSchema>;
export type EventFact = z.infer<typeof EventFactSchema>;
export type IdentifierFact = z.infer<typeof IdentifierFactSchema>;
export type RelationshipFact = z.infer<typeof RelationshipFactSchema>;
export type DocumentUnderstandingResult = z.infer<typeof DocumentUnderstandingSchema>;

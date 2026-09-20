import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import {
  DocumentClassification,
  EntityFact,
  DateFact,
  AmountFact,
  EventFact,
  IdentifierFact,
  RelationshipFact,
} from '../services/ai/schemas/documentUnderstandingSchema.js';

export interface IDocumentUnderstandingRecord extends MongooseDocument {
  userId: string;
  documentId: string;
  documentClassification: DocumentClassification;
  summary: string;
  entities: EntityFact[];
  dates: DateFact[];
  amounts: AmountFact[];
  events: EventFact[];
  identifiers: IdentifierFact[];
  relationships: RelationshipFact[];
  aiModel: string;
  promptVersion: string;
  status: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string | null;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentUnderstandingSchema = new Schema<IDocumentUnderstandingRecord>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    documentClassification: {
      type: Object,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    entities: {
      type: [Object],
      default: [],
    },
    dates: {
      type: [Object],
      default: [],
    },
    amounts: {
      type: [Object],
      default: [],
    },
    events: {
      type: [Object],
      default: [],
    },
    identifiers: {
      type: [Object],
      default: [],
    },
    relationships: {
      type: [Object],
      default: [],
    },
    aiModel: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    promptVersion: {
      type: String,
      default: 'v1.0.0',
    },

    status: {
      type: String,
      enum: ['NOT_STARTED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'NOT_STARTED',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user + document query
DocumentUnderstandingSchema.index({ userId: 1, documentId: 1 }, { unique: true });

export const DocumentUnderstandingModel = mongoose.model<IDocumentUnderstandingRecord>(
  'DocumentUnderstanding',
  DocumentUnderstandingSchema
);

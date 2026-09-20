import mongoose from 'mongoose';
import { DocumentModel } from '../../models/Document.js';
import {
  DocumentUnderstandingModel,
  IDocumentUnderstandingRecord,
} from '../../models/DocumentUnderstanding.js';
import { geminiService } from './geminiService.js';
import {
  DocumentUnderstandingSchema,
  DocumentUnderstandingResult,
} from './schemas/documentUnderstandingSchema.js';
import { logger } from '../../utils/logger.js';
import { ENV } from '../../config/environment.js';

export interface DocumentUnderstandingDTO {
  id: string;
  userId: string;
  documentId: string;
  documentClassification: {
    type: string;
    confidence: number;
  };
  summary: string;
  entities: any[];
  dates: any[];
  amounts: any[];
  events: any[];
  identifiers: any[];
  relationships: any[];
  aiModel: string;
  status: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string | null;
  processedAt: string;
  isCached?: boolean;
}

// In-memory fallback for understanding records when running without MongoDB
interface MemoryUnderstanding {
  id: string;
  userId: string;
  documentId: string;
  documentClassification: any;
  summary: string;
  entities: any[];
  dates: any[];
  amounts: any[];
  events: any[];
  identifiers: any[];
  relationships: any[];
  aiModel: string;
  promptVersion: string;
  status: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string | null;
  processedAt: Date;
}
const inMemoryUnderstandings: Map<string, MemoryUnderstanding> = new Map();

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}


export async function understandUserDocument(
  userId: string,
  documentId: string,
  forceReprocess: boolean = false
): Promise<DocumentUnderstandingDTO> {
  // 1. Fetch document and verify user ownership
  let docRecord: any = null;

  if (isDbConnected()) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error('Document not found or access denied.');
    }
    docRecord = await DocumentModel.findOne({ _id: documentId, userId });
  } else {
    // Import from ingestion service's document memory or check
    const { getUserDocumentById, getUserDocumentContent } = await import('../ingestion/ingestionService.js');
    const doc = await getUserDocumentById(userId, documentId);
    const content = await getUserDocumentContent(userId, documentId);
    if (doc && content) {
      docRecord = {
        id: doc.id,
        userId: doc.userId,
        originalName: doc.originalName,
        extractedText: content.extractedText,
      };
    }
  }

  if (!docRecord) {
    throw new Error('Document not found or you do not have permission to access it.');
  }

  // 2. Validate extracted text availability
  const extractedText = docRecord.extractedText || '';
  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error('Document has no extracted text. Please re-upload a document containing readable content.');
  }

  // 3. Check for existing completed understanding (prevent unnecessary Gemini calls)
  if (!forceReprocess) {
    if (isDbConnected()) {
      const existing = await DocumentUnderstandingModel.findOne({ userId, documentId });
      if (existing && existing.status === 'COMPLETED') {
        logger.info(`Returning cached AI understanding for document ${documentId} (User: ${userId})`);
        return formatUnderstandingDTO(existing, true);
      }
    } else {
      const memKey = `${userId}_${documentId}`;
      const existing = inMemoryUnderstandings.get(memKey);
      if (existing && existing.status === 'COMPLETED') {
        logger.info(`Returning cached in-memory AI understanding for document ${documentId}`);
        return formatMemoryUnderstandingDTO(existing, true);
      }
    }
  }

  // 4. Call Gemini semantic understanding
  const modelName = ENV.GEMINI_MODEL || 'gemini-3.6-flash';
  let rawAiResult: any = null;

  try {
    rawAiResult = await geminiService.generateDocumentUnderstanding(
      extractedText,
      docRecord.originalName
    );
  } catch (error: any) {
    logger.error(`Gemini call failed for document ${documentId}:`, error?.message || error);
    
    // Save failed attempt record
    await saveUnderstandingRecord({
      userId,
      documentId,
      documentClassification: { type: 'other', confidence: 0 },
      summary: '',
      entities: [],
      dates: [],
      amounts: [],
      events: [],
      identifiers: [],
      relationships: [],
      aiModel: modelName,
      promptVersion: 'v1.0.0',
      status: 'FAILED',
      errorMessage: error.message || 'Gemini processing failed',
      processedAt: new Date(),
    });

    throw new Error(error.message || 'Document semantic understanding failed.');
  }

  // 5. Strict Schema Validation (Zod)
  const validation = DocumentUnderstandingSchema.safeParse(rawAiResult);
  if (!validation.success) {
    const issues = validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    logger.error(`AI JSON validation failed for ${documentId}: ${issues}`);

    await saveUnderstandingRecord({
      userId,
      documentId,
      documentClassification: { type: 'other', confidence: 0 },
      summary: '',
      entities: [],
      dates: [],
      amounts: [],
      events: [],
      identifiers: [],
      relationships: [],
      aiModel: modelName,
      promptVersion: 'v1.0.0',
      status: 'FAILED',
      errorMessage: `Malformed AI schema: ${issues}`,
      processedAt: new Date(),
    });

    throw new Error('AI response did not adhere to the required structured schema.');
  }

  const structuredData: DocumentUnderstandingResult = validation.data;

  // 6. Persist structured understanding
  const savedRecord = await saveUnderstandingRecord({
    userId,
    documentId,
    documentClassification: structuredData.documentClassification,
    summary: structuredData.summary,
    entities: structuredData.entities,
    dates: structuredData.dates,
    amounts: structuredData.amounts,
    events: structuredData.events,
    identifiers: structuredData.identifiers,
    relationships: structuredData.relationships,
    aiModel: modelName,
    promptVersion: 'v1.0.0',
    status: 'COMPLETED',
    errorMessage: null,
    processedAt: new Date(),
  });

  return savedRecord;
}

export async function getUserDocumentUnderstanding(
  userId: string,
  documentId: string
): Promise<DocumentUnderstandingDTO | null> {
  if (isDbConnected()) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return null;
    }
    const record = await DocumentUnderstandingModel.findOne({ userId, documentId });
    if (!record) return null;
    return formatUnderstandingDTO(record);
  } else {
    const memKey = `${userId}_${documentId}`;
    const record = inMemoryUnderstandings.get(memKey);
    if (!record) return null;
    return formatMemoryUnderstandingDTO(record);
  }
}

export async function getAllUserDocumentUnderstandings(
  userId: string
): Promise<DocumentUnderstandingDTO[]> {
  if (isDbConnected()) {
    const records = await DocumentUnderstandingModel.find({ userId, status: 'COMPLETED' });
    return records.map((r) => formatUnderstandingDTO(r));
  } else {
    const list: DocumentUnderstandingDTO[] = [];
    for (const record of inMemoryUnderstandings.values()) {
      if (record.userId === userId && record.status === 'COMPLETED') {
        list.push(formatMemoryUnderstandingDTO(record));
      }
    }
    return list;
  }
}

async function saveUnderstandingRecord(data: {
  userId: string;
  documentId: string;
  documentClassification: any;
  summary: string;
  entities: any[];
  dates: any[];
  amounts: any[];
  events: any[];
  identifiers: any[];
  relationships: any[];
  aiModel: string;
  promptVersion: string;
  status: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  processedAt: Date;
}): Promise<DocumentUnderstandingDTO> {
  if (isDbConnected()) {
    const updated = await DocumentUnderstandingModel.findOneAndUpdate(
      { userId: data.userId, documentId: data.documentId },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return formatUnderstandingDTO(updated);
  } else {
    const memKey = `${data.userId}_${data.documentId}`;
    const memDoc: MemoryUnderstanding = {
      id: `und_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...data,
    };
    inMemoryUnderstandings.set(memKey, memDoc);
    return formatMemoryUnderstandingDTO(memDoc);
  }
}

function formatUnderstandingDTO(
  doc: IDocumentUnderstandingRecord,
  isCached: boolean = false
): DocumentUnderstandingDTO {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    documentId: doc.documentId,
    documentClassification: doc.documentClassification,
    summary: doc.summary,
    entities: doc.entities,
    dates: doc.dates,
    amounts: doc.amounts,
    events: doc.events,
    identifiers: doc.identifiers,
    relationships: doc.relationships,
    aiModel: doc.aiModel,
    status: doc.status,
    errorMessage: doc.errorMessage,
    processedAt: doc.processedAt ? doc.processedAt.toISOString() : new Date().toISOString(),
    isCached,
  };
}

function formatMemoryUnderstandingDTO(
  doc: MemoryUnderstanding,
  isCached: boolean = false
): DocumentUnderstandingDTO {
  return {
    id: doc.id,
    userId: doc.userId,
    documentId: doc.documentId,
    documentClassification: doc.documentClassification,
    summary: doc.summary,
    entities: doc.entities,
    dates: doc.dates,
    amounts: doc.amounts,
    events: doc.events,
    identifiers: doc.identifiers,
    relationships: doc.relationships,
    aiModel: doc.aiModel,
    status: doc.status,
    errorMessage: doc.errorMessage,
    processedAt: doc.processedAt.toISOString(),
    isCached,
  };
}

export async function deleteDocumentUnderstanding(
  userId: string,
  documentId: string
): Promise<void> {
  if (isDbConnected()) {
    await DocumentUnderstandingModel.deleteMany({ userId, documentId });
  } else {
    inMemoryUnderstandings.delete(`${userId}_${documentId}`);
  }
}

export async function clearAllUserUnderstandings(userId: string): Promise<number> {
  let count = 0;
  if (isDbConnected()) {
    const res = await DocumentUnderstandingModel.deleteMany({ userId });
    count = res.deletedCount || 0;
  } else {
    for (const [key, val] of inMemoryUnderstandings.entries()) {
      if (val.userId === userId) {
        inMemoryUnderstandings.delete(key);
        count++;
      }
    }
  }
  return count;
}



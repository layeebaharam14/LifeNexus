import mongoose from 'mongoose';
import { DocumentModel, IDocumentRecord } from '../../models/Document.js';
import { storageService } from '../storage/localStorage.js';
import { extractContent } from '../extraction/extractionService.js';
import { calculateBufferHash } from '../../utils/hashUtils.js';
import { APP_CONSTANTS } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

export interface ProcessedDocumentDTO {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  documentType: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  hasExtractedText: boolean;
  extractedText?: string;
  extractionMethod?: 'text' | 'pdf' | 'ocr' | 'scanned_pdf' | 'none';
  errorMessage?: string | null;
  uploadedAt: string;
  isDuplicate?: boolean;
}

export interface DocumentContentDTO {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  extractedText: string;
  extractionMethod: 'text' | 'pdf' | 'ocr' | 'scanned_pdf' | 'none';
  hasExtractedText: boolean;
  processingStatus: string;
  uploadedAt: string;
}

// In-memory fallback documents store
interface MemoryDoc {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  storagePath: string;
  extractedText: string;
  extractionMethod: 'text' | 'pdf' | 'ocr' | 'scanned_pdf' | 'none';
  documentType: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  errorMessage?: string | null;
  uploadedAt: Date;
}

const inMemoryDocuments: Map<string, MemoryDoc> = new Map();

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function ingestFile(
  userId: string,
  file: Express.Multer.File
): Promise<ProcessedDocumentDTO> {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new Error('Uploaded file is empty or invalid.');
  }

  // MIME type check
  const normalizedMime = file.mimetype.toLowerCase();
  if (!APP_CONSTANTS.ALLOWED_FILE_TYPES.includes(normalizedMime)) {
    throw new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, PNG, JPG, JPEG, TXT.`);
  }

  // Size check
  if (file.size > APP_CONSTANTS.MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum size limit of ${APP_CONSTANTS.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }

  // 1. Generate SHA-256 hash
  const fileHash = calculateBufferHash(file.buffer);

  // 2. User-scoped duplicate detection
  if (isDbConnected()) {
    const existingDoc = await DocumentModel.findOne({ userId, fileHash });
    if (existingDoc) {
      logger.info(`Duplicate file detected for user ${userId}: ${file.originalname} (Hash: ${fileHash})`);
      return {
        id: existingDoc._id.toString(),
        userId: existingDoc.userId,
        fileName: existingDoc.fileName,
        originalName: existingDoc.originalName,
        mimeType: existingDoc.mimeType,
        fileSize: existingDoc.fileSize,
        fileHash: existingDoc.fileHash,
        documentType: existingDoc.documentType,
        processingStatus: existingDoc.processingStatus,
        hasExtractedText: !!existingDoc.extractedText && existingDoc.extractedText.length > 0,
        extractedText: existingDoc.extractedText,
        errorMessage: existingDoc.errorMessage,
        uploadedAt: existingDoc.uploadedAt.toISOString(),
        isDuplicate: true,
      };
    }
  } else {
    for (const doc of inMemoryDocuments.values()) {
      if (doc.userId === userId && doc.fileHash === fileHash) {
        logger.info(`Duplicate in-memory file detected for user ${userId}: ${file.originalname}`);
        return {
          id: doc.id,
          userId: doc.userId,
          fileName: doc.fileName,
          originalName: doc.originalName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          fileHash: doc.fileHash,
          documentType: doc.documentType,
          processingStatus: doc.processingStatus,
          hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
          extractedText: doc.extractedText,
          extractionMethod: doc.extractionMethod,
          errorMessage: doc.errorMessage,
          uploadedAt: doc.uploadedAt.toISOString(),
          isDuplicate: true,
        };
      }
    }
  }

  // 3. Generate unique document ID and save physical file
  const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = await storageService.saveFile(userId, documentId, file.originalname, file.buffer);

  // 4. Initial Document Record Creation
  let processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED' = 'PROCESSING';
  let extractedText = '';
  let extractionMethod: 'text' | 'pdf' | 'ocr' | 'scanned_pdf' | 'none' = 'none';
  let errorMessage: string | null = null;

  // 5. Text Extraction Pipeline
  try {
    const extractionResult = await extractContent(file.mimetype, file.buffer);
    extractedText = extractionResult.text;
    extractionMethod = extractionResult.method;
    processingStatus = 'PROCESSED';
  } catch (error: any) {
    logger.error(`Extraction failed for ${file.originalname}:`, error);
    processingStatus = 'FAILED';
    errorMessage = error.message || 'Text extraction failed';
  }

  // 6. Persistence
  if (isDbConnected()) {
    const newDoc = await DocumentModel.create({
      userId,
      fileName: `${documentId}_${file.originalname}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileHash,
      storagePath,
      extractedText,
      documentType: determineDocumentType(file.originalname, file.mimetype),
      processingStatus,
      errorMessage,
      uploadedAt: new Date(),
    });

    return {
      id: newDoc._id.toString(),
      userId: newDoc.userId,
      fileName: newDoc.fileName,
      originalName: newDoc.originalName,
      mimeType: newDoc.mimeType,
      fileSize: newDoc.fileSize,
      fileHash: newDoc.fileHash,
      documentType: newDoc.documentType,
      processingStatus: newDoc.processingStatus,
      hasExtractedText: !!extractedText && extractedText.length > 0,
      extractedText,
      extractionMethod,
      errorMessage: newDoc.errorMessage,
      uploadedAt: newDoc.uploadedAt.toISOString(),
      isDuplicate: false,
    };
  } else {
    const memoryDoc: MemoryDoc = {
      id: documentId,
      userId,
      fileName: `${documentId}_${file.originalname}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileHash,
      storagePath,
      extractedText,
      extractionMethod,
      documentType: determineDocumentType(file.originalname, file.mimetype),
      processingStatus,
      errorMessage,
      uploadedAt: new Date(),
    };

    inMemoryDocuments.set(documentId, memoryDoc);

    return {
      id: memoryDoc.id,
      userId: memoryDoc.userId,
      fileName: memoryDoc.fileName,
      originalName: memoryDoc.originalName,
      mimeType: memoryDoc.mimeType,
      fileSize: memoryDoc.fileSize,
      fileHash: memoryDoc.fileHash,
      documentType: memoryDoc.documentType,
      processingStatus: memoryDoc.processingStatus,
      hasExtractedText: !!extractedText && extractedText.length > 0,
      extractedText,
      extractionMethod,
      errorMessage: memoryDoc.errorMessage,
      uploadedAt: memoryDoc.uploadedAt.toISOString(),
      isDuplicate: false,
    };
  }
}


export async function listUserDocuments(userId: string): Promise<ProcessedDocumentDTO[]> {
  if (isDbConnected()) {
    const docs = await DocumentModel.find({ userId }).sort({ uploadedAt: -1 });
    return docs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      fileName: doc.fileName,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      fileHash: doc.fileHash,
      documentType: doc.documentType,
      processingStatus: doc.processingStatus,
      hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
      errorMessage: doc.errorMessage,
      uploadedAt: doc.uploadedAt.toISOString(),
    }));
  } else {
    const list: ProcessedDocumentDTO[] = [];
    for (const doc of inMemoryDocuments.values()) {
      if (doc.userId === userId) {
        list.push({
          id: doc.id,
          userId: doc.userId,
          fileName: doc.fileName,
          originalName: doc.originalName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          fileHash: doc.fileHash,
          documentType: doc.documentType,
          processingStatus: doc.processingStatus,
          hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
          extractionMethod: doc.extractionMethod,
          errorMessage: doc.errorMessage,
          uploadedAt: doc.uploadedAt.toISOString(),
        });
      }
    }
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }
}

export async function getUserDocumentById(
  userId: string,
  documentId: string
): Promise<ProcessedDocumentDTO | null> {
  if (isDbConnected()) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return null;
    }
    const doc = await DocumentModel.findOne({ _id: documentId, userId });
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      userId: doc.userId,
      fileName: doc.fileName,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      fileHash: doc.fileHash,
      documentType: doc.documentType,
      processingStatus: doc.processingStatus,
      hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
      errorMessage: doc.errorMessage,
      uploadedAt: doc.uploadedAt.toISOString(),
    };
  } else {
    const doc = inMemoryDocuments.get(documentId);
    if (doc && doc.userId === userId) {
      return {
        id: doc.id,
        userId: doc.userId,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        fileHash: doc.fileHash,
        documentType: doc.documentType,
        processingStatus: doc.processingStatus,
        hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
        extractionMethod: doc.extractionMethod,
        errorMessage: doc.errorMessage,
        uploadedAt: doc.uploadedAt.toISOString(),
      };
    }
    return null;
  }
}


export async function getUserDocumentContent(
  userId: string,
  documentId: string
): Promise<DocumentContentDTO | null> {
  if (isDbConnected()) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return null;
    }
    const doc = await DocumentModel.findOne({ _id: documentId, userId });
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      extractedText: doc.extractedText,
      extractionMethod: doc.mimeType.includes('pdf') ? 'pdf' : doc.mimeType.startsWith('image/') ? 'ocr' : 'text',
      hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
      processingStatus: doc.processingStatus,
      uploadedAt: doc.uploadedAt.toISOString(),
    };
  } else {
    const doc = inMemoryDocuments.get(documentId);
    if (doc && doc.userId === userId) {
      return {
        id: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        extractedText: doc.extractedText,
        extractionMethod: doc.extractionMethod || (doc.mimeType.includes('pdf') ? 'pdf' : doc.mimeType.startsWith('image/') ? 'ocr' : 'text'),
        hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
        processingStatus: doc.processingStatus,
        uploadedAt: doc.uploadedAt.toISOString(),
      };
    }
    return null;
  }
}

export async function getAllUserDocumentsWithContent(
  userId: string
): Promise<Array<ProcessedDocumentDTO & { extractedText: string }>> {
  if (isDbConnected()) {
    const docs = await DocumentModel.find({ userId });
    return docs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      fileName: doc.fileName,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      fileHash: doc.fileHash,
      documentType: doc.documentType,
      processingStatus: doc.processingStatus,
      hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
      extractedText: doc.extractedText || '',
      uploadedAt: doc.uploadedAt.toISOString(),
    }));
  } else {
    const list: Array<ProcessedDocumentDTO & { extractedText: string }> = [];
    for (const doc of inMemoryDocuments.values()) {
      if (doc.userId === userId) {
        list.push({
          id: doc.id,
          userId: doc.userId,
          fileName: doc.fileName,
          originalName: doc.originalName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          fileHash: doc.fileHash,
          documentType: doc.documentType,
          processingStatus: doc.processingStatus,
          hasExtractedText: !!doc.extractedText && doc.extractedText.length > 0,
          extractedText: doc.extractedText || '',
          uploadedAt: doc.uploadedAt.toISOString(),
        });
      }
    }
    return list;
  }
}

export async function deleteUserDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  let deleted = false;
  if (isDbConnected()) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return false;
    }
    const doc = await DocumentModel.findOne({ _id: documentId, userId });
    if (!doc) return false;

    // Delete physical file
    await storageService.deleteFile(doc.storagePath);

    // Delete DB record
    await DocumentModel.deleteOne({ _id: documentId, userId });
    deleted = true;
  } else {
    const doc = inMemoryDocuments.get(documentId);
    if (doc && doc.userId === userId) {
      await storageService.deleteFile(doc.storagePath);
      inMemoryDocuments.delete(documentId);
      deleted = true;
    }
  }

  if (deleted) {
    // Phase 11 Cascade Integrity: Delete understanding and unlink/purge dependent memory records
    try {
      const { deleteDocumentUnderstanding } = await import('../ai/documentUnderstandingService.js');
      await deleteDocumentUnderstanding(userId, documentId);
    } catch (err) {
      logger.warn(`Failed to clean up document understanding for ${documentId}:`, err);
    }

    try {
      const { unlinkDocumentFromMemory } = await import('../memory/memoryEngineService.js');
      await unlinkDocumentFromMemory(userId, documentId);
    } catch (err) {
      logger.warn(`Failed to unlink document from memory for ${documentId}:`, err);
    }
  }

  return deleted;
}

export async function clearAllUserDocuments(userId: string): Promise<number> {
  let count = 0;
  if (isDbConnected()) {
    const docs = await DocumentModel.find({ userId });
    count = docs.length;
    for (const doc of docs) {
      try {
        await storageService.deleteFile(doc.storagePath);
      } catch (err) {
        logger.warn(`Failed to delete physical file ${doc.storagePath}:`, err);
      }
    }
    await DocumentModel.deleteMany({ userId });
  } else {
    for (const [id, doc] of inMemoryDocuments.entries()) {
      if (doc.userId === userId) {
        count++;
        try {
          await storageService.deleteFile(doc.storagePath);
        } catch (err) {
          logger.warn(`Failed to delete physical file ${doc.storagePath}:`, err);
        }
        inMemoryDocuments.delete(id);
      }
    }
  }
  return count;
}


function determineDocumentType(filename: string, mimeType: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('invoice') || lower.includes('receipt') || lower.includes('bill')) return 'Invoice';
  if (lower.includes('warranty') || lower.includes('care') || lower.includes('protection')) return 'Warranty';
  if (lower.includes('cert') || lower.includes('diploma') || lower.includes('degree')) return 'Certificate';
  if (lower.includes('ticket') || lower.includes('flight') || lower.includes('boarding')) return 'Ticket';
  if (lower.includes('renewal') || lower.includes('policy') || lower.includes('insurance')) return 'Renewal';
  if (lower.includes('note') || lower.includes('journal')) return 'Note';
  if (mimeType.startsWith('image/')) return 'Image';
  return 'Document';
}

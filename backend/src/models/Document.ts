import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentRecord extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  storagePath: string;
  extractedText: string;
  documentType: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      index: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    documentType: {
      type: String,
      default: 'Unknown',
    },
    processingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + fileHash deduplication
DocumentSchema.index({ userId: 1, fileHash: 1 });

export const DocumentModel = mongoose.model<IDocumentRecord>('Document', DocumentSchema);

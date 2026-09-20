import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentRecord extends MongooseDocument {
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  storagePath: string;
  extractedText: string;
  documentType: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  errorMessage?: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentRecord>(
  {
    userId: {
      type: String,
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
      default: 'Document',
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
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

// Compound index for user + fileHash deduplication
DocumentSchema.index({ userId: 1, fileHash: 1 });
DocumentSchema.index({ userId: 1, uploadedAt: -1 });

export const DocumentModel = mongoose.model<IDocumentRecord>('Document', DocumentSchema);

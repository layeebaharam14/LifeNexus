import mongoose, { Schema, Document } from 'mongoose';

export interface IMemoryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'entity' | 'event' | 'relationship' | 'derived';
  title: string;
  date?: string;
  datePrecision?: string;
  entities: string[];
  sourceDocIds: mongoose.Types.ObjectId[];
  evidence?: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['entity', 'event', 'relationship', 'derived'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: null,
    },
    datePrecision: {
      type: String,
      enum: ['exact', 'month', 'year', 'range', 'unknown'],
      default: 'unknown',
    },
    entities: {
      type: [String],
      default: [],
    },
    sourceDocIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    evidence: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

MemorySchema.index({ userId: 1, createdAt: -1 });

export const MemoryModel = mongoose.model<IMemoryDocument>('Memory', MemorySchema);

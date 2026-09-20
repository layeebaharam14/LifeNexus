import mongoose, { Schema, Document } from 'mongoose';

export interface IRelationshipDocument extends Document {
  userId: mongoose.Types.ObjectId;
  sourceEntityId: mongoose.Types.ObjectId;
  targetEntityId: mongoose.Types.ObjectId;
  relationType: string;
  confidence: number;
  evidenceSnippet?: string;
  sourceDocIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema = new Schema<IRelationshipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceEntityId: {
      type: Schema.Types.ObjectId,
      ref: 'Entity',
      required: true,
      index: true,
    },
    targetEntityId: {
      type: Schema.Types.ObjectId,
      ref: 'Entity',
      required: true,
      index: true,
    },
    relationType: {
      type: String,
      required: true,
      trim: true,
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0.0,
      max: 1.0,
    },
    evidenceSnippet: {
      type: String,
      default: '',
    },
    sourceDocIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
  },
  {
    timestamps: true,
  }
);

RelationshipSchema.index({ userId: 1, sourceEntityId: 1, targetEntityId: 1 });

export const RelationshipModel = mongoose.model<IRelationshipDocument>('Relationship', RelationshipSchema);

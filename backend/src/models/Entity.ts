import mongoose, { Schema, Document } from 'mongoose';

export interface IEntityDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  aliases: string[];
  attributes: Map<string, any>;
  sourceDocIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EntitySchema = new Schema<IEntityDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Asset', 'Organization', 'Person', 'Certificate', 'Document', 'Location', 'Financial', 'Event'],
      index: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
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

EntitySchema.index({ userId: 1, name: 1 });

export const EntityModel = mongoose.model<IEntityDocument>('Entity', EntitySchema);

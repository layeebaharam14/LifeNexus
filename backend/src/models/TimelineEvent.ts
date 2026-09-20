import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEventDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: string;
  datePrecision: 'exact' | 'month' | 'year' | 'range' | 'unknown';
  category: string;
  entityIds: mongoose.Types.ObjectId[];
  sourceDocIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEventDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    datePrecision: {
      type: String,
      enum: ['exact', 'month', 'year', 'range', 'unknown'],
      default: 'exact',
    },
    category: {
      type: String,
      enum: ['Education', 'Career', 'Financial', 'Asset', 'Travel', 'Administrative', 'Personal'],
      default: 'Personal',
      index: true,
    },
    entityIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Entity',
      },
    ],
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

TimelineEventSchema.index({ userId: 1, date: -1 });

export const TimelineEventModel = mongoose.model<ITimelineEventDocument>('TimelineEvent', TimelineEventSchema);

export type DatePrecision = 'exact' | 'month' | 'year' | 'range' | 'unknown';

export type EntityType =
  | 'Asset'
  | 'Organization'
  | 'Person'
  | 'Certificate'
  | 'Document'
  | 'Location'
  | 'Financial'
  | 'Event';

export interface IEntity {
  id: string;
  userId: string;
  name: string;
  type: EntityType;
  aliases?: string[];
  attributes?: Record<string, any>;
  sourceDocIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRelationship {
  id: string;
  userId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  confidence: number;
  evidenceSnippet?: string;
  sourceDocIds: string[];
  createdAt?: Date;
}

export interface ITimelineEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  datePrecision: DatePrecision;
  category: 'Education' | 'Career' | 'Financial' | 'Asset' | 'Travel' | 'Administrative' | 'Personal';
  entityIds: string[];
  sourceDocIds: string[];
  createdAt?: Date;
}

export interface IMemoryRecord {
  id: string;
  userId: string;
  type: 'entity' | 'event' | 'relationship' | 'derived';
  title: string;
  date?: string;
  datePrecision?: DatePrecision;
  entities: string[];
  sourceIds: string[];
  evidence?: string;
  confidence: number;
  createdAt?: Date;
}

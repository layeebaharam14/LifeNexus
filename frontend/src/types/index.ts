export interface User {
  id: string;
  email: string;
  name: string;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  uploadedAt: string;
  extractedEntitiesCount?: number;
}

export interface EntityNode {
  id: string;
  name: string;
  type: 'Asset' | 'Organization' | 'Person' | 'Certificate' | 'Document' | 'Location' | 'Financial' | 'Event';
  aliases?: string[];
  attributes?: Record<string, any>;
  sourceDocIds: string[];
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence: number;
  evidenceSnippet?: string;
  sourceDocIds: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  datePrecision: 'exact' | 'month' | 'year' | 'range' | 'unknown';
  category: 'Education' | 'Career' | 'Financial' | 'Asset' | 'Travel' | 'Administrative' | 'Personal';
  entityIds: string[];
  sourceDocIds: string[];
}

export interface SearchResult {
  answer: string;
  confidence: number;
  sources: {
    id: string;
    fileName: string;
    snippet: string;
  }[];
  entities: EntityNode[];
  relatedEvents: TimelineEvent[];
}

export interface ExpirationAlert {
  id: string;
  title: string;
  entityName: string;
  expiryDate: string;
  daysRemaining: number;
  sourceDocName: string;
  type: 'warranty' | 'subscription' | 'insurance' | 'certificate';
}

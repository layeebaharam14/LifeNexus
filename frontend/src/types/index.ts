export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

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
  hasExtractedText?: boolean;
  extractedText?: string;
  errorMessage?: string;
  isDuplicate?: boolean;
  extractionMethod?: 'text' | 'pdf' | 'ocr' | 'scanned_pdf' | 'none';
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

export interface ExtractedEntity {
  name: string;
  type: 'PERSON' | 'ORGANIZATION' | 'PRODUCT' | 'PLACE' | 'SERVICE' | 'ACCOUNT' | 'OTHER';
  normalizedName?: string;
  confidence: number;
  evidence?: string;
}

export interface ExtractedDate {
  value: string;
  type: 'PURCHASE' | 'EXPIRY' | 'START' | 'END' | 'EVENT' | 'ISSUE' | 'RENEWAL' | 'OTHER';
  precision: 'DAY' | 'MONTH' | 'YEAR' | 'UNKNOWN';
  confidence: number;
  evidence?: string;
}

export interface ExtractedAmount {
  value: number;
  currency: string;
  type: 'PURCHASE' | 'PAYMENT' | 'PREMIUM' | 'REFUND' | 'OTHER';
  confidence: number;
  evidence?: string;
}

export interface ExtractedEvent {
  title: string;
  date?: string | null;
  datePrecision?: 'DAY' | 'MONTH' | 'YEAR' | 'UNKNOWN';
  description?: string;
  confidence: number;
  evidence?: string;
}

export interface ExtractedIdentifier {
  type: string;
  value: string;
  confidence: number;
  evidence?: string;
}

export interface ExtractedRelationship {
  from: string;
  relationship: string;
  to: string;
  confidence: number;
  evidence?: string;
}

export interface DocumentUnderstandingRecord {
  id?: string;
  userId: string;
  documentId: string;
  documentClassification: {
    type: string;
    confidence: number;
  };
  summary?: string;
  entities: ExtractedEntity[];
  dates: ExtractedDate[];
  amounts: ExtractedAmount[];
  events: ExtractedEvent[];
  identifiers: ExtractedIdentifier[];
  relationships: ExtractedRelationship[];
  aiModel: string;
  promptVersion: string;
  status: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string | null;
  processedAt?: string;
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

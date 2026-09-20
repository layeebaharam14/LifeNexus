export const APP_CONSTANTS = {
  APP_NAME: 'LIFENEXUS',
  TAGLINE: "Everything you've done. Connected.",
  VERSION: '1.0.0',
  DEFAULT_PORT: 5000,
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/plain',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg', '.txt'],
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15 MB
  DOCUMENT_STATUS: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    PROCESSED: 'PROCESSED',
    FAILED: 'FAILED',
  } as const,
  DATE_PRECISION: {
    EXACT: 'exact',
    MONTH: 'month',
    YEAR: 'year',
    RANGE: 'range',
    UNKNOWN: 'unknown',
  } as const,
  ENTITY_TYPES: {
    ASSET: 'Asset',
    ORGANIZATION: 'Organization',
    PERSON: 'Person',
    CERTIFICATE: 'Certificate',
    DOCUMENT: 'Document',
    LOCATION: 'Location',
    FINANCIAL: 'Financial',
    EVENT: 'Event',
  } as const,
};

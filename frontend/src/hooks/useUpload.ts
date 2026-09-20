import { useState, useCallback } from 'react';
import { uploadDocuments } from '../services/documentService.js';
import { DocumentRecord } from '../types/index.js';

export type IngestionStage = 'idle' | 'uploading' | 'extracting' | 'complete' | 'error';

export const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
];
export const MAX_FILE_SIZE_MB = 15;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationError {
  file: File;
  error: string;
}

export function useUpload(onSuccessCallback?: (docs: DocumentRecord[]) => void) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);
  const [stage, setStage] = useState<IngestionStage>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentRecord[]>([]);

  const validateFile = (file: File): string | null => {
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const isExtValid = SUPPORTED_EXTENSIONS.includes(ext);
    const isMimeValid = SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase()) || isExtValid;

    if (!isExtValid && !isMimeValid) {
      return `Unsupported file format (${ext || file.type}). Supported: PDF, TXT, PNG, JPG, JPEG.`;
    }

    if (file.size === 0) {
      return 'File is empty (0 bytes).';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds max size limit of ${MAX_FILE_SIZE_MB}MB (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
    }

    return null;
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const valid: File[] = [];
    const errors: FileValidationError[] = [];

    fileArray.forEach((f) => {
      const err = validateFile(f);
      if (err) {
        errors.push({ file: f, error: err });
      } else {
        // Prevent duplicate file references in the queue
        const exists = selectedFiles.some(
          (existing) => existing.name === f.name && existing.size === f.size
        );
        if (!exists) {
          valid.push(f);
        }
      }
    });

    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
    }
    setValidationErrors(errors);
    setErrorMessage(null);
  }, [selectedFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setValidationErrors([]);
    setStage('idle');
    setProgress(0);
    setErrorMessage(null);
    setUploadedDocuments([]);
  }, []);

  const upload = useCallback(async (): Promise<DocumentRecord[] | null> => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one valid file to ingest.');
      return null;
    }

    setStage('uploading');
    setProgress(25);
    setErrorMessage(null);

    try {
      // Simulate stepped progress to give smooth UX feedback
      const progressTimer = setTimeout(() => {
        setStage('extracting');
        setProgress(70);
      }, 600);

      const response = await uploadDocuments(selectedFiles);
      clearTimeout(progressTimer);

      if (!response.success || !response.data?.documents) {
        setStage('error');
        setErrorMessage(response.error || 'Document ingestion failed.');
        return null;
      }

      const docs = response.data.documents;
      setUploadedDocuments(docs);
      setProgress(100);
      setStage('complete');

      if (onSuccessCallback) {
        onSuccessCallback(docs);
      }

      return docs;
    } catch (err: any) {
      setStage('error');
      setErrorMessage(err.message || 'An unexpected error occurred during ingestion.');
      return null;
    }
  }, [selectedFiles, onSuccessCallback]);

  return {
    selectedFiles,
    validationErrors,
    stage,
    progress,
    errorMessage,
    uploadedDocuments,
    addFiles,
    removeFile,
    clearFiles,
    upload,
    isProcessing: stage === 'uploading' || stage === 'extracting',
  };
}

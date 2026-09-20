import { apiGet, apiUpload, apiDelete } from './api.js';
import { ApiResponse, DocumentRecord } from '../types/index.js';

export interface DocumentContentResult {
  documentId: string;
  fileName: string;
  originalName: string;
  extractedText: string;
  extractionMethod: 'text' | 'pdf' | 'ocr' | 'scanned_pdf' | 'none';
  fileSize: number;
  mimeType: string;
  hasExtractedText: boolean;
  uploadedAt: string;
}

export async function uploadDocuments(
  files: File[] | FileList
): Promise<ApiResponse<{ documents: DocumentRecord[] }>> {
  const formData = new FormData();
  const fileArray = Array.from(files);
  
  fileArray.forEach((file) => {
    formData.append('files', file);
  });

  return apiUpload<{ documents: DocumentRecord[] }>('/documents/upload', formData);
}

export async function getDocuments(): Promise<ApiResponse<{ documents: DocumentRecord[] }>> {
  return apiGet<{ documents: DocumentRecord[] }>('/documents');
}

export async function getDocument(id: string): Promise<ApiResponse<{ document: DocumentRecord }>> {
  return apiGet<{ document: DocumentRecord }>(`/documents/${id}`);
}

export async function getDocumentContent(
  id: string
): Promise<ApiResponse<{ content: DocumentContentResult }>> {
  return apiGet<{ content: DocumentContentResult }>(`/documents/${id}/content`);
}

export async function deleteDocument(id: string): Promise<ApiResponse<{ deletedId: string }>> {
  return apiDelete<{ deletedId: string }>(`/documents/${id}`);
}

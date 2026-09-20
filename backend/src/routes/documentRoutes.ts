import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  uploadDocumentsController,
  listDocumentsController,
  getDocumentDetailController,
  getDocumentContentController,
  deleteDocumentController,
  understandDocumentController,
  getDocumentUnderstandingController,
} from '../controllers/documentController.js';
import { buildMemoryController } from '../controllers/memoryController.js';

export const documentRoutes = Router();

// All document routes require authentication
documentRoutes.use(authenticateUser);

// Document upload (single or multiple files)
documentRoutes.post('/upload', upload.array('files', 10), uploadDocumentsController);

// List user's documents
documentRoutes.get('/', listDocumentsController);

// Get specific document metadata
documentRoutes.get('/:id', getDocumentDetailController);

// Get extracted content of a document
documentRoutes.get('/:id/content', getDocumentContentController);

// Phase 4A: Trigger or get AI Document Understanding
documentRoutes.post('/:id/understand', understandDocumentController);
documentRoutes.get('/:id/understanding', getDocumentUnderstandingController);

// Phase 4B: Build Memory from a document's AI Understanding
documentRoutes.post('/:id/build-memory', buildMemoryController);

// Delete user's document
documentRoutes.delete('/:id', deleteDocumentController);


import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  uploadDocumentsController,
  listDocumentsController,
  getDocumentDetailController,
  getDocumentContentController,
  deleteDocumentController,
} from '../controllers/documentController.js';

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

// Delete user's document
documentRoutes.delete('/:id', deleteDocumentController);


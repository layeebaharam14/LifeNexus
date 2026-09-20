import { Request, Response } from 'express';
import {
  ingestFile,
  listUserDocuments,
  getUserDocumentById,
  getUserDocumentContent,
  deleteUserDocument,
} from '../services/ingestion/ingestionService.js';
import { ApiResponse } from '../types/api.js';

export async function uploadDocumentsController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user authentication.',
      });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const singleFile = req.file as Express.Multer.File | undefined;

    const filesToProcess: Express.Multer.File[] = [];
    if (Array.isArray(files) && files.length > 0) {
      filesToProcess.push(...files);
    } else if (singleFile) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded. Please provide at least one valid file.',
      });
      return;
    }

    const results = [];
    for (const file of filesToProcess) {
      const doc = await ingestFile(userId, file);
      results.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `${results.length} document(s) ingested and processed`,
      data: {
        documents: results,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'File ingestion failed.',
    });
  }
}

export async function listDocumentsController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const documents = await listUserDocuments(userId);

    res.status(200).json({
      success: true,
      message: 'User documents retrieved successfully',
      data: {
        documents,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list documents.',
    });
  }
}

export async function getDocumentDetailController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const document = await getUserDocumentById(userId, documentId);
    if (!document) {
      res.status(404).json({
        success: false,
        error: 'Document not found or you do not have permission to view it.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Document detail retrieved',
      data: {
        document,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve document.',
    });
  }
}

export async function getDocumentContentController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const content = await getUserDocumentContent(userId, documentId);
    if (!content) {
      res.status(404).json({
        success: false,
        error: 'Document not found or you do not have permission to view its content.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Extracted content retrieved',
      data: {
        content,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve extracted content.',
    });
  }
}

export async function deleteDocumentController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const deleted = await deleteUserDocument(userId, documentId);
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Document not found or could not be deleted.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: {
        deletedId: documentId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete document.',
    });
  }
}

export async function understandDocumentController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.id;
    const forceReprocess = req.body?.reprocess === true;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const { understandUserDocument } = await import(
      '../services/ai/documentUnderstandingService.js'
    );

    const understanding = await understandUserDocument(userId, documentId, forceReprocess);

    res.status(200).json({
      success: true,
      message: understanding.isCached
        ? 'Document understanding retrieved from cache'
        : 'Document semantic understanding completed successfully',
      data: {
        understanding,
      },
    });
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('not found') || msg.includes('access denied') || msg.includes('permission')) {
      res.status(404).json({
        success: false,
        error: 'Document not found or access denied.',
      });
      return;
    }
    if (msg.includes('no extracted text')) {
      res.status(400).json({
        success: false,
        error: msg,
      });
      return;
    }
    res.status(502).json({
      success: false,
      error: msg || 'Document semantic understanding is temporarily unavailable.',
    });
  }
}

export async function getDocumentUnderstandingController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const { getUserDocumentUnderstanding } = await import(
      '../services/ai/documentUnderstandingService.js'
    );

    const understanding = await getUserDocumentUnderstanding(userId, documentId);
    if (!understanding) {
      res.status(404).json({
        success: false,
        error: 'Document understanding not found for this document.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Document understanding retrieved successfully',
      data: {
        understanding,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve document understanding.',
    });
  }
}


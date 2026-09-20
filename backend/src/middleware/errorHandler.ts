import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Server / Middleware Error:', err?.message || err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the allowed limit (15MB).';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded at once (maximum 10).';
    } else {
      message = `Upload error: ${err.message}`;
    }
  } else if (message.includes('Unsupported file type') || message.includes('empty or invalid')) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}


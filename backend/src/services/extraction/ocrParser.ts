import { createWorker } from 'tesseract.js';
import { logger } from '../../utils/logger.js';

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    return '';
  }

  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(buffer);
    await worker.terminate();

    return (result.data.text || '').trim();
  } catch (error: any) {
    logger.error('OCR processing error:', error);
    throw new Error(`OCR processing failed: ${error.message || 'Image text unrecognized'}`);
  }
}

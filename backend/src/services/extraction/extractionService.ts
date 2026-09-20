import { extractTextFromBuffer } from './textParser.js';
import { extractTextFromPdf } from './pdfParser.js';
import { extractTextFromImage } from './ocrParser.js';
import { logger } from '../../utils/logger.js';

export interface ExtractionResult {
  text: string;
  method: 'pdf' | 'text' | 'ocr';
}

export async function extractContent(
  mimeType: string,
  buffer: Buffer
): Promise<ExtractionResult> {
  const normalizedMime = mimeType.toLowerCase().trim();

  logger.info(`Extracting content for mimeType: ${normalizedMime}, buffer size: ${buffer.length} bytes`);

  switch (normalizedMime) {
    case 'text/plain': {
      const text = extractTextFromBuffer(buffer);
      return { text, method: 'text' };
    }

    case 'application/pdf': {
      const text = await extractTextFromPdf(buffer);
      return { text, method: 'pdf' };
    }

    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg': {
      const text = await extractTextFromImage(buffer);
      return { text, method: 'ocr' };
    }

    default:
      throw new Error(`Unsupported MIME type for extraction: ${mimeType}`);
  }
}

import { extractText } from 'unpdf';
import { logger } from '../../utils/logger.js';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    return '';
  }

  try {
    const result = await extractText(new Uint8Array(buffer));
    if (!result || !result.text) {
      return '';
    }

    // result.text is string[] (page by page) or string
    const combinedText = Array.isArray(result.text)
      ? result.text.join('\n\n').trim()
      : String(result.text).trim();

    return combinedText;
  } catch (error: any) {
    logger.error('PDF text extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Corrupted or unreadable PDF'}`);
  }
}

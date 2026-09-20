export function extractTextFromBuffer(buffer: Buffer): string {
  if (!buffer || buffer.length === 0) {
    return '';
  }

  let text = buffer.toString('utf-8');

  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  return text.trim();
}

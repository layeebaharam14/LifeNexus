export interface ParsedDateInfo {
  normalizedDate: string;
  precision: 'exact' | 'month' | 'year' | 'range' | 'unknown';
}

export function parseDateString(rawDate: string): ParsedDateInfo {
  if (!rawDate || typeof rawDate !== 'string') {
    return { normalizedDate: new Date().toISOString().split('T')[0], precision: 'unknown' };
  }

  const trimmed = rawDate.trim();

  // Pattern: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { normalizedDate: trimmed, precision: 'exact' };
  }

  // Pattern: YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return { normalizedDate: `${trimmed}-01`, precision: 'month' };
  }

  // Pattern: YYYY
  if (/^\d{4}$/.test(trimmed)) {
    return { normalizedDate: `${trimmed}-01-01`, precision: 'year' };
  }

  // Native Date fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return {
      normalizedDate: parsed.toISOString().split('T')[0],
      precision: 'exact',
    };
  }

  return {
    normalizedDate: new Date().toISOString().split('T')[0],
    precision: 'unknown',
  };
}

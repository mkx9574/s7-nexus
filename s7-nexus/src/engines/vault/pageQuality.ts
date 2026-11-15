export type TextClass = 'good' | 'suspect' | 'garbled' | 'none';

export interface PageQualityResult {
  textClass: TextClass;
  flags: string[];
}

export function evaluatePageQuality(rawText: string): PageQualityResult {
  const flags: string[] = [];
  if (!rawText || rawText.trim().length === 0) {
    return { textClass: 'none', flags: ['empty-text'] };
  }

  const totalChars = rawText.length;
  const arabicMatches = rawText.match(/[\u0600-\u06FF]/g) || [];
  const arabicRatio = arabicMatches.length / totalChars;

  if (totalChars > 50 && arabicRatio < 0.1) {
    flags.push('low-arabic-ratio');
  }

  const replacementChars = rawText.match(/[\uFFFD]/g) || [];
  if (replacementChars.length > 3) {
    flags.push('replacement-chars-detected');
    return { textClass: 'garbled', flags };
  }

  const textClass: TextClass = flags.length > 0 ? 'suspect' : 'good';
  return { textClass, flags };
}

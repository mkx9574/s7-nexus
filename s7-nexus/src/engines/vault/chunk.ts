export interface ChunkInput {
  bookId: string;
  sectionId: string | null;
  text: string;
  startPage: number;
  endPage: number;
}

export interface ChunkResult {
  ordinal: number;
  text: string;
  pdfPageStart: number;
  pdfPageEnd: number;
  kind: 'text' | 'list' | 'table';
  lowQuality: boolean;
}

export function createChunks(input: ChunkInput): ChunkResult[] {
  const words = input.text.split(/\s+/);
  const chunks: ChunkResult[] = [];
  const chunkSize = 200; // حجم المقطع المستهدف
  let ordinal = 1;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push({
      ordinal: ordinal++,
      text: chunkWords.join(' '),
      pdfPageStart: input.startPage,
      pdfPageEnd: input.endPage,
      kind: 'text',
      lowQuality: false
    });
  }

  return chunks;
}

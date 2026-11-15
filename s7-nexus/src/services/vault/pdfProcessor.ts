import * as pdfjsLib from 'pdfjs-dist';
import { evaluatePageQuality } from '../../engines/vault/pageQuality';
import { createChunks } from '../../engines/vault/chunk';
import { vaultDb, BookRecord, PageRecord, ChunkRecord } from '../../vault/io/db';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// نحفظ التقدم في القاعدة كل هذا العدد من الصفحات (دفعة واحدة ذرّية)
const BATCH_PAGES = 10;

async function computeFileHash(buffer: ArrayBuffer, file: File): Promise<string> {
  try {
    if (globalThis.crypto && globalThis.crypto.subtle) {
      const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // نكمل بالبديل أدناه
  }
  return `size-${file.size}-${file.name}`;
}

export async function processAndStorePdf(
  file: File,
  subjectId: string,
  title: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const buffer = await file.arrayBuffer();

  // الترتيب مهم: البصمة والنسخة الأصلية قبل getDocument، لأن PDF.js قد يستهلك المخزن المؤقت
  const fileHash = await computeFileHash(buffer, file);
  const existing = await vaultDb.books.where('fileHash').equals(fileHash).first();

  if (existing && existing.status !== 'processing') {
    throw new Error('هذا الكتاب مفهرس مسبقاً في الخزنة، فلن يُرفع مرة ثانية.');
  }

  const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const totalPages = pdf.numPages;

  let bookId: string;
  let startPage = 1;
  let ordinal = 0;

  if (existing) {
    // استئناف كتاب لم تكتمل معالجته: نكمل من آخر دفعة حُفظت فعلاً
    bookId = existing.id;
    startPage = (existing.lastProcessedPage ?? 0) + 1;
    ordinal = await vaultDb.chunks.where('bookId').equals(bookId).count();
    await vaultDb.files.put({ id: bookId, blob: pdfBlob });
  } else {
    bookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const book: BookRecord = {
      id: bookId,
      title: title || file.name.replace(/\.pdf$/i, ''),
      subjectId,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: Date.now(),
      status: 'processing',
      lastProcessedPage: 0,
      totalPages,
      fileHash,
    };
    await vaultDb.transaction('rw', vaultDb.books, vaultDb.files, async () => {
      await vaultDb.books.add(book);
      await vaultDb.files.put({ id: bookId, blob: pdfBlob });
    });
  }

  let pendingPages: PageRecord[] = [];
  let pendingChunks: ChunkRecord[] = [];

  const flush = async (lastPage: number) => {
    await vaultDb.transaction('rw', vaultDb.books, vaultDb.pages, vaultDb.chunks, async () => {
      if (pendingPages.length > 0) await vaultDb.pages.bulkPut(pendingPages);
      if (pendingChunks.length > 0) await vaultDb.chunks.bulkPut(pendingChunks);
      await vaultDb.books.update(bookId, { lastProcessedPage: lastPage });
    });
    pendingPages = [];
    pendingChunks = [];
  };

  for (let pageNum = startPage; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const rawText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    page.cleanup();

    const quality = evaluatePageQuality(rawText);

    pendingPages.push({
      id: `${bookId}_p${pageNum}`,
      bookId,
      pageNumber: pageNum,
      text: rawText,
      textClass: quality.textClass,
    });

    if (rawText.length > 0 && quality.textClass !== 'garbled') {
      const pageChunks = createChunks({
        bookId,
        sectionId: null,
        text: rawText,
        startPage: pageNum,
        endPage: pageNum,
      });

      for (const ch of pageChunks) {
        ordinal += 1;
        pendingChunks.push({
          id: `${bookId}_c${ordinal}`,
          bookId,
          ordinal,
          text: ch.text,
          pdfPageStart: ch.pdfPageStart,
          pdfPageEnd: ch.pdfPageEnd,
        });
      }
    }

    if (pageNum % BATCH_PAGES === 0 || pageNum === totalPages) {
      await flush(pageNum);
    }

    if (onProgress) onProgress(pageNum, totalPages);
  }

  await vaultDb.books.update(bookId, { status: 'complete', lastProcessedPage: totalPages });
  return bookId;
}

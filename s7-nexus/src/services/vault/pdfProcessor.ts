import * as pdfjsLib from 'pdfjs-dist';
import { evaluatePageQuality } from '../../engines/vault/pageQuality';
import { createChunks } from '../../engines/vault/chunk';
import { vaultDb, PageRecord, ChunkRecord } from '../../vault/io/db';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const CHECKPOINT_KEY = 's7_nexus_pdf_resume_checkpoint';

interface CheckpointState {
  bookId: string;
  lastProcessedPage: number;
  totalPages: number;
}

export function getSavedCheckpoint(): CheckpointState | null {
  const raw = localStorage.getItem(CHECKPOINT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function processAndStorePdf(
  file: File,
  subjectId: string,
  title: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  let checkpoint = getSavedCheckpoint();
  let bookId: string;
  let startPage = 1;

  const pageRecords: PageRecord[] = [];
  const chunkRecords: ChunkRecord[] = [];
  let globalOrdinal = 1;

  if (checkpoint && checkpoint.totalPages === totalPages) {
    bookId = checkpoint.bookId;
    startPage = checkpoint.lastProcessedPage + 1;
    // استرجاع المقاطع والصفحات الموجودة مسبقاً إذا لزم
  } else {
    bookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  for (let pageNum = startPage; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const rawText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();

    const quality = evaluatePageQuality(rawText);

    pageRecords.push({
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
        chunkRecords.push({
          id: `${bookId}_c${globalOrdinal++}`,
          bookId,
          ordinal: globalOrdinal,
          text: ch.text,
          pdfPageStart: ch.pdfPageStart,
          pdfPageEnd: ch.pdfPageEnd,
        });
      }
    }

    // حفظ تقدم كل صفحة في الـ Checkpoint وفي قاعدة البيانات تدريجياً
    localStorage.setItem(
      CHECKPOINT_KEY,
      JSON.stringify({ bookId, lastProcessedPage: pageNum, totalPages })
    );

    if (onProgress) {
      onProgress(pageNum, totalPages);
    }
  }

  await vaultDb.transaction('rw', vaultDb.books, vaultDb.pages, vaultDb.chunks, async () => {
    if (startPage === 1) {
      await vaultDb.books.add({
        id: bookId,
        title: title || file.name.replace(/\.pdf$/i, ''),
        subjectId,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: Date.now(),
      });
    }
    if (pageRecords.length > 0) await vaultDb.pages.bulkPut(pageRecords);
    if (chunkRecords.length > 0) await vaultDb.chunks.bulkPut(chunkRecords);
  });

  // تنظيف نقطة الاختيار بعد الاكتمال الناجح
  localStorage.removeItem(CHECKPOINT_KEY);

  return bookId;
}

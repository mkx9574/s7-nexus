import Dexie, { Table } from 'dexie';

export interface BookRecord {
  id: string;
  title: string;
  subjectId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  // حقول أُضيفت في النسخة 2 من القاعدة. غيابها يعني كتاباً قديماً مكتملاً.
  status?: 'processing' | 'complete';
  lastProcessedPage?: number;
  totalPages?: number;
  fileHash?: string;
}

export interface PageRecord {
  id: string;
  bookId: string;
  pageNumber: number;
  text: string;
  textClass: string;
}

export interface ChunkRecord {
  id: string;
  bookId: string;
  ordinal: number;
  text: string;
  pdfPageStart: number;
  pdfPageEnd: number;
}

// نسخة ملف PDF الأصلي، محفوظة محلياً ليبقى المرجع الأصلي متاحاً
export interface FileRecord {
  id: string; // نفس bookId
  blob: Blob;
}

export class S7VaultDatabase extends Dexie {
  books!: Table<BookRecord, string>;
  pages!: Table<PageRecord, string>;
  chunks!: Table<ChunkRecord, string>;
  files!: Table<FileRecord, string>;

  constructor() {
    super('S7VaultDB');
    this.version(1).stores({
      books: 'id, subjectId, title',
      pages: 'id, bookId, pageNumber',
      chunks: 'id, bookId, ordinal'
    });
    this.version(2)
      .stores({
        books: 'id, subjectId, title, fileHash, status',
        pages: 'id, bookId, pageNumber',
        chunks: 'id, bookId, ordinal',
        files: 'id'
      })
      .upgrade((tx) =>
        // الكتب الموجودة قبل الترقية تُعتبر مكتملة؛ لا نغيّر بياناتها غير ذلك
        tx
          .table('books')
          .toCollection()
          .modify((b: any) => {
            if (!b.status) b.status = 'complete';
          })
      );
  }
}

export const vaultDb = new S7VaultDatabase();

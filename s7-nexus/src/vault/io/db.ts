import Dexie, { Table } from 'dexie';

export interface BookRecord {
  id: string;
  title: string;
  subjectId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
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

export class S7VaultDatabase extends Dexie {
  books!: Table<BookRecord, string>;
  pages!: Table<PageRecord, string>;
  chunks!: Table<ChunkRecord, string>;

  constructor() {
    super('S7VaultDB');
    this.version(1).stores({
      books: 'id, subjectId, title',
      pages: 'id, bookId, pageNumber',
      chunks: 'id, bookId, ordinal'
    });
  }
}

export const vaultDb = new S7VaultDatabase();

import { vaultDb, BookRecord, PageRecord, ChunkRecord } from './db';

interface VaultBackupSchema {
  version: number;
  timestamp: number;
  books: BookRecord[];
  pages: PageRecord[];
  chunks: ChunkRecord[];
}

// تصدير قاعدة البيانات إلى ملف JSON محلي
export async function exportVaultBackup(): Promise<string> {
  const books = await vaultDb.books.toArray();
  const pages = await vaultDb.pages.toArray();
  const chunks = await vaultDb.chunks.toArray();

  const backupData: VaultBackupSchema = {
    version: 1,
    timestamp: Date.now(),
    books,
    pages,
    chunks,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `s7_nexus_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return `تم تصدير ${books.length} كتاب و ${pages.length} صفحة بنجاح.`;
}

// استيراد النسخة الاحتياطية مع التحقق من السلامة
export async function importVaultBackup(file: File): Promise<string> {
  const text = await file.text();
  let data: VaultBackupSchema;

  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('ملف النسخة الاحتياطية تالف أو غير صالح (JSON غير مكرر).');
  }

  if (!data.version || !Array.isArray(data.books) || !Array.isArray(data.pages) || !Array.isArray(data.chunks)) {
    throw new Error('هيكل ملف النسخة الاحتياطية غير مطابقة لنظام S7 NEXUS.');
  }

  // إدخال البيانات في قاعدة البيانات المحلية بأمان
  await vaultDb.transaction('rw', vaultDb.books, vaultDb.pages, vaultDb.chunks, async () => {
    await vaultDb.books.clear();
    await vaultDb.pages.clear();
    await vaultDb.chunks.clear();

    if (data.books.length > 0) await vaultDb.books.bulkAdd(data.books);
    if (data.pages.length > 0) await vaultDb.pages.bulkAdd(data.pages);
    if (data.chunks.length > 0) await vaultDb.chunks.bulkAdd(data.chunks);
  });

  return `تم استعادة النسخة بنجاح: ${data.books.length} كتاب.`;
}

// فحص السجلات اليتيمة أو التالفة وتنظيفها
export async function cleanOrphanRecords(): Promise<string> {
  const books = await vaultDb.books.toArray();
  const validBookIds = new Set(books.map(b => b.id));

  const allPages = await vaultDb.pages.toArray();
  const orphanPages = allPages.filter(p => !validBookIds.has(p.bookId));

  const allChunks = await vaultDb.chunks.toArray();
  const orphanChunks = allChunks.filter(c => !validBookIds.has(c.bookId));

  if (orphanPages.length > 0) {
    await vaultDb.pages.bulkDelete(orphanPages.map(p => p.id));
  }
  if (orphanChunks.length > 0) {
    await vaultDb.chunks.bulkDelete(orphanChunks.map(c => c.id));
  }

  return `تم تنظيف ${orphanPages.length} صفحة يتيمة و ${orphanChunks.length} مقطع تالف بنجاح.`;
}

import React, { useState, useEffect } from 'react';
import { vaultDb, BookRecord } from './io/db';
import { processAndStorePdf } from '../services/vault/pdfProcessor';

export const KnowledgeVaultView: React.FC = () => {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const loadBooks = async () => {
    const allBooks = await vaultDb.books.toArray();
    setBooks(allBooks);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await processAndStorePdf(file, 'general', file.name, (curr, total) => {
        setProgress({ current: curr, total: total });
      });
      await loadBooks();
    } catch (err) {
      console.error('Error processing PDF:', err);
      alert('حدث خطأ أثناء معالجة ملف الـ PDF');
    } finally {
      setUploading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="p-4 space-y-6 text-right" style={{ backgroundColor: '#050a05', color: '#e2fee2', minHeight: '100vh' }}>
      <div className="border border-[#00ff66]/30 p-4 rounded-lg bg-[#0a140a] shadow-[0_0_15px_rgba(0,255,102,0.1)]">
        <h2 className="text-xl font-bold text-[#00ff66] mb-2">خزنة المعرفة (Knowledge Vault)</h2>
        <p className="text-sm text-[#8fa88f] mb-4">فهرسة ومعالجة كتب المنهج السوداني محلياً بالكامل بصيغة PDF.</p>

        <label className="inline-block bg-[#00ff66] text-[#050a05] font-bold px-4 py-2 rounded cursor-pointer hover:bg-[#00cc52] transition-all">
          {uploading ? `جاري المعالجة (${progress.current}/${progress.total})...` : 'رفع وفهرسة كتاب PDF جديد'}
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#00ff66]">الكتب المرفوعة محلياً ({books.length})</h3>
        {books.length === 0 ? (
          <p className="text-sm text-[#8fa88f]">لا توجد كتب في الخزنة حتى الآن. ابدأ برفع أول كتاب!</p>
        ) : (
          <div className="grid gap-3">
            {books.map((book) => (
              <div key={book.id} className="border border-[#00ff66]/20 p-3 rounded bg-[#0a140a] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#e2fee2]">{book.title}</h4>
                  <span className="text-xs text-[#8fa88f]">الحجم: {(book.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">مفهرس محلياً</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

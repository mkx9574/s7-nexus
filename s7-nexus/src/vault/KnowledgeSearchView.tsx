import React, { useState, useEffect } from 'react';
import { vaultDb, BookRecord } from './io/db';
import { searchVault } from '../engines/vault/searchEngine';
import { exportVaultBackup, importVaultBackup, cleanOrphanRecords } from './io/vaultBackup';

export const KnowledgeSearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    vaultDb.books.toArray().then(setBooks);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchVault(query);
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const msg = await exportVaultBackup();
      setStatusMsg(msg);
    } catch (err: any) {
      setStatusMsg(`خطأ في التصدير: ${err.message}`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const msg = await importVaultBackup(file);
      setStatusMsg(msg);
      const allBooks = await vaultDb.books.toArray();
      setBooks(allBooks);
    } catch (err: any) {
      setStatusMsg(`خطأ في الاستيراد: ${err.message}`);
    }
  };

  const handleClean = async () => {
    try {
      const msg = await cleanOrphanRecords();
      setStatusMsg(msg);
    } catch (err: any) {
      setStatusMsg(`خطأ في التنظيف: ${err.message}`);
    }
  };

  return (
    <div className="p-4 space-y-6 text-right" style={{ backgroundColor: '#050a05', color: '#e2fee2', minHeight: '100vh' }}>
      {/* أداة البحث في الخزنة */}
      <div className="border border-[#00ff66]/30 p-4 rounded-lg bg-[#0a140a] shadow-[0_0_15px_rgba(0,255,102,0.1)]">
        <h2 className="text-xl font-bold text-[#00ff66] mb-2">البحث الذكي في خزنة المعرفة</h2>
        <p className="text-sm text-[#8fa88f] mb-4">ابحث عن أي مصطلح أو قانون أو درس داخل كتب الشهادة السودانية المفهرسة محلياً.</p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة للبحث (مثال: الفيزياء، قوانين نيوتن...)"
            className="flex-1 bg-[#050a05] border border-[#00ff66]/30 rounded px-3 py-2 text-[#e2fee2] focus:outline-none focus:border-[#00ff66]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#00ff66] text-[#050a05] font-bold px-5 py-2 rounded hover:bg-[#00cc52] transition-all"
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
      </div>

      {/* أزرار الصيانة والنسخ الاحتياطي */}
      <div className="border border-[#00ff66]/20 p-4 rounded-lg bg-[#0a140a] flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="text-xs bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 px-3 py-2 rounded hover:bg-[#00ff66]/20"
          >
            تصدير نسخة احتياطية (JSON)
          </button>

          <label className="text-xs bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 px-3 py-2 rounded cursor-pointer hover:bg-[#00ff66]/20">
            استعادة نسخة احتياطية
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>

          <button
            onClick={handleClean}
            className="text-xs bg-[#ff3333]/10 text-[#ff4444] border border-[#ff3333]/30 px-3 py-2 rounded hover:bg-[#ff3333]/20"
          >
            فحص وتنظيف البيانات التالفة
          </button>
        </div>

        {statusMsg && <span className="text-xs text-[#00ff66]">{statusMsg}</span>}
      </div>

      {/* عرض نتائج البحث */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#00ff66]">نتائج البحث ({results.length})</h3>
        {results.length === 0 ? (
          <p className="text-sm text-[#8fa88f]">لا توجد نتائج مطابقة. أدخل كلمة مفتاحية واضغط بحث.</p>
        ) : (
          <div className="grid gap-3">
            {results.map((item, idx) => {
              const book = books.find((b) => b.id === item.bookId);
              return (
                <div key={idx} className="border border-[#00ff66]/20 p-3 rounded bg-[#0a140a] space-y-1">
                  <div className="flex justify-between items-center text-xs text-[#8fa88f]">
                    <span>الكتاب: {book?.title || item.bookId}</span>
                    <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                      الصفحة: {item.pdfPageStart}
                    </span>
                  </div>
                  <p className="text-sm text-[#e2fee2]">{item.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

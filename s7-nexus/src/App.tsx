import React, { useState } from 'react';
import { KnowledgeVaultView } from './vault/KnowledgeVaultView';
import { KnowledgeSearchView } from './vault/KnowledgeSearchView';

export function App() {
  const [activeTab, setActiveTab] = useState<'vault' | 'search'>('vault');

  return (
    <div className="min-h-screen bg-[#050a05] text-[#e2fee2] flex flex-col font-sans">
      {/* شريط العنوان العلوي */}
      <header className="border-b border-[#00ff66]/30 p-4 bg-[#0a140a] flex justify-between items-center shadow-[0_0_10px_rgba(0,255,102,0.1)]">
        <h1 className="text-xl font-extrabold text-[#00ff66] tracking-wider">S7 NEXUS</h1>
        <span className="text-xs px-3 py-1 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
          خزنة المعرفة المحلية
        </span>
      </header>

      {/* أزرار التنقل بين رفع الكتب والبحث الذكي */}
      <nav className="flex border-b border-[#00ff66]/20 bg-[#0a140a]/50">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex-1 py-3 text-center text-sm font-bold transition-all ${
            activeTab === 'vault'
              ? 'bg-[#00ff66]/10 text-[#00ff66] border-b-2 border-[#00ff66]'
              : 'text-[#8fa88f] hover:text-[#00ff66]'
          }`}
        >
          إدارة ورفع الكتب
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 text-center text-sm font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-[#00ff66]/10 text-[#00ff66] border-b-2 border-[#00ff66]'
              : 'text-[#8fa88f] hover:text-[#00ff66]'
          }`}
        >
          البحث الذكي في النصوص
        </button>
      </nav>

      {/* محتوى الشاشة النشطة */}
      <main className="flex-1">
        {activeTab === 'vault' ? <KnowledgeVaultView /> : <KnowledgeSearchView />}
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react'
import { KnowledgeVaultView } from './KnowledgeVaultView'
import { KnowledgeSearchView } from './KnowledgeSearchView'

type Tab = 'books' | 'search'

const TABS: { id: Tab; label: string }[] = [
  { id: 'books', label: 'إدارة ورفع الكتب' },
  { id: 'search', label: 'البحث والنسخ الاحتياطي' },
]

export default function VaultPage() {
  const [tab, setTab] = useState<Tab>('books')
  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-line overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-bold transition ${
              tab === t.id ? 'bg-cyan/15 text-cyan' : 'text-mute hover:bg-line/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'books' ? <KnowledgeVaultView /> : <KnowledgeSearchView />}
    </div>
  )
}

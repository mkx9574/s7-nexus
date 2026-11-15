import { useState, ReactNode } from 'react'
import { PAGES } from '../lib/nav'
import { useUI } from '../store/ui'

export default function Layout({ children }: { children: ReactNode }) {
  const { page, setPage } = useUI()
  const [open, setOpen] = useState(false)
  const nav = (
    <nav className="flex flex-col gap-1 p-3 overflow-y-auto">
      {PAGES.map((p, i) => (
        <button key={p.id} onClick={() => { setPage(p.id); setOpen(false) }}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm transition ${
            page === p.id ? 'bg-cyan/15 text-cyan' : 'text-mute hover:bg-line/40'}`}>
          <span className="w-5 text-xs opacity-60">{i + 1}</span>{p.label}
        </button>
      ))}
    </nav>
  )
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col border-l border-line bg-panel/60 h-screen sticky top-0">
        <div className="p-5 text-xl font-bold text-cyan">S7 NEXUS</div>{nav}
      </aside>
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between bg-panel border-b border-line px-4 py-3">
        <span className="font-bold text-cyan">S7 NEXUS</span>
        <button aria-label="القائمة" onClick={() => setOpen(true)} className="px-3 py-1 rounded-lg border border-line">☰</button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-panel overflow-y-auto" onClick={(e) => e.stopPropagation()}>{nav}</div>
        </div>
      )}
      <main className="flex-1 p-4 lg:p-8 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  )
}

import { create } from 'zustand'
import { PageId } from '../lib/nav'
interface UI { page: PageId; setPage: (p: PageId) => void }
export const useUI = create<UI>((set) => ({ page: 'command', setPage: (page) => set({ page }) }))

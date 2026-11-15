import Layout from './components/Layout'
import CommandCenter from './pages/CommandCenter'
import Placeholder from './pages/Placeholder'
import VaultPage from './vault/VaultPage'
import { PAGES } from './lib/nav'
import { useUI } from './store/ui'

export default function App() {
  const page = useUI((s) => s.page)
  const meta = PAGES.find((p) => p.id === page)!
  return (
    <Layout>
      {page === 'command' ? (
        <CommandCenter />
      ) : page === 'vault' ? (
        <VaultPage />
      ) : (
        <Placeholder title={meta.label} phase={meta.phase} />
      )}
    </Layout>
  )
}

import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anton'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles.css'
import App from './App'

/* Roteamento mínimo por pathname (SPA, sem router).
   Propostas e área de clientes são lazy: o bundle da home não carrega nada delas. */
const ProposalPage = lazy(() => import('./proposal/ProposalPage'))
const ClientArea = lazy(() => import('./client/ClientArea'))

const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()
const isProposal = path === '/propostas/galpaoanimal'
const isClientArea = path === '/client' || path.startsWith('/client/')

createRoot(document.getElementById('root')!).render(
  isClientArea ? (
    <Suspense fallback={null}>
      <ClientArea />
    </Suspense>
  ) : isProposal ? (
    <Suspense fallback={null}>
      <ProposalPage />
    </Suspense>
  ) : (
    <App />
  ),
)

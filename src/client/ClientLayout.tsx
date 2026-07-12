import type { ReactNode } from 'react'
import Grain from '../components/Grain'

/** Shell das páginas da área de clientes: header compacto + fundo + footer.
 *  Preparado para evoluir em dashboard do cliente. */
export default function ClientLayout({
  clientName,
  deliveryType,
  monthLabel,
  onLock,
  authBadge,
  children,
}: {
  clientName: string
  deliveryType: string
  monthLabel: string
  onLock?: () => void
  /** Exibe o indicador "Ambiente privado · Autenticado" na top bar (hub) */
  authBadge?: boolean
  children: ReactNode
}) {
  return (
    <div className="mv-client">
      <Grain />
      <div className="mv-bg" aria-hidden="true">
        <div className="mv-bg-grid" />
        <div className="mv-bg-glow" />
      </div>

      <header className="mv-header">
        <a className="mv-brand" href="/" aria-label="Mayven — página inicial">
          <img className="mv-mark" src="/brand/mayven-mark.png" alt="" />
          <span className="mv-word">MAYVEN</span>
        </a>
        <p className="mv-header-ctx mono">
          <span className="mv-dot" aria-hidden="true" />
          {clientName.toUpperCase()} · {deliveryType.toUpperCase()} · {monthLabel.toUpperCase()}
        </p>
        <div className="mv-header-right">
          {authBadge && (
            <p className="mv-auth mono" aria-label="Sessão autenticada em ambiente privado">
              <span className="mv-auth-dot" aria-hidden="true" />
              AMBIENTE PRIVADO · AUTENTICADO
            </p>
          )}
          {onLock && (
            <button type="button" className="mv-lock mono" onClick={onLock} aria-label="Sair da área do cliente">
              Sair
            </button>
          )}
        </div>
      </header>

      <main className="mv-main">{children}</main>

      <footer className="mv-footer">
        <p className="mono">MAYVEN — CREATIVE TECH MEDIA COMPANY</p>
        <p className="mono mv-footer-muted">Entrega digital privada · {clientName} · {monthLabel}</p>
      </footer>
    </div>
  )
}

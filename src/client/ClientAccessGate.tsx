import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Grain from '../components/Grain'
import { trackReportEvent } from '../lib/reportAnalytics'

/** Gate de acesso da área de clientes (MVP comercial, não é segurança real).
 *  Organizado para futura troca por Firebase Auth + permissões por cliente:
 *  basta substituir a validação em `tryUnlock` e o storage por sessão real. */
export default function ClientAccessGate({
  accessCode,
  storageKey,
  clientName,
  contextLabel,
  children,
}: {
  accessCode: string
  storageKey: string
  clientName: string
  contextLabel: string
  children: (controls: { lock: () => void }) => ReactNode
}) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'granted'
    } catch {
      return false
    }
  })
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!unlocked) {
      trackReportEvent('client_gate_viewed', { client: clientName, context: contextLabel })
      inputRef.current?.focus()
    }
  }, [unlocked, clientName, contextLabel])

  const tryUnlock = () => {
    const normalized = code.trim().replace(/\s+/g, '')
    if (!normalized) return
    if (normalized.toUpperCase() === accessCode.toUpperCase()) {
      try {
        localStorage.setItem(storageKey, 'granted')
      } catch {
        /* storage indisponível — libera só nesta visita */
      }
      trackReportEvent('client_access_granted', { client: clientName, context: contextLabel })
      setUnlocked(true)
    } else {
      trackReportEvent('client_access_denied', { client: clientName, context: contextLabel })
      setErrorMsg('Código inválido. Verifique o código recebido e tente novamente.')
      inputRef.current?.focus()
    }
  }

  const lock = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
    trackReportEvent('session_locked', { client: clientName, context: contextLabel })
    setCode('')
    setErrorMsg('')
    setUnlocked(false)
    window.scrollTo(0, 0)
  }

  if (unlocked) return <>{children({ lock })}</>

  return (
    <div className="mv-gate">
      <Grain />
      <div className="mv-bg" aria-hidden="true">
        <div className="mv-bg-grid" />
        <div className="mv-bg-glow" />
      </div>
      <main className="mv-gate-card" aria-label={`Acesso ao report de ${clientName}`}>
        <div className="mv-gate-brand">
          <img className="mv-mark" src="/brand/mayven-mark.png" alt="" />
          <span className="mv-word">MAYVEN</span>
        </div>
        <p className="mv-eyebrow mono">
          <span className="mv-dot" aria-hidden="true" /> ÁREA DO CLIENTE · {clientName.toUpperCase()}
        </p>
        <h1 className="mv-gate-title">Acesso ao Report</h1>
        <p className="mv-gate-sub">
          Esta é uma entrega digital privada da Mayven para {clientName} — {contextLabel}. Insira o
          código de acesso enviado pela nossa equipe.
        </p>
        <form
          className="mv-gate-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            tryUnlock()
          }}
        >
          <label className="mv-visually-hidden" htmlFor="mv-gate-code">
            Código de acesso
          </label>
          <input
            ref={inputRef}
            id="mv-gate-code"
            className="mv-gate-input"
            type="password"
            autoComplete="off"
            autoFocus
            placeholder="Digite o código de acesso"
            value={code}
            aria-invalid={!!errorMsg}
            aria-describedby={errorMsg ? 'mv-gate-error' : undefined}
            onChange={(e) => {
              setCode(e.target.value)
              if (errorMsg) setErrorMsg('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                tryUnlock()
              }
            }}
          />
          <button className="mv-btn mv-btn-primary" type="submit" disabled={!code.trim()}>
            Acessar report
          </button>
        </form>
        <p id="mv-gate-error" className="mv-gate-error" role="alert" aria-live="polite">
          {errorMsg}
        </p>
        <p className="mv-micro mono">Conteúdo privado · Mayven</p>
      </main>
    </div>
  )
}

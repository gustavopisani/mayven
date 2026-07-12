import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Grain from '../components/Grain'
import { trackProposalEvent } from '../lib/analytics'

type AccessCodeGateProps = {
  /** Hash SHA-256 (hex) do código correto — o código em si nunca vai ao bundle */
  expectedHash: string
  /** Chave do localStorage que guarda o acesso liberado */
  storageKey: string
  proposalName: string
  eyebrow: string
  title: string
  description: string
  placeholder: string
  button: string
  error: string
  unsupported: string
  microcopy: string
  lockLabel: string
  children: ReactNode
}

const sha256Hex = async (text: string) => {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Barreira client-side por código fixo. Não é autenticação real —
 *  apenas evita acesso casual ao link da proposta (V1). */
export default function AccessCodeGate(props: AccessCodeGateProps) {
  const [unlocked, setUnlocked] = useState(() => readStorage(props.storageKey) === props.expectedHash)
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [checking, setChecking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!unlocked) inputRef.current?.focus()
  }, [unlocked])

  const tryUnlock = async () => {
    const normalized = code.trim().replace(/\s+/g, ' ')
    if (!normalized || checking) return
    if (!window.crypto?.subtle) {
      setErrorMsg(props.unsupported)
      return
    }
    setChecking(true)
    try {
      const hash = await sha256Hex(normalized)
      if (hash === props.expectedHash) {
        try {
          localStorage.setItem(props.storageKey, props.expectedHash)
        } catch {
          /* storage indisponível (modo privado restrito) — libera só nesta visita */
        }
        trackProposalEvent('cta_clicked', { cta: 'access_granted', proposal: props.proposalName })
        setUnlocked(true)
      } else {
        setErrorMsg(props.error)
        inputRef.current?.focus()
      }
    } finally {
      setChecking(false)
    }
  }

  const lock = () => {
    try {
      localStorage.removeItem(props.storageKey)
    } catch {
      /* ignore */
    }
    setCode('')
    setErrorMsg('')
    setUnlocked(false)
    window.scrollTo(0, 0)
  }

  if (unlocked)
    return (
      <>
        {props.children}
        <div className="pp-gate-lockbar">
          <button type="button" className="pp-gate-lock mono" onClick={lock}>
            {props.lockLabel}
          </button>
        </div>
      </>
    )

  return (
    <div className="pp-gate">
      <Grain />
      <div className="pp-bg" aria-hidden="true">
        <div className="pp-bg-grid" />
        <div className="pp-bg-glow" />
      </div>
      <main className="pp-gate-card" aria-label={`Acesso à proposta ${props.proposalName}`}>
        <div className="pp-gate-brand">
          <img className="pp-mark" src="/brand/mayven-mark.png" alt="" />
          <span className="pp-word">MAYVEN</span>
        </div>
        <p className="pp-eyebrow mono">
          <span className="pp-private-dot" aria-hidden="true" /> {props.eyebrow}
        </p>
        <h1 className="pp-gate-title">{props.title}</h1>
        <p className="pp-copy">{props.description}</p>
        <form
          className="pp-gate-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            void tryUnlock()
          }}
        >
          <label className="pp-visually-hidden" htmlFor="pp-gate-code">
            Código de acesso
          </label>
          <input
            ref={inputRef}
            id="pp-gate-code"
            className="pp-gate-input"
            type="password"
            autoComplete="off"
            autoFocus
            placeholder={props.placeholder}
            value={code}
            aria-invalid={!!errorMsg}
            aria-describedby={errorMsg ? 'pp-gate-error' : undefined}
            onChange={(e) => {
              setCode(e.target.value)
              if (errorMsg) setErrorMsg('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void tryUnlock()
              }
            }}
          />
          <button className="btn btn-primary pp-gate-btn" type="submit" disabled={!code.trim() || checking}>
            {checking ? 'Verificando…' : props.button}
          </button>
        </form>
        <p id="pp-gate-error" className="pp-gate-error" role="alert" aria-live="polite">
          {errorMsg}
        </p>
        <p className="pp-micro mono">{props.microcopy}</p>
      </main>
    </div>
  )
}

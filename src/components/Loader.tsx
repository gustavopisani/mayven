import { useEffect, useRef, useState } from 'react'

/** SYSTEM INITIALIZATION — a real loader: waits for fonts + the hero scene chunk.
 *  Min 700ms so it reads as a moment, max 2500ms so it never holds the user hostage. */
const STATUS = ['INITIALIZING SIGNAL', 'CALIBRATING SYSTEM', 'LOADING MAYVEN', 'SYSTEM READY']

export default function Loader({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState(0)
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    const t0 = performance.now()

    // real load signals: fonts + hero chunk (same specifier = shared cache with Hero's lazy import)
    const jobs: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()]
    if (window.innerWidth > 860 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      jobs.push(import('../three/HeroScene').catch(() => {}))
    }
    let realDone = false
    Promise.all(jobs).then(() => (realDone = true))
    const hardTimeout = setTimeout(() => (realDone = true), 2500)

    let p = 0
    const finish = () => {
      if (done.current) return
      done.current = true
      setStatus(STATUS.length - 1)
      setLeaving(true)
      ;(window as unknown as { __mayvenReady?: boolean }).__mayvenReady = true
      window.dispatchEvent(new Event('mayven:ready'))
      setTimeout(onDone, 650) // matches the CSS exit transition
    }
    const tick = () => {
      const elapsed = performance.now() - t0
      // progress: eased toward 90% while loading, releases to 100 when real work finishes (after min time)
      const target = realDone && elapsed > 700 ? 100 : Math.min(90, (elapsed / 1400) * 90)
      p = Math.min(target, p + (target - p) * 0.12 + 0.6) // converges to target, never overshoots
      setPct(p)
      setStatus((s) => Math.max(s, Math.min(STATUS.length - 2, Math.floor(elapsed / 420))))
      if (p >= 99.5) {
        clearInterval(iv) // stop ticking — the exit transition takes over
        finish()
      }
    }
    // interval (not rAF): keeps progressing even in background/occluded tabs
    const iv = setInterval(tick, 50)

    return () => {
      clearInterval(iv)
      clearTimeout(hardTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`loader ${leaving ? 'is-leaving' : ''}`} role="status" aria-label="Carregando MAYVEN">
      <div className="loader-word" aria-hidden="true">
        {'MAYVEN'.split('').map((c, i) => (
          <span key={i} style={{ ['--i' as string]: i }}>
            {c}
          </span>
        ))}
      </div>
      <div className="loader-meta mono" aria-hidden="true">
        <span className="loader-status">{STATUS[status]}</span>
        <span className="loader-pct">{String(Math.round(pct)).padStart(3, '0')}%</span>
      </div>
      <i className="loader-bar" style={{ ['--p' as string]: pct / 100 }} aria-hidden="true" />
    </div>
  )
}

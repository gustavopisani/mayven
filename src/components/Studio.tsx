import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useIsMobile, useReducedMotion } from '../lib/ui'

const LINES = [
  'We don’t make noise. We build signal.',
  'Menos volume. Mais presença.',
  'Menos template. Mais engenharia criativa.',
  'Menos agência tradicional. Mais sistema vivo.',
]

/* screen content variants for the command-room wall */
const SCREENS = ['bars', 'wave', 'nodes', 'grid', 'bars', 'scan', 'wave', 'grid', 'nodes', 'bars', 'scan', 'wave']

function Screen({ kind, i }: { kind: string; i: number }) {
  return (
    <div className={`ops-screen ops-${kind}`} style={{ ['--i' as string]: i }} aria-hidden="true">
      {kind === 'bars' && (
        <>
          <b /><b /><b /><b />
        </>
      )}
      {kind === 'wave' && (
        <svg viewBox="0 0 60 24">
          <polyline points="0,18 10,14 18,16 28,8 38,12 48,5 60,9" fill="none" />
        </svg>
      )}
      {kind === 'nodes' && (
        <svg viewBox="0 0 60 24">
          <line x1="8" y1="12" x2="30" y2="6" />
          <line x1="30" y1="6" x2="52" y2="14" />
          <line x1="8" y1="12" x2="30" y2="19" />
          <circle cx="8" cy="12" r="2.4" />
          <circle cx="30" cy="6" r="2.4" />
          <circle cx="30" cy="19" r="2.4" />
          <circle cx="52" cy="14" r="2.4" />
        </svg>
      )}
      {kind === 'grid' && <i className="ops-gridfill" />}
      {kind === 'scan' && <i className="ops-scanline" />}
      <span className="ops-led" />
    </div>
  )
}

export default function Studio() {
  const secRef = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (mobile || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.studio-line',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.18,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.studio-lines', start: 'top 78%' },
        },
      )
      // the wall drifts slightly against scroll — depth without a video
      gsap.to('.ops-wall', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: secRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, secRef)
    return () => ctx.revert()
  }, [mobile, reduced])

  return (
    <section ref={secRef} id="studio" className="studio">
      {/* SIGNAL COMMAND ROOM — procedural, no video, no logo */}
      <div className="ops" aria-hidden="true">
        <div className="ops-wall">
          {SCREENS.map((k, i) => (
            <Screen kind={k} i={i} key={i} />
          ))}
        </div>
        <i className="ops-beam ops-beam-a" />
        <i className="ops-beam ops-beam-b" />
        <i className="ops-haze" />
        <i className="ops-floor" />
      </div>
      <div className="studio-shade" aria-hidden="true" />

      <div className="studio-inner">
        <p className="sec-eyebrow mono">07 — STUDIO</p>
        <h2 className="sec-title">
          Small team. <em>Heavy signal.</em>
        </h2>
        <p className="sec-copy">
          Estratégia, criação, tecnologia e mídia trabalhando como um único sistema.
        </p>
        <ul className="studio-lines">
          {LINES.map((l) => (
            <li className="studio-line" key={l}>
              <span className="mono" aria-hidden="true">
                →
              </span>{' '}
              {l}
            </li>
          ))}
        </ul>
      </div>
      <div className="hud hud-br mono">SP · REMOTE · NIGHT SHIFT ●</div>
    </section>
  )
}

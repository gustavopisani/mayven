import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Magnetic, useIsMobile, useReducedMotion } from '../lib/ui'

/** BRAND GRAVITY FIELD — an abstract force field of digital presence.
 *  No logo. Rings, converging particles, light beams, a luminous core. */
export default function FooterCta() {
  const secRef = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (mobile || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.foot-head',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: secRef.current, start: 'top 70%' },
        },
      )
      // the field slowly intensifies as you arrive
      gsap.fromTo(
        '.gravity',
        { opacity: 0.5, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: secRef.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      )
    }, secRef)
    return () => ctx.revert()
  }, [mobile, reduced])

  return (
    <footer ref={secRef} id="contact" className="foot">
      <div className="gravity" aria-hidden="true">
        <i className="grav-core" />
        <svg className="grav-rings" viewBox="0 0 800 800">
          <g className="grav-g grav-g-a">
            <ellipse cx="400" cy="400" rx="180" ry="64" />
            <ellipse cx="400" cy="400" rx="300" ry="106" />
          </g>
          <g className="grav-g grav-g-b">
            <ellipse cx="400" cy="400" rx="240" ry="150" />
            <ellipse cx="400" cy="400" rx="380" ry="240" />
          </g>
        </svg>
        <i className="grav-beam grav-beam-a" />
        <i className="grav-beam grav-beam-b" />
        <div className="grav-glass grav-glass-a" />
        <div className="grav-glass grav-glass-b" />
        <div className="grav-field">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ ['--i' as string]: i }} />
          ))}
        </div>
      </div>

      <div className="foot-inner">
        <p className="mono foot-kicker">LET’S BUILD WHAT COMES NEXT</p>
        <h2 className="foot-head">
          Sua marca parece tão forte quanto <em>o que você entrega?</em>
        </h2>
        <p className="foot-sub">Se a resposta incomoda, talvez a gente precise conversar.</p>
        <div className="foot-ctas">
          <Magnetic>
            <a className="btn btn-primary" href="mailto:hello@mayven.com.br" data-cursor="">
              Start a project
            </a>
          </Magnetic>
          <Magnetic>
            <a className="btn btn-ghost" href="mailto:hello@mayven.com.br" data-cursor="">
              Talk to Mayven
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="foot-meta">
        <div>
          <p className="mono">CONTACT</p>
          <a href="mailto:hello@mayven.com.br" data-cursor="">
            hello@mayven.com.br
          </a>
        </div>
        <div>
          <p className="mono">SOCIAL</p>
          <nav aria-label="Redes sociais">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" data-cursor="">
              Instagram
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" data-cursor="">
              LinkedIn
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" data-cursor="">
              YouTube
            </a>
          </nav>
        </div>
        <div>
          <p className="mono">CLIENTES</p>
          <a href="/client" data-cursor="">
            Área do Cliente →
          </a>
          <p>São Paulo / Remote</p>
        </div>
        <div>
          <p className="mono">MAYVEN</p>
          <p>Creative Tech Media Company</p>
        </div>
      </div>
      <p className="foot-legal mono">© 2026 MAYVEN — SINAL ACIMA DO RUÍDO. FEITO PELA MAYVEN, OBVIAMENTE.</p>
    </footer>
  )
}

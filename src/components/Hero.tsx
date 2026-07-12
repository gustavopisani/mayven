import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Magnetic, scrollToId, useIsMobile, useReducedMotion } from '../lib/ui'
import { DPR_CAP, PARTICLE_BUDGET, input, quality } from '../lib/bus'

const HeroScene = lazy(() => import('../three/HeroScene'))

const TITLE = 'MAYVEN'

const webglOk = () => {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    // static fallback for software renderers / low-power devices
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    return !/swiftshader|llvmpipe|software/i.test(renderer)
  } catch {
    return false
  }
}

export default function Hero() {
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  const secRef = useRef<HTMLElement>(null)
  const [gpu] = useState(() => typeof window !== 'undefined' && webglOk())
  const [sceneActive, setSceneActive] = useState(true)
  const useScene = gpu && !mobile && !reduced

  // pause the render loop when the hero is out of view
  useEffect(() => {
    if (!useScene) return
    const io = new IntersectionObserver(([e]) => setSceneActive(e.isIntersecting), { threshold: 0 })
    io.observe(secRef.current!)
    return () => io.disconnect()
  }, [useScene])

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // the intro waits for the loader — the wordmark hands off into the hero title
      gsap.set('.hero-char', { yPercent: 112, rotate: 4 })
      gsap.set('.hero-fade', { opacity: 0, y: 26 })
      const runIntro = () => {
        gsap.to('.hero-char', { yPercent: 0, rotate: 0, stagger: 0.05, duration: 1.1, ease: 'power4.out', delay: 0.1 })
        gsap.to('.hero-fade', { opacity: 1, y: 0, stagger: 0.09, duration: 0.8, ease: 'power2.out', delay: 0.7 })
      }
      if ((window as unknown as { __mayvenReady?: boolean }).__mayvenReady) runIntro()
      else window.addEventListener('mayven:ready', runIntro, { once: true })
    }, secRef)

    if (mobile) return () => ctx.revert()

    // scroll drives the WebGL object state (rotation, cracks, camera dolly)
    const st = ScrollTrigger.create({
      trigger: secRef.current,
      start: 'top top',
      end: '+=140%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        input().heroP = self.progress
      },
    })

    const mm = (e: MouseEvent) => {
      const inp = input()
      inp.mx = (e.clientX / window.innerWidth - 0.5) * 2
      inp.my = (e.clientY / window.innerHeight - 0.5) * 2
      gsap.to('.hero-inner', { x: inp.mx * -8, y: inp.my * -6, duration: 1.1, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', mm, { passive: true })
    return () => {
      window.removeEventListener('mousemove', mm)
      st.kill()
      ctx.revert()
    }
  }, [mobile, reduced])

  const ctaOn = () => (input().cta = 1)
  const ctaOff = () => (input().cta = 0)

  return (
    <section ref={secRef} id="hero" className="hero">
      {/* procedural first paint + no-WebGL / mobile fallback — no video, no logo */}
      <div className="hero-proc" aria-hidden="true">
        <i className="hero-crack hero-crack-a" />
        <i className="hero-crack hero-crack-b" />
        <i className="hero-leak" />
      </div>
      {useScene && (
        <Suspense fallback={null}>
          <HeroScene active={sceneActive} particleCount={PARTICLE_BUDGET[quality()]} dprCap={DPR_CAP[quality()]} />
        </Suspense>
      )}
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-inner">
        <h1 className="hero-title" aria-label="MAYVEN">
          {TITLE.split('').map((c, i) => (
            <span className="hero-clip" key={i} aria-hidden="true">
              <span className="hero-char">{c}</span>
            </span>
          ))}
          <span className="hero-clip hero-dot" aria-hidden="true">
            <span className="hero-char">.</span>
          </span>
        </h1>
        <p className="hero-headline hero-fade">
          Presença digital para marcas que <em>não nasceram</em> para parecer comuns.
        </p>
        <p className="hero-sub hero-fade">
          Estratégia, mídia, IA, design e engenharia criativa para construir marcas, conteúdos e experiências
          digitais de alta performance.
        </p>
        <div className="hero-ctas hero-fade">
          <Magnetic>
            <a
              className="btn btn-primary"
              href="#contact"
              data-cursor=""
              onMouseEnter={ctaOn}
              onMouseLeave={ctaOff}
              onFocus={ctaOn}
              onBlur={ctaOff}
              onClick={(e) => {
                e.preventDefault()
                scrollToId('contact')
              }}
            >
              Start a project
            </a>
          </Magnetic>
          <Magnetic>
            <a
              className="btn btn-ghost"
              href="#manifesto"
              data-cursor=""
              onMouseEnter={ctaOn}
              onMouseLeave={ctaOff}
              onFocus={ctaOn}
              onBlur={ctaOff}
              onClick={(e) => {
                e.preventDefault()
                scrollToId('manifesto')
              }}
            >
              See the signal ↓
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="hud hud-tl mono hero-fade">CREATIVE TECH MEDIA COMPANY</div>
      <div className="hud hud-tr mono hero-fade">SÃO PAULO · DIGITAL-FIRST · AI-POWERED</div>
      <div className="hud hud-bl mono hero-fade">BRAND · MEDIA · WEBGL · CONTENT · GROWTH</div>
      <div className="hud hud-br mono hero-fade">{useScene ? 'REAL-TIME — WEBGL ●' : 'SIGNAL ●'}</div>
      <div className="hero-scrollcue hero-fade" aria-hidden="true">
        <span className="mono">SCROLL</span>
        <i />
      </div>
    </section>
  )
}

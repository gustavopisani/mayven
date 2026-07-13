import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CH, detectQuality, xstore } from './store'
import HeroPhysicsExperience from './HeroPhysicsExperience'
import './experience.css'

gsap.registerPlugin(ScrollTrigger)

const World = lazy(() => import('./World'))

const HERO_FILMS = {
  desktop: {
    webm: '/assets/video/mayven-hero-desktop.webm',
    mp4: '/assets/video/mayven-hero-desktop.mp4',
    poster: '/assets/video/mayven-hero-poster-desktop.webp',
  },
  mobile: {
    webm: '/assets/video/mayven-hero-mobile.webm',
    mp4: '/assets/video/mayven-hero-mobile.mp4',
    poster: '/assets/video/mayven-hero-poster-mobile.webp',
  },
} as const

function useHeroVariant() {
  const getVariant = () => {
    if (typeof window === 'undefined') return 'desktop' as const
    return window.matchMedia('(max-width: 860px), (orientation: portrait)').matches ? 'mobile' : 'desktop'
  }
  const [variant, setVariant] = useState<'desktop' | 'mobile'>(getVariant)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px), (orientation: portrait)')
    const update = () => setVariant(mq.matches ? 'mobile' : 'desktop')
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return variant
}

function usePrefersReducedMotion() {
  const getReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [reduced, setReduced] = useState(getReduced)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

function HeroFilm() {
  const variant = useHeroVariant()
  const reduced = usePrefersReducedMotion()
  const film = HERO_FILMS[variant]
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    setReady(false)
    setBlocked(false)
  }, [variant])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced) return
    let inView = true
    const syncPlayback = () => {
      if (document.hidden || !inView) {
        video.pause()
        return
      }
      video.play().then(() => setBlocked(false)).catch(() => setBlocked(true))
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        syncPlayback()
      },
      { threshold: 0.01 },
    )
    io.observe(video)
    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [reduced, variant])

  return (
    <div className={`x-hero-film ${ready ? 'is-ready' : ''} ${blocked ? 'is-blocked' : ''}`} aria-hidden="true">
      <img className="x-hero-poster" src={film.poster} alt="" decoding="async" />
      {!reduced && (
        <video
          key={variant}
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={film.poster}
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
        >
          <source src={film.webm} type="video/webm" />
          <source src={film.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

/* =====================================================================
   THE JOURNEY — the DOM layer of the experience. Semantic content in
   normal flow; the fixed WebGL world travels behind it. One continuous
   take: content reveals are synced to the same master progress.
   ===================================================================== */

/* ---------------- content (fonte de verdade: plataforma de marca aprovada) ---------------- */

const SYSTEMS = [
  { t: 'Digital Experiences', d: 'Sites, plataformas, interfaces, aplicações, e-commerce, WebGL e produtos digitais desenhados para serem explorados, não apenas navegados.' },
  { t: 'Spatial Experiences', d: 'AR, VR, Apple Vision Pro, ambientes virtuais e computação espacial para quando uma tela não basta.' },
  { t: 'Connected Experiences', d: 'IoT, sensores, hardware, software, dispositivos e ambientes responsivos que percebem, respondem e participam.' },
  { t: 'Live Experiences', d: 'Eventos, instalações, ativações, totens, projeções e gamificação transformando presença física em participação ativa.' },
  { t: 'Media Experiences', d: 'Conteúdo, motion, campanhas, mídia, narrativas e distribuição pensados para atravessar telas, formatos, canais e cultura.' },
  { t: 'Experience Systems', d: 'Estratégia, engenharia, dados, operação e mensuração conectando os territórios em uma capacidade contínua.' },
]

const METHOD = [
  { t: 'Imagine', d: 'Definir ambição, contexto e a resposta humana que a experiência precisa provocar.' },
  { t: 'Design', d: 'Traduzir a ideia em narrativa, interação, espaço, ritmo e comportamento.' },
  { t: 'Engineer', d: 'Construir os sistemas, tecnologias e integrações que tornam a experiência real.' },
  { t: 'Activate', d: 'Levar a experiência para telas, espaços, canais, objetos e pessoas.' },
  { t: 'Learn', d: 'Observar comportamento, performance e impacto para evoluir continuamente.' },
]

const SIGNALS = [
  { t: 'Launch Film Cinemático', k: 'CONTENT & MOTION' },
  { t: 'Interactive Web World', k: 'WEBGL & MOTION' },
  { t: 'Protótipo de Espaço Conectado', k: 'SENSORS & SPACE' },
  { t: 'Media Experience Engine', k: 'CONTENT & DISTRIBUTION' },
]
/* Cases reais entram aqui quando existirem — estrutura pronta, sem inventar
   clientes, métricas ou resultados. */

const MENU = [
  { id: 'c-signals', n: '01', t: 'Projetos' },
  { id: 'c-build', n: '02', t: 'Experiências' },
  { id: 'c-invisible', n: '03', t: 'Studio' },
  { id: 'c-method', n: '04', t: 'Insights' },
  { id: 'c-cta', n: '05', t: 'Contato' },
]


/* ---------------- loader ---------------- */
function XLoader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const t0 = performance.now()
    let real = false
    const jobs: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()]
    if (xstore.quality !== 'off') jobs.push(import('./World').catch(() => {}))
    Promise.all(jobs).then(() => (real = true))
    const hard = setTimeout(() => (real = true), 2500)
    let p = 0
    const iv = setInterval(() => {
      const e = performance.now() - t0
      const target = real && e > 650 ? 100 : Math.min(88, (e / 1300) * 88)
      p = Math.min(target, p + (target - p) * 0.14 + 0.7)
      setPct(p)
      if (p >= 99.5) {
        clearInterval(iv)
        setLeaving(true)
        xstore.ready = true
        window.dispatchEvent(new Event('x:ready'))
        setTimeout(onDone, 620)
      }
    }, 50)
    return () => {
      clearInterval(iv)
      clearTimeout(hard)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const status = pct < 33 ? 'INICIANDO SIGNAL' : pct < 72 ? 'CALIBRANDO SISTEMA' : pct < 99 ? 'CARREGANDO MAYVEN' : 'SISTEMA PRONTO'
  return (
    <div className={`x-loader ${leaving ? 'is-leaving' : ''}`} role="status" aria-label="Carregando MAYVEN">
      <div className="x-loader-word" aria-hidden="true">
        {'MAYVEN'.split('').map((c, i) => (
          <span key={i} style={{ ['--i' as string]: i }}>{c}</span>
        ))}
      </div>
      <div className="x-loader-meta x-mono" aria-hidden="true">
        <span>{status}</span>
        <b>{String(Math.round(pct)).padStart(3, '0')}</b>
      </div>
      <i className="x-loader-bar" style={{ ['--p' as string]: pct / 100 }} aria-hidden="true" />
    </div>
  )
}

/* ---------------- cursor ---------------- */
function XCursor() {
  const dot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    document.documentElement.classList.add('x-has-cursor')
    const el = dot.current!
    const qx = gsap.quickTo(el, 'x', { duration: 0.12, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 0.12, ease: 'power3.out' })
    const move = (e: MouseEvent) => {
      qx(e.clientX)
      qy(e.clientY)
      xstore.mx = (e.clientX / innerWidth - 0.5) * 2
      xstore.my = (e.clientY / innerHeight - 0.5) * 2
    }
    const over = (e: MouseEvent) => {
      el.classList.toggle('is-hot', !!(e.target as HTMLElement).closest?.('a, button, [data-x]'))
    }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('x-has-cursor')
    }
  }, [])
  return <div ref={dot} className="x-cursor" aria-hidden="true" />
}

/* ---------------- nav + menu ---------------- */
function XNav() {
  const [open, setOpen] = useState(false)
  const bar = useRef<HTMLElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const first = useRef<HTMLAnchorElement>(null)
  const overlay = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    const lenis = (window as unknown as { __xlenis?: Lenis }).__xlenis
    if (!open) return
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    first.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && overlay.current) {
        const f = overlay.current.querySelectorAll<HTMLElement>('a, button')
        const a = f[0]
        const b = f[f.length - 1]
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus() }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenis?.start()
      document.body.style.overflow = ''
      btn.current?.focus()
    }
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => {
      const el = document.getElementById(id)
      const lenis = (window as unknown as { __xlenis?: Lenis }).__xlenis
      if (el) lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  return (
    <>
      <header className="x-nav">
        <i ref={bar as React.RefObject<HTMLElement>} className="x-progress" aria-hidden="true" />
        <a className="x-brand" href="#c-hero" onClick={go('c-hero')} aria-label="MAYVEN — início">
          <img src="/brand/mayven-mark.png" alt="" />
          <span>MAYVEN</span>
        </a>
        <p className="x-nav-tag x-mono">CREATIVE TECH MEDIA COMPANY</p>
        <div className="x-nav-right">
          <a className="x-nav-cta x-mono" href="#c-cta" onClick={go('c-cta')}>
            COMEÇAR PROJETO
          </a>
          <button ref={btn} className="x-menu-btn x-mono" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(!open)}>
            {open ? 'FECHAR' : 'MENU'}
          </button>
        </div>
      </header>
      <div ref={overlay} className={`x-menu ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
        <nav>
          {MENU.map((m, i) => (
            <a key={m.id} ref={i === 0 ? first : undefined} href={`#${m.id}`} onClick={go(m.id)} tabIndex={open ? 0 : -1} style={{ ['--i' as string]: i }}>
              <span className="x-mono">{m.n}</span>
              {m.t}
            </a>
          ))}
        </nav>
        <div className="x-menu-foot x-mono">
          <a href="/client" tabIndex={open ? 0 : -1}>ÁREA DO CLIENTE →</a>
          <a href="mailto:hello@mayven.com.br" tabIndex={open ? 0 : -1}>HELLO@MAYVEN.COM.BR</a>
        </div>
      </div>
    </>
  )
}

/* ---------------- chapter shell: sticky viewport inside a tall track ---------------- */
function Chapter({
  id,
  vh,
  children,
  className = '',
}: {
  id: string
  vh: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`x-ch ${className}`} style={{ height: `${vh}vh` }}>
      <div className="x-ch-view">{children}</div>
    </section>
  )
}

/* progress within a chapter track → local state (for step lists) */
function useChapterIndex(id: string, count: number) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        const i = Math.min(count - 1, Math.floor(s.progress * count))
        setIdx((p) => (p === i ? p : i))
      },
    })
    return () => st.kill()
  }, [id, count])
  return idx
}

/* reveal helper */
function useReveals(scope: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 82%' } },
        )
      })
    }, scope)
    return () => ctx.revert()
  }, [scope])
}

/* ---------------- the journey ---------------- */
export default function Journey() {
  const [booted, setBooted] = useState(false)
  const [worldMounted, setWorldMounted] = useState(false)
  const [worldOn, setWorldOn] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const quality = useRef(detectQuality())
  xstore.quality = quality.current

  useEffect(() => {
    const ready = window.setTimeout(() => {
      xstore.ready = true
      setBooted(true)
      window.dispatchEvent(new Event('x:ready'))
    }, 80)
    const mountWorld = () => setWorldMounted(true)
    const worldDelay = window.setTimeout(mountWorld, 1800)
    window.addEventListener('scroll', mountWorld, { once: true, passive: true })
    return () => {
      window.clearTimeout(ready)
      window.clearTimeout(worldDelay)
      window.removeEventListener('scroll', mountWorld)
    }
  }, [])

  /* master scroll: lenis + one progress trigger driving the world AND the theme.
     Theme uses hysteresis on the same progress — the boundary can never oscillate. */
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let lightNow = false
    const zones: Array<readonly [number, number]> = [CH.manifesto, CH.signals]
    const H = 0.014
    const applyTheme = (p: number) => {
      const inZone = zones.some(([a, b]) => (lightNow ? p > a - H && p < b + H : p > a + H && p < b - H))
      if (inZone !== lightNow) {
        lightNow = inZone
        xstore.light = inZone ? 1 : 0
        document.body.dataset.xtheme = inZone ? 'light' : 'dark'
      }
    }
    const master = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        xstore.p = s.progress
        applyTheme(s.progress)
      },
    })
    const onVis = () => setWorldOn(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    if (reduced || quality.current === 'off') {
      return () => {
        master.kill()
        document.removeEventListener('visibilitychange', onVis)
      }
    }
    const lenis = new Lenis({ duration: 1.05 })
    ;(window as unknown as { __xlenis?: Lenis }).__xlenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => {
      lenis.raf(t * 1000)
      xstore.vel = lenis.velocity
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      master.kill()
      document.removeEventListener('visibilitychange', onVis)
      gsap.ticker.remove(raf)
      lenis.destroy()
      ;(window as unknown as { __xlenis?: Lenis }).__xlenis = undefined
    }
  }, [])

  useReveals(rootRef as React.RefObject<HTMLElement>)

  /* hero intro + subtle depth */
  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const run = () => {
      if (reducedMotion) {
        gsap.set('.x-hero-title span, .x-hero .x-fade', { opacity: 1, y: 0, yPercent: 0 })
        return
      }
      gsap.fromTo('.x-hero-title span', { yPercent: 115 }, { yPercent: 0, stagger: 0.055, duration: 1.05, ease: 'power4.out', delay: 0.1 })
      gsap.fromTo('.x-hero .x-fade', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, delay: 0.7 })
    }
    if (xstore.ready) run()
    else window.addEventListener('x:ready', run, { once: true })

    if (reducedMotion) {
      return () => window.removeEventListener('x:ready', run)
    }

    const letters = gsap.utils.toArray<HTMLElement>('.x-hero-title span')
    const quick = letters.map((el) => ({
      x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' }),
    }))
    const onMove = () => {
      letters.forEach((_, i) => {
        const k = (i - (letters.length - 1) / 2) / letters.length
        quick[i].x(xstore.mx * k * -34)
        quick[i].y(xstore.my * Math.abs(k) * -20)
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    /* first-scroll cinematic transition */
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: '#c-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
          .to('.x-hero-film video, .x-hero-poster', { scale: 1.08, yPercent: -3, ease: 'none' }, 0)
          .to('.x-hero-copy', { y: -42, opacity: 0.18, ease: 'none' }, 0.08)
      }, rootRef)
      return () => {
        window.removeEventListener('x:ready', run)
        window.removeEventListener('mousemove', onMove)
        ctx.revert()
      }
    }
    return () => {
      window.removeEventListener('x:ready', run)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const buildIdx = useChapterIndex('c-build', SYSTEMS.length)
  const methodIdx = useChapterIndex('c-method', METHOD.length)

  const gl = quality.current !== 'off'

  return (
    <div ref={rootRef} className="x-root">
      {gl && worldMounted && (
        <Suspense fallback={null}>
          <World active={worldOn && booted} />
        </Suspense>
      )}
      <div className="x-vignette" aria-hidden="true" />
      <XCursor />
      <XNav />

      <main className="x-main">
        {/* 01 — HERO */}
        <Chapter id="c-hero" vh={130} className="x-hero">
          <HeroFilm />
          <div className="x-hero-copy">
            <p className="x-kicker x-mono x-fade">Creative Tech Media Company</p>
            <h1 className="x-hero-title" aria-label="A experiência é a interface.">
              <span>A experiência</span>
              <span>é a interface.</span>
            </h1>
            <p className="x-hero-sub x-fade">
              Criamos experiências que atravessam telas, espaços, objetos e pessoas.
            </p>
            <div className="x-hero-ctas x-fade">
              <a className="x-btn x-btn-solid" href="#c-cta" data-x="">Criar uma experiência</a>
              <a className="x-btn" href="#c-signals" data-x="">Ver projetos</a>
            </div>
          </div>
          <HeroPhysicsExperience headline="A EXPERIÊNCIA É A INTERFACE." />
          <div className="x-scrollcue x-fade" aria-hidden="true">
            <span className="x-mono">ROLAR</span>
            <i />
          </div>
        </Chapter>

        {/* 02 — POSICIONAMENTO */}
        <Chapter id="c-manifesto" vh={240} className="x-manifesto">
          <p className="x-eyebrow x-mono" data-reveal>01 — POSICIONAMENTO</p>
          <h2 className="x-echo" data-text="EXPERIÊNCIA" data-reveal>
            Tecnologia não é <em>a experiência.</em>
          </h2>
          <p className="x-copy" data-reveal>
            É o que torna a experiência possível. As pessoas não lembram do framework,
            do sensor, da engine de render ou da integração.
          </p>
          <p className="x-copy x-copy-punch" data-reveal>
            Elas lembram do que aconteceu quando tocaram, entraram, moveram, descobriram ou compartilharam algo.
            <strong> Nós desenhamos esse momento.</strong>
          </p>
        </Chapter>

        {/* 03 — INVISIBLE WORK */}
        <Chapter id="c-invisible" vh={230} className="x-invisible">
          <p className="x-eyebrow x-mono" data-reveal>02 — INVISIBLE WORK</p>
          <h2 className="x-echo" data-text="WORK" data-reveal>
            A melhor tecnologia quase sempre <em>desaparece.</em>
          </h2>
          <p className="x-copy" data-reveal>
            As pessoas percebem quando a interação parece natural, a resposta é imediata,
            a história parece viva e o ambiente entende o que está acontecendo.
          </p>
          <p className="x-copy x-copy-punch" data-reveal>
            Strategy, story, experience design, interface, motion, spatial thinking, engineering,
            intelligence, media e measurement trabalham como um sistema só.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['STRATEGY', 'STORY', 'EXPERIENCE DESIGN', 'INTERFACE', 'MOTION', 'ENGINEERING', 'MEDIA', 'MEASUREMENT'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 04 — TERRITÓRIOS */}
        <Chapter id="c-build" vh={360} className="x-build">
          <p className="x-eyebrow x-mono">03 — TERRITÓRIOS DE EXPERIÊNCIA</p>
          <div className="x-build-grid">
            <span className="x-build-idx" aria-hidden="true" key={`n${buildIdx}`}>
              0{buildIdx + 1}
            </span>
            <div className="x-build-body">
              <div className="x-station" key={buildIdx}>
                <h2>{SYSTEMS[buildIdx].t}</h2>
                <p>{SYSTEMS[buildIdx].d}</p>
              </div>
              <ol className="x-build-list">
                {SYSTEMS.map((s, i) => (
                  <li key={s.t} className={i === buildIdx ? 'is-on' : ''}>
                    <span className="x-mono">0{i + 1}</span> {s.t}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <p className="x-note x-mono">TELAS · ESPAÇOS · OBJETOS · PESSOAS · MAKE IT FELT.</p>
        </Chapter>

        {/* 05 — IMMERSIVE & PHYSICAL */}
        <Chapter id="c-immersive" vh={240} className="x-immersive">
          <p className="x-eyebrow x-mono" data-reveal>04 — ONDE A EXPERIÊNCIA EXISTE</p>
          <h2 className="x-echo" data-text="ACROSS" data-reveal>
            A interface pode ser <em>qualquer ponto de encontro.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Uma tela, um espaço, um objeto, um gesto, uma superfície, uma instalação, um device,
            uma campanha ou um ambiente. O meio nasce da reação que queremos criar.
          </p>
          <p className="x-copy x-copy-punch" data-reveal>
            A Mayven combina criatividade, tecnologia, mídia e engenharia para projetar como ideias
            são vividas através de telas, espaços, objetos e pessoas.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['SITES', 'WEBGL', 'AR / VR', 'VISION PRO', 'IOT', 'TOTENS', 'INSTALAÇÕES', 'EVENTOS', 'MEDIA'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 06 — METHOD */}
        <Chapter id="c-method" vh={300} className="x-method">
          <p className="x-eyebrow x-mono">05 — PROCESS · DA RESPOSTA AO SISTEMA</p>
          <div className="x-method-grid">
            <div className="x-station" key={methodIdx}>
              <span className="x-station-num x-mono">{String(methodIdx + 1).padStart(2, '0')} / {String(METHOD.length).padStart(2, '0')}</span>
              <h2>{METHOD[methodIdx].t}</h2>
              <p>{METHOD[methodIdx].d}</p>
            </div>
            <ol className="x-method-list">
              {METHOD.map((m, i) => (
                <li key={m.t} className={i === methodIdx ? 'is-on' : ''}>
                  <span className="x-mono">{String(i + 1).padStart(2, '0')}</span> {m.t}
                </li>
              ))}
            </ol>
          </div>
          <p className="x-note x-mono">
            COMEÇAMOS PELA RESPOSTA HUMANA. DEPOIS DEFINIMOS A TECNOLOGIA NECESSÁRIA.
          </p>
        </Chapter>

        {/* 06 — PROJETOS */}
        <Chapter id="c-signals" vh={220} className="x-signals">
          <p className="x-eyebrow x-mono" data-reveal>06 — FRAMEWORK DE PROJETOS</p>
          <h2 className="x-echo" data-text="WORK" data-reveal>
            Um projeto começa pelo que <em>as pessoas vivem.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Cada case é contado por contexto, experiência, interação, tecnologia e impacto.
            A stack importa, mas só depois que o momento humano está claro.
          </p>
          <div className="x-signal-row" data-reveal>
            {SIGNALS.map((s, i) => (
              <article key={s.t} data-x="">
                <span className="x-mono">S_{String(i + 1).padStart(2, '0')} · {s.k}</span>
                <h3>{s.t}</h3>
                <b className="x-mono">CONTEXTO · EXPERIÊNCIA · INTERAÇÃO · TECNOLOGIA · IMPACTO</b>
              </article>
            ))}
          </div>
        </Chapter>

        {/* 07 — MANIFESTO */}
        <Chapter id="c-operation" vh={200} className="x-operation">
          <p className="x-eyebrow x-mono" data-reveal>07 — MANIFESTO</p>
          <h2 className="x-echo" data-text="FELT" data-reveal>
            A tecnologia não deve ficar <em>entre a pessoa e o momento.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Ela deve fazer a interação parecer natural, a resposta parecer imediata,
            a história parecer viva, o ambiente parecer atento e a ideia parecer real.
          </p>
          <p className="x-copy x-copy-punch" data-reveal>
            Porque tecnologia não é o que as pessoas lembram. <strong>A experiência é.</strong>
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['MAKE IT FELT', 'NATURAL RESPONSE', 'LIVE STORY', 'AWARE SPACE', 'REAL IDEA'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 08 — FINAL CTA */}
        <Chapter id="c-cta" vh={170} className="x-cta">
          <p className="x-eyebrow x-mono" data-reveal>08 — COMEÇAR PELA SENSAÇÃO</p>
          <h2 data-reveal>
            O que as pessoas <em>precisam sentir?</em>
          </h2>
          <p className="x-copy" data-reveal>
            Conte a reação, o comportamento ou a transformação que você quer criar.
            A gente desenha a experiência e define a tecnologia necessária para torná-la real.
          </p>
          <div className="x-hero-ctas" data-reveal>
            <a className="x-btn x-btn-solid" href="mailto:hello@mayven.com.br" data-x="">Criar uma experiência</a>
            <a className="x-btn" href="mailto:hello@mayven.com.br" data-x="">Começar pela sensação</a>
          </div>
          <footer className="x-foot" data-reveal>
            <div>
              <p className="x-mono">CONTATO</p>
              <a href="mailto:hello@mayven.com.br">hello@mayven.com.br</a>
            </div>
            <div>
              <p className="x-mono">SOCIAL</p>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
            <div>
              <p className="x-mono">CLIENTES</p>
              <a href="/client">Área do Cliente →</a>
            </div>
            <div>
              <p className="x-mono">MAYVEN</p>
              <p>Creative Tech Media Company</p>
              <p className="x-legal">© 2026 MAYVEN — A experiência é a interface.</p>
            </div>
          </footer>
        </Chapter>
      </main>
    </div>
  )
}

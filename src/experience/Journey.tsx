import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CH, detectQuality, xstore } from './store'
import HeroPhysicsExperience from './HeroPhysicsExperience'
import ContactForm from './ContactForm'
import { CASES } from './data/cases'
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
   THE JOURNEY — camada DOM da experiência. Conteúdo semântico em fluxo
   normal; o mundo WebGL fixo viaja atrás. Narrativa: a Mayven cria
   presença → presença diferencia → a marca também pode ser vivida →
   3 manifestações → método → cases → convite.
   ===================================================================== */

/* ---------------- conteúdo (briefing aprovado — não trocar por clichês) ---------------- */

const TYPES = [
  {
    t: 'Experiências digitais',
    d: 'Sites, aplicativos, plataformas, e-commerce, marketplaces, interfaces interativas, WebGL, 3D e produtos digitais.',
    sig: ['PIXELS', 'GRIDS', 'SUPERFÍCIES', 'LUZ'],
  },
  {
    t: 'Experiências de marca e comércio',
    d: 'Jornadas de compra, personalização, CRM, WhatsApp, atendimento, relacionamento, campanhas e experiências omnicanal.',
    sig: ['FLUXOS', 'JORNADAS', 'CONEXÕES', 'SINAIS'],
  },
  {
    t: 'Experiências live e conectadas',
    d: 'Eventos, ativações, lançamentos, totens, instalações, gamificação, realidade aumentada, realidade virtual, sensores, IoT e ambientes interativos.',
    sig: ['ESPAÇOS', 'SENSORES', 'ONDAS', 'PRESENÇA FÍSICA'],
  },
]

const METHOD = [
  { t: 'Entender', d: 'O negócio, a marca, o público e o momento.', stage: 'OBSERVAÇÃO — PONTOS' },
  { t: 'Imaginar', d: 'A ideia, o posicionamento e a experiência.', stage: 'FORMA — LINHAS' },
  { t: 'Construir', d: 'O design, a tecnologia, o conteúdo e o sistema.', stage: 'ESTRUTURA — MATÉRIA' },
  { t: 'Ativar', d: 'Os canais, os espaços, a mídia e as pessoas.', stage: 'SISTEMA — ENERGIA' },
]

const MENU = [
  { id: 'c-hero', n: '01', t: 'Mayven' },
  { id: 'c-presenca', n: '02', t: 'O que fazemos' },
  { id: 'c-tipos', n: '03', t: 'Experiências' },
  { id: 'c-metodo', n: '04', t: 'Método' },
  { id: 'c-cases', n: '05', t: 'Cases' },
  { id: 'c-contato', n: '06', t: 'Contato' },
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
  const status = pct < 33 ? 'INICIANDO' : pct < 72 ? 'CALIBRANDO PRESENÇA' : pct < 99 ? 'CARREGANDO MAYVEN' : 'PRONTO'
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
          <a className="x-nav-cta x-mono" href="#c-contato" onClick={go('c-contato')}>
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

/* ---------------- case editorial (expansível, acessível, orientado a dados) ---------------- */
function CaseArticle({ c, i }: { c: (typeof CASES)[number]; i: number }) {
  const [open, setOpen] = useState(i === 0)
  const hasBody = !!(c.contexto || c.desafio || c.ideia || c.experiencia || c.sistema?.length || c.impacto)
  const sections: Array<[string, string | undefined]> = [
    ['CONTEXTO', c.contexto],
    ['DESAFIO', c.desafio],
    ['IDEIA', c.ideia],
    ['EXPERIÊNCIA', c.experiencia],
    ['IMPACTO', c.impacto],
  ]
  return (
    <article className={`x-case ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="x-case-head"
        aria-expanded={open}
        onClick={() => hasBody && setOpen(!open)}
        data-x=""
      >
        <span className="x-mono x-case-num">C_{String(i + 1).padStart(2, '0')}</span>
        <span className="x-case-title">
          <h3>{c.title}</h3>
          <span className="x-mono x-case-area">{c.area}</span>
        </span>
        <span className={`x-mono x-case-status ${c.status === 'EM BREVE' ? 'is-soon' : ''}`}>{c.status}</span>
        {hasBody && <span className="x-case-toggle" aria-hidden="true">{open ? '−' : '+'}</span>}
      </button>
      {hasBody && open && (
        <div className="x-case-body">
          {sections.map(([k, v]) => v && (
            <div className="x-case-block" key={k}>
              <span className="x-mono">{k}</span>
              <p>{v}</p>
            </div>
          ))}
          {!!c.sistema?.length && (
            <div className="x-case-block">
              <span className="x-mono">SISTEMA</span>
              <ul className="x-tags x-mono">
                {c.sistema.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
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
    const zones: Array<readonly [number, number]> = [CH.presenca, CH.cases]
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
  }, [])

  const typeIdx = useChapterIndex('c-tipos', TYPES.length)
  const methodIdx = useChapterIndex('c-metodo', METHOD.length)

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
            <h1 className="x-hero-title" aria-label="Presença para marcas que não nasceram para parecer comuns.">
              <span>Presença para marcas</span>
              <span>que não nasceram</span>
              <span>para parecer comuns.</span>
            </h1>
            <p className="x-hero-sub x-fade">
              Estratégia, criatividade, tecnologia e mídia para construir marcas mais presentes
              e experiências que vão além do esperado.
            </p>
            <div className="x-hero-ctas x-fade">
              <a className="x-btn x-btn-solid" href="#c-presenca" data-x="">Conheça a Mayven</a>
              <a className="x-btn" href="#c-contato" data-x="">Comece um projeto</a>
            </div>
          </div>
          <HeroPhysicsExperience headline="PRESENÇA PARA MARCAS QUE NÃO NASCERAM PARA PARECER COMUNS." />
          <div className="x-scrollcue x-fade" aria-hidden="true">
            <span className="x-mono">ROLAR</span>
            <i />
          </div>
        </Chapter>

        {/* 02 — O QUE FAZEMOS · TERRITÓRIO 1 (o mundo vira bone aqui) */}
        <Chapter id="c-presenca" vh={220} className="x-presenca">
          <p className="x-eyebrow x-mono" data-reveal>01 — O QUE FAZEMOS</p>
          <h2 className="x-echo" data-text="PRESENÇA" data-reveal>
            Construímos <em>presença.</em>
          </h2>
          <p className="x-lead" data-reveal>
            Ajudamos marcas a ocupar um espaço próprio no mercado.
          </p>
          <p className="x-copy" data-reveal>
            Posicionamento, identidade, conteúdo, mídia, canais e experiências digitais trabalham
            juntos para fazer a marca parecer tão relevante quanto aquilo que entrega.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['BRANDING', 'SITES', 'CONTEÚDO', 'CAMPANHAS', 'MÍDIA', 'CANAIS'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 03 — O QUE FAZEMOS · TERRITÓRIO 2 (de volta ao escuro: reação) */}
        <Chapter id="c-experiencias" vh={220} className="x-experiencias">
          <p className="x-eyebrow x-mono" data-reveal>01 — O QUE FAZEMOS</p>
          <h2 className="x-echo" data-text="VIVIDA" data-reveal>
            Criamos <em>experiências.</em>
          </h2>
          <p className="x-lead" data-reveal>
            Projetamos novas formas de interação entre marcas e pessoas.
          </p>
          <p className="x-copy" data-reveal>
            Experiências digitais, comerciais, físicas e conectadas que podem acontecer em uma tela,
            em uma jornada de compra, em um evento, em um espaço ou em um dispositivo.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['DIGITAL', 'COMMERCE', 'APPS', 'AR / VR', 'IOT', 'EVENTOS', 'LANÇAMENTOS'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="x-copy x-copy-punch x-close-punch" data-reveal>
            Uma marca precisa ser percebida. <strong>Uma experiência precisa ser vivida.</strong>
          </p>
        </Chapter>

        {/* 04 — TIPOS DE EXPERIÊNCIA (três estados de um mesmo sistema) */}
        <Chapter id="c-tipos" vh={300} className="x-tipos">
          <p className="x-eyebrow x-mono">02 — TIPOS DE EXPERIÊNCIA</p>
          <div className="x-build-grid">
            <span className="x-build-idx" aria-hidden="true" key={`n${typeIdx}`}>
              0{typeIdx + 1}
            </span>
            <div className="x-build-body">
              <div className="x-station" key={typeIdx}>
                <h2>{TYPES[typeIdx].t}</h2>
                <p>{TYPES[typeIdx].d}</p>
                <ul className="x-tags x-mono x-type-sig">
                  {TYPES[typeIdx].sig.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <ol className="x-build-list">
                {TYPES.map((s, i) => (
                  <li key={s.t} className={i === typeIdx ? 'is-on' : ''}>
                    <span className="x-mono">0{i + 1}</span> {s.t}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <p className="x-note x-mono">TRÊS MANIFESTAÇÕES. UM MESMO SISTEMA.</p>
        </Chapter>

        {/* 05 — MÉTODO (a ideia atravessa estágios até ganhar presença) */}
        <Chapter id="c-metodo" vh={280} className="x-metodo">
          <p className="x-eyebrow x-mono">03 — MÉTODO</p>
          <div className="x-method-grid">
            <div className="x-station" key={methodIdx}>
              <span className="x-station-num x-mono">
                {String(methodIdx + 1).padStart(2, '0')} / 04 · {METHOD[methodIdx].stage}
              </span>
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
            UMA IDEIA É OBSERVADA, TOMA FORMA, VIRA ESTRUTURA E GANHA PRESENÇA NO MUNDO.
          </p>
        </Chapter>

        {/* 06 — CASES (editorial, poucos projetos, profundidade — zona bone) */}
        <Chapter id="c-cases" vh={260} className="x-cases">
          <p className="x-eyebrow x-mono" data-reveal>04 — CASES</p>
          <h2 className="x-echo" data-text="CASES" data-reveal>
            Poucos projetos, <em>contados a fundo.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Contexto, desafio, ideia, experiência, sistema e impacto — cada case mostra como uma
            ambição ganhou presença. Sem números inflados, sem cases emprestados.
          </p>
          <div className="x-case-list" data-reveal>
            {CASES.map((c, i) => (
              <CaseArticle c={c} i={i} key={c.slug} />
            ))}
          </div>
        </Chapter>

        {/* 07 — CONTATO */}
        <Chapter id="c-contato" vh={230} className="x-contato">
          <p className="x-eyebrow x-mono" data-reveal>05 — COMEÇAR</p>
          <h2 data-reveal>
            O que sua marca precisa <em>construir agora?</em>
          </h2>
          <p className="x-copy" data-reveal>
            Uma presença mais forte. Uma nova experiência digital. Uma jornada de compra diferente.
            Um lançamento, uma ativação, um espaço conectado — ou algo que ainda não tem um formato definido.
          </p>
          <p className="x-copy x-copy-punch" data-reveal>
            Conte a ambição. <strong>A gente ajuda a dar forma a ela.</strong>
          </p>
          <div data-reveal>
            <ContactForm />
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
              <p className="x-legal">© 2026 MAYVEN — Presença para marcas que não nasceram para parecer comuns.</p>
            </div>
          </footer>
        </Chapter>
      </main>
    </div>
  )
}

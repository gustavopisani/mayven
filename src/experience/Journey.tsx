import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CH, detectQuality, xstore } from './store'
import './experience.css'

gsap.registerPlugin(ScrollTrigger)

const World = lazy(() => import('./World'))

/* =====================================================================
   THE JOURNEY — the DOM layer of the experience. Semantic content in
   normal flow; the fixed WebGL world travels behind it. One continuous
   take: content reveals are synced to the same master progress.
   ===================================================================== */

/* ---------------- content (fonte de verdade: plataforma de marca aprovada) ---------------- */

const SYSTEMS = [
  { t: 'Brand & Digital Experiences', d: 'Posicionamento, identidade, sites, experiências imersivas, interfaces, motion e 3D.' },
  { t: 'Commerce & Growth', d: 'E-commerce, jornadas de conversão, landing pages, campanhas, mídia e otimização.' },
  { t: 'Platforms & Integrations', d: 'Plataformas, aplicativos, APIs, integrações e experiências conectadas.' },
  { t: 'Sales & Relationship Systems', d: 'CRM, WhatsApp Business, automações comerciais e integrações de vendas.' },
  { t: 'Content & Media Operations', d: 'Estratégia editorial, criação, gestão de canais, campanhas e distribuição.' },
  { t: 'AI & Automation', d: 'Agentes, IA aplicada, automações, personalização e experiências generativas.' },
]

const METHOD = [
  { t: 'Decode', d: 'Mercado, concorrência, público, contexto e percepção atual.' },
  { t: 'Define', d: 'Posicionamento, narrativa, proposta de valor e direcionamento.' },
  { t: 'Design', d: 'Identidade, interface, experiência, conteúdo e direção visual.' },
  { t: 'Engineer', d: 'Tecnologia, plataformas, motion, WebGL, IA, integrações e automações.' },
  { t: 'Distribute', d: 'Conteúdo, mídia, canais, campanhas e ativação.' },
  { t: 'Learn', d: 'Dados, performance, comportamento e otimização contínua.' },
]

const SIGNALS = [
  { t: 'Brand Recode', k: 'BRAND & EXPERIENCE' },
  { t: 'Web Experience', k: 'WEBGL & MOTION' },
  { t: 'Content Engine', k: 'MEDIA OPERATIONS' },
  { t: 'Creative Tech Prototype', k: 'R&D' },
]
/* Cases reais entram aqui quando existirem — estrutura pronta, sem inventar
   clientes, métricas ou resultados. */

const MENU = [
  { id: 'c-manifesto', n: '01', t: 'Manifesto' },
  { id: 'c-invisible', n: '02', t: 'The Invisible Work' },
  { id: 'c-build', n: '03', t: 'What We Build' },
  { id: 'c-immersive', n: '04', t: 'Immersive & Physical' },
  { id: 'c-method', n: '05', t: 'Method' },
  { id: 'c-signals', n: '06', t: 'Selected Signals' },
  { id: 'c-operation', n: '07', t: 'Operation' },
  { id: 'c-cta', n: '08', t: 'Contact' },
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
  const status = pct < 33 ? 'INITIALIZING SIGNAL' : pct < 72 ? 'CALIBRATING SYSTEM' : pct < 99 ? 'LOADING MAYVEN' : 'SYSTEM READY'
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
            START A PROJECT
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
  const [worldOn, setWorldOn] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const quality = useRef(detectQuality())
  xstore.quality = quality.current

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

  /* hero intro after loader + kinetic letters chasing the cursor */
  useEffect(() => {
    const run = () => {
      gsap.fromTo('.x-hero-title span', { yPercent: 115 }, { yPercent: 0, stagger: 0.055, duration: 1.05, ease: 'power4.out', delay: 0.1 })
      gsap.fromTo('.x-hero .x-fade', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, delay: 0.7 })
    }
    if (xstore.ready) run()
    else window.addEventListener('x:ready', run, { once: true })

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

    /* hero media reveal — the cursor uncovers the footage, with a lagging soft halo */
    const reveal = document.querySelector<HTMLElement>('.x-reveal')
    let rafId = 0
    if (reveal && !matchMedia('(pointer: coarse)').matches) {
      const pos = { x1: innerWidth / 2, y1: innerHeight / 2, x2: innerWidth / 2, y2: innerHeight / 2, r: 0 }
      let tx = pos.x1
      let ty = pos.y1
      const onPointer = (e: MouseEvent) => {
        tx = e.clientX
        ty = e.clientY
      }
      window.addEventListener('mousemove', onPointer, { passive: true })
      const loop = () => {
        const speed = Math.hypot(tx - pos.x1, ty - pos.y1)
        pos.x1 += (tx - pos.x1) * 0.22
        pos.y1 += (ty - pos.y1) * 0.22
        pos.x2 += (tx - pos.x2) * 0.07
        pos.y2 += (ty - pos.y2) * 0.07
        const targetR = xstore.p < 0.07 ? Math.min(300, 170 + speed * 2.4) : 0 // seals shut once you leave the hero
        pos.r += (targetR - pos.r) * 0.1
        reveal.style.setProperty('--r1x', `${pos.x1}px`)
        reveal.style.setProperty('--r1y', `${pos.y1}px`)
        reveal.style.setProperty('--r2x', `${pos.x2}px`)
        reveal.style.setProperty('--r2y', `${pos.y2}px`)
        reveal.style.setProperty('--rr', `${pos.r}px`)
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
      return () => {
        window.removeEventListener('x:ready', run)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mousemove', onPointer)
        cancelAnimationFrame(rafId)
      }
    }
    return () => {
      window.removeEventListener('x:ready', run)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const buildIdx = useChapterIndex('c-build', 6)
  const methodIdx = useChapterIndex('c-method', 6)

  const gl = quality.current !== 'off'

  return (
    <div ref={rootRef} className="x-root">
      {!booted && <XLoader onDone={() => setBooted(true)} />}
      {gl && (
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
          {gl && (
            <div className="x-reveal" aria-hidden="true">
              {/* mídia do reveal — troque o src quando definirem a imagem/vídeo final */}
              <video src="/assets/videos/mayven-signal-source.mp4" muted loop playsInline autoPlay preload="metadata" />
            </div>
          )}
          <p className="x-kicker x-mono x-fade">CREATIVE TECH MEDIA COMPANY — SP/BR</p>
          <h1 className="x-hero-title" aria-label="MAYVEN">
            {'MAYVEN'.split('').map((c, i) => (
              <span key={i} aria-hidden="true">{c}</span>
            ))}
          </h1>
          <p className="x-hero-line x-fade">
            Presença digital para marcas que <em>não nasceram</em> para parecer comuns.
          </p>
          <p className="x-hero-sub x-fade">
            Estratégia, mídia, IA, design e engenharia criativa para construir marcas, conteúdos e
            experiências digitais de alta performance.
          </p>
          <div className="x-hero-ctas x-fade">
            <a className="x-btn x-btn-solid" href="#c-cta" data-x="">Start a project</a>
            <a className="x-btn" href="#c-manifesto" data-x="">Enter the system ↓</a>
          </div>
          <div className="x-scrollcue x-fade" aria-hidden="true">
            <span className="x-mono">SCROLL</span>
            <i />
          </div>
        </Chapter>

        {/* 02 — MANIFESTO */}
        <Chapter id="c-manifesto" vh={240} className="x-manifesto">
          <p className="x-eyebrow x-mono" data-reveal>01 — MANIFESTO</p>
          <h2 className="x-echo" data-text="INVISÍVEL" data-reveal>
            O que move uma marca é <em>invisível.</em>
          </h2>
          <p className="x-copy" data-reveal>
            O público vê o resultado: a marca forte, o site memorável, o conteúdo que aparece na hora certa.
            Ninguém vê a infraestrutura — estratégia, design, tecnologia, mídia, dados e operação — trabalhando
            embaixo da superfície, da tela ao espaço físico.
          </p>
          <p className="x-copy x-copy-punch" data-reveal>
            A MAYVEN constrói <strong>o sistema por trás do sinal.</strong>
          </p>
        </Chapter>

        {/* 03 — THE INVISIBLE WORK */}
        <Chapter id="c-invisible" vh={230} className="x-invisible">
          <p className="x-eyebrow x-mono" data-reveal>02 — THE INVISIBLE WORK</p>
          <h2 className="x-echo" data-text="SYSTEM" data-reveal>
            A diferença está na <em>camada invisível.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Você está atravessando a infraestrutura agora: cada anel, cada conduíte, cada pulso deste túnel é o
            trabalho que ninguém vê — arquitetura, integrações, motion, engenharia — sustentando a experiência
            que todo mundo sente.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['STRATEGY', 'INTERFACE', 'MOTION', 'SYSTEMS', 'MEDIA', 'INTELLIGENCE'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 04 — WHAT WE BUILD */}
        <Chapter id="c-build" vh={360} className="x-build">
          <p className="x-eyebrow x-mono">03 — WHAT WE BUILD</p>
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
          <p className="x-note x-mono">SISTEMAS INTEGRADOS — DA CONCEPÇÃO À OPERAÇÃO. NENHUMA PEÇA SOLTA.</p>
        </Chapter>

        {/* 05 — IMMERSIVE & PHYSICAL */}
        <Chapter id="c-immersive" vh={240} className="x-immersive">
          <p className="x-eyebrow x-mono" data-reveal>04 — IMMERSIVE & PHYSICAL</p>
          <h2 className="x-echo" data-text="BEYOND" data-reveal>
            Presença não vive <em>só na tela.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Projetamos e construímos experiências para o mundo inteiro conectado: realidade aumentada e
            virtual, Apple Vision Pro, IoT, gamificação, totens interativos e soluções tecnológicas para
            eventos — a marca presente onde o público estiver, físico ou digital.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['VISION PRO', 'VR / AR', 'IOT', 'GAMIFICATION', 'TOTENS', 'EVENT TECH'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 06 — METHOD */}
        <Chapter id="c-method" vh={300} className="x-method">
          <p className="x-eyebrow x-mono">05 — METHOD · FROM SIGNAL TO SYSTEM</p>
          <div className="x-method-grid">
            <div className="x-station" key={methodIdx}>
              <span className="x-station-num x-mono">{String(methodIdx + 1).padStart(2, '0')} / 06</span>
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
            NÃO É UMA LINHA. É UM CICLO — VOCÊ ESTÁ ATRAVESSANDO O ANEL: LEARN REALIMENTA DECODE ↺
          </p>
        </Chapter>

        {/* 06 — SELECTED SIGNALS */}
        <Chapter id="c-signals" vh={220} className="x-signals">
          <p className="x-eyebrow x-mono" data-reveal>06 — SELECTED SIGNALS</p>
          <h2 className="x-echo" data-text="SIGNALS" data-reveal>
            Selected <em>Signals</em>
          </h2>
          <p className="x-copy" data-reveal>
            Cases, protótipos e experimentos vão viver aqui. Por enquanto, esta é a forma do que construímos —
            sem números inflados, sem cases emprestados.
          </p>
          <div className="x-signal-row" data-reveal>
            {SIGNALS.map((s, i) => (
              <article key={s.t} data-x="">
                <span className="x-mono">S_{String(i + 1).padStart(2, '0')} · {s.k}</span>
                <h3>{s.t}</h3>
                <b className="x-mono">EM CONSTRUÇÃO</b>
              </article>
            ))}
          </div>
        </Chapter>

        {/* 07 — OPERATION */}
        <Chapter id="c-operation" vh={200} className="x-operation">
          <p className="x-eyebrow x-mono" data-reveal>07 — CONTINUOUS OPERATION</p>
          <h2 className="x-echo" data-text="ALWAYS ON" data-reveal>
            Do lançamento à <em>operação contínua.</em>
          </h2>
          <p className="x-copy" data-reveal>
            Não entregamos um projeto e desaparecemos. Construímos a infraestrutura — e operamos o sistema:
            tecnologia, conteúdo, mídia, canais, CRM, vendas e dados girando juntos, todos os dias.
          </p>
          <ul className="x-tags x-mono" data-reveal>
            {['TECNOLOGIA', 'CONTEÚDO', 'MÍDIA', 'CANAIS', 'CRM', 'VENDAS', 'DADOS'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Chapter>

        {/* 08 — FINAL CTA */}
        <Chapter id="c-cta" vh={170} className="x-cta">
          <p className="x-eyebrow x-mono" data-reveal>08 — LET’S BUILD WHAT COMES NEXT</p>
          <h2 data-reveal>
            Sua marca parece tão forte quanto <em>o que você entrega?</em>
          </h2>
          <p className="x-copy" data-reveal>Se a resposta incomoda, talvez a gente precise conversar.</p>
          <div className="x-hero-ctas" data-reveal>
            <a className="x-btn x-btn-solid" href="mailto:hello@mayven.com.br" data-x="">Start a project</a>
            <a className="x-btn" href="mailto:hello@mayven.com.br" data-x="">Talk to MAYVEN</a>
          </div>
          <footer className="x-foot" data-reveal>
            <div>
              <p className="x-mono">CONTACT</p>
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
              <p className="x-legal">© 2026 MAYVEN — The system behind the signal.</p>
            </div>
          </footer>
        </Chapter>
      </main>
    </div>
  )
}

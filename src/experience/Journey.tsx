import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CH, detectQuality, xstore } from './store'
import HeroPhysicsExperience from './HeroPhysicsExperience'
import { useHeroVariant, usePrefersReducedMotion } from './hooks'
import CasesSection from './CasesSection'
import ContactFinale from './ContactFinale'
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
   normal; o mundo WebGL fixo viaja atrás. Narrativa: manifesto (o mesmo
   de sempre não basta) → a Mayven cria presença → presença diferencia →
   a marca também pode ser vivida → 3 manifestações → método → cases →
   convite.
   ===================================================================== */

/* ---------------- conteúdo (briefing aprovado — não trocar por clichês) ---------------- */

/* frases do manifesto — recuperadas da versão anterior da home (componente Manifesto) */
const SLAMS = ['Posts iguais.', 'Sites iguais.', 'Campanhas iguais.', 'Marcas esquecíveis.']

/* vídeos: colocar os arquivos em public/assets/video/ com estes nomes (ver README de lá).
   Enquanto não existirem, o cartão mostra o placeholder editorial (nunca tela preta). */
const TYPES = [
  {
    t: 'Experiências digitais',
    d: 'Sites, aplicativos, plataformas, e-commerce, marketplaces, interfaces interativas, WebGL, 3D e produtos digitais.',
    sig: ['PIXELS', 'GRIDS', 'SUPERFÍCIES', 'LUZ'],
    video: '/assets/video/type-digital.mp4',
    poster: '/assets/video/type-digital-poster.webp',
  },
  {
    t: 'Experiências de marca e comércio',
    d: 'Jornadas de compra, personalização, CRM, WhatsApp, atendimento, relacionamento, campanhas e experiências omnicanal.',
    sig: ['FLUXOS', 'JORNADAS', 'CONEXÕES', 'SINAIS'],
    video: '/assets/video/type-commerce.mp4',
    poster: '/assets/video/type-commerce-poster.webp',
  },
  {
    t: 'Experiências live e conectadas',
    d: 'Eventos, ativações, lançamentos, totens, instalações, gamificação, realidade aumentada, realidade virtual, sensores, IoT e ambientes interativos.',
    sig: ['ESPAÇOS', 'SENSORES', 'ONDAS', 'PRESENÇA FÍSICA'],
    video: '/assets/video/type-live.mp4',
    poster: '/assets/video/type-live-poster.webp',
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

/* ---------------- manifesto: interlúdio bone entre o hero e "O que fazemos" ----------------
   Efeito recuperado da versão anterior: frases "slam" surgem uma a uma, dirigidas pelo
   scroll (track alto + view sticky + timeline scrubada — sem pin do GSAP, que treme no
   iOS). Desktop mantém o slam original (escala + skew + blur); mobile anima o mesmo
   conceito só com transform/opacity (compositor-friendly no Safari iOS / Chrome Android),
   com ritmo e amplitudes mais curtos. Reduced motion: sem timeline, fluxo editorial
   estático (classe is-anim ausente). */
function ManifestoChapter() {
  const secRef = useRef<HTMLElement>(null)
  const variant = useHeroVariant()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const mobile = variant === 'mobile'
    const ctx = gsap.context(() => {
      /* entrada fluida: a folha bone sobe cobrindo o hero com um leve parallax do conteúdo */
      gsap.fromTo(
        '.x-mani-stage',
        { y: mobile ? 44 : 64 },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: secRef.current, start: 'top bottom', end: 'top top', scrub: true },
        },
      )
      const slams = gsap.utils.toArray<HTMLElement>('.x-mani-slam')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: secRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: mobile ? 0.3 : 0.5,
        },
      })
      const inFrom = mobile
        ? { opacity: 0, scale: 1.7, yPercent: 8 }
        : { opacity: 0, scale: 2.7, skewX: -10, filter: 'blur(10px)' }
      const inTo = mobile
        ? { opacity: 1, scale: 1, yPercent: 0, duration: 1, ease: 'power3.out' }
        : { opacity: 1, scale: 1, skewX: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
      slams.forEach((el) => {
        tl.fromTo(el, inFrom, inTo)
        tl.to(
          el,
          { opacity: 0, y: mobile ? -46 : -70, duration: mobile ? 0.5 : 0.55, ease: 'power2.in' },
          mobile ? '+=0.3' : '+=0.35',
        )
      })
      tl.fromTo(
        '.x-mani-break',
        { opacity: 0, scale: 0.6, rotate: -3 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.6)' },
      )
      tl.fromTo(
        '.x-mani-copy',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        '+=0.2',
      )
      tl.to({}, { duration: 0.8 }) // hold: a frase final assenta antes de liberar p/ "O que fazemos"
    }, secRef)
    return () => ctx.revert()
  }, [variant, reduced])

  return (
    <section
      ref={secRef}
      id="c-manifesto"
      className={`x-ch x-manifesto ${reduced ? '' : 'is-anim'}`}
      style={{ height: '400vh' }}
      aria-label="Manifesto"
    >
      <div className="x-ch-view">
        <div className="x-mani-stage">
          {SLAMS.map((s) => (
            <p className="x-mani-slam" key={s}>
              {s}
            </p>
          ))}
          <p className="x-mani-break">
            Mayven exists for <em>the opposite.</em>
          </p>
          <p className="x-mani-copy">
            O digital ficou genérico. A Mayven cria <strong>presença, percepção e crescimento</strong> para
            marcas que querem ser impossíveis de ignorar.
          </p>
        </div>
        <p className="x-mono x-mani-tag" aria-hidden="true">
          MANIFESTO — SINAL 001
        </p>
      </div>
    </section>
  )
}

/* ---------------- criamos experiências: capítulo editorial (quebra de linguagem) ----------------
   A partir daqui a navegação muda de "viajar por um cenário 3D" para "atravessar uma
   composição editorial viva" — princípio de navegação da seção de projetos do fatfish.ca,
   sem copiar a identidade. Superfície preta opaca cobre progressivamente a viewport (o
   mundo WebGL fica fora de cena), o título entra linha a linha por máscaras com direções/
   escalas/velocidades distintas, e o conteúdo se compõe em camadas tipográficas guiadas
   pelo scroll: linha-guia, faixa que atravessa a tela, selos que se organizam em índice,
   punch final e uma deixa que conduz às três manifestações de "Tipos". Micro-paralaxe de
   cursor nas camadas (desktop). Mobile: mesma linguagem, amplitudes e tipografia adaptadas. */
const XED_STAMPS = ['DIGITAL', 'COMMERCE', 'APPS', 'AR / VR', 'IOT', 'EVENTOS', 'LANÇAMENTOS']
/* dispersão determinística dos selos antes de se organizarem em índice */
const XED_SCATTER = [
  { x: -150, y: -96, r: -8 },
  { x: 120, y: -150, r: 6 },
  { x: -58, y: -210, r: -4 },
  { x: 205, y: -60, r: 9 },
  { x: -225, y: -160, r: 5 },
  { x: 92, y: -240, r: -7 },
  { x: -18, y: -46, r: 3 },
]

function ExperienceEditorial() {
  const secRef = useRef<HTMLElement>(null)
  const variant = useHeroVariant()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const mobile = variant === 'mobile'
    const k = mobile ? 0.3 : 1 // amplitudes bem menores no mobile (selos nunca saem muito da tela)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: secRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: mobile ? 0.35 : 0.5,
        },
      })
      /* A — o título assume: linhas por máscara, direções/escalas/velocidades distintas */
      tl.fromTo('.xed-t1', { xPercent: -112 }, { xPercent: 0, duration: 1.0, ease: 'power4.out', immediateRender: true }, 0)
      tl.fromTo(
        '.xed-t2',
        { xPercent: 116, scale: 1.14, transformOrigin: 'left center' },
        { xPercent: 0, scale: 1, duration: 1.25, ease: 'power4.out', immediateRender: true },
        0.18,
      )
      tl.fromTo('.xed-eyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: true }, 0.55)
      /* palavra-eco em outline atravessa a tela no seu próprio ritmo (parallax 2D) */
      tl.fromTo('.xed-echo', { opacity: 0 }, { opacity: 0.3, duration: 0.6, immediateRender: true }, 0.4)
      tl.fromTo('.xed-echo', { xPercent: 26 }, { xPercent: -48, duration: 6.6, ease: 'none', immediateRender: true }, 0.4)
      /* B — a composição editorial cresce em camadas */
      tl.fromTo(
        '.xed-lead',
        { clipPath: 'inset(0 0 100% 0)', y: 40 },
        { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.9, ease: 'power3.out', immediateRender: true },
        1.55,
      )
      tl.fromTo('.xed-strip', { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: true }, 2.05)
      tl.fromTo(
        '.xed-strip',
        { xPercent: mobile ? 40 : 22 },
        { xPercent: mobile ? -95 : -58, duration: 4.3, ease: 'none', immediateRender: true },
        2.05,
      )
      XED_STAMPS.forEach((_, i) => {
        const o = XED_SCATTER[i]
        tl.fromTo(
          `.xed-stamp-${i}`,
          { autoAlpha: 0, x: o.x * 1.7 * k, y: (o.y * 1.6 - 60) * k, rotation: o.r * 1.6 },
          { autoAlpha: 1, x: o.x * k, y: o.y * k, rotation: o.r, duration: 0.55, ease: 'power3.out', immediateRender: true },
          2.45 + i * 0.16,
        )
      })
      /* C — o punch assume o centro; o título SAI pelas máscaras (mesma linguagem
         da entrada) ANTES do punch entrar — colisão impossível em qualquer resolução */
      tl.to('.xed-lead', { opacity: 0.12, y: -26 * k, duration: 0.6 }, 4.55)
      tl.to('.xed-t1', { yPercent: -118, duration: 0.6, ease: 'power2.in' }, 4.55)
      tl.to('.xed-t2', { yPercent: -124, duration: 0.6, ease: 'power2.in' }, 4.66)
      tl.to('.xed-eyebrow', { opacity: 0, y: -14, duration: 0.4 }, 4.6)
      tl.fromTo('.xed-p1', { yPercent: 120 }, { yPercent: 0, duration: 0.8, ease: 'power4.out', immediateRender: true }, 5.35)
      tl.fromTo('.xed-p2', { yPercent: 130 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', immediateRender: true }, 5.6)
      /* os selos se alinham num índice — preparando as três manifestações */
      tl.to('.xed-stamp', { x: 0, y: 0, rotation: 0, duration: 0.9, ease: 'power3.inOut', stagger: 0.05 }, 5.75)
      tl.to('.xed-strip', { opacity: 0.12, duration: 0.6 }, 5.75)
      tl.fromTo('.xed-cue', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, immediateRender: true }, 6.65)
      tl.to({}, { duration: 0.75 }) // hold antes de liberar para "Tipos"
    }, secRef)

    /* micro-paralaxe de cursor nas camadas (desktop; nada depende de hover) */
    let offMove: (() => void) | undefined
    if (!mobile && matchMedia('(pointer: fine)').matches) {
      const layers = gsap.utils.toArray<HTMLElement>('.xed-layer', secRef.current!)
      const quick = layers.map((el) => ({
        d: Number(el.dataset.depth || 1),
        x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' }),
      }))
      const mm = () => quick.forEach((q) => { q.x(xstore.mx * -7 * q.d); q.y(xstore.my * -5 * q.d) })
      window.addEventListener('mousemove', mm, { passive: true })
      offMove = () => window.removeEventListener('mousemove', mm)
    }
    return () => {
      offMove?.()
      ctx.revert()
    }
  }, [variant, reduced])

  return (
    <section
      ref={secRef}
      id="c-experiencias"
      className={`x-ch x-exped ${reduced ? '' : 'is-anim'}`}
      style={{ height: '460vh' }}
      aria-label="Criamos experiências"
    >
      <div className="x-ch-view">
        <div className="xed-layer xed-layer-echo" data-depth="2.4" aria-hidden="true">
          <span className="xed-echo">VIVIDA</span>
        </div>
        <div className="xed-layer" data-depth="1.15">
          <div className="xed-title">
            <p className="xed-eyebrow x-mono">01 — O QUE FAZEMOS</p>
            <h2 aria-label="Criamos experiências.">
              <span className="xed-mask" aria-hidden="true">
                <span className="xed-line xed-t1">Criamos</span>
              </span>
              <span className="xed-mask" aria-hidden="true">
                <span className="xed-line xed-t2"><em>experiências.</em></span>
              </span>
            </h2>
          </div>
        </div>
        <div className="xed-layer" data-depth="0.7">
          <p className="xed-lead">Projetamos novas formas de interação entre marcas e pessoas.</p>
        </div>
        <div className="xed-strip x-mono" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>EXPERIÊNCIAS DIGITAIS · COMERCIAIS · FÍSICAS · CONECTADAS — </span>
          ))}
        </div>
        <p className="xed-sr">Experiências digitais, comerciais, físicas e conectadas.</p>
        <div className="xed-layer" data-depth="1.7">
          <ul className="xed-stamps" aria-label="Territórios de experiência">
            {XED_STAMPS.map((s, i) => (
              <li key={s} className={`x-mono xed-stamp xed-stamp-${i}`}>{s}</li>
            ))}
          </ul>
        </div>
        <p className="xed-punch">
          <span className="xed-pmask">
            <span className="xed-pline xed-p1">Uma marca precisa ser percebida.</span>
          </span>
          <span className="xed-pmask">
            <span className="xed-pline xed-p2">Uma experiência precisa ser <em>vivida.</em></span>
          </span>
        </p>
        <p className="xed-cue x-mono" aria-hidden="true">TRÊS MANIFESTAÇÕES ↓</p>
      </div>
    </section>
  )
}

/* ---------------- tipos: cartão de vídeo (fonte única de verdade = typeIdx) ----------------
   O cartão vive DENTRO da view sticky do capítulo — estruturalmente não pode existir
   fora de #c-tipos nem invadir "Método". O MESMO índice que dirige número, título,
   descrição e lista dirige o slot ativo: crossfade por CSS entre camadas empilhadas
   (nunca tela preta — o placeholder charcoal fica por baixo). Monta só o vídeo ativo
   + o próximo; reproduz apenas o ativo, e apenas com o cartão em viewport e a aba
   visível. prefers-reduced-motion: poster estático, sem <video>. */
function TypeCard({ idx }: { idx: number }) {
  const boxRef = useRef<HTMLElement>(null)
  const vids = useRef<Array<HTMLVideoElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const [inView, setInView] = useState(false)
  const [mounted, setMounted] = useState<number[]>([0, 1])

  /* carrega prioritariamente o ativo e, no máximo, o próximo — nunca recria os já montados */
  useEffect(() => {
    setMounted((m) => {
      const need = [idx, Math.min(idx + 1, TYPES.length - 1)].filter((i) => !m.includes(i))
      return need.length ? [...m, ...need] : m
    })
  }, [idx])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* só o vídeo ativo reproduz; pausa ao sair da seção/aba e retoma ao voltar */
  useEffect(() => {
    const sync = () => {
      vids.current.forEach((v, i) => {
        if (!v) return
        if (i === idx && inView && !reduced && !document.hidden) v.play().catch(() => {})
        else if (!v.paused) v.pause()
      })
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [idx, inView, reduced])

  return (
    <aside ref={boxRef} className="xt-card" aria-hidden="true">
      <div className="xt-media">
        {TYPES.map((ty, i) => (
          <div key={ty.t} className={`xt-slot ${i === idx ? 'is-on' : ''}`}>
            <div className="xt-ph">
              <b>0{i + 1}</b>
              <span className="x-mono">{ty.sig[0]} · {ty.sig[1]}</span>
            </div>
            {reduced ? (
              <img src={ty.poster} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              mounted.includes(i) && (
                <video
                  ref={(el) => { vids.current[i] = el }}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={ty.poster}
                >
                  <source src={ty.video} type="video/mp4" />
                </video>
              )
            )}
          </div>
        ))}
      </div>
      <p className="xt-caption x-mono" key={idx}>
        <span>T_0{idx + 1}</span>
        <span>{TYPES[idx].t}</span>
        <i />
      </p>
    </aside>
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
    /* única zona clara restante: manifesto → presença (cases agora é capítulo escuro opaco) */
    const zones: Array<readonly [number, number]> = [[CH.manifesto[0], CH.presenca[1]]]
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

        {/* 01.5 — MANIFESTO (interlúdio bone: frases no scroll, recuperado da versão anterior) */}
        <ManifestoChapter />

        {/* 02 — O QUE FAZEMOS · TERRITÓRIO 1 (a zona bone começa no manifesto e segue por aqui) */}
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

        {/* 03 — O QUE FAZEMOS · TERRITÓRIO 2 — capítulo editorial: aqui a linguagem
            de navegação 3D é interrompida (superfície preta, tipografia, máscaras, scroll) */}
        <ExperienceEditorial />

        {/* 04 — TIPOS DE EXPERIÊNCIA — typeIdx é a ÚNICA fonte de verdade: dirige o
            número, o título, a descrição, as tags, a lista E o cartão de vídeo.
            Terços do progresso local de #c-tipos via useChapterIndex (sobe e desce). */}
        <Chapter id="c-tipos" vh={300} className="x-tipos">
          <p className="x-eyebrow x-mono">02 — TIPOS DE EXPERIÊNCIA</p>
          <div className="xt-grid">
            <span className="xt-idx" aria-hidden="true" key={`n${typeIdx}`}>
              0{typeIdx + 1}
            </span>
            <h2 className="xt-title xt-swap" key={`t${typeIdx}`}>{TYPES[typeIdx].t}</h2>
            <TypeCard idx={typeIdx} />
            <p className="xt-desc xt-swap" key={`d${typeIdx}`}>{TYPES[typeIdx].d}</p>
            <ul className="x-tags x-mono x-type-sig xt-sig xt-swap" key={`s${typeIdx}`}>
              {TYPES[typeIdx].sig.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <ol className="xt-list">
              {TYPES.map((s, i) => (
                <li key={s.t} className={i === typeIdx ? 'is-on' : ''}>
                  <span className="x-mono">0{i + 1}</span> {s.t}
                </li>
              ))}
            </ol>
            <div className="xt-dots" aria-hidden="true">
              {TYPES.map((s, i) => <i key={s.t} className={i === typeIdx ? 'is-on' : ''} />)}
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

        {/* 06 — CASES — capítulo editorial próprio (princípio da section_join):
            sem objetos 3D, mídia protagonista, timeline única scrubada */}
        <CasesSection />

        {/* 07 — CONTATO — o finale: painel charcoal sobre fundo magenta,
            composição centralizada, sem objetos 3D (ver ContactFinale) */}
        <ContactFinale />
      </main>
    </div>
  )
}

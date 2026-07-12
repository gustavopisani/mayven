import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '../lib/ui'
import { DPR_CAP, quality } from '../lib/bus'

const InvisibleProcessor = lazy(() => import('../three/InvisibleProcessor'))

const LAYERS = [
  {
    key: 'strategy',
    pill: 'Strategy',
    title: 'Antes de criar, encontramos o sinal.',
    desc: 'Mercado, público, percepção e oportunidade deixam de ser ruído e viram direção.',
    hud: 'SIGNAL MAP — NOISE → DIRECTION',
    accent: '#EC0B57',
  },
  {
    key: 'interface',
    pill: 'Interface',
    title: 'A superfície precisa ter intenção.',
    desc: 'Grid, hierarquia, ritmo e interação transformam layout em experiência.',
    hud: 'PIXEL RECONSTRUCTION — CURSOR SHARPENS',
    accent: '#F4F1EA',
  },
  {
    key: 'motion',
    pill: 'Motion',
    title: 'Movimento não é decoração.',
    desc: 'Timing, profundidade e resposta criam narrativa antes mesmo do usuário perceber.',
    hud: 'TIME ECHO — VELOCITY TRAILS',
    accent: '#EC0B57',
  },
  {
    key: 'systems',
    pill: 'Systems',
    title: 'O invisível sustenta o impacto.',
    desc: 'Arquitetura, plataformas, integrações e código transformam uma ideia visual em sistema real.',
    hud: 'X-RAY SCANNER — MOVE THE CURSOR',
    accent: '#2D6CFF',
  },
  {
    key: 'media',
    pill: 'Media',
    title: 'Conteúdo não é calendário.',
    desc: 'Cada peça nasce conectada a distribuição, contexto e construção de presença.',
    hud: 'CONTENT MULTIPLICATION — 1 SIGNAL → 24 SURFACES',
    accent: '#EC0B57',
  },
  {
    key: 'intelligence',
    pill: 'Intelligence',
    title: 'O sistema aprende.',
    desc: 'Dados, IA e leitura de performance alimentam a próxima decisão criativa.',
    hud: 'LEARNING LOOP — OUTPUT FEEDS INPUT',
    accent: '#D7FF3F',
  },
]

const SEGMENTS = 6.6 // 6 layers + final message tail

export default function InvisibleWork() {
  const secRef = useRef<HTMLElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const [scrollLayer, setScrollLayer] = useState(0)
  const [hoverLayer, setHoverLayer] = useState<number | null>(null)
  const [finalOn, setFinalOn] = useState(false)
  const [stageOn, setStageOn] = useState(false)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  const live = !mobile && !reduced

  const active = hoverLayer ?? scrollLayer
  const lay = LAYERS[active]

  useEffect(() => {
    if (!live) return
    // mount the heavy processor one viewport early
    const pre = ScrollTrigger.create({
      trigger: secRef.current,
      start: 'top bottom+=100%',
      once: true,
      onEnter: () => setStageOn(true),
    })
    const st = ScrollTrigger.create({
      trigger: secRef.current,
      start: 'top top',
      end: `+=${SEGMENTS * 100}%`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const seg = self.progress * SEGMENTS
        const idx = Math.min(LAYERS.length - 1, Math.floor(seg))
        setScrollLayer((p) => (p === idx ? p : idx))
        setFinalOn(seg > 6.02)
      },
    })
    stRef.current = st
    return () => {
      pre.kill()
      st.kill()
      stRef.current = null
    }
  }, [live])

  /* click = jump the page scroll to that layer's segment (state stays scroll-consistent) */
  const jumpTo = (i: number) => {
    const st = stRef.current
    if (!st) return
    const target = st.start + ((i + 0.5) / SEGMENTS) * (st.end - st.start)
    const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number) => void } }).__lenis
    if (lenis) lenis.scrollTo(target)
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <section
      ref={secRef}
      id="tech"
      className={`iwork ${live ? 'is-pinned' : ''}`}
      style={{ ['--lay-accent' as string]: lay.accent }}
    >
      <div className="iw-hud mono" aria-hidden="true">
        <span>THE INVISIBLE WORK</span>
        <span className="iw-hud-mode">{lay.hud}</span>
        <span>
          LAYER {String(active + 1).padStart(2, '0')} / 06
        </span>
      </div>

      {live ? (
        <div className="iw-screen">
          {/* LEFT — copy + layer pills */}
          <div className="iw-left">
            <p className="sec-eyebrow mono">03 — THE INVISIBLE WORK</p>
            <h2 className="sec-title iw-title">
              A diferença está na <em>camada invisível.</em>
            </h2>
            <p className="iw-sub">
              Por trás de uma experiência marcante existe um sistema: estratégia, interface, movimento,
              engenharia, mídia, inteligência e performance trabalhando juntos.
            </p>

            <div className="iw-active" key={lay.key} aria-live="polite">
              <h3>{lay.title}</h3>
              <p>{lay.desc}</p>
            </div>

            <div className="iw-pills" role="tablist" aria-label="Camadas do sistema invisível">
              {LAYERS.map((l, i) => (
                <button
                  key={l.key}
                  role="tab"
                  aria-selected={i === active}
                  className={`iw-pill mono ${i === active ? 'is-active' : ''} ${i === scrollLayer ? 'is-scroll' : ''}`}
                  data-cursor=""
                  onMouseEnter={() => setHoverLayer(i)}
                  onMouseLeave={() => setHoverLayer(null)}
                  onFocus={() => setHoverLayer(i)}
                  onBlur={() => setHoverLayer(null)}
                  onClick={() => jumpTo(i)}
                >
                  {l.pill}
                </button>
              ))}
            </div>

            <div className="iw-progress" aria-hidden="true">
              {LAYERS.map((_, i) => (
                <i key={i} className={i === scrollLayer ? 'is-active' : i < scrollLayer ? 'is-done' : ''} />
              ))}
            </div>
          </div>

          {/* RIGHT — the visual processor */}
          <div className="iw-stage" aria-hidden="true">
            {stageOn && (
              <Suspense fallback={<div className="iw-loading mono">DECODING SIGNAL SOURCE…</div>}>
                <InvisibleProcessor mode={active} active={stageOn} dprCap={DPR_CAP[quality()]} />
              </Suspense>
            )}

            {/* per-layer DOM overlays */}
            <div className={`iw-ov iw-ov-strategy ${active === 0 ? 'is-on' : ''}`}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="16" y1="72" x2="42" y2="38" />
                <line x1="42" y1="38" x2="70" y2="52" />
                <line x1="70" y1="52" x2="88" y2="22" />
                {[[16, 72], [42, 38], [70, 52], [88, 22]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="1.6" style={{ ['--i' as string]: i }} />
                ))}
              </svg>
              <span className="mono iw-tag" style={{ left: '12%', top: '76%' }}>NOISE</span>
              <span className="mono iw-tag is-accent" style={{ left: '82%', top: '12%' }}>SIGNAL</span>
            </div>

            <div className={`iw-ov iw-ov-interface ${active === 1 ? 'is-on' : ''}`}>
              <i className="iw-corner tl" /><i className="iw-corner tr" /><i className="iw-corner bl" /><i className="iw-corner br" />
              <span className="mono iw-tag" style={{ right: '4%', bottom: '5%' }}>GRID 12 · RHYTHM 8PX</span>
            </div>

            <div className={`iw-ov iw-ov-motion ${active === 2 ? 'is-on' : ''}`}>
              <span className="mono iw-tag" style={{ left: '4%', top: '6%' }}>Δt +0.16S</span>
              <i className="iw-vline" style={{ left: '22%' }} /><i className="iw-vline" style={{ left: '52%' }} /><i className="iw-vline" style={{ left: '82%' }} />
            </div>

            <div className={`iw-ov iw-ov-eng ${active === 3 ? 'is-on' : ''}`}>
              <span className="mono iw-tag" style={{ left: '4%', bottom: '5%' }}>STRUCTURE — LAYER 04/07</span>
              <i className="iw-measure" style={{ top: '18%' }} /><i className="iw-measure" style={{ top: '58%' }} />
            </div>

            <div className={`iw-ov iw-ov-media ${active === 4 ? 'is-on' : ''}`}>
              <span className="iw-minicard" style={{ left: '5%', top: '8%' }}><b /><i /></span>
              <span className="iw-minicard tall" style={{ right: '6%', top: '14%' }}><b /><i /></span>
              <span className="iw-minicard" style={{ right: '14%', bottom: '10%' }}><b /><i /></span>
              <span className="mono iw-tag is-accent" style={{ left: '5%', bottom: '6%' }}>1 SIGNAL → 24 OUTPUTS</span>
            </div>

            <div className={`iw-ov iw-ov-intel ${active === 5 ? 'is-on' : ''}`}>
              <span className="mono iw-prompt">&gt; read performance --feed=strategy</span>
              <span className="mono iw-tag" style={{ right: '5%', top: '8%' }}>LOOP 042 — LEARNING</span>
            </div>

            <span className="iw-stage-frame" aria-hidden="true" />
          </div>

          {/* final message over everything at the tail of the pin */}
          <p className={`iw-final ${finalOn ? 'is-on' : ''}`}>
            Creative technology is not an effect. <em>It is the system behind the feeling.</em>
          </p>
        </div>
      ) : (
        /* mobile / reduced-motion: editorial stack, no video processing */
        <div className="iw-static">
          <p className="sec-eyebrow mono">03 — THE INVISIBLE WORK</p>
          <h2 className="sec-title iw-title">
            A diferença está na <em>camada invisível.</em>
          </h2>
          {LAYERS.map((l, i) => (
            <article key={l.key}>
              <span className="mono">{String(i + 1).padStart(2, '0')} — {l.pill.toUpperCase()}</span>
              <h3>{l.title}</h3>
              <p>{l.desc}</p>
            </article>
          ))}
          <p className="iw-final-static">
            Creative technology is not an effect. <em>It is the system behind the feeling.</em>
          </p>
        </div>
      )}
    </section>
  )
}

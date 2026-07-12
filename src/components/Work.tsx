import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useIsMobile, useReducedMotion } from '../lib/ui'

/* Premium case FRAMEWORK — honest placeholders until real cases are defined. */
const FRAMES = [
  {
    id: 'brand',
    title: 'Brand Recode',
    line: 'Posicionamento, identidade e narrativa reconstruídos como sistema.',
    accent: '#EC0B57',
    viz: 'board',
  },
  {
    id: 'webx',
    title: 'Web Experience',
    line: 'Sites que se comportam como produto — não como panfleto.',
    accent: '#2D6CFF',
    viz: 'browser',
  },
  {
    id: 'engine',
    title: 'Content Engine',
    line: 'Operação editorial com estratégia, cadência e memória.',
    accent: '#D7FF3F',
    viz: 'cards',
  },
  {
    id: 'proto',
    title: 'Creative Tech Prototype',
    line: 'WebGL, 3D e interação em protótipos navegáveis.',
    accent: '#FF3D5A',
    viz: 'viewer',
  },
]

function Viz({ kind }: { kind: string }) {
  if (kind === 'board')
    return (
      <div className="frame-viz viz-board" aria-hidden="true">
        <i className="vb-swatch" />
        <i className="vb-type">Aa</i>
        <i className="vb-bar" />
        <i className="vb-bar short" />
      </div>
    )
  if (kind === 'browser')
    return (
      <div className="frame-viz viz-browser" aria-hidden="true">
        <span className="vb-chrome" />
        <i className="vb-hero" />
        <i className="vb-bar" />
        <i className="vb-bar short" />
      </div>
    )
  if (kind === 'cards')
    return (
      <div className="frame-viz viz-cards" aria-hidden="true">
        <i /><i /><i />
      </div>
    )
  return (
    <div className="frame-viz viz-viewer" aria-hidden="true">
      <i className="vb-orb" />
      <i className="vb-ring" />
      <span className="vb-tag mono">360°</span>
    </div>
  )
}

export default function Work() {
  const secRef = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (mobile || reduced) return
    const cards = gsap.utils.toArray<HTMLElement>('.frame-card', secRef.current!)
    const handlers: Array<() => void> = []
    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        gsap.to(card, { rotateY: x * 7, rotateX: -y * 6, duration: 0.5, ease: 'power2.out', transformPerspective: 800 })
      }
      const leave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
      card.addEventListener('mousemove', move)
      card.addEventListener('mouseleave', leave)
      handlers.push(() => {
        card.removeEventListener('mousemove', move)
        card.removeEventListener('mouseleave', leave)
      })
    })
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: secRef.current, start: 'top 70%' },
        },
      )
    }, secRef)
    return () => {
      handlers.forEach((h) => h())
      ctx.revert()
    }
  }, [mobile, reduced])

  return (
    <section ref={secRef} id="work" className="frames">
      <header className="sec-head frames-head">
        <p className="sec-eyebrow mono">05 — SELECTED SIGNALS</p>
        <h2 className="sec-title">
          Selected <em>Signals</em>
        </h2>
        <p className="sec-copy">
          Cases, protótipos e experimentos vão viver aqui. Por enquanto, esta é a forma do que construímos.
        </p>
      </header>

      <div className="frame-grid">
        {FRAMES.map((f, i) => (
          <article
            className="frame-card"
            key={f.id}
            style={{ ['--accent' as string]: f.accent }}
            tabIndex={0}
            data-cursor="SOON"
          >
            <span className="frame-num mono">S_{String(i + 1).padStart(2, '0')}</span>
            <Viz kind={f.viz} />
            <h3>{f.title}</h3>
            <p>{f.line}</p>
            <span className="frame-tag mono">FRAMEWORK — CASES EM CONSTRUÇÃO</span>
          </article>
        ))}
      </div>

      <p className="work-note mono">● SEM CASES INVENTADOS. SEM NÚMEROS INFLADOS. QUANDO HOUVER SINAL, ELE APARECE AQUI.</p>
    </section>
  )
}

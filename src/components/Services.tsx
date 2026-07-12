import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useIsMobile, useReducedMotion } from '../lib/ui'
import SignalWeb from './fx/SignalWeb'
import CardFx from './fx/CardFx'

const CARDS = [
  {
    n: '01',
    fx: 'brand',
    title: 'Brand & Digital Experiences',
    desc: 'Posicionamento, identidade, sites, experiências imersivas, interfaces, motion e 3D.',
    tech: ['POSITIONING', 'IDENTITY', 'WEBGL / 3D', 'MOTION'],
  },
  {
    n: '02',
    fx: 'media',
    title: 'Commerce & Growth',
    desc: 'E-commerce, jornadas de conversão, landing pages, campanhas, mídia e otimização.',
    tech: ['E-COMMERCE', 'CRO', 'PAID MEDIA', 'ANALYTICS'],
  },
  {
    n: '03',
    fx: 'web',
    title: 'Platforms & Integrations',
    desc: 'Plataformas, aplicativos, APIs, integrações, sistemas internos e experiências conectadas.',
    tech: ['APPS', 'APIS', 'INTEGRAÇÕES', 'SISTEMAS'],
  },
  {
    n: '04',
    fx: 'ai',
    title: 'Sales & Relationship Systems',
    desc: 'CRM, WhatsApp Business, automações comerciais, atendimento e integrações de vendas.',
    tech: ['CRM', 'WHATSAPP', 'AUTOMAÇÃO', 'PIPELINE'],
  },
  {
    n: '05',
    fx: 'content',
    title: 'Content & Media Operations',
    desc: 'Estratégia editorial, criação de conteúdo, gestão de canais, campanhas e distribuição.',
    tech: ['EDITORIAL', 'CANAIS', 'CAMPANHAS', 'DISTRIBUIÇÃO'],
  },
  {
    n: '06',
    fx: 'tech',
    title: 'AI & Automation',
    desc: 'Agentes, IA aplicada, automações, personalização, análise e experiências generativas.',
    tech: ['AGENTES', 'WORKFLOWS', 'PERSONALIZAÇÃO', 'GENERATIVE'],
  },
]

export default function Services() {
  const secRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()

  // 3D tilt + magnetic drift per card
  useEffect(() => {
    if (mobile || reduced) return
    const cards = gsap.utils.toArray<HTMLElement>('.svc-card', secRef.current!)
    const handlers: Array<() => void> = []
    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        gsap.to(card, {
          rotateY: x * 9,
          rotateX: -y * 7,
          x: x * 10,
          y: y * 8,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 900,
        })
      }
      const leave = () =>
        gsap.to(card, { rotateY: 0, rotateX: 0, x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.45)' })
      card.addEventListener('mousemove', move)
      card.addEventListener('mouseleave', leave)
      handlers.push(() => {
        card.removeEventListener('mousemove', move)
        card.removeEventListener('mouseleave', leave)
      })
    })

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 70 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: card, start: 'top 88%' },
          },
        )
      })
    }, secRef)
    return () => {
      handlers.forEach((h) => h())
      ctx.revert()
    }
  }, [mobile, reduced])

  return (
    <section ref={secRef} id="build" className="services">
      <header className="sec-head">
        <p className="sec-eyebrow mono">02 — WHAT WE BUILD</p>
        <h2 className="sec-title">
          Sistemas, não <em>peças soltas.</em>
        </h2>
        <p className="sec-copy">
          Da concepção estratégica à operação contínua: seis sistemas integrados, conectados por um único
          sinal. Passe o cursor — cada módulo é vivo.
        </p>
      </header>

      <div ref={gridRef} className="svc-grid">
        {!mobile && !reduced && <SignalWeb gridRef={gridRef} />}
        {CARDS.map((c) => (
          <article className="svc-card" key={c.n} data-cursor="+" tabIndex={0}>
            <span className="svc-num mono">{c.n}</span>
            <h3 className="svc-title">{c.title}</h3>
            <p className="svc-desc">{c.desc}</p>
            <div className="svc-fx-slot">
              <CardFx kind={c.fx} />
            </div>
            <ul className="svc-tech mono" aria-label={`Capacidades de ${c.title}`}>
              {c.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <span className="svc-border" aria-hidden="true" />
            <span className="svc-glow" aria-hidden="true" />
          </article>
        ))}
      </div>
      <p className="svc-note mono">● SEIS MÓDULOS. UM SISTEMA. NENHUMA PEÇA SOLTA.</p>
    </section>
  )
}

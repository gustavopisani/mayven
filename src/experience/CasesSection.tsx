import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CASES } from './data/cases'
import { useHeroVariant, usePrefersReducedMotion } from './hooks'

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================
   04 — CASES: capítulo editorial em tela cheia (princípio da section_join).
   Nada de objetos 3D atravessando a câmera: superfície opaca própria,
   composição por camadas, mídia protagonista, tudo revelado por máscaras
   e clip-path numa ÚNICA timeline scrubada (funciona nos dois sentidos).
   Beats: intro tipográfica → CASE 01 (AURA, mídia em coluna cheia) →
   A SEGUIR (dois recortes) → saída limpa DENTRO dos limites da seção.
   Mobile: mídia full-width no alto, texto abaixo — nada cortado, nada
   sobre a imagem. Reduced motion: fluxo estático legível.
   ===================================================================== */

const FEATURED = CASES[0]
const UPCOMING = CASES.slice(1)

export default function CasesSection() {
  const secRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const variant = useHeroVariant()
  const reduced = usePrefersReducedMotion()
  const [beat, setBeat] = useState(0) // 0 intro · 1 case em destaque · 2 a seguir

  useEffect(() => {
    if (reduced) return
    const mobile = variant === 'mobile'
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: secRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: mobile ? 0.35 : 0.5,
          onUpdate: (self) => {
            // mesma fonte de verdade do scrub controla o beat (playback do vídeo + indicadores)
            const b = self.progress < 0.29 ? 0 : self.progress < 0.68 ? 1 : 2
            setBeat((p) => (p === b ? p : b))
          },
        },
      })
      const IR = { immediateRender: true as const }

      /* cabeçalho persistente do capítulo */
      tl.fromTo('.xcs-head', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ...IR }, 0)

      /* intro: o título da seção entra com presença, linha a linha por máscara */
      tl.fromTo('.xcs-i1', { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', ...IR }, 0.1)
      tl.fromTo('.xcs-i2', { yPercent: 124 }, { yPercent: 0, duration: 1.0, ease: 'power4.out', ...IR }, 0.28)
      tl.fromTo('.xcs-icopy', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ...IR }, 0.75)
      tl.to('.xcs-i1', { yPercent: -118, duration: 0.6, ease: 'power2.in' }, 1.9)
      tl.to('.xcs-i2', { yPercent: -124, duration: 0.6, ease: 'power2.in' }, 2.0)
      tl.to('.xcs-icopy', { opacity: 0, y: -20, duration: 0.4 }, 1.95)

      /* CASE 01 — a mídia assume por recorte; textos em momentos sincronizados */
      tl.fromTo(
        '.xcs-media',
        { clipPath: mobile ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', ...IR },
        2.3,
      )
      tl.fromTo('.xcs-media-inner', { scale: 1.14 }, { scale: 1, duration: 2.2, ease: 'power2.out', ...IR }, 2.3)
      tl.fromTo('.xcs-meta', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.45, ...IR }, 2.62)
      tl.fromTo('.xcs-t1', { yPercent: 120 }, { yPercent: 0, duration: 0.75, ease: 'power4.out', ...IR }, 2.74)
      tl.fromTo('.xcs-desc', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, ...IR }, 2.98)
      tl.fromTo(
        '.xcs-serv li',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ...IR },
        3.14,
      )
      /* saída do case — desaparece dentro dos limites da seção */
      tl.to('.xcs-media', { clipPath: mobile ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)', duration: 0.8, ease: 'power3.in' }, 4.7)
      tl.to('.xcs-t1', { yPercent: -120, duration: 0.55, ease: 'power2.in' }, 4.7)
      tl.to('.xcs-meta', { opacity: 0, y: -18, duration: 0.45 }, 4.7)
      tl.to('.xcs-desc', { opacity: 0, y: -18, duration: 0.45 }, 4.75)
      tl.to('.xcs-serv li', { opacity: 0, y: -10, duration: 0.3, stagger: 0.03 }, 4.7)

      /* A SEGUIR — novo enquadramento: dois recortes sobem por clip-path */
      tl.fromTo('.xcs-next-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ...IR }, 5.35)
      tl.fromTo(
        '.xcs-tease-0',
        { clipPath: 'inset(100% 0% 0% 0%)', y: 34 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.8, ease: 'power3.out', ...IR },
        5.5,
      )
      tl.fromTo(
        '.xcs-tease-1',
        { clipPath: 'inset(100% 0% 0% 0%)', y: 34 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.8, ease: 'power3.out', ...IR },
        5.72,
      )

      /* saída limpa para "05 — Começar": nada permanece na tela ao despinar */
      tl.to('.xcs-next-label', { opacity: 0, y: -22, duration: 0.45 }, 6.9)
      tl.to('.xcs-tease-0', { opacity: 0, y: -30, duration: 0.5 }, 6.95)
      tl.to('.xcs-tease-1', { opacity: 0, y: -30, duration: 0.5 }, 7.02)
      tl.to('.xcs-head', { opacity: 0, duration: 0.35 }, 7.2)
      tl.to({}, { duration: 0.45 }) // respiro antes de liberar o capítulo
    }, secRef)
    return () => ctx.revert()
  }, [variant, reduced])

  /* o vídeo do case só reproduz no beat do case, com a aba visível */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const sync = () => {
      if (beat === 1 && !reduced && !document.hidden) v.play().catch(() => {})
      else if (!v.paused) v.pause()
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [beat, reduced])

  return (
    <section
      ref={secRef}
      id="c-cases"
      className={`x-ch x-xcs ${reduced ? '' : 'is-anim'}`}
      style={{ height: '420vh' }}
      aria-label="Cases"
    >
      <div className="x-ch-view">
        <header className="xcs-head">
          <p className="x-mono xcs-eyebrow">04 — CASES</p>
          <div className="xcs-bars" aria-hidden="true">
            <i className={beat === 1 ? 'is-on' : ''} />
            <i className={beat === 2 ? 'is-on' : ''} />
            <i className={beat === 2 ? 'is-on' : ''} />
          </div>
        </header>

        <div className="xcs-intro">
          <h2 aria-label="Poucos projetos, contados a fundo.">
            <span className="xcs-mask" aria-hidden="true">
              <span className="xcs-line xcs-i1">Poucos projetos,</span>
            </span>
            <span className="xcs-mask" aria-hidden="true">
              <span className="xcs-line xcs-i2"><em>contados a fundo.</em></span>
            </span>
          </h2>
          <p className="xcs-icopy">
            Contexto, desafio, ideia, experiência e sistema — cada case mostra como uma ambição
            ganhou presença. Sem números inflados, sem cases emprestados.
          </p>
        </div>

        {/* CASE 01 — enquadramento próprio: mídia em coluna cheia + texto assimétrico */}
        <article className="xcs-case">
          <figure className="xcs-media">
            <div className="xcs-media-inner">
              <div className="xcs-ph">
                <b>01</b>
                <span className="x-mono">AURA CAFÉ — LANÇAMENTO CONECTADO</span>
              </div>
              {reduced ? (
                FEATURED.image && (
                  <img src={FEATURED.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                )
              ) : (
                FEATURED.video && (
                  <video ref={videoRef} muted loop playsInline preload="metadata" poster={FEATURED.image}>
                    <source src={FEATURED.video} type="video/mp4" />
                  </video>
                )
              )}
            </div>
          </figure>
          <div className="xcs-copy">
            <p className="x-mono xcs-meta">
              <span>C_01</span> {FEATURED.category} · {FEATURED.year} · <em>{FEATURED.status}</em>
            </p>
            <h3 aria-label={FEATURED.title}>
              <span className="xcs-mask" aria-hidden="true">
                <span className="xcs-line xcs-t1">{FEATURED.title}</span>
              </span>
            </h3>
            <p className="xcs-desc">{FEATURED.description}</p>
            <ul className="xcs-serv x-mono" aria-label="Serviços">
              {(FEATURED.services ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </article>

        {/* A SEGUIR — os próximos cases, sem inventar conteúdo */}
        <div className="xcs-next">
          <p className="x-mono xcs-next-label">A SEGUIR</p>
          {UPCOMING.map((c, i) => (
            <article key={c.slug} className={`xcs-tease xcs-tease-${i}`}>
              <b aria-hidden="true">0{i + 2}</b>
              <h3>{c.title.replace('Próximo case — ', '')}</h3>
              <p className="x-mono">{c.area}</p>
              <span className="x-mono xcs-chip">{c.status}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

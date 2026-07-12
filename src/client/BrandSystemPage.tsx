import { useEffect, useRef, useState } from 'react'
import type { BrandSystemContent } from '../data/platform/types'
import { trackClientEvent } from '../lib/reportAnalytics'
import { useRevealObserver } from './components'

const NAV = [
  { id: 'north-star', num: '01', label: 'North Star' },
  { id: 'posicionamento', num: '02', label: 'Posicionamento' },
  { id: 'narrativa', num: '03', label: 'Narrativa' },
  { id: 'proposta', num: '04', label: 'Proposta de valor' },
  { id: 'principios', num: '05', label: 'Princípios' },
  { id: 'publicos', num: '06', label: 'Públicos' },
  { id: 'voz', num: '07', label: 'Voz' },
  { id: 'territorios', num: '08', label: 'Territórios' },
  { id: 'aplicacao', num: '09', label: 'Aplicação' },
  { id: 'evolucao', num: '10', label: 'Evolução' },
]

export default function BrandSystemPage({
  content,
  clientSlug,
}: {
  content: BrandSystemContent
  clientSlug: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState('')
  useRevealObserver(rootRef)

  useEffect(() => {
    trackClientEvent('brand_system_opened', { client: clientSlug })
  }, [clientSlug])

  /* índice lateral: destaca a seção visível */
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    NAV.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) spy.observe(el)
    })
    return () => spy.disconnect()
  }, [])

  const s = content.sections
  return (
    <div ref={rootRef} className="mv-report mv-bs">
      <nav className="mv-bs-nav" aria-label="Seções do Brand System">
        <ul>
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className={active === n.id ? 'is-active' : ''}>
                <span className="mono">{n.num}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* HEADER */}
      <section className="mv-hub-hero" aria-label="Abertura do Brand System">
        <p className="mv-eyebrow mono" data-mv-reveal>
          {content.eyebrow}
        </p>
        <h1 className="mv-hub-title" data-mv-reveal>
          {content.title}
        </h1>
        <p className="mv-hero-sub" data-mv-reveal>
          {content.intro}
        </p>
        <ul className="mv-hub-indicators" data-mv-reveal aria-label="Estado do sistema de marca">
          {content.indicators.map((i) => (
            <li key={i.label} className="mv-badge mono">
              {i.label.toUpperCase()} · {i.value.toUpperCase()}
            </li>
          ))}
        </ul>
        <p className="mv-bs-back" data-mv-reveal>
          <a className="mv-btn mv-btn-ghost" href={`/client/${clientSlug}`}>
            ← Voltar para os módulos
          </a>
        </p>
      </section>

      {/* 01 · NORTH STAR */}
      <section id="north-star" className="mv-sec" aria-label="North Star">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">01 · NORTH STAR</p>
          <h2 className="mv-sec-title">{s.northStar.title}</h2>
        </header>
        <p className="mv-highlight" data-mv-reveal>
          {s.northStar.copy}
        </p>
      </section>

      {/* 02 · POSICIONAMENTO */}
      <section id="posicionamento" className="mv-sec" aria-label="Posicionamento">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">02 · POSICIONAMENTO</p>
          <h2 className="mv-sec-title">{s.positioning.title}.</h2>
          <p className="mv-copy">{s.positioning.copy}</p>
        </header>
        <div className="mv-grid mv-grid-3">
          {s.positioning.pillars.map((p, i) => (
            <article key={p} className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
              <p className="mv-card-num mono">P{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mv-card-title">{p}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* 03 · NARRATIVA */}
      <section id="narrativa" className="mv-sec" aria-label="Narrativa">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">03 · NARRATIVA</p>
          <h2 className="mv-sec-title">{s.narrative.title}.</h2>
        </header>
        <p className="mv-highlight" data-mv-reveal>
          {s.narrative.copy}
        </p>
        <div className="mv-map" data-mv-reveal role="img" aria-label={`Fluxo da narrativa: ${s.narrative.flow.join(', ')}`}>
          <ol className="mv-map-flow">
            {s.narrative.flow.map((n, i) => (
              <li key={n} className="mv-map-node" style={{ ['--i' as string]: i }}>
                <span className="mv-map-dot" aria-hidden="true" />
                <span className="mono">{n.toUpperCase()}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 · PROPOSTA DE VALOR */}
      <section id="proposta" className="mv-sec" aria-label="Proposta de valor">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">04 · PROPOSTA DE VALOR</p>
          <h2 className="mv-sec-title">{s.valueProposition.title}.</h2>
          <p className="mv-copy">{s.valueProposition.copy}</p>
        </header>
        <div className="mv-grid mv-grid-3">
          {s.valueProposition.cards.map((c, i) => (
            <article key={c} className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
              <p className="mv-card-num mono">V{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mv-card-title">{c}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* 05 · PRINCÍPIOS */}
      <section id="principios" className="mv-sec" aria-label="Princípios da marca">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">05 · PRINCÍPIOS</p>
          <h2 className="mv-sec-title">{s.principles.title}.</h2>
        </header>
        <ol className="mv-reclist" data-mv-reveal>
          {s.principles.items.map((item, i) => (
            <li key={item}>
              <span className="mv-reclist-num mono">{String(i + 1).padStart(2, '0')}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      {/* 06 · PÚBLICOS */}
      <section id="publicos" className="mv-sec" aria-label="Arquitetura de público">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">06 · PÚBLICOS</p>
          <h2 className="mv-sec-title">{s.audiences.title}.</h2>
        </header>
        <div className="mv-grid mv-grid-2">
          {s.audiences.groups.map((g, i) => (
            <article key={g} className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
              <p className="mv-card-num mono">A{String(i + 1).padStart(2, '0')}</p>
              <p className="mv-mod-desc">{g}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 07 · VOZ */}
      <section id="voz" className="mv-sec" aria-label="Voz da marca">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">07 · VOZ DA MARCA</p>
          <h2 className="mv-sec-title">{s.voice.title}.</h2>
        </header>
        <ul className="mv-bs-axes" data-mv-reveal>
          {s.voice.axes.map((a) => {
            const [yes, no] = a.split(', sem')
            return (
              <li key={a}>
                <strong>{yes}</strong>
                <span>, sem{no}</span>
              </li>
            )
          })}
        </ul>
        <div className="mv-grid mv-grid-2 mv-gap-top">
          {s.voice.microcopy.map((m, i) => (
            <article key={m.avoid} className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
              <p className="mv-matrix-label mono">EM VEZ DE</p>
              <p className="mv-bs-avoid">“{m.avoid}”</p>
              <p className="mv-matrix-label mono mv-bs-prefer-label">PREFERIR</p>
              <p className="mv-bs-prefer">“{m.prefer}”</p>
            </article>
          ))}
        </div>
      </section>

      {/* 08 · TERRITÓRIOS */}
      <section id="territorios" className="mv-sec" aria-label="Territórios editoriais">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">08 · TERRITÓRIOS EDITORIAIS</p>
          <h2 className="mv-sec-title">{s.territories.title}.</h2>
        </header>
        <ul className="mv-bs-territories" data-mv-reveal aria-label="Territórios conectados">
          {s.territories.items.map((t, i) => (
            <li key={t} style={{ ['--i' as string]: i }}>
              <span className="mv-map-dot" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* 09 · APLICAÇÃO */}
      <section id="aplicacao" className="mv-sec" aria-label="Aplicação do sistema">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">09 · APLICAÇÃO</p>
          <h2 className="mv-sec-title">{s.application.title}.</h2>
          <p className="mv-copy">{s.application.copy}</p>
        </header>
        <div className="mv-map" data-mv-reveal role="img" aria-label={`O Brand System orienta: ${s.application.targets.join(', ')}`}>
          <ol className="mv-map-flow mv-map-wrap">
            {s.application.targets.map((t, i) => (
              <li key={t} className="mv-map-node" style={{ ['--i' as string]: i }}>
                <span className="mv-map-dot" aria-hidden="true" />
                <span className="mono">{t.toUpperCase()}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 10 · EVOLUÇÃO */}
      <section id="evolucao" className="mv-sec" aria-label="Evolução">
        <header className="mv-sec-head" data-mv-reveal>
          <p className="mv-eyebrow mono">10 · EVOLUÇÃO</p>
          <h2 className="mv-sec-title">{s.evolution.title}</h2>
        </header>
        <p className="mv-highlight" data-mv-reveal>
          {s.evolution.copy}
        </p>
        <ul className="mv-act" data-mv-reveal aria-label="Histórico de versões">
          {s.evolution.versions.map((v) => (
            <li key={v.version}>
              <span className="mv-act-row">
                <span className="mv-act-date mono">{v.date}</span>
                <span className="mv-act-type">Versão {v.version}</span>
                <span className="mv-act-module">{v.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mv-bs-back" data-mv-reveal>
          <a className="mv-btn mv-btn-ghost" href={`/client/${clientSlug}`}>
            ← Voltar para os módulos
          </a>
        </p>
      </section>
    </div>
  )
}

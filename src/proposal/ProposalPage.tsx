import { useEffect, useRef, useState } from 'react'
import './proposal.css'
import Grain from '../components/Grain'
import { trackProposalEvent } from '../lib/analytics'
import { meta, navSections, hero, contacts, footer, accessGate } from '../content/proposals/galpaoAnimal'
import AccessCodeGate from './AccessCodeGate'
import { Mayven, OQueFazemos, Cenario, Leitura } from './ProposalSections'
import { Atuacao, Metodologia, Escopo } from './ProposalPlan'
import { Investimento, ProximosPassos } from './ProposalClose'

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

/** Sidebar de progresso — desktop only (escondida via CSS no mobile). */
function ProposalSidebar({ active }: { active: string }) {
  return (
    <nav className="pp-sidebar" aria-label="Seções da proposta">
      <ul>
        {navSections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={active === s.id ? 'is-active' : ''}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(s.id)
              }}
            >
              <span className="mono">{s.num}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Conteúdo da proposta — renderizado somente após o gate liberar o acesso. */
function ProposalContent() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState('')

  useEffect(() => {
    trackProposalEvent('proposal_viewed', { proposal: 'galpaoanimal' })
  }, [])

  /* Reveal on scroll + seção ativa + fim da proposta — um só ciclo de observers. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const revealed = new Set<Element>()
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !revealed.has(e.target)) {
            revealed.add(e.target)
            e.target.classList.add('is-in')
            reveal.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    if (!reduced) root.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el))
    else root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'))

    const seen = new Set<string>()
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const id = e.target.id
          setActive(id)
          if (!seen.has(id)) {
            seen.add(id)
            trackProposalEvent('section_viewed', { section: id })
            if (id === 'proximos-passos') trackProposalEvent('proposal_completed', { proposal: 'galpaoanimal' })
          }
        })
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    navSections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) spy.observe(el)
    })

    return () => {
      reveal.disconnect()
      spy.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef} className="proposal">
      <Grain />
      <div className="pp-bg" aria-hidden="true">
        <div className="pp-bg-grid" />
        <div className="pp-bg-glow" />
      </div>

      <header className="pp-header">
        <a className="pp-brand" href="/" aria-label="Mayven — página inicial">
          <img className="pp-mark" src="/brand/mayven-mark.png" alt="" />
          <span className="pp-word">MAYVEN</span>
        </a>
        <p className="pp-private mono">
          <span className="pp-private-dot" aria-hidden="true" />
          {meta.privateMark} · {meta.client.toUpperCase()}
        </p>
        <a
          className="btn btn-small pp-header-cta"
          href={contacts.whatsapp}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackProposalEvent('cta_clicked', { cta: 'talk', section: 'header' })}
        >
          Falar com a Mayven
        </a>
      </header>

      <ProposalSidebar active={active} />

      <main className="pp-main">
        <section className="pp-hero" aria-label="Abertura da proposta">
          <div className="pp-monolith" aria-hidden="true" />
          <div className="pp-hero-inner">
            <p className="pp-eyebrow mono" data-reveal>
              {hero.eyebrow}
            </p>
            <h1 className="pp-hero-title" data-reveal>
              {hero.title}
            </h1>
            <p className="pp-copy pp-hero-copy" data-reveal>
              {hero.copy}
            </p>
            <div className="pp-ctas" data-reveal>
              <a
                className="btn btn-primary"
                href={`#${navSections[0].id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(navSections[0].id)
                  trackProposalEvent('cta_clicked', { cta: 'view_proposal', section: 'hero' })
                }}
              >
                {hero.ctaPrimary}
              </a>
              <a
                className="btn btn-ghost"
                href={contacts.whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackProposalEvent('cta_clicked', { cta: 'talk', section: 'hero' })}
              >
                {hero.ctaSecondary}
              </a>
            </div>
            <p className="pp-micro mono">{hero.microcopy}</p>
          </div>
        </section>

        <Mayven />
        <OQueFazemos />
        <Cenario />
        <Leitura />
        <Atuacao />
        <Metodologia />
        <Escopo />
        <Investimento />
        <ProximosPassos />
      </main>

      <footer className="pp-footer">
        <p className="mono">{footer.line}</p>
        <p className="mono pp-footer-legal">{footer.legal}</p>
      </footer>
    </div>
  )
}

export default function ProposalPage() {
  /* Título + noindex valem também para a tela de código
     (reforçado via header X-Robots-Tag no firebase.json) */
  useEffect(() => {
    const prevTitle = document.title
    document.title = meta.pageTitle
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = prevTitle
      robots.remove()
    }
  }, [])

  return (
    <AccessCodeGate {...accessGate} proposalName={meta.client}>
      <ProposalContent />
    </AccessCodeGate>
  )
}

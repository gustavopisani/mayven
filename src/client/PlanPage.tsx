import { useEffect, useRef } from 'react'
import type { PlanData } from '../data/reports/types'
import { trackClientEvent } from '../lib/reportAnalytics'
import { ReportSection, MetricGrid, DataTable, InsightCard, MayvenReadingBlock } from './components'
import {
  SignalDecisionMatrix,
  EditorialPillarCard,
  ProgrammaticSeriesCard,
  CalendarWeekCard,
  ExperimentCard,
  MeasurementPlanBlock,
  ProductionPipeline,
  PlanClosingCTA,
} from './plan-components'

const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

export default function PlanPage({ plan }: { plan: PlanData }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackClientEvent('plan_opened', { client: plan.clientSlug, plan: plan.planSlug })
  }, [plan.clientSlug, plan.planSlug])

  /* Reveal on scroll + plan_section_viewed — um ciclo só de observers. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            reveal.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    root.querySelectorAll('[data-mv-reveal]').forEach((el) =>
      reduced ? el.classList.add('is-in') : reveal.observe(el),
    )

    const seen = new Set<string>()
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !seen.has(e.target.id)) {
            seen.add(e.target.id)
            trackClientEvent('plan_section_viewed', { plan: plan.planSlug, section: e.target.id })
          }
        })
      },
      { rootMargin: '-30% 0px -55% 0px' },
    )
    root.querySelectorAll('section[id]').forEach((s) => spy.observe(s))

    return () => {
      reveal.disconnect()
      spy.disconnect()
    }
  }, [plan.planSlug])

  const p = plan
  return (
    <div ref={rootRef} className="mv-report">
      {/* 3 · PLAN HERO */}
      <section id="hero" className="mv-hero" aria-label="Abertura do plano">
        <div className="mv-hero-inner">
          <p className="mv-eyebrow mono" data-mv-reveal>
            {p.hero.eyebrow.toUpperCase()} · {p.clientName.toUpperCase()}
          </p>
          <h1 className="mv-hero-title" data-mv-reveal>
            {p.hero.title}
          </h1>
          <p className="mv-hero-sub" data-mv-reveal>
            {p.hero.subtitle}
          </p>
          <p className="mv-hero-summary" data-mv-reveal>
            {p.hero.summary}
          </p>
          <div className="mv-hero-meta" data-mv-reveal>
            <span className="mv-badge mono">{p.monthLabel}</span>
            <a
              className="mv-badge mv-badge-live mono mv-badge-link"
              href={p.basedOnReport.href}
              onClick={() =>
                trackClientEvent('previous_report_clicked', {
                  client: p.clientSlug,
                  plan: p.planSlug,
                  href: p.basedOnReport.href,
                })
              }
            >
              BASEADO NO {p.basedOnReport.label.toUpperCase()} ↗
            </a>
          </div>
          <div className="mv-hero-cta" data-mv-reveal>
            <button type="button" className="mv-btn mv-btn-primary" onClick={() => scrollToId('racional')}>
              Por que este plano existe ↓
            </button>
          </div>
        </div>
        <div className="mv-hero-pillar" aria-hidden="true" />
      </section>

      {/* 4-5 · STRATEGIC RATIONALE + SIGNAL → DECISION MATRIX */}
      <ReportSection id="racional" eyebrow="01 · RACIONAL ESTRATÉGICO" title={p.strategicRationale.title} wide>
        <p className="mv-highlight" data-mv-reveal>
          {p.strategicRationale.description}
        </p>
        <SignalDecisionMatrix signals={p.strategicRationale.signals} />
        <MayvenReadingBlock text="Cada decisão deste plano nasce de um sinal medido no ciclo anterior — não de opinião." />
      </ReportSection>

      {/* 6 · OBJECTIVES */}
      <ReportSection id="objetivos" eyebrow="02 · OBJETIVOS" title="O que o mês precisa entregar.">
        <div className="mv-grid mv-grid-3">
          {p.objectives.map((o, i) => (
            <InsightCard key={o.title} num={`OBJ.${String(i + 1).padStart(2, '0')}`} title={o.title} description={o.description} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 7 · EDITORIAL BANK */}
      <ReportSection id="banco-editorial" eyebrow="03 · BANCO EDITORIAL" title={p.editorialBank.title}>
        <p className="mv-copy" data-mv-reveal>
          {p.editorialBank.description}
        </p>
        <div className="mv-grid mv-grid-2 mv-gap-top">
          {p.editorialBank.pillars.map((pillar, i) => (
            <EditorialPillarCard key={pillar.name} pillar={pillar} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 8 · PROGRAMMATIC CONTENT */}
      <ReportSection id="conteudo-programatico" eyebrow="04 · CONTEÚDO PROGRAMÁTICO" title={p.programmaticContent.title}>
        <p className="mv-copy" data-mv-reveal>
          {p.programmaticContent.description}
        </p>
        <div className="mv-grid mv-grid-3 mv-gap-top">
          {p.programmaticContent.series.map((s, i) => (
            <ProgrammaticSeriesCard key={s.name} series={s} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 9 · CHANNEL PLAN */}
      <ReportSection id="canais" eyebrow="05 · PLANO POR CANAL" title="Cada canal com papel claro." wide>
        <DataTable
          caption="Plano por canal: papel, foco do mês e resultado esperado"
          columns={['Canal', 'Papel', 'Foco do mês', 'Resultado esperado']}
          rows={p.channelPlan.map((c) => [c.channel, c.role, c.focus, c.expectedOutcome])}
        />
      </ReportSection>

      {/* 10 · PRODUCTION VOLUME */}
      <ReportSection id="volume" eyebrow="06 · VOLUME DE PRODUÇÃO" title="O que será produzido.">
        <MetricGrid kpis={p.productionVolume} cols={3} />
      </ReportSection>

      {/* 11 · EDITORIAL CALENDAR */}
      <ReportSection id="calendario" eyebrow="07 · CALENDÁRIO EDITORIAL" title="O mês, semana a semana.">
        <div className="mv-grid mv-grid-2">
          {p.calendar.map((w, i) => (
            <CalendarWeekCard key={w.week} week={w} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 12 · EXPERIMENTS */}
      <ReportSection id="experimentos" eyebrow="08 · EXPERIMENTOS" title="Hipóteses do ciclo.">
        <div className="mv-grid mv-grid-3">
          {p.experiments.map((e, i) => (
            <ExperimentCard key={e.name} experiment={e} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 13 · MEASUREMENT / PERFORMANCE INTELLIGENCE */}
      <ReportSection id="medicao" eyebrow="09 · MEDIÇÃO" title="Inteligência de Performance.">
        <MeasurementPlanBlock plan={p.measurementPlan} />
      </ReportSection>

      {/* 14 · PRODUCTION PIPELINE */}
      <ReportSection id="esteira" eyebrow="10 · ESTEIRA DE CRIAÇÃO" title="Da pauta à publicação." wide>
        <ProductionPipeline steps={p.productionPipeline} />
      </ReportSection>

      {/* 15 · DEPENDENCIES */}
      <ReportSection id="dependencias" eyebrow="11 · DEPENDÊNCIAS" title="O que precisamos do cliente." wide>
        <DataTable
          caption="Dependências: necessidade, responsável, prazo e impacto"
          columns={['Necessidade', 'Responsável', 'Prazo', 'Impacto']}
          rows={p.dependencies.map((d) => [d.need, d.owner, d.deadline, d.impact])}
        />
      </ReportSection>

      {/* 16 · CLOSING */}
      <ReportSection id="fechamento" eyebrow="12 · FECHAMENTO" title={p.closing.title}>
        <p className="mv-copy" data-mv-reveal>
          {p.closing.description}
        </p>
        <div className="mv-next" data-mv-reveal>
          <PlanClosingCTA plan={p} />
        </div>
      </ReportSection>
    </div>
  )
}

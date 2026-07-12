import { useEffect, useRef } from 'react'
import type { ReportData } from '../data/reports/types'
import { trackReportEvent } from '../lib/reportAnalytics'
import {
  ReportSection,
  MetricGrid,
  KpiCard,
  ProgressBar,
  DataTable,
  StatusPill,
  InsightCard,
  RecommendationList,
  MayvenReadingBlock,
  NextStepCTA,
} from './components'

const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

export default function ReportPage({ report }: { report: ReportData }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackReportEvent('report_opened', { client: report.clientSlug, report: report.reportSlug })
  }, [report.clientSlug, report.reportSlug])

  /* Reveal on scroll + section_viewed — um ciclo só de observers. */
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
            trackReportEvent('section_viewed', { report: report.reportSlug, section: e.target.id })
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
  }, [report.reportSlug])

  const r = report
  return (
    <div ref={rootRef} className="mv-report">
      {/* 03 · HERO */}
      <section id="hero" className="mv-hero" aria-label="Abertura do report">
        <div className="mv-hero-inner">
          <p className="mv-eyebrow mono" data-mv-reveal>
            {r.hero.eyebrow.toUpperCase()} · {r.clientName.toUpperCase()}
          </p>
          <h1 className="mv-hero-title" data-mv-reveal>
            {r.hero.title}
          </h1>
          <p className="mv-hero-sub" data-mv-reveal>
            {r.hero.subtitle}
          </p>
          <div className="mv-hero-meta" data-mv-reveal>
            <span className="mv-badge mono">{r.hero.period}</span>
            <span className="mv-badge mv-badge-live mono">Operação ativa</span>
          </div>
          <div className="mv-hero-cta" data-mv-reveal>
            <button
              type="button"
              className="mv-btn mv-btn-primary"
              onClick={() => scrollToId('resumo')}
            >
              Ver resumo executivo ↓
            </button>
          </div>
        </div>
        <div className="mv-hero-pillar" aria-hidden="true" />
      </section>

      {/* 04 · EXECUTIVE SUMMARY */}
      <ReportSection id="resumo" eyebrow="01 · RESUMO EXECUTIVO" title="O mês em uma leitura.">
        <p className="mv-highlight" data-mv-reveal>
          {r.executiveSummary.highlight}
        </p>
        <MetricGrid kpis={r.executiveSummary.kpis} cols={3} />
        <MayvenReadingBlock text={r.executiveSummary.mayvenReading} />
      </ReportSection>

      {/* 05 · EXECUTION */}
      <ReportSection id="execucao" eyebrow="02 · EXECUÇÃO" title="Planejado × realizado.">
        <div className="mv-objectives">
          {r.execution.objectives.map((o, i) => (
            <article className="mv-objective" key={o.objective} data-mv-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
              <div className="mv-objective-head">
                <h3 className="mv-card-title">{o.objective}</h3>
                <StatusPill status={o.status} />
              </div>
              <p className="mv-card-desc">{o.observation}</p>
            </article>
          ))}
        </div>
      </ReportSection>

      {/* 06 · DELIVERABLES */}
      <ReportSection id="entregas" eyebrow="03 · ENTREGAS" title="O que foi produzido.">
        <MetricGrid kpis={r.deliverables} cols={4} />
      </ReportSection>

      {/* 07 · PERFORMANCE */}
      <ReportSection id="performance" eyebrow="04 · PERFORMANCE" title="Sinais do mês.">
        <MetricGrid kpis={r.performance.kpis} cols={3} />
        <div className="mv-bars">
          {r.performance.bars.map((b, i) => (
            <ProgressBar key={b.label} label={b.label} value={b.value} index={i} />
          ))}
        </div>
        <div className="mv-duo">
          <article className="mv-card mv-card-ok" data-mv-reveal>
            <p className="mv-card-num mono">O QUE FUNCIONOU</p>
            <p className="mv-card-desc">{r.performance.worked}</p>
          </article>
          <article className="mv-card mv-card-warn" data-mv-reveal>
            <p className="mv-card-num mono">PONTO DE ATENÇÃO</p>
            <p className="mv-card-desc">{r.performance.attention}</p>
          </article>
        </div>
      </ReportSection>

      {/* 08 · CHANNELS */}
      <ReportSection id="canais" eyebrow="05 · CANAIS" title="Papel de cada canal." wide>
        <DataTable
          caption="Canais, papel estratégico e leitura do mês"
          columns={['Canal', 'Papel estratégico', 'Leitura do mês']}
          rows={r.channels.map((c) => [c.channel, c.role, c.reading])}
        />
      </ReportSection>

      {/* 09 · CONTENT */}
      <ReportSection id="conteudos" eyebrow="06 · CONTEÚDO" title="O que mais performou.">
        <div className="mv-grid mv-grid-3">
          {r.topContent.map((t, i) => (
            <article className="mv-card" key={t.title} data-mv-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
              <div className="mv-content-tags">
                <span className="mv-badge mono">{t.format}</span>
                <span className="mv-badge mv-badge-live mono">{t.result}</span>
              </div>
              <h3 className="mv-card-title">{t.title}</h3>
              <p className="mv-card-desc">{t.reading}</p>
            </article>
          ))}
        </div>
      </ReportSection>

      {/* 10 · LEARNINGS */}
      <ReportSection id="aprendizados" eyebrow="07 · APRENDIZADOS" title="O que o mês ensinou.">
        <div className="mv-grid mv-grid-2">
          {r.learnings.map((l, i) => (
            <InsightCard key={l.title} num={`A${String(i + 1).padStart(2, '0')}`} title={l.title} description={l.description} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 11 · OPPORTUNITIES */}
      <ReportSection id="oportunidades" eyebrow="08 · OPORTUNIDADES" title="Para onde apontar.">
        <div className="mv-grid mv-grid-2">
          {r.opportunities.map((o, i) => (
            <InsightCard key={o.title} num={`O${String(i + 1).padStart(2, '0')}`} title={o.title} description={o.description} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 12 · RECOMMENDATIONS */}
      <ReportSection id="recomendacoes" eyebrow="09 · RECOMENDAÇÕES" title="Prioridades do próximo ciclo.">
        <RecommendationList items={r.recommendations} />
      </ReportSection>

      {/* 13 · DEPENDENCIES */}
      <ReportSection id="dependencias" eyebrow="10 · DEPENDÊNCIAS" title="O que precisamos do cliente." wide>
        <DataTable
          caption="Necessidades, responsáveis e observações"
          columns={['Necessidade', 'Responsável', 'Observação']}
          rows={r.dependencies.map((d) => [d.need, d.owner, d.observation])}
        />
      </ReportSection>

      {/* 14 · CLOSING */}
      <ReportSection id="fechamento" eyebrow="11 · FECHAMENTO" title="Presença é sistema.">
        <blockquote className="mv-quote" data-mv-reveal>
          {r.closing.quote}
        </blockquote>
        <p className="mv-copy" data-mv-reveal>
          {r.closing.perceivedDelivery}
        </p>
        <div className="mv-next" data-mv-reveal>
          <NextStepCTA
            label={r.closing.nextStep.label}
            href={r.closing.nextStep.href}
            onClick={() =>
              trackReportEvent('next_plan_clicked', {
                client: r.clientSlug,
                report: r.reportSlug,
                href: r.closing.nextStep.href,
              })
            }
          />
        </div>
      </ReportSection>
    </div>
  )
}

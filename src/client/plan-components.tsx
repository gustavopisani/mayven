import type { PlanData } from '../data/reports/types'
import { trackClientEvent } from '../lib/reportAnalytics'

/** Matriz Sinal → Interpretação → Decisão — o coração do plano baseado em dados.
 *  Desktop: 3 colunas por linha; mobile: blocos empilhados (labels sempre no DOM). */
export function SignalDecisionMatrix({
  signals,
}: {
  signals: PlanData['strategicRationale']['signals']
}) {
  return (
    <div className="mv-matrix">
      {signals.map((s, i) => (
        <article key={s.signal} className="mv-matrix-row" data-mv-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
          <div className="mv-matrix-cell">
            <p className="mv-matrix-label mono">SINAL OBSERVADO</p>
            <p className="mv-matrix-text">{s.signal}</p>
          </div>
          <div className="mv-matrix-cell">
            <p className="mv-matrix-label mono">INTERPRETAÇÃO</p>
            <p className="mv-matrix-text mv-matrix-muted">{s.interpretation}</p>
          </div>
          <div className="mv-matrix-cell mv-matrix-decision">
            <p className="mv-matrix-label mono">DECISÃO</p>
            <p className="mv-matrix-text">{s.decision}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export function EditorialPillarCard({
  pillar,
  index = 0,
}: {
  pillar: PlanData['editorialBank']['pillars'][number]
  index?: number
}) {
  return (
    <article className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${index * 70}ms` }}>
      <p className="mv-card-num mono">P{String(index + 1).padStart(2, '0')}</p>
      <h3 className="mv-card-title">{pillar.name}</h3>
      <p className="mv-card-desc">{pillar.purpose}</p>
      <ul className="mv-chips" aria-label={`Exemplos de conteúdo: ${pillar.name}`}>
        {pillar.examples.map((e) => (
          <li key={e} className="mono">
            {e}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function ProgrammaticSeriesCard({
  series,
  index = 0,
}: {
  series: PlanData['programmaticContent']['series'][number]
  index?: number
}) {
  return (
    <article className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${index * 70}ms` }}>
      <div className="mv-content-tags">
        <span className="mv-badge mono">{series.format}</span>
        <span className="mv-badge mv-badge-live mono">{series.frequency}</span>
      </div>
      <h3 className="mv-card-title">{series.name}</h3>
      <p className="mv-card-desc">{series.rationale}</p>
    </article>
  )
}

export function CalendarWeekCard({
  week,
  index = 0,
}: {
  week: PlanData['calendar'][number]
  index?: number
}) {
  return (
    <article className="mv-card mv-week" data-mv-reveal style={{ ['--d' as string]: `${index * 80}ms` }}>
      <div className="mv-week-head">
        <p className="mv-card-num mono">{week.week.toUpperCase()}</p>
        <h3 className="mv-card-title">{week.focus}</h3>
      </div>
      <ul className="mv-week-actions">
        {week.actions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p className="mv-week-objective">
        <span className="mono">OBJETIVO — </span>
        {week.objective}
      </p>
    </article>
  )
}

export function ExperimentCard({
  experiment,
  index = 0,
}: {
  experiment: PlanData['experiments'][number]
  index?: number
}) {
  return (
    <article className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${index * 80}ms` }}>
      <p className="mv-card-num mono">EXP.{String(index + 1).padStart(2, '0')}</p>
      <h3 className="mv-card-title">{experiment.name}</h3>
      <p className="mv-card-desc">{experiment.hypothesis}</p>
      <p className="mv-exp-metric">
        <span className="mono">MÉTRICA — </span>
        {experiment.metric}
      </p>
    </article>
  )
}

/** Inteligência de Performance — camada consolidada de leitura de dados do plano.
 *  (A origem interna dos dados fica em `dataSource` e nunca é exibida ao cliente.) */
export function MeasurementPlanBlock({ plan }: { plan: PlanData['measurementPlan'] }) {
  return (
    <div className="mv-measure" data-mv-reveal>
      <div className="mv-measure-sources">
        {plan.badges.map((b, i) => (
          <span key={b} className={`mv-badge mono${i === 0 ? ' mv-badge-live' : ''}`}>
            {b.toUpperCase()}
          </span>
        ))}
      </div>
      <p className="mv-card-desc mv-measure-desc">{plan.description}</p>
      <p className="mv-measure-complement">{plan.complement}</p>
      <p className="mv-matrix-label mono">MÉTRICAS ACOMPANHADAS</p>
      <ul className="mv-chips">
        {plan.metrics.map((m) => (
          <li key={m} className="mono">
            {m}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Esteira de criação — linha horizontal no desktop, empilhada no mobile. */
export function ProductionPipeline({ steps }: { steps: PlanData['productionPipeline'] }) {
  return (
    <ol className="mv-pipeline">
      {steps.map((s, i) => (
        <li key={s.step} className="mv-pipe-step" data-mv-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
          <span className="mv-pipe-dot" aria-hidden="true" />
          <p className="mv-card-num mono">{String(i + 1).padStart(2, '0')}</p>
          <h3 className="mv-pipe-name">{s.step}</h3>
          <p className="mv-pipe-owner mono">{s.owner.toUpperCase()}</p>
          <p className="mv-card-desc">{s.description}</p>
        </li>
      ))}
    </ol>
  )
}

/** CTAs de fechamento do plano — rastreia aprovação/ajuste/report anterior. */
export function PlanClosingCTA({ plan }: { plan: PlanData }) {
  const track = (label: string, href: string) => {
    const event = label.toLowerCase().includes('aprovar')
      ? 'plan_approval_clicked'
      : label.toLowerCase().includes('ajuste')
        ? 'plan_adjustment_clicked'
        : 'previous_report_clicked'
    trackClientEvent(event, { client: plan.clientSlug, plan: plan.planSlug, href })
  }
  return (
    <div className="mv-plan-ctas">
      {plan.closing.ctas.map((cta, i) => (
        <a
          key={cta.label}
          className={`mv-btn ${i === plan.closing.ctas.length - 1 ? 'mv-btn-primary' : 'mv-btn-ghost'}`}
          href={cta.href}
          onClick={(e) => {
            if (cta.href === '#') e.preventDefault() // placeholder — destino será definido depois
            track(cta.label, cta.href)
          }}
        >
          {cta.label}
        </a>
      ))}
    </div>
  )
}

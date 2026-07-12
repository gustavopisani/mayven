import { useEffect, type ReactNode, type RefObject } from 'react'
import type { Kpi, ObjectiveStatus } from '../data/reports/types'

/** Reveal on scroll para elementos [data-mv-reveal] dentro de um root.
 *  Respeita prefers-reduced-motion (elementos aparecem sem animação). */
export function useRevealObserver(rootRef: RefObject<HTMLElement>) {
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
    return () => reveal.disconnect()
  }, [rootRef])
}

/** Seção padrão do report — id é usado pelo tracking de section_viewed. */
export function ReportSection({
  id,
  eyebrow,
  title,
  children,
  wide,
}: {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <section id={id} className={`mv-sec${wide ? ' mv-sec-wide' : ''}`} aria-label={title}>
      <header className="mv-sec-head" data-mv-reveal>
        <p className="mv-eyebrow mono">{eyebrow}</p>
        <h2 className="mv-sec-title">{title}</h2>
      </header>
      {children}
    </section>
  )
}

export function KpiCard({ kpi, index = 0 }: { kpi: Kpi; index?: number }) {
  return (
    <article className="mv-kpi" data-mv-reveal style={{ ['--d' as string]: `${index * 60}ms` }}>
      <p className="mv-kpi-value">{kpi.value}</p>
      <p className="mv-kpi-label mono">{kpi.label}</p>
      <p className="mv-kpi-desc">{kpi.description}</p>
    </article>
  )
}

export function MetricGrid({ kpis, cols = 3 }: { kpis: Kpi[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={`mv-grid mv-grid-${cols}`}>
      {kpis.map((k, i) => (
        <KpiCard key={k.label} kpi={k} index={i} />
      ))}
    </div>
  )
}

export function ProgressBar({ label, value, index = 0 }: { label: string; value: number; index?: number }) {
  return (
    <div className="mv-bar" data-mv-reveal style={{ ['--d' as string]: `${index * 90}ms` }}>
      <div className="mv-bar-head">
        <p className="mv-bar-label">{label}</p>
        <p className="mv-bar-value mono">{value}</p>
      </div>
      <div className="mv-bar-track" role="img" aria-label={`${label}: ${value} de 100`}>
        <i className="mv-bar-fill" style={{ ['--w' as string]: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}

/** Tabela que vira cards no mobile (via data-label + CSS). */
export function DataTable({
  columns,
  rows,
  caption,
}: {
  columns: string[]
  rows: string[][]
  caption: string
}) {
  return (
    <div className="mv-table-wrap" data-mv-reveal>
      <table className="mv-table">
        <caption className="mv-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className="mono" scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} data-label={columns[ci]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatusPill({ status }: { status: ObjectiveStatus }) {
  const kind = status === 'Concluído' ? 'done' : status === 'Em evolução' ? 'progress' : 'neutral'
  return <span className={`mv-pill mv-pill-${kind} mono`}>{status}</span>
}

export function InsightCard({
  title,
  description,
  num,
  index = 0,
}: {
  title: string
  description: string
  num?: string
  index?: number
}) {
  return (
    <article className="mv-card" data-mv-reveal style={{ ['--d' as string]: `${index * 70}ms` }}>
      {num && <p className="mv-card-num mono">{num}</p>}
      <h3 className="mv-card-title">{title}</h3>
      <p className="mv-card-desc">{description}</p>
    </article>
  )
}

export function RecommendationList({ items }: { items: string[] }) {
  return (
    <ol className="mv-reclist" data-mv-reveal>
      {items.map((item, i) => (
        <li key={item}>
          <span className="mv-reclist-num mono">{String(i + 1).padStart(2, '0')}</span>
          {item}
        </li>
      ))}
    </ol>
  )
}

/** Bloco "Leitura Mayven" — a interpretação estratégica do dado. */
export function MayvenReadingBlock({ text }: { text: string }) {
  return (
    <aside className="mv-reading" data-mv-reveal>
      <p className="mv-reading-tag mono">LEITURA MAYVEN</p>
      <p className="mv-reading-text">{text}</p>
    </aside>
  )
}

export function NextStepCTA({
  label,
  href,
  onClick,
}: {
  label: string
  href: string
  onClick?: () => void
}) {
  return (
    <a className="mv-btn mv-btn-primary" href={href} onClick={onClick}>
      {label} <span aria-hidden="true">→</span>
    </a>
  )
}

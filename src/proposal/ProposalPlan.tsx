import { atuacao, metodologia, escopo } from '../content/proposals/galpaoAnimal'
import { SectionHead } from './ProposalSections'

/** 05 — Como a Mayven pode atuar: evolução em camadas. */
export function Atuacao() {
  return (
    <section id="atuacao" className="pp-sec" aria-labelledby="atuacao-h">
      <SectionHead eyebrow={atuacao.eyebrow} title={atuacao.title} copy={atuacao.copy} />
      <div className="pp-layers">
        {atuacao.layers.map((l, i) => (
          <article key={l.num} className="pp-layer" data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
            <div className="pp-layer-head">
              <p className="pp-card-num mono">{l.num}</p>
              <h3 className="pp-card-title">{l.title}</h3>
            </div>
            <p className="pp-card-desc pp-layer-desc">{l.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/** 06 — Metodologia Mayven. */
export function Metodologia() {
  return (
    <section id="metodologia" className="pp-sec" aria-labelledby="metodologia-h">
      <SectionHead eyebrow={metodologia.eyebrow} title={metodologia.title} copy={metodologia.copy} />
      <ol className="pp-process">
        {metodologia.steps.map((s, i) => (
          <li key={s.name} className="pp-step" data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
            <span className="pp-step-dot" aria-hidden="true" />
            <p className="pp-card-num mono">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="pp-step-name">{s.name}</h3>
            <p className="pp-card-desc">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** 07 — Escopo recomendado. */
export function Escopo() {
  return (
    <section id="escopo" className="pp-sec" aria-labelledby="escopo-h">
      <SectionHead eyebrow={escopo.eyebrow} title={escopo.title} />
      <div className="pp-grid pp-grid-2">
        {escopo.blocks.map((b, i) => (
          <article key={b.title} className="pp-card" data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
            <p className="pp-card-num mono">E{String(i + 1).padStart(2, '0')}</p>
            <h3 className="pp-card-title">{b.title}</h3>
            <ul className="pp-list">
              {b.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

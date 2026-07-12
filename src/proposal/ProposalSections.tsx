import { mayven, oQueFazemos, cenario, leitura } from '../content/proposals/galpaoAnimal'

/** Cabeçalho padrão de seção da proposta. */
export function SectionHead({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy?: string[] | string
}) {
  const paragraphs = typeof copy === 'string' ? [copy] : copy
  return (
    <header className="pp-sec-head" data-reveal>
      <p className="pp-eyebrow mono">{eyebrow}</p>
      <h2 className="pp-title">{title}</h2>
      {paragraphs?.map((p, i) => (
        <p key={i} className="pp-copy">
          {p}
        </p>
      ))}
    </header>
  )
}

/** 01 — Quem é a Mayven: bloco editorial com peso visual maior que um card. */
export function Mayven() {
  return (
    <section id="mayven" className="pp-sec" aria-labelledby="mayven-h">
      <header className="pp-sec-head pp-mayven-head" data-reveal>
        <p className="pp-eyebrow mono">{mayven.eyebrow}</p>
        <h2 className="pp-title pp-title-lg">{mayven.title}</h2>
        {mayven.copy.map((p, i) => (
          <p key={i} className="pp-copy">
            {p}
          </p>
        ))}
      </header>
      <p className="pp-punch pp-mayven-punch" data-reveal>
        {mayven.punch}
      </p>
      <ul className="pp-keywords" data-reveal aria-label="Frentes de atuação da Mayven">
        {mayven.keywords.map((k) => (
          <li key={k} className="mono">
            {k}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** 02 — O que fazemos: amplia a percepção de escopo da Mayven. */
export function OQueFazemos() {
  return (
    <section id="o-que-fazemos" className="pp-sec" aria-labelledby="o-que-fazemos-h">
      <SectionHead eyebrow={oQueFazemos.eyebrow} title={oQueFazemos.title} copy={oQueFazemos.copy} />
      <div className="pp-grid pp-grid-3">
        {oQueFazemos.cards.map((c, i) => (
          <article key={c.title} className="pp-card" data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
            <p className="pp-card-num mono">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="pp-card-title">{c.title}</h3>
            <p className="pp-card-desc">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/** 03 — Cenário do cliente. */
export function Cenario() {
  return (
    <section id="cenario" className="pp-sec" aria-labelledby="cenario-h">
      <SectionHead eyebrow={cenario.eyebrow} title={cenario.title} copy={cenario.copy} />
      <div className="pp-grid pp-grid-3">
        {cenario.cards.map((c, i) => (
          <article key={c.title} className="pp-card" data-reveal style={{ ['--d' as string]: `${i * 90}ms` }}>
            <p className="pp-card-num mono">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="pp-card-title">{c.title}</h3>
            <p className="pp-card-desc">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/** 04 — Leitura estratégica: consolida diagnóstico + oportunidade. */
export function Leitura() {
  return (
    <section id="leitura" className="pp-sec" aria-labelledby="leitura-h">
      <SectionHead eyebrow={leitura.eyebrow} title={leitura.title} copy={leitura.copy} />
      <div className="pp-grid pp-grid-2">
        {leitura.cards.map((c, i) => (
          <article key={c.title} className="pp-card pp-card-diag" data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
            <div className="pp-diag-top">
              <p className="pp-card-num mono">L{String(i + 1).padStart(2, '0')}</p>
              <p className="pp-diag-tag mono">{c.tag}</p>
            </div>
            <h3 className="pp-card-title">{c.title}</h3>
            <p className="pp-card-desc">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

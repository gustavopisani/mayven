import { investimento, proximosPassos, contacts } from '../content/proposals/galpaoAnimal'
import { trackProposalEvent } from '../lib/analytics'
import { SectionHead } from './ProposalSections'

export function Investimento() {
  return (
    <section id="investimento" className="pp-sec" aria-labelledby="investimento-h">
      <SectionHead eyebrow={investimento.eyebrow} title={investimento.title} copy={investimento.copy} />
      <div className="pp-grid pp-grid-2">
        {investimento.blocks.map((b, i) => (
          <article
            key={b.num}
            className={`pp-card pp-inv${b.tag ? ' pp-inv-rec' : ''}`}
            data-reveal
            style={{ ['--d' as string]: `${i * 90}ms` }}
          >
            <div className="pp-diag-top">
              <p className="pp-card-num mono">BLOCO {b.num}</p>
              {b.tag && <p className="pp-diag-tag mono">{b.tag}</p>}
            </div>
            <h3 className="pp-card-title">{b.title}</h3>
            <p className="pp-inv-sub mono">{b.subtitle}</p>
            <p className="pp-card-desc">{b.desc}</p>
            {b.objective && <p className="pp-inv-objective">{b.objective}</p>}
            <ul className="pp-list">
              {b.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {b.deliverable && (
              <div className="pp-inv-deliverable">
                <p className="pp-list-label mono">Entregável</p>
                <p className="pp-card-desc">{b.deliverable}</p>
              </div>
            )}
            {b.notIncluded && (
              <div className="pp-inv-not">
                <p className="pp-list-label mono">Não inclui nesta fase</p>
                <ul className="pp-list pp-list-not">
                  {b.notIncluded.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="pp-inv-value">
              {b.value}
              {b.valueNote && <span className="pp-inv-note mono"> {b.valueNote}</span>}
            </p>
            {b.thirdParty && (
              <div className="pp-inv-third">
                <p className="pp-list-label mono">+ {b.thirdParty.label}</p>
                <p className="pp-card-desc">{b.thirdParty.desc}</p>
              </div>
            )}
            {b.blockNote && <p className="pp-inv-blocknote">{b.blockNote}</p>}
          </article>
        ))}
      </div>
      <aside className="pp-inv-support" data-reveal>
        <h3 className="pp-card-title">{investimento.support.title}</h3>
        <p className="pp-card-desc">{investimento.support.copy}</p>
        <p className="pp-inv-support-punch">{investimento.support.punch}</p>
      </aside>
      <p className="pp-obs" data-reveal>
        {investimento.note}
      </p>
    </section>
  )
}

export function ProximosPassos() {
  const cta = (name: string) => () => trackProposalEvent('cta_clicked', { cta: name, section: 'proximos-passos' })
  return (
    <section id="proximos-passos" className="pp-sec pp-sec-final" aria-labelledby="proximos-passos-h">
      <SectionHead eyebrow={proximosPassos.eyebrow} title={proximosPassos.title} copy={proximosPassos.copy} />
      <div className="pp-grid pp-grid-2">
        {proximosPassos.cards.map((c, i) => (
          <article key={c.num} className="pp-card" data-reveal style={{ ['--d' as string]: `${i * 90}ms` }}>
            <p className="pp-card-num mono">PASSO {c.num}</p>
            <h3 className="pp-card-title">{c.title}</h3>
            <p className="pp-card-desc">{c.desc}</p>
          </article>
        ))}
      </div>
      <div className="pp-ctas" data-reveal>
        <a
          className="btn btn-primary"
          href={`mailto:${contacts.email}?subject=${encodeURIComponent(contacts.approveSubject)}`}
          onClick={cta('approve')}
        >
          {proximosPassos.ctas.approve}
        </a>
        <a
          className="btn btn-ghost"
          href={`mailto:${contacts.email}?subject=${encodeURIComponent(contacts.meetingSubject)}`}
          onClick={cta('meeting')}
        >
          {proximosPassos.ctas.meeting}
        </a>
        <a className="btn btn-ghost" href={contacts.whatsapp} target="_blank" rel="noreferrer" onClick={cta('talk')}>
          {proximosPassos.ctas.talk}
        </a>
      </div>
    </section>
  )
}

import { useEffect } from 'react'
import './client.css'
import Grain from '../components/Grain'
import { clients, findClient, findPlan, findPlatform, findReport } from '../data/clients'
import ClientAccessGate from './ClientAccessGate'
import ClientLayout from './ClientLayout'
import ReportPage from './ReportPage'
import PlanPage from './PlanPage'
import ClientHub from './ClientHub'
import BrandSystemPage from './BrandSystemPage'

/* Mini-roteador da área de clientes (SPA sem dependência de router):
   /client/login
   /client/:clientSlug
   /client/:clientSlug/report/:reportSlug
   /client/:clientSlug/plan/:planSlug */
type ClientRoute =
  | { kind: 'login' }
  | { kind: 'home'; clientSlug: string }
  | { kind: 'brand'; clientSlug: string }
  | { kind: 'report'; clientSlug: string; reportSlug: string }
  | { kind: 'plan'; clientSlug: string; planSlug: string }
  | { kind: 'notfound' }

function parseRoute(pathname: string): ClientRoute {
  const parts = pathname.toLowerCase().replace(/\/+$/, '').split('/').filter(Boolean)
  // parts[0] === 'client'
  if (parts.length === 1 || (parts.length === 2 && parts[1] === 'login')) return { kind: 'login' }
  if (parts.length === 2) return { kind: 'home', clientSlug: parts[1] }
  if (parts.length === 3 && parts[2] === 'brand-system') return { kind: 'brand', clientSlug: parts[1] }
  if (parts.length === 4 && parts[2] === 'report')
    return { kind: 'report', clientSlug: parts[1], reportSlug: parts[3] }
  if (parts.length === 4 && parts[2] === 'plan')
    return { kind: 'plan', clientSlug: parts[1], planSlug: parts[3] }
  return { kind: 'notfound' }
}

/** Tela simples centralizada (login, plano em preparação, não encontrado). */
function ClientMessage({
  eyebrow,
  title,
  copy,
  backHref,
  backLabel,
}: {
  eyebrow: string
  title: string
  copy: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="mv-gate">
      <Grain />
      <div className="mv-bg" aria-hidden="true">
        <div className="mv-bg-grid" />
        <div className="mv-bg-glow" />
      </div>
      <main className="mv-gate-card" aria-label={title}>
        <div className="mv-gate-brand">
          <img className="mv-mark" src="/brand/mayven-mark.png" alt="" />
          <span className="mv-word">MAYVEN</span>
        </div>
        <p className="mv-eyebrow mono">
          <span className="mv-dot" aria-hidden="true" /> {eyebrow}
        </p>
        <h1 className="mv-gate-title">{title}</h1>
        <p className="mv-gate-sub">{copy}</p>
        {backHref && (
          <p className="mv-gate-back">
            <a className="mv-btn mv-btn-ghost" href={backHref}>
              {backLabel ?? 'Voltar'}
            </a>
          </p>
        )}
        <p className="mv-micro mono">Conteúdo privado · Mayven</p>
      </main>
    </div>
  )
}

function ClientHome({ clientSlug }: { clientSlug: string }) {
  const client = findClient(clientSlug)
  if (!client)
    return (
      <ClientMessage
        eyebrow="ÁREA DO CLIENTE"
        title="Cliente não encontrado."
        copy="Verifique o link recebido ou fale com a equipe Mayven."
        backHref="/"
        backLabel="Ir para o site"
      />
    )
  /* Clientes com plataforma configurada ganham o hub de módulos (gated). */
  const platform = findPlatform(clientSlug)
  if (platform)
    return (
      <ClientAccessGate
        accessCode={platform.accessCode}
        storageKey={`mayven:client:${client.slug}:access`}
        clientName={client.name}
        contextLabel="Área do Cliente"
      >
        {({ lock }) => (
          <ClientLayout
            clientName={client.name}
            deliveryType="Área do Cliente"
            monthLabel={platform.currentCycle}
            onLock={lock}
            authBadge
          >
            <ClientHub platform={platform} clientName={client.name} />
          </ClientLayout>
        )}
      </ClientAccessGate>
    )
  return (
    <ClientLayout clientName={client.name} deliveryType="Área do cliente" monthLabel="Entregas">
      <div className="mv-report">
        <section className="mv-sec" aria-label="Entregas disponíveis">
          {/* sem data-mv-reveal: o observer de reveal vive só no ReportPage */}
          <header className="mv-sec-head">
            <p className="mv-eyebrow mono">ÁREA DO CLIENTE · {client.name.toUpperCase()}</p>
            <h1 className="mv-sec-title">Suas entregas digitais.</h1>
          </header>
          <ul className="mv-deliveries">
            {client.reports.map((r) => (
              <li key={`report-${r.reportSlug}`}>
                <a className="mv-delivery" href={`/client/${client.slug}/report/${r.reportSlug}`}>
                  <span className="mono mv-delivery-tag">STATUS REPORT</span>
                  <span className="mv-delivery-title">{r.monthLabel}</span>
                  <span className="mv-delivery-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
            {client.plans.map((p) => (
              <li key={`plan-${p.planSlug}`}>
                <a className="mv-delivery" href={`/client/${client.slug}/plan/${p.planSlug}`}>
                  <span className="mono mv-delivery-tag">PLANO DE EXECUÇÃO</span>
                  <span className="mv-delivery-title">{p.monthLabel}</span>
                  <span className="mv-delivery-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ClientLayout>
  )
}

function BrandRoute({ clientSlug }: { clientSlug: string }) {
  const client = findClient(clientSlug)
  const platform = findPlatform(clientSlug)
  if (!client || !platform)
    return (
      <ClientMessage
        eyebrow="ÁREA DO CLIENTE"
        title="Página não encontrada."
        copy="Verifique o link recebido ou fale com a equipe Mayven."
        backHref={`/client/${clientSlug}`}
        backLabel="Ver módulos"
      />
    )
  return (
    <ClientAccessGate
      accessCode={platform.accessCode}
      storageKey={`mayven:client:${client.slug}:access`}
      clientName={client.name}
      contextLabel="Brand System"
    >
      {({ lock }) => (
        <ClientLayout
          clientName={client.name}
          deliveryType="Brand System"
          monthLabel="Versão 1.0"
          onLock={lock}
          authBadge
        >
          <BrandSystemPage content={platform.brandSystem} clientSlug={client.slug} />
        </ClientLayout>
      )}
    </ClientAccessGate>
  )
}

function PlanRoute({ clientSlug, planSlug }: { clientSlug: string; planSlug: string }) {
  const plan = findPlan(clientSlug, planSlug)
  if (!plan)
    return (
      <ClientMessage
        eyebrow={`ÁREA DO CLIENTE · ${findClient(clientSlug)?.name.toUpperCase() ?? ''}`}
        title="Plano de Execução em preparação."
        copy="O Plano de Execução deste ciclo está sendo finalizado pela equipe Mayven e será liberado neste mesmo link."
        backHref={`/client/${clientSlug}`}
        backLabel="Ver entregas"
      />
    )
  return (
    <ClientAccessGate
      accessCode={plan.accessCode}
      storageKey={`mayven:client:${plan.clientSlug}:${plan.planSlug}:access`}
      clientName={plan.clientName}
      contextLabel={`Plano de Execução · ${plan.monthLabel}`}
    >
      {({ lock }) => (
        <ClientLayout
          clientName={plan.clientName}
          deliveryType="Plano de Execução"
          monthLabel={plan.monthLabel}
          onLock={lock}
        >
          <PlanPage plan={plan} />
        </ClientLayout>
      )}
    </ClientAccessGate>
  )
}

function ReportRoute({ clientSlug, reportSlug }: { clientSlug: string; reportSlug: string }) {
  const report = findReport(clientSlug, reportSlug)
  if (!report)
    return (
      <ClientMessage
        eyebrow="ÁREA DO CLIENTE"
        title="Report não encontrado."
        copy="Verifique o link recebido ou fale com a equipe Mayven."
        backHref={`/client/${clientSlug}`}
        backLabel="Ver entregas"
      />
    )
  return (
    <ClientAccessGate
      accessCode={report.accessCode}
      storageKey={`mayven:client:${report.clientSlug}:${report.reportSlug}:access`}
      clientName={report.clientName}
      contextLabel={`Status Report · ${report.monthLabel}`}
    >
      {({ lock }) => (
        <ClientLayout
          clientName={report.clientName}
          deliveryType="Status Report"
          monthLabel={report.monthLabel}
          onLock={lock}
        >
          <ReportPage report={report} />
        </ClientLayout>
      )}
    </ClientAccessGate>
  )
}

export default function ClientArea() {
  const route = parseRoute(window.location.pathname)

  /* Título + noindex em toda a área do cliente
     (reforçado via header X-Robots-Tag no firebase.json) */
  useEffect(() => {
    const prevTitle = document.title
    const report =
      route.kind === 'report' ? findReport(route.clientSlug, route.reportSlug) : undefined
    const plan = route.kind === 'plan' ? findPlan(route.clientSlug, route.planSlug) : undefined
    const brandClient = route.kind === 'brand' ? findClient(route.clientSlug) : undefined
    document.title = report
      ? `${report.clientName} · ${report.monthLabel} — Mayven Report`
      : plan
        ? `${plan.clientName} · ${plan.monthLabel} — Mayven Plan`
        : brandClient
          ? `Brand System · ${brandClient.name} — Mayven`
          : 'Área do Cliente — Mayven'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = prevTitle
      robots.remove()
    }
    // route é derivado da URL, estável durante o ciclo de vida da página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  switch (route.kind) {
    case 'login':
      return (
        <ClientMessage
          eyebrow="ÁREA DO CLIENTE"
          title="Acesso privado."
          copy="A área de clientes da Mayven é acessada por link privado enviado pela nossa equipe, junto com o código de acesso de cada entrega. Se você não recebeu o seu, fale com a gente."
          backHref="/"
          backLabel="Ir para o site"
        />
      )
    case 'home':
      return <ClientHome clientSlug={route.clientSlug} />
    case 'brand':
      return <BrandRoute clientSlug={route.clientSlug} />
    case 'report':
      return <ReportRoute clientSlug={route.clientSlug} reportSlug={route.reportSlug} />
    case 'plan':
      return <PlanRoute clientSlug={route.clientSlug} planSlug={route.planSlug} />
    default:
      return (
        <ClientMessage
          eyebrow="ÁREA DO CLIENTE"
          title="Página não encontrada."
          copy="Verifique o link recebido ou fale com a equipe Mayven."
          backHref="/"
          backLabel="Ir para o site"
        />
      )
  }
}

/* Registry disponível para futuras telas (dashboard, listagens). */
export { clients }

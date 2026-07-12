import { useEffect, useRef, useState } from 'react'
import type { ActiveModule, ClientPlatform, ExpansionModule } from '../data/platform/types'
import { trackClientEvent } from '../lib/reportAnalytics'
import { useRevealObserver } from './components'
import BrandHeart from './BrandHeart'

/* ---------- preview do site: vídeo em loop dentro da janela de navegador ----------
 * O card inteiro do módulo já é um link para o site (nova aba), então o preview
 * é clicável por ele — não aninhamos outro <a> (HTML inválido).
 * Era um GIF de 185 MB; convertido para MP4 (1,7 MB) com comportamento idêntico. */
function WebsitePreview({ platform, clientName }: { platform: ClientPlatform; clientName: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="mv-browser">
      <div className="mv-browser-bar" aria-hidden="true">
        <i /> <i /> <i />
        <span className="mono">{platform.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toUpperCase()}</span>
      </div>
      <div className="mv-browser-view">
        {!failed ? (
          <video
            className="mv-browser-gif"
            src={platform.websitePreview.gif.replace(/\.gif$/, '.mp4')}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`Prévia animada do site do ${clientName}`}
            onError={() => setFailed(true)}
          />
        ) : (
          <p className="mv-browser-unavailable mono">PREVIEW TEMPORARIAMENTE INDISPONÍVEL</p>
        )}
        <span className="mv-browser-open mono" aria-hidden="true">
          ABRIR EXPERIÊNCIA ↗
        </span>
      </div>
    </div>
  )
}

/* ---------- base compartilhada dos módulos do cockpit ---------- */
function moduleAnchorProps(module: ActiveModule, platform: ClientPlatform) {
  return {
    href: module.cta.href,
    ...(module.cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    'aria-label': `${module.name} — ${module.cta.label}`,
    onClick: () => trackClientEvent('module_opened', { client: platform.clientSlug, module: module.id }),
  }
}

function ModuleHead({ module, conn }: { module: ActiveModule; conn: string }) {
  return (
    <>
      <div className="mv-mod-top">
        <p className="mv-card-num mono">MOD.{module.num}</p>
        <p className="mv-modc-conn mono">{conn}</p>
        <p className="mv-mod-status mono">
          <span className="mv-auth-dot" aria-hidden="true" />
          {module.status}
        </p>
      </div>
      <h3 className="mv-mod-name">{module.name}</h3>
      <p className="mv-mod-desc">{module.desc}</p>
    </>
  )
}

function ModuleCta({ module }: { module: ActiveModule }) {
  return (
    <p className="mv-mod-cta mono">
      {module.cta.label.toUpperCase()} <span className="mv-mod-arrow" aria-hidden="true">→</span>
    </p>
  )
}

/* ---------- MOD.01 · BRAND SYSTEM (4 colunas) ---------- */
function BrandSystemModule({ module, platform }: { module: ActiveModule; platform: ClientPlatform }) {
  return (
    <a className="mv-modc mv-modc-brand" {...moduleAnchorProps(module, platform)} data-mv-reveal>
      <ModuleHead module={module} conn="OUTPUT → TODOS OS SISTEMAS" />
      <p className="mv-card-desc">{module.complement}</p>
      <BrandHeart />
      <p className="mv-modc-role mono">ORIENTA TODOS OS SISTEMAS</p>
      <ModuleCta module={module} />
    </a>
  )
}

/* ---------- MOD.02 · WEBSITE EXPERIENCE (8 colunas, preview em destaque) ---------- */
function WebsiteExperienceModule({
  module,
  platform,
  clientName,
}: {
  module: ActiveModule
  platform: ClientPlatform
  clientName: string
}) {
  return (
    <a className="mv-modc mv-modc-website" {...moduleAnchorProps(module, platform)} data-mv-reveal>
      <div className="mv-modc-website-info">
        <ModuleHead module={module} conn="INPUT · BRAND SYSTEM" />
        <p className="mv-card-desc">{module.complement}</p>
        <ul className="mv-mod-ctx" aria-label="Informações do módulo">
          {module.context.map((c) => (
            <li key={c} className="mono">
              {c}
            </li>
          ))}
        </ul>
        <ModuleCta module={module} />
      </div>
      <div className="mv-modc-website-view">
        <WebsitePreview platform={platform} clientName={clientName} />
      </div>
    </a>
  )
}

/* ---------- MOD.03 · CONTENT ENGINE (6 colunas) ---------- */
function ContentEngineModule({ module, platform }: { module: ActiveModule; platform: ClientPlatform }) {
  return (
    <a className="mv-modc mv-modc-content" {...moduleAnchorProps(module, platform)} data-mv-reveal>
      <ModuleHead module={module} conn="INPUT · BRAND + DADOS" />
      <p className="mv-card-desc">{module.complement}</p>
      <div className="mv-viz mv-viz-content" aria-hidden="true">
        {['PLANEJAMENTO', 'ROTEIRO', 'PRODUÇÃO', 'APROVAÇÃO', 'PUBLICAÇÃO'].map((s, i) => (
          <span key={s} className="mono" style={{ ['--i' as string]: i }}>
            {s}
          </span>
        ))}
      </div>
      <ul className="mv-mod-ctx" aria-label="Informações do ciclo">
        {['Plano editorial ativo', 'Conteúdos programados', 'Direcionamento baseado em dados'].map((c) => (
          <li key={c} className="mono">
            {c}
          </li>
        ))}
      </ul>
      <ModuleCta module={module} />
    </a>
  )
}

/* ---------- MOD.04 · MEDIA ENGINE (6 colunas) ---------- */
function MediaEngineModule({ module, platform }: { module: ActiveModule; platform: ClientPlatform }) {
  return (
    <a className="mv-modc mv-modc-media" {...moduleAnchorProps(module, platform)} data-mv-reveal>
      <ModuleHead module={module} conn="INSIGHT ↺ PRÓXIMO CICLO" />
      <p className="mv-card-desc">{module.complement}</p>
      <div className="mv-viz mv-viz-media" aria-hidden="true">
        <svg viewBox="0 0 200 48" preserveAspectRatio="none">
          <polyline points="0,40 30,34 55,38 85,20 115,26 145,10 175,16 200,6" />
        </svg>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className="mv-viz-ping" style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <ul className="mv-mod-ctx" aria-label="Informações do módulo">
        {module.context.map((c) => (
          <li key={c} className="mono">
            {c}
          </li>
        ))}
      </ul>
      <ModuleCta module={module} />
    </a>
  )
}

/* ---------- expansão: drawer ---------- */
function ExpansionDrawer({
  module,
  note,
  onClose,
}: {
  module: ExpansionModule
  note: string
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="mv-drawer-root" role="dialog" aria-modal="true" aria-label={`Módulo ${module.name}`}>
      <div className="mv-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="mv-drawer">
        <button ref={closeRef} type="button" className="mv-lock mono" onClick={onClose} aria-label="Fechar painel">
          Fechar ✕
        </button>
        <p className="mv-eyebrow mono">
          <span className="mv-dot" aria-hidden="true" /> DISPONÍVEL PARA EXPANSÃO
        </p>
        <h3 className="mv-drawer-title">{module.name}</h3>
        <p className="mv-card-desc">{module.desc}</p>
        <p className="mv-matrix-label mono mv-drawer-label">POSSIBILIDADES</p>
        <ul className="mv-week-actions">
          {module.possibilities.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="mv-drawer-note">{note}</p>
      </aside>
    </div>
  )
}

/* ---------- COCKPIT ---------- */
export default function ClientHub({ platform, clientName }: { platform: ClientPlatform; clientName: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [openExpansion, setOpenExpansion] = useState<ExpansionModule | null>(null)
  useRevealObserver(rootRef)

  useEffect(() => {
    trackClientEvent('hub_opened', { client: platform.clientSlug })
  }, [platform.clientSlug])

  const byId = (id: string) => platform.activeModules.find((m) => m.id === id)
  const brand = byId('brand-system')
  const website = byId('website-experience')
  const content = byId('content-engine')
  const media = byId('media-engine')

  return (
    <div ref={rootRef} className="mv-cockpit">
      {/* 2 · OVERVIEW DA OPERAÇÃO (hero compacto + painel de visão) */}
      <section className="mv-ck-overview" aria-label="Visão geral da operação">
        <div className="mv-ck-hero" data-mv-reveal>
          <p className="mv-eyebrow mono">ÁREA DO CLIENTE · {clientName.toUpperCase()}</p>
          <h1 className="mv-ck-title">
            {platform.hero.titleLine1}
            <br />
            <em>{platform.hero.titleLine2}</em>
          </h1>
          <p className="mv-hero-sub">{platform.hero.copy}</p>
        </div>
        <aside className="mv-ck-panel" data-mv-reveal aria-label="Visão da operação">
          <p className="mv-ck-panel-tag mono">
            <span className="mv-auth-dot" aria-hidden="true" /> VISÃO DA OPERAÇÃO
          </p>
          <ul className="mv-ck-stats">
            <li>
              <b className="mv-ck-stat-value">{String(platform.activeModules.length).padStart(2, '0')}</b>
              <span className="mono">MÓDULOS ATIVOS</span>
            </li>
            <li>
              <b className="mv-ck-stat-value">{platform.currentCycle.split(' ')[0]}</b>
              <span className="mono">CICLO ATUAL · {platform.currentCycle.split(' ')[1] ?? ''}</span>
            </li>
            <li>
              <b className="mv-ck-stat-live">{platform.operationStatus}</b>
              <span className="mono">OPERAÇÃO</span>
            </li>
            <li>
              <b className="mv-ck-stat-value mv-ck-stat-sm">{platform.lastUpdate}</b>
              <span className="mono">ÚLTIMA ATUALIZAÇÃO</span>
            </li>
          </ul>
          <div
            className="mv-ck-flow"
            role="img"
            aria-label={`Fluxo do sistema: ${platform.systemMap.nodes.join(', ')} — ${platform.systemMap.returnLabel}`}
          >
            {platform.systemMap.nodes.map((n, i) => (
              <span key={n} className="mv-ck-flow-node mono" style={{ ['--i' as string]: i }}>
                <i className="mv-map-dot" aria-hidden="true" />
                {n.split(' ')[0].toUpperCase()}
              </span>
            ))}
            <span className="mv-ck-flow-return mono" aria-hidden="true">
              ↺
            </span>
          </div>
        </aside>
      </section>

      {/* 3 · COCKPIT DE MÓDULOS ATIVOS */}
      <section className="mv-ck-sec" aria-label="Módulos ativos">
        <header className="mv-ck-sechead" data-mv-reveal>
          <p className="mv-eyebrow mono">MÓDULOS ATIVOS</p>
          <h2 className="mv-ck-sectitle">Os sistemas da sua operação.</h2>
          <p className="mv-ck-seccopy">
            Os sistemas atualmente conectados à operação digital do {clientName}.
          </p>
        </header>
        <div className="mv-ck-grid">
          {brand && <BrandSystemModule module={brand} platform={platform} />}
          {website && <WebsiteExperienceModule module={website} platform={platform} clientName={clientName} />}
          {content && <ContentEngineModule module={content} platform={platform} />}
          {media && <MediaEngineModule module={media} platform={platform} />}
        </div>
      </section>

      {/* 4 · CONTEXTO OPERACIONAL: atividade + próximo ciclo */}
      <section className="mv-ck-sec mv-ck-context" aria-label="Contexto operacional">
        <div className="mv-ck-activity" data-mv-reveal>
          <header className="mv-ck-sechead">
            <p className="mv-eyebrow mono">ATIVIDADE DO SISTEMA</p>
            <h2 className="mv-ck-sectitle">Movimentos recentes.</h2>
          </header>
          <ul className="mv-act">
            {platform.activity.map((a) => {
              const inner = (
                <>
                  <span className="mv-act-date mono">{a.date}</span>
                  <span className="mv-act-type">{a.type}</span>
                  <span className="mv-act-module mono">{a.module.toUpperCase()}</span>
                  {a.href && <span className="mv-mod-arrow" aria-hidden="true">→</span>}
                </>
              )
              const external = a.href?.startsWith('http')
              return (
                <li key={`${a.type}-${a.date}`}>
                  {a.href ? (
                    <a
                      className="mv-act-row"
                      href={a.href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      aria-label={`${a.type} — ${a.module}`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <span className="mv-act-row">{inner}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
        <aside className="mv-nextcycle mv-ck-next" data-mv-reveal aria-label="Próximo ciclo">
          <div className="mv-ck-next-head">
            <p className="mv-eyebrow mono">PRÓXIMO CICLO</p>
            <span className="mv-ck-ring" aria-hidden="true">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" />
                <circle cx="18" cy="18" r="15" className="mv-ck-ring-arc" />
              </svg>
            </span>
          </div>
          <p className="mv-ck-next-period">{platform.nextCycle.period}</p>
          <ul className="mv-week-actions mv-nextcycle-items">
            {platform.nextCycle.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mv-ck-next-copy">{platform.nextCycle.copy}</p>
        </aside>
      </section>

      {/* 5 · EXPANSÃO */}
      <section className="mv-ck-sec" aria-label="Expansão do sistema">
        <header className="mv-ck-sechead" data-mv-reveal>
          <p className="mv-eyebrow mono">EXPANSÃO DO SISTEMA</p>
          <p className="mv-ck-seccopy">{platform.expansion.copy}</p>
        </header>
        <div className="mv-ck-expgrid">
          {platform.expansion.modules.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className="mv-exp"
              data-mv-reveal
              style={{ ['--d' as string]: `${i * 80}ms` }}
              aria-label={`${m.name} — disponível para expansão, ver possibilidades`}
              onClick={() => {
                setOpenExpansion(m)
                trackClientEvent('expansion_opened', { client: platform.clientSlug, module: m.id })
              }}
            >
              <p className="mv-exp-tag mono">DISPONÍVEL PARA EXPANSÃO</p>
              <h3 className="mv-mod-name">{m.name}</h3>
              <p className="mv-card-desc">{m.desc}</p>
              <p className="mv-mod-cta mono">
                VER POSSIBILIDADES <span className="mv-mod-arrow" aria-hidden="true">→</span>
              </p>
            </button>
          ))}
        </div>
      </section>

      {openExpansion && (
        <ExpansionDrawer module={openExpansion} note={platform.expansion.note} onClose={() => setOpenExpansion(null)} />
      )}
    </div>
  )
}

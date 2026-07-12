import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from '../lib/ui'

/* pillar → engine stage mapping + live inspection data */
const PILLARS = [
  {
    name: 'Marcas que parecem maiores',
    stage: 0,
    desc: 'Percepção, posicionamento e autoridade — por que algumas marcas parecem 10x maiores do que são.',
    formats: ['Tese', 'Breakdown', 'Carrossel'],
    series: 'Signal Breakdown',
    output: '“Anatomia de uma marca que parece 10x maior.”',
  },
  {
    name: 'Sites que viram experiência',
    stage: 1,
    desc: 'WebGL, motion e a diferença entre landing page e experiência digital.',
    formats: ['Screen-record', 'Split-screen', 'Reel'],
    series: 'Creative Tech Notes',
    output: '“Isso é um site. Isso é uma experiência. 3 segundos.”',
  },
  {
    name: 'Conteúdo como sistema de autoridade',
    stage: 2,
    desc: 'Linha editorial, cadência e memória — conteúdo que educa mercado em vez de preencher calendário.',
    formats: ['Texto-lâmina', 'Card', 'Doc PDF'],
    series: 'Mayven Signal',
    output: '“Conteúdo não é calendário. É construção de mercado.”',
  },
  {
    name: 'IA aplicada à criação e mídia',
    stage: 4,
    desc: 'Workflows, agentes e loops — IA como operação com direção humana, não como atalho genérico.',
    formats: ['Experimento', 'Stack aberto', 'Meta-case'],
    series: 'Build in Public',
    output: '“Nosso stack real de IA — sem hype.”',
  },
  {
    name: 'Creative Technology',
    stage: 1,
    desc: 'Real-time 3D, shaders e engenharia criativa traduzidos em valor de negócio.',
    formats: ['Devlog', 'Timelapse', 'Demo'],
    series: 'Creative Tech Notes',
    output: '“Isso não é render. É o navegador a 60fps.”',
  },
  {
    name: 'Diagnóstico, crítica e teardown',
    stage: 3,
    desc: 'Autópsias de sites, marcas e feeds — competência provada em público, sem pedir confiança.',
    formats: ['Autopsy', 'Before/After', 'Teardown'],
    series: 'Site Autopsy',
    output: '“Causa da morte: parecer template.”',
  },
]

const SERIES = ['Mayven Signal', 'Site Autopsy', 'Anti-agência', 'Build in Public', 'Before / After', 'Creative Tech Notes', 'Signal Breakdown']

const STAGES = [
  { label: 'STRATEGY', x: 70, sub: 'tese + pilares' },
  { label: 'CREATION', x: 320, sub: 'IA + direção' },
  { label: 'DISTRIBUTION', x: 600, sub: 'canais + mídia' },
  { label: 'PERFORMANCE', x: 880, sub: 'dados + sinais' },
  { label: 'LEARNING', x: 1130, sub: 'volta pra tese' },
]

const FLOW = 'M 70 150 C 170 90, 220 90, 320 150 S 500 210, 600 150 S 780 90, 880 150 S 1030 210, 1130 150'
const RETURN = 'M 1130 150 C 1110 300, 90 300, 70 150'

export default function Editorial() {
  const secRef = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [live, setLive] = useState(false)
  const mobile = useIsMobile()

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.15 })
    io.observe(secRef.current!)
    return () => io.disconnect()
  }, [])

  const activeStage = hovered !== null ? PILLARS[hovered].stage : -1
  const insp = hovered !== null ? PILLARS[hovered] : null

  return (
    <section ref={secRef} id="media" className={`editorial ${live ? 'is-live' : ''} ${hovered !== null ? 'is-inspecting' : ''}`}>
      <header className="sec-head media-head">
        <p className="sec-eyebrow mono">06 — MEDIA COMPANY</p>
        <h2 className="sec-title">
          Every company is becoming <em>a media company.</em>
        </h2>
        <p className="sec-punch">Most just don’t know how to operate like one.</p>
      </header>

      <div className="media-os">
        {/* LEFT — thesis + pillars (the engine's fuel) */}
        <div className="media-left">
          <p className="mono edit-side-tag">PILARES EDITORIAIS — INSPECIONE O SISTEMA</p>
          <ul className="edit-pillars">
            {PILLARS.map((p, i) => (
              <li
                className={`edit-pillar ${hovered === i ? 'is-hot' : hovered !== null ? 'is-dim' : ''}`}
                key={p.name}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
              >
                <span className="mono">P{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.name}</h3>
                <i className="edit-pulse" aria-hidden="true" />
              </li>
            ))}
          </ul>
          <p className="edit-note mono">CONTEÚDO NÃO É CALENDÁRIO. É UM MOTOR.</p>
        </div>

        {/* CENTER — the living loop */}
        <div className="media-center" aria-hidden="true">
          <svg viewBox="0 0 1200 330" className="engine-svg" preserveAspectRatio="xMidYMid meet">
            <path d={FLOW} className="eng-track" />
            <path d={RETURN} className="eng-return" />
            <path d={FLOW} className="eng-flow" />
            <path d={RETURN} className="eng-flow eng-flow-back" />

            {!mobile && (
              <>
                <g className="eng-asset">
                  <rect x="-16" y="-11" width="32" height="22" rx="2" />
                  <line x1="-10" y1="-3" x2="8" y2="-3" />
                  <line x1="-10" y1="3" x2="4" y2="3" />
                  <animateMotion dur="11s" repeatCount="indefinite" path={FLOW} rotate="0" />
                </g>
                <g className="eng-asset eng-asset-video">
                  <rect x="-8" y="-14" width="16" height="28" rx="2" />
                  <path d="M -2 -4 L 4 0 L -2 4 Z" />
                  <animateMotion dur="11s" begin="-3.6s" repeatCount="indefinite" path={FLOW} rotate="0" />
                </g>
                <g className="eng-asset eng-asset-carousel">
                  <rect x="-18" y="-10" width="20" height="20" rx="2" />
                  <rect x="4" y="-10" width="14" height="20" rx="2" opacity="0.5" />
                  <animateMotion dur="11s" begin="-7.2s" repeatCount="indefinite" path={FLOW} rotate="0" />
                </g>
                <g className="eng-asset eng-asset-data">
                  <circle r="4" />
                  <animateMotion dur="7s" repeatCount="indefinite" path={RETURN} rotate="0" />
                </g>
                <g className="eng-asset eng-asset-data">
                  <circle r="2.6" />
                  <animateMotion dur="7s" begin="-3.5s" repeatCount="indefinite" path={RETURN} rotate="0" />
                </g>
              </>
            )}

            {STAGES.map((s, i) => (
              <g key={s.label} transform={`translate(${s.x} 150)`} className={`eng-node ${i === activeStage ? 'is-hot' : ''}`}>
                <circle r="26" className="eng-node-focus" />
                <circle r="7" className="eng-node-dot" />
                <circle r="14" className="eng-node-halo" />
              </g>
            ))}

            <g transform="translate(858 92)" className="eng-bars">
              {[14, 26, 20, 34].map((h, i) => (
                <rect key={i} x={i * 12} y={40 - h} width="7" height={h} style={{ ['--i' as string]: i }} />
              ))}
            </g>
            <text x="320" y="80" className="eng-prompt">&gt; generate --voice=mayven</text>
          </svg>

          <div className="engine-labels">
            {STAGES.map((s, i) => (
              <div
                className={`engine-label ${i === activeStage ? 'is-hot' : ''}`}
                key={s.label}
                style={{ ['--x' as string]: `${(s.x / 1200) * 100}%` }}
              >
                <b className="mono">{s.label}</b>
                <span className="mono">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — live inspection panel */}
        <aside className="media-panel" aria-live="polite">
          <span className="media-panel-bar mono">MEDIA.OS — {insp ? `INSPECT P${String(hovered! + 1).padStart(2, '0')}` : 'IDLE'}</span>
          {insp ? (
            <div className="media-panel-body" key={insp.name}>
              <h3>{insp.name}</h3>
              <p>{insp.desc}</p>
              <div className="media-kv">
                <span className="mono">FORMATOS</span>
                <div className="media-chips">
                  {insp.formats.map((f) => (
                    <b className="mono" key={f}>{f}</b>
                  ))}
                </div>
              </div>
              <div className="media-kv">
                <span className="mono">SÉRIE-CASA</span>
                <div className="media-chips">
                  <b className="mono is-series">{insp.series}</b>
                </div>
              </div>
              <div className="media-kv">
                <span className="mono">OUTPUT</span>
                <p className="media-output">{insp.output}</p>
              </div>
              <span className="mono media-stage-tag">→ ALIMENTA: {STAGES[insp.stage].label}</span>
            </div>
          ) : (
            <div className="media-panel-body media-panel-idle">
              <p className="mono">SISTEMA OPERANDO ●</p>
              <p>
                Estratégia, narrativa, formatos, distribuição, performance e aprendizado — cada volta do loop
                deixa a marca mais pesada.
              </p>
              <p className="mono media-hint">↳ PASSE O CURSOR PELOS PILARES</p>
            </div>
          )}
        </aside>
      </div>

      <div className="marquee" aria-label="Séries recorrentes da Mayven">
        <div className="marquee-track">
          {[...SERIES, ...SERIES].map((s, i) => (
            <span key={i}>
              {s} <em aria-hidden="true">●</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

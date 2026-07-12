import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* FROM LAUNCH TO CONTINUOUS OPERATION —
   the line that becomes a loop: build once, operate forever. */

const BUILD = ['Pesquisar', 'Planejar', 'Construir', 'Lançar']
const OPERATE = ['Produzir', 'Distribuir', 'Medir', 'Aprender', 'Otimizar']
const DOMAINS = ['Tecnologia', 'Conteúdo', 'Mídia', 'Canais', 'CRM', 'Vendas', 'Dados']

/* geometry: straight build line feeding a continuous operation loop */
const LINE_Y = 160
const BUILD_XS = [60, 200, 340, 480]
const LOOP_C = { x: 790, y: LINE_Y }
const LOOP_R = 118
const loopPoint = (i: number, n: number) => {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2
  return { x: LOOP_C.x + Math.cos(a) * LOOP_R, y: LOOP_C.y + Math.sin(a) * LOOP_R }
}

export default function Operation() {
  const secRef = useRef<HTMLElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: secRef.current,
      start: 'top 78%',
      end: 'bottom top',
      onToggle: (self) => setLive(self.isActive),
    })
    return () => st.kill()
  }, [])

  return (
    <section ref={secRef} id="operation" className={`operation ${live ? 'is-live' : ''}`}>
      <header className="sec-head">
        <p className="sec-eyebrow mono">06 — CONTINUOUS OPERATION</p>
        <h2 className="sec-title">
          Do lançamento à <em>operação contínua.</em>
        </h2>
        <p className="sec-copy">
          Não entregamos um projeto e desaparecemos. Construímos a infraestrutura — e operamos o sistema:
          tecnologia, conteúdo, mídia, canais, CRM, vendas e dados girando juntos, todos os dias.
        </p>
      </header>

      <div
        className="op-diagram"
        role="img"
        aria-label="Diagrama: as etapas de construção (pesquisar, planejar, construir, lançar) alimentam um ciclo contínuo de operação (produzir, distribuir, medir, aprender, otimizar)"
      >
        <svg viewBox="0 0 1000 330" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {/* build line */}
          <line x1={BUILD_XS[0]} y1={LINE_Y} x2={LOOP_C.x - LOOP_R} y2={LINE_Y} className="op-track" />
          <line x1={BUILD_XS[0]} y1={LINE_Y} x2={LOOP_C.x - LOOP_R} y2={LINE_Y} className="op-flow" />
          {BUILD_XS.map((x, i) => (
            <g key={i} transform={`translate(${x} ${LINE_Y})`} className="op-node" style={{ ['--i' as string]: i }}>
              <circle r="6" className="op-dot" />
              <text y="-18" textAnchor="middle" className="op-label">{BUILD[i].toUpperCase()}</text>
            </g>
          ))}
          <text x={(BUILD_XS[0] + BUILD_XS[3]) / 2} y={LINE_Y + 42} textAnchor="middle" className="op-phase">
            BUILD — UMA VEZ
          </text>

          {/* operation loop */}
          <circle cx={LOOP_C.x} cy={LOOP_C.y} r={LOOP_R} className="op-track" />
          <circle cx={LOOP_C.x} cy={LOOP_C.y} r={LOOP_R} className="op-flow op-flow-loop" />
          {OPERATE.map((s, i) => {
            const p = loopPoint(i, OPERATE.length)
            const above = p.y < LOOP_C.y - 4
            return (
              <g key={s} transform={`translate(${p.x} ${p.y})`} className="op-node" style={{ ['--i' as string]: i + 4 }}>
                <circle r="6" className="op-dot op-dot-loop" />
                <text y={above ? -14 : 24} textAnchor="middle" className="op-label">{s.toUpperCase()}</text>
              </g>
            )
          })}
          <text x={LOOP_C.x} y={LOOP_C.y + 6} textAnchor="middle" className="op-phase">
            OPERATE — SEMPRE
          </text>

          {/* traveling signal: build line → into the loop */}
          <circle r="4" className="op-signal">
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              path={`M ${BUILD_XS[0]} ${LINE_Y} H ${LOOP_C.x - LOOP_R} A ${LOOP_R} ${LOOP_R} 0 1 1 ${LOOP_C.x - LOOP_R} ${LINE_Y - 0.01} Z`}
            />
          </circle>
        </svg>

        <div className="op-domains" aria-label="Domínios integrados na operação">
          {DOMAINS.map((d, i) => (
            <span className="mono" key={d} style={{ ['--i' as string]: i }}>
              {d}
            </span>
          ))}
        </div>
      </div>

      <p className="op-punch">
        Quem só entrega o projeto, entrega o problema junto. <em>Quem opera, cresce com você.</em>
      </p>
    </section>
  )
}

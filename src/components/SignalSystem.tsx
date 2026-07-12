import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '../lib/ui'

const STEPS = [
  { n: '01', t: 'Decode', d: 'Mercado, concorrência, público e percepção atual.', sim: 'NOISE FIELD — READING MARKET SIGNALS' },
  { n: '02', t: 'Define', d: 'Posicionamento, narrativa e proposta de valor.', sim: 'VECTOR LOCK — STRATEGY RESOLVED' },
  { n: '03', t: 'Design', d: 'Identidade, interface, experiência e direção visual.', sim: 'GRID ASSEMBLY — VISUAL SYSTEM' },
  { n: '04', t: 'Engineer', d: 'Motion, WebGL, IA, automações e experiências interativas.', sim: 'WAVEFORM — SYSTEMS ONLINE' },
  { n: '05', t: 'Distribute', d: 'Conteúdo, mídia, canais e campanhas.', sim: 'BROADCAST — 5 CHANNELS ACTIVE' },
  { n: '06', t: 'Learn', d: 'Dados, performance, IA e otimização contínua.', sim: 'FEEDBACK LOOP — SYSTEM LEARNING' },
]

const P_COUNT = 220
const BONE = '#F4F1EA'
const PINK = '#EC0B57'
const LIME = '#D7FF3F'
const BLUE = '#2D6CFF'

/** Per-step particle target: returns [x, y] in 0..1 space for particle i at time t. */
function target(step: number, i: number, t: number, seed: number): [number, number] {
  const f = i / P_COUNT
  switch (step) {
    case 0: {
      // market noise: brownian scatter
      const a = seed * 6.28 + t * (0.1 + seed * 0.3)
      return [0.5 + Math.cos(a * 1.7 + i) * (0.42 * seed + 0.05), 0.5 + Math.sin(a + i * 1.3) * (0.4 * seed + 0.05)]
    }
    case 1: {
      // strategy vector: everything aligns onto one diagonal
      const along = f
      const spread = (seed - 0.5) * 0.05
      return [0.12 + along * 0.76 - spread, 0.82 - along * 0.62 + spread]
    }
    case 2: {
      // design grid: snap to lattice
      const cols = 16
      const col = i % cols
      const row = Math.floor(i / cols)
      return [0.12 + (col / (cols - 1)) * 0.76, 0.16 + (row / Math.ceil(P_COUNT / cols)) * 0.68]
    }
    case 3: {
      // engineering waveform: lissajous ribbons
      const ph = f * Math.PI * 2
      return [0.5 + 0.38 * Math.sin(ph * 2 + t * 0.9), 0.5 + 0.3 * Math.sin(ph * 3 + t * 1.3 + seed)]
    }
    case 4: {
      // distribution: radiate from source to 5 channel clusters
      const ch = i % 5
      const cy = 0.14 + ch * 0.18
      const prog = (f * 3 + t * 0.12 + seed) % 1
      return [0.1 + prog * 0.78, 0.5 + (cy - 0.5) * prog * 1.9 + (seed - 0.5) * 0.03]
    }
    default: {
      // learning: spiral feedback into the core
      const ang = f * Math.PI * 7 + t * 0.4
      const rad = 0.05 + ((f * 2.5 + t * 0.05 + seed) % 1) * 0.38
      return [0.5 + Math.cos(ang) * rad * 1.1, 0.5 + Math.sin(ang) * rad]
    }
  }
}

function Simulation({ step, live }: { step: number; live: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stepRef = useRef(step)
  stepRef.current = step

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let running = false
    const parts = Array.from({ length: P_COUNT }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      seed: Math.random(),
      c: i % 9 === 0 ? PINK : i % 13 === 0 ? LIME : i % 17 === 0 ? BLUE : BONE,
    }))

    const size = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width = r.width * devicePixelRatio
      canvas.height = r.height * devicePixelRatio
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    const draw = (now: number) => {
      if (!running) return
      const t = now / 1000
      const s = stepRef.current
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // step-specific scaffolding
      ctx.globalAlpha = 1
      if (s === 2) {
        ctx.strokeStyle = 'rgba(244,241,234,0.06)'
        ctx.lineWidth = 1
        for (let g = 0; g <= 8; g++) {
          ctx.beginPath()
          ctx.moveTo((W * (0.12 + g * 0.095)), H * 0.14)
          ctx.lineTo((W * (0.12 + g * 0.095)), H * 0.86)
          ctx.stroke()
        }
      }
      if (s === 4) {
        ctx.font = `${10 * devicePixelRatio}px JetBrains Mono, monospace`
        ctx.fillStyle = 'rgba(244,241,234,0.4)'
        ;['SOCIAL', 'SEARCH', 'MEDIA', 'EMAIL', 'PARTNER'].forEach((ch, k) => {
          const y = H * (0.14 + k * 0.18)
          ctx.fillText(ch, W * 0.9, y + 3)
          ctx.strokeStyle = 'rgba(236,11,87,0.5)'
          ctx.strokeRect(W * 0.88 - 8, y - 10 * devicePixelRatio, 6, 20)
        })
      }
      if (s === 5) {
        ctx.strokeStyle = 'rgba(215,255,63,0.4)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.04, 0, Math.PI * 2)
        ctx.stroke()
      }
      if (s === 1) {
        ctx.strokeStyle = 'rgba(236,11,87,0.55)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(W * 0.12, H * 0.82)
        ctx.lineTo(W * 0.88, H * 0.2)
        ctx.stroke()
        // arrowhead
        ctx.beginPath()
        ctx.moveTo(W * 0.88, H * 0.2)
        ctx.lineTo(W * 0.845, H * 0.215)
        ctx.moveTo(W * 0.88, H * 0.2)
        ctx.lineTo(W * 0.87, H * 0.245)
        ctx.stroke()
      }

      // particles chase their step target
      for (let pi = 0; pi < parts.length; pi++) {
        const p = parts[pi]
        const [tx, ty] = target(s, pi, t, p.seed)
        p.x += (tx - p.x) * 0.055
        p.y += (ty - p.y) * 0.055
        ctx.fillStyle = p.c
        ctx.globalAlpha = 0.75
        const r = (p.c === PINK ? 2.2 : 1.5) * devicePixelRatio
        ctx.fillRect(p.x * W, p.y * H, r, r)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
      if (running) raf = requestAnimationFrame(draw)
      else cancelAnimationFrame(raf)
    })
    io.observe(canvas)
    return () => {
      io.disconnect()
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  return <canvas ref={canvasRef} className="sig-sim" aria-hidden="true" />
}

export default function SignalSystem() {
  const secRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  const os = !mobile && !reduced

  useEffect(() => {
    if (!os) return
    const st = ScrollTrigger.create({
      trigger: secRef.current,
      start: 'top top',
      end: '+=420%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length))
        setActive((prev) => (prev === idx ? prev : idx))
      },
    })
    return () => st.kill()
  }, [os])

  return (
    <section ref={secRef} id="system" className={`signal ${os ? 'is-os' : ''}`}>
      <div className="sig-screen">
        <header className="sig-head">
          <p className="sec-eyebrow mono">04 — METHOD</p>
          <h2 className="sec-title sig-title">
            Mayven <em>Signal System</em>
          </h2>
        </header>

        <div className="sig-os">
          <div className="sig-left">
            <ol className="sig-list">
              {STEPS.map((s, i) => (
                <li className={`sig-row ${i === active ? 'is-active' : i < active ? 'is-done' : ''}`} key={s.n}>
                  <span className="sig-num mono">{s.n}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                  <span className="sig-status mono" aria-hidden="true">
                    {i < active ? '■ DONE' : i === active ? '● RUN' : '○ QUEUE'}
                  </span>
                </li>
              ))}
            </ol>
            <p className={`sig-cycle mono ${active === 5 ? 'is-on' : ''}`} aria-hidden="true">
              06 LEARN ─────↺ 01 DECODE — O CICLO RECOMEÇA
            </p>
          </div>

          {os && (
            <div className="sig-right" aria-hidden="true">
              <div className="sig-sim-frame">
                <span className="sig-sim-bar mono">SIGNAL.OS — {STEPS[active].sim}</span>
                <Simulation step={active} live={os} />
                <span className="sig-sim-foot mono">
                  SYS.{STEPS[active].n} / 06 — {STEPS[active].t.toUpperCase()} ● LIVE
                </span>
              </div>
            </div>
          )}
        </div>

        <p className="sig-note mono">
          NÃO É UMA LINHA QUE TERMINA. É UM CICLO: <span className="sig-loop-note">LEARN REALIMENTA DECODE ↺</span>
        </p>
      </div>
    </section>
  )
}

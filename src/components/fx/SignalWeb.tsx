import { useEffect, useRef } from 'react'

/**
 * 2D-canvas connective tissue behind the capability grid:
 * faint lines between module centers with signal pulses travelling along them.
 */
export default function SignalWeb({ gridRef }: { gridRef: React.RefObject<HTMLDivElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const grid = gridRef.current!
    const ctx = canvas.getContext('2d')!
    let nodes: { x: number; y: number }[] = []
    let edges: [number, number][] = []
    let pulses: { e: number; t: number; v: number; c: string }[] = []
    let raf = 0
    let running = false

    const measure = () => {
      const r = grid.getBoundingClientRect()
      canvas.width = r.width * devicePixelRatio
      canvas.height = r.height * devicePixelRatio
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      nodes = [...grid.querySelectorAll<HTMLElement>('.svc-card')].map((el) => {
        const c = el.getBoundingClientRect()
        return { x: c.left - r.left + c.width / 2, y: c.top - r.top + c.height / 2 }
      })
      edges = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          // connect neighbors only (grid adjacency by distance)
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          if (d < Math.max(canvas.clientWidth / 2.2, 460)) edges.push([i, j])
        }
      }
      pulses = Array.from({ length: Math.min(edges.length, 9) }, (_, k) => ({
        e: k % edges.length,
        t: Math.random(),
        v: 0.0016 + Math.random() * 0.002,
        c: k % 3 === 0 ? '#D7FF3F' : '#EC0B57',
      }))
    }

    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      ctx.lineWidth = 1
      for (const [a, b] of edges) {
        ctx.strokeStyle = 'rgba(244,241,234,0.05)'
        ctx.beginPath()
        ctx.moveTo(nodes[a].x, nodes[a].y)
        ctx.lineTo(nodes[b].x, nodes[b].y)
        ctx.stroke()
      }
      for (const p of pulses) {
        const [a, b] = edges[p.e]
        p.t += p.v
        if (p.t > 1) {
          p.t = 0
          p.e = Math.floor(Math.random() * edges.length)
        }
        const x = nodes[a].x + (nodes[b].x - nodes[a].x) * p.t
        const y = nodes[a].y + (nodes[b].y - nodes[a].y) * p.t
        ctx.fillStyle = p.c
        ctx.globalAlpha = Math.sin(p.t * Math.PI) * 0.9
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
      if (running) {
        measure()
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(draw)
      } else {
        cancelAnimationFrame(raf)
      }
    })
    io.observe(grid)
    const ro = new ResizeObserver(measure)
    ro.observe(grid)
    return () => {
      io.disconnect()
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [gridRef])

  return <canvas ref={canvasRef} className="svc-web" aria-hidden="true" />
}

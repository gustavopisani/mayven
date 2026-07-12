import { useEffect, useRef, useState } from 'react'

/**
 * BRAND HEART — coração anatômico em partículas (Canvas 2D + projeção 3D própria).
 * Metáfora: o Brand System é o coração da marca; cada pulso bombeia direção
 * para Website, Content e Media.
 *
 * Sem dependências: geometria procedural (ventrículos assimétricos, átrios,
 * arco aórtico, tronco pulmonar, veia cava) amostrada como nuvem de pontos.
 * Estado base rarefeito → hover/foco/toque atrai partículas até a anatomia.
 */

/* ---------- helpers ---------- */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (v: number) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

/* batida "lub-dub": dois bumps suaves por ciclo */
const pulseShape = (phase: number) => {
  const p = phase - Math.floor(phase)
  const b1 = Math.exp(-((p - 0.16) * (p - 0.16)) / 0.005)
  const b2 = 0.45 * Math.exp(-((p - 0.34) * (p - 0.34)) / 0.0035)
  return b1 + b2
}

/* ---------- geometria procedural ---------- */
type HeartGeometry = {
  heart: Float32Array // xyz por partícula (posição anatômica)
  disp: Float32Array // xyz por partícula (posição rarefeita)
  thresh: Float32Array // ordem de formação (0 = núcleo, 1 = detalhe fino)
  amp: Float32Array // amplitude de pulso por região
  delay: Float32Array // defasagem do pulso
  seed: Float32Array // ruído individual
  group: Uint8Array // índice de cor
  order: Uint32Array // índices ordenados por grupo (para desenhar por cor)
}

/* rotaciona o órgão inteiro para a inclinação anatômica (ápice para baixo-esquerda) */
const tilt = (p: [number, number, number]): [number, number, number] => {
  const az = -0.32 // rotação em Z
  const ax = 0.12 // leve rotação em X
  let [x, y, z] = p
  const cz = Math.cos(az), sz = Math.sin(az)
  ;[x, y] = [x * cz - y * sz, x * sz + y * cz]
  const cx = Math.cos(ax), sx = Math.sin(ax)
  ;[y, z] = [y * cx - z * sx, y * sx + z * cx]
  return [x, y, z]
}

function buildHeart(n: number): HeartGeometry {
  const heart = new Float32Array(n * 3)
  const disp = new Float32Array(n * 3)
  const thresh = new Float32Array(n)
  const amp = new Float32Array(n)
  const delay = new Float32Array(n)
  const seed = new Float32Array(n)
  const group = new Uint8Array(n)

  const R = Math.random

  /* amostra casca+volume de um elipsoide (viés para a superfície → leitura escultórica) */
  const ellipsoid = (cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) => {
    const u = R() * 2 - 1
    const a = R() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const r = Math.pow(R(), 0.28) // maioria perto da casca
    return [cx + rx * r * s * Math.cos(a), cy + ry * r * u, cz + rz * r * s * Math.sin(a)] as [number, number, number]
  }
  /* amostra um tubo ao longo de uma curva paramétrica */
  const tube = (curve: (t: number) => [number, number, number], radius: number) => {
    const t = R()
    const [x, y, z] = curve(t)
    const a = R() * Math.PI * 2
    const r = radius * Math.pow(R(), 0.4)
    return { p: [x + r * Math.cos(a), y + r * Math.sin(a) * 0.8, z + r * Math.sin(a) * 0.6] as [number, number, number], t }
  }

  /* curvas das artérias */
  const aorta = (t: number): [number, number, number] => {
    // sobe do centro, arqueia para a esquerda e desce atrás (formato de cajado)
    const up = Math.min(t, 0.45) / 0.45
    const arch = clamp01((t - 0.45) / 0.55)
    const x = 0.06 - arch * 0.5 + Math.sin(arch * Math.PI) * 0.1
    const y = 0.42 + up * 0.42 + Math.sin(arch * Math.PI) * 0.18 - arch * 0.28
    const z = 0.02 - arch * 0.22
    return [x, y, z]
  }
  const pulmonary = (t: number): [number, number, number] => [
    0.24 - t * 0.36,
    0.34 + t * 0.34,
    0.16 + t * 0.1,
  ]
  const cava = (t: number): [number, number, number] => [0.46 + t * 0.03, 0.5 + t * 0.36, -0.06]
  const branch = (t: number): [number, number, number] => {
    const a = aorta(0.62)
    return [a[0] + t * 0.02, a[1] + t * 0.22, a[2]]
  }

  /* distribuição por região: [fração, gerador, thresh base, thresh range, amp, delay base, grupo dominante] */
  for (let i = 0; i < n; i++) {
    const f = i / n
    let p: [number, number, number]
    let th: number
    let am: number
    let dl: number

    if (f < 0.3) {
      // ventrículo esquerdo — massa principal, ápice
      p = ellipsoid(-0.06, -0.16, 0, 0.5, 0.62, 0.46)
      th = R() * 0.38
      am = 0.09
      dl = 0.0
    } else if (f < 0.5) {
      // ventrículo direito — menor, sobreposto à direita
      p = ellipsoid(0.3, -0.08, 0.07, 0.36, 0.48, 0.34)
      th = R() * 0.42
      am = 0.08
      dl = 0.03
    } else if (f < 0.59) {
      // átrio esquerdo
      p = ellipsoid(-0.27, 0.4, -0.14, 0.25, 0.22, 0.22)
      th = 0.24 + R() * 0.3
      am = 0.045
      dl = -0.08
    } else if (f < 0.69) {
      // átrio direito
      p = ellipsoid(0.37, 0.36, -0.05, 0.27, 0.24, 0.24)
      th = 0.24 + R() * 0.3
      am = 0.045
      dl = -0.08
    } else if (f < 0.83) {
      // aorta + arco (extremidade dissolve primeiro: thresh cresce com t)
      const s = tube(aorta, 0.085)
      p = s.p
      th = 0.5 + s.t * 0.42
      am = 0.03
      dl = 0.1
    } else if (f < 0.86) {
      // ramos do arco aórtico (detalhe mais fino de todos)
      const s = tube(branch, 0.03)
      p = s.p
      th = 0.82 + s.t * 0.16
      am = 0.02
      dl = 0.12
    } else if (f < 0.94) {
      // tronco pulmonar cruzando na frente
      const s = tube(pulmonary, 0.07)
      p = s.p
      th = 0.46 + s.t * 0.4
      am = 0.035
      dl = 0.08
    } else {
      // veia cava superior
      const s = tube(cava, 0.055)
      p = s.p
      th = 0.55 + s.t * 0.4
      am = 0.03
      dl = 0.06
    }

    const [x, y, z] = tilt(p)
    heart[i * 3] = x
    heart[i * 3 + 1] = y
    heart[i * 3 + 2] = z

    // posição rarefeita: casca esférica ampla ao redor da anatomia
    const u = R() * 2 - 1
    const a = R() * Math.PI * 2
    const s2 = Math.sqrt(1 - u * u)
    const rr = 1.15 + R() * 1.1
    disp[i * 3] = rr * s2 * Math.cos(a)
    disp[i * 3 + 1] = 0.1 + rr * u
    disp[i * 3 + 2] = rr * s2 * Math.sin(a)

    thresh[i] = th
    amp[i] = am
    delay[i] = dl + R() * 0.04
    seed[i] = R() * 100

    // cores: vinho/magenta profundo dominam; rosa elétrico e branco são raros
    const cr = R()
    group[i] = cr < 0.34 ? 0 : cr < 0.72 ? 1 : cr < 0.84 ? 2 : cr < 0.95 ? 3 : 4
  }

  // índices ordenados por grupo de cor (troca de fillStyle só 5x por frame)
  const order = new Uint32Array(n)
  let k = 0
  for (let g = 0; g < 5; g++) for (let i = 0; i < n; i++) if (group[i] === g) order[k++] = i

  return { heart, disp, thresh, amp, delay, seed, group, order }
}

/* paleta: vinho quase preto → magenta profundo → poucos pontos de energia */
const GROUPS = [
  { color: 'rgb(58,8,34)', alpha: 0.55 }, // vinho quase preto
  { color: 'rgb(122,10,60)', alpha: 0.6 }, // magenta profundo
  { color: 'rgb(178,12,88)', alpha: 0.62 }, // magenta médio
  { color: 'rgb(255,10,120)', alpha: 0.68 }, // rosa elétrico (pontos de energia)
  { color: 'rgb(235,232,238)', alpha: 0.5 }, // branco suave estrutural (mínimo)
]

const particleCount = () => {
  const w = window.innerWidth
  if (w >= 1400) return 6500
  if (w >= 1024) return 5200
  if (w >= 768) return 3200
  return 1800
}

export default function BrandHeart() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)
  const lastPointerType = useRef<string>('mouse')

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setFallback(true)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const BASE = reduced ? 0.52 : 0.36 // formação em repouso (rarefeito, mas reconhecível)
    const N = particleCount()
    const geo = buildHeart(N)

    /* estado (refs locais do loop — sem alocação por frame) */
    let raf = 0
    let running = false
    let inView = false
    let width = 0
    let height = 0
    let unit = 0
    let t = 0
    let last = 0
    let F = BASE // formação atual
    let hover = false
    let phase = 0
    let mx = -9999
    let my = -9999
    let touchTimer: ReturnType<typeof setTimeout> | undefined

    /* sinais que "alimentam" Website / Content / Media: 3 fluxos × 4 pontos */
    const SIG_STREAMS = 3
    const SIG_DOTS = 4
    const sigLife = new Float32Array(SIG_STREAMS * SIG_DOTS).fill(2) // >1 = inativo
    const sigDirs = [
      [0.92, -0.34], // → Website (direita, leve subida)
      [0.99, 0.1], // → Content (direita)
      [0.86, 0.5], // → Media (direita, descendo)
    ]
    let beatArmed = true
    let beatCount = 0

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      const r = host.getBoundingClientRect()
      width = Math.max(1, Math.round(r.width))
      height = Math.max(1, Math.round(r.height))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      unit = Math.min(width, height) * 0.46
    }

    const start = () => {
      if (running || !inView || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(render)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const render = (now: number) => {
      if (!running) return
      raf = requestAnimationFrame(render)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt

      // formação: aproxima do alvo com easing exponencial (viagem gradual, não troca de estado)
      const target = hover ? 1 : BASE
      F += (target - F) * (1 - Math.exp(-dt * (reduced ? 1.1 : hover ? 1.5 : 1.1)))

      // pulsação: mais lenta em repouso, um pouco mais presente no hover
      const period = reduced ? 3.2 : hover ? 1.35 : 1.7
      const prevPhase = phase
      phase = (phase + dt / period) % 1
      if (phase < prevPhase) {
        beatCount++
        beatArmed = true
      }
      const beat = pulseShape(phase)
      const beatAmp = reduced ? 0.2 : 0.55 + 0.45 * F

      // emite sinais nas batidas mais fortes (a cada 2 ciclos), só com o coração razoavelmente formado
      if (!reduced && beatArmed && beat > 0.9 && beatCount % 2 === 0 && F > 0.5) {
        beatArmed = false
        for (let s = 0; s < SIG_STREAMS; s++)
          for (let d = 0; d < SIG_DOTS; d++) sigLife[s * SIG_DOTS + d] = -d * 0.12
      }

      // rotação lenta em Y
      const ang = reduced ? 0.25 : t * 0.14
      const ca = Math.cos(ang)
      const sa = Math.sin(ang)
      const cx = width * 0.5
      const cy = height * 0.52

      ctx.clearRect(0, 0, width, height)

      // glow atmosférico central (controlado — hierarquia abaixo do Website)
      const glowA = 0.05 + 0.06 * F
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 1.15)
      grad.addColorStop(0, `rgba(255,10,120,${glowA})`)
      grad.addColorStop(0.55, `rgba(122,10,60,${glowA * 0.4})`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      const { heart, disp, thresh, amp, delay, seed, order, group } = geo
      const jitterBase = reduced ? 0.006 : 0.014
      const cursorOn = hover && !reduced && lastPointerType.current !== 'touch'
      const CR = unit * 0.55 // raio de influência do cursor
      const CR2 = CR * CR

      let gPrev = -1
      for (let k = 0; k < order.length; k++) {
        const i = order[k]
        const g = group[i]
        if (g !== gPrev) {
          ctx.fillStyle = GROUPS[g].color
          gPrev = g
        }

        // formação individual (núcleo primeiro, artérias/pontas por último)
        const e = smooth((F * 1.12 - thresh[i]) / 0.3)

        // pulso orgânico: amplitude e defasagem por região
        const s = 1 + amp[i] * beatAmp * pulseShape(phase - delay[i])

        // posição = lerp(dispersa+deriva, anatomia*pulso)
        const i3 = i * 3
        const sd = seed[i]
        const driftX = Math.sin(t * 0.31 + sd) * 0.1
        const driftY = Math.cos(t * 0.23 + sd * 1.7) * 0.08
        const jx = Math.sin(t * 1.9 + sd * 3.1) * (jitterBase + (1 - e) * 0.03)
        const jy = Math.cos(t * 2.3 + sd * 2.3) * (jitterBase + (1 - e) * 0.03)

        let x = (disp[i3] + driftX) * (1 - e) + heart[i3] * s * e + jx
        let y = (disp[i3 + 1] + driftY) * (1 - e) + (heart[i3 + 1] * s + 0.03) * e + jy
        let z = disp[i3 + 2] * (1 - e) + heart[i3 + 2] * s * e

        // rotação Y + projeção perspectiva
        const rx = x * ca + z * sa
        const rz = -x * sa + z * ca
        const persp = 2.6 / (2.6 + rz + 1.4)
        let sx = cx + rx * unit * persp
        let sy = cy - y * unit * persp

        // deslocamento magnético sutil perto do cursor (estrutura permanece estável)
        if (cursorOn) {
          const dx = sx - mx
          const dy = sy - my
          const d2 = dx * dx + dy * dy
          if (d2 < CR2 && d2 > 0.01) {
            const push = (1 - d2 / CR2) * 5
            const inv = 1 / Math.sqrt(d2)
            sx += dx * inv * push
            sy += dy * inv * push
          }
        }

        const size = (0.9 + e * 1.1) * persp
        ctx.globalAlpha = GROUPS[g].alpha * (0.22 + 0.78 * e) * (0.65 + 0.35 * persp)
        ctx.fillRect(sx, sy, size, size)
      }

      // sinais alimentando Website / Content / Media (pequenos, sem setas)
      if (!reduced) {
        ctx.fillStyle = GROUPS[3].color
        const exitX = cx + unit * 0.12
        const exitY = cy - unit * 0.55
        for (let s = 0; s < SIG_STREAMS; s++) {
          for (let d = 0; d < SIG_DOTS; d++) {
            const idx = s * SIG_DOTS + d
            let life = sigLife[idx]
            if (life > 1.2) continue
            life += dt / 1.5
            sigLife[idx] = life
            if (life < 0 || life > 1) continue
            const eased = 1 - (1 - life) * (1 - life)
            ctx.globalAlpha = (1 - life) * 0.4
            ctx.fillRect(exitX + sigDirs[s][0] * eased * unit * 1.1, exitY + sigDirs[s][1] * eased * unit * 0.9, 1.6, 1.6)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    /* ---------- interação ---------- */
    /* fontes independentes de formação: mouse, foco de teclado e toque */
    let pointerHover = false
    let focusHold = false
    let touchHold = false
    const syncHover = () => {
      hover = pointerHover || focusHold || touchHold
      host.dataset.formed = hover ? '1' : ''
    }
    const setHover = (v: boolean) => {
      pointerHover = v
      syncHover()
    }
    const onEnter = (e: PointerEvent) => {
      lastPointerType.current = e.pointerType
      if (e.pointerType !== 'touch') setHover(true)
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') setHover(false)
      mx = -9999
      my = -9999
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mx = e.clientX - r.left
      my = e.clientY - r.top
    }
    const onPointerDown = (e: PointerEvent) => {
      lastPointerType.current = e.pointerType
      if (e.pointerType === 'touch') {
        // toque forma o coração, segura alguns segundos e dissipa
        touchHold = true
        syncHover()
        clearTimeout(touchTimer)
        touchTimer = setTimeout(() => {
          touchHold = false
          syncHover()
        }, 4500)
      }
    }
    const onClick = (e: MouseEvent) => {
      // em touch, o toque na área visual é a interação — não navega (o CTA continua navegando)
      if (lastPointerType.current === 'touch') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const onFocus = () => {
      focusHold = true
      syncHover()
    }
    const onBlur = () => {
      focusHold = false
      syncHover()
    }

    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerdown', onPointerDown, { passive: true })
    host.addEventListener('click', onClick)
    host.addEventListener('focus', onFocus)
    host.addEventListener('blur', onBlur)

    /* ---------- ciclo de vida / performance ---------- */
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) start()
        else stop()
      },
      { rootMargin: '60px' },
    )
    io.observe(host)

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      clearTimeout(touchTimer)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('click', onClick)
      host.removeEventListener('focus', onFocus)
      host.removeEventListener('blur', onBlur)
      ctx.clearRect(0, 0, width, height)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="mv-heart"
      role="img"
      tabIndex={0}
      aria-label="Representação animada do Brand System como o coração estratégico da marca."
    >
      {!fallback ? (
        <canvas ref={canvasRef} className="mv-heart-canvas" aria-hidden="true" />
      ) : (
        /* fallback sem canvas: silhueta estática do órgão em gradientes */
        <div className="mv-heart-fallback" aria-hidden="true">
          <i className="mv-hf-lv" />
          <i className="mv-hf-rv" />
          <i className="mv-hf-la" />
          <i className="mv-hf-ra" />
          <i className="mv-hf-aorta" />
        </div>
      )}
      <p className="mv-heart-legend mono" aria-hidden="true">
        POSICIONAMENTO · NARRATIVA · IDENTIDADE · VOZ
      </p>
    </div>
  )
}

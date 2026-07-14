import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clamp,
  mobileQualityTier,
  normalizeTilt,
  particleBudget,
  resolveMotionAccess,
  screenModeFromAngle,
  smoothVector,
  vectorFromPointer,
  type GravityVector,
  type MotionAccess,
  type TiltSample,
} from './tiltPhysics'

type ExperienceState =
  | 'idle'
  | 'requesting-permission'
  | 'active'
  | 'unsupported'
  | 'denied'
  | 'reduced-motion'
  | 'error'
  | 'completed'

type SensorMode = 'sensor' | 'fallback'

type HeroPhysicsEvent =
  | 'hero_immersion_started'
  | 'motion_permission_granted'
  | 'motion_permission_denied'
  | 'hero_immersion_reset'
  | 'hero_immersion_exited'
  | 'hero_immersion_fallback_used'

type HeroPhysicsCopy = {
  activeCaption: string
  denied: string
  error: string
  exit: string
  fallback: string
  fallbackCaption: string
  idle: string
  permission: string
  reducedMotion: string
  reset: string
  trigger: string
  tilt: string
}

type Particle = {
  alpha: number
  color: string
  size: number
  vx: number
  vy: number
  x: number
  y: number
}

type TextLine = {
  font: string
  text: string
  x: number
  y: number
}

type PermissionConstructor = {
  requestPermission?: () => Promise<PermissionState>
}

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: 'portrait' | 'portrait-primary') => Promise<void>
  unlock?: () => void
}

type HeroPhysicsExperienceProps = {
  anchorSelector?: string
  copy?: Partial<HeroPhysicsCopy>
  headline: string
  onEvent?: (event: HeroPhysicsEvent) => void
}

const DEFAULT_COPY: HeroPhysicsCopy = {
  activeCaption: 'A experiência é a interface.',
  denied: 'O acesso ao movimento não foi permitido. Toque, pressione ou arraste para interagir.',
  error: 'A experiência não pôde iniciar aqui. O hero continua disponível.',
  exit: 'SAIR',
  fallback: 'MOVA PARA INTERAGIR',
  fallbackCaption: 'Pressione, arraste ou faça swipe em qualquer ponto do hero.',
  idle: 'Make it felt.',
  permission: 'Permita o acesso ao movimento para a experiência responder ao celular.',
  reducedMotion: 'Os efeitos de movimento estão reduzidos neste dispositivo.',
  reset: 'RESET',
  trigger: 'ATIVAR EXPERIÊNCIA',
  tilt: 'INCLINE O CELULAR',
}

const ACTIVE_STATES = new Set<ExperienceState>(['active', 'denied', 'unsupported'])
const DOWN_GRAVITY: GravityVector = { x: 0, y: 1 }
const PARTICLE_COLORS = ['#f4f1ea', '#ec0b57', '#d7ff3f']

function isActiveState(status: ExperienceState) {
  return ACTIVE_STATES.has(status)
}

function getScreenAngle() {
  const maybeWindow = window as Window & { orientation?: number }
  return screen.orientation?.angle ?? maybeWindow.orientation ?? 0
}

function getReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getCanvasFont(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
}

function getVisibleText(element: HTMLElement) {
  const text = element.textContent ?? ''
  return window.getComputedStyle(element).textTransform === 'uppercase' ? text.toUpperCase() : text
}

function fallbackTextLines(headline: string, layerRect: DOMRect): TextLine[] {
  const size = Math.max(58, Math.min(layerRect.width * 0.16, 108))
  const font = `normal 400 ${size}px Anton, Arial Black, sans-serif`
  const normalized = headline.replace(/\s+/g, ' ').trim()
  const lines = normalized.includes(' É A ')
    ? normalized.replace(' É A ', '\nÉ A ').split('\n')
    : normalized.includes(' IS THE ')
    ? normalized.replace(' IS THE ', '\nIS THE ').split('\n')
    : normalized.split(' ').reduce<string[]>((result, word, index, words) => {
      const midpoint = Math.ceil(words.length / 2)
      const lineIndex = index < midpoint ? 0 : 1
      result[lineIndex] = result[lineIndex] ? `${result[lineIndex]} ${word}` : word
      return result
    }, [])

  return [
    {
      font,
      text: lines[0] ? `${lines[0]} ` : 'A EXPERIÊNCIA ',
      x: Math.max(22, layerRect.width * 0.08),
      y: layerRect.height * 0.38,
    },
    {
      font,
      text: lines[1] ?? normalized,
      x: Math.max(22, layerRect.width * 0.08),
      y: layerRect.height * 0.38 + size * 0.9,
    },
  ]
}

function getTextLines(anchorSelector: string, layer: HTMLElement, headline: string): TextLine[] {
  const title = document.querySelector<HTMLElement>(anchorSelector)
  const layerRect = layer.getBoundingClientRect()

  if (!title) return fallbackTextLines(headline, layerRect)

  const lineElements = Array.from(title.querySelectorAll<HTMLElement>('span'))
  const elements = lineElements.length > 0 ? lineElements : [title]
  const titleFont = getCanvasFont(title)

  return elements
    .map((element) => {
      const rect = element.getBoundingClientRect()
      const text = getVisibleText(element)

      return {
        font: titleFont,
        text,
        x: rect.left - layerRect.left,
        y: rect.top - layerRect.top,
      }
    })
    .filter((line) => line.text.trim())
}

function buildTextParticles(anchorSelector: string, layer: HTMLElement, headline: string, budget: number) {
  const rect = layer.getBoundingClientRect()
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))
  const mask = document.createElement('canvas')
  const maskContext = mask.getContext('2d', { willReadFrequently: true })

  if (!maskContext) return []

  mask.width = width
  mask.height = height
  maskContext.clearRect(0, 0, width, height)
  maskContext.fillStyle = '#fff'
  maskContext.textBaseline = 'top'

  getTextLines(anchorSelector, layer, headline).forEach((line) => {
    maskContext.font = line.font
    maskContext.fillText(line.text, line.x, line.y)
  })

  const image = maskContext.getImageData(0, 0, width, height)
  const stride = width < 520 ? 2 : width < 960 ? 2 : 3
  const candidates: Array<{ alpha: number; x: number; y: number }> = []

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const alpha = image.data[(y * width + x) * 4 + 3]
      if (alpha > 42) {
        candidates.push({
          alpha: alpha / 255,
          x: x + (Math.random() - 0.5) * stride * 0.65,
          y: y + (Math.random() - 0.5) * stride * 0.65,
        })
      }
    }
  }

  if (candidates.length === 0) return []

  const count = Math.min(budget, candidates.length)
  const center = candidates.reduce(
    (sum, candidate) => ({ x: sum.x + candidate.x / candidates.length, y: sum.y + candidate.y / candidates.length }),
    { x: 0, y: 0 },
  )
  const particles: Particle[] = []

  for (let index = 0; index < count; index += 1) {
    const candidate = candidates[Math.floor((index / count) * candidates.length)]
    const dx = candidate.x - center.x
    const dy = candidate.y - center.y
    const distance = Math.max(1, Math.hypot(dx, dy))
    const burst = 2.5 + Math.random() * 5.3
    const color = index % 29 === 0 ? PARTICLE_COLORS[1] : index % 47 === 0 ? PARTICLE_COLORS[2] : PARTICLE_COLORS[0]

    particles.push({
      alpha: Math.max(0.72, candidate.alpha),
      color,
      size: width < 520 ? 1.75 + Math.random() * 1.15 : 1.9 + Math.random() * 1.65,
      vx: (dx / distance) * burst + (Math.random() - 0.5) * 2.6,
      vy: (dy / distance) * burst - 1.2 + (Math.random() - 0.5) * 2.1,
      x: candidate.x,
      y: candidate.y,
    })
  }

  return particles
}

async function requestOrientationAccess(): Promise<MotionAccess> {
  if (typeof DeviceOrientationEvent === 'undefined') return 'unsupported'

  const OrientationEvent = DeviceOrientationEvent as unknown as PermissionConstructor

  if (typeof OrientationEvent.requestPermission !== 'function') {
    return resolveMotionAccess(true)
  }

  try {
    const permission = await OrientationEvent.requestPermission()
    return resolveMotionAccess(true, permission)
  } catch {
    return resolveMotionAccess(true, 'error')
  }
}

function statusText(status: ExperienceState, sensorMode: SensorMode, copy: HeroPhysicsCopy) {
  if (status === 'requesting-permission') return copy.permission
  if (status === 'active') return sensorMode === 'sensor' ? copy.tilt : copy.fallback
  if (status === 'denied') return copy.denied
  if (status === 'unsupported') return copy.fallback
  if (status === 'reduced-motion') return copy.reducedMotion
  if (status === 'error') return copy.error
  if (status === 'completed') return copy.idle

  return copy.idle
}

function fitCanvasToLayer(canvas: HTMLCanvasElement, layer: HTMLElement) {
  const rect = layer.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, rect.width < 520 ? 1.35 : 1.6)
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  return { dpr, height, width }
}

export default function HeroPhysicsExperience({
  anchorSelector = '#c-hero .x-hero-title',
  copy: copyOverrides,
  headline,
  onEvent,
}: HeroPhysicsExperienceProps) {
  const copy = { ...DEFAULT_COPY, ...copyOverrides }
  const [status, setStatus] = useState<ExperienceState>(() => (getReducedMotion() ? 'reduced-motion' : 'idle'))
  const [sensorMode, setSensorMode] = useState<SensorMode>('fallback')
  const [runId, setRunId] = useState(0)
  const [busy, setBusy] = useState<'starting' | 'resetting' | null>(null)
  const active = isActiveState(status)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const busyLockRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const baselineRef = useRef<TiltSample | null>(null)
  const unlockOrientationRef = useRef<(() => void) | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const sensorModeRef = useRef<SensorMode>('fallback')
  const sensorSeenRef = useRef(false)
  const targetGravityRef = useRef<GravityVector>(DOWN_GRAVITY)
  const currentGravityRef = useRef<GravityVector>(DOWN_GRAVITY)

  const emit = useCallback((event: HeroPhysicsEvent) => {
    onEvent?.(event)

    if (import.meta.env.DEV) {
      console.debug('[hero-immersion]', event)
    }
  }, [onEvent])

  const releasePortraitLock = useCallback(() => {
    unlockOrientationRef.current?.()
    unlockOrientationRef.current = null
  }, [])

  const requestPortraitLock = useCallback(() => {
    const orientation = screen.orientation as LockableScreenOrientation | undefined
    if (typeof orientation?.lock !== 'function') return

    const saveUnlock = () => {
      unlockOrientationRef.current = () => {
        try {
          orientation.unlock?.()
        } catch {
          // Some browsers expose unlock but reject when the page never acquired a lock.
        }
      }
    }

    orientation.lock('portrait-primary').then(saveUnlock).catch(() => {
      orientation.lock?.('portrait').then(saveUnlock).catch(() => {})
    })
  }, [])

  const disposeSimulation = useCallback(() => {
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    cleanupRef.current?.()
    cleanupRef.current = null
    particlesRef.current = []
    if (layerRef.current) layerRef.current.dataset.particleCount = '0'
    baselineRef.current = null
    sensorSeenRef.current = false
    targetGravityRef.current = DOWN_GRAVITY
    currentGravityRef.current = DOWN_GRAVITY

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const teardownPhysics = useCallback(() => {
    disposeSimulation()
  }, [disposeSimulation])

  const prepareParticleRun = useCallback((mode: SensorMode, nextStatus: ExperienceState) => {
    const layer = layerRef.current
    if (!layer) {
      setStatus('error')
      return
    }

    disposeSimulation()
    sensorModeRef.current = mode
    setSensorMode(mode)
    setStatus(nextStatus)
    setRunId((value) => value + 1)
  }, [disposeSimulation])

  const beginExperience = useCallback(async () => {
    if (busyLockRef.current || isActiveState(status)) return
    if (getReducedMotion()) {
      setStatus('reduced-motion')
      return
    }

    busyLockRef.current = true
    setBusy('starting')
    setStatus('requesting-permission')
    emit('hero_immersion_started')
    requestPortraitLock()

    const access = await requestOrientationAccess()
    busyLockRef.current = false
    setBusy(null)

    if (access === 'error') {
      setStatus('error')
      return
    }

    if (access === 'granted') {
      emit('motion_permission_granted')
      prepareParticleRun('sensor', 'active')
      return
    }

    if (access === 'denied') {
      emit('motion_permission_denied')
      emit('hero_immersion_fallback_used')
      prepareParticleRun('fallback', 'denied')
      return
    }

    emit('hero_immersion_fallback_used')
    prepareParticleRun('fallback', 'unsupported')
  }, [emit, prepareParticleRun, requestPortraitLock, status])

  const resetExperience = useCallback(() => {
    if (busyLockRef.current) return // evita resets simultâneos
    busyLockRef.current = true
    setBusy('resetting')

    const fallbackStatus = status === 'denied' ? 'denied' : 'unsupported'
    const nextStatus = sensorModeRef.current === 'sensor' ? 'active' : fallbackStatus

    emit('hero_immersion_reset')
    prepareParticleRun(sensorModeRef.current, nextStatus)

    // feedback perceptível + janela anti-clique-duplo
    window.setTimeout(() => {
      busyLockRef.current = false
      setBusy(null)
    }, 380)
  }, [emit, prepareParticleRun, status])

  const exitExperience = useCallback(() => {
    emit('hero_immersion_exited')
    teardownPhysics()
    releasePortraitLock()
    sensorModeRef.current = 'fallback'
    setSensorMode('fallback')
    busyLockRef.current = false
    setBusy(null)
    setStatus('completed')
  }, [emit, releasePortraitLock, teardownPhysics])

  /* saiu do estado ativo (Sair/Escape) → devolve o foco ao gatilho */
  useEffect(() => {
    if (status === 'completed') triggerRef.current?.focus({ preventScroll: true })
  }, [status])

  /* rolou para fora do hero com a experiência ativa → encerra e limpa tudo.
     A experiência pertence ao hero; nunca vira overlay sobre o resto do site. */
  useEffect(() => {
    if (!active) return
    const el = layerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) exitExperience()
      },
      { threshold: 0.02 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [active, exitExperience])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => {
      if (mq.matches) {
        if (isActiveState(status)) teardownPhysics()
        releasePortraitLock()
        setStatus('reduced-motion')
      } else if (status === 'reduced-motion') {
        setStatus('idle')
      }
    }

    mq.addEventListener('change', syncMotionPreference)
    return () => mq.removeEventListener('change', syncMotionPreference)
  }, [releasePortraitLock, status, teardownPhysics])

  useEffect(() => releasePortraitLock, [releasePortraitLock])

  useEffect(() => {
    const hero = document.getElementById('c-hero')
    hero?.classList.toggle('is-immersive-active', active)

    return () => hero?.classList.remove('is-immersive-active')
  }, [active])

  useEffect(() => {
    if (!active || runId === 0) return

    const layer = layerRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!layer || !canvas || !context) return

    let cancelled = false
    let inView = true
    let paused = false
    const nav = navigator as Navigator & { deviceMemory?: number }
    const deviceHints = {
      devicePixelRatio: window.devicePixelRatio || 1,
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      reducedMotion: getReducedMotion(),
      width: window.innerWidth,
    }
    const initialTier = mobileQualityTier(deviceHints)
    let runtimeBudget = particleBudget(deviceHints)
    let averageFrameMs = 1000 / 60
    let lastFrameTime = performance.now()
    let fpsDowngraded = false

    const rebuildParticles = () => {
      const viewport = fitCanvasToLayer(canvas, layer)
      particlesRef.current = buildTextParticles(anchorSelector, layer, headline, runtimeBudget)
      layer.dataset.particleCount = String(particlesRef.current.length)
      layer.dataset.quality = fpsDowngraded ? 'adaptive-low' : initialTier
      baselineRef.current = null

      return viewport
    }

    let viewport = rebuildParticles()
    if (particlesRef.current.length === 0) {
      setStatus('error')
      return
    }

    const applyImpulseAt = (clientX: number, clientY: number, strength = 8.5) => {
      const layerRect = layer.getBoundingClientRect()
      const px = clientX - layerRect.left
      const py = clientY - layerRect.top

      particlesRef.current.forEach((particle) => {
        const dx = particle.x - px
        const dy = particle.y - py
        const distance = Math.max(24, Math.hypot(dx, dy))
        const falloff = Math.max(0, 1 - distance / Math.max(layerRect.width, layerRect.height))

        particle.vx += (dx / distance) * strength * falloff
        particle.vy += (dy / distance) * strength * falloff
      })
    }

    const applyDirectionalImpulse = (deltaX: number, deltaY: number, strength: number) => {
      const distance = Math.max(1, Math.hypot(deltaX, deltaY))
      const dirX = deltaX / distance
      const dirY = deltaY / distance

      particlesRef.current.forEach((particle, index) => {
        const stagger = 0.72 + (index % 7) * 0.065

        particle.vx += dirX * strength * stagger + (Math.random() - 0.5) * 1.2
        particle.vy += dirY * strength * stagger + (Math.random() - 0.5) * 1.2
      })
    }

    const pointerSnapshot = (event: PointerEvent) => {
      const rect = layer.getBoundingClientRect()

      return {
        clientX: event.clientX,
        clientY: event.clientY,
        time: performance.now(),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    }

    let pointerDown = false
    let pointerStart: ReturnType<typeof pointerSnapshot> | null = null
    let pointerCurrent: ReturnType<typeof pointerSnapshot> | null = null
    const steerFromPointer = (event: PointerEvent) => {
      const next = vectorFromPointer(event.clientX, event.clientY, layer.getBoundingClientRect(), 0.08)
      targetGravityRef.current = next.x === 0 && next.y === 0 ? DOWN_GRAVITY : next
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.isPrimary === false) return
      if (event.cancelable) event.preventDefault()

      const snapshot = pointerSnapshot(event)

      pointerDown = true
      pointerStart = snapshot
      pointerCurrent = snapshot
      layer.dataset.pointer = 'holding'

      try {
        layer.setPointerCapture?.(event.pointerId)
      } catch {
        // Pointer capture can fail if a browser cancels the touch during rotation.
      }

      steerFromPointer(event)
      applyImpulseAt(event.clientX, event.clientY, event.pointerType === 'touch' ? 10 : 8.5)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.cancelable && pointerDown) event.preventDefault()
      if (pointerDown) pointerCurrent = pointerSnapshot(event)

      if (sensorModeRef.current === 'fallback' || event.pointerType === 'mouse' || pointerDown) {
        steerFromPointer(event)
      }
    }
    const finishPointer = (event: PointerEvent, cancelledByBrowser = false) => {
      if (event.cancelable) event.preventDefault()
      const start = pointerStart
      const current = pointerCurrent ?? pointerSnapshot(event)
      const elapsed = start ? Math.max(1, performance.now() - start.time) : 1
      const holdPower = start ? clamp(elapsed / 920, 0, 1) : 0
      const deltaX = start ? current.x - start.x : 0
      const deltaY = start ? current.y - start.y : 0
      const swipeDistance = Math.hypot(deltaX, deltaY)
      const swipeSpeed = swipeDistance / elapsed

      pointerDown = false
      pointerStart = null
      pointerCurrent = null
      layer.dataset.pointer = ''

      try {
        layer.releasePointerCapture?.(event.pointerId)
      } catch {
        // Pointer capture may already be gone after an orientation or app switch.
      }

      if (cancelledByBrowser) return

      if (holdPower > 0.18) {
        applyImpulseAt(current.clientX, current.clientY, 10 + holdPower * 18)
      }

      if (swipeDistance > 38 && swipeSpeed > 0.42) {
        const strength = clamp(swipeSpeed * 22, 6, 18)

        applyDirectionalImpulse(deltaX, deltaY, strength)
        targetGravityRef.current = {
          x: clamp(deltaX / Math.max(1, swipeDistance), -1, 1),
          y: clamp(deltaY / Math.max(1, swipeDistance), -1, 1),
        }
      }
    }
    const onPointerUp = (event: PointerEvent) => finishPointer(event)
    const onPointerCancel = (event: PointerEvent) => finishPointer(event, true)

    let sensorFallbackTimer: number | null = null
    let sensorCleanup: (() => void) | null = null
    if (sensorModeRef.current === 'sensor') {
      const onOrientation = (event: DeviceOrientationEvent) => {
        if (event.beta == null && event.gamma == null) return

        sensorSeenRef.current = true
        baselineRef.current ??= { beta: event.beta, gamma: event.gamma }
        targetGravityRef.current = normalizeTilt(
          { beta: event.beta, gamma: event.gamma },
          screenModeFromAngle(getScreenAngle()),
          {
            baseline: baselineRef.current,
            baseY: 0.68,
            deadZone: 0.045,
            forwardInfluence: 1.85,
            maxBeta: 28,
            maxGamma: 32,
            sensitivity: 1,
          },
        )
      }

      const onMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity ?? event.acceleration
        const x = acceleration?.x ?? 0
        const y = acceleration?.y ?? 0
        const z = acceleration?.z ?? 0
        const magnitude = Math.hypot(x, y, z)
        const now = performance.now()
        const last = Number(layer.dataset.lastMotionImpulse ?? '0')

        if (magnitude > 21 && now - last > 900) {
          layer.dataset.lastMotionImpulse = String(now)
          const current = targetGravityRef.current

          particlesRef.current.forEach((particle, index) => {
            particle.vx += current.x * 5.2 + (index % 2 === 0 ? 0.8 : -0.8)
            particle.vy += current.y * 5.2
          })
        }
      }

      window.addEventListener('deviceorientation', onOrientation, { passive: true })
      window.addEventListener('devicemotion', onMotion, { passive: true })
      sensorFallbackTimer = window.setTimeout(() => {
        if (cancelled || sensorSeenRef.current || sensorModeRef.current !== 'sensor') return

        sensorModeRef.current = 'fallback'
        setSensorMode('fallback')
        setStatus('unsupported')
        emit('hero_immersion_fallback_used')
      }, 1600)

      sensorCleanup = () => {
        window.removeEventListener('deviceorientation', onOrientation)
        window.removeEventListener('devicemotion', onMotion)
        if (sensorFallbackTimer != null) window.clearTimeout(sensorFallbackTimer)
      }
    }

    const syncPaused = () => {
      paused = document.hidden || !inView
    }
    const resizeObserver = new ResizeObserver(() => {
      viewport = rebuildParticles()
    })
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      syncPaused()
    }, { threshold: 0.01 })
    const onOrientationChange = () => {
      window.setTimeout(() => {
        viewport = rebuildParticles()
      }, 140)
    }

    resizeObserver.observe(layer)
    intersectionObserver.observe(layer)
    document.addEventListener('visibilitychange', syncPaused)
    window.addEventListener('orientationchange', onOrientationChange, { passive: true })
    layer.addEventListener('pointerdown', onPointerDown)
    layer.addEventListener('pointermove', onPointerMove)
    layer.addEventListener('pointerup', onPointerUp)
    layer.addEventListener('pointercancel', onPointerCancel)

    cleanupRef.current = () => {
      sensorCleanup?.()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', syncPaused)
      window.removeEventListener('orientationchange', onOrientationChange)
      layer.removeEventListener('pointerdown', onPointerDown)
      layer.removeEventListener('pointermove', onPointerMove)
      layer.removeEventListener('pointerup', onPointerUp)
      layer.removeEventListener('pointercancel', onPointerCancel)
    }

    const render = () => {
      if (!paused) {
        const now = performance.now()
        const frameMs = now - lastFrameTime
        lastFrameTime = now
        averageFrameMs = frameMs < 140 ? averageFrameMs * 0.94 + frameMs * 0.06 : 1000 / 60

        if (!fpsDowngraded && averageFrameMs > 24 && runtimeBudget > 900) {
          runtimeBudget = Math.max(720, Math.round(runtimeBudget * 0.72))
          particlesRef.current = particlesRef.current.slice(0, runtimeBudget)
          layer.dataset.particleCount = String(particlesRef.current.length)
          layer.dataset.quality = 'adaptive-low'
          fpsDowngraded = true
        }

        const lowPower = runtimeBudget <= 900
        const smoothed = smoothVector(currentGravityRef.current, targetGravityRef.current, lowPower ? 0.08 : 0.13)
        currentGravityRef.current = smoothed

        context.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0)
        context.clearRect(0, 0, viewport.width, viewport.height)

        const gravityScale = lowPower ? 0.12 : 0.16
        const damping = lowPower ? 0.989 : 0.993
        const bounce = 0.58
        const activePointer = pointerDown ? pointerCurrent : null
        const holdPower = pointerDown && pointerStart ? clamp((now - pointerStart.time) / 920, 0, 1) : 0

        particlesRef.current.forEach((particle) => {
          if (activePointer && holdPower > 0) {
            const dx = activePointer.x - particle.x
            const dy = activePointer.y - particle.y
            const distance = Math.max(36, Math.hypot(dx, dy))
            const reach = Math.min(1, distance / Math.max(180, viewport.width * 0.34))
            const pull = holdPower * (lowPower ? 0.011 : 0.016) * reach

            particle.vx += (dx / distance) * pull
            particle.vy += (dy / distance) * pull
          }

          particle.vx = (particle.vx + smoothed.x * gravityScale) * damping
          particle.vy = (particle.vy + smoothed.y * gravityScale) * damping
          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.x < 0) {
            particle.x = 0
            particle.vx *= -bounce
          } else if (particle.x > viewport.width) {
            particle.x = viewport.width
            particle.vx *= -bounce
          }

          if (particle.y < 0) {
            particle.y = 0
            particle.vy *= -bounce
          } else if (particle.y > viewport.height) {
            particle.y = viewport.height
            particle.vy *= -bounce
          }

          context.globalAlpha = particle.alpha
          context.fillStyle = particle.color
          context.fillRect(particle.x, particle.y, particle.size, particle.size)
        })

        context.globalAlpha = 1
      }

      rafRef.current = window.requestAnimationFrame(render)
    }

    syncPaused()
    rafRef.current = window.requestAnimationFrame(render)

    return () => {
      cancelled = true
      disposeSimulation()
    }
  }, [active, anchorSelector, disposeSimulation, emit, headline, runId])

  useEffect(() => {
    if (!active) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exitExperience()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, exitExperience])

  const message = statusText(status, sensorMode, copy)
  const starting = status === 'requesting-permission' || busy === 'starting'
  const canTrigger = (status === 'idle' || status === 'completed' || status === 'error') && !starting

  /* A cápsula de experiência: um único controle com três estados —
     repouso (ativar) · transição (iniciando/reiniciando) · painel ativo (reiniciar/sair). */
  return (
    <div className={`x-physics ${active ? 'is-physics-on' : ''} is-${status}`} data-status={status}>
      <div ref={layerRef} className="x-physics-layer" aria-hidden={!active}>
        <canvas ref={canvasRef} className="x-particle-canvas" />
      </div>

      <div
        className={`x-capsule ${active ? 'is-live' : ''} ${starting || busy === 'resetting' ? 'is-busy' : ''}`}
        role="group"
        aria-label="Controles da experiência interativa"
      >
        {status === 'reduced-motion' ? (
          <p className="x-capsule-status" role="status">{message}</p>
        ) : !active ? (
          <button
            ref={triggerRef}
            className="x-capsule-trigger"
            type="button"
            onClick={beginExperience}
            disabled={!canTrigger}
            aria-label="Ativar experiência interativa no título"
            data-x=""
          >
            <i className="x-capsule-dot" aria-hidden="true" />
            <span>{starting ? 'Iniciando…' : copy.trigger}</span>
          </button>
        ) : (
          <>
            <p className="x-capsule-status" role="status" aria-live="polite">
              <i className="x-capsule-dot is-on" aria-hidden="true" />
              <span>{busy === 'resetting' ? 'Reiniciando…' : message}</span>
            </p>
            <div className="x-capsule-actions">
              <button
                className="x-capsule-btn"
                type="button"
                onClick={resetExperience}
                disabled={busy != null}
                aria-label="Reiniciar a experiência"
                data-x=""
              >
                Reiniciar
              </button>
              <button
                className="x-capsule-btn is-exit"
                type="button"
                onClick={exitExperience}
                disabled={starting}
                aria-label="Sair da experiência"
                data-x=""
              >
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

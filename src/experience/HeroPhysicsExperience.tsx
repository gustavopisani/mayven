import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  fragmentBudget,
  normalizeTilt,
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

type FragmentSeed = {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
}

type BodyEntry = {
  body: MatterBody
  element: HTMLSpanElement
  height: number
  width: number
}

type MatterBody = {
  angle: number
  mass?: number
  position: GravityVector
}

type MatterEngine = {
  gravity: GravityVector & { scale: number }
  world: unknown
}

type MatterRunner = {
  enabled: boolean
}

type MatterApi = {
  Bodies: {
    rectangle: (
      x: number,
      y: number,
      width: number,
      height: number,
      options?: Record<string, unknown>,
    ) => MatterBody
  }
  Body: {
    applyForce: (body: MatterBody, position: GravityVector, force: GravityVector) => void
    setAngularVelocity: (body: MatterBody, velocity: number) => void
    setPosition: (body: MatterBody, position: GravityVector) => void
    setVelocity: (body: MatterBody, velocity: GravityVector) => void
  }
  Composite: {
    add: (world: unknown, object: MatterBody | MatterBody[]) => void
    clear: (world: unknown, keepStatic: boolean) => void
    remove: (world: unknown, object: MatterBody | MatterBody[]) => void
  }
  Engine: {
    clear: (engine: MatterEngine) => void
    create: (options?: Record<string, unknown>) => MatterEngine
  }
  Runner: {
    create: () => MatterRunner
    run: (runner: MatterRunner, engine: MatterEngine) => void
    stop: (runner: MatterRunner) => void
  }
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
  activeCaption: 'The interface is now in your hands.',
  denied: 'Motion access was not allowed. Drag to move the gravity.',
  error: 'The experience could not start here. The hero is still ready.',
  exit: 'EXIT EXPERIENCE',
  fallback: 'Drag to move the gravity.',
  fallbackCaption: 'Touch or drag anywhere in the hero.',
  idle: 'The interface becomes the experience.',
  permission: 'Allow motion access to make the experience respond to your phone.',
  reducedMotion: 'Motion effects are reduced on this device.',
  reset: 'RESET',
  trigger: 'IMMERSE',
  tilt: 'TILT YOUR PHONE',
}

const ACTIVE_STATES = new Set<ExperienceState>(['active', 'denied', 'unsupported'])
const DOWN_GRAVITY: GravityVector = { x: 0, y: 1 }

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

function collectTextNodes(root: HTMLElement) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()

  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }

  return nodes
}

function addMeasuredFragment(
  fragments: FragmentSeed[],
  text: string,
  rect: DOMRect,
  layerRect: DOMRect,
) {
  if (!text.trim() || rect.width <= 0 || rect.height <= 0) return

  fragments.push({
    id: `fragment-${fragments.length}-${text}`,
    text,
    x: rect.left - layerRect.left,
    y: rect.top - layerRect.top,
    width: rect.width,
    height: rect.height,
  })
}

function measureByCharacter(nodes: Text[], layerRect: DOMRect) {
  const fragments: FragmentSeed[] = []

  nodes.forEach((node) => {
    const text = node.textContent ?? ''

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index]
      if (!char.trim()) continue

      const range = document.createRange()
      range.setStart(node, index)
      range.setEnd(node, index + 1)
      addMeasuredFragment(fragments, char, range.getBoundingClientRect(), layerRect)
      range.detach()
    }
  })

  return fragments
}

function measureByWord(nodes: Text[], layerRect: DOMRect) {
  const fragments: FragmentSeed[] = []

  nodes.forEach((node) => {
    const text = node.textContent ?? ''
    const matches = text.matchAll(/\S+/g)

    for (const match of matches) {
      if (match.index == null) continue

      const range = document.createRange()
      range.setStart(node, match.index)
      range.setEnd(node, match.index + match[0].length)
      addMeasuredFragment(fragments, match[0], range.getBoundingClientRect(), layerRect)
      range.detach()
    }
  })

  return fragments
}

function fallbackFragments(headline: string, layer: HTMLElement, maxBodies: number) {
  const rect = layer.getBoundingClientRect()
  const characters = Array.from(headline.replace(/\s+/g, ''))
  const units = characters.length <= maxBodies ? characters : headline.split(/\s+/).filter(Boolean)
  const size = Math.max(42, Math.min(rect.width * 0.13, 108))
  let x = Math.max(22, rect.width * 0.08)
  let y = rect.height * 0.42

  return units.map((text, index) => {
    const width = Math.max(size * 0.44, text.length * size * 0.44)
    const height = size * 0.92

    if (x + width > rect.width * 0.86) {
      x = Math.max(22, rect.width * 0.08)
      y += height * 0.95
    }

    const seed = {
      id: `fallback-${index}-${text}`,
      text,
      x,
      y,
      width,
      height,
    }

    x += width + size * 0.08
    return seed
  })
}

function measureHeadlineFragments(anchorSelector: string, layer: HTMLElement, headline: string, maxBodies: number) {
  const title = document.querySelector<HTMLElement>(anchorSelector)
  if (!title) return fallbackFragments(headline, layer, maxBodies)

  const layerRect = layer.getBoundingClientRect()
  const nodes = collectTextNodes(title)
  const characterCount = nodes.reduce((sum, node) => sum + Array.from(node.textContent ?? '').filter((char) => char.trim()).length, 0)
  const fragments = characterCount <= maxBodies ? measureByCharacter(nodes, layerRect) : measureByWord(nodes, layerRect)

  return fragments.length > 0 ? fragments : fallbackFragments(headline, layer, maxBodies)
}

function createWalls(Matter: MatterApi, width: number, height: number) {
  const thickness = 180
  const options = {
    friction: 0.5,
    isStatic: true,
    label: 'hero-boundary',
    restitution: 0.18,
  }

  return [
    Matter.Bodies.rectangle(width / 2, -thickness / 2, width + thickness * 2, thickness, options),
    Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, options),
    Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height + thickness * 2, options),
    Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height + thickness * 2, options),
  ]
}

async function loadMatterApi(): Promise<MatterApi> {
  const loaded = await import('matter-js')
  const maybeDefault = (loaded as { default?: unknown }).default
  const api = maybeDefault && typeof maybeDefault === 'object' && 'Engine' in maybeDefault ? maybeDefault : loaded

  return api as unknown as MatterApi
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

export default function HeroPhysicsExperience({
  anchorSelector = '#c-hero .x-hero-title',
  copy: copyOverrides,
  headline,
  onEvent,
}: HeroPhysicsExperienceProps) {
  const copy = { ...DEFAULT_COPY, ...copyOverrides }
  const [status, setStatus] = useState<ExperienceState>(() => (getReducedMotion() ? 'reduced-motion' : 'idle'))
  const [sensorMode, setSensorMode] = useState<SensorMode>('fallback')
  const [fragments, setFragments] = useState<FragmentSeed[]>([])
  const [runId, setRunId] = useState(0)
  const active = isActiveState(status)

  const layerRef = useRef<HTMLDivElement>(null)
  const fragmentRefs = useRef(new Map<string, HTMLSpanElement>())
  const matterRef = useRef<MatterApi | null>(null)
  const engineRef = useRef<MatterEngine | null>(null)
  const runnerRef = useRef<MatterRunner | null>(null)
  const wallsRef = useRef<MatterBody[]>([])
  const bodiesRef = useRef<BodyEntry[]>([])
  const rafRef = useRef<number | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const baselineRef = useRef<TiltSample | null>(null)
  const unlockOrientationRef = useRef<(() => void) | null>(null)
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

  const disposeEngine = useCallback(() => {
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    cleanupRef.current?.()
    cleanupRef.current = null

    const Matter = matterRef.current
    const runner = runnerRef.current
    const engine = engineRef.current

    if (Matter && runner) Matter.Runner.stop(runner)
    if (Matter && engine) {
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
    }

    engineRef.current = null
    runnerRef.current = null
    wallsRef.current = []
    bodiesRef.current = []
    baselineRef.current = null
    sensorSeenRef.current = false
    targetGravityRef.current = DOWN_GRAVITY
    currentGravityRef.current = DOWN_GRAVITY
  }, [])

  const teardownPhysics = useCallback((clearFragments = true) => {
    disposeEngine()
    if (clearFragments) setFragments([])
  }, [disposeEngine])

  const preparePhysicsRun = useCallback((mode: SensorMode, nextStatus: ExperienceState) => {
    const layer = layerRef.current
    if (!layer) {
      setStatus('error')
      return
    }

    const nav = navigator as Navigator & { deviceMemory?: number }
    const seeds = measureHeadlineFragments(anchorSelector, layer, headline, fragmentBudget({
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      reducedMotion: getReducedMotion(),
      width: window.innerWidth,
    }))

    if (seeds.length === 0) {
      setStatus('error')
      return
    }

    disposeEngine()
    sensorModeRef.current = mode
    setSensorMode(mode)
    setFragments(seeds)
    setStatus(nextStatus)
    setRunId((value) => value + 1)
  }, [anchorSelector, disposeEngine, headline])

  const beginExperience = useCallback(async () => {
    if (getReducedMotion()) {
      setStatus('reduced-motion')
      return
    }

    setStatus('requesting-permission')
    emit('hero_immersion_started')
    requestPortraitLock()

    const access = await requestOrientationAccess()

    if (access === 'error') {
      setStatus('error')
      return
    }

    if (access === 'granted') {
      emit('motion_permission_granted')
      preparePhysicsRun('sensor', 'active')
      return
    }

    if (access === 'denied') {
      emit('motion_permission_denied')
      emit('hero_immersion_fallback_used')
      preparePhysicsRun('fallback', 'denied')
      return
    }

    emit('hero_immersion_fallback_used')
    preparePhysicsRun('fallback', 'unsupported')
  }, [emit, preparePhysicsRun, requestPortraitLock])

  const resetExperience = useCallback(() => {
    const fallbackStatus = status === 'denied' ? 'denied' : 'unsupported'
    const nextStatus = sensorModeRef.current === 'sensor' ? 'active' : fallbackStatus

    emit('hero_immersion_reset')
    preparePhysicsRun(sensorModeRef.current, nextStatus)
  }, [emit, preparePhysicsRun, status])

  const exitExperience = useCallback(() => {
    emit('hero_immersion_exited')
    teardownPhysics(true)
    releasePortraitLock()
    sensorModeRef.current = 'fallback'
    setSensorMode('fallback')
    setStatus('completed')
  }, [emit, releasePortraitLock, teardownPhysics])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => {
      if (mq.matches) {
        if (isActiveState(status)) teardownPhysics(true)
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
    if (!active || fragments.length === 0 || runId === 0) return

    let cancelled = false

    const setup = async () => {
      const layer = layerRef.current
      if (!layer) return

      try {
        const Matter = await loadMatterApi()
        if (cancelled) return

        const rect = layer.getBoundingClientRect()
        if (rect.width < 10 || rect.height < 10) {
          setStatus('error')
          return
        }

        const lowPower = fragmentBudget({
          hardwareConcurrency: navigator.hardwareConcurrency,
          width: window.innerWidth,
        }) <= 16
        const engine = Matter.Engine.create({ enableSleeping: false })
        const runner = Matter.Runner.create()
        const walls = createWalls(Matter, rect.width, rect.height)
        const bodies: BodyEntry[] = fragments.map((fragment, index) => {
          const element = fragmentRefs.current.get(fragment.id)
          const width = Math.max(12, fragment.width)
          const height = Math.max(18, fragment.height)
          const body = Matter.Bodies.rectangle(fragment.x + width / 2, fragment.y + height / 2, width, height, {
            chamfer: { radius: Math.min(7, height * 0.12) },
            density: 0.0012,
            friction: 0.08,
            frictionAir: lowPower ? 0.028 : 0.02,
            label: `hero-fragment-${index}`,
            restitution: 0.24,
          })

          Matter.Body.setVelocity(body, {
            x: (index % 3 - 1) * 0.32,
            y: 0.35 + (index % 4) * 0.08,
          })
          Matter.Body.setAngularVelocity(body, (index % 2 === 0 ? 1 : -1) * 0.012 * (1 + (index % 4)))

          return { body, element: element!, height, width }
        }).filter((entry) => entry.element)

        engine.gravity.x = DOWN_GRAVITY.x
        engine.gravity.y = DOWN_GRAVITY.y
        engine.gravity.scale = 0.00115
        matterRef.current = Matter
        engineRef.current = engine
        runnerRef.current = runner
        wallsRef.current = walls
        bodiesRef.current = bodies
        Matter.Composite.add(engine.world, [...walls, ...bodies.map((entry) => entry.body)])
        Matter.Runner.run(runner, engine)

        const applyImpulseAt = (clientX: number, clientY: number, strength = 0.0012) => {
          const layerRect = layer.getBoundingClientRect()
          const px = clientX - layerRect.left
          const py = clientY - layerRect.top

          bodiesRef.current.forEach((entry) => {
            const dx = entry.body.position.x - px
            const dy = entry.body.position.y - py
            const distance = Math.max(28, Math.hypot(dx, dy))
            const falloff = Math.max(0, 1 - distance / Math.max(layerRect.width, layerRect.height))
            const mass = entry.body.mass ?? 1

            Matter.Body.applyForce(entry.body, entry.body.position, {
              x: (dx / distance) * strength * falloff * mass,
              y: (dy / distance) * strength * falloff * mass,
            })
          })
        }

        const rebuildWalls = () => {
          const nextRect = layer.getBoundingClientRect()
          if (nextRect.width < 10 || nextRect.height < 10 || !engineRef.current) return

          Matter.Composite.remove(engine.world, wallsRef.current)
          wallsRef.current = createWalls(Matter, nextRect.width, nextRect.height)
          Matter.Composite.add(engine.world, wallsRef.current)

          bodiesRef.current.forEach((entry) => {
            Matter.Body.setPosition(entry.body, {
              x: Math.min(Math.max(entry.body.position.x, 18), nextRect.width - 18),
              y: Math.min(Math.max(entry.body.position.y, 18), nextRect.height - 18),
            })
          })
          baselineRef.current = null
        }

        let pointerDown = false
        const steerFromPointer = (event: PointerEvent) => {
          const next = vectorFromPointer(event.clientX, event.clientY, layer.getBoundingClientRect(), 0.08)
          targetGravityRef.current = next.x === 0 && next.y === 0 ? DOWN_GRAVITY : next
        }
        const onPointerDown = (event: PointerEvent) => {
          pointerDown = true
          layer.setPointerCapture?.(event.pointerId)
          steerFromPointer(event)
          applyImpulseAt(event.clientX, event.clientY)
        }
        const onPointerMove = (event: PointerEvent) => {
          if (sensorModeRef.current === 'fallback' || event.pointerType === 'mouse' || pointerDown) {
            steerFromPointer(event)
          }
        }
        const onPointerUp = (event: PointerEvent) => {
          pointerDown = false
          layer.releasePointerCapture?.(event.pointerId)
        }

        let sensorFallbackTimer: number | null = null
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
              bodiesRef.current.forEach((entry, index) => {
                const spread = index % 2 === 0 ? 1 : -1
                Matter.Body.applyForce(entry.body, entry.body.position, {
                  x: current.x * 0.0008 + spread * 0.00018,
                  y: current.y * 0.0008,
                })
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

          cleanupRef.current = () => {
            window.removeEventListener('deviceorientation', onOrientation)
            window.removeEventListener('devicemotion', onMotion)
            if (sensorFallbackTimer != null) window.clearTimeout(sensorFallbackTimer)
          }
        } else {
          cleanupRef.current = null
        }

        const resizeObserver = new ResizeObserver(rebuildWalls)
        const onOrientationChange = () => {
          window.setTimeout(rebuildWalls, 140)
        }
        let inView = true
        const syncPaused = () => {
          if (!runnerRef.current) return

          runnerRef.current.enabled = !document.hidden && inView
        }
        const intersectionObserver = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting
          syncPaused()
        }, { threshold: 0.01 })
        const previousCleanup = cleanupRef.current

        cleanupRef.current = () => {
          previousCleanup?.()
          resizeObserver.disconnect()
          intersectionObserver.disconnect()
          document.removeEventListener('visibilitychange', syncPaused)
          window.removeEventListener('orientationchange', onOrientationChange)
          layer.removeEventListener('pointerdown', onPointerDown)
          layer.removeEventListener('pointermove', onPointerMove)
          layer.removeEventListener('pointerup', onPointerUp)
          layer.removeEventListener('pointercancel', onPointerUp)
        }

        resizeObserver.observe(layer)
        intersectionObserver.observe(layer)
        document.addEventListener('visibilitychange', syncPaused)
        window.addEventListener('orientationchange', onOrientationChange, { passive: true })
        layer.addEventListener('pointerdown', onPointerDown)
        layer.addEventListener('pointermove', onPointerMove)
        layer.addEventListener('pointerup', onPointerUp)
        layer.addEventListener('pointercancel', onPointerUp)

        const render = () => {
          const activeEngine = engineRef.current

          if (activeEngine) {
            const smoothed = smoothVector(currentGravityRef.current, targetGravityRef.current, lowPower ? 0.08 : 0.13)
            currentGravityRef.current = smoothed
            activeEngine.gravity.x = smoothed.x
            activeEngine.gravity.y = smoothed.x === 0 && smoothed.y === 0 ? 1 : smoothed.y

            bodiesRef.current.forEach((entry) => {
              const x = entry.body.position.x - entry.width / 2
              const y = entry.body.position.y - entry.height / 2

              entry.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${entry.body.angle.toFixed(4)}rad)`
            })
          }

          rafRef.current = window.requestAnimationFrame(render)
        }

        syncPaused()
        rafRef.current = window.requestAnimationFrame(render)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    setup()

    return () => {
      cancelled = true
      disposeEngine()
    }
  }, [active, disposeEngine, emit, fragments, runId])

  useEffect(() => {
    if (!active) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exitExperience()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, exitExperience])

  const message = statusText(status, sensorMode, copy)
  const canTrigger = status === 'idle' || status === 'completed' || status === 'error'
  const showControls = active

  return (
    <div className={`x-physics ${active ? 'is-physics-on' : ''} is-${status}`} data-status={status}>
      <div ref={layerRef} className="x-physics-layer" aria-hidden={!active}>
        {fragments.map((fragment, index) => {
          const style = {
            height: `${fragment.height}px`,
            transform: `translate3d(${fragment.x}px, ${fragment.y}px, 0)`,
            width: `${fragment.width}px`,
            ['--fragment-index' as string]: index,
          } as CSSProperties

          return (
            <span
              key={fragment.id}
              ref={(node) => {
                if (node) fragmentRefs.current.set(fragment.id, node)
                else fragmentRefs.current.delete(fragment.id)
              }}
              className="x-phys-fragment"
              style={style}
            >
              {fragment.text}
            </span>
          )
        })}
      </div>

      <div className="x-physics-console" aria-live="polite">
        {canTrigger && (
          <button className="x-btn x-btn-solid x-physics-trigger" type="button" onClick={beginExperience} data-x="">
            {copy.trigger}
          </button>
        )}
        {status === 'reduced-motion' && (
          <p className="x-physics-status x-mono">{message}</p>
        )}
        {status === 'requesting-permission' && (
          <p className="x-physics-status x-mono">{message}</p>
        )}
        {showControls && (
          <>
            <div className="x-physics-hint">
              <p className="x-mono">{message}</p>
              <span>{status === 'active' ? copy.activeCaption : copy.fallbackCaption}</span>
            </div>
            <div className="x-physics-actions">
              <button className="x-physics-action x-mono" type="button" onClick={resetExperience}>
                {copy.reset}
              </button>
              <button className="x-physics-action x-mono" type="button" onClick={exitExperience}>
                {copy.exit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export type ScreenMode = 'portrait' | 'portrait-upside-down' | 'landscape-left' | 'landscape-right'

export type GravityVector = {
  x: number
  y: number
}

export type TiltSample = {
  beta?: number | null
  gamma?: number | null
}

export type TiltOptions = {
  baseline?: TiltSample
  baseY?: number
  deadZone?: number
  forwardInfluence?: number
  maxBeta?: number
  maxGamma?: number
  sensitivity?: number
}

export type MotionAccess = 'granted' | 'denied' | 'unsupported' | 'error'

export type QualityTier = 'high' | 'medium' | 'low'

export type DeviceHints = {
  devicePixelRatio?: number
  deviceMemory?: number
  hardwareConcurrency?: number
  reducedMotion?: boolean
  viewportFps?: number
  width?: number
}

const DEFAULT_BASE_Y = 1
const DEFAULT_DEAD_ZONE = 0.055
const DEFAULT_FORWARD_INFLUENCE = 0.65
const DEFAULT_MAX_BETA = 42
const DEFAULT_MAX_GAMMA = 34
const DEFAULT_SENSITIVITY = 1

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function safeNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function applyDeadZone(value: number, zone = DEFAULT_DEAD_ZONE) {
  const normalizedZone = clamp(Math.abs(zone), 0, 0.95)
  const magnitude = Math.abs(value)

  if (magnitude <= normalizedZone) return 0

  const scaled = (magnitude - normalizedZone) / (1 - normalizedZone)
  return Math.sign(value) * clamp(scaled, 0, 1)
}

export function screenModeFromAngle(angle: number | null | undefined): ScreenMode {
  const normalized = (((safeNumber(angle, 0) % 360) + 360) % 360)

  if (normalized >= 45 && normalized < 135) return 'landscape-left'
  if (normalized >= 135 && normalized < 225) return 'portrait-upside-down'
  if (normalized >= 225 && normalized < 315) return 'landscape-right'

  return 'portrait'
}

export function normalizeTilt(sample: TiltSample, mode: ScreenMode = 'portrait', options: TiltOptions = {}): GravityVector {
  const maxBeta = Math.max(1, options.maxBeta ?? DEFAULT_MAX_BETA)
  const maxGamma = Math.max(1, options.maxGamma ?? DEFAULT_MAX_GAMMA)
  const deadZone = options.deadZone ?? DEFAULT_DEAD_ZONE
  const sensitivity = options.sensitivity ?? DEFAULT_SENSITIVITY
  const baseY = options.baseY ?? DEFAULT_BASE_Y
  const forwardInfluence = options.forwardInfluence ?? DEFAULT_FORWARD_INFLUENCE

  const beta = safeNumber(sample.beta) - safeNumber(options.baseline?.beta)
  const gamma = safeNumber(sample.gamma) - safeNumber(options.baseline?.gamma)

  const lateral = applyDeadZone(clamp(gamma / maxGamma, -1, 1), deadZone) * sensitivity
  const forward = applyDeadZone(clamp(beta / maxBeta, -1, 1), deadZone) * sensitivity

  switch (mode) {
    case 'portrait-upside-down':
      return {
        x: clamp(-lateral, -1, 1),
        y: clamp(baseY - forward * forwardInfluence, -1, 1),
      }
    case 'landscape-left':
      return {
        x: clamp(forward, -1, 1),
        y: clamp(baseY - lateral * forwardInfluence, -1, 1),
      }
    case 'landscape-right':
      return {
        x: clamp(-forward, -1, 1),
        y: clamp(baseY + lateral * forwardInfluence, -1, 1),
      }
    case 'portrait':
    default:
      return {
        x: clamp(lateral, -1, 1),
        y: clamp(baseY + forward * forwardInfluence, -1, 1),
      }
  }
}

export function smoothVector(previous: GravityVector, next: GravityVector, alpha = 0.14): GravityVector {
  const t = clamp(alpha, 0, 1)

  return {
    x: previous.x + (next.x - previous.x) * t,
    y: previous.y + (next.y - previous.y) * t,
  }
}

export function vectorFromPointer(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  deadZone = 0.08,
): GravityVector {
  const halfWidth = Math.max(1, rect.width / 2)
  const halfHeight = Math.max(1, rect.height / 2)
  const x = clamp((clientX - rect.left - halfWidth) / halfWidth, -1, 1)
  const y = clamp((clientY - rect.top - halfHeight) / halfHeight, -1, 1)

  return {
    x: applyDeadZone(x, deadZone),
    y: applyDeadZone(y, deadZone),
  }
}

export function resolveMotionAccess(hasOrientationApi: boolean, permission?: PermissionState | 'error' | null): MotionAccess {
  if (!hasOrientationApi) return 'unsupported'
  if (permission === 'error') return 'error'
  if (permission === 'denied') return 'denied'

  return 'granted'
}

export function mobileQualityTier(hints: DeviceHints = {}): QualityTier {
  if (hints.reducedMotion) return 'low'

  const memory = hints.deviceMemory
  const cores = hints.hardwareConcurrency
  const dpr = hints.devicePixelRatio ?? 1
  const width = hints.width ?? 1024
  const fps = hints.viewportFps
  let score = 0

  score += memory == null ? 2 : memory >= 6 ? 2 : memory >= 4 ? 1 : -1
  score += cores == null ? 2 : cores >= 8 ? 2 : cores >= 4 ? 1 : -1

  if (width >= 860) score += 1
  if (width < 390) score -= 1
  if (dpr >= 3 && width < 860) score -= 1

  if (typeof fps === 'number') {
    if (fps < 45) score -= 2
    else if (fps < 55) score -= 1
    else if (fps >= 58) score += 1
  }

  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'

  return 'low'
}

export function particleBudget(hints: DeviceHints = {}) {
  if (hints.reducedMotion) return 0

  const tier = mobileQualityTier(hints)
  const width = hints.width ?? 1024
  const compact = width < 430
  const mobile = width < 860
  let budget = 1100

  if (tier === 'high') budget = mobile ? (compact ? 1400 : 1700) : 2400
  if (tier === 'medium') budget = mobile ? (compact ? 1080 : 1300) : 1800
  if (tier === 'low') budget = mobile ? (compact ? 720 : 840) : 1100

  if (mobile && (hints.devicePixelRatio ?? 1) >= 3) budget -= 120

  return Math.round(clamp(budget, 720, 2600))
}

export const fragmentBudget = particleBudget

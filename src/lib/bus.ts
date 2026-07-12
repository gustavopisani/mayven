/** Shared mutable input bus — written by DOM components, read per-frame by the WebGL scenes.
 * Lives outside the three/ modules so importing it never pulls Three.js into the main bundle. */
export type MayvenInput = {
  mx: number // mouse x, -1..1
  my: number // mouse y, -1..1
  heroP: number // hero scroll progress 0..1
  techP: number // tech journey progress 0..1
  vel: number // lenis scroll velocity
  cta: number // 1 while a hero CTA is hovered
}

export function input(): MayvenInput {
  const w = window as unknown as { __mayven?: MayvenInput }
  if (!w.__mayven) w.__mayven = { mx: 0, my: 0, heroP: 0, techP: 0, vel: 0, cta: 0 }
  return w.__mayven
}

/** Device quality tier — decides DPR caps and particle budgets for the scenes.
 *  low: no WebGL at all (mobile/reduced/software GPU — handled by callers). */
export type QualityTier = 'high' | 'med' | 'low'

let tier: QualityTier | null = null
export function quality(): QualityTier {
  if (tier) return tier
  const w = window.innerWidth
  const dpr = window.devicePixelRatio || 1
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8
  if (w <= 860 || matchMedia('(prefers-reduced-motion: reduce)').matches) tier = 'low'
  else if (w < 1200 || dpr > 2.2 || mem <= 4) tier = 'med'
  else tier = 'high'
  return tier
}

export const DPR_CAP: Record<QualityTier, number> = { high: 1.75, med: 1.4, low: 1 }
export const PARTICLE_BUDGET: Record<QualityTier, number> = { high: 700, med: 420, low: 0 }

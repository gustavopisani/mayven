/* Experience store — mutable singleton shared between the DOM journey and the WebGL world.
   No React state in the hot path: the render loop reads, scroll/pointer writes. */

export type XQuality = 'high' | 'med' | 'off'

export const xstore = {
  p: 0, // master journey progress 0..1 (whole page scroll)
  mx: 0, // pointer -1..1
  my: 0,
  vel: 0, // lenis velocity
  ready: false, // loader finished
  light: 0, // theme target: 0 dark · 1 bone (world lerps toward it)
  quality: 'high' as XQuality,
}

export function detectQuality(): XQuality {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return 'off'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '')
    if (/swiftshader|llvmpipe|software/i.test(renderer)) return 'off'
  } catch {
    return 'off'
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off'
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8
  if (window.innerWidth <= 860 || mem <= 4) return 'med'
  return 'high'
}

/* chapter map — fractions of the master journey (world stations + DOM sync) */
export const CH = {
  hero: [0.0, 0.07],
  manifesto: [0.07, 0.18], // ← the world flips to bone here
  invisible: [0.18, 0.32],
  build: [0.32, 0.5],
  immersive: [0.5, 0.62], // IoT · XR · Vision Pro · gamification · totens · eventos
  method: [0.62, 0.74],
  signals: [0.74, 0.84], // ← second bone flip
  operation: [0.84, 0.91],
  cta: [0.91, 1.0],
} as const

export const DEPTH = 240 // world length in units — camera travels 0 → -DEPTH
export const zAt = (f: number) => -f * DEPTH

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

/* chapter map — fractions of the master journey (world stations + DOM sync).
   Narrativa: presença → experiências → 3 manifestações → método → cases → contato. */
export const CH = {
  hero: [0.0, 0.08],
  presenca: [0.08, 0.24], // ← o mundo vira bone aqui (composição, ordem, editorial)
  experiencias: [0.24, 0.4], // volta ao escuro (resposta, reação, movimento)
  tipos: [0.4, 0.58], // 3 manifestações de experiência
  metodo: [0.58, 0.72], // Entender → Imaginar → Construir → Ativar
  cases: [0.72, 0.87], // ← segunda zona bone (editorial)
  contato: [0.87, 1.0],
} as const

export const DEPTH = 240 // world length in units — camera travels 0 → -DEPTH
export const zAt = (f: number) => -f * DEPTH

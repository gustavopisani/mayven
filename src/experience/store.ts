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
   Narrativa: manifesto → presença → experiências (capítulo editorial DOM) →
   3 manifestações → método → cases (capítulo editorial DOM) → finale.
   Alturas: 130 + 400 + 220 + 460 + 300 + 280 + 420 + ~280 = ~2490vh (scroll útil ~2390vh).
   O finale usa min-height (conteúdo dinâmico) — pequenas variações são absorvidas
   pela histerese do tema e pelo feather do mundo. */
export const CH = {
  hero: [0.0, 0.054],
  manifesto: [0.044, 0.222], // ← única zona bone; início adiantado p/ o tema clarear junto com a folha que cobre o hero
  presenca: [0.222, 0.314], // a zona bone segue direto do manifesto até aqui
  experiencias: [0.314, 0.506], // capítulo editorial: superfície preta opaca cobre o mundo (quebra da linguagem 3D)
  tipos: [0.506, 0.632], // 3 manifestações de experiência (cartões DOM)
  metodo: [0.632, 0.749], // Entender → Imaginar → Construir → Ativar
  cases: [0.749, 0.925], // capítulo editorial escuro opaco (CasesSection)
  contato: [0.925, 1.0], // finale DOM opaco (ContactFinale) — canvas mudo
} as const

export const DEPTH = 240 // world length in units — camera travels 0 → -DEPTH
export const zAt = (f: number) => -f * DEPTH

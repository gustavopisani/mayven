import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { NOISE_GLSL, input } from './mayven3d'

/* =====================================================================
   THE INVISIBLE WORK — VISUAL PROCESSOR
   One hidden video source, seven real-time treatments. The video is
   never shown raw: every mode is a different shader interpretation.
   ===================================================================== */

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVideo;
uniform float uTime;
uniform float uModeA;
uniform float uModeB;
uniform float uMix;
uniform float uClean;   // performance-mode resolve, retweened on entry
uniform vec2  uMouse;   // stage uv
uniform vec2  uMVel;    // smoothed mouse velocity
uniform float uVel;     // lenis scroll velocity
uniform vec2  uCoverS;  // cover-fit scale
uniform vec2  uCoverO;  // cover-fit offset
uniform float uAspect;  // stage aspect (w/h)

${NOISE_GLSL}

const vec3 PINK = vec3(0.925, 0.043, 0.341);
const vec3 LIME = vec3(0.843, 1.0, 0.247);
const vec3 BLUE = vec3(0.176, 0.424, 1.0);

vec3 tex(vec2 uv) {
  return texture2D(uVideo, clamp(uv, 0.001, 0.999) * uCoverS + uCoverO).rgb;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
/* thin grid lines, 1 = on line */
float gridL(vec2 uv, float n) {
  vec2 f = abs(fract(uv * n) - 0.5);
  return smoothstep(0.47, 0.5, max(f.x, f.y));
}
/* aspect-corrected distance to mouse */
float mdist(vec2 uv) {
  return distance(uv * vec2(uAspect, 1.0), uMouse * vec2(uAspect, 1.0));
}
float edges(vec2 uv) {
  vec2 e = vec2(0.0035, 0.0035 * uAspect);
  float l0 = luma(tex(uv));
  float dx = luma(tex(uv + vec2(e.x, 0.0))) - l0;
  float dy = luma(tex(uv + vec2(0.0, e.y))) - l0;
  return clamp(length(vec2(dx, dy)) * 9.0, 0.0, 1.0);
}

/* 01 STRATEGY — signal map: desaturated field, market noise organizing into direction */
vec3 fxStrategy(vec2 uv) {
  vec3 c = tex(uv);
  vec3 col = mix(vec3(luma(c)), c, 0.22) * 0.8;
  float d = uv.x + uv.y;
  float streak = smoothstep(0.93, 1.0, mvnNoise(vec3(d * 26.0 - uTime * 1.4, (uv.x - uv.y) * 52.0, 2.0)));
  col += PINK * streak * 0.55;
  float noiseDot = step(0.992, hash2(floor(uv * 90.0) + floor(uTime * 2.0)));
  col += vec3(0.7) * noiseDot * 0.5;
  float g = gridL(uv, 11.0);
  col += vec3(0.10) * g;
  col += LIME * g * exp(-mdist(uv) * 3.2) * 0.75; /* cursor reveals hidden paths */
  return col;
}

/* 02 INTERFACE — interactive pixelation: chunky far, sharp near cursor, ripple */
vec3 fxInterface(vec2 uv) {
  float dm = mdist(uv);
  float px = mix(88.0, 15.0, smoothstep(0.42, 0.04, dm));
  px *= 1.0 + 0.16 * sin(dm * 44.0 - uTime * 5.0) * exp(-dm * 2.4);
  vec2 cell = floor(uv * vec2(px * uAspect, px));
  vec2 q = (cell + 0.5) / vec2(px * uAspect, px);
  vec3 c = tex(q);
  float r = hash2(cell);
  if (r > 0.988) c = mix(c, PINK, 0.75);
  else if (r < 0.006) c = mix(c, LIME, 0.6);
  vec2 f = fract(uv * vec2(px * uAspect, px));
  float seam = smoothstep(0.9, 1.0, max(f.x, f.y));
  c *= 1.0 - seam * 0.35;
  c += vec3(0.06) * gridL(uv, 6.0); /* interface macro-grid */
  return c;
}

/* 03 MOTION — time echo: velocity-driven temporal trails + rgb split */
vec3 fxMotion(vec2 uv) {
  vec2 off = uMVel * 0.16 + vec2(0.0, clamp(uVel * 0.00035, -0.06, 0.06));
  off += vec2(0.010, 0.0);
  vec3 acc = vec3(0.0);
  float w = 0.0;
  for (int i = 0; i < 7; i++) {
    float k = float(i) / 6.0;
    float wk = 1.0 - k * 0.8;
    acc += tex(uv - off * k * 2.4) * wk;
    w += wk;
  }
  vec3 c = acc / w;
  c.r = tex(uv - off * 1.6).r;
  c.b = tex(uv + off * 0.9).b;
  float lines = smoothstep(0.985, 1.0, sin(uv.y * 220.0 + uTime * 3.0) * 0.5 + 0.5) * clamp(length(off) * 9.0, 0.0, 1.0);
  c += vec3(0.8) * lines * 0.35;
  return c;
}

/* 04 ENGINEERING — x-ray scanner: structure revealed around cursor */
vec3 fxEngineering(vec2 uv) {
  vec3 c = tex(uv) * 0.5;
  float e = edges(uv);
  vec3 xray = vec3(0.015, 0.02, 0.035) + BLUE * e * 1.5 + vec3(0.85) * e * 0.25;
  float scan = smoothstep(0.34, 0.05, mdist(uv));
  vec3 col = mix(c, xray, scan);
  col += BLUE * gridL(uv, 16.0) * 0.14;
  float ring = abs(mdist(uv) - 0.30);
  col += LIME * smoothstep(0.006, 0.0, ring) * 0.9; /* scanner ring */
  /* z-slice: three bands shifted slightly */
  float band = floor(uv.y * 3.0);
  col += PINK * step(0.995, fract(uv.y * 3.0)) * 0.4;
  return col;
}

/* 05 MEDIA — content multiplication: one signal, many surfaces */
vec3 fxMedia(vec2 uv) {
  vec2 tiles = vec2(6.0, 4.0);
  vec2 cell = floor(uv * tiles);
  vec2 f = fract(uv * tiles);
  float r = hash2(cell);
  vec2 crop = vec2(hash2(cell + 1.31), hash2(cell + 2.77)) * 0.55;
  vec2 cc = (cell + 0.5) / tiles;
  vec2 away = (cc - uMouse) * vec2(uAspect, 1.0);
  float prox = exp(-length(away) * 3.6);
  vec2 srcUv = crop + f * 0.42 + normalize(away + 0.0001) * prox * 0.10; /* hover burst */
  vec3 c = tex(srcUv);
  if (r > 0.90) c = mix(c, PINK, 0.55);
  if (r < 0.05) c = vec3(0.92, 0.90, 0.86) * (0.4 + 0.6 * luma(c)); /* editorial card */
  float gap = smoothstep(0.0, 0.035, f.x) * smoothstep(1.0, 0.965, f.x)
            * smoothstep(0.0, 0.05, f.y) * smoothstep(1.0, 0.95, f.y);
  c *= mix(0.06, 1.0, gap);
  /* slight per-cell float */
  c *= 0.9 + 0.1 * sin(uTime * 1.2 + r * 6.28);
  return c;
}

/* 06 INTELLIGENCE — learning loop: fluid read, sweep, pulses feeding back */
vec3 fxIntelligence(vec2 uv) {
  vec2 warp = uv + 0.035 * vec2(
    mvnNoise(vec3(uv * 3.2, uTime * 0.16)) - 0.5,
    mvnNoise(vec3(uv * 3.2 + 7.0, uTime * 0.13)) - 0.5);
  vec3 c = tex(warp);
  c = floor(c * 7.0) / 7.0; /* analytical posterize */
  float sweep = exp(-abs(uv.y - fract(uTime * 0.11)) * 46.0);
  c += LIME * sweep * 0.22;
  /* the loop: faint ellipse + pulses traveling back to the start */
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
  float ell = abs(length(p / vec2(0.62, 0.36)) - 1.0);
  c += PINK * smoothstep(0.02, 0.0, ell) * 0.3;
  for (int i = 0; i < 2; i++) {
    float tp = fract(uTime * 0.16 + float(i) * 0.5) * 6.28318;
    vec2 pp = vec2(cos(tp) * 0.62, sin(tp) * 0.36);
    c += (i == 0 ? PINK : BLUE) * exp(-length(p - pp) * 26.0) * 1.3;
  }
  return c;
}

/* 07 PERFORMANCE — compression: chaos resolves into a clean, sharp frame */
vec3 fxPerformance(vec2 uv) {
  float rough = 1.0 - uClean;
  vec2 jit = (vec2(mvnNoise(vec3(uv * 22.0, uTime * 3.0)),
                   mvnNoise(vec3(uv * 22.0 + 5.0, uTime * 2.4))) - 0.5) * 0.12 * rough;
  vec3 c = tex(uv + jit);
  float drop = step(hash2(floor(uv * vec2(26.0 * uAspect, 26.0))), rough * 0.45);
  c *= 1.0 - drop * 0.85; /* unoptimized fragments vanish */
  vec3 blur = (tex(uv + vec2(0.004, 0.0)) + tex(uv - vec2(0.004, 0.0))) * 0.5;
  c = mix(c, c + (c - blur) * 1.5, uClean); /* resolves sharp */
  c *= mix(0.7, 1.06, uClean);
  float ring = abs(mdist(vec2(0.5)) * 0.0 + distance(uv * vec2(uAspect, 1.0), vec2(0.5 * uAspect, 0.5)) - uClean * 0.9);
  c += PINK * smoothstep(0.02, 0.0, ring) * (1.0 - uClean) * 1.4; /* final signal pulse */
  return c;
}

vec3 applyFx(float m, vec2 uv) {
  int i = int(m + 0.5);
  if (i == 0) return fxStrategy(uv);
  if (i == 1) return fxInterface(uv);
  if (i == 2) return fxMotion(uv);
  if (i == 3) return fxEngineering(uv);
  if (i == 4) return fxMedia(uv);
  if (i == 5) return fxIntelligence(uv);
  return fxPerformance(uv);
}

void main() {
  vec2 uv = vUv;
  vec3 a = applyFx(uModeA, uv);
  vec3 b = applyFx(uModeB, uv);
  /* data-mosh flavored transition: displaced slices during the blend */
  float t = uMix;
  float mosh = sin(t * 3.14159);
  float slice = hash2(vec2(floor(uv.y * 22.0), floor(uTime * 8.0)));
  vec2 muv = uv + vec2((slice - 0.5) * 0.10 * mosh, 0.0);
  vec3 moshC = applyFx(t < 0.5 ? uModeA : uModeB, muv);
  vec3 col = mix(mix(a, b, smoothstep(0.15, 0.85, t)), moshC, mosh * 0.55);
  /* stage vignette + grain */
  vec2 vg = uv - 0.5;
  col *= 1.0 - dot(vg, vg) * 0.55;
  col += (hash2(uv * 900.0 + uTime) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

function Screen({ mode, playing }: { mode: number; playing: boolean }) {
  const { size, gl } = useThree()
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const state = useRef({ lastMode: mode, mouse: new THREE.Vector2(0.5, 0.5), mvel: new THREE.Vector2(), lastP: new THREE.Vector2(0.5, 0.5) })

  const video = useMemo(() => {
    const v = document.createElement('video')
    v.src = '/assets/videos/mayven-signal-source.mp4'
    v.muted = true
    v.loop = true
    v.playsInline = true
    v.preload = 'auto'
    v.crossOrigin = 'anonymous'
    return v
  }, [])

  const uniforms = useMemo(
    () => ({
      uVideo: { value: new THREE.VideoTexture(video) },
      uTime: { value: 0 },
      uModeA: { value: mode },
      uModeB: { value: mode },
      uMix: { value: 0 },
      uClean: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMVel: { value: new THREE.Vector2() },
      uVel: { value: 0 },
      uCoverS: { value: new THREE.Vector2(1, 1) },
      uCoverO: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 16 / 9 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /* play/pause with section visibility */
  useEffect(() => {
    if (playing) video.play().catch(() => {})
    else video.pause()
  }, [playing, video])

  useEffect(
    () => () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
      uniforms.uVideo.value.dispose()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /* cover-fit mapping: stage aspect vs 16:9 source */
  useEffect(() => {
    const stage = size.width / size.height
    const src = 16 / 9
    if (stage > src) {
      uniforms.uCoverS.value.set(1, src / stage)
      uniforms.uCoverO.value.set(0, (1 - src / stage) / 2)
    } else {
      uniforms.uCoverS.value.set(stage / src, 1)
      uniforms.uCoverO.value.set((1 - stage / src) / 2, 0)
    }
    uniforms.uAspect.value = stage
  }, [size, uniforms])

  /* crossfade on mode change + retrigger the performance resolve */
  useEffect(() => {
    const s = state.current
    if (mode === s.lastMode) return
    uniforms.uModeA.value = s.lastMode
    uniforms.uModeB.value = mode
    gsap.killTweensOf(uniforms.uMix)
    uniforms.uMix.value = 0
    gsap.to(uniforms.uMix, {
      value: 1,
      duration: 0.65,
      ease: 'power2.inOut',
      onComplete: () => {
        uniforms.uModeA.value = mode
        uniforms.uMix.value = 0
      },
    })
    if (mode === 6) {
      uniforms.uClean.value = 0
      gsap.to(uniforms.uClean, { value: 1, duration: 2.2, ease: 'power2.inOut', delay: 0.3 })
    }
    s.lastMode = mode
  }, [mode, uniforms])

  /* pointer tracked on the canvas element — stage-relative */
  useEffect(() => {
    const el = gl.domElement
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      state.current.mouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height)
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => el.removeEventListener('pointermove', move)
  }, [gl])

  useFrame((st, dt) => {
    const s = state.current
    uniforms.uTime.value = st.clock.elapsedTime
    uniforms.uMouse.value.lerp(s.mouse, 0.09)
    const inst = s.mouse.clone().sub(s.lastP).multiplyScalar(1 / Math.max(dt, 0.008))
    s.mvel.lerp(inst.multiplyScalar(0.06), 0.08)
    uniforms.uMVel.value.copy(s.mvel)
    s.lastP.copy(s.mouse)
    uniforms.uVel.value = input().vel
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
    </mesh>
  )
}

export default function InvisibleProcessor({
  mode,
  active,
  dprCap = 1.5,
}: {
  mode: number
  active: boolean
  dprCap?: number
}) {
  return (
    <Canvas
      className="iw-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, Math.min(dprCap, 1.5)]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 1] }}
    >
      <Screen mode={mode} playing={active} />
    </Canvas>
  )
}

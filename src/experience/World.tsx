import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CH, DEPTH, xstore, zAt } from './store'

/* =====================================================================
   THE WORLD — one persistent fixed canvas. Modern, not sci-fi:
   flat sheets, pixel walls, slabs, frames — interface matter in space,
   reacting to the cursor. The scroll is a camera traveling 8 stations.
   ===================================================================== */

const lerp = THREE.MathUtils.lerp
const DARK_BG = new THREE.Color('#050506')
const BONE_BG = new THREE.Color('#f4f1ea')
const CHARCOAL = '#131419'
const CHARCOAL2 = '#1d1f26'
const BONE = '#f4f1ea'
const MAGENTA = '#ec0b57'
const LIME = '#d7ff3f'

/* light amount for a given progress — the two bone zones, with a WIDE feather:
   the background crossfades over ~a full viewport of scroll instead of snapping */
function lightAt(p: number) {
  const zone = (a: number, b: number) => {
    const f = 0.05
    return Math.min(
      THREE.MathUtils.smoothstep(p, a - f * 0.3, a + f),
      1 - THREE.MathUtils.smoothstep(p, b - f, b + f * 0.3),
    )
  }
  return Math.max(zone(CH.manifesto[0], CH.manifesto[1]), zone(CH.signals[0], CH.signals[1]))
}

/* ---------- HERO + CTA: the sheet stack — layered interface matter ---------- */
const SHEET_COLORS = [CHARCOAL, CHARCOAL2, MAGENTA, CHARCOAL, BONE, CHARCOAL2, CHARCOAL]
function SheetStack({ z, spreadRange, scale = 1 }: { z: number; spreadRange: [number, number]; scale?: number }) {
  const group = useRef<THREE.Group>(null!)
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const g = group.current
    // the whole stack leans into the cursor
    g.rotation.x = lerp(g.rotation.x, xstore.my * 0.28, 0.06)
    g.rotation.y = lerp(g.rotation.y, xstore.mx * 0.5, 0.06)
    // scroll fans the sheets apart
    const local = THREE.MathUtils.clamp((xstore.p - spreadRange[0]) / (spreadRange[1] - spreadRange[0]), 0, 1)
    g.children.forEach((c, i) => {
      const k = i - (SHEET_COLORS.length - 1) / 2
      c.position.z = k * (0.34 + local * 1.5)
      // each sheet slides against the cursor with its own depth factor — parallax fan
      c.position.x = lerp(c.position.x, -xstore.mx * k * 0.34, 0.08)
      c.position.y = lerp(c.position.y, xstore.my * k * 0.22 + Math.sin(t * 0.6 + i) * 0.05, 0.08)
      c.rotation.z = Math.sin(t * 0.3 + i * 0.8) * 0.015 + local * k * 0.03
    })
  })
  return (
    <group ref={group} position={[0, 0, z]} scale={scale}>
      {SHEET_COLORS.map((c, i) => (
        <mesh key={i}>
          <boxGeometry args={[5.4, 3.3, 0.05]} />
          <meshStandardMaterial color={c} roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- INVISIBLE WORK: the pixel wall — a live surface that ripples under the cursor ---------- */
function PixelWall({ cols, rows }: { cols: number; rows: number }) {
  const inst = useRef<THREE.InstancedMesh>(null!)
  // early in the chapter and BIG — it fills the view within the first scrolls
  const z = zAt(CH.invisible[0] + (CH.invisible[1] - CH.invisible[0]) * 0.42)
  const W = 27
  const H = 15.5
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colors = useMemo(() => {
    const arr = new Float32Array(cols * rows * 3)
    const c = new THREE.Color()
    for (let i = 0; i < cols * rows; i++) {
      const r = Math.random()
      c.set(r > 0.955 ? MAGENTA : r > 0.92 ? BONE : r > 0.5 ? CHARCOAL2 : '#22242c')
      arr[i * 3] = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [cols, rows])

  useEffect(() => {
    inst.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
  }, [colors])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const cam = st.camera
    // project the pointer onto the wall plane (approximation by camera frustum at wall depth)
    const dist = Math.abs(cam.position.z - z)
    const halfH = Math.tan(((cam as THREE.PerspectiveCamera).fov * Math.PI) / 360) * dist
    const halfW = halfH * (st.size.width / st.size.height)
    const px = cam.position.x + xstore.mx * halfW
    const py = cam.position.y - xstore.my * halfH
    let k = 0
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const x = (ix / (cols - 1) - 0.5) * W
        const y = (iy / (rows - 1) - 0.5) * H
        const dCur = Math.hypot(x - px, y - py)
        const ripple = Math.exp(-dCur * 0.55) * (1.1 + Math.sin(dCur * 3.2 - t * 4.5) * 0.35)
        const wave = Math.sin(x * 0.5 + t * 1.1) * Math.cos(y * 0.6 + t * 0.9) * 0.1
        dummy.position.set(x, y, z + wave + ripple * 0.9)
        const s = 1 + ripple * 0.9
        dummy.scale.set(s, s, 1)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        inst.current.setMatrixAt(k++, dummy.matrix)
      }
    }
    inst.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={inst} args={[undefined, undefined, cols * rows]}>
      <boxGeometry args={[0.3, 0.3, 0.06]} />
      <meshStandardMaterial roughness={0.8} metalness={0.05} />
    </instancedMesh>
  )
}

/* ---------- WHAT WE BUILD: one monolith screen that FLIPS per system ----------
   A single object transforming with the content — not furniture floating around. */
const BAR_COLORS = [MAGENTA, '#2d6cff', LIME, MAGENTA, BONE, '#2d6cff']
function BuildMonolith() {
  const group = useRef<THREE.Group>(null!)
  const barF = useRef<THREE.Mesh>(null!)
  const barB = useRef<THREE.Mesh>(null!)
  const rot = useRef(0)
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const local = (xstore.p - CH.build[0]) / (CH.build[1] - CH.build[0])
    const g = group.current
    g.visible = local > -0.12 && local < 1.12
    if (!g.visible) return
    const idx = THREE.MathUtils.clamp(Math.floor(local * 6), 0, 5)
    // it rides ahead of the camera through the whole chapter…
    g.position.z = st.camera.position.z - 9
    g.position.x = 2.6 + Math.sin(t * 0.4) * 0.08
    g.position.y = Math.sin(t * 0.7) * 0.1
    // …and flips half a turn every time the system changes
    rot.current = lerp(rot.current, idx * Math.PI, 0.08)
    g.rotation.y = rot.current + xstore.mx * 0.14
    g.rotation.x = -xstore.my * 0.1
    const c = new THREE.Color(BAR_COLORS[idx])
    ;(barF.current.material as THREE.MeshBasicMaterial).color.lerp(c, 0.1)
    ;(barB.current.material as THREE.MeshBasicMaterial).color.lerp(c, 0.1)
  })
  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[5.4, 3.4, 0.2]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} metalness={0.12} />
      </mesh>
      <mesh ref={barF} position={[-2.45, 0, 0.13]}>
        <boxGeometry args={[0.16, 3.4, 0.05]} />
        <meshBasicMaterial color={MAGENTA} />
      </mesh>
      <mesh ref={barB} position={[2.45, 0, -0.13]}>
        <boxGeometry args={[0.16, 3.4, 0.05]} />
        <meshBasicMaterial color={MAGENTA} />
      </mesh>
    </group>
  )
}

/* ---------- IMMERSIVE & PHYSICAL: the gate you fly through + device slabs ---------- */
function ImmersiveGate() {
  const group = useRef<THREE.Group>(null!)
  const devices = useRef<THREE.Group>(null!)
  const z = zAt((CH.immersive[0] + CH.immersive[1]) / 2)
  const DEVICES = useMemo(() => {
    const v3 = (x: number, y: number, z: number): [number, number, number] => [x, y, z]
    return [
      { s: v3(1.05, 2.5, 0.1), p: v3(-3.6, -0.4, -5), c: CHARCOAL }, // totem
      { s: v3(0.75, 1.5, 0.08), p: v3(3.2, 0.8, -3.4), c: CHARCOAL2 }, // phone
      { s: v3(1.8, 1.2, 0.08), p: v3(4.1, -1.1, -7), c: CHARCOAL }, // tablet
      { s: v3(0.55, 0.55, 0.08), p: v3(-2.9, 1.5, -2.6), c: MAGENTA }, // wearable
      { s: v3(2.6, 1.5, 0.09), p: v3(0.4, 2, -8.5), c: CHARCOAL2 }, // wall screen
    ]
  }, [])
  useFrame((st) => {
    const t = st.clock.elapsedTime
    // the gate breathes and leans with the cursor — you fly through the "lens"
    group.current.rotation.z = Math.sin(t * 0.2) * 0.03 + xstore.mx * 0.05
    group.current.rotation.y = xstore.mx * 0.12
    group.current.rotation.x = -xstore.my * 0.1
    devices.current.children.forEach((c, i) => {
      const d = DEVICES[i]
      c.position.x = lerp(c.position.x, d.p[0] + xstore.mx * (2.2 + i * 0.5) * 0.4, 0.05)
      c.position.y = lerp(c.position.y, d.p[1] - xstore.my * (1.6 + i * 0.4) * 0.4 + Math.sin(t * 0.5 + i * 2) * 0.12, 0.05)
      c.rotation.y = Math.sin(t * 0.3 + i) * 0.08 + xstore.mx * 0.15
    })
  })
  const frame = 0.16
  return (
    <group position={[0, 0, z]}>
      <group ref={group}>
        {/* the AR viewport frame */}
        {(
          [
            [0, 2.3, 7.4, frame],
            [0, -2.3, 7.4, frame],
            [-3.7, 0, frame, 4.76],
            [3.7, 0, frame, 4.76],
          ] as [number, number, number, number][]
        ).map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[w, h, 0.16]} />
            <meshStandardMaterial color={BONE} roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[3.7, 2.3, 0.02]}>
          <boxGeometry args={[0.9, frame, 0.18]} />
          <meshBasicMaterial color={MAGENTA} />
        </mesh>
      </group>
      {/* the physical world behind the lens */}
      <group ref={devices}>
        {DEVICES.map((d, i) => (
          <mesh key={i} position={d.p} scale={1}>
            <boxGeometry args={d.s} />
            <meshStandardMaterial color={d.c} roughness={0.7} metalness={0.12} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ---------- METHOD: a flat progress ring — the cycle, not a planet orbit ---------- */
function MethodRing() {
  const group = useRef<THREE.Group>(null!)
  const arc = useRef<THREE.Mesh>(null!)
  const z = zAt((CH.method[0] + CH.method[1]) / 2)
  useFrame(() => {
    const local = THREE.MathUtils.clamp((xstore.p - CH.method[0]) / (CH.method[1] - CH.method[0]), 0, 1)
    group.current.rotation.z = -local * Math.PI * 2 // one full revolution across the chapter
    arc.current.rotation.z = local * Math.PI * 0.5
    group.current.rotation.y = xstore.mx * 0.1
    group.current.rotation.x = -xstore.my * 0.08
  })
  return (
    <group ref={group} position={[0, 0, z]}>
      <mesh>
        <ringGeometry args={[7.7, 7.94, 96]} />
        <meshBasicMaterial color="#2c2e36" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={arc}>
        <ringGeometry args={[7.62, 8.02, 96, 1, 0, Math.PI * 0.42]} />
        <meshBasicMaterial color={MAGENTA} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 7.82, Math.sin(a) * 7.82, 0.02]}>
            <circleGeometry args={[0.3, 24]} />
            <meshBasicMaterial color={i === 5 ? LIME : BONE} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

/* ---------- SIGNALS: editorial panels — dark cards over the bone zone ---------- */
function Gallery() {
  const group = useRef<THREE.Group>(null!)
  const z0 = zAt(CH.signals[0]) - 4
  const frames = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        z: z0 - i * 5.6,
        x: i % 2 === 0 ? -3.4 : 3.4,
        y: (i % 3) * 0.7 - 0.7,
      })),
    [z0],
  )
  useFrame((st) => {
    group.current.children.forEach((c, i) => {
      c.rotation.y = (frames[i].x > 0 ? -0.3 : 0.3) + xstore.mx * 0.1
      c.position.y = frames[i].y + Math.sin(st.clock.elapsedTime * 0.4 + i * 1.6) * 0.1
    })
  })
  return (
    <group ref={group}>
      {frames.map((f, i) => (
        <group key={i} position={[f.x, f.y, f.z]}>
          <mesh>
            <boxGeometry args={[4.4, 2.7, 0.1]} />
            <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
          </mesh>
          <mesh position={[-1.35, -0.95, 0.07]}>
            <boxGeometry args={[1.4, 0.16, 0.03]} />
            <meshBasicMaterial color={MAGENTA} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- OPERATION: the flowing loop, matter-of-fact ---------- */
function InfinityLoop() {
  const inst = useRef<THREE.InstancedMesh>(null!)
  const z = zAt((CH.operation[0] + CH.operation[1]) / 2) - 2
  const N = 120
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame((st) => {
    const t = st.clock.elapsedTime
    for (let i = 0; i < N; i++) {
      const u = ((i / N + t * 0.045) % 1) * Math.PI * 2
      const d = 1 + Math.sin(u) * Math.sin(u)
      dummy.position.set((Math.cos(u) / d) * 8.4, ((Math.sin(u) * Math.cos(u)) / d) * 8.4, z)
      dummy.rotation.z = u
      const s = 0.7 + Math.sin(u * 2 + t) * 0.3
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    }
    inst.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={inst} args={[undefined, undefined, N]}>
      <boxGeometry args={[0.22, 0.22, 0.05]} />
      <meshBasicMaterial color={MAGENTA} />
    </instancedMesh>
  )
}

/* ---------- camera rig + theme lerp ---------- */
function Rig() {
  const { camera, scene } = useThree()
  const bg = useRef(new THREE.Color('#050506'))
  useFrame(() => {
    const p = xstore.p
    const z = -p * DEPTH
    const x = Math.sin(p * Math.PI * 3) * 1.4
    const y = Math.cos(p * Math.PI * 2.2) * 0.7
    camera.position.z = lerp(camera.position.z, z + 6, 0.09)
    camera.position.x = lerp(camera.position.x, x + xstore.mx * 0.6, 0.06)
    camera.position.y = lerp(camera.position.y, y - xstore.my * 0.45, 0.06)
    camera.lookAt(x * 0.4, y * 0.3, z - 8)
    // the world itself flips to bone in the light zones
    const l = lightAt(p)
    bg.current.lerpColors(DARK_BG, BONE_BG, l)
    ;(scene.background as THREE.Color).copy(bg.current)
    const fog = scene.fog as THREE.Fog
    fog.color.copy(bg.current)
    fog.near = 12 + l * 8
    fog.far = 58 + l * 26
  })
  return null
}

function SceneCleanup() {
  const { gl, scene } = useThree()
  useEffect(
    () => () => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      gl.dispose()
    },
    [gl, scene],
  )
  return null
}

export default function World({ active }: { active: boolean }) {
  const med = xstore.quality === 'med'
  return (
    <Canvas
      className="x-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, med ? 1.1 : 1.6]}
      camera={{ position: [0, 0, 6], fov: 46, near: 0.1, far: 110 }}
      gl={{ antialias: !med, powerPreference: 'high-performance' }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.Fog('#050506', 12, 58)
        scene.background = new THREE.Color('#050506')
      }}
    >
      <Rig />
      <SceneCleanup />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 7, 6]} intensity={1.6} />
      <directionalLight position={[-5, -3, 2]} intensity={0.5} color="#ffd9e6" />
      <PixelWall cols={med ? 34 : 50} rows={med ? 20 : 29} />
      <BuildMonolith />
      <ImmersiveGate />
      <MethodRing />
      <Gallery />
      <InfinityLoop />
      <SheetStack z={zAt(0.965)} spreadRange={[CH.cta[0], 1]} scale={1.15} />
    </Canvas>
  )
}

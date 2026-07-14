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
  return Math.max(zone(CH.manifesto[0], CH.presenca[1]), zone(CH.cases[0], CH.cases[1]))
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

/* ---------- CONSTRUÍMOS PRESENÇA: fragmentos dispersos se organizam numa estrutura ----------
   Assinatura do território: composição, repetição, consistência — a formação de um todo.
   Peças escuras sobre o fundo bone; o scroll do capítulo monta a parede, o cursor a percorre. */
function PixelWall({ cols, rows }: { cols: number; rows: number }) {
  const inst = useRef<THREE.InstancedMesh>(null!)
  const z = zAt(CH.presenca[0] + (CH.presenca[1] - CH.presenca[0]) * 0.45)
  const W = 27
  const H = 15.5
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const { colors, scatter } = useMemo(() => {
    const colors = new Float32Array(cols * rows * 3)
    const scatter = new Float32Array(cols * rows * 3)
    const c = new THREE.Color()
    for (let i = 0; i < cols * rows; i++) {
      const r = Math.random()
      c.set(r > 0.955 ? MAGENTA : r > 0.92 ? BONE : r > 0.5 ? CHARCOAL2 : '#22242c')
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      // posição dispersa de origem — cada fragmento vem de um lugar próprio
      scatter[i * 3] = (Math.random() - 0.5) * 46
      scatter[i * 3 + 1] = (Math.random() - 0.5) * 30
      scatter[i * 3 + 2] = (Math.random() - 0.5) * 26
    }
    return { colors, scatter }
  }, [cols, rows])

  useEffect(() => {
    inst.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
  }, [colors])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const cam = st.camera
    // progresso local do capítulo: 0 = caos disperso · 1 = estrutura montada
    const local = THREE.MathUtils.clamp((xstore.p - CH.presenca[0]) / (CH.presenca[1] - CH.presenca[0]), 0, 1)
    const assemble = THREE.MathUtils.smoothstep(local, 0.05, 0.6)
    // project the pointer onto the wall plane (approximation by camera frustum at wall depth)
    const dist = Math.abs(cam.position.z - z)
    const halfH = Math.tan(((cam as THREE.PerspectiveCamera).fov * Math.PI) / 360) * dist
    const halfW = halfH * (st.size.width / st.size.height)
    const px = cam.position.x + xstore.mx * halfW
    const py = cam.position.y - xstore.my * halfH
    let k = 0
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const i = k
        const x = (ix / (cols - 1) - 0.5) * W
        const y = (iy / (rows - 1) - 0.5) * H
        const dCur = Math.hypot(x - px, y - py)
        const ripple = Math.exp(-dCur * 0.55) * (1.1 + Math.sin(dCur * 3.2 - t * 4.5) * 0.35) * assemble
        const wave = Math.sin(x * 0.5 + t * 1.1) * Math.cos(y * 0.6 + t * 0.9) * 0.1
        // do disperso ao grid — a presença se forma
        const gx = THREE.MathUtils.lerp(scatter[i * 3], x, assemble)
        const gy = THREE.MathUtils.lerp(scatter[i * 3 + 1], y, assemble)
        const gz = THREE.MathUtils.lerp(scatter[i * 3 + 2], wave + ripple * 0.9, assemble)
        dummy.position.set(gx, gy, z + gz)
        const s = (0.35 + assemble * 0.65) * (1 + ripple * 0.9)
        dummy.scale.set(s, s, 1)
        dummy.rotation.set(0, 0, (1 - assemble) * scatter[i * 3 + 2] * 0.2)
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

/* ---------- TIPOS DE EXPERIÊNCIA: um mesmo objeto, três estados ----------
   Digital (magenta) · Marca & comércio (azul) · Live & conectado (lima).
   O monólito dá meia-volta a cada manifestação — três modos do mesmo sistema. */
const BAR_COLORS = [MAGENTA, '#2d6cff', LIME]
function BuildMonolith() {
  const group = useRef<THREE.Group>(null!)
  const barF = useRef<THREE.Mesh>(null!)
  const barB = useRef<THREE.Mesh>(null!)
  const rot = useRef(0)
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const local = (xstore.p - CH.tipos[0]) / (CH.tipos[1] - CH.tipos[0])
    const g = group.current
    g.visible = local > -0.12 && local < 1.12
    if (!g.visible) return
    const idx = THREE.MathUtils.clamp(Math.floor(local * 3), 0, 2)
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

/* ---------- CRIAMOS EXPERIÊNCIAS: o portal que se atravessa + telas/dispositivos reativos ----------
   Assinatura do território: resposta, interação, conexão — tudo aqui reage ao cursor. */
function ImmersiveGate() {
  const group = useRef<THREE.Group>(null!)
  const devices = useRef<THREE.Group>(null!)
  const z = zAt((CH.experiencias[0] + CH.experiencias[1]) / 2)
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

/* ---------- MÉTODO: a mesma geometria atravessa 4 estágios até ganhar presença ----------
   Entender = pontos observados · Imaginar = linhas conectam · Construir = matéria · Ativar = energia.
   O usuário VÊ a ideia se materializar — não são quatro cards. */
function MethodMaterialize() {
  const group = useRef<THREE.Group>(null!)
  const pts = useRef<THREE.Points>(null!)
  const wire = useRef<THREE.Mesh>(null!)
  const solid = useRef<THREE.Mesh>(null!)
  const pulse = useRef<THREE.Mesh>(null!)
  const z = zAt((CH.metodo[0] + CH.metodo[1]) / 2)
  const geo = useMemo(() => new THREE.IcosahedronGeometry(3.1, 1), [])
  useEffect(() => () => geo.dispose(), [geo])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    const local = THREE.MathUtils.clamp((xstore.p - CH.metodo[0]) / (CH.metodo[1] - CH.metodo[0]), 0, 1)
    const stage = local * 4 // 0..4 contínuo entre os estágios
    const g = group.current
    g.rotation.y = t * 0.12 + xstore.mx * 0.25
    g.rotation.x = Math.sin(t * 0.3) * 0.06 - xstore.my * 0.15
    // cada camada aparece no seu estágio e permanece por baixo das seguintes
    const fade = (a: number, b: number) => THREE.MathUtils.clamp((stage - a) / (b - a), 0, 1)
    ;(pts.current.material as THREE.PointsMaterial).opacity = 0.9 * fade(0, 0.5) * (1 - fade(2.6, 3.4) * 0.55)
    ;(wire.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * fade(0.9, 1.5)
    const solidMat = solid.current.material as THREE.MeshStandardMaterial
    solidMat.opacity = 0.95 * fade(1.9, 2.6)
    // Ativar: o sistema recebe energia — pulso emissivo e anel expandindo
    const energy = fade(2.9, 3.5)
    solidMat.emissive.set(MAGENTA)
    solidMat.emissiveIntensity = energy * (0.35 + 0.25 * Math.sin(t * 3))
    const ring = pulse.current
    const cycle = (t * 0.5) % 1
    ring.visible = energy > 0.05
    ring.scale.setScalar(1 + cycle * 2.2)
    ;(ring.material as THREE.MeshBasicMaterial).opacity = energy * (1 - cycle) * 0.5
  })

  return (
    <group ref={group} position={[0, 0, z]}>
      <points ref={pts} geometry={geo}>
        <pointsMaterial color={BONE} size={0.14} transparent opacity={0} depthWrite={false} />
      </points>
      <mesh ref={wire} geometry={geo}>
        <meshBasicMaterial color="#565b66" wireframe transparent opacity={0} />
      </mesh>
      <mesh ref={solid} geometry={geo} scale={0.985}>
        <meshStandardMaterial color={CHARCOAL} roughness={0.55} metalness={0.2} transparent opacity={0} />
      </mesh>
      <mesh ref={pulse} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[3.4, 0.03, 8, 64]} />
        <meshBasicMaterial color={MAGENTA} transparent opacity={0} />
      </mesh>
    </group>
  )
}

/* ---------- CASES: painéis editoriais — cards escuros sobre a zona bone ---------- */
function Gallery() {
  const group = useRef<THREE.Group>(null!)
  const z0 = zAt(CH.cases[0]) - 4
  const frames = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        z: z0 - i * 6.4,
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
      <ImmersiveGate />
      <BuildMonolith />
      <MethodMaterialize />
      <Gallery />
      <SheetStack z={zAt(0.955)} spreadRange={[CH.contato[0], 1]} scale={1.15} />
    </Canvas>
  )
}

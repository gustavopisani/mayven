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

/* light amount for a given progress — the single bone zone, with a WIDE feather:
   the background crossfades over ~a full viewport of scroll instead of snapping.
   (Cases deixou de ser zona clara: o capítulo tem superfície escura opaca própria.) */
function lightAt(p: number) {
  const zone = (a: number, b: number) => {
    const f = 0.05
    return Math.min(
      THREE.MathUtils.smoothstep(p, a - f * 0.3, a + f),
      1 - THREE.MathUtils.smoothstep(p, b - f, b + f * 0.3),
    )
  }
  return zone(CH.manifesto[0], CH.presenca[1])
}

/* ---------- HERO + CONTATO: sem objetos 3D ----------
   O SheetStack (leque de placas do hero/contato) foi removido: o finale é um
   painel DOM opaco (ContactFinale) e o hero tem o filme próprio — o canvas
   fica visualmente silencioso nesses trechos. */

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
    const localRaw = (xstore.p - CH.presenca[0]) / (CH.presenca[1] - CH.presenca[0])
    // fora do capítulo a parede NÃO existe — nenhum fragmento vaza para as seções vizinhas
    const on = localRaw > -0.45 && localRaw < 1.08
    inst.current.visible = on
    if (!on) return
    const local = THREE.MathUtils.clamp(localRaw, 0, 1)
    const assemble = THREE.MathUtils.smoothstep(local, 0.05, 0.6)
    // a parede se desfaz enquanto a superfície preta de "experiências" cobre a viewport
    const endK = 1 - THREE.MathUtils.smoothstep(localRaw, 0.68, 1.02)
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
        const s = (0.35 + assemble * 0.65) * (1 + ripple * 0.9) * endK
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

/* ---------- TIPOS DE EXPERIÊNCIA: sem objeto 3D ----------
   O antigo monólito (cartão WebGL) foi migrado para DOM: o cartão de vídeo vive
   DENTRO da view sticky de #c-tipos (TypeCard em Journey.tsx), dirigido pela mesma
   fonte de verdade (typeIdx) que a lista e os textos — e não pode vazar para
   Método porque sai de cena junto com o capítulo. */

/* ---------- CRIAMOS EXPERIÊNCIAS: sem objeto 3D ----------
   A partir deste capítulo a linguagem muda de "viajar por um cenário 3D" para
   "atravessar uma composição editorial viva" — a seção é 100% DOM (ver
   ExperienceEditorial em Journey.tsx), com superfície preta opaca cobrindo a
   viewport. O mundo não coloca NADA neste trecho nem no seguinte: a PixelWall se
   desfaz no fim de presença (endK) e "tipos" é dirigido inteiramente no DOM. */

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

/* ---------- CASES: sem objeto 3D ----------
   A Gallery (painéis atravessando a câmera) foi removida: os cases são um
   capítulo editorial DOM opaco (CasesSection) — o canvas fica silencioso
   neste trecho, apenas fundo neutro atrás da superfície da seção. */

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
      <MethodMaterialize />
    </Canvas>
  )
}

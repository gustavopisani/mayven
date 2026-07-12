import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { BLUE, LIME, NOISE_GLSL, PINK, input } from './mayven3d'

const lerp = THREE.MathUtils.lerp

/* =========================================================
   SIGNAL RUPTURE — a dark digital fabric that bends with the
   cursor and tears open on scroll, revealing the engine room
   (interface fragments, grids, signal particles) behind it.
   ========================================================= */

/* ---------- the rupturing surface ---------- */
function RupturePlane() {
  const mesh = useRef<THREE.Mesh>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpen: { value: 0 }, // scroll-driven rupture 0..1
      uHover: { value: 0 }, // cta convergence boost
      uMouse: { value: new THREE.Vector2(0.62, 0.5) }, // uv space
    }),
    [],
  )
  useFrame((state) => {
    const inp = input()
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uOpen.value = lerp(uniforms.uOpen.value, Math.min(1, inp.heroP * 1.6), 0.07)
    uniforms.uHover.value = lerp(uniforms.uHover.value, inp.cta, 0.08)
    // pointer NDC -> approximate uv on the plane (plane fills the view)
    uniforms.uMouse.value.x = lerp(uniforms.uMouse.value.x, inp.mx * 0.5 + 0.5, 0.08)
    uniforms.uMouse.value.y = lerp(uniforms.uMouse.value.y, -inp.my * 0.5 + 0.5, 0.08)
  })
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <planeGeometry args={[15.2, 8.8, 150, 90]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          varying float vBend;
          uniform float uTime;
          uniform float uOpen;
          uniform vec2 uMouse;
          ${NOISE_GLSL}
          void main() {
            vUv = uv;
            vec3 pos = position;
            // digital fabric: slow breathing folds, amplified as it ruptures
            float folds = mvnFbm(vec3(uv * 2.4, uTime * 0.06)) - 0.5;
            pos.z += folds * (0.5 + uOpen * 1.3);
            // the cursor pushes the fabric, like pressing from behind
            float d = distance(uv, uMouse);
            float press = exp(-d * 5.0);
            pos.z += press * (0.45 + uOpen * 0.4);
            vBend = folds + press;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          varying float vBend;
          uniform float uTime;
          uniform float uOpen;
          uniform float uHover;
          uniform vec2 uMouse;
          ${NOISE_GLSL}
          void main() {
            // crack field
            float n = mvnFbm(vec3(vUv * 5.0, uTime * 0.02));
            float vein = abs(n - 0.5); // 0 at the crack line
            // local rupture: scroll opens everywhere, cursor opens locally
            float d = distance(vUv, uMouse);
            float local = uOpen * 0.09 + exp(-d * 4.0) * (0.028 + uHover * 0.02) + uOpen * exp(-d * 2.0) * 0.05;
            float hole = 1.0 - smoothstep(local * 0.55, local, vein); // 1 inside the tear
            // surface shading: near-black fabric with fold sheen
            vec3 base = mix(vec3(0.028, 0.028, 0.034), vec3(0.075, 0.077, 0.09), clamp(vBend * 1.4 + 0.3, 0.0, 1.0));
            base += (mvnNoise(vec3(vUv * 90.0, 1.0)) - 0.5) * 0.02; // grain
            // molten pink edge where the surface tears
            float edge = smoothstep(local, local * 0.55, vein) * smoothstep(local * 0.2, local * 0.75, vein);
            float pulse = 0.75 + 0.25 * sin(uTime * 2.0 + vUv.x * 8.0);
            vec3 col = base + vec3(0.925, 0.043, 0.341) * edge * (1.4 + uOpen * 1.6 + uHover) * pulse;
            // acid-lime micro sparks on the tear line
            float spark = step(0.985, mvnNoise(vec3(vUv * 60.0, uTime * 0.4))) * edge;
            col += vec3(0.84, 1.0, 0.25) * spark * 2.0;
            float alpha = 1.0 - hole;
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  )
}

/* ---------- the engine room behind the surface ---------- */
function BackLayers() {
  const group = useRef<THREE.Group>(null!)
  const panels = useMemo(
    () =>
      [
        { p: [-3.4, 1.2, -2.2], s: [2.6, 1.6], c: '#15161c' },
        { p: [2.8, -1.1, -3.0], s: [3.2, 1.9], c: '#101116' },
        { p: [4.2, 1.6, -2.6], s: [2.0, 1.3], c: '#15161c' },
        { p: [-1.6, -1.8, -2.5], s: [2.2, 1.4], c: '#101116' },
        { p: [0.8, 2.1, -3.4], s: [2.8, 1.7], c: '#0d0e12' },
      ] as { p: [number, number, number]; s: [number, number]; c: string }[],
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const inp = input()
    const g = group.current
    // parallax: the engine room shifts opposite to the cursor, revealing depth
    g.position.x = lerp(g.position.x, -inp.mx * 0.6, 0.04)
    g.position.y = lerp(g.position.y, inp.my * 0.4, 0.04)
    // rises toward the surface as the rupture opens
    g.position.z = lerp(g.position.z, inp.heroP * 0.9, 0.05)
    g.children.forEach((c, i) => {
      c.position.y += Math.sin(t * 0.4 + i * 1.7) * 0.0008
      c.rotation.z = Math.sin(t * 0.22 + i) * 0.02
    })
  })
  return (
    <group ref={group}>
      {/* deep wireframe grid — the "engine floor" */}
      <mesh position={[0, -0.4, -4.6]} rotation={[-0.9, 0, 0]}>
        <planeGeometry args={[22, 14, 26, 16]} />
        <meshBasicMaterial color="#2D6CFF" wireframe transparent opacity={0.07} />
      </mesh>
      {/* floating interface fragments */}
      {panels.map((pn, i) => (
        <group key={i} position={pn.p}>
          <mesh>
            <planeGeometry args={pn.s} />
            <meshStandardMaterial color={pn.c} transparent opacity={0.92} roughness={0.6} metalness={0.4} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(pn.s[0], pn.s[1])]} />
            <lineBasicMaterial color={i % 2 ? '#EC0B57' : '#5a5f6a'} transparent opacity={i % 2 ? 0.5 : 0.35} />
          </lineSegments>
          {/* content bars inside the panel */}
          <mesh position={[-pn.s[0] * 0.18, pn.s[1] * 0.22, 0.01]}>
            <planeGeometry args={[pn.s[0] * 0.5, 0.07]} />
            <meshBasicMaterial color="#F4F1EA" transparent opacity={0.35} />
          </mesh>
          <mesh position={[-pn.s[0] * 0.08, pn.s[1] * 0.02, 0.01]}>
            <planeGeometry args={[pn.s[0] * 0.7, 0.07]} />
            <meshBasicMaterial color="#F4F1EA" transparent opacity={0.18} />
          </mesh>
        </group>
      ))}
      {/* a shader-gradient media plane deep in the stack */}
      <mesh position={[1.8, 0.4, -4.0]}>
        <planeGeometry args={[3.6, 2.1]} />
        <meshBasicMaterial color={PINK} transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

/* ---------- signal particles escaping the cracks ---------- */
function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null!)
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7
      positions[i * 3 + 2] = -0.2 - Math.random() * 3.4
      const roll = Math.random()
      c.copy(roll < 0.6 ? PINK : roll < 0.9 ? new THREE.Color('#7d828c') : roll < 0.96 ? BLUE : LIME)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }, [count])

  useFrame((state, dt) => {
    const inp = input()
    const p = points.current
    const attr = p.geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const speed = dt * (0.25 + inp.heroP * 1.4 + inp.cta * 1.6)
    for (let i = 0; i < count; i++) {
      // drift toward the viewer through the cracks
      arr[i * 3 + 2] += speed * (0.4 + ((i * 7919) % 100) / 130)
      arr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.0012
      if (arr[i * 3 + 2] > 1.2) {
        arr[i * 3] = (Math.random() - 0.5) * 12
        arr[i * 3 + 1] = (Math.random() - 0.5) * 7
        arr[i * 3 + 2] = -3.4
      }
    }
    attr.needsUpdate = true
    const m = p.material as THREE.PointsMaterial
    m.opacity = 0.28 + inp.heroP * 0.5 + inp.cta * 0.25
    m.size = 0.02 + inp.cta * 0.012
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ---------- CTA ripple ---------- */
function Ripple() {
  const ring = useRef<THREE.Mesh>(null!)
  const state = useRef({ life: 1, wasCta: 0 })
  useFrame((_, dt) => {
    const inp = input()
    const s = state.current
    if (inp.cta && !s.wasCta) s.life = 0 // new ripple on hover start
    s.wasCta = inp.cta
    s.life = Math.min(1, s.life + dt * 0.7)
    const r = ring.current
    r.visible = s.life < 1
    if (r.visible) {
      r.scale.setScalar(0.5 + s.life * 6)
      ;(r.material as THREE.MeshBasicMaterial).opacity = (1 - s.life) * 0.3
    }
  })
  return (
    <mesh ref={ring} position={[0, 0, 0.2]} visible={false}>
      <ringGeometry args={[0.96, 1, 80]} />
      <meshBasicMaterial color={PINK} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

function Rig() {
  const { camera, gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  useFrame(() => {
    const inp = input()
    camera.position.x = lerp(camera.position.x, inp.mx * 0.35, 0.05)
    camera.position.y = lerp(camera.position.y, -inp.my * 0.25, 0.05)
    // dolly INTO the rupture as you scroll
    camera.position.z = lerp(camera.position.z, 5.6 - inp.heroP * 1.5, 0.05)
    camera.lookAt(0, 0, -1)
  })
  return null
}

export default function HeroScene({
  active,
  particleCount = 700,
  dprCap = 1.75,
}: {
  active: boolean
  particleCount?: number
  dprCap?: number
}) {
  return (
    <Canvas
      className="hero-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, dprCap]}
      camera={{ position: [0, 0, 5.6], fov: 42 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Rig />
      <BackLayers />
      <Particles count={particleCount} />
      <RupturePlane />
      <Ripple />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <pointLight position={[-2, -1, 1.5]} intensity={5} color="#EC0B57" distance={10} />
    </Canvas>
  )
}

import * as THREE from 'three'

export { input } from '../lib/bus'
export type { MayvenInput } from '../lib/bus'

/** The structural Mayven M (same path as the SVG mark), extruded. */
export function buildMGeometry(depth = 20): THREE.ExtrudeGeometry {
  const pts: [number, number][] = [
    [8, 92], [8, 12], [30, 12], [50, 48], [70, 12], [84, 12], [92, 20],
    [92, 92], [74, 92], [74, 40], [54, 76], [46, 76], [26, 40], [26, 92],
  ]
  const shape = new THREE.Shape()
  // svg y grows downward — flip to three's y-up
  shape.moveTo(pts[0][0] - 50, 50 - pts[0][1])
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0] - 50, 50 - pts[i][1])
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 2.2,
    bevelSize: 1.6,
    bevelSegments: 2,
    curveSegments: 4,
  })
  geo.center()
  const s = 1 / 46 // ≈2.2 units tall
  geo.scale(s, s, s)
  geo.computeVertexNormals()
  return geo
}

/** GLSL value-noise + fbm, injected into materials and shaders. */
export const NOISE_GLSL = /* glsl */ `
float mvnHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float mvnNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(mvnHash(i), mvnHash(i + vec3(1,0,0)), f.x),
        mix(mvnHash(i + vec3(0,1,0)), mvnHash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(mvnHash(i + vec3(0,0,1)), mvnHash(i + vec3(1,0,1)), f.x),
        mix(mvnHash(i + vec3(0,1,1)), mvnHash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float mvnFbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * mvnNoise(p);
    p = p * 2.1 + vec3(7.3);
    a *= 0.5;
  }
  return v;
}
`

/** An abstract premium product form (lathe-built vessel) for viewer/visualization chapters. */
export function buildProductGeometry(): THREE.LatheGeometry {
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.001, -1.15),
    new THREE.Vector2(0.42, -1.12),
    new THREE.Vector2(0.55, -0.95),
    new THREE.Vector2(0.6, -0.45),
    new THREE.Vector2(0.52, 0.0),
    new THREE.Vector2(0.56, 0.42),
    new THREE.Vector2(0.42, 0.72),
    new THREE.Vector2(0.2, 0.86),
    new THREE.Vector2(0.18, 1.05),
    new THREE.Vector2(0.26, 1.1),
    new THREE.Vector2(0.26, 1.22),
    new THREE.Vector2(0.001, 1.24),
  ]
  const geo = new THREE.LatheGeometry(profile, 64)
  geo.computeVertexNormals()
  return geo
}

export const PINK = new THREE.Color('#EC0B57')
export const BLUE = new THREE.Color('#2D6CFF')
export const LIME = new THREE.Color('#D7FF3F')
export const BONE = new THREE.Color('#F4F1EA')

/** Obsidian material with procedural hot-pink crack veins (emissive injection). */
export function makeObsidianMaterial(uniformsOut: { uTime: { value: number }; uPulse: { value: number } }) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0b0b0e'),
    roughness: 0.32,
    metalness: 0.25,
    clearcoat: 0.85,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.1,
  })
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniformsOut.uTime
    shader.uniforms.uPulse = uniformsOut.uPulse
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMvnPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMvnPos = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vMvnPos;\nuniform float uTime;\nuniform float uPulse;\n${NOISE_GLSL}`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float n = mvnFbm(vMvnPos * 3.1 + vec3(0.0, uTime * 0.04, 0.0));
          float vein = smoothstep(0.44, 0.5, n) * (1.0 - smoothstep(0.5, 0.56, n));
          float rough = mvnFbm(vMvnPos * 9.0);
          vein *= 0.65 + 0.35 * rough;
          totalEmissiveRadiance += vec3(0.925, 0.043, 0.341) * vein * (1.6 + uPulse * 2.6);
        }`,
      )
  }
  return mat
}

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyDeadZone,
  clamp,
  normalizeTilt,
  particleBudget,
  resolveMotionAccess,
  screenModeFromAngle,
  smoothVector,
  vectorFromPointer,
} from '../src/experience/tiltPhysics.ts'

test('clamp handles ranges and invalid numbers', () => {
  assert.equal(clamp(8, 0, 4), 4)
  assert.equal(clamp(-2, 0, 4), 0)
  assert.equal(clamp(3, 0, 4), 3)
  assert.equal(clamp(Number.NaN, 0, 4), 0)
})

test('dead zone removes sensor noise and rescales useful values', () => {
  assert.equal(applyDeadZone(0.03, 0.05), 0)
  assert.ok(applyDeadZone(0.6, 0.05) > 0.5)
  assert.ok(applyDeadZone(-0.6, 0.05) < -0.5)
})

test('screen angles map to portrait and landscape modes', () => {
  assert.equal(screenModeFromAngle(0), 'portrait')
  assert.equal(screenModeFromAngle(90), 'landscape-left')
  assert.equal(screenModeFromAngle(180), 'portrait-upside-down')
  assert.equal(screenModeFromAngle(270), 'landscape-right')
  assert.equal(screenModeFromAngle(-90), 'landscape-right')
})

test('portrait tilt keeps neutral gravity down and maps gamma laterally', () => {
  const neutral = normalizeTilt({ beta: 0, gamma: 0 }, 'portrait')
  const right = normalizeTilt({ beta: 0, gamma: 24 }, 'portrait', { deadZone: 0 })

  assert.equal(neutral.x, 0)
  assert.equal(neutral.y, 1)
  assert.ok(right.x > 0.6)
  assert.equal(right.y, 1)
})

test('portrait forward tilt can reverse gravity toward the top', () => {
  const upward = normalizeTilt(
    { beta: -28, gamma: 0 },
    'portrait',
    { baseY: 0.68, deadZone: 0, forwardInfluence: 1.85, maxBeta: 28 },
  )

  assert.equal(upward.x, 0)
  assert.ok(upward.y < -0.9)
})

test('landscape tilt rotates the screen-relative vector', () => {
  const left = normalizeTilt({ beta: 20, gamma: 0 }, 'landscape-left', { deadZone: 0 })
  const right = normalizeTilt({ beta: 20, gamma: 0 }, 'landscape-right', { deadZone: 0 })

  assert.ok(left.x > 0.4)
  assert.ok(right.x < -0.4)
})

test('smoothing moves toward the target without jumping', () => {
  const smoothed = smoothVector({ x: 0, y: 1 }, { x: 1, y: -1 }, 0.25)

  assert.equal(smoothed.x, 0.25)
  assert.equal(smoothed.y, 0.5)
})

test('pointer fallback produces a gravity vector from the viewport center', () => {
  const rect = { left: 0, top: 0, width: 200, height: 100 }
  const vector = vectorFromPointer(200, 100, rect, 0)

  assert.equal(vector.x, 1)
  assert.equal(vector.y, 1)
})

test('permission resolution covers granted, denied, unsupported and error states', () => {
  assert.equal(resolveMotionAccess(false), 'unsupported')
  assert.equal(resolveMotionAccess(true, 'granted'), 'granted')
  assert.equal(resolveMotionAccess(true, 'denied'), 'denied')
  assert.equal(resolveMotionAccess(true, 'error'), 'error')
})

test('particle budget degrades for weaker devices and reduced motion', () => {
  assert.equal(particleBudget({ reducedMotion: true }), 0)
  assert.ok(particleBudget({ width: 390, deviceMemory: 2, hardwareConcurrency: 2 }) <= 800)
  assert.ok(particleBudget({ width: 1200, deviceMemory: 8, hardwareConcurrency: 8 }) >= 2000)
})

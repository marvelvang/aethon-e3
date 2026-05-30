import { describe, test, expect } from 'bun:test'
import { calculateGrowthDelta } from '../src/population.ts'

describe('calculateGrowthDelta', () => {
  test('returns 0 when supply is exactly 1', () => {
    expect(calculateGrowthDelta(100, 1.0)).toBe(0)
  })

  test('grows population when supply > 1', () => {
    const delta = calculateGrowthDelta(100, 2.0)
    expect(delta).toBeGreaterThan(0)
    expect(delta).toBeCloseTo(100 * 0.0025 * Math.pow(1, 1.2), 10)
  })

  test('shrinks population when supply < 1', () => {
    const delta = calculateGrowthDelta(100, 0.5)
    expect(delta).toBeLessThan(0)
    expect(delta).toBeCloseTo(-(100 * 0.005 * 0.5), 10)
  })

  test('scales linearly with population', () => {
    const a = calculateGrowthDelta(100, 1.5)
    const b = calculateGrowthDelta(200, 1.5)
    expect(b).toBeCloseTo(2 * a, 10)
  })
})

import { describe, test, expect } from 'bun:test'
import { placeBuilding, BuildError } from '../src/build.ts'
import { initial } from './fixtures.ts'

describe('placeBuilding', () => {
  test('rejects Base', () => {
    expect(() => placeBuilding(initial(), 5, 5, 'Base')).toThrow(BuildError)
  })

  test('rejects out-of-grid', () => {
    expect(() => placeBuilding(initial(), -1, 0, 'Housing')).toThrow(BuildError)
    expect(() => placeBuilding(initial(), 20, 0, 'Housing')).toThrow(BuildError)
    expect(() => placeBuilding(initial(), 0, 20, 'Housing')).toThrow(BuildError)
  })

  test('rejects occupied tile', () => {
    expect(() => placeBuilding(initial(), 0, 0, 'Housing')).toThrow(BuildError)
  })

  test('rejects when industry too low', () => {
    expect(() => placeBuilding({ ...initial(), industry: 0 }, 5, 5, 'Housing')).toThrow(/industry/i)
  })

  test('rejects when energy too low', () => {
    expect(() => placeBuilding({ ...initial(), energy: 0 }, 5, 5, 'Housing')).toThrow(/energy/i)
  })

  test('rejects when free population too low', () => {
    expect(() => placeBuilding({ ...initial(), population: 10 }, 5, 5, 'Housing')).toThrow(/population/i)
  })

  test('deducts industry+energy and adds newly-built tile', () => {
    const before = initial()
    const after = placeBuilding(before, 5, 5, 'Housing')
    expect(after.industry).toBe(before.industry - 60)
    expect(after.energy).toBe(before.energy - 60)
    expect(after.buildings).toHaveLength(2)
    expect(after.buildings[1]).toEqual({ x: 5, y: 5, type: 'Housing', isNewlyBuilt: true })
    // immutability: original untouched
    expect(before.buildings).toHaveLength(1)
    expect(before.industry).toBe(200)
  })

  test('newly-built tiles block free population for subsequent builds in the same round', () => {
    let s = initial() // pop=100, Housing populationCost=50 → fits exactly two
    s = placeBuilding(s, 5, 5, 'Housing')
    s = placeBuilding(s, 5, 6, 'Housing')
    expect(() => placeBuilding(s, 5, 7, 'Housing')).toThrow(/population/i)
  })
})

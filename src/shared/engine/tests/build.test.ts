import { describe, test, expect } from 'bun:test'
import { genesis } from '../src/genesis.ts'
import { placeBuilding, BuildError } from '../src/build.ts'

describe('placeBuilding', () => {
  test('rejects Base', () => {
    const s = genesis()
    expect(() => placeBuilding(s, 5, 5, 'Base')).toThrow(BuildError)
  })

  test('rejects out-of-grid', () => {
    const s = genesis()
    expect(() => placeBuilding(s, -1, 0, 'Housing')).toThrow(BuildError)
    expect(() => placeBuilding(s, 20, 0, 'Housing')).toThrow(BuildError)
    expect(() => placeBuilding(s, 0, 20, 'Housing')).toThrow(BuildError)
  })

  test('rejects occupied tile', () => {
    const s = genesis()
    expect(() => placeBuilding(s, 0, 0, 'Housing')).toThrow(BuildError)
  })

  test('rejects when industry too low', () => {
    const s = { ...genesis(), industry: 0 }
    expect(() => placeBuilding(s, 5, 5, 'Housing')).toThrow(/industry/i)
  })

  test('rejects when energy too low', () => {
    const s = { ...genesis(), energy: 0 }
    expect(() => placeBuilding(s, 5, 5, 'Housing')).toThrow(/energy/i)
  })

  test('rejects when free population too low', () => {
    const s = { ...genesis(), population: 10 }
    expect(() => placeBuilding(s, 5, 5, 'Housing')).toThrow(/population/i)
  })

  test('deducts industry+energy and adds newly-built tile', () => {
    const before = genesis()
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
    let s = genesis() // pop=100, Housing populationCost=50 → fits exactly two
    s = placeBuilding(s, 5, 5, 'Housing')
    s = placeBuilding(s, 5, 6, 'Housing')
    expect(() => placeBuilding(s, 5, 7, 'Housing')).toThrow(/population/i)
  })
})

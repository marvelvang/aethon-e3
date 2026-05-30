import { describe, test, expect } from 'bun:test'
import { simulateRound } from '../src/round.ts'
import { placeBuilding } from '../src/build.ts'
import { initial } from './fixtures.ts'

describe('simulateRound', () => {
  test('advances the round counter', () => {
    const before = initial()
    const after = simulateRound(before)
    expect(after.round).toBe(before.round + 1)
  })

  test('on initial state: Base produces +100 CG/Ind/Ene, then -100 pop consumption, then -15 ind/ene maint', () => {
    const after = simulateRound(initial())
    // CG: 0 + 100 prod - 100 pop = 0
    expect(after.consumerGoods).toBe(0)
    // Ind: 200 + 100 prod - 15 maint = 285
    expect(after.industry).toBe(285)
    // Ene: 200 + 100 prod - 15 maint = 285
    expect(after.energy).toBe(285)
  })

  test('marks all buildings as not-newly-built', () => {
    let s = initial()
    s = placeBuilding(s, 5, 5, 'Housing')
    expect(s.buildings[1].isNewlyBuilt).toBe(true)
    const after = simulateRound(s)
    expect(after.buildings.every(b => !b.isNewlyBuilt)).toBe(true)
  })

  test('population caps at total housing capacity', () => {
    let s = { ...initial(), consumerGoods: 100000 } // huge supply
    for (let i = 0; i < 20; i++) s = simulateRound(s)
    expect(s.population).toBeLessThanOrEqual(150)
  })

  test('produces immutable snapshot — input is unchanged', () => {
    const before = initial()
    const snapshot = JSON.parse(JSON.stringify(before))
    simulateRound(before)
    expect(before).toEqual(snapshot)
  })
})

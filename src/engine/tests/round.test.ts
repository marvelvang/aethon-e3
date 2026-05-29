import { describe, test, expect } from 'bun:test'
import { genesis } from '../src/genesis.ts'
import { simulateRound } from '../src/round.ts'
import { placeBuilding } from '../src/build.ts'

describe('simulateRound', () => {
  test('advances the round counter', () => {
    const before = genesis()
    const after = simulateRound(before)
    expect(after.round).toBe(before.round + 1)
  })

  test('on genesis state: Base produces +100 CG, +100 Ind, +100 Ene, then -100 pop consumption, then -15 ind maint, -15 ene maint', () => {
    const after = simulateRound(genesis())
    // CG: 0 + 100 prod - 100 pop = 0
    expect(after.consumerGoods).toBe(0)
    // Ind: 200 + 100 prod - 15 maint = 285
    expect(after.industry).toBe(285)
    // Ene: 200 + 100 prod - 15 maint = 285
    expect(after.energy).toBe(285)
  })

  test('marks all buildings as not-newly-built', () => {
    let s = genesis()
    s = placeBuilding(s, 5, 5, 'Housing')
    expect(s.buildings[1].isNewlyBuilt).toBe(true)
    const after = simulateRound(s)
    expect(after.buildings.every(b => !b.isNewlyBuilt)).toBe(true)
  })

  test('population caps at total housing capacity', () => {
    // Genesis Base has housing=150, population=100. Bring population to grow toward 150.
    let s = { ...genesis(), consumerGoods: 100000 } // huge supply
    for (let i = 0; i < 20; i++) s = simulateRound(s)
    expect(s.population).toBeLessThanOrEqual(150)
  })

  test('produces immutable snapshot — input is unchanged', () => {
    const before = genesis()
    const snapshot = JSON.parse(JSON.stringify(before))
    simulateRound(before)
    expect(before).toEqual(snapshot)
  })
})

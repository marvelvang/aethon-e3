import { describe, test, expect } from 'bun:test'
import { simulateRound } from '../src/round.ts'
import { placeBuilding } from '../src/build.ts'
import { initial } from './fixtures.ts'
import type { GameState } from '@aethon/models'

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

describe('simulateRound – research', () => {
  function withResearch(overrides: Partial<GameState> = {}): GameState {
    let s = initial()
    s = placeBuilding(s, 1, 0, 'Research') // researchProduction = 20
    return { ...s, ...overrides }
  }

  test('researchPoints reflects per-round production', () => {
    const after = simulateRound(withResearch())
    expect(after.researchPoints).toBe(20)
  })

  test('no focus: points split equally across all 4 branches', () => {
    const after = simulateRound(withResearch({ researchFocus: null }))
    // 20 / 4 = 5 per branch
    for (const branch of ['Housing', 'Consumer', 'Industry', 'Energy'] as const) {
      expect(after.researchProgress[branch].investedPoints).toBe(5)
    }
  })

  test('with focus: all points go to the focused branch', () => {
    const after = simulateRound(withResearch({ researchFocus: 'Industry' }))
    expect(after.researchProgress.Industry.investedPoints).toBe(20)
    expect(after.researchProgress.Housing.investedPoints).toBe(0)
    expect(after.researchProgress.Consumer.investedPoints).toBe(0)
    expect(after.researchProgress.Energy.investedPoints).toBe(0)
  })

  test('level-up triggers when investedPoints reach threshold', () => {
    // Cost to reach level 1 = 500. Inject state with 480 already invested.
    const s = withResearch({
      researchFocus: 'Housing',
      researchProgress: {
        Housing:  { level: 0, investedPoints: 480 },
        Consumer: { level: 0, investedPoints: 0 },
        Industry: { level: 0, investedPoints: 0 },
        Energy:   { level: 0, investedPoints: 0 },
      },
    })
    // After one round (+20 pts): 480 + 20 = 500 >= 500 → level up, reset
    const after = simulateRound(s)
    expect(after.researchProgress.Housing.level).toBe(1)
    expect(after.researchProgress.Housing.investedPoints).toBe(0)
  })

  test('level 5 is the cap — no further advancement', () => {
    const s = withResearch({
      researchFocus: 'Energy',
      researchProgress: {
        Housing:  { level: 0, investedPoints: 0 },
        Consumer: { level: 0, investedPoints: 0 },
        Industry: { level: 0, investedPoints: 0 },
        Energy:   { level: 5, investedPoints: 0 },
      },
    })
    const after = simulateRound(s)
    expect(after.researchProgress.Energy.level).toBe(5)
    expect(after.researchProgress.Energy.investedPoints).toBe(0)
  })

  test('no research buildings → progress unchanged', () => {
    const s = initial() // no Research building
    const before = JSON.parse(JSON.stringify(s.researchProgress))
    const after = simulateRound(s)
    expect(after.researchProgress).toEqual(before)
  })
})

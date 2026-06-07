import { describe, test, expect } from 'bun:test'
import { genesis } from '../src/genesis.ts'

describe('genesis', () => {
  test('produces a fixed identity-less initial state', () => {
    const g = genesis()
    expect(g).toEqual({
      round:          1,
      population:     100,
      consumerGoods:  0,
      industry:       200,
      energy:         200,
      buildings:      [{ x: 0, y: 0, type: 'Base', isNewlyBuilt: false }],
      researchPoints: 0,
      researchFocus:  null,
      researchProgress: {
        Housing:  { level: 0, investedPoints: 0 },
        Consumer: { level: 0, investedPoints: 0 },
        Industry: { level: 0, investedPoints: 0 },
        Energy:   { level: 0, investedPoints: 0 },
      },
    })
    // No id in the engine's output — identity is the caller's concern.
    expect('id' in g).toBe(false)
  })

  test('two calls return equal but independent objects', () => {
    const a = genesis()
    const b = genesis()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
    expect(a.buildings).not.toBe(b.buildings)
  })
})

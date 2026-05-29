import { describe, test, expect } from 'bun:test'
import { genesis } from '../src/genesis.ts'

describe('genesis', () => {
  test('produces a fixed initial state', () => {
    const g = genesis({ id: 'test' })
    expect(g.id).toBe('test')
    expect(g.round).toBe(1)
    expect(g.population).toBe(100)
    expect(g.consumerGoods).toBe(0)
    expect(g.industry).toBe(200)
    expect(g.energy).toBe(200)
    expect(g.buildings).toEqual([
      { x: 0, y: 0, type: 'Base', isNewlyBuilt: false },
    ])
  })

  test('generates an id when none is given', () => {
    const a = genesis()
    const b = genesis()
    expect(a.id).not.toBe(b.id)
    expect(a.id.length).toBeGreaterThan(0)
  })
})

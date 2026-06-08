import { describe, test, expect } from 'bun:test'
import { aggregateBuildings, calculateGains, nextPopulation } from '../src/gains.ts'
import { simulateRound } from '../src/round.ts'
import { placeBuilding } from '../src/build.ts'
import { initial } from './fixtures.ts'

describe('aggregateBuildings', () => {
  test('on initial state: Base contributes everything', () => {
    const a = aggregateBuildings(initial().buildings)
    expect(a).toEqual({
      consumerGoodsProduction:   100,
      industryProduction:        100,
      energyProduction:          100,
      housing:                   150,
      researchProduction:        0,
      maintenanceIndustry:       15,
      maintenanceEnergy:         15,
      newlyBuiltPopulationCost:  0,  // Base is not newlyBuilt
      maintenancePopulationCost: 10,
    })
  })

  test('newly-built and maintenance population costs split correctly', () => {
    const s = placeBuilding(initial(), 5, 5, 'Housing')
    const a = aggregateBuildings(s.buildings)
    expect(a.newlyBuiltPopulationCost).toBe(50)  // Housing freshly placed
    expect(a.maintenancePopulationCost).toBe(10) // Base maintenance
  })
})

describe('nextPopulation', () => {
  test('returns 0 when population is 0', () => {
    expect(nextPopulation(0, 100, 200)).toBe(0)
  })

  test('caps at housing', () => {
    expect(nextPopulation(140, 100000, 150)).toBe(150)
  })
})

describe('calculateGains consistency with simulateRound', () => {
  test('predicted populationGain equals the actual next-round population delta', () => {
    const s = initial()
    const predicted = calculateGains(s).populationGain
    const actual    = simulateRound(s).population - s.population
    expect(predicted).toBe(actual)
  })

  test('predicted industry/energy/CG gains equal next-round deltas', () => {
    const s = initial()
    const g = calculateGains(s)
    const n = simulateRound(s)
    expect(g.industryGain).toBe(n.industry - s.industry)
    expect(g.energyGain).toBe(n.energy - s.energy)
    // CG gain is "raw" (production - population), without the >=0 clamp,
    // matching the old behaviour for parity with the C# port.
    expect(g.consumerGoodsGain).toBe(100 - 100) // initial: prod 100, pop 100
  })
})

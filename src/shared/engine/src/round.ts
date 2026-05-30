import type { GameState } from '@aethon/models'
import { defFor } from './definitions.ts'
import { calculateGrowthDelta } from './population.ts'

export function simulateRound(state: GameState): GameState {
  // Step 1: Normalization — releases bound population
  let buildings = state.buildings.map(b => ({ ...b, isNewlyBuilt: false }))

  let { consumerGoods, industry, energy, population } = state

  // Step 2 + 2b: Production and Maintenance
  for (const b of buildings) {
    const d = defFor(b.type)
    consumerGoods += d.consumerGoodsProduction
    industry      += d.industryProduction
    energy        += d.energyProduction
    industry      -= d.maintenanceIndustryCost
    energy        -= d.maintenanceEnergyCost
  }

  // Step 3: Consumption
  consumerGoods = Math.max(0, consumerGoods - population)

  // Step 4–6: Supply ratio + population change + housing cap
  if (population > 0) {
    const supply = consumerGoods / population
    const delta = calculateGrowthDelta(population, supply)
    const housing = buildings.reduce((sum, b) => sum + defFor(b.type).housingContribution, 0)
    population = Math.min(Math.trunc(population + delta), housing)
  }

  return {
    ...state,
    round: state.round + 1,
    population,
    consumerGoods,
    industry,
    energy,
    buildings,
  }
}

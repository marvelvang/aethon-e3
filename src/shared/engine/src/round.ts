import type { GameState } from '@aethon/models'
import { aggregateBuildings, nextPopulation } from './gains.ts'

export function simulateRound(state: GameState): GameState {
  // Step 1: Normalization — releases bound population
  const buildings = state.buildings.map(b => ({ ...b, isNewlyBuilt: false }))

  const a = aggregateBuildings(buildings)

  // Step 2 + 2b: Production and Maintenance
  const industry = state.industry + a.industryProduction - a.maintenanceIndustry
  const energy   = state.energy   + a.energyProduction   - a.maintenanceEnergy

  // Step 3: Consumption
  const consumerGoods = Math.max(0, state.consumerGoods + a.consumerGoodsProduction - state.population)

  // Steps 4–6: Supply ratio + population change + housing cap
  const population = nextPopulation(state.population, consumerGoods, a.housing)

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

import type { GameState } from '@aethon/models'
import { defFor } from './definitions.ts'
import { calculateGrowthDelta } from './population.ts'

export interface ResourceGains {
  consumerGoodsGain: number
  industryGain: number
  energyGain: number
  populationGain: number
}

export function calculateGains(state: GameState): ResourceGains {
  let cgProduction = 0, indProduction = 0, eneProduction = 0
  let totalHousing = 0, maintenanceInd = 0, maintenanceEne = 0

  for (const b of state.buildings) {
    const d = defFor(b.type)
    cgProduction   += d.consumerGoodsProduction
    indProduction  += d.industryProduction
    eneProduction  += d.energyProduction
    totalHousing   += d.housingContribution
    maintenanceInd += d.maintenanceIndustryCost
    maintenanceEne += d.maintenanceEnergyCost
  }

  return {
    consumerGoodsGain: cgProduction - state.population,
    industryGain:      indProduction - maintenanceInd,
    energyGain:        eneProduction - maintenanceEne,
    populationGain:    nextPopulationDelta(state, cgProduction, totalHousing),
  }
}

function nextPopulationDelta(state: GameState, cgProduction: number, totalHousing: number): number {
  if (state.population === 0) return 0
  const nextGoods = Math.max(0, state.consumerGoods + cgProduction - state.population)
  const supply = nextGoods / state.population
  const delta = calculateGrowthDelta(state.population, supply)
  const nextPopulation = Math.min(Math.trunc(state.population + delta), totalHousing)
  return nextPopulation - state.population
}

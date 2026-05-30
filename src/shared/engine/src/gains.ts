import type { Building, GameState } from '@aethon/models'
import { defFor } from './definitions.ts'
import { calculateGrowthDelta } from './population.ts'

/**
 * Per-building totals needed by every round/projection step. Computed once
 * by walking the buildings list, then reused by `round.simulateRound`,
 * `projection.project`, and `calculateGains` below.
 */
export interface BuildingAggregate {
  consumerGoodsProduction:   number
  industryProduction:        number
  energyProduction:          number
  housing:                   number
  maintenanceIndustry:       number
  maintenanceEnergy:         number
  /** Sum of populationCost over buildings with `isNewlyBuilt = true`. */
  newlyBuiltPopulationCost:  number
  /** Sum of maintenancePopulationCost over buildings with `isNewlyBuilt = false`. */
  maintenancePopulationCost: number
}

export function aggregateBuildings(buildings: readonly Building[]): BuildingAggregate {
  let cg = 0, ind = 0, ene = 0, housing = 0
  let mInd = 0, mEne = 0, newPop = 0, mPop = 0
  for (const b of buildings) {
    const d = defFor(b.type)
    cg      += d.consumerGoodsProduction
    ind     += d.industryProduction
    ene     += d.energyProduction
    housing += d.housingContribution
    mInd    += d.maintenanceIndustryCost
    mEne    += d.maintenanceEnergyCost
    if (b.isNewlyBuilt) newPop += d.populationCost
    else                mPop   += d.maintenancePopulationCost
  }
  return {
    consumerGoodsProduction:   cg,
    industryProduction:        ind,
    energyProduction:          ene,
    housing,
    maintenanceIndustry:       mInd,
    maintenanceEnergy:         mEne,
    newlyBuiltPopulationCost:  newPop,
    maintenancePopulationCost: mPop,
  }
}

/**
 * Computes the next-round population given (a) the consumer-goods stockpile
 * that will remain after the round's consumption step and (b) total housing.
 * Returns the new population, already capped at housing and truncated.
 */
export function nextPopulation(
  population: number,
  consumerGoodsAfterConsumption: number,
  housing: number,
): number {
  if (population === 0) return 0
  const supply = consumerGoodsAfterConsumption / population
  const delta  = calculateGrowthDelta(population, supply)
  return Math.min(Math.trunc(population + delta), housing)
}

export interface ResourceGains {
  consumerGoodsGain: number
  industryGain:      number
  energyGain:        number
  populationGain:    number
}

/** Predicts the next round's deltas without applying them. */
export function calculateGains(state: GameState): ResourceGains {
  const a       = aggregateBuildings(state.buildings)
  const cgAfter = Math.max(0, state.consumerGoods + a.consumerGoodsProduction - state.population)
  const nextPop = nextPopulation(state.population, cgAfter, a.housing)
  return {
    consumerGoodsGain: a.consumerGoodsProduction - state.population,
    industryGain:      a.industryProduction      - a.maintenanceIndustry,
    energyGain:        a.energyProduction        - a.maintenanceEnergy,
    populationGain:    nextPop - state.population,
  }
}

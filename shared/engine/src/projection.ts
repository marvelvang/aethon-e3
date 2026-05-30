import { GRID_SIZE, type GameResult, type GameState, type UiBuildingTypeInfo, type UiState, type BuildingType } from '@aethon/models'
import { BUILDING_DEFINITIONS, defFor } from './definitions.ts'
import { calculateGains } from './gains.ts'

const ALL_TYPES: BuildingType[] = ['Base', 'Consumer', 'Industry', 'Housing', 'PowerPlant']
const BUILDABLE_TYPES = new Set<BuildingType>(['Consumer', 'Industry', 'Housing', 'PowerPlant'])

export function project(state: GameState): UiState {
  let housing = 0, bound = 0
  for (const b of state.buildings) {
    const d = defFor(b.type)
    housing += d.housingContribution
    bound += b.isNewlyBuilt ? d.populationCost : d.maintenancePopulationCost
  }
  const freePopulation = state.population - bound

  const isWon  = state.buildings.length === GRID_SIZE * GRID_SIZE
  const isLost = state.industry < 0 || state.energy < 0
  const gameResult: GameResult = isLost ? 'Loss' : isWon ? 'Win' : 'None'

  const gains = calculateGains(state)

  const buildingTypes: UiBuildingTypeInfo[] = ALL_TYPES.map(t => {
    const d = BUILDING_DEFINITIONS[t]
    const buildable = BUILDABLE_TYPES.has(t)
    return {
      type: t,
      populationCost:          d.populationCost,
      industryCost:            d.industryCost,
      energyCost:              d.energyCost,
      consumerGoodsProduction: d.consumerGoodsProduction,
      industryProduction:      d.industryProduction,
      energyProduction:        d.energyProduction,
      housingContribution:     d.housingContribution,
      maintenancePopulationCost: d.maintenancePopulationCost,
      maintenanceIndustryCost:   d.maintenanceIndustryCost,
      maintenanceEnergyCost:     d.maintenanceEnergyCost,
      isBuildable: buildable,
      canAfford: buildable
        && freePopulation >= d.populationCost
        && state.industry  >= d.industryCost
        && state.energy    >= d.energyCost,
    }
  })

  return {
    gameStateId:       state.id,
    round:             state.round,
    population:        state.population,
    freePopulation,
    boundPopulation:   bound,
    consumerGoods:     state.consumerGoods,
    industry:          state.industry,
    energy:            state.energy,
    housing,
    consumerGoodsGain: gains.consumerGoodsGain,
    industryGain:      gains.industryGain,
    energyGain:        gains.energyGain,
    populationGain:    gains.populationGain,
    gameResult,
    buildings: state.buildings.map(b => ({
      x: b.x, y: b.y, type: b.type, isNewlyBuilt: b.isNewlyBuilt,
    })),
    buildingTypes,
  }
}

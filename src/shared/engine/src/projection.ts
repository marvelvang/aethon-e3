import { GRID_SIZE, type BuildingType, type GameResult, type GameState, type UiBuildingTypeInfo, type UiState } from '@aethon/models'
import { BUILDING_DEFINITIONS } from './definitions.ts'
import { aggregateBuildings, calculateGains } from './gains.ts'

const ALL_TYPES: BuildingType[] = ['Base', 'Consumer', 'Industry', 'Housing', 'PowerPlant', 'Research']
const BUILDABLE_TYPES = new Set<BuildingType>(['Consumer', 'Industry', 'Housing', 'PowerPlant', 'Research'])

export function project(state: GameState): UiState {
  const a    = aggregateBuildings(state.buildings)
  const bound          = a.newlyBuiltPopulationCost + a.maintenancePopulationCost
  const freePopulation = state.population - bound

  const isWon    = state.buildings.length === GRID_SIZE * GRID_SIZE
  const isLost   = state.industry < 0 || state.energy < 0
  const gameResult: GameResult = isLost ? 'Loss' : isWon ? 'Win' : 'None'

  const gains = calculateGains(state)

  const buildingTypes: UiBuildingTypeInfo[] = ALL_TYPES.map(t => {
    const d = BUILDING_DEFINITIONS[t]
    const buildable = BUILDABLE_TYPES.has(t)
    return {
      type: t,
      populationCost:            d.populationCost,
      industryCost:              d.industryCost,
      energyCost:                d.energyCost,
      consumerGoodsProduction:   d.consumerGoodsProduction,
      industryProduction:        d.industryProduction,
      energyProduction:          d.energyProduction,
      housingContribution:       d.housingContribution,
      maintenancePopulationCost: d.maintenancePopulationCost,
      maintenanceIndustryCost:   d.maintenanceIndustryCost,
      maintenanceEnergyCost:     d.maintenanceEnergyCost,
      isBuildable:               buildable,
      canAfford:                 buildable
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
    housing:           a.housing,
    consumerGoodsGain: gains.consumerGoodsGain,
    industryGain:      gains.industryGain,
    energyGain:        gains.energyGain,
    populationGain:    gains.populationGain,
    gameResult,
    buildings:         state.buildings.map(b => ({ x: b.x, y: b.y, type: b.type, isNewlyBuilt: b.isNewlyBuilt })),
    buildingTypes,
  }
}

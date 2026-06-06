export const GRID_SIZE = 20

export const BUILDING_TYPES = ['Base', 'Housing', 'Consumer', 'Industry', 'PowerPlant'] as const
export type BuildingType = (typeof BUILDING_TYPES)[number]

export const GAME_RESULTS = ['None', 'Win', 'Loss'] as const
export type GameResult = (typeof GAME_RESULTS)[number]

export interface Building {
  x: number
  y: number
  type: BuildingType
  isNewlyBuilt: boolean
}

export interface GameState {
  id: string
  round: number
  population: number
  consumerGoods: number
  industry: number
  energy: number
  buildings: Building[]
}

/**
 * A building as exposed to the UI. Structurally identical to `Building`
 * today; the alias documents that the projection step intentionally
 * forwards each tile verbatim, while leaving room to diverge later
 * (e.g. derived display flags) without ripple-changing the engine.
 */
export type UiBuildingSlot = Building

export interface UiBuildingTypeInfo {
  type: BuildingType
  populationCost: number
  industryCost: number
  energyCost: number
  consumerGoodsProduction: number
  industryProduction: number
  energyProduction: number
  housingContribution: number
  maintenancePopulationCost: number
  maintenanceIndustryCost: number
  maintenanceEnergyCost: number
  isBuildable: boolean
  canAfford: boolean
}

export interface UiState {
  /** Set by the server in MP mode; undefined in SP-local mode (no backend). */
  backendVersion?: string
  gameStateId: string
  round: number
  population: number
  freePopulation: number
  boundPopulation: number
  consumerGoods: number
  industry: number
  energy: number
  housing: number
  consumerGoodsGain: number
  industryGain: number
  energyGain: number
  populationGain: number
  gameResult: GameResult
  buildings: UiBuildingSlot[]
  buildingTypes: UiBuildingTypeInfo[]
}

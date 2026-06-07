export { BUILDING_DEFINITIONS, defFor, type BuildingDefinition } from './definitions.ts'
export { RESEARCH_COSTS, researchCostFor } from './research-definitions.ts'
export { calculateGrowthDelta } from './population.ts'
export { genesis } from './genesis.ts'
export { placeBuilding, BuildError } from './build.ts'
export { simulateRound } from './round.ts'
export {
  aggregateBuildings,
  calculateGains,
  nextPopulation,
  type BuildingAggregate,
  type ResourceGains,
} from './gains.ts'
export { project } from './projection.ts'

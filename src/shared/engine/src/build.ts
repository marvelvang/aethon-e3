import { GRID_SIZE, type BuildingType, type GameState } from '@aethon/models'
import { defFor } from './definitions.ts'
import { aggregateBuildings } from './gains.ts'

export class BuildError extends Error {}

/** Returns all grid cells occupied by building b (accounts for multi-tile footprints). */
export function buildingCells(bx: number, by: number, type: BuildingType): { x: number; y: number }[] {
  const size = Math.sqrt(defFor(type).tileSize)
  const cells: { x: number; y: number }[] = []
  for (let dx = 0; dx < size; dx++)
    for (let dy = 0; dy < size; dy++)
      cells.push({ x: bx + dx, y: by + dy })
  return cells
}

function isOccupied(buildings: GameState['buildings'], x: number, y: number): boolean {
  return buildings.some(b => {
    const size = Math.sqrt(defFor(b.type).tileSize)
    return x >= b.x && x < b.x + size && y >= b.y && y < b.y + size
  })
}

export function placeBuilding(
  state: GameState,
  x: number,
  y: number,
  type: BuildingType,
): GameState {
  if (type === 'Base') throw new BuildError('Base cannot be built manually.')

  const d = defFor(type)
  const size = Math.sqrt(d.tileSize)

  if (x < 0 || x + size > GRID_SIZE || y < 0 || y + size > GRID_SIZE)
    throw new BuildError(`Position (${x},${y}) with size ${size}×${size} extends outside the grid.`)

  for (let dx = 0; dx < size; dx++)
    for (let dy = 0; dy < size; dy++)
      if (isOccupied(state.buildings, x + dx, y + dy))
        throw new BuildError(`Position (${x + dx},${y + dy}) is already occupied.`)

  const a = aggregateBuildings(state.buildings)
  const bound = a.newlyBuiltPopulationCost + a.maintenancePopulationCost
  const freePopulation = state.population - bound

  if (freePopulation < d.populationCost)
    throw new BuildError(`Insufficient free population. Need ${d.populationCost}, have ${freePopulation}.`)

  if (state.industry < d.industryCost)
    throw new BuildError(`Insufficient industry. Need ${d.industryCost}, have ${state.industry}.`)

  if (state.energy < d.energyCost)
    throw new BuildError(`Insufficient energy. Need ${d.energyCost}, have ${state.energy}.`)

  return {
    ...state,
    industry: state.industry - d.industryCost,
    energy: state.energy - d.energyCost,
    buildings: [
      ...state.buildings,
      { x, y, type, isNewlyBuilt: true },
    ],
  }
}

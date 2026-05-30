import { GRID_SIZE, type BuildingType, type GameState } from '@aethon/models'
import { defFor } from './definitions.ts'

export class BuildError extends Error {}

export function placeBuilding(
  state: GameState,
  x: number,
  y: number,
  type: BuildingType,
): GameState {
  if (type === 'Base') throw new BuildError('Base cannot be built manually.')

  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE)
    throw new BuildError(`Position (${x},${y}) is outside the grid.`)

  if (state.buildings.some(b => b.x === x && b.y === y))
    throw new BuildError(`Position (${x},${y}) is already occupied.`)

  const d = defFor(type)

  const bound = state.buildings
    .filter(b => b.isNewlyBuilt)
    .reduce((sum, b) => sum + defFor(b.type).populationCost, 0)
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

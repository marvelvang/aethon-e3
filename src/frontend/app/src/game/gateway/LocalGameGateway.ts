import type { BuildingType, GameState, UiState } from '@aethon/models'
import { genesis, placeBuilding, project, simulateRound } from '@aethon/engine'
import { appStorage } from '../../shared/storage/appStorage'
import type { GameGateway } from './GameGateway'

/**
 * Runs the engine directly in the browser and persists the GameState to
 * localStorage. No backend involved.
 *
 * State is cached in-memory across calls to avoid re-parsing JSON; the
 * storage write happens after every mutation.
 */
export class LocalGameGateway implements GameGateway {
  private state: GameState | null = null

  async load(): Promise<UiState> {
    let s = appStorage.gameState.get()
    if (!s) {
      s = { ...genesis(), id: newGameId() }
      appStorage.gameState.set(s)
    }
    this.state = s
    return project(s)
  }

  async build(x: number, y: number, type: BuildingType): Promise<UiState> {
    return this.apply(s => placeBuilding(s, x, y, type))
  }

  async endRound(): Promise<UiState> {
    return this.apply(simulateRound)
  }

  async reset(): Promise<UiState> {
    const fresh: GameState = { ...genesis(), id: newGameId() }
    this.state = fresh
    appStorage.gameState.set(fresh)
    return project(fresh)
  }

  private apply(transition: (s: GameState) => GameState): UiState {
    if (!this.state) throw new Error('Gateway not loaded — call load() first.')
    const next = transition(this.state)
    this.state = next
    appStorage.gameState.set(next)
    return project(next)
  }
}

function newGameId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'game-' + Math.random().toString(36).slice(2, 12)
}

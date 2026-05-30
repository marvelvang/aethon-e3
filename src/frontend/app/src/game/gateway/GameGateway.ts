import type { BuildingType, UiState } from '@aethon/models'

/**
 * The frontend's contract for talking to "a game" — local or remote.
 * Every method returns the resulting UiState, so callers can render
 * eagerly without re-reading state. Validation errors (e.g. BuildError
 * from the engine, 400 from the API) propagate as rejected promises.
 *
 * Two implementations:
 *   LocalGameGateway   — engine + localStorage, SP-local mode (current)
 *   RemoteGameGateway  — api-client → Hono RPC, MP mode (future)
 */
export interface GameGateway {
  /** Load the existing game, or create a fresh one if none exists. */
  load(): Promise<UiState>
  build(x: number, y: number, type: BuildingType): Promise<UiState>
  endRound(): Promise<UiState>
  /** Abandon the current game and start fresh. */
  reset(): Promise<UiState>
}

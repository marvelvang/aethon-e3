import type { GameState } from '@aethon/models'

/**
 * Returns the canonical initial game state, without an identity. Whoever
 * persists this state — the database in MP mode, the browser in SP-local
 * mode — is responsible for assigning an id.
 */
export function genesis(): Omit<GameState, 'id'> {
  return {
    round:         1,
    population:    100,
    consumerGoods: 0,
    industry:      200,
    energy:        200,
    buildings:     [{ x: 0, y: 0, type: 'Base', isNewlyBuilt: false }],
  }
}

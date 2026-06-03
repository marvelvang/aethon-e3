import type { GameState } from '@aethon/models'
import { RESEARCH_BRANCHES } from '@aethon/models'

/**
 * Returns the canonical initial game state, without an identity. Whoever
 * persists this state — the database in MP mode, the browser in SP-local
 * mode — is responsible for assigning an id.
 */
export function genesis(): Omit<GameState, 'id'> {
  return {
    round:          1,
    population:     100,
    consumerGoods:  0,
    industry:       200,
    energy:         200,
    buildings:      [{ x: 0, y: 0, type: 'Base', isNewlyBuilt: false }],
    researchPoints: 0,
    researchFocus:  null,
    researchProgress: Object.fromEntries(
      RESEARCH_BRANCHES.map(branch => [branch, { level: 0, investedPoints: 0 }])
    ) as GameState['researchProgress'],
  }
}

export type { GameGateway } from './GameGateway'
export { LocalGameGateway } from './LocalGameGateway'

import { LocalGameGateway } from './LocalGameGateway'
import type { GameGateway } from './GameGateway'

/**
 * The default gateway used by `useGame()`. A module-level singleton so the
 * in-memory cache survives React hot-reload cycles and is shared across
 * unrelated useGame consumers (there's only ever one game in SP-local mode).
 *
 * To swap in a `RemoteGameGateway` later, pass it explicitly to `useGame()`.
 */
export const defaultGateway: GameGateway = new LocalGameGateway()

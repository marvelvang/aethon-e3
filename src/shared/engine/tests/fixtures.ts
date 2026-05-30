import type { GameState } from '@aethon/models'
import { genesis } from '../src/genesis.ts'

/** Test fixture: the canonical initial state with a fixed id. */
export function initial(): GameState {
  return { ...genesis(), id: 'test' }
}

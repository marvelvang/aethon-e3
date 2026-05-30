import type { GameState } from '@aethon/models'

export interface GenesisOptions {
  id?: string
}

export function genesis(opts: GenesisOptions = {}): GameState {
  const id = opts.id ?? generateId()
  return {
    id,
    round: 1,
    population: 100,
    consumerGoods: 0,
    industry: 200,
    energy: 200,
    buildings: [
      { x: 0, y: 0, type: 'Base', isNewlyBuilt: false },
    ],
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'game-' + Math.random().toString(36).slice(2, 12)
}

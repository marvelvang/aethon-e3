import type { GameState } from '@aethon/models'
import { storage } from './storage'

const GAME_STATE_KEY = 'aethon.gameState'

export const appStorage = {
  gameState: {
    get(): GameState | null {
      const raw = storage.get(GAME_STATE_KEY)
      if (raw === null) return null
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.buildings)) {
          return parsed as GameState
        }
      } catch {
        // fall through
      }
      return null
    },
    set(s: GameState): void {
      storage.set(GAME_STATE_KEY, JSON.stringify(s))
    },
    remove(): void {
      storage.remove(GAME_STATE_KEY)
    },
  },

  fullscreen: {
    get(defaultValue = true): boolean {
      const raw = storage.get('aethon.fullscreen')
      return raw === null ? defaultValue : raw === 'true'
    },
    set(value: boolean): void {
      storage.set('aethon.fullscreen', String(value))
    },
  },
}

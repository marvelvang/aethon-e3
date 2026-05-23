import { storage } from './storage'

export const appStorage = {
  gameId: {
    get(): number | null {
      const raw = storage.get('aethon.gameId')
      if (raw === null) return null
      const id = parseInt(raw, 10)
      return isNaN(id) ? null : id
    },
    set(id: number): void {
      storage.set('aethon.gameId', String(id))
    },
    remove(): void {
      storage.remove('aethon.gameId')
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

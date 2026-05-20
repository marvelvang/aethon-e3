const GAME_ID_KEY = 'aethon_game_id'

export function getStoredGameId(): number | null {
  const raw = localStorage.getItem(GAME_ID_KEY)
  if (raw === null) return null
  const id = parseInt(raw, 10)
  return isNaN(id) ? null : id
}

export function storeGameId(id: number): void {
  localStorage.setItem(GAME_ID_KEY, String(id))
}

export function clearStoredGameId(): void {
  localStorage.removeItem(GAME_ID_KEY)
}

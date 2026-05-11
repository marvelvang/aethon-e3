import type { components } from './generated'

type UiState = components['schemas']['UiState']
type PlaceBuildingRequest = components['schemas']['PlaceBuildingRequest']

const BASE_URL = 'https://aethon-e3-backend-production.up.railway.app'
const GAME_ID_KEY = 'aethon_game_id'

function getStoredGameId(): number | null {
  const raw = localStorage.getItem(GAME_ID_KEY)
  if (raw === null) return null
  const id = parseInt(raw, 10)
  return isNaN(id) ? null : id
}

function storeGameId(id: number): void {
  localStorage.setItem(GAME_ID_KEY, String(id))
}

function clearStoredGameId(): void {
  localStorage.removeItem(GAME_ID_KEY)
}

async function fetchJson<T>(label: string, input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch { /* ignore */ }
    throw new Error(`${label} → ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }
  return res.json() as Promise<T>
}

const getGame = (id: number) =>
  fetchJson<UiState>(`GET /api/game/${id}`, `${BASE_URL}/api/game/${id}`)

const createGame = () =>
  fetchJson<UiState>('POST /api/game', `${BASE_URL}/api/game`, { method: 'POST' })

export const placeBuilding = (id: number, req: PlaceBuildingRequest) =>
  fetchJson<UiState>(
    `POST /api/game/${id}/buildings`,
    `${BASE_URL}/api/game/${id}/buildings`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) }
  )

export const endRound = (id: number) =>
  fetchJson<UiState>(
    `POST /api/game/${id}/round`,
    `${BASE_URL}/api/game/${id}/round`,
    { method: 'POST' }
  )

export async function deleteGame(id: number): Promise<void> {
  clearStoredGameId()
  await fetch(`${BASE_URL}/api/game/${id}`, { method: 'DELETE' })
}

export async function fetchOrCreateGame(): Promise<UiState> {
  const storedId = getStoredGameId()

  if (storedId !== null) {
    try {
      const state = await getGame(storedId)
      return state
    } catch (err) {
      console.warn(`fetchOrCreateGame: game ${storedId} not found, creating new game:`, err)
      clearStoredGameId()
    }
  }

  const state = await createGame()
  storeGameId(state.gameStateId)
  return state
}

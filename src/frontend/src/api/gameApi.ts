import type { components } from './generated'
import { BASE_URL, fetchJson } from './client'
import { clearStoredGameId, getStoredGameId, storeGameId } from './gameIdStorage'

type UiState = components['schemas']['UiState']
type PlaceBuildingRequest = components['schemas']['PlaceBuildingRequest']

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
      return await getGame(storedId)
    } catch (err) {
      console.warn(`fetchOrCreateGame: game ${storedId} not found, creating new game:`, err)
      clearStoredGameId()
    }
  }

  const state = await createGame()
  storeGameId(state.gameStateId)
  return state
}

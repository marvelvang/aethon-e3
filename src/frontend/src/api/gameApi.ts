import type { components } from './generated'
import { BASE_URL, fetchJson } from './client'
import { appStorage } from '../shared/storage/appStorage'

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
  appStorage.gameId.remove()
  await fetch(`${BASE_URL}/api/game/${id}`, { method: 'DELETE' })
}

export async function fetchOrCreateGame(): Promise<UiState> {
  const storedId = appStorage.gameId.get()

  if (storedId !== null) {
    try {
      return await getGame(storedId)
    } catch (err) {
      console.warn(`fetchOrCreateGame: game ${storedId} not found, creating new game:`, err)
      appStorage.gameId.remove()
    }
  }

  const state = await createGame()
  appStorage.gameId.set(state.gameStateId)
  return state
}

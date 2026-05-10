import type { components } from './generated'

export type BuildingType = components['schemas']['BuildingType']
export type UiState = components['schemas']['UiState']
export type UiBuildingSlot = components['schemas']['UiBuildingSlot']
export type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']
export type PlaceBuildingRequest = components['schemas']['PlaceBuildingRequest']

const BASE_URL = 'https://aethon-e3-backend-production.up.railway.app'

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

export async function fetchOrCreateGame(): Promise<UiState> {
  try {
    return await getGame(1)
  } catch (getErr) {
    console.warn('fetchOrCreateGame: getGame(1) failed, trying createGame:', getErr)
    return createGame()
  }
}

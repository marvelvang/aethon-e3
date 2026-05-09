const BASE_URL = 'https://aethon-e3-backend-production.up.railway.app'

export interface Building {
  x: number
  y: number
  type: string
  isNewlyBuilt: boolean
}

export interface UiState {
  gameStateId: number
  round: number
  population: number
  freePopulation: number
  boundPopulation: number
  consumerGoods: number
  industry: number
  housing: number
  buildings: Building[]
  buildingTypes: Array<{
    type: string
    populationCost: number
    industryCost: number
    canAfford: boolean
  }>
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

export async function fetchOrCreateGame(): Promise<UiState> {
  try {
    return await getGame(1)
  } catch (getErr) {
    console.warn('fetchOrCreateGame: getGame(1) failed, trying createGame:', getErr)
    return createGame()
  }
}

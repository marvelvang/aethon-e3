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

async function throwWithBody(label: string, res: Response): Promise<never> {
  let body = ''
  try { body = await res.text() } catch { /* ignore */ }
  throw new Error(`${label} → ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
}

async function getGame(id: number): Promise<UiState> {
  const res = await fetch(`${BASE_URL}/api/game/${id}`)
  if (!res.ok) await throwWithBody(`GET /api/game/${id}`, res)
  return res.json() as Promise<UiState>
}

async function createGame(): Promise<UiState> {
  const res = await fetch(`${BASE_URL}/api/game`, { method: 'POST' })
  if (!res.ok) await throwWithBody('POST /api/game', res)
  return res.json() as Promise<UiState>
}

export async function fetchOrCreateGame(): Promise<UiState> {
  try {
    return await getGame(1)
  } catch (getErr) {
    console.warn('fetchOrCreateGame: getGame(1) failed, trying createGame:', getErr)
    return createGame()
  }
}

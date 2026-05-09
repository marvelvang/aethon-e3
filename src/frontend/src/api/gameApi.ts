// TODO: Railway external URL eintragen. Interne Railway-URLs (*.railway.internal)
// funktionieren nicht im Browser – hier muss die öffentliche externe URL stehen.
// Beispiel: 'https://your-backend.up.railway.app'
const BASE_URL = ''

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

async function getGame(id: number): Promise<UiState> {
  const res = await fetch(`${BASE_URL}/api/game/${id}`)
  if (!res.ok) throw new Error(`GET /api/game/${id} returned ${res.status}`)
  return res.json() as Promise<UiState>
}

async function createGame(): Promise<UiState> {
  const res = await fetch(`${BASE_URL}/api/game`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /api/game returned ${res.status}`)
  return res.json() as Promise<UiState>
}

export async function fetchOrCreateGame(): Promise<UiState> {
  try {
    return await getGame(1)
  } catch {
    return createGame()
  }
}

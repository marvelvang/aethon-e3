import { useEffect, useState } from 'react'
import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'
import { fetchOrCreateGame } from './api/gameApi'
import type { components } from './api/generated'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type UiState = components['schemas']['UiState']

export default function App() {
  const [buildings, setBuildings] = useState<UiBuildingSlot[]>([])
  const [gameId, setGameId] = useState<number | null>(null)

  useEffect(() => {
    fetchOrCreateGame()
      .then((state) => {
        console.log('Game state loaded:', JSON.stringify(state))
        setGameId(state.gameStateId)
        setBuildings(state.buildings)
      })
      .catch((err) => console.error('Failed to load game state:', err))
  }, [])

  function handleBuildingPlaced(state: UiState) {
    setBuildings(state.buildings)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <IsometricGrid buildings={buildings} gameId={gameId} onBuildingPlaced={handleBuildingPlaced} />
      <DebugConsole />
    </div>
  )
}

import { useEffect, useState } from 'react'
import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'
import ResourceOverlay from './components/ResourceOverlay'
import { fetchOrCreateGame } from './api/gameApi'
import type { components } from './api/generated'

type UiState = components['schemas']['UiState']

export default function App() {
  const [uiState, setUiState] = useState<UiState | null>(null)

  useEffect(() => {
    fetchOrCreateGame()
      .then((state) => {
        console.log('Game state loaded:', JSON.stringify(state))
        setUiState(state)
      })
      .catch((err) => console.error('Failed to load game state:', err))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <IsometricGrid
        buildings={uiState?.buildings ?? []}
        buildingTypes={uiState?.buildingTypes ?? []}
        gameId={uiState ? uiState.gameStateId : null}
        onBuildingPlaced={(state) => setUiState(state)}
      />
      <ResourceOverlay state={uiState} />
      <DebugConsole />
    </div>
  )
}

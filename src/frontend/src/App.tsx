import { useCallback, useEffect, useState } from 'react'
import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'
import ResourceOverlay from './components/ResourceOverlay'
import BuildingInfoPanel from './components/BuildingInfoPanel'
import { fetchOrCreateGame } from './api/gameApi'
import type { components } from './api/generated'

type UiState = components['schemas']['UiState']
type UiBuildingSlot = components['schemas']['UiBuildingSlot']

export default function App() {
  const [uiState, setUiState] = useState<UiState | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<UiBuildingSlot | null>(null)

  useEffect(() => {
    fetchOrCreateGame()
      .then((state) => {
        console.log('Game state loaded:', JSON.stringify(state))
        setUiState(state)
      })
      .catch((err) => console.error('Failed to load game state:', err))
  }, [])

  const handleCellClick = useCallback((building: UiBuildingSlot | null) => {
    setSelectedBuilding(building)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <IsometricGrid
        buildings={uiState?.buildings ?? []}
        buildingTypes={uiState?.buildingTypes ?? []}
        gameId={uiState ? uiState.gameStateId : null}
        onBuildingPlaced={(state) => setUiState(state)}
        onCellClick={handleCellClick}
      />
      <BuildingInfoPanel building={selectedBuilding} />
      <ResourceOverlay state={uiState} />
      <DebugConsole />
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'
import ResourceOverlay from './components/ResourceOverlay'
import { fetchOrCreateGame, endRound } from './api/gameApi'
import type { components } from './api/generated'

type UiState = components['schemas']['UiState']

export default function App() {
  const [uiState, setUiState] = useState<UiState | null>(null)
  const [isEndingRound, setIsEndingRound] = useState(false)

  useEffect(() => {
    fetchOrCreateGame()
      .then((state) => {
        console.log('Game state loaded:', JSON.stringify(state))
        setUiState(state)
      })
      .catch((err) => console.error('Failed to load game state:', err))
  }, [])

  const handleEndRound = useCallback(async () => {
    if (!uiState || isEndingRound) return
    setIsEndingRound(true)
    try {
      const newState = await endRound(Number(uiState.gameStateId))
      setUiState(newState)
    } catch (err) {
      console.error('End round failed:', err)
    } finally {
      setIsEndingRound(false)
    }
  }, [uiState, isEndingRound])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <IsometricGrid
        buildings={uiState?.buildings ?? []}
        gameId={uiState ? Number(uiState.gameStateId) : null}
        onBuildingPlaced={(state) => setUiState(state)}
      />
      <ResourceOverlay state={uiState} />
      <DebugConsole />
      <button
        onClick={handleEndRound}
        disabled={!uiState || isEndingRound}
        title="Runde beenden"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: isEndingRound ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)',
          border: '2px solid rgba(255,255,255,0.35)',
          color: isEndingRound ? 'rgba(255,255,255,0.4)' : '#fff',
          fontSize: 22,
          cursor: uiState && !isEndingRound ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
          transition: 'background 0.15s, color 0.15s',
          lineHeight: 1,
          paddingLeft: 3,
        }}
      >
        ▶
      </button>
    </div>
  )
}

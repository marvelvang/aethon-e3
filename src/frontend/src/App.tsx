import { useCallback, useEffect, useState } from 'react'
import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'
import ResourceOverlay from './components/ResourceOverlay'
import BuildingInfoPanel from './components/BuildingInfoPanel'
import { fetchOrCreateGame, endRound, deleteGame } from './api/gameApi'
import type { components } from './api/generated'

type UiState = components['schemas']['UiState']
type UiBuildingSlot = components['schemas']['UiBuildingSlot']

export default function App() {
  const [uiState, setUiState] = useState<UiState | null>(null)
  const [isEndingRound, setIsEndingRound] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<UiBuildingSlot | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingGame, setIsDeletingGame] = useState(false)

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

  const handleDeleteConfirmed = useCallback(async () => {
    if (!uiState || isDeletingGame) return
    setIsDeletingGame(true)
    try {
      await deleteGame(Number(uiState.gameStateId))
    } catch (err) {
      console.error('Delete game failed:', err)
    }
    window.location.reload()
  }, [uiState, isDeletingGame])

  const handleCellClick = useCallback((building: UiBuildingSlot | null) => {
    setSelectedBuilding(building)
  }, [])

  const roundButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: '50%',
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
    background: isEndingRound ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)',
  }

  const deleteButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 16,
    right: 84,
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '2px solid rgba(255,100,100,0.45)',
    color: !uiState ? 'rgba(255,100,100,0.3)' : 'rgba(255,120,120,0.9)',
    fontSize: 20,
    cursor: uiState ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    backdropFilter: 'blur(4px)',
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
    lineHeight: 1,
    background: 'rgba(255,60,60,0.12)',
  }

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
      <ResourceOverlay state={uiState} onNewGame={() => setShowDeleteConfirm(true)} />
      <DebugConsole bottom={16} right={152} />

      <button
        onClick={() => uiState && setShowDeleteConfirm(true)}
        disabled={!uiState}
        title="Neues Spiel"
        style={deleteButtonStyle}
      >
        ✕
      </button>

      <button
        onClick={handleEndRound}
        disabled={!uiState || isEndingRound}
        title="Runde beenden"
        style={roundButtonStyle}
      >
        ▶
      </button>

      {showDeleteConfirm && (
        <div
          onClick={() => !isDeletingGame && setShowDeleteConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20,20,20,0.88)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              borderRadius: 16,
              padding: '32px 36px',
              maxWidth: 320,
              width: '90vw',
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'inherit',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
              Spiel wirklich löschen?
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 28, lineHeight: 1.5 }}>
              Der aktuelle Spielstand geht unwiderruflich verloren.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingGame}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.08)',
                  color: isDeletingGame ? 'rgba(255,255,255,0.3)' : '#fff',
                  fontSize: 14,
                  cursor: isDeletingGame ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={isDeletingGame}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: '1.5px solid rgba(220,60,60,0.5)',
                  background: isDeletingGame ? 'rgba(180,40,40,0.25)' : 'rgba(200,50,50,0.35)',
                  color: isDeletingGame ? 'rgba(255,120,120,0.4)' : 'rgba(255,140,140,1)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isDeletingGame ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {isDeletingGame ? '…' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

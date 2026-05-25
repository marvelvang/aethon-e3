import { useRef, useState } from 'react'
import type { components } from '../api/generated'
import type { GameController } from './hooks/useGame'
import { useFullscreen } from './hooks/useFullscreen'
import BottomBar from './ui/BottomBar'
import ConfirmDialog from '../shared/ui/ConfirmDialog'
import IsometricGrid, { type IsometricGridHandle } from './grid/IsometricGrid'
import BuildingInfoPanel from './ui/BuildingInfoPanel'
import ResourceOverlay from './ui/ResourceOverlay'
import type { RotationStep } from './grid/coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

interface GameViewProps {
  game: GameController
}

export default function GameView({ game }: GameViewProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<UiBuildingSlot | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [rotation, setRotation] = useState<RotationStep>(0)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const gridRef = useRef<IsometricGridHandle>(null)

  const selectedCell = selectedBuilding
    ? { col: Number(selectedBuilding.x), row: Number(selectedBuilding.y) }
    : null

  return (
    <>
      <IsometricGrid
        ref={gridRef}
        buildings={game.state?.buildings ?? []}
        buildingTypes={game.state?.buildingTypes ?? []}
        gameId={game.state ? Number(game.state.gameStateId) : null}
        onBuildingPlaced={game.setState}
        onCellClick={setSelectedBuilding}
        selectedCell={selectedCell}
        onRotationChanged={setRotation}
      />
      <BuildingInfoPanel
        building={selectedBuilding}
        buildingTypes={game.state?.buildingTypes ?? []}
      />
      <ResourceOverlay state={game.state} />

      <BottomBar
        game={game}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onDeleteGame={() => setShowDeleteConfirm(true)}
        rotation={rotation}
        onRotate={(d) => gridRef.current?.rotate(d)}
        onResetView={() => gridRef.current?.resetView()}
      />

      {showDeleteConfirm && (
        <ConfirmDialog
          icon="⚠️"
          title="Spiel wirklich löschen?"
          message="Der aktuelle Spielstand geht unwiderruflich verloren."
          confirmLabel="Löschen"
          variant="danger"
          isWorking={game.isDeletingGame}
          onConfirm={game.deleteGame}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}

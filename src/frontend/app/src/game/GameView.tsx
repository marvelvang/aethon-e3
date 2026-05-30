import { useRef, useState } from 'react'
import type { UiBuildingSlot } from '@aethon/models'
import type { GameController } from './hooks/useGame'
import { useFullscreen } from './hooks/useFullscreen'
import BottomBar from './ui/BottomBar'
import ConfirmDialog from '../shared/ui/ConfirmDialog'
import IsometricGrid, { type IsometricGridHandle } from './grid/IsometricGrid'
import BuildingInfoPanel from './ui/BuildingInfoPanel'
import ResourceOverlay from './ui/ResourceOverlay'
import type { RotationStep } from './grid/coordinates'

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
    ? { col: selectedBuilding.x, row: selectedBuilding.y }
    : null

  const handleDeleteConfirmed = async () => {
    await game.deleteGame()
    setShowDeleteConfirm(false)
    setSelectedBuilding(null)
  }

  return (
    <>
      <IsometricGrid
        ref={gridRef}
        buildings={game.state?.buildings ?? []}
        buildingTypes={game.state?.buildingTypes ?? []}
        enabled={!!game.state}
        build={game.build}
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
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {game.state?.gameResult === 'Win' && (
        <ConfirmDialog
          icon="🏆"
          title="Sieg!"
          message="Du hast alle Felder bebaut. Beeindruckend!"
          confirmLabel="Neues Spiel"
          hideCancelButton
          isWorking={game.isDeletingGame}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => {}}
        />
      )}

      {game.state?.gameResult === 'Loss' && (
        <ConfirmDialog
          icon="💀"
          title="Niederlage"
          message="Deine Ressourcen sind ins Negative gerutscht. Von hier gibt es kein Zurück."
          confirmLabel="Neues Spiel"
          hideCancelButton
          variant="danger"
          isWorking={game.isDeletingGame}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => {}}
        />
      )}
    </>
  )
}

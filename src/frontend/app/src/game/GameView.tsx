import { useRef, useState } from 'react'
import type { GameResult, UiBuildingSlot } from '@aethon/models'
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

interface ResultDialogConfig {
  icon: string
  title: string
  message: string
  variant?: 'danger'
}

const RESULT_DIALOGS: Record<Exclude<GameResult, 'None'>, ResultDialogConfig> = {
  Win:  { icon: '🏆', title: 'Sieg!',      message: 'Du hast alle Felder bebaut. Beeindruckend!' },
  Loss: { icon: '💀', title: 'Niederlage', message: 'Deine Ressourcen sind ins Negative gerutscht. Von hier gibt es kein Zurück.', variant: 'danger' },
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

  const handleReset = async () => {
    await game.deleteGame()
    setShowDeleteConfirm(false)
    setSelectedBuilding(null)
  }

  const resultConfig = game.state && game.state.gameResult !== 'None'
    ? RESULT_DIALOGS[game.state.gameResult]
    : null

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
          onConfirm={handleReset}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {resultConfig && (
        <ConfirmDialog
          icon={resultConfig.icon}
          title={resultConfig.title}
          message={resultConfig.message}
          variant={resultConfig.variant}
          confirmLabel="Neues Spiel"
          hideCancelButton
          isWorking={game.isDeletingGame}
          onConfirm={handleReset}
          onCancel={() => {}}
        />
      )}
    </>
  )
}

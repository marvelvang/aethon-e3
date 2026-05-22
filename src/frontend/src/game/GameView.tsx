import { useState } from 'react'
import type { components } from '../api/generated'
import type { GameController } from './hooks/useGame'
import ConfirmDialog from '../shared/ui/ConfirmDialog'
import IsometricGrid from './grid/IsometricGrid'
import BuildingInfoPanel from './ui/BuildingInfoPanel'
import DeleteGameButton from './ui/DeleteGameButton'
import ResourceOverlay from './ui/ResourceOverlay'
import RoundButton from './ui/RoundButton'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

interface GameViewProps {
  game: GameController
}

export default function GameView({ game }: GameViewProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<UiBuildingSlot | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedCell = selectedBuilding
    ? { col: Number(selectedBuilding.x), row: Number(selectedBuilding.y) }
    : null

  return (
    <>
      <IsometricGrid
        buildings={game.state?.buildings ?? []}
        buildingTypes={game.state?.buildingTypes ?? []}
        gameId={game.state ? Number(game.state.gameStateId) : null}
        onBuildingPlaced={game.setState}
        onCellClick={setSelectedBuilding}
        selectedCell={selectedCell}
      />
      <BuildingInfoPanel
        building={selectedBuilding}
        buildingTypes={game.state?.buildingTypes ?? []}
      />
      <ResourceOverlay state={game.state} />

      <DeleteGameButton
        disabled={!game.state}
        onClick={() => setShowDeleteConfirm(true)}
      />
      <RoundButton
        round={game.state ? Number(game.state.round) : undefined}
        isWorking={game.isEndingRound}
        disabled={!game.state || game.isEndingRound}
        onClick={game.endRound}
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

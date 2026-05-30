import ActionMenu from './ActionMenu'
import RoundButton from './RoundButton'
import RotationControls from '../grid/RotationControls'
import VersionDisplay from '../../components/VersionDisplay'
import type { GameController } from '../hooks/useGame'
import type { RotationStep } from '../grid/coordinates'
import './BottomBar.css'

interface Props {
  game: GameController
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onDeleteGame: () => void
  rotation: RotationStep
  onRotate: (delta: 1 | -1) => void
  onResetView: () => void
}

export default function BottomBar({
  game,
  isFullscreen,
  onToggleFullscreen,
  onDeleteGame,
  rotation,
  onRotate,
  onResetView,
}: Props) {
  return (
    <div className="bottom-bar">
      <VersionDisplay backendVersion={game.state?.backendVersion} />
      <RotationControls rotation={rotation} onRotate={onRotate} onResetView={onResetView} />
      <div className="bottom-bar-actions">
        <ActionMenu
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          onDeleteGame={onDeleteGame}
        />
        <RoundButton
          round={game.state ? Number(game.state.round) : undefined}
          isWorking={game.isEndingRound}
          disabled={!game.state || game.isEndingRound}
          onClick={game.endRound}
        />
      </div>
    </div>
  )
}

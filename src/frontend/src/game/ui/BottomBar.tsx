import ActionMenu from './ActionMenu'
import RoundButton from './RoundButton'
import VersionDisplay from '../../components/VersionDisplay'
import type { GameController } from '../hooks/useGame'
import './BottomBar.css'

interface Props {
  game: GameController
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onDeleteGame: () => void
}

export default function BottomBar({ game, isFullscreen, onToggleFullscreen, onDeleteGame }: Props) {
  return (
    <div className="bottom-bar">
      <VersionDisplay backendVersion={game.state?.backendVersion} />
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

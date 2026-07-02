import GameView from './game/GameView'
import { useGame } from './game/hooks/useGame'
import PwaUpdate from './shared/ui/PwaUpdate'
import PwaInstall from './shared/ui/PwaInstall'

export default function App() {
  const game = useGame()
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <GameView game={game} />
      <PwaInstall />
      <PwaUpdate />
    </div>
  )
}

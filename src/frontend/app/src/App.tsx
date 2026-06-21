import GameView from './game/GameView'
import { useGame } from './game/hooks/useGame'

export default function App() {
  const game = useGame()
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <GameView game={game} />
    </div>
  )
}

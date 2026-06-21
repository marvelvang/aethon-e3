import { useEffect } from 'react'
import GameView from './game/GameView'
import { useGame } from './game/hooks/useGame'
import { initBuildingImageCache } from './game/ui/buildingImageCache'

export default function App() {
  const game = useGame()

  useEffect(() => { initBuildingImageCache() }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <GameView game={game} />
    </div>
  )
}

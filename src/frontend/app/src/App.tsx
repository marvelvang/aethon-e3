import { useEffect } from 'react'
import GameView from './game/GameView'
import { useGame } from './game/hooks/useGame'
import { BUILDING_META } from './presentation/buildingTypes'

// Warm up the browser image cache so the building picker popup opens instantly.
function preloadBuildingImages() {
  for (const meta of Object.values(BUILDING_META)) {
    const img = new Image()
    img.src = meta.assetPath
  }
}

export default function App() {
  const game = useGame()

  useEffect(() => { preloadBuildingImages() }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <GameView game={game} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'
import { fetchOrCreateGame, type Building } from './api/gameApi'

export default function App() {
  const [buildings, setBuildings] = useState<Building[]>([])

  useEffect(() => {
    fetchOrCreateGame()
      .then((state) => setBuildings(state.buildings))
      .catch((err) => console.error('Failed to load game state:', err))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <IsometricGrid buildings={buildings} />
      <DebugConsole />
    </div>
  )
}

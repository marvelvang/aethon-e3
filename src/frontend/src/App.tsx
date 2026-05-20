import GameView from './game/GameView'
import DebugConsole from './shared/DebugConsole/DebugConsole'
import VersionDisplay from './components/VersionDisplay'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <GameView />
      <DebugConsole bottom={16} right={224} />
      <VersionDisplay />
    </div>
  )
}

import IsometricGrid from './components/IsometricGrid'
import DebugConsole from './components/DebugConsole'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <IsometricGrid />
      <DebugConsole />
    </div>
  )
}

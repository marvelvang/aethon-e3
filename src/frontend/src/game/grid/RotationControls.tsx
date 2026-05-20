import type { RotationStep } from './coordinates'
import './RotationControls.css'

interface Props {
  rotation: RotationStep
  onRotate: (delta: 1 | -1) => void
}

const ROTATION_LABELS = ['N', 'W', 'S', 'E'] as const

export default function RotationControls({ rotation, onRotate }: Props) {
  return (
    <div className="rotation-controls">
      <button onClick={() => onRotate(-1)} className="rotation-btn">↺</button>
      <span className="rotation-label">{ROTATION_LABELS[rotation]}</span>
      <button onClick={() => onRotate(+1)} className="rotation-btn">↻</button>
    </div>
  )
}

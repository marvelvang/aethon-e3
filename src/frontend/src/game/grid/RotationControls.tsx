import type { RotationStep } from './coordinates'
import './RotationControls.css'

interface Props {
  rotation: RotationStep
  onRotate: (delta: 1 | -1) => void
  onResetView: () => void
}

const ROTATION_LABELS = ['N', 'W', 'S', 'E'] as const

function RotateCCWIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" />
    </svg>
  )
}

function RotateCWIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z" />
    </svg>
  )
}

function CompassResetIcon({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <polygon points="12,3 9.5,9 14.5,9" />
      <polygon points="12,21 9.5,15 14.5,15" />
      <polygon points="3,12 9,9.5 9,14.5" />
      <polygon points="21,12 15,9.5 15,14.5" />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="6"
        fontWeight="bold"
        fontFamily="inherit"
      >
        {label}
      </text>
    </svg>
  )
}

export default function RotationControls({ rotation, onRotate, onResetView }: Props) {
  return (
    <div className="rotation-controls">
      <button
        className="rotation-ctrl-btn"
        onClick={() => onRotate(-1)}
        title="Links drehen (Q)"
        aria-label="Ansicht gegen Uhrzeigersinn drehen"
      >
        <RotateCCWIcon />
      </button>
      <button
        className="rotation-ctrl-btn"
        onClick={onResetView}
        title="Ansicht zentrieren & Zoom zurücksetzen (Leertaste)"
        aria-label="Ansicht zentrieren und Zoom zurücksetzen"
      >
        <CompassResetIcon label={ROTATION_LABELS[rotation]} />
      </button>
      <button
        className="rotation-ctrl-btn"
        onClick={() => onRotate(+1)}
        title="Rechts drehen (E)"
        aria-label="Ansicht im Uhrzeigersinn drehen"
      >
        <RotateCWIcon />
      </button>
    </div>
  )
}

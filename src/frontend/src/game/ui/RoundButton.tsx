import Spinner from '../../shared/ui/Spinner'
import './RoundButton.css'

interface Props {
  round: number | undefined
  isWorking: boolean
  disabled: boolean
  onClick: () => void
}

export default function RoundButton({ round, isWorking, disabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Runde beenden"
      className={`round-btn${isWorking ? ' round-btn--working' : ''}`}
    >
      <span className="round-btn-label">
        {isWorking ? <Spinner /> : `Runde ${round ?? '—'}`}
      </span>
      <span className="round-btn-arrow">▶</span>
    </button>
  )
}

import './DeleteGameButton.css'

interface Props {
  disabled: boolean
  onClick: () => void
}

export default function DeleteGameButton({ disabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Neues Spiel"
      className="delete-game-btn"
    >
      ✕
    </button>
  )
}

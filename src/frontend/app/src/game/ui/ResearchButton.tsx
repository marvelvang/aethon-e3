import { useState } from 'react'
import './ResearchButton.css'

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M8 2h8v2h-1v6l6 10.5c.8 1.4-.1 2.5-1.5 2.5H4.5C3.1 23 2.2 21.9 3 20.5L9 10V4H8V2z" />
    </svg>
  )
}

export default function ResearchButton() {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <>
      {isOpen && <div className="research-backdrop" onClick={close} />}

      <div className="research-container">
        {isOpen && (
          <div className="research-modal" onClick={(e) => e.stopPropagation()}>
            <p className="research-modal-placeholder">Hello World</p>
          </div>
        )}

        <button
          className={`research-trigger${isOpen ? ' research-trigger--active' : ''}`}
          onClick={() => setIsOpen((o) => !o)}
          title="Forschung"
        >
          <FlaskIcon />
        </button>
      </div>
    </>
  )
}

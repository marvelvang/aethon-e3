import { useState } from 'react'
import { useConsoleCapture } from '../../shared/DebugConsole/useConsoleCapture'
import DebugConsole from '../../shared/DebugConsole/DebugConsole'
import './ActionMenu.css'

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  )
}

function CompressIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
  )
}

interface Props {
  isFullscreen: boolean
  onToggleFullscreen: () => void
  gameDisabled: boolean
  onDeleteGame: () => void
}

export default function ActionMenu({ isFullscreen, onToggleFullscreen, gameDisabled, onDeleteGame }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const [entries, clear] = useConsoleCapture()
  const errorCount = entries.filter((e) => e.level === 'error').length

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      {isMenuOpen && (
        <div className="action-menu-backdrop" onClick={closeMenu} />
      )}

      <div className="action-menu-container">
        {isMenuOpen && (
          <div className="action-menu-popup">
            <button
              className={`action-menu-item${errorCount > 0 ? ' action-menu-item--error' : ''}`}
              onClick={() => setIsDebugOpen((o) => !o)}
              title="Debug Console"
            >
              {errorCount > 0 ? (
                <>
                  <span className="action-menu-item-icon">⚠</span>
                  <span className="action-menu-item-count">{errorCount}</span>
                </>
              ) : (
                <>
                  <span className="action-menu-item-label">LOG</span>
                  <span className="action-menu-item-count">{entries.length}</span>
                </>
              )}
            </button>

            <button
              className="action-menu-item"
              onClick={() => { onToggleFullscreen(); closeMenu() }}
              title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
            >
              {isFullscreen ? <CompressIcon /> : <ExpandIcon />}
            </button>

            <button
              className="action-menu-item action-menu-item--delete"
              onClick={() => { onDeleteGame(); closeMenu() }}
              disabled={gameDisabled}
              title="Spiel löschen"
            >
              ✕
            </button>
          </div>
        )}

        <button
          className={`action-menu-star${isMenuOpen ? ' action-menu-star--active' : ''}`}
          onClick={() => setIsMenuOpen((o) => !o)}
          title="Aktionen"
        >
          <StarIcon />
          {!isMenuOpen && errorCount > 0 && <span className="action-menu-error-dot" />}
        </button>
      </div>

      <DebugConsole
        open={isDebugOpen}
        entries={entries}
        onClose={() => setIsDebugOpen(false)}
        onClear={clear}
      />
    </>
  )
}

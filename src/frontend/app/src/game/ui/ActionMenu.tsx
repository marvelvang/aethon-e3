import { useState } from 'react'
import { useConsoleCapture } from '../../shared/DebugConsole/useConsoleCapture'
import DebugConsole from '../../shared/DebugConsole/DebugConsole'
import './ActionMenu.css'

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a6.98 6.98 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.47.41l-.36 2.54a7.1 7.1 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.06.26.29.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.1 7.1 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
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
  onDeleteGame: () => void
}

export default function ActionMenu({ isFullscreen, onToggleFullscreen, onDeleteGame }: Props) {
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
              onClick={() => { setIsDebugOpen((o) => !o); closeMenu() }}
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
          <GearIcon />
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

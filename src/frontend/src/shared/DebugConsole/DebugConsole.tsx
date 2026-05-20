import { useEffect, useRef, useState } from 'react'
import { useConsoleCapture, type LogEntry, type LogLevel } from './useConsoleCapture'
import './DebugConsole.css'

const LEVEL_COLOR: Record<LogLevel, string> = {
  log:   '#aaa',
  info:  '#6af',
  debug: '#8f8',
  warn:  '#fa0',
  error: '#f44',
}

interface Props {
  bottom?: number
  right?: number
}

function entryText(e: LogEntry): string {
  return `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}`
}

function copyEntries(entries: LogEntry[]) {
  const text = entries.map(entryText).join('\n')
  navigator.clipboard?.writeText(text).catch(() => {})
}

export default function DebugConsole({ bottom = 20, right = 20 }: Props) {
  const [entries, clear] = useConsoleCapture()
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const errorCount = entries.filter((e) => e.level === 'error').length

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, entries])

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Debug Console"
        className={`debug-toggle${errorCount > 0 ? ' debug-toggle--error' : ''}`}
        style={{ bottom, right }}
      >
        {errorCount > 0 ? (
          <>
            <span className="debug-toggle-icon">⚠</span>
            <span className="debug-toggle-count">{errorCount}</span>
          </>
        ) : (
          <>
            <span className="debug-toggle-label">LOG</span>
            <span className="debug-toggle-count">{entries.length}</span>
          </>
        )}
      </button>

      {open && (
        <div className="debug-panel">
          <div className="debug-toolbar">
            <span className="debug-toolbar-title">Debug Console ({entries.length})</span>
            <button onClick={() => copyEntries(entries)} className="debug-btn">Copy</button>
            <button onClick={clear} className="debug-btn">Clear</button>
            <button onClick={() => setOpen(false)} className="debug-btn debug-btn--close">✕</button>
          </div>

          <div ref={listRef} className="debug-list">
            {entries.length === 0 && (
              <div className="debug-empty">No logs yet.</div>
            )}
            {entries.map((e) => (
              <div key={e.id} className="debug-entry" style={{ color: LEVEL_COLOR[e.level] }}>
                <span className="debug-entry-time">{e.timestamp}</span>
                <span
                  className="debug-entry-level"
                  style={{ color: LEVEL_COLOR[e.level] }}
                >
                  {e.level}
                </span>
                <span className="debug-entry-msg">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

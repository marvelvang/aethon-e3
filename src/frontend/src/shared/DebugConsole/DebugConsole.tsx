import { useRef, useEffect } from 'react'
import type { LogEntry, LogLevel } from './useConsoleCapture'
import './DebugConsole.css'

const LEVEL_COLOR: Record<LogLevel, string> = {
  log:   '#aaa',
  info:  '#6af',
  debug: '#8f8',
  warn:  '#fa0',
  error: '#f44',
}

function entryText(e: LogEntry): string {
  return `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}`
}

function copyEntries(entries: LogEntry[]) {
  const text = entries.map(entryText).join('\n')
  navigator.clipboard?.writeText(text).catch(() => {})
}

interface Props {
  open: boolean
  entries: LogEntry[]
  onClose: () => void
  onClear: () => void
}

export default function DebugConsole({ open, entries, onClose, onClear }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, entries])

  if (!open) return null

  return (
    <div className="debug-panel">
      <div className="debug-toolbar">
        <span className="debug-toolbar-title">Debug Console ({entries.length})</span>
        <button onClick={() => copyEntries(entries)} className="debug-btn">Copy</button>
        <button onClick={onClear} className="debug-btn">Clear</button>
        <button onClick={onClose} className="debug-btn debug-btn--close">✕</button>
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
  )
}

import { useEffect, useRef, useState } from 'react'

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

interface LogEntry {
  id: number
  level: LogLevel
  message: string
  timestamp: string
}

const LEVEL_COLOR: Record<LogLevel, string> = {
  log:   '#aaa',
  info:  '#6af',
  debug: '#8f8',
  warn:  '#fa0',
  error: '#f44',
}

let idSeq = 0

function fmt(args: unknown[]): string {
  return args
    .map(a => {
      if (typeof a === 'string') return a
      if (a instanceof Error) return `${a.name}: ${a.message}${a.stack ? '\n' + a.stack : ''}`
      try { return JSON.stringify(a, null, 2) } catch { return String(a) }
    })
    .join(' ')
}

export default function DebugConsole() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const errorCount = entries.filter(e => e.level === 'error').length

  function push(level: LogLevel, message: string) {
    const now = new Date()
    const timestamp = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}`
    setEntries(prev => [...prev.slice(-499), { id: idSeq++, level, message, timestamp }])
  }

  useEffect(() => {
    const orig = {
      log:   console.log.bind(console),
      warn:  console.warn.bind(console),
      error: console.error.bind(console),
      info:  console.info.bind(console),
      debug: console.debug.bind(console),
    }

    const patch = (level: LogLevel) => (...args: unknown[]) => {
      orig[level](...args)
      push(level, fmt(args))
    }

    console.log   = patch('log')
    console.warn  = patch('warn')
    console.error = patch('error')
    console.info  = patch('info')
    console.debug = patch('debug')

    function onError(e: ErrorEvent) {
      push('error', `${e.message}\n  ${e.filename}:${e.lineno}:${e.colno}`)
    }
    function onUnhandled(e: PromiseRejectionEvent) {
      push('error', `Unhandled promise rejection: ${fmt([e.reason])}`)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)

    return () => {
      Object.assign(console, orig)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [])

  // auto-scroll to bottom when open
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, entries])

  function copyAll() {
    const text = entries.map(e => `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}`).join('\n')
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: errorCount > 0 ? '#c00' : '#222',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: 8,
          padding: '6px 12px',
          fontFamily: 'monospace',
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
          userSelect: 'none',
        }}
      >
        {errorCount > 0
          ? <span style={{ fontWeight: 'bold' }}>ERR {errorCount}</span>
          : <span>LOG {entries.length}</span>}
      </button>

      {/* Console panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70vh',
            background: 'rgba(10,10,10,0.97)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid #444',
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #333', gap: 8, flexShrink: 0 }}>
            <span style={{ color: '#aaa', flex: 1 }}>Debug Console ({entries.length})</span>
            <button onClick={copyAll} style={btnStyle}>Copy</button>
            <button onClick={() => setEntries([])} style={btnStyle}>Clear</button>
            <button onClick={() => setOpen(false)} style={{ ...btnStyle, background: '#500' }}>✕</button>
          </div>

          {/* Log entries */}
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {entries.length === 0 && (
              <div style={{ color: '#555', padding: '12px 10px' }}>No logs yet.</div>
            )}
            {entries.map(e => (
              <div
                key={e.id}
                style={{
                  padding: '3px 10px',
                  borderBottom: '1px solid #1a1a1a',
                  color: LEVEL_COLOR[e.level],
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  wordBreak: 'break-all',
                }}
              >
                <span style={{ color: '#555', flexShrink: 0, fontSize: 11 }}>{e.timestamp}</span>
                <span style={{ flexShrink: 0, fontSize: 10, padding: '1px 4px', borderRadius: 3, background: '#1e1e1e', color: LEVEL_COLOR[e.level], textTransform: 'uppercase', fontWeight: 'bold' }}>{e.level}</span>
                <span style={{ whiteSpace: 'pre-wrap' }}>{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

const btnStyle: React.CSSProperties = {
  background: '#333',
  color: '#ccc',
  border: '1px solid #555',
  borderRadius: 5,
  padding: '3px 10px',
  fontFamily: 'monospace',
  fontSize: 12,
  cursor: 'pointer',
}

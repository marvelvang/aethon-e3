import { useEffect, useState } from 'react'

export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

export interface LogEntry {
  id: number
  level: LogLevel
  message: string
  timestamp: string
}

const MAX_ENTRIES = 500
let idSeq = 0

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'string') return a
      if (a instanceof Error) return `${a.name}: ${a.message}${a.stack ? '\n' + a.stack : ''}`
      try { return JSON.stringify(a, null, 2) } catch { return String(a) }
    })
    .join(' ')
}

function timestamp(): string {
  const now = new Date()
  const pad = (n: number, l = 2) => n.toString().padStart(l, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`
}

export function useConsoleCapture(): [LogEntry[], () => void] {
  const [entries, setEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    const orig = {
      log:   console.log.bind(console),
      warn:  console.warn.bind(console),
      error: console.error.bind(console),
      info:  console.info.bind(console),
      debug: console.debug.bind(console),
    }

    const push = (level: LogLevel, message: string) => {
      setEntries((prev) => [
        ...prev.slice(-(MAX_ENTRIES - 1)),
        { id: idSeq++, level, message, timestamp: timestamp() },
      ])
    }

    const patch = (level: LogLevel) => (...args: unknown[]) => {
      orig[level](...args)
      push(level, formatArgs(args))
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
      push('error', `Unhandled promise rejection: ${formatArgs([e.reason])}`)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)

    return () => {
      Object.assign(console, orig)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [])

  const clear = () => setEntries([])
  return [entries, clear]
}

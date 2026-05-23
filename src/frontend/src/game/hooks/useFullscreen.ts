import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'fullscreen-preference'

function readPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

function savePreference(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    if (readPreference()) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      savePreference(false)
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
      savePreference(true)
    }
  }, [])

  return { isFullscreen, toggle }
}

import { useEffect, useState, useCallback } from 'react'
import { appStorage } from '../../shared/storage/appStorage'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    if (appStorage.fullscreen.get()) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      appStorage.fullscreen.set(false)
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
      appStorage.fullscreen.set(true)
    }
  }, [])

  return { isFullscreen, toggle }
}

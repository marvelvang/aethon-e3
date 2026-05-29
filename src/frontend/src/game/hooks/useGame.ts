import { useCallback, useEffect, useRef, useState } from 'react'
import type { BuildingType, GameState, UiState } from '@aethon/models'
import { genesis, placeBuilding, project, simulateRound } from '@aethon/engine'
import { appStorage } from '../../shared/storage/appStorage'

export interface GameController {
  state: UiState | null
  isEndingRound: boolean
  isDeletingGame: boolean
  build: (x: number, y: number, type: BuildingType) => Promise<UiState>
  endRound: () => Promise<void>
  deleteGame: () => Promise<void>
}

export function useGame(): GameController {
  const gameStateRef = useRef<GameState | null>(null)
  const [uiState, setUiState] = useState<UiState | null>(null)
  const [isEndingRound, setIsEndingRound] = useState(false)
  const [isDeletingGame, setIsDeletingGame] = useState(false)

  useEffect(() => {
    let g = appStorage.gameState.get()
    if (!g) {
      g = genesis()
      appStorage.gameState.set(g)
    }
    gameStateRef.current = g
    setUiState(project(g))
  }, [])

  const build = useCallback(async (x: number, y: number, type: BuildingType): Promise<UiState> => {
    const cur = gameStateRef.current
    if (!cur) throw new Error('Game not loaded')
    const next = placeBuilding(cur, x, y, type)
    gameStateRef.current = next
    appStorage.gameState.set(next)
    const ui = project(next)
    setUiState(ui)
    return ui
  }, [])

  const endRound = useCallback(async () => {
    const cur = gameStateRef.current
    if (!cur || isEndingRound) return
    setIsEndingRound(true)
    try {
      const next = simulateRound(cur)
      gameStateRef.current = next
      appStorage.gameState.set(next)
      setUiState(project(next))
    } catch (err) {
      console.error('End round failed:', err)
    } finally {
      setIsEndingRound(false)
    }
  }, [isEndingRound])

  const deleteGame = useCallback(async () => {
    if (isDeletingGame) return
    setIsDeletingGame(true)
    try {
      const fresh = genesis()
      gameStateRef.current = fresh
      appStorage.gameState.set(fresh)
      setUiState(project(fresh))
    } finally {
      setIsDeletingGame(false)
    }
  }, [isDeletingGame])

  return {
    state: uiState,
    isEndingRound,
    isDeletingGame,
    build,
    endRound,
    deleteGame,
  }
}

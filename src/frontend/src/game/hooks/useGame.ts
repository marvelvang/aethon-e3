import { useCallback, useEffect, useState } from 'react'
import { deleteGame, endRound, fetchOrCreateGame } from '../../api/gameApi'
import type { components } from '../../api/generated'

type UiState = components['schemas']['UiState']

export interface GameController {
  state: UiState | null
  isEndingRound: boolean
  isDeletingGame: boolean
  setState: (state: UiState) => void
  endRound: () => Promise<void>
  deleteGame: () => Promise<void>
}

export function useGame(): GameController {
  const [state, setState] = useState<UiState | null>(null)
  const [isEndingRound, setIsEndingRound] = useState(false)
  const [isDeletingGame, setIsDeletingGame] = useState(false)

  useEffect(() => {
    fetchOrCreateGame()
      .then(setState)
      .catch((err) => console.error('Failed to load game state:', err))
  }, [])

  const handleEndRound = useCallback(async () => {
    if (!state || isEndingRound) return
    setIsEndingRound(true)
    try {
      const newState = await endRound(Number(state.gameStateId))
      setState(newState)
    } catch (err) {
      console.error('End round failed:', err)
    } finally {
      setIsEndingRound(false)
    }
  }, [state, isEndingRound])

  const handleDeleteGame = useCallback(async () => {
    if (!state || isDeletingGame) return
    setIsDeletingGame(true)
    try {
      await deleteGame(Number(state.gameStateId))
    } catch (err) {
      console.error('Delete game failed:', err)
    }
    window.location.reload()
  }, [state, isDeletingGame])

  return {
    state,
    isEndingRound,
    isDeletingGame,
    setState,
    endRound: handleEndRound,
    deleteGame: handleDeleteGame,
  }
}

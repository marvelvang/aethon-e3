import { useCallback, useEffect, useState } from 'react'
import type { BuildingType, UiState } from '@aethon/models'
import { defaultGateway, type GameGateway } from '../gateway'

export interface GameController {
  state: UiState | null
  isEndingRound: boolean
  isDeletingGame: boolean
  build: (x: number, y: number, type: BuildingType) => Promise<UiState>
  endRound: () => Promise<void>
  deleteGame: () => Promise<void>
}

/**
 * Wires a `GameGateway` to React state. The default gateway runs the
 * engine locally; pass a custom one (e.g. a future RemoteGameGateway) to
 * drive the same UI off a remote backend.
 */
export function useGame(gateway: GameGateway = defaultGateway): GameController {
  const [state, setState] = useState<UiState | null>(null)
  const [isEndingRound, setIsEndingRound] = useState(false)
  const [isDeletingGame, setIsDeletingGame] = useState(false)

  useEffect(() => {
    gateway.load()
      .then(setState)
      .catch(err => console.error('Failed to load game state:', err))
  }, [gateway])

  const build = useCallback(async (x: number, y: number, type: BuildingType) => {
    const ui = await gateway.build(x, y, type)
    setState(ui)
    return ui
  }, [gateway])

  const endRound = useCallback(async () => {
    if (isEndingRound) return
    setIsEndingRound(true)
    try {
      setState(await gateway.endRound())
    } catch (err) {
      console.error('End round failed:', err)
    } finally {
      setIsEndingRound(false)
    }
  }, [gateway, isEndingRound])

  const deleteGame = useCallback(async () => {
    if (isDeletingGame) return
    setIsDeletingGame(true)
    try {
      setState(await gateway.reset())
    } catch (err) {
      console.error('Reset game failed:', err)
    } finally {
      setIsDeletingGame(false)
    }
  }, [gateway, isDeletingGame])

  return { state, isEndingRound, isDeletingGame, build, endRound, deleteGame }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { placeBuilding } from '../../api/gameApi'
import type { components } from '../../api/generated'
import type { BuildingType } from '../../domain/buildingTypes'
import BuildingPickerPopup from '../ui/BuildingPickerPopup'
import { GridEngine } from './GridEngine'
import RotationControls from './RotationControls'
import type { RotationStep } from './coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']
type UiState = components['schemas']['UiState']

type PendingPlacement = { cell: { col: number; row: number }; screenX: number; screenY: number } | null

interface Props {
  buildings: UiBuildingSlot[]
  buildingTypes: UiBuildingTypeInfo[]
  gameId: number | null
  onBuildingPlaced: (state: UiState) => void
  onCellClick: (building: UiBuildingSlot | null) => void
  selectedCell?: { col: number; row: number } | null
}

export default function IsometricGrid({
  buildings,
  buildingTypes,
  gameId,
  onBuildingPlaced,
  onCellClick,
  selectedCell,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GridEngine | null>(null)
  const pendingCellsRef = useRef(new Set<string>())

  const buildingsRef = useRef(buildings)
  buildingsRef.current = buildings
  const gameIdRef = useRef(gameId)
  gameIdRef.current = gameId
  const onCellClickRef = useRef(onCellClick)
  onCellClickRef.current = onCellClick
  const onBuildingPlacedRef = useRef(onBuildingPlaced)
  onBuildingPlacedRef.current = onBuildingPlaced

  const [rotation, setRotation] = useState<RotationStep>(0)
  const [pendingPlacement, setPendingPlacement] = useState<PendingPlacement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GridEngine(canvasRef.current, {
      onCellClick: (cell, screenX, screenY) => {
        if (gameIdRef.current === null) return
        if (!cell) { onCellClickRef.current(null); return }
        const existing = buildingsRef.current.find((b) => b.x === cell.col && b.y === cell.row)
        if (existing) {
          onCellClickRef.current(existing)
        } else {
          if (pendingCellsRef.current.has(`${cell.col},${cell.row}`)) return
          onCellClickRef.current(null)
          setPendingPlacement({ cell, screenX, screenY })
        }
      },
      onRotationChanged: setRotation,
    })
    engineRef.current = engine

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setBuildings(buildings)
  }, [buildings])

  useEffect(() => {
    engineRef.current?.setSelectedCell(selectedCell ?? null)
  }, [selectedCell])

  const handleRotate = useCallback((delta: 1 | -1) => {
    const engine = engineRef.current
    if (!engine) return
    const next = ((engine.getRotation() + delta + 4) % 4) as RotationStep
    engine.setRotation(next)
    setRotation(next)
  }, [])

  const buildableTypes = buildingTypes.filter((b) => b.isBuildable)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {pendingPlacement && (
        <BuildingPickerPopup
          buildingTypes={buildableTypes}
          screenX={pendingPlacement.screenX}
          screenY={pendingPlacement.screenY}
          onSelect={async (type: BuildingType) => {
            const id = gameIdRef.current
            if (id === null) { setPendingPlacement(null); return }
            const { col, row } = pendingPlacement.cell
            const cellKey = `${col},${row}`
            pendingCellsRef.current.add(cellKey)
            try {
              const newState = await placeBuilding(id, { x: col, y: row, type })
              onBuildingPlacedRef.current(newState)
            } catch (err) {
              console.error('placeBuilding failed:', err)
            } finally {
              pendingCellsRef.current.delete(cellKey)
              setPendingPlacement(null)
            }
          }}
          onDismiss={() => setPendingPlacement(null)}
        />
      )}
      <RotationControls rotation={rotation} onRotate={handleRotate} />
    </div>
  )
}

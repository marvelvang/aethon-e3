import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { placeBuilding } from '../../api/gameApi'
import type { components } from '../../api/generated'
import type { BuildingType } from '../../domain/buildingTypes'
import BuildingPickerPopup from '../ui/BuildingPickerPopup'
import { GridEngine, type TileBounds } from './GridEngine'
import type { RotationStep } from './coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']
type UiState = components['schemas']['UiState']

type PendingPlacement = { cell: { col: number; row: number }; tileBounds: TileBounds } | null

export interface IsometricGridHandle {
  rotate: (delta: 1 | -1) => void
  resetView: () => void
}

interface Props {
  buildings: UiBuildingSlot[]
  buildingTypes: UiBuildingTypeInfo[]
  gameId: number | null
  onBuildingPlaced: (state: UiState) => void
  onCellClick: (building: UiBuildingSlot | null) => void
  selectedCell?: { col: number; row: number } | null
  onRotationChanged: (rotation: RotationStep) => void
}

const IsometricGrid = forwardRef<IsometricGridHandle, Props>(function IsometricGrid(
  { buildings, buildingTypes, gameId, onBuildingPlaced, onCellClick, selectedCell, onRotationChanged },
  ref,
) {
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
  const onRotationChangedRef = useRef(onRotationChanged)
  onRotationChangedRef.current = onRotationChanged

  const [pendingPlacement, setPendingPlacement] = useState<PendingPlacement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GridEngine(canvasRef.current, {
      onCellClick: (cell, tileBounds) => {
        if (gameIdRef.current === null) return
        if (!cell) { onCellClickRef.current(null); return }
        const existing = buildingsRef.current.find((b) => b.x === cell.col && b.y === cell.row)
        if (existing) {
          onCellClickRef.current(existing)
        } else {
          if (pendingCellsRef.current.has(`${cell.col},${cell.row}`)) return
          onCellClickRef.current(null)
          setPendingPlacement({ cell, tileBounds: tileBounds! })
        }
      },
      onRotationChanged: (r) => onRotationChangedRef.current(r),
      onResetView: () => {
        engineRef.current?.resetCamera()
        engineRef.current?.setRotation(0 as RotationStep)
        onRotationChangedRef.current(0 as RotationStep)
        setPendingPlacement(null)
      },
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
    const cell = pendingPlacement ? pendingPlacement.cell : (selectedCell ?? null)
    engineRef.current?.setSelectedCell(cell)
  }, [pendingPlacement, selectedCell])

  const handleRotate = useCallback((delta: 1 | -1) => {
    const engine = engineRef.current
    if (!engine) return
    const next = ((engine.getRotation() + delta + 4) % 4) as RotationStep
    engine.setRotation(next)
    onRotationChangedRef.current(next)
  }, [])

  const handleResetView = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.resetCamera()
    engine.setRotation(0 as RotationStep)
    onRotationChangedRef.current(0 as RotationStep)
    setPendingPlacement(null)
  }, [])

  useImperativeHandle(ref, () => ({
    rotate: handleRotate,
    resetView: handleResetView,
  }))

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
          tileBounds={pendingPlacement.tileBounds}
          onSelect={async (type: BuildingType) => {
            const id = gameIdRef.current
            if (id === null) { setPendingPlacement(null); return }
            const { col, row } = pendingPlacement.cell
            const cellKey = `${col},${row}`
            pendingCellsRef.current.add(cellKey)
            setPendingPlacement(null)
            try {
              const newState = await placeBuilding(id, { x: col, y: row, type })
              onBuildingPlacedRef.current(newState)
            } catch (err) {
              console.error('placeBuilding failed:', err)
            } finally {
              pendingCellsRef.current.delete(cellKey)
            }
          }}
          onDismiss={() => setPendingPlacement(null)}
        />
      )}
    </div>
  )
})

export default IsometricGrid

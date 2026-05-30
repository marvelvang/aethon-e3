import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { UiBuildingSlot, UiBuildingTypeInfo, UiState } from '@aethon/models'
import type { BuildingType } from '../../domain/buildingTypes'
import BuildingPickerPopup from '../ui/BuildingPickerPopup'
import { GridEngine, type TileBounds } from './GridEngine'
import { getBuildOrder, getCellsInRect, type RotationStep } from './coordinates'

type PendingPlacement = { cell: { col: number; row: number }; tileBounds: TileBounds } | null
type PendingMultiPlacement = {
  cells: { col: number; row: number }[]
  tileBounds: TileBounds
  rotation: RotationStep
} | null

export interface IsometricGridHandle {
  rotate: (delta: 1 | -1) => void
  resetView: () => void
}

interface Props {
  buildings: UiBuildingSlot[]
  buildingTypes: UiBuildingTypeInfo[]
  enabled: boolean
  build: (x: number, y: number, type: BuildingType) => Promise<UiState>
  onCellClick: (building: UiBuildingSlot | null) => void
  selectedCell?: { col: number; row: number } | null
  onRotationChanged: (rotation: RotationStep) => void
}

const IsometricGrid = forwardRef<IsometricGridHandle, Props>(function IsometricGrid(
  { buildings, buildingTypes, enabled, build, onCellClick, selectedCell, onRotationChanged },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GridEngine | null>(null)
  const pendingCellsRef = useRef(new Set<string>())
  const rotationRef = useRef<RotationStep>(0)

  const buildingsRef = useRef(buildings)
  buildingsRef.current = buildings
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const buildRef = useRef(build)
  buildRef.current = build
  const onCellClickRef = useRef(onCellClick)
  onCellClickRef.current = onCellClick
  const onRotationChangedRef = useRef(onRotationChanged)
  onRotationChangedRef.current = onRotationChanged

  const [pendingPlacement, setPendingPlacement] = useState<PendingPlacement>(null)
  const [pendingMulti, setPendingMulti] = useState<PendingMultiPlacement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GridEngine(canvasRef.current, {
      onCellClick: (cell, tileBounds) => {
        if (!enabledRef.current) return
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
      onRotationChanged: (r) => {
        rotationRef.current = r
        onRotationChangedRef.current(r)
        setPendingMulti(null)
      },
      onResetView: () => {
        engineRef.current?.resetCamera()
        engineRef.current?.setRotation(0 as RotationStep)
        rotationRef.current = 0
        onRotationChangedRef.current(0 as RotationStep)
        setPendingPlacement(null)
        setPendingMulti(null)
      },
      onSelectionRect: (start, end, bounds) => {
        if (!enabledRef.current) return
        const allCells = getCellsInRect(start.col, start.row, end.col, end.row)
        const freeCells = allCells.filter(
          (cell) => !buildingsRef.current.some((b) => b.x === cell.col && b.y === cell.row)
            && !pendingCellsRef.current.has(`${cell.col},${cell.row}`)
        )
        if (freeCells.length === 0) return
        const ordered = getBuildOrder(freeCells, rotationRef.current)
        setPendingMulti({ cells: ordered, tileBounds: bounds, rotation: rotationRef.current })
        setPendingPlacement(null)
        onCellClickRef.current(null)
      },
      onSelectionRectCancelled: () => {
        // visual already cleared by GridEngine
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
    if (pendingMulti) {
      engineRef.current?.setSelectedCell(null)
    } else {
      const cell = pendingPlacement ? pendingPlacement.cell : (selectedCell ?? null)
      engineRef.current?.setSelectedCell(cell)
    }
  }, [pendingPlacement, pendingMulti, selectedCell])

  const handleRotate = useCallback((delta: 1 | -1) => {
    const engine = engineRef.current
    if (!engine) return
    const next = ((engine.getRotation() + delta + 4) % 4) as RotationStep
    engine.setRotation(next)
    rotationRef.current = next
    onRotationChangedRef.current(next)
    setPendingMulti(null)
  }, [])

  const handleResetView = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.resetCamera()
    engine.setRotation(0 as RotationStep)
    rotationRef.current = 0
    onRotationChangedRef.current(0 as RotationStep)
    setPendingPlacement(null)
    setPendingMulti(null)
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
      {pendingPlacement && !pendingMulti && (
        <BuildingPickerPopup
          buildingTypes={buildableTypes}
          tileBounds={pendingPlacement.tileBounds}
          onSelect={async (type: BuildingType) => {
            if (!enabledRef.current) { setPendingPlacement(null); return }
            const { col, row } = pendingPlacement.cell
            const cellKey = `${col},${row}`
            pendingCellsRef.current.add(cellKey)
            setPendingPlacement(null)
            try {
              await buildRef.current(col, row, type)
            } catch (err) {
              console.error('placeBuilding failed:', err)
            } finally {
              pendingCellsRef.current.delete(cellKey)
            }
          }}
          onDismiss={() => setPendingPlacement(null)}
        />
      )}
      {pendingMulti && (
        <BuildingPickerPopup
          buildingTypes={buildableTypes}
          tileBounds={pendingMulti.tileBounds}
          onSelect={async (type: BuildingType) => {
            if (!enabledRef.current) { setPendingMulti(null); return }
            const cells = pendingMulti.cells
            setPendingMulti(null)

            for (const cell of cells) {
              pendingCellsRef.current.add(`${cell.col},${cell.row}`)
            }

            let working: UiBuildingSlot[] = buildingsRef.current.slice()
            try {
              for (const cell of cells) {
                if (working.some((b) => b.x === cell.col && b.y === cell.row)) continue
                try {
                  const next = await buildRef.current(cell.col, cell.row, type)
                  working = next.buildings
                } catch {
                  break
                }
              }
            } finally {
              for (const cell of cells) {
                pendingCellsRef.current.delete(`${cell.col},${cell.row}`)
              }
            }
          }}
          onDismiss={() => setPendingMulti(null)}
        />
      )}
    </div>
  )
})

export default IsometricGrid

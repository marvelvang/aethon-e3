import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { UiBuildingSlot, UiBuildingTypeInfo, UiState } from '@aethon/models'
import type { BuildingType } from '../../presentation/buildingTypes'
import BuildingPickerPopup from '../ui/BuildingPickerPopup'
import { GridEngine, type TileBounds } from './GridEngine'
import { getBuildOrder, getCellsInRect, type RotationStep } from './coordinates'

function isCellOccupied(
  buildings: UiBuildingSlot[],
  tileSizes: Map<string, number>,
  col: number,
  row: number,
): boolean {
  return buildings.some(b => {
    const size = tileSizes.get(b.type) ?? 1
    return col >= b.x && col < b.x + size && row >= b.y && row < b.y + size
  })
}

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
  resources: { freePopulation: number; industry: number; energy: number } | null
}

const IsometricGrid = forwardRef<IsometricGridHandle, Props>(function IsometricGrid(
  { buildings, buildingTypes, enabled, build, onCellClick, selectedCell, onRotationChanged, resources },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GridEngine | null>(null)
  const pendingCellsRef = useRef(new Set<string>())
  const rotationRef = useRef<RotationStep>(0)

  const buildingsRef = useRef(buildings)
  buildingsRef.current = buildings
  const buildingTypesRef = useRef(buildingTypes)
  buildingTypesRef.current = buildingTypes
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

  const pendingPlacementRef = useRef(pendingPlacement)
  pendingPlacementRef.current = pendingPlacement
  const pendingMultiRef = useRef(pendingMulti)
  pendingMultiRef.current = pendingMulti

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GridEngine(canvasRef.current, {
      onCellTouchDown: (cell, tileBounds) => {
        if (!enabledRef.current) return
        const tileSizes = new Map(buildingTypesRef.current.map(bt => [bt.type, Math.round(Math.sqrt(bt.tileSize))]))
        if (isCellOccupied(buildingsRef.current, tileSizes, cell.col, cell.row)) return
        if (pendingCellsRef.current.has(`${cell.col},${cell.row}`)) return
        setPendingPlacement({ cell, tileBounds })
      },
      onCellTouchCancelled: () => {
        setPendingPlacement(null)
      },
      onCellClick: (cell, tileBounds) => {
        if (!enabledRef.current) return
        if (!cell) { onCellClickRef.current(null); return }
        const tileSizes = new Map(buildingTypesRef.current.map(bt => [bt.type, Math.round(Math.sqrt(bt.tileSize))]))
        const existing = buildingsRef.current.find((b) => {
          const s = tileSizes.get(b.type) ?? 1
          return cell.col >= b.x && cell.col < b.x + s && cell.row >= b.y && cell.row < b.y + s
        })
        if (existing) {
          onCellClickRef.current(existing)
        } else {
          // Popup already shown via onCellTouchDown; just ensure it stays open
          if (pendingCellsRef.current.has(`${cell.col},${cell.row}`)) return
          onCellClickRef.current(null)
          if (!pendingPlacementRef.current) {
            setPendingPlacement({ cell, tileBounds: tileBounds! })
          }
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
        const tileSizes = new Map(buildingTypesRef.current.map(bt => [bt.type, Math.round(Math.sqrt(bt.tileSize))]))
        const allCells = getCellsInRect(start.col, start.row, end.col, end.row)
        const freeCells = allCells.filter(
          (cell) => !isCellOccupied(buildingsRef.current, tileSizes, cell.col, cell.row)
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

  const handlePickerSelect = useCallback(async (type: BuildingType) => {
    if (!enabledRef.current) { setPendingPlacement(null); setPendingMulti(null); return }
    const multi = pendingMultiRef.current
    const single = pendingPlacementRef.current
    if (multi) {
      const cells = multi.cells
      setPendingMulti(null)
      for (const cell of cells) pendingCellsRef.current.add(`${cell.col},${cell.row}`)
      let working: UiBuildingSlot[] = buildingsRef.current.slice()
      try {
        for (const cell of cells) {
          const tileSizes = new Map(buildingTypesRef.current.map(bt => [bt.type, Math.round(Math.sqrt(bt.tileSize))]))
          if (isCellOccupied(working, tileSizes, cell.col, cell.row)) continue
          try {
            const next = await buildRef.current(cell.col, cell.row, type)
            working = next.buildings
          } catch {
            break
          }
        }
      } finally {
        for (const cell of cells) pendingCellsRef.current.delete(`${cell.col},${cell.row}`)
      }
    } else if (single) {
      const { col, row } = single.cell
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
    }
  }, [])

  const handlePickerDismiss = useCallback(() => {
    setPendingPlacement(null)
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

  const buildableTypes = useMemo(
    () => buildingTypes.filter((b) => b.isBuildable),
    [buildingTypes],
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />
      <BuildingPickerPopup
        buildingTypes={buildableTypes}
        visible={!!pendingPlacement || !!pendingMulti}
        tileBounds={pendingMulti?.tileBounds ?? pendingPlacement?.tileBounds ?? null}
        resources={resources}
        onSelect={handlePickerSelect}
        onDismiss={handlePickerDismiss}
      />
    </div>
  )
})

export default IsometricGrid

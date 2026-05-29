import * as PIXI from 'pixi.js'
import type { components } from '../../api/generated'
import type { BuildingType } from '../../domain/buildingTypes'
import { Camera } from './Camera'
import { GRID_SIZE, screenToGrid, TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'
import { HoverRenderer } from './HoverRenderer'
import { IconLayer } from './IconLayer'
import { InputController } from './InputController'
import { loadBuildingTextures, type BuildingRenderConfig } from './buildingAssets'
import { renderIsometricGrid } from './renderIsometricGrid'
import { SelectionRenderer } from './SelectionRenderer'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

export type TileBounds = { minX: number; maxX: number; minY: number; maxY: number }

export interface GridEngineCallbacks {
  onCellClick: (cell: { col: number; row: number } | null, tileBounds: TileBounds | null) => void
  onRotationChanged: (rot: RotationStep) => void
  onResetView: () => void
  onSelectionRect: (start: { col: number; row: number }, end: { col: number; row: number }, bounds: TileBounds) => void
  onSelectionRectCancelled: () => void
}

export class GridEngine {
  private app: PIXI.Application
  private camera: Camera
  private hover = new HoverRenderer()
  private selection = new SelectionRenderer()
  private iconLayer = new IconLayer()
  private gridContainer: PIXI.Container | null = null

  private rotation: RotationStep = 0
  private buildings: UiBuildingSlot[] = []
  private textures: Map<BuildingType, BuildingRenderConfig> = new Map()
  private selectedCell: { col: number; row: number } | null = null
  private selectionRect: { c1: number; r1: number; c2: number; r2: number } | null = null
  private dragStartCell: { col: number; row: number } | null = null

  private detachInput: () => void = () => {}
  private tickerFn: (delta: number) => void
  private resizeHandler: () => void
  private callbacks: GridEngineCallbacks
  private destroyed = false

  constructor(canvas: HTMLCanvasElement, callbacks: GridEngineCallbacks) {
    this.callbacks = callbacks
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })

    this.camera = new Camera(window.innerWidth, window.innerHeight)
    const gridVisualHeight = (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2
    this.camera.setBoardCenter(
      this.app.screen.width / 2,
      (this.app.screen.height - gridVisualHeight) / 2,
    )

    this.app.stage.addChild(this.iconLayer.container)

    this.tickerFn = (delta) => {
      this.iconLayer.tick(delta, this.camera.state.scale)
    }
    this.app.ticker.add(this.tickerFn)

    const input = new InputController(
      canvas,
      {
        onPan: (x, y) => {
          this.camera.setPosition(x, y)
          this.applyCamera()
        },
        onWheelZoom: (px, py, factor) => {
          this.camera.zoomAt(px, py, factor)
          this.applyCamera()
        },
        onPinch: (factor, midX, midY, startScale, startCamX, startCamY) => {
          this.camera.pinchZoom(factor, midX, midY, startScale, startCamX, startCamY)
          this.applyCamera()
        },
        onRotateView: (delta) => {
          this.clearSelectionRect()
          this.rotation = ((this.rotation + delta + 4) % 4) as RotationStep
          this.callbacks.onRotationChanged(this.rotation)
          this.rebuildGrid()
        },
        onResetView: () => {
          this.callbacks.onResetView()
        },
        onClick: (x, y) => {
          const cell = this.toGridCell(x, y)
          if (!cell) {
            this.callbacks.onCellClick(null, null)
            return
          }
          const top = tileTopVertex(cell.col, cell.row, this.camera.centerX, this.camera.offsetY, this.rotation)
          const { scale, x: camX, y: camY } = this.camera.state
          this.callbacks.onCellClick(cell, {
            minX: (top.x - TILE_HALF_WIDTH) * scale + camX,
            maxX: (top.x + TILE_HALF_WIDTH) * scale + camX,
            minY: top.y * scale + camY,
            maxY: (top.y + TILE_HALF_HEIGHT * 2) * scale + camY,
          })
        },
        onHover: (x, y) => {
          this.hover.update(this.toGridCell(x, y), this.camera.centerX, this.camera.offsetY, this.rotation)
        },
        onHoverEnd: () => {
          this.hover.update(null, this.camera.centerX, this.camera.offsetY, this.rotation)
        },
        onSelectionDragStart: (x, y) => {
          const cell = this.toGridCell(x, y)
          if (!cell) return false
          this.dragStartCell = cell
          this.setSelectionRect(cell.col, cell.row, cell.col, cell.row)
          this.hover.update(null, this.camera.centerX, this.camera.offsetY, this.rotation)
          return true
        },
        onSelectionDragUpdate: (x, y) => {
          if (!this.dragStartCell) return
          const cell = this.toGridCell(x, y) ?? this.dragStartCell
          this.setSelectionRect(this.dragStartCell.col, this.dragStartCell.row, cell.col, cell.row)
        },
        onSelectionDragEnd: (x, y) => {
          if (!this.dragStartCell) return
          const endCell = this.toGridCell(x, y) ?? this.dragStartCell
          const start = this.dragStartCell
          this.dragStartCell = null
          this.clearSelectionRect()
          const bounds = this.computeSelectionBounds(
            Math.min(start.col, endCell.col), Math.min(start.row, endCell.row),
            Math.max(start.col, endCell.col), Math.max(start.row, endCell.row),
          )
          this.callbacks.onSelectionRect(start, endCell, bounds)
        },
        onSelectionDragCancel: () => {
          this.dragStartCell = null
          this.clearSelectionRect()
          this.callbacks.onSelectionRectCancelled()
        },
      },
      () => this.camera.state,
    )
    this.detachInput = input.attach()

    this.resizeHandler = () => this.onResize()
    window.addEventListener('resize', this.resizeHandler)

    loadBuildingTextures().then((textures) => {
      if (this.destroyed) return
      this.textures = textures
      const extraAbove = Math.max(...Array.from(textures.values()).map(cfg => cfg.anchorY * cfg.texture.height * cfg.scale))
      this.camera.setBuildingExtraAbove(extraAbove)
      this.rebuildGrid()
    })
  }

  setBuildings(buildings: UiBuildingSlot[]): void {
    this.buildings = buildings
    if (this.gridContainer) this.rebuildGrid()
  }

  setSelectedCell(cell: { col: number; row: number } | null): void {
    this.selectedCell = cell
    this.updateSelectionRenderer()
  }

  setSelectionRect(c1: number, r1: number, c2: number, r2: number): void {
    this.selectionRect = { c1, r1, c2, r2 }
    this.updateSelectionRenderer()
  }

  clearSelectionRect(): void {
    this.selectionRect = null
    this.updateSelectionRenderer()
  }

  setRotation(rot: RotationStep): void {
    if (this.rotation === rot) return
    this.rotation = rot
    this.rebuildGrid()
  }

  getRotation(): RotationStep {
    return this.rotation
  }

  resetCamera(): void {
    this.camera.resetToMinScale()
    this.applyCamera()
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.app.ticker.remove(this.tickerFn)
    this.detachInput()
    window.removeEventListener('resize', this.resizeHandler)
    this.app.destroy(false, { children: true, texture: true, baseTexture: true })
  }

  private updateSelectionRenderer(): void {
    if (this.selectionRect) {
      const { c1, r1, c2, r2 } = this.selectionRect
      this.selection.updateRect(c1, r1, c2, r2, this.buildings, this.camera.centerX, this.camera.offsetY, this.rotation)
    } else {
      this.selection.update(this.selectedCell, this.buildings, this.camera.centerX, this.camera.offsetY, this.rotation)
    }
  }

  private computeSelectionBounds(minC: number, minR: number, maxC: number, maxR: number): TileBounds {
    const { scale, x: camX, y: camY } = this.camera.state
    let bMinX = Infinity, bMaxX = -Infinity, bMinY = Infinity, bMaxY = -Infinity
    for (let c = minC; c <= maxC; c++) {
      for (let r = minR; r <= maxR; r++) {
        const top = tileTopVertex(c, r, this.camera.centerX, this.camera.offsetY, this.rotation)
        const txMin = (top.x - TILE_HALF_WIDTH) * scale + camX
        const txMax = (top.x + TILE_HALF_WIDTH) * scale + camX
        const tyMin = top.y * scale + camY
        const tyMax = (top.y + TILE_HALF_HEIGHT * 2) * scale + camY
        if (txMin < bMinX) bMinX = txMin
        if (txMax > bMaxX) bMaxX = txMax
        if (tyMin < bMinY) bMinY = tyMin
        if (tyMax > bMaxY) bMaxY = tyMax
      }
    }
    return { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY }
  }

  private toGridCell(x: number, y: number): { col: number; row: number } | null {
    return screenToGrid({
      canvasX: x,
      canvasY: y,
      camera: this.camera.state,
      centerX: this.camera.centerX,
      offsetY: this.camera.offsetY,
      rotation: this.rotation,
    })
  }

  private applyCamera(): void {
    if (!this.gridContainer) return
    this.gridContainer.position.set(this.camera.state.x, this.camera.state.y)
    this.gridContainer.scale.set(this.camera.state.scale)
    this.iconLayer.syncScreenPositions(this.camera.state)
  }

  private rebuildGrid(): void {
    if (this.gridContainer) {
      this.gridContainer.removeChild(this.selection.graphics)
      this.gridContainer.removeChild(this.hover.graphics)
      this.app.stage.removeChild(this.gridContainer)
      this.gridContainer.destroy({ children: true })
    }

    const { container, spriteContainer } = renderIsometricGrid(this.app, this.buildings, this.textures, this.rotation)
    this.gridContainer = container
    this.iconLayer.setSpriteContainer(spriteContainer)

    container.addChild(this.selection.graphics)
    container.addChild(this.hover.graphics)

    this.iconLayer.rebuild(this.buildings, this.rotation, this.camera.centerX, this.camera.offsetY, this.camera.state)
    this.app.stage.addChild(this.iconLayer.container)

    this.hover.update(null, this.camera.centerX, this.camera.offsetY, this.rotation)
    this.updateSelectionRenderer()
    this.applyCamera()
  }

  private onResize(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    this.app.renderer.resize(w, h)
    const gridVisualHeight = (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2
    this.camera.resize(w, h, this.app.screen.width / 2, (this.app.screen.height - gridVisualHeight) / 2)
    this.rebuildGrid()
  }
}

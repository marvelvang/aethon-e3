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
        onDrag: (x, y) => {
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
    this.selection.update(cell, this.buildings, this.camera.centerX, this.camera.offsetY, this.rotation)
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
    this.selection.update(this.selectedCell, this.buildings, this.camera.centerX, this.camera.offsetY, this.rotation)
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

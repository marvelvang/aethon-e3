import * as PIXI from 'pixi.js'
import type { UiBuildingSlot } from '@aethon/models'
import type { BuildingType } from '../../presentation/buildingTypes'
import type { BuildingRenderConfig } from './buildingAssets'
import { GRID_SIZE, TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'
import { addBuildingBaseplateLines } from './renderBaseplateLines'
import { renderCornerSpheres } from './renderCornerSpheres'

const COLOR_TILE_FILL = 0x9c6b3c
const COLOR_TILE_FILL_BUILDING = 0x1a6bc4
const COLOR_TILE_STROKE = 0xe8d5b0
const STROKE_WIDTH = 1

// Amber color for composite building baseplateLines
const COLOR_AMBER = 0xFFC850

export interface IsometricGridResult {
  container: PIXI.Container
  spriteContainer: PIXI.Container
}

interface TileRole {
  building: UiBuildingSlot
  /** dx = col offset within footprint (0 = leftmost), dy = row offset (0 = topmost) */
  dx: number
  dy: number
  size: number
}

export function renderIsometricGrid(
  app: PIXI.Application,
  buildings: UiBuildingSlot[],
  buildingTextures: Map<BuildingType, BuildingRenderConfig>,
  rot: RotationStep = 0
): IsometricGridResult {
  const { width, height } = app.screen
  const centerX = width / 2
  const gridVisualHeight = (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2
  const offsetY = (height - gridVisualHeight) / 2

  // Build occupancy map: tile key → role info
  const roleMap = new Map<string, TileRole>()
  for (const b of buildings) {
    const rc = buildingTextures.get(b.type as BuildingType)
    const size = rc ? Math.round(Math.sqrt(rc.tileSize)) : 1
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        roleMap.set(`${b.x + dx},${b.y + dy}`, { building: b, dx, dy, size })
      }
    }
  }

  const tiles: Array<{ col: number; row: number; topY: number }> = []
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const top = tileTopVertex(col, row, centerX, offsetY, rot)
      tiles.push({ col, row, topY: top.y })
    }
  }
  tiles.sort((a, b) => a.topY - b.topY)

  const container = new PIXI.Container()
  app.stage.addChild(container)

  const graphics = new PIXI.Graphics()
  container.addChild(graphics)

  const spriteContainer = new PIXI.Container()
  container.addChild(spriteContainer)

  for (const { col, row } of tiles) {
    const top = tileTopVertex(col, row, centerX, offsetY, rot)
    const topX = top.x, topY = top.y
    const rightX = top.x + TILE_HALF_WIDTH, rightY = top.y + TILE_HALF_HEIGHT
    const bottomX = top.x, bottomY = top.y + TILE_HALF_HEIGHT * 2
    const leftX = top.x - TILE_HALF_WIDTH, leftY = top.y + TILE_HALF_HEIGHT

    const role = roleMap.get(`${col},${row}`)
    const renderConfig = role ? buildingTextures.get(role.building.type as BuildingType) : undefined

    const fillColor = role !== undefined && renderConfig === undefined
      ? COLOR_TILE_FILL_BUILDING
      : COLOR_TILE_FILL

    graphics.lineStyle(STROKE_WIDTH, COLOR_TILE_STROKE, 1)
    graphics.beginFill(fillColor)
    graphics.drawPolygon([topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY])
    graphics.endFill()

    if (role && renderConfig) {
      const { dx, dy, size } = role
      const isSpriteTile = dx === size - 1 && dy === size - 1
      const isRightColumn = dx === size - 1
      const isBottomRow = dy === size - 1

      if (isSpriteTile) {
        const sprite = new PIXI.Sprite(renderConfig.texture)
        sprite.anchor.set(renderConfig.anchorX, renderConfig.anchorY)
        sprite.scale.set(renderConfig.scale)
        sprite.position.set(topX, topY)
        spriteContainer.addChild(sprite)
      }

      // BaseplateLines added after sprite so they render in front of the building body.
      // For composites: only external faces (right column SE, bottom row SW), amber color.
      if (isRightColumn || isBottomRow) {
        const color = size > 1 ? COLOR_AMBER : 0xffffff
        const thicknessScale = size >= 3 ? 2 : 1
        addBuildingBaseplateLines(spriteContainer, topX, topY, {
          color,
          thicknessScale,
          drawSE: isRightColumn,
          drawSW: isBottomRow,
        })
      }
    }
  }

  renderCornerSpheres(spriteContainer, buildings, buildingTextures, centerX, offsetY, rot)

  return { container, spriteContainer }
}

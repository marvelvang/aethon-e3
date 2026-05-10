import * as PIXI from 'pixi.js'
import type { components } from '../api/generated'
import type { BuildingRenderConfig } from './buildingAssets'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type BuildingType = UiBuildingSlot['type']

export const GRID_SIZE = 10
export const TILE_HALF_WIDTH = 32
export const TILE_HALF_HEIGHT = 16

const COLOR_TILE_FILL = 0x9c6b3c
const COLOR_TILE_FILL_BUILDING = 0x1a6bc4
const COLOR_TILE_STROKE = 0xe8d5b0
const STROKE_WIDTH = 1

export function tileTopVertex(
  col: number,
  row: number,
  centerX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: (col - row) * TILE_HALF_WIDTH + centerX,
    y: (col + row) * TILE_HALF_HEIGHT + offsetY,
  }
}

export function renderIsometricGrid(
  app: PIXI.Application,
  buildings: UiBuildingSlot[],
  buildingTextures: Map<BuildingType, BuildingRenderConfig>
): PIXI.Container {
  const { width, height } = app.screen

  const centerX = width / 2
  const gridVisualHeight =
    (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2
  const offsetY = (height - gridVisualHeight) / 2

  const buildingTypeMap = new Map<string, BuildingType>(
    buildings.map((b) => [`${b.x},${b.y}`, b.type])
  )

  const container = new PIXI.Container()
  app.stage.addChild(container)

  const graphics = new PIXI.Graphics()
  container.addChild(graphics)

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const top = tileTopVertex(col, row, centerX, offsetY)

      const topX = top.x
      const topY = top.y
      const rightX = top.x + TILE_HALF_WIDTH
      const rightY = top.y + TILE_HALF_HEIGHT
      const bottomX = top.x
      const bottomY = top.y + TILE_HALF_HEIGHT * 2
      const leftX = top.x - TILE_HALF_WIDTH
      const leftY = top.y + TILE_HALF_HEIGHT

      const buildingType = buildingTypeMap.get(`${col},${row}`)
      const renderConfig = buildingType !== undefined
        ? buildingTextures.get(buildingType)
        : undefined

      // Use blue fallback for building types that have no asset yet
      const fillColor = buildingType !== undefined && renderConfig === undefined
        ? COLOR_TILE_FILL_BUILDING
        : COLOR_TILE_FILL

      graphics.lineStyle(STROKE_WIDTH, COLOR_TILE_STROKE, 1)
      graphics.beginFill(fillColor)
      graphics.drawPolygon([topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY])
      graphics.endFill()

      if (renderConfig) {
        const sprite = new PIXI.Sprite(renderConfig.texture)
        sprite.anchor.set(renderConfig.anchorX, renderConfig.anchorY)
        sprite.scale.set(renderConfig.scale)
        sprite.position.set(topX, topY)
        container.addChild(sprite)
      }
    }
  }

  return container
}

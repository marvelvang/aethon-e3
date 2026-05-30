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

export interface IsometricGridResult {
  container: PIXI.Container
  spriteContainer: PIXI.Container
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

  const buildingTypeMap = new Map<string, BuildingType>(
    buildings.map((b) => [`${b.x},${b.y}`, b.type])
  )

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

    const buildingType = buildingTypeMap.get(`${col},${row}`)
    const renderConfig = buildingType !== undefined
      ? buildingTextures.get(buildingType)
      : undefined

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
      spriteContainer.addChild(sprite)
      // Baseplate lines after the sprite so they sit in front of the same
      // building's body, but before the next (closer) tile's sprite so that
      // buildings in front correctly occlude them.
      addBuildingBaseplateLines(spriteContainer, topX, topY)
    }
  }

  renderCornerSpheres(spriteContainer, buildings, centerX, offsetY, rot)

  return { container, spriteContainer }
}

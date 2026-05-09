import * as PIXI from 'pixi.js'

const GRID_SIZE = 10
const TILE_HALF_WIDTH = 32
const TILE_HALF_HEIGHT = 16

const COLOR_TILE_FILL = 0x9c6b3c
const COLOR_TILE_STROKE = 0xe8d5b0
const STROKE_WIDTH = 1

function tileTopVertex(
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

export function renderIsometricGrid(app: PIXI.Application): PIXI.Container {
  const { width, height } = app.screen

  const centerX = width / 2
  const gridVisualHeight =
    (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2
  const offsetY = (height - gridVisualHeight) / 2

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

      graphics.lineStyle(STROKE_WIDTH, COLOR_TILE_STROKE, 1)
      graphics.beginFill(COLOR_TILE_FILL)
      graphics.drawPolygon([topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY])
      graphics.endFill()
    }
  }

  return container
}

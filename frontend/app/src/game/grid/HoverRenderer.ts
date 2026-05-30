import * as PIXI from 'pixi.js'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'

export class HoverRenderer {
  readonly graphics = new PIXI.Graphics()

  update(cell: { col: number; row: number } | null, centerX: number, offsetY: number, rot: RotationStep): void {
    const g = this.graphics
    g.clear()
    if (!cell) return
    const top = tileTopVertex(cell.col, cell.row, centerX, offsetY, rot)
    g.lineStyle(2, 0xffffff, 1)
    g.beginFill(0, 0)
    g.drawPolygon([
      top.x, top.y,
      top.x + TILE_HALF_WIDTH, top.y + TILE_HALF_HEIGHT,
      top.x, top.y + TILE_HALF_HEIGHT * 2,
      top.x - TILE_HALF_WIDTH, top.y + TILE_HALF_HEIGHT,
    ])
    g.endFill()
  }
}

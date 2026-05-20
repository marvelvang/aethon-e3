import * as PIXI from 'pixi.js'
import type { components } from '../../api/generated'
import { frontNeighbors, TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

function drawDashedLine(
  g: PIXI.Graphics,
  x1: number, y1: number,
  x2: number, y2: number,
  dashLen = 5,
  gapLen = 4
): void {
  const dx = x2 - x1
  const dy = y2 - y1
  const totalLen = Math.sqrt(dx * dx + dy * dy)
  if (totalLen === 0) return
  const ux = dx / totalLen
  const uy = dy / totalLen
  let pos = 0
  let drawing = true
  while (pos < totalLen) {
    const segLen = Math.min(drawing ? dashLen : gapLen, totalLen - pos)
    if (drawing) {
      g.moveTo(x1 + ux * pos, y1 + uy * pos)
      g.lineTo(x1 + ux * (pos + segLen), y1 + uy * (pos + segLen))
    }
    pos += segLen
    drawing = !drawing
  }
}

export class SelectionRenderer {
  readonly graphics = new PIXI.Graphics()

  update(
    cell: { col: number; row: number } | null,
    buildings: UiBuildingSlot[],
    centerX: number,
    offsetY: number,
    rot: RotationStep,
  ): void {
    const g = this.graphics
    g.clear()
    if (!cell) return

    const top = tileTopVertex(cell.col, cell.row, centerX, offsetY, rot)
    const topX = top.x, topY = top.y
    const rightX = top.x + TILE_HALF_WIDTH, rightY = top.y + TILE_HALF_HEIGHT
    const bottomX = top.x, bottomY = top.y + TILE_HALF_HEIGHT * 2
    const leftX = top.x - TILE_HALF_WIDTH, leftY = top.y + TILE_HALF_HEIGHT

    g.lineStyle(0)
    g.beginFill(0xffffff, 0.08)
    g.drawPolygon([topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY])
    g.endFill()

    const { right: nr, left: nl } = frontNeighbors(cell.col, cell.row, rot)
    const hasBuilding = (c: number, r: number) =>
      buildings.some((b) => b.x === c && b.y === r)

    g.lineStyle(2, 0xffffff, 1)

    drawDashedLine(g, topX, topY, rightX, rightY)
    drawDashedLine(g, topX, topY, leftX, leftY)

    if (hasBuilding(nr.col, nr.row)) {
      drawDashedLine(g, rightX, rightY, bottomX, bottomY)
    } else {
      g.moveTo(rightX, rightY)
      g.lineTo(bottomX, bottomY)
    }
    if (hasBuilding(nl.col, nl.row)) {
      drawDashedLine(g, leftX, leftY, bottomX, bottomY)
    } else {
      g.moveTo(leftX, leftY)
      g.lineTo(bottomX, bottomY)
    }
  }
}

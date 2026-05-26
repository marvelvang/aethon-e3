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
    if (!cell) { this.graphics.clear(); return }
    this.updateRect(cell.col, cell.row, cell.col, cell.row, buildings, centerX, offsetY, rot)
  }

  updateRect(
    c1: number, r1: number,
    c2: number, r2: number,
    buildings: UiBuildingSlot[],
    centerX: number,
    offsetY: number,
    rot: RotationStep,
  ): void {
    const g = this.graphics
    g.clear()

    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2)
    const minR = Math.min(r1, r2), maxR = Math.max(r1, r2)
    const W = TILE_HALF_WIDTH, H = TILE_HALF_HEIGHT

    const inSel = (col: number, row: number) =>
      col >= minC && col <= maxC && row >= minR && row <= maxR
    const hasBuilding = (col: number, row: number) =>
      buildings.some((b) => b.x === col && b.y === row)

    // Fill all cells in selection
    g.lineStyle(0)
    g.beginFill(0xffffff, 0.08)
    for (let c = minC; c <= maxC; c++) {
      for (let r = minR; r <= maxR; r++) {
        const top = tileTopVertex(c, r, centerX, offsetY, rot)
        g.drawPolygon([top.x, top.y, top.x + W, top.y + H, top.x, top.y + 2 * H, top.x - W, top.y + H])
      }
    }
    g.endFill()

    // Draw outer boundary edges
    g.lineStyle(2, 0xffffff, 1)
    for (let c = minC; c <= maxC; c++) {
      for (let r = minR; r <= maxR; r++) {
        const top = tileTopVertex(c, r, centerX, offsetY, rot)
        const tX = top.x, tY = top.y
        const rX = tX + W, rY = tY + H
        const bX = tX, bY = tY + 2 * H
        const lX = tX - W, lY = tY + H

        const { right: fr, left: fl } = frontNeighbors(c, r, rot)
        // NE adjacent = back-left (opposite of front-left)
        const neAdj = { col: 2 * c - fl.col, row: 2 * r - fl.row }
        // NW adjacent = back-right (opposite of front-right)
        const nwAdj = { col: 2 * c - fr.col, row: 2 * r - fr.row }

        // NE face (top→right): always dashed, only if on outer boundary
        if (!inSel(neAdj.col, neAdj.row)) {
          drawDashedLine(g, tX, tY, rX, rY)
        }

        // NW face (top→left): always dashed, only if on outer boundary
        if (!inSel(nwAdj.col, nwAdj.row)) {
          drawDashedLine(g, tX, tY, lX, lY)
        }

        // SE face (right→bottom): conditional on front-right neighbor
        if (!inSel(fr.col, fr.row)) {
          if (hasBuilding(fr.col, fr.row)) {
            drawDashedLine(g, rX, rY, bX, bY)
          } else {
            g.moveTo(rX, rY)
            g.lineTo(bX, bY)
          }
        }

        // SW face (left→bottom): conditional on front-left neighbor
        if (!inSel(fl.col, fl.row)) {
          if (hasBuilding(fl.col, fl.row)) {
            drawDashedLine(g, lX, lY, bX, bY)
          } else {
            g.moveTo(lX, lY)
            g.lineTo(bX, bY)
          }
        }
      }
    }
  }
}

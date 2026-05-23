import * as PIXI from 'pixi.js'
import type { components } from '../../api/generated'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

// Baseplate face geometry at display scale (relative to tile-top vertex).
// Top face corners:   East(TW, 10)  West(-TW, 10)  South(0, 26)
// Bottom face corners: East(TW, TH)  West(-TW, TH)  South(0, 2·TH)
// Mid-line: average of top and bottom edge at each corner
const MID_Y_EW = (10 + TILE_HALF_HEIGHT) / 2   // = 13  (east / west ends)
const MID_Y_S  = (26 + 2 * TILE_HALF_HEIGHT) / 2  // = 29  (south end)

function drawEnergyLine(
  g: PIXI.Graphics,
  x1: number, y1: number,
  x2: number, y2: number,
): void {
  g.lineStyle(1, 0xffffff, 1.0)
  g.moveTo(x1, y1); g.lineTo(x2, y2)
}

export function renderBaseplateLines(
  parent: PIXI.Container,
  buildings: UiBuildingSlot[],
  centerX: number,
  offsetY: number,
  rot: RotationStep,
): void {
  if (buildings.length === 0) return

  const g = new PIXI.Graphics()
  const TW = TILE_HALF_WIDTH

  for (const b of buildings) {
    const { x: tx, y: ty } = tileTopVertex(Number(b.x), Number(b.y), centerX, offsetY, rot)

    // Right face (SE): east corner → south corner
    drawEnergyLine(g, tx + TW, ty + MID_Y_EW, tx, ty + MID_Y_S)

    // Left face (SW): west corner → south corner
    drawEnergyLine(g, tx - TW, ty + MID_Y_EW, tx, ty + MID_Y_S)
  }

  parent.addChild(g)
}

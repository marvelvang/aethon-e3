import * as PIXI from 'pixi.js'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH } from './coordinates'

// Baseplate face geometry at display scale (relative to tile-top vertex).
// Top face corners:   East(TW, 10)  West(-TW, 10)  South(0, 26)
// Bottom face corners: East(TW, TH)  West(-TW, TH)  South(0, 2·TH)
// Mid-line: average of top and bottom edge at each corner
export const MID_Y_EW = (10 + TILE_HALF_HEIGHT) / 2   // = 13  (east / west ends)
export const MID_Y_S  = (26 + 2 * TILE_HALF_HEIGHT) / 2  // = 29  (south end)

const TW = TILE_HALF_WIDTH
const DY = MID_Y_S - MID_Y_EW  // vertical span of each face line = 16

// Vertical half-extent at each endpoint so the line polygon has clean vertical
// cuts instead of the diagonal (rhombus-shaped) cap that lineTo produces.
// Derived from: 0.5 * lineLength / horizontalSpan
const VHALF_BASE = 0.5 * Math.sqrt(TW * TW + DY * DY) / TW  // ≈ 0.559

export interface BaseplateLineOptions {
  color?: number
  thicknessScale?: number
  drawSE?: boolean
  drawSW?: boolean
}

// Draws visible front-face baseplate lines for one tile and adds them to the
// given container. Options allow composite buildings to draw only the external
// faces in a custom color / thickness.
export function addBuildingBaseplateLines(
  parent: PIXI.Container,
  tx: number,
  ty: number,
  options: BaseplateLineOptions = {},
): void {
  const {
    color = 0xffffff,
    thicknessScale = 1,
    drawSE = true,
    drawSW = true,
  } = options

  if (!drawSE && !drawSW) return

  const vhalf = VHALF_BASE * thicknessScale
  const g = new PIXI.Graphics()
  g.lineStyle(0)

  const ey = ty + MID_Y_EW  // y at east / west endpoints
  const sy = ty + MID_Y_S   // y at south endpoint

  if (drawSE) {
    // Right face (SE): east corner → south corner
    g.beginFill(color, 1.0)
    g.drawPolygon([
      tx + TW, ey - vhalf,  // top at East
      tx,      sy - vhalf,  // top at South
      tx,      sy + vhalf,  // bottom at South
      tx + TW, ey + vhalf,  // bottom at East
    ])
    g.endFill()
  }

  if (drawSW) {
    // Left face (SW): west corner → south corner
    g.beginFill(color, 1.0)
    g.drawPolygon([
      tx - TW, ey - vhalf,  // top at West
      tx,      sy - vhalf,  // top at South
      tx,      sy + vhalf,  // bottom at South
      tx - TW, ey + vhalf,  // bottom at West
    ])
    g.endFill()
  }

  parent.addChild(g)
}

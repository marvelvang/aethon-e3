import * as PIXI from 'pixi.js'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH } from './coordinates'

// Baseplate face geometry at display scale (relative to tile-top vertex).
// Top face corners:   East(TW, 10)  West(-TW, 10)  South(0, 26)
// Bottom face corners: East(TW, TH)  West(-TW, TH)  South(0, 2·TH)
// Mid-line: average of top and bottom edge at each corner
const MID_Y_EW = (10 + TILE_HALF_HEIGHT) / 2   // = 13  (east / west ends)
const MID_Y_S  = (26 + 2 * TILE_HALF_HEIGHT) / 2  // = 29  (south end)

const TW = TILE_HALF_WIDTH
const DY = MID_Y_S - MID_Y_EW  // vertical span of each face line = 16

// Vertical half-extent at each endpoint so the line polygon has clean vertical
// cuts instead of the diagonal (rhombus-shaped) cap that lineTo produces.
// Derived from: 0.5 * lineLength / horizontalSpan
const VHALF = 0.5 * Math.sqrt(TW * TW + DY * DY) / TW  // ≈ 0.559

// Draws the two visible front-face baseplate lines for one tile and adds them
// to the given container. Must be called in painter's order (after the tile's
// own sprite, before any sprite that is in front of this tile) so that
// buildings in front correctly occlude these lines.
//
// Each line is rendered as a filled polygon with vertical endpoint cuts so that
// adjacent buildings' lines connect seamlessly without overlapping caps.
export function addBuildingBaseplateLines(
  parent: PIXI.Container,
  tx: number,
  ty: number,
): void {
  const g = new PIXI.Graphics()
  g.lineStyle(0)

  const ey = ty + MID_Y_EW  // y at east / west endpoints
  const sy = ty + MID_Y_S   // y at south endpoint

  // Right face (SE): east corner → south corner
  g.beginFill(0xffffff, 1.0)
  g.drawPolygon([
    tx + TW, ey - VHALF,  // top at East
    tx,      sy - VHALF,  // top at South
    tx,      sy + VHALF,  // bottom at South
    tx + TW, ey + VHALF,  // bottom at East
  ])
  g.endFill()

  // Left face (SW): west corner → south corner
  g.beginFill(0xffffff, 1.0)
  g.drawPolygon([
    tx - TW, ey - VHALF,  // top at West
    tx,      sy - VHALF,  // top at South
    tx,      sy + VHALF,  // bottom at South
    tx - TW, ey + VHALF,  // bottom at West
  ])
  g.endFill()

  parent.addChild(g)
}

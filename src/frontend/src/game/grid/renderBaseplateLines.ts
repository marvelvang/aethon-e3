import * as PIXI from 'pixi.js'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH } from './coordinates'

// Baseplate face geometry at display scale (relative to tile-top vertex).
// Top face corners:   East(TW, 10)  West(-TW, 10)  South(0, 26)
// Bottom face corners: East(TW, TH)  West(-TW, TH)  South(0, 2·TH)
// Mid-line: average of top and bottom edge at each corner
const MID_Y_EW = (10 + TILE_HALF_HEIGHT) / 2   // = 13  (east / west ends)
const MID_Y_S  = (26 + 2 * TILE_HALF_HEIGHT) / 2  // = 29  (south end)

// Draws the two visible front-face baseplate lines for one tile and adds them
// to the given container. Must be called in painter's order (after the tile's
// own sprite, before any sprite that is in front of this tile) so that
// buildings in front correctly occlude these lines.
export function addBuildingBaseplateLines(
  parent: PIXI.Container,
  tx: number,
  ty: number,
): void {
  const g = new PIXI.Graphics()
  const TW = TILE_HALF_WIDTH
  g.lineStyle(1, 0xffffff, 1.0)
  // Right face (SE): east corner → south corner
  g.moveTo(tx + TW, ty + MID_Y_EW); g.lineTo(tx, ty + MID_Y_S)
  // Left face (SW): west corner → south corner
  g.moveTo(tx - TW, ty + MID_Y_EW); g.lineTo(tx, ty + MID_Y_S)
  parent.addChild(g)
}

import * as PIXI from 'pixi.js'
import type { components } from '../../api/generated'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

// Screen-space offsets of the 3 visible baseplate-top corners,
// relative to the tile-top vertex (sprite anchor).
// SVG corners are at (±128, 40) and (0, 104) at 4× scale, displayed at 0.25.
const SPHERE_OFFSETS = {
  east:  { x:  TILE_HALF_WIDTH, y:  10 },
  west:  { x: -TILE_HALF_WIDTH, y:  10 },
  south: { x: 0,                y:  26 },
} as const

const ACTIVE_ALPHA = 1
const PASSIVE_ALPHA = 0.32

function drawSphere(g: PIXI.Graphics, cx: number, cy: number, active: boolean): void {
  const a = active ? ACTIVE_ALPHA : PASSIVE_ALPHA
  // Outer halo
  g.beginFill(0xffffff, 0.16 * a)
  g.drawCircle(cx, cy, 4.2)
  g.endFill()
  // Mid glow
  g.beginFill(0xffffff, 0.42 * a)
  g.drawCircle(cx, cy, 2.6)
  g.endFill()
  // Bright core
  g.beginFill(0xffffff, a)
  g.drawCircle(cx, cy, 1.6)
  g.endFill()
}

function tk(x: number, y: number): string {
  return `${Math.round(x)},${Math.round(y)}`
}

export function renderCornerSpheres(
  parent: PIXI.Container,
  buildings: UiBuildingSlot[],
  centerX: number,
  offsetY: number,
  rot: RotationStep,
): void {
  if (buildings.length === 0) return

  // Index buildings by their screen tile-top vertex.
  const occupied = new Set<string>()
  for (const b of buildings) {
    const t = tileTopVertex(Number(b.x), Number(b.y), centerX, offsetY, rot)
    occupied.add(tk(t.x, t.y))
  }

  const TW = TILE_HALF_WIDTH
  const TH = TILE_HALF_HEIGHT

  // Returns true if any other building shares the corner described
  // by these three candidate neighbour top-vertices (in screen space).
  const isConnected = (n1x: number, n1y: number, n2x: number, n2y: number, n3x: number, n3y: number): boolean =>
    occupied.has(tk(n1x, n1y)) || occupied.has(tk(n2x, n2y)) || occupied.has(tk(n3x, n3y))

  // gBack renders below all building sprites (index 0 in spriteContainer).
  // gFront renders above all building sprites (appended last).
  // A sphere goes into gBack when the tile directly below it in rendering order
  // (i.e. the tile whose top vertex coincides with the corner position) has a building,
  // because that building's sprite will visually cover the corner. Otherwise gFront.
  const gBack = new PIXI.Graphics()
  const gFront = new PIXI.Graphics()

  for (const b of buildings) {
    const t = tileTopVertex(Number(b.x), Number(b.y), centerX, offsetY, rot)
    const tx = t.x
    const ty = t.y

    // East screen corner (tx+TW, ty+TH) – shared with screen-E, screen-NE, screen-SE neighbours.
    // The tile whose top vertex is at (tx+TW, ty+TH) renders after this tile (higher Y)
    // and visually covers the east corner if it has a building.
    const eastActive = isConnected(
      tx + 2 * TW, ty,         // screen-E neighbour (its W corner)
      tx + TW,     ty - TH,    // screen-NE neighbour (its S corner)
      tx + TW,     ty + TH,    // screen-SE neighbour (its N corner)
    )
    const eastLayer = occupied.has(tk(tx + TW, ty + TH)) ? gBack : gFront
    drawSphere(eastLayer, tx + SPHERE_OFFSETS.east.x, ty + SPHERE_OFFSETS.east.y, eastActive)

    // West screen corner (tx-TW, ty+TH) – shared with screen-W, screen-NW, screen-SW neighbours.
    // The tile at (tx-TW, ty+TH) renders after this tile and covers the west corner if occupied.
    const westActive = isConnected(
      tx - 2 * TW, ty,         // screen-W neighbour (its E corner)
      tx - TW,     ty - TH,    // screen-NW neighbour (its S corner)
      tx - TW,     ty + TH,    // screen-SW neighbour (its N corner)
    )
    const westLayer = occupied.has(tk(tx - TW, ty + TH)) ? gBack : gFront
    drawSphere(westLayer, tx + SPHERE_OFFSETS.west.x, ty + SPHERE_OFFSETS.west.y, westActive)

    // South screen corner (tx, ty+2*TH) – shared with screen-S, screen-SE, screen-SW neighbours.
    // The tile at (tx, ty+2*TH) renders last of all three and covers the south corner if occupied.
    const southActive = isConnected(
      tx,          ty + 2 * TH, // screen-S neighbour (its N corner)
      tx + TW,     ty + TH,     // screen-SE neighbour (its W corner)
      tx - TW,     ty + TH,     // screen-SW neighbour (its E corner)
    )
    const southLayer = occupied.has(tk(tx, ty + 2 * TH)) ? gBack : gFront
    drawSphere(southLayer, tx + SPHERE_OFFSETS.south.x, ty + SPHERE_OFFSETS.south.y, southActive)
  }

  parent.addChildAt(gBack, 0)
  parent.addChild(gFront)
}

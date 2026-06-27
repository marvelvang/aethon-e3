import * as PIXI from 'pixi.js'
import type { UiBuildingSlot } from '@aethon/models'
import { TILE_HALF_HEIGHT, TILE_HALF_WIDTH, tileTopVertex, type RotationStep } from './coordinates'
import { MID_Y_EW, MID_Y_S } from './renderBaseplateLines'
import type { BuildingType } from '../../presentation/buildingTypes'
import type { BuildingRenderConfig } from './buildingAssets'

// Screen-space offsets of the 3 visible baseplate corner spheres,
// relative to the tile-top vertex. Centered on the baseplate side-face
// midline so spheres sit flush on the white connecting lines.
const SPHERE_OFFSETS = {
  east:  { x:  TILE_HALF_WIDTH, y: MID_Y_EW },
  west:  { x: -TILE_HALF_WIDTH, y: MID_Y_EW },
  south: { x: 0,                y: MID_Y_S  },
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
  buildingTextures: Map<BuildingType, BuildingRenderConfig>,
  centerX: number,
  offsetY: number,
  rot: RotationStep,
): void {
  if (buildings.length === 0) return

  // Build occupied set of all tile top-vertex screen positions (for adjacency checks)
  const occupied = new Set<string>()
  for (const b of buildings) {
    const rc = buildingTextures.get(b.type as BuildingType)
    const size = rc ? Math.round(Math.sqrt(rc.tileSize)) : 1
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        const t = tileTopVertex(b.x + dx, b.y + dy, centerX, offsetY, rot)
        occupied.add(tk(t.x, t.y))
      }
    }
  }

  const TW = TILE_HALF_WIDTH
  const TH = TILE_HALF_HEIGHT

  const isConnected = (n1x: number, n1y: number, n2x: number, n2y: number, n3x: number, n3y: number): boolean =>
    occupied.has(tk(n1x, n1y)) || occupied.has(tk(n2x, n2y)) || occupied.has(tk(n3x, n3y))

  const gBack = new PIXI.Graphics()
  const gFront = new PIXI.Graphics()

  // Collect sphere positions to deduplicate
  const rendered = new Set<string>()

  function addCompositeCornerSphere(sx: number, sy: number): void {
    const key = tk(sx, sy)
    if (rendered.has(key)) return
    rendered.add(key)
    // Composite corner spheres always render in front (they sit on external edges)
    drawSphere(gFront, sx, sy, true)
  }

  for (const b of buildings) {
    const rc = buildingTextures.get(b.type as BuildingType)
    const size = rc ? Math.round(Math.sqrt(rc.tileSize)) : 1

    if (size === 1) {
      // Single-tile: existing logic — East, West, South with adjacency-based active state
      const t = tileTopVertex(b.x, b.y, centerX, offsetY, rot)
      const tx = t.x, ty = t.y

      const eastActive = isConnected(
        tx + 2 * TW, ty,      // screen-E neighbour
        tx + TW,     ty - TH, // screen-NE neighbour
        tx + TW,     ty + TH, // screen-SE neighbour
      )
      const layer_e = occupied.has(tk(tx + TW, ty + TH)) ? gBack : gFront
      drawSphere(layer_e, tx + SPHERE_OFFSETS.east.x, ty + SPHERE_OFFSETS.east.y, eastActive)

      const westActive = isConnected(
        tx - 2 * TW, ty,
        tx - TW,     ty - TH,
        tx - TW,     ty + TH,
      )
      const layer_w = occupied.has(tk(tx - TW, ty + TH)) ? gBack : gFront
      drawSphere(layer_w, tx + SPHERE_OFFSETS.west.x, ty + SPHERE_OFFSETS.west.y, westActive)

      const southActive = isConnected(
        tx,      ty + 2 * TH,
        tx + TW, ty + TH,
        tx - TW, ty + TH,
      )
      const layer_s = occupied.has(tk(tx, ty + 2 * TH)) ? gBack : gFront
      drawSphere(layer_s, tx + SPHERE_OFFSETS.south.x, ty + SPHERE_OFFSETS.south.y, southActive)

    } else {
      // Multi-tile composite: render spheres only at external corners.
      // External corners are the endpoints/junctions of external baseplateLines:
      //   SE faces (right column, dx=size-1): East and South corners per tile
      //   SW faces (bottom row, dy=size-1): West and South corners per tile

      for (let dy = 0; dy < size; dy++) {
        const t = tileTopVertex(b.x + size - 1, b.y + dy, centerX, offsetY, rot)
        addCompositeCornerSphere(t.x + TW, t.y + TH)     // East corner
        addCompositeCornerSphere(t.x, t.y + 2 * TH)       // South corner
      }

      for (let dx = 0; dx < size; dx++) {
        const t = tileTopVertex(b.x + dx, b.y + size - 1, centerX, offsetY, rot)
        addCompositeCornerSphere(t.x - TW, t.y + TH)     // West corner
        addCompositeCornerSphere(t.x, t.y + 2 * TH)       // South corner
      }
    }
  }

  parent.addChildAt(gBack, 0)
  parent.addChild(gFront)
}

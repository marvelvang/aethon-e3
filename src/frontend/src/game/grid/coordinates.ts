export const GRID_SIZE = 20
export const TILE_HALF_WIDTH = 32
export const TILE_HALF_HEIGHT = 16

export const GRID_VISUAL_WIDTH = GRID_SIZE * 2 * TILE_HALF_WIDTH
export const GRID_VISUAL_HEIGHT = (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2

const GRID_N = GRID_SIZE - 1

export type RotationStep = 0 | 1 | 2 | 3

export function tileTopVertex(
  col: number,
  row: number,
  centerX: number,
  offsetY: number,
  rot: RotationStep = 0
): { x: number; y: number } {
  switch (rot) {
    case 1: return {
      x: (GRID_N - row - col) * TILE_HALF_WIDTH + centerX,
      y: (GRID_N - row + col) * TILE_HALF_HEIGHT + offsetY,
    }
    case 2: return {
      x: (row - col) * TILE_HALF_WIDTH + centerX,
      y: (2 * GRID_N - col - row) * TILE_HALF_HEIGHT + offsetY,
    }
    case 3: return {
      x: (row + col - GRID_N) * TILE_HALF_WIDTH + centerX,
      y: (GRID_N + row - col) * TILE_HALF_HEIGHT + offsetY,
    }
    default: return {
      x: (col - row) * TILE_HALF_WIDTH + centerX,
      y: (col + row) * TILE_HALF_HEIGHT + offsetY,
    }
  }
}

export interface ScreenToGridParams {
  canvasX: number
  canvasY: number
  camera: { x: number; y: number; scale: number }
  centerX: number
  offsetY: number
  rotation: RotationStep
}

export function screenToGrid(p: ScreenToGridParams): { col: number; row: number } | null {
  const gx = (p.canvasX - p.camera.x) / p.camera.scale
  const gy = (p.canvasY - p.camera.y) / p.camera.scale
  const dx = (gx - p.centerX) / TILE_HALF_WIDTH
  const dy = (gy - p.offsetY) / TILE_HALF_HEIGHT - 1
  const N = GRID_SIZE - 1

  let col: number, row: number
  switch (p.rotation) {
    case 1:
      col = Math.round((dy - dx) / 2)
      row = Math.round(N - (dx + dy) / 2)
      break
    case 2:
      col = Math.round(N - (dx + dy) / 2)
      row = Math.round(N + (dx - dy) / 2)
      break
    case 3:
      col = Math.round(N + (dx - dy) / 2)
      row = Math.round((dx + dy) / 2)
      break
    default:
      col = Math.round((dx + dy) / 2)
      row = Math.round((dy - dx) / 2)
  }
  if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null
  return { col, row }
}

export function frontNeighbors(col: number, row: number, rot: RotationStep): {
  right: { col: number; row: number }
  left: { col: number; row: number }
} {
  switch (rot) {
    case 1: return { right: { col, row: row - 1 }, left: { col: col + 1, row } }
    case 2: return { right: { col: col - 1, row }, left: { col, row: row - 1 } }
    case 3: return { right: { col, row: row + 1 }, left: { col: col - 1, row } }
    default: return { right: { col: col + 1, row }, left: { col, row: row + 1 } }
  }
}

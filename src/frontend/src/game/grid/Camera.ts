import { GRID_VISUAL_HEIGHT, GRID_VISUAL_WIDTH, TILE_HALF_HEIGHT } from './coordinates'

export interface CameraState {
  x: number
  y: number
  scale: number
}

export class Camera {
  state: CameraState
  minScale: number
  maxScale: number
  centerX = 0
  offsetY = 0
  private buildingExtraAbove = 0

  constructor(viewportW: number, viewportH: number) {
    this.minScale = Camera.computeMinScale(viewportW, viewportH)
    this.maxScale = Camera.computeMaxScale(viewportH)
    this.state = {
      x: (viewportW / 2) * (1 - this.minScale),
      y: (viewportH / 2) * (1 - this.minScale),
      scale: this.minScale,
    }
  }

  static computeMinScale(viewportW: number, viewportH: number): number {
    return Math.min(viewportW / GRID_VISUAL_WIDTH, viewportH / GRID_VISUAL_HEIGHT)
  }

  // Limits zoom so that at most 4 tile heights (tip-to-tip) are visible vertically,
  // which is where SVG textures start to degrade visibly.
  static computeMaxScale(viewportH: number): number {
    return viewportH / (4 * 2 * TILE_HALF_HEIGHT)
  }

  setBoardCenter(centerX: number, offsetY: number): void {
    this.centerX = centerX
    this.offsetY = offsetY
  }

  setBuildingExtraAbove(value: number): void {
    this.buildingExtraAbove = value
    this.clamp()
  }

  setPosition(x: number, y: number): void {
    this.state.x = x
    this.state.y = y
    this.clamp()
  }

  zoomAt(pivotX: number, pivotY: number, factor: number): void {
    const newScale = Math.min(Math.max(this.state.scale * factor, this.minScale), this.maxScale)
    const actualFactor = newScale / this.state.scale
    this.state.x = pivotX + (this.state.x - pivotX) * actualFactor
    this.state.y = pivotY + (this.state.y - pivotY) * actualFactor
    this.state.scale = newScale
    this.clamp()
  }

  pinchZoom(rawFactor: number, midX: number, midY: number, startScale: number, startCamX: number, startCamY: number): void {
    const clampedScale = Math.min(Math.max(startScale * rawFactor, this.minScale), this.maxScale)
    const clampedFactor = clampedScale / startScale
    this.state.scale = clampedScale
    this.state.x = midX - (midX - startCamX) * clampedFactor
    this.state.y = midY - (midY - startCamY) * clampedFactor
    this.clamp()
  }

  resize(viewportW: number, viewportH: number, centerX: number, offsetY: number): void {
    this.centerX = centerX
    this.offsetY = offsetY
    this.minScale = Camera.computeMinScale(viewportW, viewportH)
    this.maxScale = Camera.computeMaxScale(viewportH)
    if (this.state.scale < this.minScale) {
      this.state.scale = this.minScale
    } else if (this.state.scale > this.maxScale) {
      this.state.scale = this.maxScale
    }
    this.clamp()
  }

  private clamp(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    const cam = this.state
    const cx = this.centerX
    const oy = this.offsetY

    const gridScreenW = GRID_VISUAL_WIDTH * cam.scale
    const gridScreenH = GRID_VISUAL_HEIGHT * cam.scale

    if (gridScreenW >= w) {
      const maxX = (GRID_VISUAL_WIDTH / 2 - cx) * cam.scale
      const minX = w - (cx + GRID_VISUAL_WIDTH / 2) * cam.scale
      cam.x = Math.min(maxX, Math.max(minX, cam.x))
    } else {
      cam.x = w / 2 - cx * cam.scale
    }

    if (gridScreenH >= h) {
      const maxY = -(oy - this.buildingExtraAbove) * cam.scale
      const minY = h - (oy + GRID_VISUAL_HEIGHT) * cam.scale
      cam.y = Math.min(maxY, Math.max(minY, cam.y))
    } else {
      cam.y = h / 2 - (oy + GRID_VISUAL_HEIGHT / 2) * cam.scale
    }
  }
}

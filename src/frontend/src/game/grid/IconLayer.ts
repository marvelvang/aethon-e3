import * as PIXI from 'pixi.js'
import type { components } from '../../api/generated'
import { BUILDING_TYPES, type BuildingType } from '../../domain/buildingTypes'
import { TILE_HALF_HEIGHT, tileTopVertex, type RotationStep } from './coordinates'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']

export const ICON_ZOOM_THRESHOLD = 0.4
const ICON_RADIUS = 14
const FADE_SPEED = 1 / 12

function createIcon(type: BuildingType): PIXI.Graphics {
  const meta = BUILDING_TYPES[type] ?? null
  const g = new PIXI.Graphics()
  const bgColor = meta?.iconBgColor ?? 0x888888

  g.beginFill(bgColor, 0.92)
  g.lineStyle(1.5, 0xffffff, 0.9)
  g.drawCircle(0, 0, ICON_RADIUS)
  g.endFill()

  g.lineStyle(0)
  g.beginFill(0xffffff, 1)
  meta?.drawIcon(g)
  g.endFill()

  return g
}

export class IconLayer {
  readonly container = new PIXI.Container()
  private worldPositions: Array<{ x: number; y: number }> = []
  private fade = 0
  private spriteContainer: PIXI.Container | null = null

  constructor() {
    this.container.alpha = 0
  }

  setSpriteContainer(c: PIXI.Container | null): void {
    this.spriteContainer = c
    if (c) c.alpha = 1 - this.fade
  }

  rebuild(buildings: UiBuildingSlot[], rot: RotationStep, centerX: number, offsetY: number, cam: { x: number; y: number; scale: number }): void {
    this.container.removeChildren()
    this.worldPositions = []
    for (const building of buildings) {
      const top = tileTopVertex(Number(building.x), Number(building.y), centerX, offsetY, rot)
      const worldX = top.x
      const worldY = top.y + TILE_HALF_HEIGHT
      const icon = createIcon(building.type as BuildingType)
      icon.position.set(cam.x + worldX * cam.scale, cam.y + worldY * cam.scale)
      this.container.addChild(icon)
      this.worldPositions.push({ x: worldX, y: worldY })
    }
  }

  syncScreenPositions(cam: { x: number; y: number; scale: number }): void {
    const children = this.container.children
    for (let i = 0; i < children.length && i < this.worldPositions.length; i++) {
      (children[i] as PIXI.Container).position.set(
        cam.x + this.worldPositions[i].x * cam.scale,
        cam.y + this.worldPositions[i].y * cam.scale,
      )
    }
  }

  tick(delta: number, currentScale: number): void {
    const target = currentScale < ICON_ZOOM_THRESHOLD ? 1 : 0
    if (target > this.fade) {
      this.fade = Math.min(this.fade + FADE_SPEED * delta, target)
    } else {
      this.fade = Math.max(this.fade - FADE_SPEED * delta, target)
    }
    this.container.alpha = this.fade
    if (this.spriteContainer) this.spriteContainer.alpha = 1 - this.fade
  }

  get currentFade(): number {
    return this.fade
  }
}

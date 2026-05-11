import * as PIXI from 'pixi.js'
import type { components } from '../api/generated'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type BuildingType = UiBuildingSlot['type']

export const ICON_ZOOM_THRESHOLD = 0.4

const ICON_RADIUS = 14

const ICON_BG_COLORS: Record<string, number> = {
  Base: 0xE8B84B,
  Housing: 0x5BA85A,
  Consumer: 0x4A90D9,
  Industry: 0xD96B2F,
}

function drawStar(g: PIXI.Graphics, spikes: number, outerR: number, innerR: number): void {
  const step = Math.PI / spikes
  let angle = -Math.PI / 2
  const points: number[] = []
  for (let i = 0; i < spikes; i++) {
    points.push(Math.cos(angle) * outerR, Math.sin(angle) * outerR)
    angle += step
    points.push(Math.cos(angle) * innerR, Math.sin(angle) * innerR)
    angle += step
  }
  g.drawPolygon(points)
}

export function createBuildingIconGraphics(type: BuildingType): PIXI.Graphics {
  const g = new PIXI.Graphics()
  const bgColor = ICON_BG_COLORS[type] ?? 0x888888

  g.beginFill(bgColor, 0.92)
  g.lineStyle(1.5, 0xffffff, 0.9)
  g.drawCircle(0, 0, ICON_RADIUS)
  g.endFill()

  g.lineStyle(0)
  g.beginFill(0xffffff, 1)

  switch (type) {
    case 'Base':
      // 5-pointed star
      drawStar(g, 5, 8, 3.5)
      break
    case 'Housing':
      // Roof triangle + rectangular body
      g.drawPolygon([-7, 2, 0, -7, 7, 2])
      g.drawRect(-5, 2, 10, 7)
      break
    case 'Consumer':
      // Leaf oval + stem
      g.drawEllipse(0, -2, 6, 8)
      g.drawRect(-1.5, 5, 3, 4)
      break
    case 'Industry':
      // Three vertical bars of varying height
      g.drawRect(-8, -3, 4, 10)
      g.drawRect(-2, -8, 4, 15)
      g.drawRect(4, -5, 4, 12)
      break
  }

  g.endFill()
  return g
}

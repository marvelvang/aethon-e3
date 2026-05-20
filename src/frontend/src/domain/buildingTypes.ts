import * as PIXI from 'pixi.js'
import type { components } from '../api/generated'

export type BuildingType = components['schemas']['BuildingType']

export interface BuildingTypeMeta {
  label: string
  iconBgColor: number
  iconHex: string
  assetPath: string
  assetAnchorY: number
  assetScale: number
  drawIcon: (g: PIXI.Graphics) => void
}

const ICON_ANCHOR_Y = 178 / 308
const ICON_SCALE = 64 / 256

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

export const BUILDING_TYPES: Record<BuildingType, BuildingTypeMeta> = {
  Base: {
    label: 'Basis',
    iconBgColor: 0xE8B84B,
    iconHex: '#E8B84B',
    assetPath: '/assets/buildings/base.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => drawStar(g, 5, 8, 3.5),
  },
  Housing: {
    label: 'Wohngebäude',
    iconBgColor: 0xE07030,
    iconHex: 'var(--color-housing)',
    assetPath: '/assets/buildings/housing.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawPolygon([-7, 2, 0, -7, 7, 2])
      g.drawRect(-5, 2, 10, 7)
    },
  },
  Consumer: {
    label: 'Güterwerk',
    iconBgColor: 0x66AA44,
    iconHex: 'var(--color-consumer)',
    assetPath: '/assets/buildings/consumer.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 6, 8)
      g.drawRect(-1.5, 5, 3, 4)
    },
  },
  Industry: {
    label: 'Industriewerk',
    iconBgColor: 0xCC44FF,
    iconHex: 'var(--color-industry)',
    assetPath: '/assets/buildings/industry.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawRect(-8, -3, 4, 10)
      g.drawRect(-2, -8, 4, 15)
      g.drawRect(4, -5, 4, 12)
    },
  },
}

export const ALL_BUILDING_TYPES: BuildingType[] = ['Base', 'Housing', 'Consumer', 'Industry']

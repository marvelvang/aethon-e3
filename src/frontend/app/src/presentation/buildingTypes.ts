import * as PIXI from 'pixi.js'
import type { BuildingType } from '@aethon/models'

export type { BuildingType }

export interface BuildingMeta {
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

/**
 * View metadata for each building type — labels, colors, SVG assets, Pixi
 * icon drawers. Keyed by the BuildingType enum from @aethon/models.
 */
export const BUILDING_META: Record<BuildingType, BuildingMeta> = {
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
  HousingT2: {
    label: 'Wohngebäude II',
    iconBgColor: 0xFF9050,
    iconHex: 'var(--color-housing)',
    assetPath: '/assets/buildings/housing_t2.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawPolygon([-8, 2, 0, -8, 8, 2])
      g.drawRect(-6, 2, 12, 8)
      g.drawCircle(6, -7, 2)
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
  ConsumerT2: {
    label: 'Güterwerk II',
    iconBgColor: 0x88CC55,
    iconHex: 'var(--color-consumer)',
    assetPath: '/assets/buildings/consumer_t2.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 7, 9)
      g.drawRect(-2, 6, 4, 4)
      g.drawCircle(5, -8, 2)
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
  IndustryT2: {
    label: 'Industriewerk II',
    iconBgColor: 0xDD66FF,
    iconHex: 'var(--color-industry)',
    assetPath: '/assets/buildings/industry_t2.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawRect(-9, -4, 4, 11)
      g.drawRect(-3, -9, 4, 16)
      g.drawRect(3, -6, 4, 13)
      g.drawCircle(7, -8, 2)
    },
  },
  PowerPlant: {
    label: 'Kraftwerk',
    iconBgColor: 0x88AAFF,
    iconHex: 'var(--color-energy)',
    assetPath: '/assets/buildings/powerplant.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawPolygon([3, -9, -3, 0, 1, 0, -3, 9, 5, -1, 1, -1])
    },
  },
  PowerPlantT2: {
    label: 'Kraftwerk II',
    iconBgColor: 0xAABBFF,
    iconHex: 'var(--color-energy)',
    assetPath: '/assets/buildings/powerplant_t2.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawPolygon([4, -10, -4, 0, 1, 0, -4, 10, 6, -1, 1, -1])
      g.drawCircle(6, -9, 2)
    },
  },
  Research: {
    label: 'Forschung',
    iconBgColor: 0x00BFD8,
    iconHex: 'var(--color-research)',
    assetPath: '/assets/buildings/research.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 5, 5)
      g.drawRect(-1.5, 3, 3, 6)
    },
  },
  ResearchT2: {
    label: 'Forschung II',
    iconBgColor: 0x00DDEE,
    iconHex: 'var(--color-research)',
    assetPath: '/assets/buildings/research_t2.svg',
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 6, 6)
      g.drawRect(-2, 4, 4, 6)
      g.drawCircle(5, -7, 2)
    },
  },
}


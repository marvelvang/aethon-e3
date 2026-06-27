import * as PIXI from 'pixi.js'
import type { BuildingType } from '@aethon/models'

// SVG raw strings — for inline <svg> rendering in browser UI (vector quality, no decode delay)
import baseSvgRaw         from '../assets/buildings/base.svg?raw'
import housingSvgRaw      from '../assets/buildings/housing.svg?raw'
import housingT2SvgRaw    from '../assets/buildings/housing_t2.svg?raw'
import consumerSvgRaw     from '../assets/buildings/consumer.svg?raw'
import consumerT2SvgRaw   from '../assets/buildings/consumer_t2.svg?raw'
import industrySvgRaw     from '../assets/buildings/industry.svg?raw'
import industryT2SvgRaw   from '../assets/buildings/industry_t2.svg?raw'
import powerplantSvgRaw   from '../assets/buildings/powerplant.svg?raw'
import powerplantT2SvgRaw from '../assets/buildings/powerplant_t2.svg?raw'
import researchSvgRaw     from '../assets/buildings/research.svg?raw'
import researchT2SvgRaw   from '../assets/buildings/research_t2.svg?raw'

// PNG URLs — for Pixi.js texture loading (generated at build time via render-building-pngs.py)
import basePng         from '../assets/buildings/png/base.png'
import housingPng      from '../assets/buildings/png/housing.png'
import housingT2Png    from '../assets/buildings/png/housing_t2.png'
import housingT3Png    from '../assets/buildings/png/housing_t3.png'
import housingT5Png    from '../assets/buildings/png/housing_t5.png'
import consumerPng     from '../assets/buildings/png/consumer.png'
import consumerT2Png   from '../assets/buildings/png/consumer_t2.png'
import industryPng     from '../assets/buildings/png/industry.png'
import industryT2Png   from '../assets/buildings/png/industry_t2.png'
import powerplantPng   from '../assets/buildings/png/powerplant.png'
import powerplantT2Png from '../assets/buildings/png/powerplant_t2.png'
import researchPng     from '../assets/buildings/png/research.png'
import researchT2Png   from '../assets/buildings/png/research_t2.png'

export type { BuildingType }

export interface BuildingMeta {
  label: string
  iconBgColor: number
  iconHex: string
  assetSvg: string | null  // raw SVG string for single-tile; null for composite buildings
  assetPath: string        // PNG URL — use for Pixi.js texture loading
  assetAnchorY: number
  assetScale: number
  tileSize: 1 | 4 | 9
  drawIcon: (g: PIXI.Graphics) => void
}

const ICON_ANCHOR_Y = 178 / 308
const ICON_SCALE = 64 / 256
const COMPOSITE_SCALE = 64 / 256  // same display scale — PNG is just wider/taller

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

export const BUILDING_META: Record<BuildingType, BuildingMeta> = {
  Base: {
    label: 'Basis',
    iconBgColor: 0xE8B84B,
    iconHex: '#E8B84B',
    assetSvg: baseSvgRaw,
    assetPath: basePng,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => drawStar(g, 5, 8, 3.5),
  },
  Housing: {
    label: 'Wohngebäude',
    iconBgColor: 0xE07030,
    iconHex: 'var(--color-housing)',
    assetSvg: housingSvgRaw,
    assetPath: housingPng,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawPolygon([-7, 2, 0, -7, 7, 2])
      g.drawRect(-5, 2, 10, 7)
    },
  },
  HousingT2: {
    label: 'Wohngebäude II',
    iconBgColor: 0xFF9050,
    iconHex: 'var(--color-housing)',
    assetSvg: housingT2SvgRaw,
    assetPath: housingT2Png,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawPolygon([-8, 2, 0, -8, 8, 2])
      g.drawRect(-6, 2, 12, 8)
      g.drawCircle(6, -7, 2)
    },
  },
  HousingT3: {
    label: 'Wohnkomplex III',
    iconBgColor: 0xFF7030,
    iconHex: 'var(--color-housing)',
    assetSvg: null,
    assetPath: housingT3Png,
    assetAnchorY: 316 / 456,
    assetScale: COMPOSITE_SCALE,
    tileSize: 4,
    drawIcon: (g) => {
      g.drawPolygon([-9, 2, 0, -9, 9, 2])
      g.drawRect(-7, 2, 14, 9)
      g.drawCircle(-4, -9, 2)
      g.drawCircle(4, -9, 2)
    },
  },
  HousingT5: {
    label: 'Wohnkomplex V',
    iconBgColor: 0xFF5010,
    iconHex: 'var(--color-housing)',
    assetSvg: null,
    assetPath: housingT5Png,
    assetAnchorY: 444 / 584,
    assetScale: COMPOSITE_SCALE,
    tileSize: 9,
    drawIcon: (g) => {
      g.drawPolygon([-10, 2, 0, -10, 10, 2])
      g.drawRect(-8, 2, 16, 10)
      g.drawCircle(-5, -10, 2)
      g.drawCircle(0, -12, 2)
      g.drawCircle(5, -10, 2)
    },
  },
  Consumer: {
    label: 'Güterwerk',
    iconBgColor: 0x66AA44,
    iconHex: 'var(--color-consumer)',
    assetSvg: consumerSvgRaw,
    assetPath: consumerPng,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 6, 8)
      g.drawRect(-1.5, 5, 3, 4)
    },
  },
  ConsumerT2: {
    label: 'Güterwerk II',
    iconBgColor: 0x88CC55,
    iconHex: 'var(--color-consumer)',
    assetSvg: consumerT2SvgRaw,
    assetPath: consumerT2Png,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
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
    assetSvg: industrySvgRaw,
    assetPath: industryPng,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
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
    assetSvg: industryT2SvgRaw,
    assetPath: industryT2Png,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
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
    assetSvg: powerplantSvgRaw,
    assetPath: powerplantPng,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawPolygon([3, -9, -3, 0, 1, 0, -3, 9, 5, -1, 1, -1])
    },
  },
  PowerPlantT2: {
    label: 'Kraftwerk II',
    iconBgColor: 0xAABBFF,
    iconHex: 'var(--color-energy)',
    assetSvg: powerplantT2SvgRaw,
    assetPath: powerplantT2Png,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawPolygon([4, -10, -4, 0, 1, 0, -4, 10, 6, -1, 1, -1])
      g.drawCircle(6, -9, 2)
    },
  },
  Research: {
    label: 'Forschung',
    iconBgColor: 0x00BFD8,
    iconHex: 'var(--color-research)',
    assetSvg: researchSvgRaw,
    assetPath: researchPng,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 5, 5)
      g.drawRect(-1.5, 3, 3, 6)
    },
  },
  ResearchT2: {
    label: 'Forschung II',
    iconBgColor: 0x00DDEE,
    iconHex: 'var(--color-research)',
    assetSvg: researchT2SvgRaw,
    assetPath: researchT2Png,
    assetAnchorY: ICON_ANCHOR_Y,
    assetScale: ICON_SCALE,
    tileSize: 1,
    drawIcon: (g) => {
      g.drawEllipse(0, -2, 6, 6)
      g.drawRect(-2, 4, 4, 6)
      g.drawCircle(5, -7, 2)
    },
  },
}

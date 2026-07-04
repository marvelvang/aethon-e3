import * as PIXI from 'pixi.js'
import type { BuildingType } from '@aethon/models'

// SVG raw strings — for inline <svg> rendering in browser UI (vector quality, no decode delay)
import baseSvgRaw         from '../assets/buildings/base.svg?raw'
import housingSvgRaw      from '../assets/buildings/housing.svg?raw'
import housingT2SvgRaw    from '../assets/buildings/housing_t2.svg?raw'
import housingT3SvgRaw    from '../assets/buildings/housing_t3.svg?raw'
import housingT4SvgRaw    from '../assets/buildings/housing_t4.svg?raw'
import housingT5SvgRaw    from '../assets/buildings/housing_t5.svg?raw'
import consumerSvgRaw     from '../assets/buildings/consumer.svg?raw'
import consumerT2SvgRaw   from '../assets/buildings/consumer_t2.svg?raw'
import consumerT3SvgRaw   from '../assets/buildings/consumer_t3.svg?raw'
import consumerT4SvgRaw   from '../assets/buildings/consumer_t4.svg?raw'
import consumerT5SvgRaw   from '../assets/buildings/consumer_t5.svg?raw'
import industrySvgRaw     from '../assets/buildings/industry.svg?raw'
import industryT2SvgRaw   from '../assets/buildings/industry_t2.svg?raw'
import industryT3SvgRaw   from '../assets/buildings/industry_t3.svg?raw'
import industryT4SvgRaw   from '../assets/buildings/industry_t4.svg?raw'
import industryT5SvgRaw   from '../assets/buildings/industry_t5.svg?raw'
import powerplantSvgRaw   from '../assets/buildings/powerplant.svg?raw'
import powerplantT2SvgRaw from '../assets/buildings/powerplant_t2.svg?raw'
import powerplantT3SvgRaw from '../assets/buildings/powerplant_t3.svg?raw'
import powerplantT4SvgRaw from '../assets/buildings/powerplant_t4.svg?raw'
import powerplantT5SvgRaw from '../assets/buildings/powerplant_t5.svg?raw'
import researchSvgRaw     from '../assets/buildings/research.svg?raw'
import researchT2SvgRaw   from '../assets/buildings/research_t2.svg?raw'
import researchT3SvgRaw   from '../assets/buildings/research_t3.svg?raw'
import researchT4SvgRaw   from '../assets/buildings/research_t4.svg?raw'
import researchT5SvgRaw   from '../assets/buildings/research_t5.svg?raw'

// PNG URLs — for Pixi.js texture loading (generated at build time via render-building-pngs.py)
import basePng         from '../assets/buildings/png/base.png'
import housingPng      from '../assets/buildings/png/housing.png'
import housingT2Png    from '../assets/buildings/png/housing_t2.png'
import housingT3Png    from '../assets/buildings/png/housing_t3.png'
import housingT4Png    from '../assets/buildings/png/housing_t4.png'
import housingT5Png    from '../assets/buildings/png/housing_t5.png'
import consumerPng     from '../assets/buildings/png/consumer.png'
import consumerT2Png   from '../assets/buildings/png/consumer_t2.png'
import consumerT3Png   from '../assets/buildings/png/consumer_t3.png'
import consumerT4Png   from '../assets/buildings/png/consumer_t4.png'
import consumerT5Png   from '../assets/buildings/png/consumer_t5.png'
import industryPng     from '../assets/buildings/png/industry.png'
import industryT2Png   from '../assets/buildings/png/industry_t2.png'
import industryT3Png   from '../assets/buildings/png/industry_t3.png'
import industryT4Png   from '../assets/buildings/png/industry_t4.png'
import industryT5Png   from '../assets/buildings/png/industry_t5.png'
import powerplantPng   from '../assets/buildings/png/powerplant.png'
import powerplantT2Png from '../assets/buildings/png/powerplant_t2.png'
import powerplantT3Png from '../assets/buildings/png/powerplant_t3.png'
import powerplantT4Png from '../assets/buildings/png/powerplant_t4.png'
import powerplantT5Png from '../assets/buildings/png/powerplant_t5.png'
import researchPng     from '../assets/buildings/png/research.png'
import researchT2Png   from '../assets/buildings/png/research_t2.png'
import researchT3Png   from '../assets/buildings/png/research_t3.png'
import researchT4Png   from '../assets/buildings/png/research_t4.png'
import researchT5Png   from '../assets/buildings/png/research_t5.png'

export type { BuildingType }

export interface BuildingMeta {
  label: string
  iconBgColor: number
  iconHex: string
  assetSvg: string     // raw SVG string — use as <svg> inline in browser UI
  assetPath: string    // PNG URL — use for Pixi.js texture loading
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

function meta(
  label: string,
  iconBgColor: number,
  iconHex: string,
  assetSvg: string,
  assetPath: string,
  drawIcon: (g: PIXI.Graphics) => void,
): BuildingMeta {
  return { label, iconBgColor, iconHex, assetSvg, assetPath, assetAnchorY: ICON_ANCHOR_Y, assetScale: ICON_SCALE, drawIcon }
}

// Tile-icon shapes per family (T2 variant reused for T3–T5 placeholders)
const iconHousing = (g: PIXI.Graphics) => {
  g.drawPolygon([-7, 2, 0, -7, 7, 2])
  g.drawRect(-5, 2, 10, 7)
}
const iconHousingHi = (g: PIXI.Graphics) => {
  g.drawPolygon([-8, 2, 0, -8, 8, 2])
  g.drawRect(-6, 2, 12, 8)
  g.drawCircle(6, -7, 2)
}
const iconConsumer = (g: PIXI.Graphics) => {
  g.drawEllipse(0, -2, 6, 8)
  g.drawRect(-1.5, 5, 3, 4)
}
const iconConsumerHi = (g: PIXI.Graphics) => {
  g.drawEllipse(0, -2, 7, 9)
  g.drawRect(-2, 6, 4, 4)
  g.drawCircle(5, -8, 2)
}
const iconIndustry = (g: PIXI.Graphics) => {
  g.drawRect(-8, -3, 4, 10)
  g.drawRect(-2, -8, 4, 15)
  g.drawRect(4, -5, 4, 12)
}
const iconIndustryHi = (g: PIXI.Graphics) => {
  g.drawRect(-9, -4, 4, 11)
  g.drawRect(-3, -9, 4, 16)
  g.drawRect(3, -6, 4, 13)
  g.drawCircle(7, -8, 2)
}
const iconPowerPlant = (g: PIXI.Graphics) => {
  g.drawPolygon([3, -9, -3, 0, 1, 0, -3, 9, 5, -1, 1, -1])
}
const iconPowerPlantHi = (g: PIXI.Graphics) => {
  g.drawPolygon([4, -10, -4, 0, 1, 0, -4, 10, 6, -1, 1, -1])
  g.drawCircle(6, -9, 2)
}
const iconResearch = (g: PIXI.Graphics) => {
  g.drawEllipse(0, -2, 5, 5)
  g.drawRect(-1.5, 3, 3, 6)
}
const iconResearchHi = (g: PIXI.Graphics) => {
  g.drawEllipse(0, -2, 6, 6)
  g.drawRect(-2, 4, 4, 6)
  g.drawCircle(5, -7, 2)
}

const HOUSING_HEX    = 'var(--color-housing)'
const CONSUMER_HEX   = 'var(--color-consumer)'
const INDUSTRY_HEX   = 'var(--color-industry)'
const ENERGY_HEX     = 'var(--color-energy)'
const RESEARCH_HEX   = 'var(--color-research)'

export const BUILDING_META: Record<BuildingType, BuildingMeta> = {
  Base:         meta('Basis',            0xE8B84B, '#E8B84B',    baseSvgRaw,         basePng,         (g) => drawStar(g, 5, 8, 3.5)),

  Housing:      meta('Wohngebäude',      0xE07030, HOUSING_HEX,  housingSvgRaw,      housingPng,      iconHousing),
  HousingT2:    meta('Wohngebäude II',   0xFF9050, HOUSING_HEX,  housingT2SvgRaw,    housingT2Png,    iconHousingHi),
  HousingT3:    meta('Wohngebäude III',  0xFFA060, HOUSING_HEX,  housingT3SvgRaw,    housingT3Png,    iconHousingHi),
  HousingT4:    meta('Wohngebäude IV',   0xFFB070, HOUSING_HEX,  housingT4SvgRaw,    housingT4Png,    iconHousingHi),
  HousingT5:    meta('Wohngebäude V',    0xFFC080, HOUSING_HEX,  housingT5SvgRaw,    housingT5Png,    iconHousingHi),

  Consumer:     meta('Güterwerk',        0x66AA44, CONSUMER_HEX, consumerSvgRaw,     consumerPng,     iconConsumer),
  ConsumerT2:   meta('Güterwerk II',     0x88CC55, CONSUMER_HEX, consumerT2SvgRaw,   consumerT2Png,   iconConsumerHi),
  ConsumerT3:   meta('Güterwerk III',    0x99DD66, CONSUMER_HEX, consumerT3SvgRaw,   consumerT3Png,   iconConsumerHi),
  ConsumerT4:   meta('Güterwerk IV',     0xAAEE77, CONSUMER_HEX, consumerT4SvgRaw,   consumerT4Png,   iconConsumerHi),
  ConsumerT5:   meta('Güterwerk V',      0xBBFF88, CONSUMER_HEX, consumerT5SvgRaw,   consumerT5Png,   iconConsumerHi),

  Industry:     meta('Industriewerk',    0xCC44FF, INDUSTRY_HEX, industrySvgRaw,     industryPng,     iconIndustry),
  IndustryT2:   meta('Industriewerk II', 0xDD66FF, INDUSTRY_HEX, industryT2SvgRaw,   industryT2Png,   iconIndustryHi),
  IndustryT3:   meta('Industriewerk III',0xE377FF, INDUSTRY_HEX, industryT3SvgRaw,   industryT3Png,   iconIndustryHi),
  IndustryT4:   meta('Industriewerk IV', 0xE988FF, INDUSTRY_HEX, industryT4SvgRaw,   industryT4Png,   iconIndustryHi),
  IndustryT5:   meta('Industriewerk V',  0xEF99FF, INDUSTRY_HEX, industryT5SvgRaw,   industryT5Png,   iconIndustryHi),

  PowerPlant:   meta('Kraftwerk',        0x88AAFF, ENERGY_HEX,   powerplantSvgRaw,   powerplantPng,   iconPowerPlant),
  PowerPlantT2: meta('Kraftwerk II',     0xAABBFF, ENERGY_HEX,   powerplantT2SvgRaw, powerplantT2Png, iconPowerPlantHi),
  PowerPlantT3: meta('Kraftwerk III',    0xBBCCFF, ENERGY_HEX,   powerplantT3SvgRaw, powerplantT3Png, iconPowerPlantHi),
  PowerPlantT4: meta('Kraftwerk IV',     0xCCDDFF, ENERGY_HEX,   powerplantT4SvgRaw, powerplantT4Png, iconPowerPlantHi),
  PowerPlantT5: meta('Kraftwerk V',      0xDDEEFF, ENERGY_HEX,   powerplantT5SvgRaw, powerplantT5Png, iconPowerPlantHi),

  Research:     meta('Forschung',        0x00BFD8, RESEARCH_HEX, researchSvgRaw,     researchPng,     iconResearch),
  ResearchT2:   meta('Forschung II',     0x00DDEE, RESEARCH_HEX, researchT2SvgRaw,   researchT2Png,   iconResearchHi),
  ResearchT3:   meta('Forschung III',    0x22E4F2, RESEARCH_HEX, researchT3SvgRaw,   researchT3Png,   iconResearchHi),
  ResearchT4:   meta('Forschung IV',     0x44EBF6, RESEARCH_HEX, researchT4SvgRaw,   researchT4Png,   iconResearchHi),
  ResearchT5:   meta('Forschung V',      0x66F2FA, RESEARCH_HEX, researchT5SvgRaw,   researchT5Png,   iconResearchHi),
}

/**
 * Building families for the nested picker: each family is selected via its
 * tier-1 building and then offers all five tech tiers.
 */
export const BUILDING_FAMILIES: { key: BuildingType; tiers: BuildingType[] }[] = [
  { key: 'Housing',    tiers: ['Housing',    'HousingT2',    'HousingT3',    'HousingT4',    'HousingT5'] },
  { key: 'Consumer',   tiers: ['Consumer',   'ConsumerT2',   'ConsumerT3',   'ConsumerT4',   'ConsumerT5'] },
  { key: 'Industry',   tiers: ['Industry',   'IndustryT2',   'IndustryT3',   'IndustryT4',   'IndustryT5'] },
  { key: 'PowerPlant', tiers: ['PowerPlant', 'PowerPlantT2', 'PowerPlantT3', 'PowerPlantT4', 'PowerPlantT5'] },
  { key: 'Research',   tiers: ['Research',   'ResearchT2',   'ResearchT3',   'ResearchT4',   'ResearchT5'] },
]

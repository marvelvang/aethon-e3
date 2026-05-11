import * as PIXI from 'pixi.js'
import type { components } from '../api/generated'

type BuildingType = components['schemas']['UiBuildingSlot']['type']

export interface BuildingAssetConfig {
  path: string
  anchorX: number
  anchorY: number
  scale: number
}

export interface BuildingRenderConfig {
  texture: PIXI.Texture
  anchorX: number
  anchorY: number
  scale: number
}

const ASSET_CONFIGS: Partial<Record<BuildingType, BuildingAssetConfig>> = {
  Base: {
    path: '/assets/buildings/base.svg',
    anchorX: 0.5,
    anchorY: 178 / 308, // tile-top vertex in image coords (from SVG header)
    scale: 64 / 256,    // 4× → 1× (from SVG header)
  },
  Housing: {
    path: '/assets/buildings/housing.svg',
    anchorX: 0.5,
    anchorY: 178 / 308,
    scale: 64 / 256,
  },
  Consumer: {
    path: '/assets/buildings/consumer.svg',
    anchorX: 0.5,
    anchorY: 178 / 308,
    scale: 64 / 256,
  },
  Industry: {
    path: '/assets/buildings/industry.svg',
    anchorX: 0.5,
    anchorY: 178 / 308,
    scale: 64 / 256,
  },
}

export async function loadBuildingTextures(): Promise<Map<BuildingType, BuildingRenderConfig>> {
  const entries = await Promise.all(
    (Object.entries(ASSET_CONFIGS) as [BuildingType, BuildingAssetConfig][])
      .map(async ([type, cfg]) => {
        const texture = await PIXI.Assets.load(cfg.path)
        const renderConfig: BuildingRenderConfig = {
          texture,
          anchorX: cfg.anchorX,
          anchorY: cfg.anchorY,
          scale: cfg.scale,
        }
        return [type, renderConfig] as const
      })
  )
  return new Map(entries)
}

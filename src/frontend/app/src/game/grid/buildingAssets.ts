import * as PIXI from 'pixi.js'
import { BUILDING_TYPES, type BuildingType } from '../../domain/buildingTypes'

export interface BuildingRenderConfig {
  texture: PIXI.Texture
  anchorX: number
  anchorY: number
  scale: number
}

export async function loadBuildingTextures(): Promise<Map<BuildingType, BuildingRenderConfig>> {
  const entries = await Promise.all(
    (Object.entries(BUILDING_TYPES) as [BuildingType, typeof BUILDING_TYPES[BuildingType]][])
      .map(async ([type, meta]) => {
        const texture = await PIXI.Assets.load(meta.assetPath)
        return [type, {
          texture,
          anchorX: 0.5,
          anchorY: meta.assetAnchorY,
          scale: meta.assetScale,
        }] as const
      })
  )
  return new Map(entries)
}

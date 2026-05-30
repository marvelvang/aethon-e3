import * as PIXI from 'pixi.js'
import { BUILDING_META, type BuildingType } from '../../presentation/buildingTypes'

export interface BuildingRenderConfig {
  texture: PIXI.Texture
  anchorX: number
  anchorY: number
  scale: number
}

export async function loadBuildingTextures(): Promise<Map<BuildingType, BuildingRenderConfig>> {
  const entries = await Promise.all(
    (Object.entries(BUILDING_META) as [BuildingType, typeof BUILDING_META[BuildingType]][])
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

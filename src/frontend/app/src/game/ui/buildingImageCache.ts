import { BUILDING_META } from '../../presentation/buildingTypes'

const SIZE = 48
const pngCache = new Map<string, string>()

async function rasterize(src: string): Promise<void> {
  const img = new Image(SIZE, SIZE)
  img.src = src
  await img.decode()
  const dpr = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE * dpr
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  pngCache.set(src, canvas.toDataURL('image/png'))
}

export function initBuildingImageCache(): void {
  for (const meta of Object.values(BUILDING_META)) {
    rasterize(meta.assetPath)
  }
}

export function getPopupSrc(assetPath: string): string {
  return pngCache.get(assetPath) ?? assetPath
}

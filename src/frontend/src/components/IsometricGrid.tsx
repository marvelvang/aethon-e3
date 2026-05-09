import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { renderIsometricGrid } from '../pixi/renderIsometricGrid'
import type { Building } from '../api/gameApi'

interface Props {
  buildings: Building[]
}

export default function IsometricGrid({ buildings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const app = new PIXI.Application({
      view: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })

    renderIsometricGrid(app, buildings)

    return () => {
      app.destroy(false, { children: true, texture: true, baseTexture: true })
    }
  }, [buildings])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

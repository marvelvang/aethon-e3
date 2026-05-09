import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { renderIsometricGrid } from '../pixi/renderIsometricGrid'
import type { Building } from '../api/gameApi'

interface Props {
  buildings: Building[]
}

export default function IsometricGrid({ buildings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const gridRef = useRef<PIXI.Container | null>(null)
  const camera = useRef({ x: 0, y: 0, scale: 1 })

  function applyCamera() {
    if (!gridRef.current) return
    gridRef.current.position.set(camera.current.x, camera.current.y)
    gridRef.current.scale.set(camera.current.scale)
  }

  function zoomAt(pivotX: number, pivotY: number, factor: number) {
    camera.current.x = pivotX + (camera.current.x - pivotX) * factor
    camera.current.y = pivotY + (camera.current.y - pivotY) * factor
    camera.current.scale *= factor
    applyCamera()
  }

  // Init PIXI once
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current

    const app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
    appRef.current = app

    const drag = { active: false, startX: 0, startY: 0, camX: 0, camY: 0 }
    const pinch = { startDist: 0, startScale: 1, midX: 0, midY: 0, startCamX: 0, startCamY: 0 }

    function onMouseDown(e: MouseEvent) {
      drag.active = true
      drag.startX = e.clientX
      drag.startY = e.clientY
      drag.camX = camera.current.x
      drag.camY = camera.current.y
    }
    function onMouseMove(e: MouseEvent) {
      if (!drag.active) return
      camera.current.x = drag.camX + (e.clientX - drag.startX)
      camera.current.y = drag.camY + (e.clientY - drag.startY)
      applyCamera()
    }
    function onMouseUp() { drag.active = false }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      zoomAt(e.clientX, e.clientY, Math.pow(2, -e.deltaY / 300))
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1) {
        drag.active = true
        drag.startX = e.touches[0].clientX
        drag.startY = e.touches[0].clientY
        drag.camX = camera.current.x
        drag.camY = camera.current.y
      } else if (e.touches.length === 2) {
        drag.active = false
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        pinch.startDist = Math.hypot(dx, dy)
        pinch.startScale = camera.current.scale
        pinch.midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        pinch.midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        pinch.startCamX = camera.current.x
        pinch.startCamY = camera.current.y
      }
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1 && drag.active) {
        camera.current.x = drag.camX + (e.touches[0].clientX - drag.startX)
        camera.current.y = drag.camY + (e.touches[0].clientY - drag.startY)
        applyCamera()
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        const factor = Math.hypot(dx, dy) / pinch.startDist
        camera.current.scale = pinch.startScale * factor
        camera.current.x = pinch.midX - (pinch.midX - pinch.startCamX) * factor
        camera.current.y = pinch.midY - (pinch.midY - pinch.startCamY) * factor
        applyCamera()
      }
    }
    function onTouchEnd() { drag.active = false }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      appRef.current = null
      app.destroy(false, { children: true, texture: true, baseTexture: true })
    }
  }, [])

  // Update grid when buildings change, without touching the PIXI app
  useEffect(() => {
    const app = appRef.current
    if (!app) return

    if (gridRef.current) {
      app.stage.removeChild(gridRef.current)
      gridRef.current.destroy({ children: true })
    }

    gridRef.current = renderIsometricGrid(app, buildings)
    applyCamera()
  }, [buildings])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

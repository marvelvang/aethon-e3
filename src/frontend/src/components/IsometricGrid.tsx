import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { renderIsometricGrid } from '../pixi/renderIsometricGrid'

export default function IsometricGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const gridContainer = renderIsometricGrid(app)
    const camera = { x: 0, y: 0, scale: 1 }

    function applyCamera() {
      gridContainer.position.set(camera.x, camera.y)
      gridContainer.scale.set(camera.scale)
    }

    function zoomAt(pivotX: number, pivotY: number, factor: number) {
      camera.x = pivotX + (camera.x - pivotX) * factor
      camera.y = pivotY + (camera.y - pivotY) * factor
      camera.scale *= factor
      applyCamera()
    }

    // --- Mouse drag ---
    const drag = { active: false, startX: 0, startY: 0, camX: 0, camY: 0 }

    function onMouseDown(e: MouseEvent) {
      drag.active = true
      drag.startX = e.clientX
      drag.startY = e.clientY
      drag.camX = camera.x
      drag.camY = camera.y
    }

    function onMouseMove(e: MouseEvent) {
      if (!drag.active) return
      camera.x = drag.camX + (e.clientX - drag.startX)
      camera.y = drag.camY + (e.clientY - drag.startY)
      applyCamera()
    }

    function onMouseUp() {
      drag.active = false
    }

    // --- Mouse wheel zoom ---
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const factor = Math.pow(2, -e.deltaY / 300)
      zoomAt(e.clientX, e.clientY, factor)
    }

    // --- Touch (single-finger pan + two-finger pinch zoom) ---
    const pinch = { startDist: 0, startScale: 1, midX: 0, midY: 0, startCamX: 0, startCamY: 0 }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1) {
        drag.active = true
        drag.startX = e.touches[0].clientX
        drag.startY = e.touches[0].clientY
        drag.camX = camera.x
        drag.camY = camera.y
      } else if (e.touches.length === 2) {
        drag.active = false
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        pinch.startDist = Math.hypot(dx, dy)
        pinch.startScale = camera.scale
        pinch.midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        pinch.midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        pinch.startCamX = camera.x
        pinch.startCamY = camera.y
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1 && drag.active) {
        camera.x = drag.camX + (e.touches[0].clientX - drag.startX)
        camera.y = drag.camY + (e.touches[0].clientY - drag.startY)
        applyCamera()
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        const dist = Math.hypot(dx, dy)
        const factor = dist / pinch.startDist
        camera.scale = pinch.startScale * factor
        camera.x = pinch.midX - (pinch.midX - pinch.startCamX) * factor
        camera.y = pinch.midY - (pinch.midY - pinch.startCamY) * factor
        applyCamera()
      }
    }

    function onTouchEnd() {
      drag.active = false
    }

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
      app.destroy(false, { children: true, texture: true, baseTexture: true })
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

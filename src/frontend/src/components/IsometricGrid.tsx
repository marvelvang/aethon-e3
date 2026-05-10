import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import { renderIsometricGrid, GRID_SIZE, TILE_HALF_WIDTH, TILE_HALF_HEIGHT, tileTopVertex } from '../pixi/renderIsometricGrid'
import { loadBuildingTextures, type BuildingRenderConfig } from '../pixi/buildingAssets'
import { placeBuilding } from '../api/gameApi'
import type { components } from '../api/generated'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type BuildingType = UiBuildingSlot['type']
type UiState = components['schemas']['UiState']

interface Props {
  buildings: UiBuildingSlot[]
  gameId: number | null
  onBuildingPlaced: (state: UiState) => void
}

const CLICK_MOVE_THRESHOLD = 5

export default function IsometricGrid({ buildings, gameId, onBuildingPlaced }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const gridRef = useRef<PIXI.Container | null>(null)
  const hoverGraphicsRef = useRef<PIXI.Graphics | null>(null)
  const camera = useRef({ x: 0, y: 0, scale: 1 })
  const centerXRef = useRef(0)
  const offsetYRef = useRef(0)
  const gameIdRef = useRef<number | null>(null)
  const onBuildingPlacedRef = useRef(onBuildingPlaced)
  const [buildingTextures, setBuildingTextures] = useState<Map<BuildingType, BuildingRenderConfig>>(new Map())

  // Keep refs in sync with props so event handlers always see latest values
  useEffect(() => { gameIdRef.current = gameId }, [gameId])
  useEffect(() => { onBuildingPlacedRef.current = onBuildingPlaced }, [onBuildingPlaced])

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

  function screenToGrid(canvasX: number, canvasY: number): { col: number; row: number } | null {
    const cam = camera.current
    const gx = (canvasX - cam.x) / cam.scale
    const gy = (canvasY - cam.y) / cam.scale
    const u = (gx - centerXRef.current) / TILE_HALF_WIDTH
    const v = (gy - offsetYRef.current) / TILE_HALF_HEIGHT
    const col = Math.round((u + v) / 2)
    const row = Math.round((v - u) / 2)
    if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null
    return { col, row }
  }

  function updateHover(cell: { col: number; row: number } | null) {
    const g = hoverGraphicsRef.current
    if (!g) return
    g.clear()
    if (!cell) return
    const top = tileTopVertex(cell.col, cell.row, centerXRef.current, offsetYRef.current)
    g.lineStyle(2, 0xffffff, 1)
    g.beginFill(0, 0)
    g.drawPolygon([
      top.x, top.y,
      top.x + TILE_HALF_WIDTH, top.y + TILE_HALF_HEIGHT,
      top.x, top.y + TILE_HALF_HEIGHT * 2,
      top.x - TILE_HALF_WIDTH, top.y + TILE_HALF_HEIGHT,
    ])
    g.endFill()
  }

  async function handleCellClick(canvasX: number, canvasY: number) {
    const id = gameIdRef.current
    if (id === null) return
    const cell = screenToGrid(canvasX, canvasY)
    if (!cell) return
    try {
      const newState = await placeBuilding(id, { x: cell.col, y: cell.row, type: 'Housing' })
      onBuildingPlacedRef.current(newState)
    } catch (err) {
      console.error('placeBuilding failed:', err)
    }
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

    const gridVisualHeight = (GRID_SIZE - 1) * 2 * TILE_HALF_HEIGHT + TILE_HALF_HEIGHT * 2
    centerXRef.current = app.screen.width / 2
    offsetYRef.current = (app.screen.height - gridVisualHeight) / 2

    hoverGraphicsRef.current = new PIXI.Graphics()

    loadBuildingTextures().then(setBuildingTextures)

    const drag = { active: false, startX: 0, startY: 0, camX: 0, camY: 0, moved: false }
    const pinch = { startDist: 0, startScale: 1, midX: 0, midY: 0, startCamX: 0, startCamY: 0 }
    const tap = { startX: 0, startY: 0, moved: false }

    function onMouseDown(e: MouseEvent) {
      drag.active = true
      drag.moved = false
      drag.startX = e.clientX
      drag.startY = e.clientY
      drag.camX = camera.current.x
      drag.camY = camera.current.y
    }
    function onMouseMove(e: MouseEvent) {
      if (drag.active) {
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD * CLICK_MOVE_THRESHOLD) drag.moved = true
        camera.current.x = drag.camX + dx
        camera.current.y = drag.camY + dy
        applyCamera()
      }
      updateHover(screenToGrid(e.clientX, e.clientY))
    }
    function onMouseUp(e: MouseEvent) {
      if (drag.active && !drag.moved) {
        handleCellClick(e.clientX, e.clientY)
      }
      drag.active = false
    }
    function onMouseLeave() {
      drag.active = false
      updateHover(null)
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      zoomAt(e.clientX, e.clientY, Math.pow(2, -e.deltaY / 300))
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1) {
        drag.active = true
        drag.moved = false
        drag.startX = e.touches[0].clientX
        drag.startY = e.touches[0].clientY
        drag.camX = camera.current.x
        drag.camY = camera.current.y
        tap.startX = e.touches[0].clientX
        tap.startY = e.touches[0].clientY
        tap.moved = false
      } else if (e.touches.length === 2) {
        drag.active = false
        tap.moved = true
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
        const dx = e.touches[0].clientX - drag.startX
        const dy = e.touches[0].clientY - drag.startY
        if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD * CLICK_MOVE_THRESHOLD) {
          drag.moved = true
          tap.moved = true
        }
        camera.current.x = drag.camX + dx
        camera.current.y = drag.camY + dy
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
    function onTouchEnd(e: TouchEvent) {
      if (e.changedTouches.length === 1 && !tap.moved) {
        handleCellClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      }
      drag.active = false
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseLeave)
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
      if (hoverGraphicsRef.current) {
        gridRef.current.removeChild(hoverGraphicsRef.current)
      }
      app.stage.removeChild(gridRef.current)
      gridRef.current.destroy({ children: true })
    }

    gridRef.current = renderIsometricGrid(app, buildings, buildingTextures)
    if (hoverGraphicsRef.current) {
      gridRef.current.addChild(hoverGraphicsRef.current)
    }
    applyCamera()
  }, [buildings, buildingTextures])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

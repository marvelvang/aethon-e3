const CLICK_MOVE_THRESHOLD = 5
const LONG_PRESS_MS = 500

export interface InputHandlers {
  onPan: (newCamX: number, newCamY: number) => void
  onWheelZoom: (pivotX: number, pivotY: number, factor: number) => void
  onPinch: (rawFactor: number, midX: number, midY: number, startScale: number, startCamX: number, startCamY: number) => void
  onRotateView: (delta: 1 | -1) => void
  onResetView: () => void
  onClick: (x: number, y: number) => void
  onHover: (x: number, y: number) => void
  onHoverEnd: () => void
  onSelectionDragStart: (x: number, y: number) => boolean
  onSelectionDragUpdate: (x: number, y: number) => void
  onSelectionDragEnd: (x: number, y: number) => void
  onSelectionDragCancel: () => void
}

type MouseMode = 'idle' | 'pending-select' | 'selecting' | 'panning' | 'no-drag'

interface PanState { startX: number; startY: number; camX: number; camY: number }
interface PinchState {
  startDist: number; startScale: number
  midX: number; midY: number
  startCamX: number; startCamY: number
  startAngle: number; accumAngle: number
}

export class InputController {
  private canvas: HTMLCanvasElement
  private handlers: InputHandlers
  private getCameraState: () => { x: number; y: number; scale: number }

  private mouseMode: MouseMode = 'idle'
  private selectStartX = 0
  private selectStartY = 0
  private panState: PanState = { startX: 0, startY: 0, camX: 0, camY: 0 }
  private pinch: PinchState = { startDist: 0, startScale: 1, midX: 0, midY: 0, startCamX: 0, startCamY: 0, startAngle: 0, accumAngle: 0 }

  // Touch state
  private touchStartX = 0
  private touchStartY = 0
  private touchMoved = false
  private touchSelecting = false
  private touchPanning = false
  private longPressTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    canvas: HTMLCanvasElement,
    handlers: InputHandlers,
    getCameraState: () => { x: number; y: number; scale: number },
  ) {
    this.canvas = canvas
    this.handlers = handlers
    this.getCameraState = getCameraState
  }

  attach(): () => void {
    const c = this.canvas
    c.addEventListener('mousedown', this.onMouseDown)
    c.addEventListener('mousemove', this.onMouseMove)
    c.addEventListener('mouseup', this.onMouseUp)
    c.addEventListener('mouseleave', this.onMouseLeave)
    c.addEventListener('contextmenu', this.onContextMenu)
    c.addEventListener('touchstart', this.onTouchStart, { passive: false })
    c.addEventListener('touchmove', this.onTouchMove, { passive: false })
    c.addEventListener('touchend', this.onTouchEnd)
    document.addEventListener('wheel', this.onWheel, { passive: false })
    document.addEventListener('touchstart', this.onGlobalTouchStart, { passive: false })
    document.addEventListener('touchmove', this.onGlobalTouchMove, { passive: false })
    window.addEventListener('keydown', this.onKeyDown)

    return () => {
      c.removeEventListener('mousedown', this.onMouseDown)
      c.removeEventListener('mousemove', this.onMouseMove)
      c.removeEventListener('mouseup', this.onMouseUp)
      c.removeEventListener('mouseleave', this.onMouseLeave)
      c.removeEventListener('contextmenu', this.onContextMenu)
      c.removeEventListener('touchstart', this.onTouchStart)
      c.removeEventListener('touchmove', this.onTouchMove)
      c.removeEventListener('touchend', this.onTouchEnd)
      document.removeEventListener('wheel', this.onWheel)
      document.removeEventListener('touchstart', this.onGlobalTouchStart)
      document.removeEventListener('touchmove', this.onGlobalTouchMove)
      window.removeEventListener('keydown', this.onKeyDown)
      if (this.longPressTimer !== null) clearTimeout(this.longPressTimer)
    }
  }

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault()
  }

  // ── Mouse ──────────────────────────────────────────────────────────────────

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 2) {
      // Right-click → pan
      const cam = this.getCameraState()
      this.panState = { startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y }
      this.mouseMode = 'panning'
    } else if (e.button === 0) {
      // Left-click → potential selection
      this.selectStartX = e.clientX
      this.selectStartY = e.clientY
      this.mouseMode = 'pending-select'
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    if (this.mouseMode === 'panning') {
      const dx = e.clientX - this.panState.startX
      const dy = e.clientY - this.panState.startY
      this.handlers.onPan(this.panState.camX + dx, this.panState.camY + dy)
      return
    }

    if (this.mouseMode === 'pending-select') {
      const dx = e.clientX - this.selectStartX
      const dy = e.clientY - this.selectStartY
      if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD * CLICK_MOVE_THRESHOLD) {
        const accepted = this.handlers.onSelectionDragStart(this.selectStartX, this.selectStartY)
        this.mouseMode = accepted ? 'selecting' : 'no-drag'
        if (accepted) this.handlers.onSelectionDragUpdate(e.clientX, e.clientY)
      }
      return
    }

    if (this.mouseMode === 'selecting') {
      this.handlers.onSelectionDragUpdate(e.clientX, e.clientY)
      return
    }

    this.handlers.onHover(e.clientX, e.clientY)
  }

  private onMouseUp = (e: MouseEvent) => {
    if (this.mouseMode === 'pending-select' && e.button === 0) {
      this.handlers.onClick(e.clientX, e.clientY)
    } else if (this.mouseMode === 'selecting' && e.button === 0) {
      this.handlers.onSelectionDragEnd(e.clientX, e.clientY)
    }
    if (e.button === 0 || e.button === 2) this.mouseMode = 'idle'
  }

  private onMouseLeave = () => {
    if (this.mouseMode === 'selecting') {
      this.handlers.onSelectionDragCancel()
    }
    this.mouseMode = 'idle'
    this.handlers.onHoverEnd()
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    this.handlers.onWheelZoom(e.clientX, e.clientY, Math.pow(2, -e.deltaY / 300))
  }

  // ── Touch ──────────────────────────────────────────────────────────────────

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    if (e.touches.length !== 1) return

    const t = e.touches[0]
    this.touchStartX = t.clientX
    this.touchStartY = t.clientY
    this.touchMoved = false
    this.touchSelecting = false
    this.touchPanning = false

    if (this.longPressTimer !== null) clearTimeout(this.longPressTimer)
    this.longPressTimer = setTimeout(() => {
      this.longPressTimer = null
      if (!this.touchMoved && !this.touchPanning) {
        const accepted = this.handlers.onSelectionDragStart(this.touchStartX, this.touchStartY)
        if (accepted) this.touchSelecting = true
      }
    }, LONG_PRESS_MS)
  }

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (e.touches.length !== 1) return

    const t = e.touches[0]
    const dx = t.clientX - this.touchStartX
    const dy = t.clientY - this.touchStartY
    const movedBeyondThreshold = dx * dx + dy * dy > CLICK_MOVE_THRESHOLD * CLICK_MOVE_THRESHOLD

    if (movedBeyondThreshold && !this.touchMoved) {
      this.touchMoved = true
      if (!this.touchSelecting) {
        // Quick drag before long-press → pan
        if (this.longPressTimer !== null) { clearTimeout(this.longPressTimer); this.longPressTimer = null }
        if (!this.touchPanning) {
          const cam = this.getCameraState()
          this.panState = { startX: this.touchStartX, startY: this.touchStartY, camX: cam.x, camY: cam.y }
          this.touchPanning = true
        }
      }
    }

    if (this.touchSelecting) {
      this.handlers.onSelectionDragUpdate(t.clientX, t.clientY)
    } else if (this.touchPanning) {
      this.handlers.onPan(this.panState.camX + dx, this.panState.camY + dy)
    }
  }

  private onTouchEnd = (e: TouchEvent) => {
    if (this.longPressTimer !== null) { clearTimeout(this.longPressTimer); this.longPressTimer = null }
    const t = e.changedTouches[0]

    if (this.touchSelecting) {
      if (this.touchMoved) {
        this.handlers.onSelectionDragEnd(t.clientX, t.clientY)
      } else {
        // Long press without drag → treat as click
        this.handlers.onSelectionDragCancel()
        this.handlers.onClick(t.clientX, t.clientY)
      }
    } else if (!this.touchMoved) {
      this.handlers.onClick(t.clientX, t.clientY)
    }

    this.touchSelecting = false
    this.touchPanning = false
    this.touchMoved = false
  }

  // ── Two-finger pinch (global) ──────────────────────────────────────────────

  private onGlobalTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const cam = this.getCameraState()
      // Cancel any single-touch in progress
      if (this.longPressTimer !== null) { clearTimeout(this.longPressTimer); this.longPressTimer = null }
      if (this.touchSelecting) { this.handlers.onSelectionDragCancel(); this.touchSelecting = false }
      this.touchMoved = true
      this.touchPanning = false
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      this.pinch = {
        startDist: Math.hypot(dx, dy),
        startScale: cam.scale,
        midX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        midY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        startCamX: cam.x,
        startCamY: cam.y,
        startAngle: Math.atan2(dy, dx),
        accumAngle: 0,
      }
    }
  }

  private onGlobalTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const rawFactor = Math.hypot(dx, dy) / this.pinch.startDist
      this.handlers.onPinch(rawFactor, this.pinch.midX, this.pinch.midY, this.pinch.startScale, this.pinch.startCamX, this.pinch.startCamY)

      const currentAngle = Math.atan2(dy, dx)
      let delta = currentAngle - this.pinch.startAngle
      if (delta > Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI
      this.pinch.accumAngle += delta
      this.pinch.startAngle = currentAngle

      if (this.pinch.accumAngle > Math.PI / 4) {
        this.handlers.onRotateView(+1)
        this.pinch.accumAngle = 0
      } else if (this.pinch.accumAngle < -Math.PI / 4) {
        this.handlers.onRotateView(-1)
        this.pinch.accumAngle = 0
      }
    }
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === 'q' || e.key === 'Q') this.handlers.onRotateView(-1)
    if (e.key === 'e' || e.key === 'E') this.handlers.onRotateView(+1)
    if (e.key === ' ') { e.preventDefault(); this.handlers.onResetView() }
    if (e.key === 'Escape') {
      if (this.mouseMode === 'selecting') { this.handlers.onSelectionDragCancel(); this.mouseMode = 'idle' }
      if (this.touchSelecting) { this.handlers.onSelectionDragCancel(); this.touchSelecting = false }
    }
  }
}

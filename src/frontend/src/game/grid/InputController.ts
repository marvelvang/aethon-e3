const CLICK_MOVE_THRESHOLD = 5

export interface InputHandlers {
  onDrag: (newCamX: number, newCamY: number) => void
  onWheelZoom: (pivotX: number, pivotY: number, factor: number) => void
  onPinch: (rawFactor: number, midX: number, midY: number, startScale: number, startCamX: number, startCamY: number) => void
  onRotateView: (delta: 1 | -1) => void
  onClick: (x: number, y: number) => void
  onHover: (x: number, y: number) => void
  onHoverEnd: () => void
}

interface DragState { active: boolean; startX: number; startY: number; camX: number; camY: number; moved: boolean }
interface PinchState {
  startDist: number
  startScale: number
  midX: number; midY: number
  startCamX: number; startCamY: number
  startAngle: number
  accumAngle: number
}
interface TapState { startX: number; startY: number; moved: boolean }

export class InputController {
  private canvas: HTMLCanvasElement
  private handlers: InputHandlers
  private getCameraState: () => { x: number; y: number; scale: number }

  private drag: DragState = { active: false, startX: 0, startY: 0, camX: 0, camY: 0, moved: false }
  private pinch: PinchState = { startDist: 0, startScale: 1, midX: 0, midY: 0, startCamX: 0, startCamY: 0, startAngle: 0, accumAngle: 0 }
  private tap: TapState = { startX: 0, startY: 0, moved: false }

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
    c.addEventListener('wheel', this.onWheel, { passive: false })
    c.addEventListener('touchstart', this.onTouchStart, { passive: false })
    c.addEventListener('touchmove', this.onTouchMove, { passive: false })
    c.addEventListener('touchend', this.onTouchEnd)
    window.addEventListener('keydown', this.onKeyDown)

    return () => {
      c.removeEventListener('mousedown', this.onMouseDown)
      c.removeEventListener('mousemove', this.onMouseMove)
      c.removeEventListener('mouseup', this.onMouseUp)
      c.removeEventListener('mouseleave', this.onMouseLeave)
      c.removeEventListener('wheel', this.onWheel)
      c.removeEventListener('touchstart', this.onTouchStart)
      c.removeEventListener('touchmove', this.onTouchMove)
      c.removeEventListener('touchend', this.onTouchEnd)
      window.removeEventListener('keydown', this.onKeyDown)
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    const cam = this.getCameraState()
    this.drag = { active: true, moved: false, startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y }
  }

  private onMouseMove = (e: MouseEvent) => {
    if (this.drag.active) {
      const dx = e.clientX - this.drag.startX
      const dy = e.clientY - this.drag.startY
      if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD * CLICK_MOVE_THRESHOLD) this.drag.moved = true
      this.handlers.onDrag(this.drag.camX + dx, this.drag.camY + dy)
    }
    this.handlers.onHover(e.clientX, e.clientY)
  }

  private onMouseUp = (e: MouseEvent) => {
    if (this.drag.active && !this.drag.moved) {
      this.handlers.onClick(e.clientX, e.clientY)
    }
    this.drag.active = false
  }

  private onMouseLeave = () => {
    this.drag.active = false
    this.handlers.onHoverEnd()
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    this.handlers.onWheelZoom(e.clientX, e.clientY, Math.pow(2, -e.deltaY / 300))
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    const cam = this.getCameraState()
    if (e.touches.length === 1) {
      this.drag = { active: true, moved: false, startX: e.touches[0].clientX, startY: e.touches[0].clientY, camX: cam.x, camY: cam.y }
      this.tap = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, moved: false }
    } else if (e.touches.length === 2) {
      this.drag.active = false
      this.tap.moved = true
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

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && this.drag.active) {
      const dx = e.touches[0].clientX - this.drag.startX
      const dy = e.touches[0].clientY - this.drag.startY
      if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD * CLICK_MOVE_THRESHOLD) {
        this.drag.moved = true
        this.tap.moved = true
      }
      this.handlers.onDrag(this.drag.camX + dx, this.drag.camY + dy)
    } else if (e.touches.length === 2) {
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

  private onTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length === 1 && !this.tap.moved) {
      this.handlers.onClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }
    this.drag.active = false
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'q' || e.key === 'Q') this.handlers.onRotateView(-1)
    if (e.key === 'e' || e.key === 'E') this.handlers.onRotateView(+1)
  }
}

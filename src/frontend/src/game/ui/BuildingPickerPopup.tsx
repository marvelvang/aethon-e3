import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { components } from '../../api/generated'
import { BUILDING_TYPES, type BuildingType } from '../../domain/buildingTypes'
import { POPULATION_DEF, RESOURCES_BY_KEY } from '../../domain/resources'
import './BuildingPickerPopup.css'

type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']

type TileBounds = { minX: number; maxX: number; minY: number; maxY: number }

interface Props {
  buildingTypes: UiBuildingTypeInfo[]
  tileBounds: TileBounds
  onSelect: (type: BuildingType) => void
  onDismiss: () => void
}

const POPUP_WIDTH = 160
const GAP = 8
const MARGIN = 8

function computePosition(tileBounds: TileBounds, popupH: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const tileCenterX = (tileBounds.minX + tileBounds.maxX) / 2
  const tileCenterY = (tileBounds.minY + tileBounds.maxY) / 2

  const spaceAbove = tileBounds.minY - GAP
  const spaceBelow = vh - tileBounds.maxY - GAP
  const spaceLeft = tileBounds.minX - GAP
  const spaceRight = vw - tileBounds.maxX - GAP

  let top: number
  let left: number

  if (spaceAbove >= popupH) {
    top = tileBounds.minY - GAP - popupH
    left = tileCenterX - POPUP_WIDTH / 2
  } else if (spaceBelow >= popupH) {
    top = tileBounds.maxY + GAP
    left = tileCenterX - POPUP_WIDTH / 2
  } else if (spaceRight >= POPUP_WIDTH) {
    left = tileBounds.maxX + GAP
    top = Math.max(MARGIN, Math.min(tileCenterY - popupH / 2, vh - popupH - MARGIN))
  } else if (spaceLeft >= POPUP_WIDTH) {
    left = tileBounds.minX - GAP - POPUP_WIDTH
    top = Math.max(MARGIN, Math.min(tileCenterY - popupH / 2, vh - popupH - MARGIN))
  } else {
    const maxVertical = Math.max(spaceAbove, spaceBelow)
    const maxHorizontal = Math.max(spaceLeft, spaceRight)
    if (maxVertical >= maxHorizontal) {
      top = spaceAbove >= spaceBelow
        ? Math.max(MARGIN, tileBounds.minY - GAP - popupH)
        : Math.min(vh - popupH - MARGIN, tileBounds.maxY + GAP)
      left = tileCenterX - POPUP_WIDTH / 2
    } else {
      left = spaceRight >= spaceLeft
        ? Math.min(vw - POPUP_WIDTH - MARGIN, tileBounds.maxX + GAP)
        : Math.max(MARGIN, tileBounds.minX - GAP - POPUP_WIDTH)
      top = Math.max(MARGIN, Math.min(tileCenterY - popupH / 2, vh - popupH - MARGIN))
    }
  }

  left = Math.max(MARGIN, Math.min(left, vw - POPUP_WIDTH - MARGIN))
  top = Math.max(MARGIN, Math.min(top, vh - popupH - MARGIN))

  return { top, left }
}

export default function BuildingPickerPopup({ buildingTypes, tileBounds, onSelect, onDismiss }: Props) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [focusedType, setFocusedType] = useState<string | null>(null)
  const [touchedType, setTouchedType] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchWasLongRef = useRef(false)
  const skipNextClickRef = useRef(false)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useLayoutEffect(() => {
    const el = popupRef.current
    if (!el) return
    setPosition(computePosition(tileBounds, el.offsetHeight))
  }, [tileBounds, buildingTypes])

  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismissRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onOutside(e: MouseEvent | TouchEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onDismissRef.current()
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    }
  }, [])

  function handleItemTouchStart(type: string) {
    touchWasLongRef.current = false
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(() => {
      touchWasLongRef.current = true
      setTouchedType(type)
    }, 300)
  }

  function handleItemTouchEnd() {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current)
      touchTimerRef.current = null
    }
    setTouchedType(null)
    if (touchWasLongRef.current) {
      skipNextClickRef.current = true
      // auto-clear: some browsers don't fire a synthetic click after long-press,
      // so the flag would otherwise block the next real tap
      setTimeout(() => { skipNextClickRef.current = false }, 150)
    }
    touchWasLongRef.current = false
  }

  function handleItemTouchMove() {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current)
      touchTimerRef.current = null
    }
    setTouchedType(null)
    touchWasLongRef.current = false
  }

  const tooltipType = touchedType ?? hoveredType ?? focusedType
  const tooltipInfo = tooltipType ? buildingTypes.find(b => b.type === tooltipType) : null
  const tooltipMeta = tooltipInfo ? BUILDING_TYPES[tooltipInfo.type as BuildingType] : null

  const tooltipEl = tooltipInfo && tooltipMeta && (() => {
    const itemEl = itemRefs.current[tooltipInfo.type]
    if (!itemEl || !position) return null
    const rect = itemEl.getBoundingClientRect()
    const tooltipW = 130
    let tLeft = rect.right + 6
    if (tLeft + tooltipW > window.innerWidth - MARGIN) {
      tLeft = rect.left - tooltipW - 6
    }
    return (
      <div
        className="picker-tooltip"
        style={{ top: rect.top, left: tLeft, width: tooltipW }}
      >
        <span className="picker-tooltip-label">{tooltipMeta.label}</span>
        <div className="picker-tooltip-costs">
          <span style={{ color: POPULATION_DEF.color }}>{POPULATION_DEF.shortLabel} {tooltipInfo.populationCost}</span>
          {Number(tooltipInfo.industryCost) > 0 && (
            <span style={{ color: RESOURCES_BY_KEY.industry.color }}>{RESOURCES_BY_KEY.industry.shortLabel} {tooltipInfo.industryCost}</span>
          )}
          {Number(tooltipInfo.energyCost) > 0 && (
            <span style={{ color: RESOURCES_BY_KEY.energy.color }}>{RESOURCES_BY_KEY.energy.shortLabel} {tooltipInfo.energyCost}</span>
          )}
        </div>
      </div>
    )
  })()

  const style: React.CSSProperties = position
    ? { left: position.left, top: position.top, width: POPUP_WIDTH }
    : { visibility: 'hidden', top: 0, left: 0, width: POPUP_WIDTH }

  return (
    <>
      <div
        ref={popupRef}
        className="picker-popup"
        style={style}
        onContextMenu={e => e.preventDefault()}
      >
        {buildingTypes.map((info, idx) => {
          const type = info.type as BuildingType
          const meta = BUILDING_TYPES[type]
          const isActive =
            (hoveredType === info.type || focusedType === info.type || touchedType === info.type) &&
            info.canAfford
          return (
            <div
              key={info.type}
              ref={el => { itemRefs.current[info.type] = el }}
              tabIndex={idx === 0 ? 0 : -1}
              onClick={() => {
                if (skipNextClickRef.current) { skipNextClickRef.current = false; return }
                if (info.canAfford) onSelect(type)
              }}
              onMouseEnter={() => setHoveredType(info.type)}
              onMouseLeave={() => setHoveredType(null)}
              onFocus={() => setFocusedType(info.type)}
              onBlur={() => setFocusedType(null)}
              onTouchStart={() => handleItemTouchStart(info.type)}
              onTouchEnd={handleItemTouchEnd}
              onTouchMove={handleItemTouchMove}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ' ') && info.canAfford) {
                  e.preventDefault()
                  onSelect(type)
                }
                const types = buildingTypes.map(b => b.type)
                const cur = types.indexOf(info.type)
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  itemRefs.current[types[(cur + 1) % types.length]]?.focus()
                }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  itemRefs.current[types[(cur - 1 + types.length) % types.length]]?.focus()
                }
              }}
              className={[
                'picker-item',
                isActive ? 'picker-item--hover' : '',
                info.canAfford ? '' : 'picker-item--disabled',
              ].filter(Boolean).join(' ')}
            >
              <img src={meta.assetPath} alt={meta.label} className="picker-item-img" />
            </div>
          )
        })}
      </div>
      {tooltipEl}
    </>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { components } from '../../api/generated'
import { BUILDING_TYPES, type BuildingType } from '../../domain/buildingTypes'
import './BuildingPickerPopup.css'

type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']

type TileBounds = { minX: number; maxX: number; minY: number; maxY: number }

interface Props {
  buildingTypes: UiBuildingTypeInfo[]
  tileBounds: TileBounds
  onSelect: (type: BuildingType) => void
  onDismiss: () => void
}

const POPUP_WIDTH = 200
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
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    const el = popupRef.current
    if (!el) return
    setPosition(computePosition(tileBounds, el.offsetHeight))
  }, [tileBounds, buildingTypes])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const style: React.CSSProperties = position
    ? { left: position.left, top: position.top, width: POPUP_WIDTH }
    : { visibility: 'hidden', top: 0, left: 0, width: POPUP_WIDTH }

  return (
    <>
      <div className="picker-backdrop" onClick={onDismiss} />
      <div ref={popupRef} className="picker-popup" style={style}>
        {buildingTypes.map((info) => {
          const type = info.type as BuildingType
          const meta = BUILDING_TYPES[type]
          const isHovered = hoveredType === info.type && info.canAfford
          return (
            <div
              key={info.type}
              onClick={() => { if (info.canAfford) onSelect(type) }}
              onMouseEnter={() => setHoveredType(info.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`picker-item${isHovered ? ' picker-item--hover' : ''}${info.canAfford ? '' : ' picker-item--disabled'}`}
            >
              <img
                src={meta.assetPath}
                alt={meta.label}
                className="picker-item-img"
              />
              <span className="picker-item-label">{meta.label}</span>
              <div className="picker-item-costs">
                <span style={{ color: 'var(--color-population)' }}>Pop {info.populationCost}</span>
                {Number(info.industryCost) > 0 && (
                  <span style={{ color: 'var(--color-industry)' }}>Ind {info.industryCost}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

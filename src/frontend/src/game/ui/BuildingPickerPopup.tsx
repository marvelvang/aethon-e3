import { useEffect, useState } from 'react'
import type { components } from '../../api/generated'
import { BUILDING_TYPES, type BuildingType } from '../../domain/buildingTypes'
import './BuildingPickerPopup.css'

type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']

interface Props {
  buildingTypes: UiBuildingTypeInfo[]
  screenX: number
  screenY: number
  onSelect: (type: BuildingType) => void
  onDismiss: () => void
}

const POPUP_WIDTH = 200
const POPUP_HEIGHT = 270
const OFFSET = 12
const MARGIN = 8

function computePosition(screenX: number, screenY: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const spaceAbove = screenY - OFFSET
  const spaceBelow = vh - screenY - OFFSET

  let top: number
  if (spaceAbove >= POPUP_HEIGHT) {
    top = screenY - POPUP_HEIGHT - OFFSET
  } else if (spaceBelow >= POPUP_HEIGHT) {
    top = screenY + OFFSET
  } else {
    top = spaceAbove >= spaceBelow
      ? Math.max(MARGIN, screenY - POPUP_HEIGHT - OFFSET)
      : Math.min(vh - POPUP_HEIGHT - MARGIN, screenY + OFFSET)
  }

  let left = screenX - POPUP_WIDTH / 2
  left = Math.max(MARGIN, Math.min(left, vw - POPUP_WIDTH - MARGIN))

  return { top, left }
}

export default function BuildingPickerPopup({ buildingTypes, screenX, screenY, onSelect, onDismiss }: Props) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const { top, left } = computePosition(screenX, screenY)

  return (
    <>
      <div className="picker-backdrop" onClick={onDismiss} />
      <div className="picker-popup" style={{ left, top, width: POPUP_WIDTH }}>
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

import { useEffect, useState } from 'react'
import type { components } from '../api/generated'

type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']
type BuildingType = components['schemas']['BuildingType']

interface Props {
  buildingTypes: UiBuildingTypeInfo[]
  screenX: number
  screenY: number
  onSelect: (type: BuildingType) => void
  onDismiss: () => void
}

const DISPLAY_NAMES: Record<string, string> = {
  Housing: 'Wohngebäude',
  Consumer: 'Güterwerk',
  Industry: 'Industriewerk',
}

const POPUP_WIDTH = 200
const POPUP_HEIGHT = 270
const OFFSET = 12
const MARGIN = 8

export default function BuildingPickerPopup({ buildingTypes, screenX, screenY, onSelect, onDismiss }: Props) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

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

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 199 }}
        onClick={onDismiss}
      />
      <div style={{
        position: 'fixed',
        left,
        top,
        width: POPUP_WIDTH,
        zIndex: 200,
        background: 'rgba(10,10,10,0.92)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
        userSelect: 'none',
      }}>
        {buildingTypes.map(info => {
          const isHovered = hoveredType === info.type && info.canAfford
          return (
            <div
              key={info.type}
              onClick={() => { if (info.canAfford) onSelect(info.type) }}
              onMouseEnter={() => setHoveredType(info.type)}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 6px',
                borderRadius: 7,
                border: '1px solid rgba(255,255,255,0.08)',
                background: isHovered ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                cursor: info.canAfford ? 'pointer' : 'not-allowed',
                opacity: info.canAfford ? 1 : 0.35,
                transition: 'background 0.1s',
              }}
            >
              <img
                src={`/assets/buildings/${info.type.toLowerCase()}.svg`}
                alt={DISPLAY_NAMES[info.type] ?? info.type}
                style={{ width: 48, height: 48, objectFit: 'contain' }}
              />
              <span style={{
                color: '#fff',
                fontSize: 11,
                fontFamily: 'monospace',
                textAlign: 'center',
              }}>
                {DISPLAY_NAMES[info.type] ?? info.type}
              </span>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, fontFamily: 'monospace' }}>
                <span style={{ color: '#7ec8e3' }}>Pop {info.populationCost}</span>
                {info.industryCost > 0 && (
                  <span style={{ color: '#ffb74d' }}>Ind {info.industryCost}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

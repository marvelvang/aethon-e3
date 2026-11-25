import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { UiBuildingTypeInfo } from '@aethon/models'
import { BUILDING_FAMILIES, BUILDING_META, type BuildingType } from '../../presentation/buildingTypes'
import { POPULATION_DEF, RESOURCES_BY_KEY } from '../../presentation/resources'
import './BuildingPickerPopup.css'

type TileBounds = { minX: number; maxX: number; minY: number; maxY: number }

interface Props {
  buildingTypes: UiBuildingTypeInfo[]
  tileBounds: TileBounds | null
  visible: boolean
  resources: { freePopulation: number; industry: number; energy: number } | null
  onSelect: (type: BuildingType) => void
  onDismiss: () => void
}

const POPUP_WIDTH = 160

const RESEARCH_BRANCH_LABEL: Record<string, string> = {
  Housing: 'Wohnbau',
  Consumer: 'Güter',
  Industry: 'Industrie',
  Energy: 'Energie',
}
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

const SHORTAGE_COLOR = 'rgba(255, 200, 80, 0.9)'

export default function BuildingPickerPopup({ buildingTypes, tileBounds, visible, resources, onSelect, onDismiss }: Props) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [focusedType, setFocusedType] = useState<string | null>(null)
  const [touchedType, setTouchedType] = useState<string | null>(null)
  // Nested picker: null = category view (one entry per family, represented by
  // its tier-1 building); a family key = tier view with that family's 5 tiers.
  const [selectedFamily, setSelectedFamily] = useState<BuildingType | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchWasLongRef = useRef(false)
  const skipNextClickRef = useRef(false)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Keep last valid bounds so position stays stable while transitioning to hidden
  const lastBoundsRef = useRef<TileBounds | null>(null)
  if (visible && tileBounds) lastBoundsRef.current = tileBounds
  const effectiveBounds = lastBoundsRef.current

  // Cache popup height so subsequent opens can position immediately (single render)
  const cachedHeightRef = useRef<number>(0)

  // Compute position as soon as bounds + height are known.
  // After first open, cachedHeightRef is set and position can be derived inline
  // without waiting for a second render from useLayoutEffect.
  const immediatePosition = visible && effectiveBounds && cachedHeightRef.current > 0
    ? computePosition(effectiveBounds, cachedHeightRef.current)
    : null

  useLayoutEffect(() => {
    if (!visible || !effectiveBounds) return
    const el = popupRef.current
    if (!el) return
    const h = el.offsetHeight
    cachedHeightRef.current = h
    setPosition(computePosition(effectiveBounds, h))
  }, [visible, effectiveBounds, selectedFamily])

  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  // Every close (dismiss or successful selection) restarts at the category view
  useEffect(() => {
    if (!visible) {
      setSelectedFamily(null)
      setHoveredType(null)
      setFocusedType(null)
      setTouchedType(null)
    }
  }, [visible])

  // Keyboard dismiss — only active when visible
  useEffect(() => {
    if (!visible) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismissRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible])

  // Outside-click dismiss — only active when visible
  useEffect(() => {
    if (!visible) return
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
  }, [visible])

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

  // Items for the current view: family representatives (T1 buildings) in the
  // category view, or the selected family's five tiers.
  const isCategoryView = selectedFamily === null
  const infoByType = new Map(buildingTypes.map(b => [b.type, b]))
  const displayedInfos: UiBuildingTypeInfo[] = (
    isCategoryView
      ? BUILDING_FAMILIES.map(f => infoByType.get(f.key))
      : (BUILDING_FAMILIES.find(f => f.key === selectedFamily)?.tiers ?? []).map(t => infoByType.get(t))
  ).filter((i): i is UiBuildingTypeInfo => i !== undefined)

  function handleItemSelect(info: UiBuildingTypeInfo): void {
    if (isCategoryView) {
      // Clear ALL tooltip sources. The tap that opens the tier view focuses
      // the category item, and since category and first tier share the same
      // React key the element stays focused across the view switch — without
      // this the tooltip would pop up immediately (instead of only on
      // hover / touch long-press).
      setHoveredType(null)
      setTouchedType(null)
      setFocusedType(null)
      setSelectedFamily(info.type)
      return
    }
    if (info.canAfford) onSelect(info.type as BuildingType)
  }

  const tooltipType = touchedType ?? hoveredType ?? focusedType
  const tooltipInfo = tooltipType ? buildingTypes.find(b => b.type === tooltipType) : null
  const tooltipMeta = tooltipInfo ? BUILDING_META[tooltipInfo.type as BuildingType] : null

  const tooltipEl = visible && tooltipInfo && tooltipMeta && (() => {
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
        {!isCategoryView && (() => {
          const r = resources
          const popShort = r !== null && r.freePopulation < tooltipInfo.populationCost
          const indShort = r !== null && Number(tooltipInfo.industryCost) > 0 && r.industry < tooltipInfo.industryCost
          const eneShort = r !== null && Number(tooltipInfo.energyCost) > 0 && r.energy < tooltipInfo.energyCost
          const CostItem = ({ label, value, short, color }: { label: string; value: number; short: boolean; color: string }) => (
            short ? (
              <div className="picker-tooltip-cost-item picker-tooltip-cost-item--short">
                <span style={{ color, gridColumn: 2 }}>{label}</span>
                <span className="picker-tooltip-cost-icon" style={{ color: SHORTAGE_COLOR }}>⚠</span>
                <span style={{ color: SHORTAGE_COLOR }}>{value}</span>
              </div>
            ) : (
              <div className="picker-tooltip-cost-item">
                <span style={{ color }}>{label}</span>
                <span style={{ color }}>{value}</span>
              </div>
            )
          )
          return (
            <div className="picker-tooltip-costs">
              <CostItem label={POPULATION_DEF.shortLabel} value={tooltipInfo.populationCost} short={popShort} color={POPULATION_DEF.color} />
              {Number(tooltipInfo.industryCost) > 0 && <CostItem label={RESOURCES_BY_KEY.industry.shortLabel} value={tooltipInfo.industryCost} short={indShort} color={RESOURCES_BY_KEY.industry.color} />}
              {Number(tooltipInfo.energyCost) > 0 && <CostItem label={RESOURCES_BY_KEY.energy.shortLabel} value={tooltipInfo.energyCost} short={eneShort} color={RESOURCES_BY_KEY.energy.color} />}
            </div>
          )
        })()}
        {!isCategoryView && !tooltipInfo.researchUnlocked && tooltipInfo.requiredResearch && (
          <div className="picker-tooltip-research">
            🔒 {tooltipInfo.requiredResearch.map(r => `${RESEARCH_BRANCH_LABEL[r.branch]} Lvl ${r.level}`).join(' + ')}
          </div>
        )}
      </div>
    )
  })()

  const displayPosition = immediatePosition ?? position
  const style: React.CSSProperties = visible && displayPosition
    ? { left: displayPosition.left, top: displayPosition.top, width: POPUP_WIDTH }
    : { visibility: 'hidden', pointerEvents: 'none', position: 'fixed', top: -9999, left: -9999, width: POPUP_WIDTH }

  return (
    <>
      <div
        ref={popupRef}
        className="picker-popup"
        style={style}
        onContextMenu={e => e.preventDefault()}
      >
        {displayedInfos.map((info, idx) => {
          const type = info.type as BuildingType
          const meta = BUILDING_META[type]
          // Categories are always selectable (they open the tier view);
          // tiers follow the canAfford gating.
          const isSelectable = isCategoryView || info.canAfford
          const isActive =
            (hoveredType === info.type || focusedType === info.type || touchedType === info.type) &&
            isSelectable
          return (
            <div
              key={info.type}
              ref={el => { itemRefs.current[info.type] = el }}
              tabIndex={idx === 0 ? 0 : -1}
              onClick={() => {
                if (skipNextClickRef.current) { skipNextClickRef.current = false; return }
                handleItemSelect(info)
              }}
              onMouseEnter={() => setHoveredType(info.type)}
              onMouseLeave={() => setHoveredType(null)}
              onFocus={() => setFocusedType(info.type)}
              onBlur={() => setFocusedType(null)}
              onTouchStart={() => handleItemTouchStart(info.type)}
              onTouchEnd={handleItemTouchEnd}
              onTouchMove={handleItemTouchMove}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleItemSelect(info)
                }
                const types = displayedInfos.map(b => b.type)
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
                isSelectable ? '' : 'picker-item--disabled',
              ].filter(Boolean).join(' ')}
            >
              <img className="picker-item-img" src={meta.assetPath} alt="" />
            </div>
          )
        })}
      </div>
      {tooltipEl}
    </>
  )
}

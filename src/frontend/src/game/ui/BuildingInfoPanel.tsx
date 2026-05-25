import type { components } from '../../api/generated'
import { BUILDING_TYPES, type BuildingType } from '../../domain/buildingTypes'
import { RESOURCES } from '../../domain/resources'
import './BuildingInfoPanel.css'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type UiBuildingTypeInfo = components['schemas']['UiBuildingTypeInfo']

interface Props {
  building: UiBuildingSlot | null
  buildingTypes: UiBuildingTypeInfo[]
}

interface InfoRow {
  label: string
  color: string
  value: number
  prefix: string
}

const COLOR_BY_KEY: Record<string, string> = Object.fromEntries(
  RESOURCES.map((r) => [r.key, r.color])
)

function productionRows(info: UiBuildingTypeInfo): InfoRow[] {
  const rows: InfoRow[] = []
  if (Number(info.consumerGoodsProduction) > 0) {
    rows.push({ label: 'Güter', color: COLOR_BY_KEY.consumerGoods, value: Number(info.consumerGoodsProduction), prefix: '+' })
  }
  if (Number(info.industryProduction) > 0) {
    rows.push({ label: 'Industrie', color: COLOR_BY_KEY.industry, value: Number(info.industryProduction), prefix: '+' })
  }
  if (Number(info.energyProduction) > 0) {
    rows.push({ label: 'Energie', color: COLOR_BY_KEY.energy, value: Number(info.energyProduction), prefix: '+' })
  }
  if (Number(info.housingContribution) > 0) {
    rows.push({ label: 'Wohnraum', color: COLOR_BY_KEY.housing, value: Number(info.housingContribution), prefix: '+' })
  }
  return rows
}

function maintenanceRows(info: UiBuildingTypeInfo): InfoRow[] {
  const rows: InfoRow[] = []
  if (Number(info.maintenancePopulationCost) > 0) {
    rows.push({ label: 'Bevölkerung', color: COLOR_BY_KEY.population, value: Number(info.maintenancePopulationCost), prefix: '' })
  }
  if (Number(info.maintenanceIndustryCost) > 0) {
    rows.push({ label: 'Industrie', color: COLOR_BY_KEY.industry, value: Number(info.maintenanceIndustryCost), prefix: '-' })
  }
  if (Number(info.maintenanceEnergyCost) > 0) {
    rows.push({ label: 'Energie', color: COLOR_BY_KEY.energy, value: Number(info.maintenanceEnergyCost), prefix: '-' })
  }
  return rows
}

export default function BuildingInfoPanel({ building, buildingTypes }: Props) {
  if (!building) return null
  const info = buildingTypes.find((t) => t.type === building.type)
  if (!info) return null

  const prodRows = productionRows(info)
  const maintRows = maintenanceRows(info)
  const label = BUILDING_TYPES[building.type as BuildingType].label

  return (
    <div className="building-info-panel">
      <span className="building-info-title">{label}</span>
      {prodRows.length > 0 && (
        <>
          <div className="building-info-divider" />
          <div className="building-info-rows">
            {prodRows.map((r) => (
              <div key={r.label} className="building-info-row">
                <span className="building-info-row-label">{r.label}</span>
                <span className="building-info-row-value" style={{ color: r.color }}>
                  {r.prefix}{r.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {maintRows.length > 0 && (
        <>
          <div className="building-info-divider" />
          <span className="building-info-section-label">Wartung / Runde</span>
          <div className="building-info-rows">
            {maintRows.map((r) => (
              <div key={r.label} className="building-info-row">
                <span className="building-info-row-label">{r.label}</span>
                <span className="building-info-row-value" style={{ color: r.color }}>
                  {r.prefix}{r.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

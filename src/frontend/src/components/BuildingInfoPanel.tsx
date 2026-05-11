import './BuildingInfoPanel.css'
import type { components } from '../api/generated'

type UiBuildingSlot = components['schemas']['UiBuildingSlot']
type BuildingType = UiBuildingSlot['type']

interface Props {
  building: UiBuildingSlot | null
}

interface Provision {
  label: string
  color: string
  value: number
}

const PROVISIONS: Record<BuildingType, Provision[]> = {
  Base: [
    { label: 'Güter',     color: '#8bc34a', value: 100 },
    { label: 'Industrie', color: '#ffb74d', value: 200 },
    { label: 'Wohnraum',  color: '#ba68c8', value: 150 },
  ],
  Industry: [
    { label: 'Güter',     color: '#8bc34a', value: 10 },
    { label: 'Industrie', color: '#ffb74d', value: 50 },
  ],
  Consumer: [
    { label: 'Güter',     color: '#8bc34a', value: 40 },
  ],
  Housing: [
    { label: 'Wohnraum',  color: '#ba68c8', value: 20 },
  ],
}

const TYPE_LABEL: Record<BuildingType, string> = {
  Base:     'Basis',
  Industry: 'Industrie',
  Consumer: 'Konsumgüter',
  Housing:  'Wohngebäude',
}

export default function BuildingInfoPanel({ building }: Props) {
  if (!building) return null

  const provisions = PROVISIONS[building.type]

  return (
    <div className="building-info-panel">
      <span className="building-info-title">{TYPE_LABEL[building.type]}</span>
      <div className="building-info-divider" />
      <div className="building-info-rows">
        {provisions.map(p => (
          <div key={p.label} className="building-info-row">
            <span className="building-info-row-label">{p.label}</span>
            <span className="building-info-row-value" style={{ color: p.color }}>
              +{p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

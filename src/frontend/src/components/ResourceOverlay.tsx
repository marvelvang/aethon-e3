import './ResourceOverlay.css'
import type { components } from '../api/generated'

type UiState = components['schemas']['UiState']

interface Props {
  state: UiState | null
}

interface ResourceDef {
  key: keyof UiState
  label: string
  color: string
}

const RESOURCES: ResourceDef[] = [
  { key: 'population',   label: 'Population', color: '#7ec8e3' },
  { key: 'consumerGoods', label: 'Güter',      color: '#8bc34a' },
  { key: 'industry',     label: 'Industrie',  color: '#ffb74d' },
  { key: 'housing',      label: 'Wohnraum',   color: '#ba68c8' },
]

export default function ResourceOverlay({ state }: Props) {
  return (
    <div className="resource-overlay">
      {RESOURCES.map(r => {
        const value = state ? (state[r.key] as number) : null
        return (
          <div key={r.key} className="resource-card">
            <span className="resource-value" style={{ color: r.color }}>
              {value ?? '—'}
            </span>
            <span className="resource-label">{r.label}</span>
            <div className="resource-bar" style={{ background: r.color }} />
          </div>
        )
      })}
    </div>
  )
}

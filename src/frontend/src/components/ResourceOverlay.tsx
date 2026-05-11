import './ResourceOverlay.css'
import type { components } from '../api/generated'

type UiState = components['schemas']['UiState']

interface Props {
  state: UiState | null
}

type NumericUiStateKey = 'population' | 'consumerGoods' | 'industry' | 'housing'

interface ResourceDef {
  key: NumericUiStateKey
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
        const value = state ? state[r.key] : null
        const isPopulation = r.key === 'population'
        const freeValue = isPopulation && state ? state.freePopulation : null
        return (
          <div key={r.key} className="resource-card">
            {isPopulation ? (
              <span className="resource-value" style={{ color: r.color }}>
                <span className="resource-value-main">{value ?? '—'}</span>
                <span className="resource-value-sep">/</span>
                <span className="resource-value-free">{freeValue ?? '—'}</span>
              </span>
            ) : (
              <span className="resource-value" style={{ color: r.color }}>
                {value ?? '—'}
              </span>
            )}
            <span className="resource-label">{r.label}</span>
            <div className="resource-bar" style={{ background: r.color }} />
          </div>
        )
      })}
    </div>
  )
}

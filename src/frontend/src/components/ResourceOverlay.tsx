import './ResourceOverlay.css'
import type { components } from '../api/generated'

type UiState = components['schemas']['UiState']

interface Props {
  state: UiState | null
  onNewGame?: () => void
}

type NumericUiStateKey = 'population' | 'consumerGoods' | 'industry' | 'housing'
type NumericGainKey = 'populationGain' | 'consumerGoodsGain' | 'industryGain' | 'housingGain'

interface ResourceDef {
  key: NumericUiStateKey
  gainKey: NumericGainKey
  label: string
  color: string
}

const RESOURCES: ResourceDef[] = [
  { key: 'population',    gainKey: 'populationGain',    label: 'Population', color: '#7ec8e3' },
  { key: 'consumerGoods', gainKey: 'consumerGoodsGain', label: 'Güter',      color: '#8bc34a' },
  { key: 'industry',      gainKey: 'industryGain',      label: 'Industrie',  color: '#ffb74d' },
  { key: 'housing',       gainKey: 'housingGain',       label: 'Wohnraum',   color: '#ba68c8' },
]

export default function ResourceOverlay({ state }: Props) {
  return (
    <div className="resource-overlay">
      {RESOURCES.map(r => {
        const value = state ? state[r.key] : null
        const gain  = state != null ? state[r.gainKey] : null
        const isPopulation = r.key === 'population'
        const freeValue = isPopulation && state ? state.freePopulation : null
        return (
          <div key={r.key} className="resource-card">
            <span className="resource-value" style={{ color: r.color }}>
              <span className="resource-value-main">{value ?? '—'}</span>
              {isPopulation && freeValue !== null && (
                <>
                  <span className="resource-value-sep">/</span>
                  <span className="resource-value-free">{freeValue}</span>
                </>
              )}
              {gain !== null && (
                <>
                  <span className="resource-value-sep">/</span>
                  <span className={`resource-value-gain${gain < 0 ? ' negative' : ''}`}>
                    {gain >= 0 ? `+${gain}` : `${gain}`}
                  </span>
                </>
              )}
            </span>
            <span className="resource-label">{r.label}</span>
            <div className="resource-bar" style={{ background: r.color }} />
          </div>
        )
      })}
    </div>
  )
}

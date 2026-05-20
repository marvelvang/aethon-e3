import type { components } from '../../api/generated'
import { RESOURCES } from '../../domain/resources'
import './ResourceOverlay.css'

type UiState = components['schemas']['UiState']

interface Props {
  state: UiState | null
}

export default function ResourceOverlay({ state }: Props) {
  return (
    <div className="resource-overlay">
      {RESOURCES.map((r) => {
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
                  <span className={`resource-value-gain${Number(gain) < 0 ? ' negative' : ''}`}>
                    {Number(gain) >= 0 ? `+${gain}` : `${gain}`}
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

import type { UiState } from '@aethon/models'
import { HOUSING_DEF, POPULATION_DEF, RESOURCES } from '../../presentation/resources'
import './ResourceOverlay.css'

interface Props {
  state: UiState | null
}

function resourceBarWidth(value: number | null, gain: number | null): string {
  if (gain === null || value === null || gain >= 0) return '100%'
  if (value <= 0) return '0%'
  return `${Math.max(0, (value + gain) / value * 100).toFixed(1)}%`
}

export default function ResourceOverlay({ state }: Props) {
  const freePopulation = state?.freePopulation ?? null
  const population     = state?.population     ?? null
  const housing        = state?.housing        ?? null
  const popGain        = state?.populationGain ?? null
  const gainNegative   = popGain !== null && Number(popGain) < 0

  return (
    <div className="resource-overlay">
      <div className="resource-card">
        <span className="pop-primary" style={{ color: POPULATION_DEF.color }}>
          {freePopulation ?? '—'}
        </span>
        <span className="pop-secondary-row">
          <span style={{ color: POPULATION_DEF.color }}>{population ?? '—'}</span>
          <span className="resource-value-sep">/</span>
          <span style={{ color: HOUSING_DEF.color }}>{housing ?? '—'}</span>
          <span className="resource-value-sep">/</span>
          <span style={{ color: gainNegative ? 'var(--color-danger)' : POPULATION_DEF.color }}>
            {popGain !== null
              ? (Number(popGain) >= 0 ? `+${popGain}` : `${popGain}`)
              : '—'}
          </span>
        </span>
        <span className="resource-label">{POPULATION_DEF.label}</span>
        <div className="resource-bar" style={{ background: POPULATION_DEF.color, width: resourceBarWidth(population, popGain !== null ? Number(popGain) : null) }} />
      </div>

      {RESOURCES.map((r) => {
        const value = state ? state[r.key]    : null
        const gain  = state ? state[r.gainKey] : null
        return (
          <div key={r.key} className="resource-card">
            <span className="resource-value" style={{ color: r.color }}>
              <span className="resource-value-main">{value ?? '—'}</span>
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
            <div className="resource-bar" style={{ background: r.color, width: resourceBarWidth(value !== null ? Number(value) : null, gain !== null ? Number(gain) : null) }} />
          </div>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import type { UiState } from '@aethon/models'
import { GRID_SIZE } from '@aethon/models'
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

function fmtGain(g: number | null): string {
  if (g === null) return '—'
  return g >= 0 ? `+${g}` : `${g}`
}

export default function ResourceOverlay({ state }: Props) {
  const [expanded, setExpanded] = useState(false)

  const freePopulation = state?.freePopulation ?? null
  const population     = state?.population     ?? null
  const housing        = state?.housing        ?? null
  const popGain        = state?.populationGain ?? null
  const gainNegative   = popGain !== null && popGain < 0

  const totalFields = GRID_SIZE * GRID_SIZE
  const builtCount  = state?.buildings.length ?? null

  if (!expanded) {
    return (
      <div className="resource-overlay resource-overlay--compact">
        <div className="compact-bar" onClick={() => setExpanded(true)}>
          <span className="compact-group">
            <span style={{ color: POPULATION_DEF.color }}>{freePopulation ?? '—'}</span>
            <span className="compact-sep">/</span>
            <span style={{ color: POPULATION_DEF.color }}>{population ?? '—'}</span>
            <span className="compact-sep">/</span>
            <span style={{ color: HOUSING_DEF.color }}>{housing ?? '—'}</span>
            <span className="compact-sep">/</span>
            <span style={{ color: gainNegative ? 'var(--color-danger)' : POPULATION_DEF.color }}>
              {fmtGain(popGain)}
            </span>
          </span>
          {RESOURCES.map((r) => {
            const value = state ? state[r.key]    : null
            const gain  = state ? state[r.gainKey] : null
            const isNeg = gain !== null && gain < 0
            return (
              <span key={r.key} className="compact-group">
                <span className="compact-group-sep">·</span>
                <span style={{ color: r.color }}>{value ?? '—'}</span>
                <span className="compact-sep">/</span>
                <span style={{ color: isNeg ? 'var(--color-danger)' : r.color }}>
                  {fmtGain(gain)}
                </span>
              </span>
            )
          })}
          <span className="compact-group">
            <span className="compact-group-sep">·</span>
            <span style={{ color: 'var(--color-fields)' }}>{builtCount ?? '—'}</span>
            <span className="compact-sep">/</span>
            <span style={{ color: 'var(--color-fields)' }}>{totalFields}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="resource-overlay resource-overlay--expanded">
      <div className="resource-card" onClick={() => setExpanded(false)}>
        <span className="pop-primary" style={{ color: POPULATION_DEF.color }}>
          {freePopulation ?? '—'}
        </span>
        <span className="pop-secondary-row">
          <span style={{ color: POPULATION_DEF.color }}>{population ?? '—'}</span>
          <span className="resource-value-sep">/</span>
          <span style={{ color: HOUSING_DEF.color }}>{housing ?? '—'}</span>
          <span className="resource-value-sep">/</span>
          <span style={{ color: gainNegative ? 'var(--color-danger)' : POPULATION_DEF.color }}>
            {fmtGain(popGain)}
          </span>
        </span>
        <span className="resource-label">{POPULATION_DEF.label}</span>
        <div
          className="resource-bar"
          style={{ background: POPULATION_DEF.color, width: resourceBarWidth(population, popGain) }}
        />
      </div>

      {RESOURCES.map((r) => {
        const value = state ? state[r.key]    : null
        const gain  = state ? state[r.gainKey] : null
        return (
          <div key={r.key} className="resource-card" onClick={() => setExpanded(false)}>
            <span className="resource-value" style={{ color: r.color }}>
              <span className="resource-value-main">{value ?? '—'}</span>
              {gain !== null && (
                <>
                  <span className="resource-value-sep">/</span>
                  <span className={`resource-value-gain${gain < 0 ? ' negative' : ''}`}>
                    {fmtGain(gain)}
                  </span>
                </>
              )}
            </span>
            <span className="resource-label">{r.label}</span>
            <div
              className="resource-bar"
              style={{ background: r.color, width: resourceBarWidth(value, gain) }}
            />
          </div>
        )
      })}

      <div className="resource-card" onClick={() => setExpanded(false)}>
        <span className="resource-value" style={{ color: 'var(--color-fields)' }}>
          <span className="resource-value-main">{builtCount ?? '—'}</span>
          <span className="resource-value-sep">/</span>
          <span className="resource-value-gain">{totalFields}</span>
        </span>
        <span className="resource-label">Felder</span>
        <div
          className="resource-bar"
          style={{
            background: 'var(--color-fields)',
            width: builtCount !== null ? `${(builtCount / totalFields * 100).toFixed(1)}%` : '0%',
          }}
        />
      </div>
    </div>
  )
}

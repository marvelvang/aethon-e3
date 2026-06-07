import { useState } from 'react'
import type { UiState } from '@aethon/models'
import { GRID_SIZE } from '@aethon/models'
import { HOUSING_DEF, POPULATION_DEF, RESOURCES } from '../../presentation/resources'
import './ResourceOverlay.css'

interface Props {
  state: UiState | null
}

// Width of the bar showing how much of the current value survives the next gain
function resourceBarWidth(value: number | null, gain: number | null): string {
  if (gain === null || value === null || gain >= 0) return '100%'
  if (value <= 0) return '0%'
  return `${Math.max(0, (value + gain) / value * 100).toFixed(1)}%`
}

// Width of the fields bar: represents free space remaining
function fieldsBarWidth(built: number, total: number): string {
  const builtRatio = built / total
  if (builtRatio <= 0.1) return '100%'
  return `${((1 - builtRatio) * 100).toFixed(1)}%`
}

// Color for both the fields bar and the built-count number
function fieldsAccentColor(built: number, total: number): string {
  return built / total > 0.9 ? 'var(--color-danger)' : 'var(--color-fields)'
}

function fmtGain(g: number | null): string {
  if (g === null) return '—'
  return g >= 0 ? `+${g}` : `${g}`
}

// ── Shared card shell used by every panel in expanded view ──────────────────

interface CardProps {
  label: string
  color: string
  barWidth: string
  barColor?: string
  onClick: () => void
  children: React.ReactNode
}

function Card({ label, color, barWidth, barColor, onClick, children }: CardProps) {
  return (
    <div className="resource-card" onClick={onClick}>
      {children}
      <span className="resource-label">{label}</span>
      <div className="resource-bar" style={{ background: barColor ?? color, width: barWidth }} />
    </div>
  )
}

// ── Main overlay ────────────────────────────────────────────────────────────

export default function ResourceOverlay({ state }: Props) {
  const [expanded, setExpanded] = useState(false)

  const freePopulation = state?.freePopulation ?? null
  const population     = state?.population     ?? null
  const housing        = state?.housing        ?? null
  const popGain        = state?.populationGain ?? null
  const gainNegative   = popGain !== null && popGain < 0

  const totalFields  = GRID_SIZE * GRID_SIZE
  const builtCount   = state?.buildings.length ?? null
  const fAccent      = builtCount !== null ? fieldsAccentColor(builtCount, totalFields) : 'var(--color-fields)'
  const fBarWidth    = builtCount !== null ? fieldsBarWidth(builtCount, totalFields)    : '0%'

  const collapse = () => setExpanded(false)

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
            return (
              <span key={r.key} className="compact-group">
                <span className="compact-group-sep">·</span>
                <span style={{ color: r.color }}>{value ?? '—'}</span>
                <span className="compact-sep">/</span>
                <span style={{ color: gain !== null && gain < 0 ? 'var(--color-danger)' : r.color }}>
                  {fmtGain(gain)}
                </span>
              </span>
            )
          })}
          <span className="compact-group">
            <span className="compact-group-sep">·</span>
            <span style={{ color: fAccent }}>{builtCount ?? '—'}</span>
            <span className="compact-sep">/</span>
            <span style={{ color: 'var(--color-fields)' }}>{totalFields}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="resource-overlay resource-overlay--expanded">

      <Card
        label={POPULATION_DEF.label}
        color={POPULATION_DEF.color}
        barWidth={resourceBarWidth(population, popGain)}
        onClick={collapse}
      >
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
      </Card>

      {RESOURCES.map((r) => {
        const value = state ? state[r.key]    : null
        const gain  = state ? state[r.gainKey] : null
        return (
          <Card
            key={r.key}
            label={r.label}
            color={r.color}
            barWidth={resourceBarWidth(value, gain)}
            onClick={collapse}
          >
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
          </Card>
        )
      })}

      <Card
        label="Felder"
        color="var(--color-fields)"
        barWidth={fBarWidth}
        barColor={fAccent}
        onClick={collapse}
      >
        <span className="resource-value" style={{ color: 'var(--color-fields)' }}>
          <span className="resource-value-main" style={{ color: fAccent }}>{builtCount ?? '—'}</span>
          <span className="resource-value-sep">/</span>
          <span className="resource-value-gain">{totalFields}</span>
        </span>
      </Card>

    </div>
  )
}

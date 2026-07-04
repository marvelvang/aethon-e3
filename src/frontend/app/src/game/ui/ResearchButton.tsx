import { useState } from 'react'
import { RESEARCH_BRANCHES, type ResearchBranch, type ResearchBranchProgress } from '@aethon/models'
import { RESEARCH_COSTS } from '@aethon/engine'
import { BUILDING_META } from '../../presentation/buildingTypes'
import type { GameController } from '../hooks/useGame'
import './ResearchButton.css'

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M8 2h8v2h-1v6l6.5 10.5c.8 1.4-.1 2.5-1.5 2.5H4.5C3.1 23 2.2 21.9 3 20.5L9 10V4H8V2z" />
    </svg>
  )
}

const BRANCH_BUILDING: Record<ResearchBranch, keyof typeof BUILDING_META> = {
  Housing:  'Housing',
  Consumer: 'Consumer',
  Industry: 'Industry',
  Energy:   'PowerPlant',
}

const BRANCH_LABEL: Record<ResearchBranch, string> = {
  Housing:  'Wohnbau',
  Consumer: 'Güter',
  Industry: 'Industrie',
  Energy:   'Energie',
}

function progressPercent(progress: ResearchBranchProgress, branch: ResearchBranch): number {
  if (progress.level >= 5) return 100
  const cost = RESEARCH_COSTS[branch][(progress.level - 1) as 0 | 1 | 2 | 3]
  return Math.min(100, Math.round((progress.investedPoints / cost) * 100))
}

interface BranchRowProps {
  branch: ResearchBranch
  progress: ResearchBranchProgress
  isFocused: boolean
  onToggle: () => void
  pointsPerRound: number
}

function BranchRow({ branch, progress, isFocused, onToggle, pointsPerRound }: BranchRowProps) {
  const meta  = BUILDING_META[BRANCH_BUILDING[branch]]
  const pct   = progressPercent(progress, branch)
  const isMax = progress.level >= 5
  const cost  = isMax ? null : RESEARCH_COSTS[branch][(progress.level - 1) as 0 | 1 | 2 | 3]

  return (
    <div
      className={`research-branch-row${isFocused ? ' research-branch-row--focused' : ''}`}
      onClick={onToggle}
    >
      <div className={`research-radio${isFocused ? ' research-radio--active' : ''}`} />

      <div className="research-branch-img" dangerouslySetInnerHTML={{ __html: meta.assetSvg }} />

      <div className="research-branch-info">
        <div className="research-branch-header">
          <span className="research-branch-label">{BRANCH_LABEL[branch]}</span>
          <span className="research-branch-level">
            {isMax ? 'MAX' : `Lvl ${progress.level}`}
          </span>
        </div>
        <div className="research-bar-track">
          <div
            className="research-bar-fill"
            style={{
              width: `${pct}%`,
              background: meta.iconHex,
            }}
          />
        </div>
        {!isMax && (
          <div className="research-bar-meta">
            <span className="research-bar-numbers">{progress.investedPoints} / {cost}</span>
            {isFocused && pointsPerRound > 0 && (
              <span className="research-branch-rate">+{pointsPerRound} / Runde</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  game: GameController
}

export default function ResearchButton({ game }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  const state = game.state

  return (
    <>
      {isOpen && <div className="research-backdrop" onClick={close} />}

      <div className="research-container">
        {isOpen && state && (
          <div className="research-modal" onClick={(e) => e.stopPropagation()}>
            <div className="research-modal-header">
              <span className="research-modal-title">Forschung</span>
              {state.researchPointsPerRound > 0 && (
                <span className="research-modal-rate">
                  {state.researchPointsPerRound} Pkt / Runde
                </span>
              )}
            </div>
            <div className="research-branch-list">
              {RESEARCH_BRANCHES.map(branch => (
                <BranchRow
                  key={branch}
                  branch={branch}
                  progress={state.researchProgress[branch]}
                  isFocused={state.researchFocus === branch}
                  pointsPerRound={state.researchPointsPerRound}
                  onToggle={() => game.setResearchFocus(
                    state.researchFocus === branch ? null : branch
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <button
          className={`research-trigger${isOpen ? ' research-trigger--active' : ''}`}
          onClick={() => setIsOpen((o) => !o)}
          title="Forschung"
        >
          <FlaskIcon />
        </button>
      </div>
    </>
  )
}

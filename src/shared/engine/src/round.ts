import { RESEARCH_BRANCHES, type GameState, type ResearchBranch, type ResearchBranchProgress } from '@aethon/models'
import { RESEARCH_COSTS } from './research-definitions.ts'
import { aggregateBuildings, nextPopulation } from './gains.ts'

function advanceBranch(
  branch: ResearchBranch,
  current: ResearchBranchProgress,
  points: number,
): ResearchBranchProgress {
  if (current.level >= 5 || points === 0) return current
  const level       = current.level as 0 | 1 | 2 | 3 | 4
  const newInvested = current.investedPoints + points
  const costToNext  = RESEARCH_COSTS[branch][level]
  if (newInvested >= costToNext) {
    return { level: (current.level + 1) as ResearchBranchProgress['level'], investedPoints: 0 }
  }
  return { ...current, investedPoints: newInvested }
}

function distributeResearch(
  state: GameState,
  earned: number,
): Record<ResearchBranch, ResearchBranchProgress> {
  if (earned === 0) return state.researchProgress

  const result = {} as Record<ResearchBranch, ResearchBranchProgress>

  if (state.researchFocus === null) {
    const each = Math.floor(earned / RESEARCH_BRANCHES.length)
    for (const branch of RESEARCH_BRANCHES) {
      result[branch] = advanceBranch(branch, state.researchProgress[branch], each)
    }
  } else {
    for (const branch of RESEARCH_BRANCHES) {
      const pts = branch === state.researchFocus ? earned : 0
      result[branch] = advanceBranch(branch, state.researchProgress[branch], pts)
    }
  }

  return result
}

export function simulateRound(state: GameState): GameState {
  // Step 1: Normalization — releases bound population
  const buildings = state.buildings.map(b => ({ ...b, isNewlyBuilt: false }))

  const a = aggregateBuildings(buildings)

  // Step 2 + 2b: Production and Maintenance
  const industry = state.industry + a.industryProduction - a.maintenanceIndustry
  const energy   = state.energy   + a.energyProduction   - a.maintenanceEnergy

  // Step 3: Consumption
  const consumerGoods = Math.max(0, state.consumerGoods + a.consumerGoodsProduction - state.population)

  // Steps 4–6: Supply ratio + population change + housing cap
  const population = nextPopulation(state.population, consumerGoods, a.housing)

  // Research: generate and distribute this round's points, check level-ups
  const researchProgress = distributeResearch(state, a.researchProduction)

  return {
    ...state,
    round: state.round + 1,
    population,
    consumerGoods,
    industry,
    energy,
    buildings,
    researchPoints:   a.researchProduction,
    researchProgress,
  }
}

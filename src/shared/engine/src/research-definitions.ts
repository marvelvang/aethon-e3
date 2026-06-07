import type { ResearchBranch } from '@aethon/models'

// Costs in research points per level transition (index 0 = cost to reach level 1, …, index 4 = cost to reach level 5)
export const RESEARCH_COSTS: Record<ResearchBranch, readonly [number, number, number, number, number]> = {
  Housing:  [500, 1000, 2000, 4000, 8000],
  Consumer: [500, 1000, 2000, 4000, 8000],
  Industry: [500, 1000, 2000, 4000, 8000],
  Energy:   [500, 1000, 2000, 4000, 8000],
}

export function researchCostFor(branch: ResearchBranch, targetLevel: 1 | 2 | 3 | 4 | 5): number {
  return RESEARCH_COSTS[branch][targetLevel - 1]
}

import type { ResearchBranch } from '@aethon/models'

// Costs in research points per level transition (index 0 = cost to advance from level 1→2, …, index 3 = cost to advance from level 4→5)
export const RESEARCH_COSTS: Record<ResearchBranch, readonly [number, number, number, number]> = {
  Housing:  [500, 1000, 2000, 4000],
  Consumer: [500, 1000, 2000, 4000],
  Industry: [500, 1000, 2000, 4000],
  Energy:   [500, 1000, 2000, 4000],
}

export function researchCostFor(branch: ResearchBranch, targetLevel: 2 | 3 | 4 | 5): number {
  return RESEARCH_COSTS[branch][targetLevel - 2]
}

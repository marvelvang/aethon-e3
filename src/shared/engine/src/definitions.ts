import type { BuildingType, ResearchBranch } from '@aethon/models'

export interface BuildingDefinition {
  populationCost: number
  industryCost: number
  consumerGoodsProduction: number
  industryProduction: number
  housingContribution: number
  energyCost: number
  energyProduction: number
  maintenancePopulationCost: number
  maintenanceIndustryCost: number
  maintenanceEnergyCost: number
  researchProduction: number
  requiredResearch: { branch: ResearchBranch; level: number } | null
}

export const BUILDING_DEFINITIONS: Record<BuildingType, BuildingDefinition> = {
  //                           popCost indCost cgProd indProd housing eneCost eneProd mPop mInd mEne
  Base:       def(0,  0,  100, 100, 150, 0,  100, 10, 15, 15),
  Consumer:   def(25, 15, 40,  0,   0,   15, 0,   7,  5,  5),
  Industry:   def(40, 70, 10,  50,  0,   70, 0,   10, 7,  7),
  Housing:    def(50, 60, 0,   0,   20,  60, 0,   0,  0,  0),
  PowerPlant: def(40, 70, 0,   0,   0,   70, 50,  10, 7,  7),
}

function def(
  populationCost: number,
  industryCost: number,
  consumerGoodsProduction: number,
  industryProduction: number,
  housingContribution: number,
  energyCost: number,
  energyProduction: number,
  maintenancePopulationCost: number,
  maintenanceIndustryCost: number,
  maintenanceEnergyCost: number,
): BuildingDefinition {
  return {
    populationCost,
    industryCost,
    consumerGoodsProduction,
    industryProduction,
    housingContribution,
    energyCost,
    energyProduction,
    maintenancePopulationCost,
    maintenanceIndustryCost,
    maintenanceEnergyCost,
    researchProduction: 0,
    requiredResearch: null,
  }
}

export function defFor(type: BuildingType): BuildingDefinition {
  return BUILDING_DEFINITIONS[type]
}

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
  requiredResearch: { branch: ResearchBranch; level: number }[] | null
}

export const BUILDING_DEFINITIONS: Record<BuildingType, BuildingDefinition> = {
  //                            popCost indCost cgProd indProd housing eneCost eneProd mPop mInd mEne  rsProd  requiredResearch
  Base:         def(0,  0,  100, 100, 150, 0,   100, 10, 15, 15),
  Housing:      def(50, 60, 0,   0,   20,  60,  0,   0,  0,  0),
  HousingT2:    def(75, 90, 0,   0,   40,  90,  0,   0,  0,  0,   0,  'Housing',  2),
  Consumer:     def(25, 15, 40,  0,   0,   15,  0,   7,  5,  5),
  ConsumerT2:   def(38, 23, 80,  0,   0,   23,  0,   11, 8,  8,   0,  'Consumer', 2),
  Industry:     def(40, 70, 10,  50,  0,   70,  0,   10, 7,  7),
  IndustryT2:   def(60, 105,0,   100, 0,   105, 0,   15, 11, 11,  0,  'Industry', 2),
  PowerPlant:   def(40, 70, 0,   0,   0,   70,  50,  10, 7,  7),
  PowerPlantT2: def(60, 105,0,   0,   0,   105, 100, 15, 11, 11,  0,  'Energy',   2),
  Research:     def(30, 60, 0,   0,   0,   50,  0,   8,  5,  15,  20),
  ResearchT2:   { ...def(45, 90, 0, 0, 0, 75, 0, 12, 8, 23, 45), requiredResearch: [{ branch: 'Industry' as const, level: 2 }, { branch: 'Energy' as const, level: 2 }] },
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
  researchProduction = 0,
  requiredBranch: ResearchBranch | null = null,
  requiredLevel = 0,
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
    researchProduction,
    requiredResearch: requiredBranch !== null ? [{ branch: requiredBranch, level: requiredLevel }] : null,
  }
}

export function defFor(type: BuildingType): BuildingDefinition {
  return BUILDING_DEFINITIONS[type]
}

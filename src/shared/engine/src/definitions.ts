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

// Tier progression: costs, production and maintenance scale by ~1.5× per tier
// (T1→T2 values were set before this rule and are kept as-is).
export const BUILDING_DEFINITIONS: Record<BuildingType, BuildingDefinition> = {
  //                            popCost indCost cgProd indProd housing eneCost eneProd mPop mInd mEne  rsProd  requiredResearch
  Base:         def(0,  0,  100, 100, 150, 0,   100, 10, 15, 15),
  Housing:      def(50, 60, 0,   0,   20,  60,  0,   0,  0,  0),
  HousingT2:    def(75, 90, 0,   0,   40,  90,  0,   0,  0,  0,   0,  'Housing',  2),
  HousingT3:    def(115,135,0,   0,   60,  135, 0,   0,  0,  0,   0,  'Housing',  3),
  HousingT4:    def(170,205,0,   0,   90,  205, 0,   0,  0,  0,   0,  'Housing',  4),
  HousingT5:    def(255,305,0,   0,   135, 305, 0,   0,  0,  0,   0,  'Housing',  5),
  Consumer:     def(25, 15, 40,  0,   0,   15,  0,   7,  5,  5),
  ConsumerT2:   def(38, 23, 80,  0,   0,   23,  0,   11, 8,  8,   0,  'Consumer', 2),
  ConsumerT3:   def(57, 35, 120, 0,   0,   35,  0,   17, 12, 12,  0,  'Consumer', 3),
  ConsumerT4:   def(85, 50, 180, 0,   0,   50,  0,   25, 18, 18,  0,  'Consumer', 4),
  ConsumerT5:   def(130,75, 270, 0,   0,   75,  0,   38, 27, 27,  0,  'Consumer', 5),
  Industry:     def(40, 70, 10,  50,  0,   70,  0,   10, 7,  7),
  IndustryT2:   def(60, 105,0,   100, 0,   105, 0,   15, 11, 11,  0,  'Industry', 2),
  IndustryT3:   def(90, 160,0,   150, 0,   160, 0,   23, 17, 17,  0,  'Industry', 3),
  IndustryT4:   def(135,240,0,   225, 0,   240, 0,   34, 25, 25,  0,  'Industry', 4),
  IndustryT5:   def(205,360,0,   340, 0,   360, 0,   51, 38, 38,  0,  'Industry', 5),
  PowerPlant:   def(40, 70, 0,   0,   0,   70,  50,  10, 7,  7),
  PowerPlantT2: def(60, 105,0,   0,   0,   105, 100, 15, 11, 11,  0,  'Energy',   2),
  PowerPlantT3: def(90, 160,0,   0,   0,   160, 150, 23, 17, 17,  0,  'Energy',   3),
  PowerPlantT4: def(135,240,0,   0,   0,   240, 225, 34, 25, 25,  0,  'Energy',   4),
  PowerPlantT5: def(205,360,0,   0,   0,   360, 340, 51, 38, 38,  0,  'Energy',   5),
  Research:     def(30, 60, 0,   0,   0,   50,  0,   8,  5,  15,  20),
  // Research tiers unlock via the combined Industry + Energy level (no own branch)
  ResearchT2:   defR(45, 90,  75,  12, 8,  23, 45,  2),
  ResearchT3:   defR(70, 135, 115, 18, 12, 35, 70,  3),
  ResearchT4:   defR(105,205, 170, 27, 18, 52, 105, 4),
  ResearchT5:   defR(155,305, 255, 40, 27, 78, 155, 5),
  // Ship infrastructure: no resource production yet — output (ship construction,
  // orbital traffic) arrives with the ship system.
  Shipyard:     def(40, 80, 0,   0,   0,   80,  0,   10, 8,  8),
  Spaceport:    def(35, 70, 0,   0,   0,   60,  0,   8,  6,  6),
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

// Research-family tiers require Industry AND Energy at the given level.
function defR(
  populationCost: number,
  industryCost: number,
  energyCost: number,
  maintenancePopulationCost: number,
  maintenanceIndustryCost: number,
  maintenanceEnergyCost: number,
  researchProduction: number,
  requiredLevel: number,
): BuildingDefinition {
  return {
    ...def(populationCost, industryCost, 0, 0, 0, energyCost, 0,
      maintenancePopulationCost, maintenanceIndustryCost, maintenanceEnergyCost, researchProduction),
    requiredResearch: [
      { branch: 'Industry', level: requiredLevel },
      { branch: 'Energy',   level: requiredLevel },
    ],
  }
}

export function defFor(type: BuildingType): BuildingDefinition {
  return BUILDING_DEFINITIONS[type]
}

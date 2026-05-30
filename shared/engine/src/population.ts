export function calculateGrowthDelta(population: number, supply: number): number {
  if (supply > 1.0) return population * 0.0025 * Math.pow(supply - 1.0, 1.2)
  if (supply < 1.0) return -(population * 0.005 * Math.abs(supply - 1.0))
  return 0.0
}

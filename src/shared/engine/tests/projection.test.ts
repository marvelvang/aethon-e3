import { describe, test, expect } from 'bun:test'
import { project } from '../src/projection.ts'
import { placeBuilding } from '../src/build.ts'
import { initial } from './fixtures.ts'

describe('project', () => {
  test('initial state projects with expected basics', () => {
    const ui = project(initial())
    expect(ui.round).toBe(1)
    expect(ui.population).toBe(100)
    expect(ui.housing).toBe(150)
    expect(ui.gameResult).toBe('None')
    expect(ui.buildings).toHaveLength(1)
    expect(ui.buildingTypes).toHaveLength(6)
    expect(ui.buildingTypes.find(t => t.type === 'Base')?.isBuildable).toBe(false)
    expect(ui.buildingTypes.find(t => t.type === 'Housing')?.isBuildable).toBe(true)
  })

  test('boundPopulation reflects both newly-built and maintenance', () => {
    let s = initial()
    // Base is not newlyBuilt → maintenancePopulationCost = 10
    expect(project(s).boundPopulation).toBe(10)
    s = placeBuilding(s, 5, 5, 'Housing') // newly-built Housing populationCost = 50
    expect(project(s).boundPopulation).toBe(10 + 50)
  })

  test('canAfford reflects free population, industry, energy', () => {
    const ui = project({ ...initial(), industry: 0 })
    expect(ui.buildingTypes.find(t => t.type === 'Housing')?.canAfford).toBe(false)
  })

  test('reports Loss when industry goes negative', () => {
    expect(project({ ...initial(), industry: -1 }).gameResult).toBe('Loss')
  })

  test('reports Loss when energy goes negative', () => {
    expect(project({ ...initial(), energy: -1 }).gameResult).toBe('Loss')
  })
})

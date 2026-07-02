// dev-only
import type { GameState } from '@aethon/models'
import { genesis } from '@aethon/engine'

export type DevSeedName = 'bare' | 'default' | 'shortage'

/**
 * Switch between dev seeds here. Set to null to start every new/reset game
 * with the normal empty genesis state.
 *
 *   'bare'     — round 1, only Base, genesis resources (200 ind / 200 ene)
 *   'default'  — round 20, healthy economy, research Lvl 1 everywhere
 *   'shortage' — round 25, industry=50 / energy=40 so most buildings show ⚠,
 *                research Lvl 2 everywhere (all T2 buildings unlocked)
 */
export const ACTIVE_DEV_SEED: DevSeedName | null = 'bare'

export function getDevSeed(): Omit<GameState, 'id'> | null {
  if (!ACTIVE_DEV_SEED) return null
  return SEEDS[ACTIVE_DEV_SEED]()
}

const SEEDS: Record<DevSeedName, () => Omit<GameState, 'id'>> = {
  bare: createBareSeed,
  default: createDefaultSeed,
  shortage: createShortageSeed,
}

/**
 * Round 1, only Base — the genesis state.
 * 200 ind / 200 ene / 100 pop → ready to place first buildings.
 */
function createBareSeed(): Omit<GameState, 'id'> {
  return genesis()
}

/**
 * Round 20, healthy economy.
 * CG +200 surplus/round · Ind +210 net · Ene +180 net · Research 60 pts/round
 * Bound pop 220 · Housing cap 250 · ~30 free pop
 */
function createDefaultSeed(): Omit<GameState, 'id'> {
  return {
    round: 20,
    population: 220,
    consumerGoods: 1200,
    industry: 3500,
    energy: 3000,
    researchPoints: 60,
    researchFocus: null,
    researchProgress: {
      Housing:  { level: 1, investedPoints: 300 },
      Consumer: { level: 1, investedPoints: 300 },
      Industry: { level: 1, investedPoints: 300 },
      Energy:   { level: 1, investedPoints: 300 },
    },
    buildings: STANDARD_BUILDINGS,
  }
}

/**
 * Round 25, resource shortage scenario.
 * Industry=50 / Energy=40 → most buildings trigger ⚠ in the picker tooltip.
 * Only Consumer (ind 15 / ene 15) is still affordable.
 * All research branches at Lvl 2 so T2 buildings appear in the picker.
 * 50 free population (200 bound, 250 cap).
 */
function createShortageSeed(): Omit<GameState, 'id'> {
  return {
    round: 25,
    population: 200,
    consumerGoods: 1500,
    industry: 50,
    energy: 40,
    researchPoints: 120,
    researchFocus: null,
    researchProgress: {
      Housing:  { level: 2, investedPoints: 0 },
      Consumer: { level: 2, investedPoints: 0 },
      Industry: { level: 2, investedPoints: 0 },
      Energy:   { level: 2, investedPoints: 0 },
    },
    buildings: STANDARD_BUILDINGS,
  }
}

const STANDARD_BUILDINGS: GameState['buildings'] = [
  // ── Base ──────────────────────────────────────────────────────
  { x: 0, y: 0, type: 'Base',       isNewlyBuilt: false },
  // ── Housing (5) ───────────────────────────────────────────────
  { x: 1, y: 0, type: 'Housing',    isNewlyBuilt: false },
  { x: 2, y: 0, type: 'Housing',    isNewlyBuilt: false },
  { x: 3, y: 0, type: 'Housing',    isNewlyBuilt: false },
  { x: 0, y: 1, type: 'Housing',    isNewlyBuilt: false },
  { x: 1, y: 1, type: 'Housing',    isNewlyBuilt: false },
  // ── Consumer (8) ──────────────────────────────────────────────
  { x: 4, y: 0, type: 'Consumer',   isNewlyBuilt: false },
  { x: 5, y: 0, type: 'Consumer',   isNewlyBuilt: false },
  { x: 6, y: 0, type: 'Consumer',   isNewlyBuilt: false },
  { x: 7, y: 0, type: 'Consumer',   isNewlyBuilt: false },
  { x: 2, y: 1, type: 'Consumer',   isNewlyBuilt: false },
  { x: 3, y: 1, type: 'Consumer',   isNewlyBuilt: false },
  { x: 4, y: 1, type: 'Consumer',   isNewlyBuilt: false },
  { x: 5, y: 1, type: 'Consumer',   isNewlyBuilt: false },
  // ── Industry (5) ──────────────────────────────────────────────
  { x: 0, y: 2, type: 'Industry',   isNewlyBuilt: false },
  { x: 1, y: 2, type: 'Industry',   isNewlyBuilt: false },
  { x: 2, y: 2, type: 'Industry',   isNewlyBuilt: false },
  { x: 3, y: 2, type: 'Industry',   isNewlyBuilt: false },
  { x: 4, y: 2, type: 'Industry',   isNewlyBuilt: false },
  // ── PowerPlant (5) ────────────────────────────────────────────
  { x: 0, y: 3, type: 'PowerPlant', isNewlyBuilt: false },
  { x: 1, y: 3, type: 'PowerPlant', isNewlyBuilt: false },
  { x: 2, y: 3, type: 'PowerPlant', isNewlyBuilt: false },
  { x: 3, y: 3, type: 'PowerPlant', isNewlyBuilt: false },
  { x: 4, y: 3, type: 'PowerPlant', isNewlyBuilt: false },
  // ── Research (3) ──────────────────────────────────────────────
  { x: 0, y: 4, type: 'Research',   isNewlyBuilt: false },
  { x: 1, y: 4, type: 'Research',   isNewlyBuilt: false },
  { x: 2, y: 4, type: 'Research',   isNewlyBuilt: false },
]

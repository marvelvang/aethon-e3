// dev-only
import type { GameState } from '@aethon/models'

export type DevSeedName = 'default' | 'shortage' | 'research_full'

/**
 * Switch between dev seeds here. Set to null to start every new/reset game
 * with the normal empty genesis state (round 1, only Base).
 *
 *   'default'       — round 20, healthy economy, research Lvl 1 everywhere
 *   'shortage'      — round 25, industry=50 / energy=40 so most buildings show ⚠,
 *                     research Lvl 2 everywhere (all T2 buildings unlocked)
 *   'research_full' — round 30, all research at Lvl 5, abundant resources;
 *                     every building tier (T1–T5) unlocked and affordable
 */
export const ACTIVE_DEV_SEED: DevSeedName | null = 'research_full'

export function getDevSeed(): Omit<GameState, 'id'> | null {
  if (!ACTIVE_DEV_SEED) return null
  return SEEDS[ACTIVE_DEV_SEED]()
}

const SEEDS: Record<DevSeedName, () => Omit<GameState, 'id'>> = {
  default: createDefaultSeed,
  shortage: createShortageSeed,
  research_full: createResearchFullSeed,
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

/**
 * Round 30, all research branches at level 5 — every building tier unlocked.
 * Abundant resources and population so any building (incl. T5) is affordable.
 * Only the Base is placed; the grid is otherwise empty for building tests.
 */
function createResearchFullSeed(): Omit<GameState, 'id'> {
  return {
    round: 30,
    population: 1000,
    consumerGoods: 3000,
    industry: 8000,
    energy: 8000,
    researchPoints: 200,
    researchFocus: null,
    researchProgress: {
      Housing:  { level: 5, investedPoints: 0 },
      Consumer: { level: 5, investedPoints: 0 },
      Industry: { level: 5, investedPoints: 0 },
      Energy:   { level: 5, investedPoints: 0 },
    },
    buildings: [{ x: 0, y: 0, type: 'Base', isNewlyBuilt: false }],
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

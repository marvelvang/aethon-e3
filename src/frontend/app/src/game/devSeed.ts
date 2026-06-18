// dev-only
import type { GameState } from '@aethon/models'

/**
 * Dev-only seed: toggle this flag to start every new/reset game with a
 * pre-built state instead of the empty genesis state. Useful for testing
 * features (research, building picker, late-game UI) without playing 20+
 * rounds by hand.
 *
 * Set to false (or delete this file's import in LocalGameGateway) to restore
 * normal new-game behaviour.
 */
export const DEV_SEED_ENABLED = true

/**
 * Pre-built game state at round 20.
 *
 * Economy snapshot (per round, all buildings active):
 *   CG  +420 prod − ~220 pop = +200 surplus
 *   Ind +350 prod − 140 maintenance = +210 net
 *   Ene +350 prod − 170 maintenance = +180 net
 *   Research: 3 × 20 = 60 pts / round → 300 pts per branch after 20 rounds
 *
 * Bound population: 190  |  Housing cap: 250  |  Free pop: ~30
 * → player can immediately place more buildings.
 */
export function createDevSeed(): Omit<GameState, 'id'> {
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
    buildings: [
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
    ],
  }
}

import type { GameState, StarSystem, Fleet, FactionId, Difficulty } from './types';
import { FACTIONS, SYSTEM_NAMES, TECH_TREE } from './data';

const GRID_W = 22;
const GRID_H = 14;
const SYSTEM_DENSITY = 0.38;
export { GRID_W, GRID_H };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateGalaxy(playerFaction: FactionId, difficulty: Difficulty): GameState {
  const rand = rng(Date.now() & 0xffffff);
  const systems: Record<string, StarSystem> = {};
  const fleets: Record<string, Fleet> = {};

  const cells: Array<[number, number]> = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      cells.push([x, y]);
    }
  }
  const shuffled = shuffle(cells, rand);
  const systemCount = Math.floor(GRID_W * GRID_H * SYSTEM_DENSITY);
  const chosen = shuffled.slice(0, systemCount);

  const usedNames = new Set<string>();
  function nextName(): string {
    const available = SYSTEM_NAMES.filter(n => !usedNames.has(n));
    const name = available[Math.floor(rand() * available.length)] ?? `System-${usedNames.size}`;
    usedNames.add(name);
    return name;
  }

  // Place player home system in bottom-left quadrant
  const playerHomeCell = chosen.find(([x, y]) => x < GRID_W / 2 && y > GRID_H / 2)
    ?? chosen[0];
  const [phx, phy] = playerHomeCell;
  const playerHomeId = `sys_${phx}_${phy}`;

  // Determine AI factions
  const aiFactions: FactionId[] = (['terrans', 'arkonides', 'blues', 'springers'] as FactionId[])
    .filter(f => f !== playerFaction);

  // Place AI home systems in other quadrants
  const quadrants = [
    chosen.filter(([x, y]) => x >= GRID_W / 2 && y < GRID_H / 2),
    chosen.filter(([x, y]) => x < GRID_W / 2 && y < GRID_H / 2),
    chosen.filter(([x, y]) => x >= GRID_W / 2 && y >= GRID_H / 2),
  ];

  const aiHomes: Array<[number, number]> = [];
  for (let i = 0; i < 3; i++) {
    const q = quadrants[i];
    if (q.length > 0) aiHomes.push(q[Math.floor(rand() * q.length)]);
    else aiHomes.push(chosen[Math.floor(rand() * chosen.length)]);
  }

  const homeIds = new Set<string>();
  homeIds.add(playerHomeId);
  aiHomes.forEach(([x, y]) => homeIds.add(`sys_${x}_${y}`));

  // Create all systems
  for (const [x, y] of chosen) {
    const id = `sys_${x}_${y}`;
    const planets = 2 + Math.floor(rand() * 5);
    const habitable = Math.max(1, Math.floor(planets * (0.3 + rand() * 0.5)));
    systems[id] = {
      id, x, y,
      name: nextName(),
      planets,
      habitablePlanets: habitable,
      owner: null,
      buildings: [],
      population: 0,
      defenseStrength: 0,
      colonized: false,
      homeSystem: homeIds.has(id),
    };
  }

  const diffMult = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.3 : 1.0;
  const startResources = { credits: 300, energy: 100, minerals: 80 };

  // Setup player home
  const ph = systems[playerHomeId];
  ph.owner = playerFaction;
  ph.colonized = true;
  ph.population = 5;
  ph.buildings = ['powerplant', 'mine', 'factory'];
  ph.defenseStrength = 15;

  // Player starting fleet
  fleets['fleet_player_1'] = {
    id: 'fleet_player_1',
    owner: playerFaction,
    systemId: playerHomeId,
    ships: { scout: 2, frigate: 1, battlecruiser: 0, colonizer: 1 },
    movesLeft: 3,
    maxMoves: 3,
    selected: false,
    moving: false,
    targetSystemId: null,
  };

  // Setup AI homes
  const aiStates = aiFactions.map((fid, i) => {
    const [ax, ay] = aiHomes[i] ?? [GRID_W - 1, 0];
    const aiHomeId = `sys_${ax}_${ay}`;
    const ah = systems[aiHomeId];
    if (ah) {
      ah.owner = fid;
      ah.colonized = true;
      ah.population = 5;
      ah.buildings = ['powerplant', 'mine', 'factory'];
      ah.defenseStrength = Math.round(15 * diffMult);
    }
    const fleetId = `fleet_ai_${fid}`;
    fleets[fleetId] = {
      id: fleetId,
      owner: fid,
      systemId: aiHomeId,
      ships: { scout: 2, frigate: 1, battlecruiser: 0, colonizer: 1 },
      movesLeft: 3,
      maxMoves: 3,
      selected: false,
      moving: false,
      targetSystemId: null,
    };
    return { factionId: fid, colonizeTarget: null, attackTarget: null, expansionPhase: true };
  });

  return {
    turn: 1,
    playerFaction,
    difficulty,
    resources: { ...startResources },
    researchPoints: 0,
    currentResearch: null,
    techs: JSON.parse(JSON.stringify(TECH_TREE)),
    systems,
    fleets,
    aiStates,
    selectedFleetId: null,
    selectedSystemId: null,
    log: [{ text: `Spiel gestartet als ${FACTIONS[playerFaction].name}. Viel Erfolg!`, type: 'info' }],
    phase: 'player',
    winner: null,
    coloniesNeeded: 20,
  };
}

export function getSystemAt(gs: GameState, gx: number, gy: number): StarSystem | null {
  const id = `sys_${gx}_${gy}`;
  return gs.systems[id] ?? null;
}

export function getDistance(a: StarSystem, b: StarSystem): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function findPath(gs: GameState, fromId: string, toId: string): string[] {
  const from = gs.systems[fromId];
  const to = gs.systems[toId];
  if (!from || !to) return [];
  // Simple Chebyshev step-by-step path through the grid
  const path: string[] = [];
  let cx = from.x, cy = from.y;
  while (cx !== to.x || cy !== to.y) {
    if (cx < to.x) cx++;
    else if (cx > to.x) cx--;
    if (cy < to.y) cy++;
    else if (cy > to.y) cy--;
    path.push(`sys_${cx}_${cy}`);
  }
  return path;
}

export function getPlayerColonyCount(gs: GameState): number {
  return Object.values(gs.systems).filter(s => s.owner === gs.playerFaction && s.colonized).length;
}

export function getFleetStrength(ships: Record<string, number>): number {
  return (ships.scout ?? 0) * 2 + (ships.frigate ?? 0) * 6 + (ships.battlecruiser ?? 0) * 14;
}

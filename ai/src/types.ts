export type FactionId = 'terrans' | 'arkonides' | 'blues' | 'springers';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type ShipType = 'scout' | 'frigate' | 'battlecruiser' | 'colonizer';
export type BuildingType = 'powerplant' | 'mine' | 'factory' | 'lab' | 'defense';
export type TechId =
  | 'propulsion1' | 'propulsion2'
  | 'weapons1' | 'weapons2'
  | 'shields1' | 'shields2'
  | 'colonization1' | 'colonization2';

export interface Resources {
  credits: number;
  energy: number;
  minerals: number;
}

export interface Faction {
  id: FactionId;
  name: string;
  color: string;
  bonuses: {
    research: number;    // multiplier
    combat: number;
    production: number;
    colonize: number;
  };
}

export interface StarSystem {
  id: string;
  x: number;        // grid col
  y: number;        // grid row
  name: string;
  planets: number;  // total planets in system
  habitablePlanets: number;
  owner: FactionId | null;
  buildings: BuildingType[];
  population: number;
  defenseStrength: number;  // accumulated from defense buildings + tech
  colonized: boolean;
  homeSystem: boolean;
}

export interface Fleet {
  id: string;
  owner: FactionId;
  systemId: string;   // current location
  ships: Record<ShipType, number>;
  movesLeft: number;
  maxMoves: number;
  selected: boolean;
  moving: boolean;
  targetSystemId: string | null;
}

export interface TechNode {
  id: TechId;
  name: string;
  desc: string;
  cost: number;  // research points needed
  progress: number;
  done: boolean;
  requires: TechId | null;
  effect: Partial<Record<string, number>>;
}

export interface AIState {
  factionId: FactionId;
  colonizeTarget: string | null;
  attackTarget: string | null;
  expansionPhase: boolean;
}

export interface CombatResult {
  attackerWins: boolean;
  attackerLosses: Record<ShipType, number>;
  defenderLosses: Record<ShipType, number>;
  log: string[];
}

export interface GameState {
  turn: number;
  playerFaction: FactionId;
  difficulty: Difficulty;
  resources: Resources;
  researchPoints: number;
  currentResearch: TechId | null;
  techs: Record<TechId, TechNode>;
  systems: Record<string, StarSystem>;
  fleets: Record<string, Fleet>;
  aiStates: AIState[];
  selectedFleetId: string | null;
  selectedSystemId: string | null;
  log: Array<{ text: string; type: 'combat' | 'good' | 'info' | 'neutral' }>;
  phase: 'player' | 'ai' | 'over';
  winner: FactionId | null;
  coloniesNeeded: number;
}

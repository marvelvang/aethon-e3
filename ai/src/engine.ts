import type { GameState, Fleet, ShipType, BuildingType, TechId } from './types';
import { FACTIONS, SHIP_STATS, BUILDING_COST } from './data';
import { resolveCombat } from './combat';
import { getDistance, getFleetStrength } from './galaxy';

export function collectResources(gs: GameState): void {
  const faction = FACTIONS[gs.playerFaction];
  let credits = 10, energy = 5, minerals = 5;
  let researchPoints = 0;

  for (const sys of Object.values(gs.systems)) {
    if (sys.owner !== gs.playerFaction || !sys.colonized) continue;
    for (const b of sys.buildings) {
      if (b === 'powerplant') energy += 3;
      if (b === 'mine') minerals += 3;
      if (b === 'factory') credits += 2;
      if (b === 'lab') researchPoints += 2;
    }
    credits += sys.habitablePlanets * faction.bonuses.production;
  }

  gs.resources.credits += Math.round(credits * faction.bonuses.production);
  gs.resources.energy += Math.round(energy);
  gs.resources.minerals += Math.round(minerals);
  gs.researchPoints += Math.round(researchPoints * faction.bonuses.research);
}

export function advanceResearch(gs: GameState): void {
  if (!gs.currentResearch) return;
  const tech = gs.techs[gs.currentResearch];
  if (!tech || tech.done) { gs.currentResearch = null; return; }
  tech.progress += gs.researchPoints;
  gs.researchPoints = 0;
  if (tech.progress >= tech.cost) {
    tech.done = true;
    tech.progress = tech.cost;
    gs.currentResearch = null;
    gs.log.unshift({ text: `Technologie "${tech.name}" erforscht!`, type: 'good' });
  }
}

export function buildShip(gs: GameState, fleetId: string, type: ShipType): boolean {
  const fleet = gs.fleets[fleetId];
  if (!fleet) return false;
  const sys = gs.systems[fleet.systemId];
  if (!sys || !sys.buildings.includes('factory')) return false;

  const cost = SHIP_STATS[type].cost;
  if (gs.resources.credits < cost.credits || gs.resources.energy < cost.energy || gs.resources.minerals < cost.minerals) return false;

  gs.resources.credits -= cost.credits;
  gs.resources.energy -= cost.energy;
  gs.resources.minerals -= cost.minerals;
  fleet.ships[type] = (fleet.ships[type] ?? 0) + 1;
  gs.log.unshift({ text: `${shipName(type)} gebaut in ${sys.name}.`, type: 'good' });
  return true;
}

export function buildBuilding(gs: GameState, systemId: string, type: BuildingType): boolean {
  const sys = gs.systems[systemId];
  if (!sys || sys.owner !== gs.playerFaction) return false;
  const cost = BUILDING_COST[type];
  if (!cost) return false;
  if (gs.resources.credits < cost.credits || gs.resources.energy < cost.energy || gs.resources.minerals < cost.minerals) return false;
  // max 6 buildings per system
  if (sys.buildings.length >= 6) return false;
  gs.resources.credits -= cost.credits;
  gs.resources.energy -= cost.energy;
  gs.resources.minerals -= cost.minerals;
  sys.buildings.push(type);
  if (type === 'defense') sys.defenseStrength += 8;
  gs.log.unshift({ text: `${cost.label} in ${sys.name} gebaut.`, type: 'good' });
  return true;
}

export function startResearch(gs: GameState, techId: TechId): boolean {
  const tech = gs.techs[techId];
  if (!tech || tech.done) return false;
  if (tech.requires && !gs.techs[tech.requires]?.done) return false;
  gs.currentResearch = techId;
  gs.log.unshift({ text: `Forschung gestartet: ${tech.name}`, type: 'info' });
  return true;
}

export function moveFleet(gs: GameState, fleetId: string, targetSystemId: string): string | null {
  const fleet = gs.fleets[fleetId];
  if (!fleet || fleet.owner !== gs.playerFaction) return 'Ungültige Flotte.';
  const from = gs.systems[fleet.systemId];
  const to = gs.systems[targetSystemId];
  if (!from || !to) return 'Ungültiges Ziel.';

  const dist = getDistance(from, to);
  if (dist > fleet.movesLeft) return `Zu weit – nur ${fleet.movesLeft} Bewegungspunkte übrig.`;
  fleet.movesLeft -= dist;
  fleet.systemId = targetSystemId;

  // Check if target is enemy system → combat
  if (to.owner && to.owner !== gs.playerFaction) {
    return triggerPlayerAttack(gs, fleet, to);
  }

  // Colonize uninhabited system if colonizer present
  if (!to.colonized && fleet.ships.colonizer > 0) {
    colonize(gs, fleet, to);
  }

  return null;
}

function triggerPlayerAttack(gs: GameState, fleet: Fleet, target: import('./types').StarSystem): string | null {
  const defFleet = Object.values(gs.fleets).find(f => f.owner === target.owner && f.systemId === target.id) ?? null;
  const result = resolveCombat(fleet, defFleet, target, gs);

  // Apply attacker losses
  for (const [type, lost] of Object.entries(result.attackerLosses) as [ShipType, number][]) {
    fleet.ships[type] = Math.max(0, (fleet.ships[type] ?? 0) - lost);
  }

  if (result.attackerWins) {
    // Destroy defender fleet
    if (defFleet) {
      delete gs.fleets[defFleet.id];
    }
    target.owner = gs.playerFaction;
    target.colonized = true;
    target.defenseStrength = Math.max(0, target.defenseStrength - 20);
    gs.log.unshift({ text: `${target.name} erobert!`, type: 'combat' });
  } else {
    gs.log.unshift({ text: `Angriff auf ${target.name} abgewehrt!`, type: 'combat' });
  }
  return null;
}

function colonize(gs: GameState, fleet: Fleet, sys: import('./types').StarSystem): void {
  const faction = FACTIONS[gs.playerFaction];
  fleet.ships.colonizer = Math.max(0, (fleet.ships.colonizer ?? 0) - 1);
  sys.owner = gs.playerFaction;
  sys.colonized = true;
  sys.population = 1;
  sys.buildings = ['powerplant'];
  sys.defenseStrength = 5;

  // Tech bonus
  let bonus = 0;
  if (gs.techs.colonization2?.done) bonus = 2;
  else if (gs.techs.colonization1?.done) bonus = 1;
  sys.habitablePlanets = Math.min(sys.planets, sys.habitablePlanets + Math.round(bonus * faction.bonuses.colonize));

  gs.log.unshift({ text: `${sys.name} kolonisiert!`, type: 'good' });
}

// ─── AI Turn ────────────────────────────────────────────────────────────────

export function runAITurns(gs: GameState): void {
  const diffMult = gs.difficulty === 'easy' ? 0.7 : gs.difficulty === 'hard' ? 1.4 : 1.0;

  for (const ai of gs.aiStates) {
    const fid = ai.factionId;

    // Collect AI resources (simplified)
    let aiCredits = 30 * diffMult, aiEnergy = 20, aiMinerals = 20;
    for (const sys of Object.values(gs.systems)) {
      if (sys.owner !== fid || !sys.colonized) continue;
      for (const b of sys.buildings) {
        if (b === 'powerplant') aiEnergy += 3;
        if (b === 'mine') aiMinerals += 3;
        if (b === 'factory') aiCredits += 2;
      }
      aiCredits += sys.habitablePlanets;
    }

    // AI fleets
    const aiFleets = Object.values(gs.fleets).filter(f => f.owner === fid);

    // Build ships if AI has credits
    for (const fleet of aiFleets) {
      const sys = gs.systems[fleet.systemId];
      if (!sys?.buildings.includes('factory')) continue;
      if (aiCredits >= 80 && aiEnergy >= 40 && aiMinerals >= 30) {
        fleet.ships.frigate = (fleet.ships.frigate ?? 0) + Math.ceil(diffMult);
        aiCredits -= 80; aiEnergy -= 40; aiMinerals -= 30;
      } else if (aiCredits >= 120 && aiEnergy >= 60 && aiMinerals >= 40) {
        fleet.ships.colonizer = (fleet.ships.colonizer ?? 0) + 1;
        aiCredits -= 120;
      }
    }

    // AI movement & expansion
    for (const fleet of aiFleets) {
      fleet.movesLeft = fleet.maxMoves;

      // Find targets: uninhabited near AI, or player colonies
      const candidates = Object.values(gs.systems).filter(s => {
        if (s.id === fleet.systemId) return false;
        const from = gs.systems[fleet.systemId];
        if (!from) return false;
        const dist = getDistance(from, s);
        return dist <= fleet.movesLeft;
      });

      // Prefer colonizing
      if (fleet.ships.colonizer > 0 || ai.expansionPhase) {
        const uncolonized = candidates.find(s => !s.owner);
        if (uncolonized) {
          fleet.systemId = uncolonized.id;
          if (fleet.ships.colonizer > 0) {
            fleet.ships.colonizer = Math.max(0, (fleet.ships.colonizer ?? 0) - 1);
            uncolonized.owner = fid;
            uncolonized.colonized = true;
            uncolonized.buildings = ['powerplant'];
            uncolonized.defenseStrength = 5;
            gs.log.unshift({ text: `${FACTIONS[fid].name} kolonisiert ${uncolonized.name}.`, type: 'neutral' });
          }
          continue;
        }
      }

      // Attack player if strong enough
      const ownStr = getFleetStrength(fleet.ships);
      const playerTarget = candidates.find(s => s.owner === gs.playerFaction);
      if (playerTarget && ownStr > playerTarget.defenseStrength * 0.7) {
        const defFleet = Object.values(gs.fleets).find(f => f.owner === gs.playerFaction && f.systemId === playerTarget.id) ?? null;
        const result = resolveCombat(fleet, defFleet, playerTarget, gs);

        for (const [type, lost] of Object.entries(result.attackerLosses) as [ShipType, number][]) {
          fleet.ships[type] = Math.max(0, (fleet.ships[type] ?? 0) - lost);
        }

        if (result.attackerWins) {
          if (defFleet) delete gs.fleets[defFleet.id];
          playerTarget.owner = fid;
          playerTarget.defenseStrength = Math.max(0, playerTarget.defenseStrength - 20);
          fleet.systemId = playerTarget.id;
          gs.log.unshift({ text: `${FACTIONS[fid].name} erobert ${playerTarget.name}!`, type: 'combat' });
        }
      }
    }

    // Build buildings
    for (const sys of Object.values(gs.systems)) {
      if (sys.owner !== fid || !sys.colonized) continue;
      if (aiCredits >= 60 && aiMinerals >= 20 && !sys.buildings.includes('mine')) {
        sys.buildings.push('mine');
      }
      if (aiCredits >= 80 && aiEnergy >= 30 && aiMinerals >= 30 && !sys.buildings.includes('factory')) {
        sys.buildings.push('factory');
      }
      if (aiCredits >= 60 && aiEnergy >= 20 && !sys.buildings.includes('powerplant')) {
        sys.buildings.push('powerplant');
      }
    }
  }
}

export function endTurn(gs: GameState): void {
  collectResources(gs);
  advanceResearch(gs);

  // Reset player fleet moves
  const speedBonus = (gs.techs.propulsion2?.done ? 2 : gs.techs.propulsion1?.done ? 1 : 0);
  for (const fleet of Object.values(gs.fleets)) {
    if (fleet.owner === gs.playerFaction) {
      fleet.maxMoves = 3 + speedBonus;
      fleet.movesLeft = fleet.maxMoves;
    }
  }

  runAITurns(gs);

  gs.turn++;
  gs.phase = 'player';
  checkWinConditions(gs);
}

function checkWinConditions(gs: GameState): void {
  const playerColonies = Object.values(gs.systems).filter(s => s.owner === gs.playerFaction && s.colonized).length;
  if (playerColonies >= gs.coloniesNeeded) {
    gs.phase = 'over';
    gs.winner = gs.playerFaction;
    return;
  }

  for (const ai of gs.aiStates) {
    const aiColonies = Object.values(gs.systems).filter(s => s.owner === ai.factionId && s.colonized).length;
    if (aiColonies >= gs.coloniesNeeded) {
      gs.phase = 'over';
      gs.winner = ai.factionId;
      return;
    }
    // Eliminate AI if no systems and no fleets
    const hasSystem = Object.values(gs.systems).some(s => s.owner === ai.factionId);
    const hasFleet = Object.values(gs.fleets).some(f => f.owner === ai.factionId);
    if (!hasSystem && !hasFleet) {
      gs.log.unshift({ text: `${FACTIONS[ai.factionId].name} wurde eliminiert!`, type: 'info' });
    }
  }
}

function shipName(type: ShipType): string {
  return { scout: 'Aufklärer', frigate: 'Fregatte', battlecruiser: 'Schlachtkreuzer', colonizer: 'Kolonisator' }[type];
}

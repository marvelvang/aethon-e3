import type { Fleet, StarSystem, GameState, CombatResult, ShipType } from './types';
import { SHIP_STATS } from './data';

function techBonus(gs: GameState, faction: string, stat: 'attackBonus' | 'defenseBonus'): number {
  let bonus = 0;
  if (faction === gs.playerFaction) {
    for (const tech of Object.values(gs.techs)) {
      if (tech.done && tech.effect[stat]) bonus += tech.effect[stat] as number;
    }
  }
  return bonus;
}

function fleetAttack(fleet: Fleet, gs: GameState): number {
  let total = 0;
  for (const [type, count] of Object.entries(fleet.ships)) {
    total += (count as number) * SHIP_STATS[type as ShipType].attack;
  }
  const bonus = techBonus(gs, fleet.owner, 'attackBonus');
  const factionCombat = 1.0; // Already handled by faction during build
  return Math.round(total * (1 + bonus) * factionCombat);
}

function fleetDefense(fleet: Fleet | null, system: StarSystem, gs: GameState): number {
  let total = system.defenseStrength;
  if (fleet) {
    for (const [type, count] of Object.entries(fleet.ships)) {
      total += (count as number) * SHIP_STATS[type as ShipType].defense;
    }
    const bonus = techBonus(gs, fleet.owner, 'defenseBonus');
    total = Math.round(total * (1 + bonus));
  }
  return total;
}

function totalShips(fleet: Fleet): number {
  return Object.values(fleet.ships).reduce((s, c) => s + (c as number), 0);
}

export function resolveCombat(
  attacker: Fleet,
  defender: Fleet | null,
  system: StarSystem,
  gs: GameState,
): CombatResult {
  const log: string[] = [];

  const atkPower = fleetAttack(attacker, gs);
  const defPower = fleetDefense(defender, system, gs);

  log.push(`Angreifer-Angriffskraft: ${atkPower} | Verteidigungs-Stärke: ${defPower}`);

  // Simulate several combat rounds
  let atkHP = totalShips(attacker) * 10 + (attacker.ships.battlecruiser ?? 0) * 30;
  let defHP = defPower * 3 + (defender ? totalShips(defender) * 10 : 0);

  const rounds = 8;
  for (let r = 0; r < rounds && atkHP > 0 && defHP > 0; r++) {
    const atkHit = Math.round(atkPower * (0.7 + Math.random() * 0.6));
    const defHit = Math.round(defPower * 0.4 * (0.7 + Math.random() * 0.6));
    defHP -= atkHit;
    atkHP -= defHit;
    log.push(`Runde ${r + 1}: Angreifer trifft ${atkHit} – Verteidiger trifft ${defHit}`);
  }

  const attackerWins = atkHP > 0 && defHP <= 0;
  log.push(attackerWins ? '→ Angreifer siegt!' : '→ Verteidiger hält stand!');

  // Calculate losses proportional to damage taken
  const atkLossRatio = Math.min(1, Math.max(0, 1 - atkHP / (totalShips(attacker) * 10 + 30)));
  const defLossRatio = attackerWins ? 1 : Math.min(1, Math.max(0, 1 - defHP / (defPower * 3 + 30)));

  function applyLosses(fleet: Fleet, ratio: number): Record<ShipType, number> {
    const losses: Record<ShipType, number> = { scout: 0, frigate: 0, battlecruiser: 0, colonizer: 0 };
    for (const type of ['scout', 'frigate', 'battlecruiser', 'colonizer'] as ShipType[]) {
      losses[type] = Math.round((fleet.ships[type] ?? 0) * ratio);
    }
    return losses;
  }

  const attackerLosses = applyLosses(attacker, atkLossRatio);
  const defenderLosses = defender ? applyLosses(defender, defLossRatio) : { scout: 0, frigate: 0, battlecruiser: 0, colonizer: 0 };

  return { attackerWins, attackerLosses, defenderLosses, log };
}

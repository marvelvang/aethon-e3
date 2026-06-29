import type { Faction, FactionId, TechId, TechNode, ShipType } from './types';

export const FACTIONS: Record<FactionId, Faction> = {
  terrans: {
    id: 'terrans',
    name: 'Terraner',
    color: '#4488ff',
    bonuses: { research: 1.0, combat: 1.0, production: 1.0, colonize: 1.2 },
  },
  arkonides: {
    id: 'arkonides',
    name: 'Arkoniden',
    color: '#aa44ff',
    bonuses: { research: 1.5, combat: 0.9, production: 0.9, colonize: 1.0 },
  },
  blues: {
    id: 'blues',
    name: 'Blaue',
    color: '#44ccff',
    bonuses: { research: 0.8, combat: 1.4, production: 1.0, colonize: 0.9 },
  },
  springers: {
    id: 'springers',
    name: 'Springer',
    color: '#ffaa44',
    bonuses: { research: 0.9, combat: 0.8, production: 1.4, colonize: 1.0 },
  },
};

export const SHIP_STATS: Record<ShipType, { attack: number; defense: number; cost: Resources2; speed: number; colonizer: boolean }> = {
  scout:         { attack: 2,  defense: 1,  cost: { credits: 40,  energy: 20,  minerals: 10 }, speed: 4, colonizer: false },
  frigate:       { attack: 6,  defense: 4,  cost: { credits: 80,  energy: 40,  minerals: 30 }, speed: 3, colonizer: false },
  battlecruiser: { attack: 14, defense: 10, cost: { credits: 160, energy: 80,  minerals: 70 }, speed: 2, colonizer: false },
  colonizer:     { attack: 0,  defense: 2,  cost: { credits: 120, energy: 60,  minerals: 40 }, speed: 2, colonizer: true  },
};

interface Resources2 { credits: number; energy: number; minerals: number; }

export const BUILDING_COST: Record<string, Resources2 & { label: string; desc: string }> = {
  powerplant: { credits: 60,  energy: 0,  minerals: 20, label: 'Kraftwerk',      desc: '+3 Energie/Runde'       },
  mine:       { credits: 60,  energy: 20, minerals: 0,  label: 'Mine',            desc: '+3 Mineralien/Runde'    },
  factory:    { credits: 80,  energy: 30, minerals: 30, label: 'Fabrik',          desc: '+2 Credits/Runde, Schiffbau' },
  lab:        { credits: 80,  energy: 30, minerals: 20, label: 'Forschungslabor', desc: '+2 Forschungspunkte/Runde' },
  defense:    { credits: 100, energy: 40, minerals: 40, label: 'Verteidigungsturm', desc: '+8 Verteidigung'       },
};

export const TECH_TREE: Record<TechId, TechNode> = {
  propulsion1: {
    id: 'propulsion1', name: 'Verbesserte Triebwerke', desc: 'Flotten bewegen sich 1 Feld weiter pro Runde.',
    cost: 30, progress: 0, done: false, requires: null, effect: { speed: 1 },
  },
  propulsion2: {
    id: 'propulsion2', name: 'Hyperraumantriebs', desc: 'Flotten bewegen sich 2 Felder weiter pro Runde.',
    cost: 80, progress: 0, done: false, requires: 'propulsion1', effect: { speed: 2 },
  },
  weapons1: {
    id: 'weapons1', name: 'Impulsstrahler', desc: '+30% Angriffsschaden aller Schiffe.',
    cost: 30, progress: 0, done: false, requires: null, effect: { attackBonus: 0.3 },
  },
  weapons2: {
    id: 'weapons2', name: 'Transformkanone', desc: '+60% Angriffsschaden (kumulativ).',
    cost: 80, progress: 0, done: false, requires: 'weapons1', effect: { attackBonus: 0.6 },
  },
  shields1: {
    id: 'shields1', name: 'Prallschirme', desc: '+30% Verteidigung aller Schiffe.',
    cost: 30, progress: 0, done: false, requires: null, effect: { defenseBonus: 0.3 },
  },
  shields2: {
    id: 'shields2', name: 'Parafeldschirme', desc: '+60% Verteidigung (kumulativ).',
    cost: 80, progress: 0, done: false, requires: 'shields1', effect: { defenseBonus: 0.6 },
  },
  colonization1: {
    id: 'colonization1', name: 'Terraforming I', desc: 'Kolonisatoren erschließen 1 Extraplanet je System.',
    cost: 40, progress: 0, done: false, requires: null, effect: { extraPlanets: 1 },
  },
  colonization2: {
    id: 'colonization2', name: 'Terraforming II', desc: 'Kolonisatoren erschließen 2 Extraplaneten.',
    cost: 100, progress: 0, done: false, requires: 'colonization1', effect: { extraPlanets: 2 },
  },
};

export const SYSTEM_NAMES = [
  'Sol', 'Arkon', 'Naat', 'Topsider', 'Akon', 'Epsalian', 'Kahalo',
  'Vega', 'Sirius', 'Procyon', 'Capella', 'Rigel', 'Deneb', 'Altair',
  'Fomalhaut', 'Mira', 'Algol', 'Pollux', 'Castor', 'Regulus',
  'Spica', 'Antares', 'Aldebaran', 'Betelgeuse', 'Canopus', 'Achernar',
  'Hadar', 'Mimosa', 'Acrux', 'Gacrux', 'Shaula', 'Nunki', 'Kaus',
  'Alnair', 'Enif', 'Markab', 'Scheat', 'Alpheratz', 'Mirach', 'Almach',
];

import type { GameState, ShipType, BuildingType, TechId } from './types';
import { FACTIONS, SHIP_STATS, BUILDING_COST } from './data';
import { buildShip, buildBuilding, startResearch } from './engine';
import { getPlayerColonyCount, getFleetStrength } from './galaxy';

type RenderFn = () => void;

export function updateHeader(gs: GameState): void {
  const el = (id: string) => document.getElementById(id)!;
  el('turn-num').textContent = String(gs.turn);
  el('res-credits').textContent = String(gs.resources.credits);
  el('res-energy').textContent = String(gs.resources.energy);
  el('res-minerals').textContent = String(gs.resources.minerals);
  el('res-systems').textContent = String(getPlayerColonyCount(gs));

  const badge = el('faction-badge') as HTMLSpanElement;
  const f = FACTIONS[gs.playerFaction];
  badge.textContent = f.name;
  badge.style.background = f.color + '33';
  badge.style.border = `1px solid ${f.color}`;
  badge.style.color = f.color;
}

export function updateInfoTab(gs: GameState, rerender: RenderFn): void {
  const el = document.getElementById('tab-info')!;

  if (gs.selectedSystemId) {
    const sys = gs.systems[gs.selectedSystemId];
    if (!sys) { el.innerHTML = '<p class="info-row">Kein System gewählt.</p>'; return; }

    const isPlayer = sys.owner === gs.playerFaction;
    const ownerName = sys.owner ? FACTIONS[sys.owner].name : 'Niemand';
    const ownerColor = sys.owner ? FACTIONS[sys.owner].color : '#556';

    let html = `<div class="section-title">${sys.name}</div>`;
    html += `<div class="info-block">
      <div class="info-row"><span>Besitzer</span><span style="color:${ownerColor}">${ownerName}</span></div>
      <div class="info-row"><span>Planeten</span><span>${sys.planets}</span></div>
      <div class="info-row"><span>Bewohnbar</span><span>${sys.habitablePlanets}</span></div>
      <div class="info-row"><span>Bevölkerung</span><span>${sys.population}</span></div>
      <div class="info-row"><span>Verteidigung</span><span>${sys.defenseStrength}</span></div>
      <div class="info-row"><span>Status</span><span>${sys.colonized ? 'Kolonisiert' : 'Unkolonisiert'}</span></div>
    </div>`;

    if (sys.buildings.length > 0) {
      html += `<div class="section-title">Gebäude</div><div class="info-block">`;
      for (const b of sys.buildings) {
        html += `<div class="info-row"><span>${BUILDING_COST[b]?.label ?? b}</span></div>`;
      }
      html += '</div>';
    }

    if (isPlayer && sys.colonized) {
      html += `<div class="section-title">Bauen</div>`;
      for (const [bt, info] of Object.entries(BUILDING_COST)) {
        if (sys.buildings.length >= 6) break;
        const can = gs.resources.credits >= info.credits && gs.resources.energy >= info.energy && gs.resources.minerals >= info.minerals;
        html += `<button class="btn ${can ? '' : ''}" data-build-building="${bt}" ${!can || !isPlayer ? 'disabled' : ''}>
          ${info.label} <span class="cost-tag">${info.credits}K/${info.energy}E/${info.minerals}M</span>
        </button>`;
      }
    }

    el.innerHTML = html;

    // Attach building buttons
    if (isPlayer) {
      el.querySelectorAll<HTMLButtonElement>('[data-build-building]').forEach(btn => {
        btn.addEventListener('click', () => {
          const bt = btn.dataset.buildBuilding as BuildingType;
          buildBuilding(gs, sys.id, bt);
          updateInfoTab(gs, rerender);
          updateHeader(gs);
          rerender();
        });
      });
    }

  } else if (gs.selectedFleetId) {
    const fleet = gs.fleets[gs.selectedFleetId];
    if (!fleet) { el.innerHTML = ''; return; }
    const sys = gs.systems[fleet.systemId];
    const f = FACTIONS[fleet.owner];

    let html = `<div class="section-title">Flotte – ${f.name}</div>`;
    html += `<div class="info-block">
      <div class="info-row"><span>Position</span><span>${sys?.name ?? '?'}</span></div>
      <div class="info-row"><span>Bewegung</span><span>${fleet.movesLeft}/${fleet.maxMoves}</span></div>
      <div class="info-row"><span>Stärke</span><span>${getFleetStrength(fleet.ships)}</span></div>
    </div>`;

    html += `<div class="section-title">Schiffe</div><div class="info-block">`;
    for (const [type, count] of Object.entries(fleet.ships)) {
      if ((count as number) > 0) {
        const label = { scout: 'Aufklärer', frigate: 'Fregatte', battlecruiser: 'Schlachtkreuzer', colonizer: 'Kolonisator' }[type as ShipType] ?? type;
        html += `<div class="info-row"><span>${label}</span><span>${count}</span></div>`;
      }
    }
    html += '</div>';

    if (fleet.owner === gs.playerFaction) {
      const hasFac = sys?.buildings.includes('factory');
      html += `<div class="section-title">Schiff bauen</div>`;
      for (const type of ['scout', 'frigate', 'battlecruiser', 'colonizer'] as ShipType[]) {
        const st = SHIP_STATS[type];
        const label = { scout: 'Aufklärer', frigate: 'Fregatte', battlecruiser: 'Schlachtkreuzer', colonizer: 'Kolonisator' }[type];
        const can = hasFac &&
          gs.resources.credits >= st.cost.credits &&
          gs.resources.energy >= st.cost.energy &&
          gs.resources.minerals >= st.cost.minerals;
        html += `<button class="btn" data-build-ship="${type}" ${!can ? 'disabled' : ''}>
          ${label} <span class="cost-tag">${st.cost.credits}K/${st.cost.energy}E/${st.cost.minerals}M</span>
        </button>`;
      }
    }

    el.innerHTML = html;

    if (fleet.owner === gs.playerFaction) {
      el.querySelectorAll<HTMLButtonElement>('[data-build-ship]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.buildShip as ShipType;
          buildShip(gs, fleet.id, type);
          updateInfoTab(gs, rerender);
          updateHeader(gs);
          rerender();
        });
      });
    }

  } else {
    el.innerHTML = `<p style="color:#678;font-size:11px;padding:8px">Klicke auf ein Sternsystem oder eine Flotte.</p>`;
  }
}

export function updateColoniesTab(gs: GameState): void {
  const el = document.getElementById('tab-colonies')!;
  const owned = Object.values(gs.systems).filter(s => s.owner === gs.playerFaction && s.colonized);
  if (owned.length === 0) {
    el.innerHTML = `<p style="color:#678;font-size:11px">Noch keine Kolonien.</p>`;
    return;
  }
  let html = `<div class="section-title">Eigene Kolonien (${owned.length})</div>`;
  for (const sys of owned) {
    html += `<div class="planet-list-item" data-sys="${sys.id}">
      <div class="pname">${sys.name}${sys.homeSystem ? ' ★' : ''}</div>
      <div class="powner">${sys.buildings.length} Gebäude · ${sys.habitablePlanets} Planeten</div>
    </div>`;
  }
  el.innerHTML = html;
}

export function updateFleetsTab(gs: GameState, onSelect: (fleetId: string) => void): void {
  const el = document.getElementById('tab-fleets')!;
  const playerFleets = Object.values(gs.fleets).filter(f => f.owner === gs.playerFaction);
  if (playerFleets.length === 0) {
    el.innerHTML = `<p style="color:#678;font-size:11px">Keine Flotten.</p>`;
    return;
  }
  let html = `<div class="section-title">Eigene Flotten (${playerFleets.length})</div>`;
  for (const f of playerFleets) {
    const sys = gs.systems[f.systemId];
    const total = Object.values(f.ships).reduce((s, c) => s + c, 0);
    html += `<div class="fleet-item${f.id === gs.selectedFleetId ? ' selected' : ''}" data-fleet="${f.id}">
      <div class="fleet-name">Flotte ${f.id.slice(-4)}</div>
      <div class="fleet-ships">${total} Schiffe · ${sys?.name ?? '?'} · ${f.movesLeft}/${f.maxMoves} Zg.</div>
    </div>`;
  }
  el.innerHTML = html;
  el.querySelectorAll<HTMLElement>('[data-fleet]').forEach(item => {
    item.addEventListener('click', () => onSelect(item.dataset.fleet!));
  });
}

export function updateTechTab(gs: GameState, rerender: RenderFn): void {
  const el = document.getElementById('tab-tech')!;
  const rp = gs.researchPoints;
  let html = `<div class="section-title">Forschungspunkte: ${rp}</div>`;
  if (gs.currentResearch) {
    const t = gs.techs[gs.currentResearch];
    html += `<div class="info-block" style="border-color:#fa8">
      <div class="info-row"><span>Aktuell</span><span style="color:#fa8">${t.name}</span></div>
      <div class="info-row"><span>Fortschritt</span><span>${t.progress}/${t.cost}</span></div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${Math.round(t.progress/t.cost*100)}%"></div></div>
    </div>`;
  }

  for (const tech of Object.values(gs.techs)) {
    const locked = tech.requires && !gs.techs[tech.requires]?.done;
    const cls = tech.done ? 'done' : gs.currentResearch === tech.id ? 'researching' : '';
    html += `<div class="tech-item ${cls}">
      <h4>${tech.done ? '✓ ' : ''}${tech.name}</h4>
      <p>${tech.desc}</p>
      ${tech.done ? '' : `<div class="progress-bar"><div class="progress-bar-fill" style="width:${Math.round(tech.progress/tech.cost*100)}%"></div></div>`}
      ${!tech.done && !locked ? `<button class="btn" data-tech="${tech.id}" style="margin-top:6px" ${gs.currentResearch && gs.currentResearch !== tech.id ? 'disabled' : ''}>Erforschen (${tech.cost} FP)</button>` : ''}
      ${locked ? `<p style="color:#555;margin-top:4px;font-size:10px">Benötigt: ${gs.techs[tech.requires!]?.name ?? '?'}</p>` : ''}
    </div>`;
  }

  el.innerHTML = html;
  el.querySelectorAll<HTMLButtonElement>('[data-tech]').forEach(btn => {
    btn.addEventListener('click', () => {
      startResearch(gs, btn.dataset.tech as TechId);
      updateTechTab(gs, rerender);
    });
  });
}

export function updateLogTab(gs: GameState): void {
  const el = document.getElementById('tab-log')!;
  const entries = gs.log.slice(0, 80);
  el.innerHTML = entries.map(e => `<div class="log-entry ${e.type}">${e.text}</div>`).join('');
}

export function showCombatResult(result: { log: string[]; attackerWins: boolean }, onClose: () => void): void {
  const overlay = document.getElementById('combat-overlay')!;
  const logBox = document.getElementById('combat-log')!;
  logBox.innerHTML = result.log.map(l => `<div class="log-entry">${l}</div>`).join('');
  logBox.scrollTop = logBox.scrollHeight;
  overlay.classList.remove('hidden');
  document.getElementById('combat-close-btn')!.onclick = () => {
    overlay.classList.add('hidden');
    onClose();
  };
}

export function showWinScreen(gs: GameState): void {
  const overlay = document.getElementById('overlay')!;
  const box = overlay.querySelector('.overlay-box')!;
  const playerWon = gs.winner === gs.playerFaction;
  const winnerName = gs.winner ? FACTIONS[gs.winner].name : '?';
  box.innerHTML = `
    <h2>${playerWon ? 'Operation erfolgreich!' : 'Niederlage'}</h2>
    <p>${playerWon
      ? `Die ${winnerName} haben die Eastside kolonisiert! Die Galaxis ist gesichert.`
      : `Die ${winnerName} haben die Galaxis unter ihre Kontrolle gebracht. Du wurdest besiegt.`
    }</p>
    <button class="btn primary" id="restart-btn" style="max-width:200px;margin:0 auto">Neues Spiel</button>
  `;
  overlay.classList.remove('hidden');
  document.getElementById('restart-btn')?.addEventListener('click', () => location.reload());
}

export function setupTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
}

export function setStatus(text: string): void {
  document.getElementById('status-text')!.textContent = text;
}

export function setupEndTurnBtn(gs: GameState, onEndTurn: () => void): void {
  document.getElementById('end-turn-btn')!.addEventListener('click', () => {
    if (gs.phase !== 'player') return;
    onEndTurn();
  });
}

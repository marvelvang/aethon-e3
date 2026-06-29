import type { GameState, FactionId, Difficulty } from './types';
import { FACTIONS } from './data';
import { generateGalaxy, getSystemAt } from './galaxy';
import { moveFleet, endTurn } from './engine';
import {
  initCanvas, render, canvasToGrid, getMovableSystemIds,
  CELL_W, CELL_H, type RenderState,
} from './renderer';
import {
  updateHeader, updateInfoTab, updateColoniesTab,
  updateFleetsTab, updateTechTab, updateLogTab,
  showWinScreen, setupTabs, setStatus, setupEndTurnBtn,
} from './ui';

// ─── Setup screen ─────────────────────────────────────────────────────────────

let selectedFaction: FactionId = 'terrans';
let selectedDiff: Difficulty = 'easy';

document.querySelectorAll<HTMLElement>('.faction-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.faction-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedFaction = card.dataset.faction as FactionId;
  });
});

document.querySelectorAll<HTMLElement>('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDiff = btn.dataset.diff as Difficulty;
  });
});

document.getElementById('start-btn')!.addEventListener('click', () => {
  document.getElementById('overlay')!.classList.add('hidden');
  startGame(selectedFaction, selectedDiff);
});

// ─── Game bootstrap ───────────────────────────────────────────────────────────

function startGame(faction: FactionId, diff: Difficulty): void {
  const gs: GameState = generateGalaxy(faction, diff);

  const canvas = document.getElementById('galaxy-canvas') as HTMLCanvasElement;
  const container = document.getElementById('galaxy-panel')!;
  initCanvas(canvas, container);

  // Pan so the player home system is roughly centered
  const playerHome = Object.values(gs.systems).find(
    s => s.owner === gs.playerFaction && s.homeSystem
  );
  let panX = Math.round(canvas.width / 2 - (playerHome ? playerHome.x * CELL_W : 0) - CELL_W / 2);
  let panY = Math.round(canvas.height / 2 - (playerHome ? playerHome.y * CELL_H : 0) - CELL_H / 2);

  const rs: RenderState = {
    hoverCell: null,
    movableSystemIds: new Set(),
  };

  setupTabs();
  setupEndTurnBtn(gs, handleEndTurn);

  function rerender() {
    render(canvas, gs, rs, panX, panY);
    updateHeader(gs);
    updateAllTabs();
    if (gs.phase === 'over') showWinScreen(gs);
  }

  function updateAllTabs() {
    updateInfoTab(gs, rerender);
    updateColoniesTab(gs);
    updateFleetsTab(gs, selectFleet);
    updateTechTab(gs, rerender);
    updateLogTab(gs);
  }

  function selectFleet(fleetId: string) {
    gs.selectedFleetId = fleetId;
    gs.selectedSystemId = null;
    const fleet = gs.fleets[fleetId];
    if (fleet) {
      rs.movableSystemIds = getMovableSystemIds(gs, fleet);
      setStatus(`Flotte gewählt – wähle ein Ziel-Sternsystem (${fleet.movesLeft} Bewegungspunkte).`);
    }
    rerender();
  }

  function handleEndTurn() {
    gs.selectedFleetId = null;
    gs.selectedSystemId = null;
    rs.movableSystemIds = new Set();
    setStatus('KI-Runden laufen…');
    rerender();

    setTimeout(() => {
      endTurn(gs);
      setStatus(`Runde ${gs.turn} – dein Zug. Wähle System oder Flotte.`);
      rerender();
    }, 150);
  }

  // ─── Canvas interactions ─────────────────────────────────────────────────

  let panning = false;
  let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
  let moved = false;

  canvas.addEventListener('mousedown', e => {
    panning = true;
    moved = false;
    panStart = { x: e.clientX, y: e.clientY, panX, panY };
  });

  canvas.addEventListener('mousemove', e => {
    if (panning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      panX = panStart.panX + dx;
      panY = panStart.panY + dy;
      render(canvas, gs, rs, panX, panY);
    } else {
      const { gx, gy } = canvasToGrid(canvas, e.clientX, e.clientY, panX, panY);
      rs.hoverCell = { x: gx, y: gy };
      const sys = getSystemAt(gs, gx, gy);
      updateTooltip(e.clientX, e.clientY, sys ? sys.name : null);
      render(canvas, gs, rs, panX, panY);
    }
  });

  canvas.addEventListener('mouseup', () => { panning = false; });
  canvas.addEventListener('mouseleave', () => {
    panning = false;
    rs.hoverCell = null;
    hideTooltip();
    render(canvas, gs, rs, panX, panY);
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('click', e => {
    if (moved) return;
    const { gx, gy } = canvasToGrid(canvas, e.clientX, e.clientY, panX, panY);
    const sys = getSystemAt(gs, gx, gy);

    if (gs.selectedFleetId && sys) {
      const fleet = gs.fleets[gs.selectedFleetId];
      if (fleet && fleet.owner === gs.playerFaction && sys.id !== fleet.systemId) {
        if (rs.movableSystemIds.has(sys.id)) {
          const err = moveFleet(gs, fleet.id, sys.id);
          if (err) setStatus(err);
          else setStatus(`Flotte → ${sys.name}`);
          rs.movableSystemIds = getMovableSystemIds(gs, fleet);
          gs.selectedSystemId = sys.id;
          gs.selectedFleetId = null;
          rs.movableSystemIds = new Set();
        } else {
          setStatus('Zu weit entfernt.');
        }
        rerender();
        return;
      }
    }

    // Check if clicking on a fleet first
    const fleetAtCell = Object.values(gs.fleets).find(
      f => f.owner === gs.playerFaction && f.systemId === sys?.id
    );

    if (sys) {
      if (fleetAtCell && e.shiftKey) {
        selectFleet(fleetAtCell.id);
      } else {
        gs.selectedSystemId = sys.id;
        gs.selectedFleetId = null;
        rs.movableSystemIds = new Set();
        const ownerName = sys.owner ? FACTIONS[sys.owner].name : 'Niemand';
        setStatus(`${sys.name} – ${ownerName} · ${sys.habitablePlanets} bewohnbare Planeten`);
        rerender();
      }
    } else {
      // Clicked empty cell — deselect
      gs.selectedSystemId = null;
      if (!gs.selectedFleetId) {
        rs.movableSystemIds = new Set();
        setStatus('Wähle ein Sternsystem oder eine Flotte.');
      }
      rerender();
    }
  });

  // ─── Initial render ───────────────────────────────────────────────────────

  setStatus(`Runde 1 – Wähle ein Sternsystem (Klick) oder Schiff+Ziel mit Shift+Klick.`);
  rerender();
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function updateTooltip(mx: number, my: number, name: string | null): void {
  const tip = document.getElementById('tooltip')!;
  if (!name) { tip.classList.add('hidden'); return; }
  tip.classList.remove('hidden');
  tip.innerHTML = `<h4>${name}</h4>`;
  tip.style.left = `${mx + 12}px`;
  tip.style.top = `${my - 8}px`;
}

function hideTooltip(): void {
  document.getElementById('tooltip')?.classList.add('hidden');
}

import type { GameState, Fleet } from './types';
import { FACTIONS } from './data';
import { GRID_W, GRID_H } from './galaxy';

export const CELL_W = 52;
export const CELL_H = 44;

interface RenderState {
  hoverCell: { x: number; y: number } | null;
  movableSystemIds: Set<string>;
}

export function initCanvas(canvas: HTMLCanvasElement, container: HTMLElement): void {
  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);
}

export function canvasToGrid(
  canvas: HTMLCanvasElement,
  cx: number, cy: number,
  panX: number, panY: number
): { gx: number; gy: number } {
  const rect = canvas.getBoundingClientRect();
  const mx = (cx - rect.left - panX) / CELL_W;
  const my = (cy - rect.top - panY) / CELL_H;
  return { gx: Math.floor(mx), gy: Math.floor(my) };
}

export function gridToCanvas(gx: number, gy: number, panX: number, panY: number): { cx: number; cy: number } {
  return { cx: gx * CELL_W + panX, cy: gy * CELL_H + panY };
}

export function render(
  canvas: HTMLCanvasElement,
  gs: GameState,
  rs: RenderState,
  panX: number,
  panY: number
): void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  // Background – starfield
  ctx.fillStyle = '#020510';
  ctx.fillRect(0, 0, W, H);

  drawStarfield(ctx, W, H);

  // Draw grid cells
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const { cx, cy } = gridToCanvas(gx, gy, panX, panY);
      drawCell(ctx, gs, gx, gy, cx, cy, rs);
    }
  }

  // Draw fleet movement paths
  drawFleetPaths(ctx, gs, panX, panY);

  // Draw fleets
  drawFleets(ctx, gs, panX, panY);
}

let starfieldCache: ImageData | null = null;
let sfW = 0, sfH = 0;

function drawStarfield(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  if (!starfieldCache || sfW !== W || sfH !== H) {
    const offscreen = document.createElement('canvas');
    offscreen.width = W; offscreen.height = H;
    const oc = offscreen.getContext('2d')!;
    oc.fillStyle = '#020510';
    oc.fillRect(0, 0, W, H);
    const rng = mulberry32(0xdeadbeef);
    const count = Math.floor(W * H / 2000);
    for (let i = 0; i < count; i++) {
      const x = rng() * W, y = rng() * H;
      const r = rng() * 1.2;
      const b = 80 + Math.floor(rng() * 175);
      oc.fillStyle = `rgba(${b},${b},${Math.min(255, b + 40)},${0.3 + rng() * 0.7})`;
      oc.beginPath();
      oc.arc(x, y, r, 0, Math.PI * 2);
      oc.fill();
    }
    starfieldCache = oc.getImageData(0, 0, W, H);
    sfW = W; sfH = H;
  }
  ctx.putImageData(starfieldCache, 0, 0);
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = a + 0x6d2b79f5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  gs: GameState,
  gx: number,
  gy: number,
  cx: number,
  cy: number,
  rs: RenderState
): void {
  const id = `sys_${gx}_${gy}`;
  const sys = gs.systems[id];
  const isHover = rs.hoverCell?.x === gx && rs.hoverCell?.y === gy;
  const isMovable = rs.movableSystemIds.has(id);
  const isSelected = gs.selectedSystemId === id;

  if (isMovable) {
    ctx.strokeStyle = '#4af8';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 1, cy + 1, CELL_W - 2, CELL_H - 2);
  }

  if (!sys) return;

  const faction = sys.owner ? FACTIONS[sys.owner] : null;
  const color = faction ? faction.color : '#334455';

  // System glow
  const cx2 = cx + CELL_W / 2;
  const cy2 = cy + CELL_H / 2;

  if (isSelected || isHover) {
    ctx.fillStyle = isSelected ? '#1a3050' : '#0d1a28';
    ctx.fillRect(cx, cy, CELL_W, CELL_H);
  }

  // Star body
  const starR = 4 + sys.habitablePlanets * 1.2;
  const grd = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, starR * 2.5);
  grd.addColorStop(0, color);
  grd.addColorStop(0.4, color + '88');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx2, cy2, starR * 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = sys.colonized ? color : '#889';
  ctx.beginPath();
  ctx.arc(cx2, cy2, starR, 0, Math.PI * 2);
  ctx.fill();

  // Orbit ring if colonized
  if (sys.colonized) {
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx2, cy2, starR + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Home star marker
  if (sys.homeSystem) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx2, cy2, starR + 9, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Selected highlight
  if (isSelected) {
    ctx.strokeStyle = '#4af';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 1, cy + 1, CELL_W - 2, CELL_H - 2);
  }

  // Name label
  ctx.fillStyle = sys.colonized ? '#c8d8e8' : '#556';
  ctx.font = `${sys.homeSystem ? 'bold ' : ''}9px Courier New`;
  ctx.textAlign = 'center';
  ctx.fillText(sys.name, cx2, cy + CELL_H - 5);
}

function drawFleets(ctx: CanvasRenderingContext2D, gs: GameState, panX: number, panY: number): void {
  // Group fleets by system
  const bySystem: Record<string, Fleet[]> = {};
  for (const fleet of Object.values(gs.fleets)) {
    if (!bySystem[fleet.systemId]) bySystem[fleet.systemId] = [];
    bySystem[fleet.systemId].push(fleet);
  }

  for (const [sysId, fleets] of Object.entries(bySystem)) {
    const sys = gs.systems[sysId];
    if (!sys) continue;
    const { cx, cy } = gridToCanvas(sys.x, sys.y, panX, panY);
    const cx2 = cx + CELL_W / 2;
    const cy2 = cy + CELL_H / 2;

    fleets.forEach((fleet, i) => {
      const fc = FACTIONS[fleet.owner].color;
      const ox = (i - (fleets.length - 1) / 2) * 12;
      const fy = cy2 + 12;

      // Diamond ship icon
      ctx.save();
      ctx.translate(cx2 + ox, fy);
      ctx.fillStyle = fc;
      ctx.strokeStyle = fleet.selected ? '#fff' : fc + 'aa';
      ctx.lineWidth = fleet.selected ? 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }
}

function drawFleetPaths(ctx: CanvasRenderingContext2D, gs: GameState, panX: number, panY: number): void {
  if (!gs.selectedFleetId) return;
  const fleet = gs.fleets[gs.selectedFleetId];
  if (!fleet?.targetSystemId) return;
  const from = gs.systems[fleet.systemId];
  const to = gs.systems[fleet.targetSystemId];
  if (!from || !to) return;

  const { cx: fx, cy: fy } = gridToCanvas(from.x, from.y, panX, panY);
  const { cx: tx, cy: ty } = gridToCanvas(to.x, to.y, panX, panY);

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#4af6';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(fx + CELL_W / 2, fy + CELL_H / 2);
  ctx.lineTo(tx + CELL_W / 2, ty + CELL_H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function getMovableSystemIds(gs: GameState, fleet: Fleet | null): Set<string> {
  if (!fleet) return new Set();
  const from = gs.systems[fleet.systemId];
  if (!from) return new Set();
  const result = new Set<string>();
  for (const sys of Object.values(gs.systems)) {
    const dx = Math.abs(sys.x - from.x);
    const dy = Math.abs(sys.y - from.y);
    const dist = Math.max(dx, dy);
    if (dist > 0 && dist <= fleet.movesLeft) result.add(sys.id);
  }
  return result;
}

export type { RenderState };

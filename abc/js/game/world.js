// ちず・あたりはんてい・しらべる あいて（ひょうじは しない）
// エリア（マップ）は いくつも ある。setArea() で きりかえる
import { TS } from '../engine/art.js';
import { AREAS } from '../data/areas.js';

let A = AREAS.island;
export const area = () => A;
export function setArea(id) { A = AREAS[id] || AREAS.island; }
export const W = () => A.MAP[0].length, H = () => A.MAP.length;
export const tileAt = (x, y) => (x < 0 || y < 0 || x >= W() || y >= H()) ? 'T' : A.MAP[y][x];
const SOLID = new Set(['T', 'b', 'r', 'F', 'h', '~', 'f', 'u', 's', 'y', 'w']);
export const isWater = (x, y) => { const c = tileAt(x, y); return c === '~' || c === '=' || c === 'p'; };
export const isPath = (x, y) => { const c = tileAt(x, y); return c === ':' || c === 'g' || c === 'v'; };
// しげみ（v）が ひらいて いるか（しまは むかしからの なまえ 'vines'）
export const vinesKey = () => A.id === 'island' ? 'vines' : 'vines_' + A.id;

const match = (cond, st) => cond && Object.keys(cond).every(k => st.world[k] === cond[k]);
// じょうたいで ばしょが かわる キャラ（after）
export function npcPos(n, st) { return n.after && st.flags[n.after.flag] ? { x: n.after.x, y: n.after.y } : { x: n.x, y: n.y }; }

// いまの エリアで しらべられる もの（キャラ・もの・かんばん・たからばこ）
export function things(st) {
  return [
    ...A.NPCS.filter(n => !match(n.hideWhen, st)).map(n => ({ type: 'npc', ref: n, ...npcPos(n, st) })),
    ...A.OBJECTS.filter(o => !o.showWhen || match(o.showWhen, st)).map(o => ({ type: 'obj', ref: o, x: o.x, y: o.y, w: o.w || 1, h: o.h || 1 })),
    ...A.SIGNS.map(s => ({ type: 'sign', ref: s, x: s.x, y: s.y })),
    ...A.CHESTS.map(c => ({ type: 'chest', ref: c, x: c.x, y: c.y })),
  ];
}
// ひらいている もん（とおれる・しらべられない）
export const isOpenGate = (o, st) => (o.ref.kind === 'gate' && st.world.gate === 'open') || (o.ref.kind === 'lettergate' && st.world['gate_' + o.ref.area] === 'open');

// でぐち（エリアの はし）
export const exitAt = (x, y) => A.exits.find(e => e.x === x && e.y === y);
export const exitOpen = (e, st) => !e.needs || ((!e.needs.quest || st.quests[e.needs.quest] === 'done') && (!e.needs.flag || st.flags[e.needs.flag]));

export function solidAt(tx, ty, st) {
  const c = tileAt(tx, ty);
  if (c === '=') return !st.flags.bridgeOpen;
  if (c === 'g') return st.world.gate !== 'open';
  if (c === 'v') return st.world[vinesKey()] !== 'open';
  if (SOLID.has(c)) return true;
  const e = exitAt(tx, ty); if (e && !exitOpen(e, st)) return true;
  return things(st).some(t => !isOpenGate(t, st) && t.ref.kind !== 'gate' && inside(t, tx, ty));
}

// しゅじんこう：x はまんなか、y はあしもと（ろんり たんい）
const HW = 9, HT = 8;
function hits(x, y, st) {
  const pts = [[x - HW, y - HT], [x + HW, y - HT], [x - HW, y - 1], [x + HW, y - 1]];
  return pts.some(([px, py]) => solidAt(Math.floor(px / TS), Math.floor(py / TS), st));
}
export const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// うごかす。ぶつかったら そこで とまる。かどに ひっかかった ときは すこし ずらす
export function move(hero, dir, dist, st) {
  const [dx, dy] = DIRV[dir];
  let moved = false;
  const steps = Math.ceil(dist / 2);
  for (let i = 0; i < steps; i++) {
    const d = dist / steps, nx = hero.x + dx * d, ny = hero.y + dy * d;
    if (!hits(nx, ny, st)) { hero.x = nx; hero.y = ny; moved = true; continue; }
    const axis = dx === 0 ? 'x' : 'y', cur = axis === 'x' ? hero.x : hero.y - HT / 2;
    const off = (Math.floor(cur / TS) + 0.5) * TS - cur;
    if (Math.abs(off) > 0.5) {
      const step = Math.sign(off) * Math.min(2, Math.abs(off));
      const tx = axis === 'x' ? hero.x + step : hero.x, ty = axis === 'y' ? hero.y + step : hero.y;
      if (!hits(tx, ty, st)) { hero.x = tx; hero.y = ty; moved = true; }
    }
    break;
  }
  return moved;
}

export const inside = (t, x, y) => x >= t.x && x < t.x + (t.w || 1) && y >= t.y && y < t.y + (t.h || 1);
// めじるしを だす いち（ひろい ものは まんなかの うえ）
export const markPos = t => ({ x: t.x + (t.w || 1) / 2, y: t.y });
export const heroTile = hero => ({ x: Math.floor(hero.x / TS), y: Math.floor((hero.y - 4) / TS) });

// まえに ある しらべられる もの
export function facing(hero, st) {
  const t = heroTile(hero), [dx, dy] = DIRV[hero.dir];
  const list = things(st).filter(o => !(o.ref.kind === 'gate' && st.world.gate === 'open') && !isOpenGate(o, st));
  const front = list.find(o => inside(o, t.x + dx, t.y + dy));
  if (front) return front;
  let best = null, bd = 1.35;
  for (const o of list) {
    const cx = Math.max(o.x, Math.min(o.x + (o.w || 1) - 1, t.x)), cy = Math.max(o.y, Math.min(o.y + (o.h || 1) - 1, t.y));
    const d = Math.hypot((cx + 0.5) * TS - hero.x, (cy + 0.8) * TS - hero.y) / TS;
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}

// ちず・あたりはんてい・しらべる あいて（ひょうじは しない）
import { TS } from '../engine/art.js';
import { MAP, NPCS, SIGNS, CHESTS, OBJECTS } from '../data/world1.js';

export const W = MAP[0].length, H = MAP.length;
export const tileAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 'T' : MAP[y][x];
const SOLID = new Set(['T', 'b', 'r', 'F', 'h', '~']);
export const isWater = (x, y) => { const c = tileAt(x, y); return c === '~' || c === '=' || c === 'p'; };
export const isPath = (x, y) => { const c = tileAt(x, y); return c === ':' || c === 'g' || c === 'v'; };

// じょうたいで ばしょが かわる キャラ（after）
export function npcPos(n, st) { return n.after && st.flags[n.after.flag] ? { x: n.after.x, y: n.after.y } : { x: n.x, y: n.y }; }
export function bossPos(st) { return npcPos(NPCS.find(n => n.boss), st); }

// しらべられる もの（キャラ・かんばん・たからばこ）
export function things(st) {
  return [
    ...NPCS.map(n => ({ type: 'npc', ref: n, ...npcPos(n, st) })),
    ...OBJECTS.map(o => ({ type: 'obj', ref: o, x: o.x, y: o.y, w: o.w || 1, h: o.h || 1 })),
    ...SIGNS.map(s => ({ type: 'sign', ref: s, x: s.x, y: s.y })),
    ...CHESTS.map(c => ({ type: 'chest', ref: c, x: c.x, y: c.y })),
  ];
}

export function solidAt(tx, ty, st) {
  const c = tileAt(tx, ty);
  if (c === '=') return !st.flags.bridgeOpen;
  if (c === 'g') return st.world.gate !== 'open';
  if (c === 'v') return st.world.vines !== 'open';
  if (c === 'f') return true;
  if (SOLID.has(c)) return true;
  return things(st).some(t => t.ref.kind !== 'gate' && inside(t, tx, ty));
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
    // かどの てつだい：いまの マスの まんなかへ すこし よせる（ほそい みちに はいりやすく する）
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
  const list = things(st);
  const front = list.find(o => inside(o, t.x + dx, t.y + dy) && !(o.ref.kind === 'gate' && st.world.gate === 'open'));
  if (front) return front;
  // ちかくに いれば むきが ずれていても OK
  let best = null, bd = 1.35;
  for (const o of list) {
    if (o.ref.kind === 'gate' && st.world.gate === 'open') continue;
    const cx = Math.max(o.x, Math.min(o.x + (o.w || 1) - 1, Math.floor(hero.x / TS))), cy = Math.max(o.y, Math.min(o.y + (o.h || 1) - 1, Math.floor((hero.y - 4) / TS)));
    const d = Math.hypot((cx + 0.5) * TS - hero.x, (cy + 0.8) * TS - hero.y) / TS;
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}

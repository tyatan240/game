// まちの データと きまり（えがく ことは しない）
// ほぞんキー moko-town-v1（localStorage ＋ IndexedDB moko-town/kv）。かたちは ついかのみ。
import { PART, FREE } from '../data/parts.js';
import { AREAS, AREA, areaOf } from '../data/areas.js';

export const W = 40, H = 40;
export const KEY = 'moko-town-v1';
const DB = 'moko-town', STORE = 'kv', LIMIT = 1500;

export function defTown() {
  return {
    version: 1, t: 0, townName: 'モコの まち', townLevel: 1,
    unlockedParts: [],          // おみせで かった パーツ（むりょうの ものは いれない）
    ground: {},                 // "x,y" → じめんの id（くさ いがい）
    objects: [],                // {id, type, x, y, r, look?, residents?}
    unlockedAreas: ['central'],
    camera: { x: 20, y: 20, zoom: 1 },
    knownChars: null,           // まちで もう しらせた キャラ（null＝はじめて）
    quests: { done: [] },       // おわった おねがい（ごほうびを もらった もの）
    templates: [],              // おきにいりの おうち [{id, type, look, size?}]
    seq: 1,
  };
}

// はじめての まち：まんなかに モコの おうちと まちの おみせ、みちと すこしの しぜん
export function starterTown() {
  const t = defTown();
  t.objects.push({ id: 'o1', type: 'moko_house', x: 18, y: 16, r: 0, look: { ...PART.moko_house.look }, residents: [] });
  t.objects.push({ id: 'o2', type: 'town_shop', x: 23, y: 16, r: 0 });
  t.seq = 3;
  for (let x = 15; x <= 27; x++) t.ground[x + ',18'] = 'road_dirt';
  for (let y = 19; y <= 22; y++) t.ground['21,' + y] = 'road_dirt';
  const add = (type, x, y) => t.objects.push({ id: 'o' + t.seq++, type, x, y, r: 0 });
  add('tree_basic', 15, 15); add('tree_basic', 27, 15); add('tree_round', 16, 21);
  add('flower_red', 17, 19); add('flower_yellow', 19, 19); add('flower_red', 24, 19); add('tuft', 25, 20);
  for (let x = 25; x <= 27; x++) for (let y = 21; y <= 22; y++) t.ground[x + ',' + y] = 'water';
  return t;
}

export function mergeTown(d) {
  const t = defTown();
  if (!d || typeof d !== 'object') return starterTown();
  if (typeof d.townName === 'string') t.townName = d.townName;
  if (Number.isFinite(d.townLevel)) t.townLevel = d.townLevel;
  if (Array.isArray(d.unlockedParts)) t.unlockedParts = d.unlockedParts.filter(i => typeof i === 'string'); // しらない id も のこす
  if (d.ground && typeof d.ground === 'object') for (const k in d.ground) if (typeof d.ground[k] === 'string') t.ground[k] = d.ground[k];
  if (Array.isArray(d.objects)) t.objects = d.objects.filter(o => o && typeof o.type === 'string' && Number.isInteger(o.x) && Number.isInteger(o.y))
    .map(o => ({ ...o, r: o.r | 0, residents: Array.isArray(o.residents) ? o.residents.filter(c => typeof c === 'string') : (PART[o.type] && (PART[o.type].home || PART[o.type].fixed) ? [] : undefined) }));
  if (Array.isArray(d.unlockedAreas)) t.unlockedAreas = d.unlockedAreas;
  if (d.camera && typeof d.camera === 'object') Object.assign(t.camera, d.camera);
  if (Array.isArray(d.knownChars)) t.knownChars = d.knownChars;
  if (d.quests && Array.isArray(d.quests.done)) t.quests.done = d.quests.done.filter(q => typeof q === 'string');
  if (Array.isArray(d.templates)) t.templates = d.templates.filter(x => x && typeof x.type === 'string').slice(0, 8);
  t.seq = Math.max(d.seq | 0, ...t.objects.map(o => +String(o.id).replace(/\D/g, '') + 1 || 1), 1);
  t.t = d.t || 0;
  // モコの おうち と おみせ は かならず ある
  if (!t.objects.some(o => o.type === 'moko_house')) t.objects.push({ id: 'o' + t.seq++, type: 'moko_house', x: 18, y: 16, r: 0, look: { ...PART.moko_house.look }, residents: [] });
  if (!t.objects.some(o => o.type === 'town_shop')) t.objects.push({ id: 'o' + t.seq++, type: 'town_shop', x: 23, y: 16, r: 0 });
  return t;
}

/* ---------- ほぞん（localStorage ＋ IndexedDB。あたらしい ほうを つかう）---------- */
const timeout = (p, v) => Promise.race([p, new Promise(ok => setTimeout(() => ok(v), LIMIT))]);
let dbP = null;
function db() {
  if (!dbP) dbP = timeout(new Promise((ok, ng) => {
    try { const q = indexedDB.open(DB, 1); q.onupgradeneeded = () => q.result.createObjectStore(STORE); q.onsuccess = () => ok(q.result); q.onerror = () => ng(q.error); } catch (e) { ng(e); }
  }).catch(() => null), null).then(d => { if (!d) dbP = null; return d; });
  return dbP;
}
export async function loadTown() {
  let a = null; try { a = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { }
  let b = null; const d = await db();
  if (d) b = await timeout(new Promise(ok => { try { const r = d.transaction(STORE).objectStore(STORE).get(KEY); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); } catch { ok(null); } }), null);
  const pick = a && b ? ((b.t || 0) > (a.t || 0) ? b : a) : (a || b);
  return mergeTown(pick);
}
// localStorage に すぐ かく（IndexedDB は あとから。へんじを またない）
export function saveTown(t) {
  t.t = Date.now();
  const v = JSON.parse(JSON.stringify(t));
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { }
  db().then(d => { try { if (d) d.transaction(STORE, 'readwrite').objectStore(STORE).put(v, KEY); } catch { } });
}

/* ---------- きまり ---------- */
export const inMap = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
// ひらいている エリアか（まちレベルで ひらく）
export const usable = (t, x, y) => { const a = inMap(x, y) && areaOf(x, y); return !!a && t.unlockedAreas.includes(a.id); };
export const groundAt = (t, x, y) => t.ground[x + ',' + y] || 'grass';
export const CUSTOM_SIZES = [[2, 2], [3, 2], [3, 3], [4, 2], [4, 3]];
export function sizeOf(o) {
  const p = PART[o.type];
  if (p && p.custom && Array.isArray(o.size) && CUSTOM_SIZES.some(([a, b]) => a === o.size[0] && b === o.size[1])) return [o.size[0], o.size[1]];
  const [w, h] = p && p.size ? p.size : [1, 1]; return (o.r & 1) && p && p.rotate ? [h, w] : [w, h];
}
export function cellsOf(o) { const [w, h] = sizeOf(o), out = []; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.push([o.x + i, o.y + j]); return out; }

// どこに なにが あるか（"x,y" → object）
export function occupancy(t, ignoreId) {
  const m = new Map();
  for (const o of t.objects) if (o.id !== ignoreId) for (const [x, y] of cellsOf(o)) m.set(x + ',' + y, o);
  return m;
}

// パーツを つかえるか（むりょう か かった もの）
export const hasPart = (t, id) => FREE.includes(id) || t.unlockedParts.includes(id);

// おけるか → { ok, reason }  reason: out（そと）/ full（もう ある）/ water（みず）/ land（みずが ない）
export function canPlace(t, o, ignoreId, occ = occupancy(t, ignoreId)) {
  const p = PART[o.type]; if (!p) return { ok: false, reason: 'out' };
  for (const [x, y] of cellsOf(o)) {
    if (!inMap(x, y)) return { ok: false, reason: 'out' };
    if (!usable(t, x, y)) return { ok: false, reason: 'lock' };
    if (occ.has(x + ',' + y)) return { ok: false, reason: 'full' };
    const g = PART[groundAt(t, x, y)];
    if (p.onWater) { if (!g || !g.water) return { ok: false, reason: 'land' }; }
    else if (g && g.water) return { ok: false, reason: 'water' };
  }
  return { ok: true };
}
// じめんを ぬれるか（もの が ある ところは ぬれない。みずの うえの はし は べつ）
export function canPaint(t, x, y, id, occ = occupancy(t)) {
  if (!usable(t, x, y)) return false;
  if (occ.has(x + ',' + y)) return false;
  return groundAt(t, x, y) !== id;
}

// あるけるか（キャラ）
export function walkable(t, x, y, occ) {
  if (!usable(t, x, y)) return false;
  const o = occ.get(x + ',' + y), p = o && PART[o.type];
  if (o && !(p && p.walk)) return false;
  const g = PART[groundAt(t, x, y)];
  if (g && g.water && !(p && p.onWater)) return false;
  return true;
}
// おうちの げんかん（ドアの まえの マス）
export function doorCell(o) { const [w, h] = sizeOf(o); return [o.x + Math.floor(w / 2), o.y + h]; }

/* ---------- エリアを ひらく ---------- */
// はじめて ひらいた とき、エリアの けしきを おく（なにも ない マスだけ）
export function openArea(t, id) {
  const a = AREA[id]; if (!a || t.unlockedAreas.includes(id)) return false;
  t.unlockedAreas.push(id);
  let s = [...id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const occ = occupancy(t), free = (x, y) => !occ.has(x + ',' + y) && !t.ground[x + ',' + y];
  const put = (type, x, y, r = 0) => { if (!free(x, y)) return; const o = { id: 'o' + t.seq++, type, x, y, r }; t.objects.push(o); occ.set(x + ',' + y, o); };
  for (let y = a.y0; y <= a.y1; y++) for (let x = a.x0; x <= a.x1; x++) {
    if (a.fill === 'forest') { const r = R(); if (r < .22) put(R() < .5 ? 'tree_pine' : 'tree_basic', x, y); else if (r < .27) put('bush', x, y); else if (r < .31) put('tuft', x, y); }
    if (a.fill === 'river') { if (x === 35 || x === 36) { if (y === 18) { t.ground[x + ',' + y] = 'water'; put('bridge', x, y); } else if (free(x, y)) t.ground[x + ',' + y] = 'water'; } else if (R() < .1) put(R() < .5 ? 'tree_round' : 'tuft', x, y); }
    if (a.fill === 'beach') { if (y >= 37) { if (free(x, y)) t.ground[x + ',' + y] = 'water'; } else if (y >= 34) { if (free(x, y)) t.ground[x + ',' + y] = 'sand'; if (R() < .06) put('rock', x, y); } else if (R() < .06) put('tuft', x, y); }
    if (a.fill === 'meadow') { const r = R(); if (r < .3) put(['flower_red', 'flower_yellow', 'flower_pink', 'flower_tulip'][(R() * 4) | 0], x, y); else if (r < .36) put('tree_round', x, y); }
  }
  return true;
}
export { AREAS };

/* ---------- もどす（スナップショット）---------- */
export class History {
  constructor(t) { this.t = t; this.undo = []; this.redo = []; }
  snap() { return JSON.stringify({ g: this.t.ground, o: this.t.objects }); }
  push() { this.undo.push(this.snap()); if (this.undo.length > 60) this.undo.shift(); this.redo = []; }
  _set(s) { const d = JSON.parse(s); this.t.ground = d.g; this.t.objects = d.o; }
  back() { const s = this.undo.pop(); if (!s) return false; this.redo.push(this.snap()); this._set(s); return true; }
  fwd() { const s = this.redo.pop(); if (!s) return false; this.undo.push(this.snap()); this._set(s); return true; }
}

// せかいの データ（えがきかたとは べつ）。ざひょうは せいすう (x, y, z)。y が うえ。
// あとで ロボットの めいれい（おく・こわす・うえにおく…）も、ここの place/remove/batch を つかう。
import { BLOCK } from '../data/blocks.js';

export const SIZE = { w: 16, h: 12, d: 16 };
const HIST_MAX = 200;

export class World {
  constructor(size = SIZE) {
    this.w = size.w; this.h = size.h; this.d = size.d;
    this.cells = new Map(); // "x,y,z" → { id, r }
    this.undoStack = []; this.redoStack = [];
    this._batch = null;
    this.listeners = new Set();
  }
  static key(x, y, z) { return x + ',' + y + ',' + z; }
  static parse(k) { return k.split(',').map(Number); }

  inBounds(x, y, z) {
    return Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(z) &&
      x >= 0 && x < this.w && y >= 0 && y < this.h && z >= 0 && z < this.d;
  }
  get(x, y, z) { return this.cells.get(World.key(x, y, z)) || null; }
  has(x, y, z) { return this.cells.has(World.key(x, y, z)); }
  count() { return this.cells.size; }
  *each() { for (const [k, c] of this.cells) { const [x, y, z] = World.parse(k); yield { x, y, z, id: c.id, r: c.r || 0 }; } }

  // おけるか？ → { ok, reason }  reason: 'out'（そと）/ 'full'（もう ある）/ 'top'（はな・ドアの うえ）/ 'id'（しらない ブロック）
  canPlace(x, y, z, id) {
    if (!BLOCK[id]) return { ok: false, reason: 'id' };
    if (!this.inBounds(x, y, z)) return { ok: false, reason: 'out' };
    if (this.has(x, y, z)) return { ok: false, reason: 'full' };
    const below = this.get(x, y - 1, z);
    if (below && BLOCK[below.id] && BLOCK[below.id].solid === false) return { ok: false, reason: 'top' };
    return { ok: true };
  }
  canRemove(x, y, z) { return this.has(x, y, z); }

  place(x, y, z, id, r = 0) {
    if (!this.canPlace(x, y, z, id).ok) return false;
    this._apply(World.key(x, y, z), null, { id, r: ((r % 4) + 4) % 4 });
    return true;
  }
  remove(x, y, z) {
    const k = World.key(x, y, z), before = this.cells.get(k);
    if (!before) return false;
    this._apply(k, before, null);
    return true;
  }

  // いくつかの そうさを 1かいの「もどす」に まとめる（「はじめから」など。おわってから 1かいだけ えがく）
  batch(fn) {
    if (this._batch) return fn(this);
    this.beginBatch();
    try { return fn(this); } finally { this.endBatch(); }
  }
  // じかんを かけて すすむ まとめ（ロボットの じっこう 1かい分）。live:true なら 1つずつ えがく
  beginBatch(opts = {}) {
    if (this._batch) { this._depth++; return; }
    this._batch = []; this._depth = 0; this._live = !!opts.live;
  }
  endBatch() {
    if (!this._batch) return;
    if (this._depth > 0) { this._depth--; return; }
    const ops = this._batch, live = this._live; this._batch = null; this._live = false;
    if (ops.length) this._push(ops);
    if (ops.length || live) this._emit();
  }
  inBatch() { return !!this._batch; }
  // その れつ（x,z）で いちばん うえの ブロックの うえ（なにも なければ 0）
  topY(x, z) {
    for (let y = this.h - 1; y >= 0; y--) if (this.has(x, y, z)) return y + 1;
    return 0;
  }

  undo() {
    const ops = this.undoStack.pop(); if (!ops) return false;
    for (let i = ops.length - 1; i >= 0; i--) this._set(ops[i].k, ops[i].before);
    this.redoStack.push(ops); this._emit(); return true;
  }
  redo() {
    const ops = this.redoStack.pop(); if (!ops) return false;
    for (const o of ops) this._set(o.k, o.after);
    this.undoStack.push(ops); this._emit(); return true;
  }
  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }

  // はじめから（せかいを つくりなおす。もどす ことも できる）
  reset(fill = true) {
    this.batch(() => {
      for (const { x, y, z } of [...this.each()]) this.remove(x, y, z);
      if (fill) for (let x = 0; x < this.w; x++) for (let z = 0; z < this.d; z++) this.place(x, 0, z, 'grass');
    });
  }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  // ほぞんの かたち：{ size:[w,h,d], blocks:[[x,y,z,id,r], …] }（ついかのみ。かたちを かえない）
  toJSON() {
    const blocks = [];
    for (const b of this.each()) blocks.push(b.r ? [b.x, b.y, b.z, b.id, b.r] : [b.x, b.y, b.z, b.id]);
    return { size: [this.w, this.h, this.d], blocks };
  }
  load(data) {
    this.cells.clear(); this.undoStack = []; this.redoStack = [];
    for (const b of (data && Array.isArray(data.blocks) ? data.blocks : [])) {
      if (!Array.isArray(b)) continue;
      const [x, y, z, id, r] = b;
      if (typeof id !== 'string' || !this.inBounds(x, y, z)) continue;
      this.cells.set(World.key(x, y, z), { id, r: r | 0 }); // しらない id も のこす（あとの ばんで ふえた ブロック）
    }
    this._emit();
  }

  _set(k, v) { if (v) this.cells.set(k, { ...v }); else this.cells.delete(k); }
  _apply(k, before, after) {
    this._set(k, after);
    const op = { k, before: before ? { ...before } : null, after: after ? { ...after } : null };
    if (this._batch) { this._batch.push(op); if (this._live) this._emit(); return; }
    this._push([op]); this._emit();
  }
  _push(ops) {
    this.undoStack.push(ops); this.redoStack = [];
    if (this.undoStack.length > HIST_MAX) this.undoStack.shift();
  }
  _emit() { for (const fn of this.listeners) fn(this); }
}

// さいしょの せかい：くさの じめん
export function newWorld() {
  const w = new World();
  for (let x = 0; x < w.w; x++) for (let z = 0; z < w.d; z++) w.cells.set(World.key(x, 0, z), { id: 'grass', r: 0 });
  return w;
}

// ロボモコ（うごき の きまりと、じっこう がかり）。えがく ことは しない。
import { BLOCK } from '../data/blocks.js';
import { DIRS, steps } from './program.js';

export const ERR = {
  edge: 'そとには いけないよ',
  high: 'これいじょう たかく できないよ',
  flower: 'はなの うえには おけないよ',
  nothing: 'こわす ブロックが ないよ',
  unknown: 'その ブロックは つかえないよ',
};

export class Robot {
  constructor(world, s) {
    this.world = world; s = s || {};
    this.x = Number.isInteger(s.x) && s.x >= 0 && s.x < world.w ? s.x : 3;
    this.z = Number.isInteger(s.z) && s.z >= 0 && s.z < world.d ? s.z : 12;
    this.dir = DIRS[s.dir] ? s.dir : 'D';
  }
  get y() { return this.world.topY(this.x, this.z); }   // ロボは いつも その れつの いちばん うえに たつ
  pos() { return { x: this.x, y: this.y, z: this.z }; }
  toJSON() { return { x: this.x, z: this.z, dir: this.dir }; }
  moveTo(x, z) { if (this.world.inBounds(x, 0, z)) { this.x = x; this.z = z; return true; } return false; }

  // 1つ じっこう → { ok, kind, from, to, reason }
  exec(c) {
    const w = this.world, from = this.pos();
    if (DIRS[c.t]) {
      const d = DIRS[c.t], nx = this.x + d.dx, nz = this.z + d.dz;
      this.dir = c.t;
      if (!w.inBounds(nx, 0, nz)) return { ok: false, kind: 'bonk', from, to: from, reason: 'edge' };
      this.x = nx; this.z = nz;
      return { ok: true, kind: 'move', from, to: this.pos() };
    }
    if (c.t === 'put') {
      if (!BLOCK[c.b]) return { ok: false, kind: 'bonk', from, to: from, reason: 'unknown' };
      const y = from.y, chk = w.canPlace(this.x, y, this.z, c.b);
      if (!chk.ok) return { ok: false, kind: 'bonk', from, to: from, reason: chk.reason === 'top' ? 'flower' : 'high' };
      w.place(this.x, y, this.z, c.b, BLOCK[c.b].rotate ? DIRS[this.dir].r : 0);   // やね・ドアは ロボの むきに あわせる
      return { ok: true, kind: 'put', from, to: this.pos() };
    }
    if (c.t === 'break') {
      if (from.y <= 0) return { ok: false, kind: 'bonk', from, to: from, reason: 'nothing' };
      w.remove(this.x, from.y - 1, this.z);
      return { ok: true, kind: 'break', from, to: this.pos() };
    }
    return { ok: true, kind: 'wait', from, to: from };
  }
}

// じっこう がかり：じっこう・いちじていし・1ステップ・ていし・はやさ
// まとめて 1かいの「もどす」で もどせる（world.beginBatch）。
export const SPEEDS = [{ ms: 750, name: 'ゆっくり' }, { ms: 420, name: 'ふつう' }, { ms: 160, name: 'はやい' }];

export class Runner {
  constructor(world, robot, hooks = {}) {
    this.world = world; this.robot = robot; this.hooks = hooks;
    this.state = 'idle'; // idle / run / pause
    this.speed = 1; this.list = []; this.i = 0; this.timer = 0;
  }
  get ms() { return SPEEDS[this.speed].ms; }
  _begin(prog) {
    this.list = steps(prog); this.i = 0;
    if (!this.list.length) return false;
    this.world.beginBatch({ live: true });
    return true;
  }
  play(prog) {
    if (this.state === 'run') return;
    if (this.state === 'idle' && !this._begin(prog)) return;
    this.state = 'run'; this.hooks.state && this.hooks.state(this.state);
    this._tick();
  }
  pause() {
    if (this.state !== 'run') return;
    clearTimeout(this.timer); this.state = 'pause'; this.hooks.state && this.hooks.state(this.state);
  }
  step(prog) {
    if (this.state === 'run') return;
    if (this.state === 'idle') { if (!this._begin(prog)) return; this.state = 'pause'; this.hooks.state && this.hooks.state(this.state); }
    this._one();
  }
  stop() { if (this.state !== 'idle') this._end({ ok: true, stopped: true }); }
  _tick() {
    if (this.state !== 'run') return;
    if (!this._one()) return;
    this.timer = setTimeout(() => this._tick(), this.ms);
  }
  // 1つ すすめる。つづけられる なら true
  _one() {
    if (this.i >= this.list.length) { this._end({ ok: true, done: true }); return false; }
    const s = this.list[this.i++];
    const res = this.robot.exec(s);
    this.hooks.step && this.hooks.step(s, res, this.ms);
    if (!res.ok) { this._end({ ok: false, reason: res.reason, step: s }); return false; }
    if (this.i >= this.list.length) {
      // さいごの うごきを みせてから おわる
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this._end({ ok: true, done: true }), Math.min(this.ms, 400));
      return false;
    }
    return true;
  }
  _end(result) {
    clearTimeout(this.timer);
    if (this.state === 'idle') return;
    this.state = 'idle';
    this.world.endBatch();
    this.hooks.state && this.hooks.state(this.state);
    this.hooks.end && this.hooks.end(result);
  }
}

// まちの じゅうにん（キャラ）：あるく・とまる・おうちに かえる・おしゃべり
// キャラの え は おうちの charSVG（core.js）を つかう。もっている キャラ（S.owned）だけ。
import { PART, FAV } from '../data/parts.js';
import { W, H, occupancy, walkable, doorCell, groundAt } from './town.js';

const LINES = [
  'この おうち だいすき！', 'おはなを みに いこう！', 'こうえんに いきたいな！', 'いい てんき だね！', 'おべんきょう がんばってる？',
  'まちが どんどん すてきに なるね！', 'おさんぽ たのしい！', 'みんなで あそぼう！',
];
const FAV_LINE = { flower: 'おはなが だいすき！', forest: 'きの したは きもちいいね', bench: 'ベンチで ひとやすみ…', park: 'こうえんで あそぼう！' };

// キャラの え（SVG → がぞう）を つくって おぼえる
const imgCache = new Map();
export function charImage(eq) {
  const key = [eq.char, eq.outfit, eq.hat, eq.acc].join('|');
  if (imgCache.has(key)) return imgCache.get(key);
  const svg = charSVG(eq, 'normal').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="240" ');
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  imgCache.set(key, img); return img;
}

// みち（BFS）
function path(t, occ, from, to) {
  const k = (x, y) => y * W + x, prev = new Int32Array(W * H).fill(-1), q = [k(from[0], from[1])];
  prev[q[0]] = q[0];
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % W, y = (c / W) | 0;
    if (x === to[0] && y === to[1]) { const out = []; let n = c; while (n !== prev[n]) { out.push([n % W, (n / W) | 0]); n = prev[n]; } return out.reverse(); }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, nk = k(nx, ny);
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[nk] !== -1) continue;
      if (!walkable(t, nx, ny, occ) && !(nx === to[0] && ny === to[1])) continue;
      prev[nk] = c; q.push(nk);
    }
  }
  return null;
}

export class People {
  constructor() { this.list = []; this.occ = null; }
  // まちの データ と もっている キャラ から じゅうにんを きめる
  sync(t, avatar) {
    const keep = new Map(this.list.map(p => [p.id, p]));
    const want = [];
    for (const o of t.objects) {
      const p = PART[o.type];
      if (o.type === 'moko_house') want.push([avatar, o]);
      else if (p && p.home) for (const c of o.residents || []) if (c !== avatar) want.push([c, o]);
    }
    this.list = want.map(([id, home]) => {
      const p = keep.get(id) || { id, x: 0, y: 0, state: 'home', wait: 1 + Math.random() * 4, path: null, say: null, sayT: 0, bob: Math.random() * 6, trips: 0, face: 1 };
      if (p.home !== home.id) { p.home = home.id; p.state = 'home'; p.path = null; p.wait = Math.min(p.wait, 1 + Math.random() * 2); }
      return p;
    });
    this.t = t; this.occ = occupancy(t);
  }
  // まちが かわったら みちを つくりなおす
  changed(t) { this.occ = occupancy(t); for (const p of this.list) if (p.path) p.path = null; }
  homeOf(id) { return this.t.objects.find(o => o.id === id); }

  pickTarget(p) {
    const t = this.t, occ = this.occ, fav = FAV[p.id] || 'park', R = Math.random();
    const near = list => { const o = list[(Math.random() * list.length) | 0]; if (!o) return null; const cs = []; const [w, h] = [PART[o.type].size || [1, 1]][0]; for (let x = o.x - 1; x <= o.x + w; x++) for (let y = o.y - 1; y <= o.y + h; y++) if (walkable(t, x, y, occ)) cs.push([x, y]); return cs[(Math.random() * cs.length) | 0] || null; };
    if (R < .35) { const fs = t.objects.filter(o => PART[o.type] && PART[o.type].fav === fav); const c = near(fs); if (c) return c; }
    if (R < .5) { const others = this.list.filter(q => q !== p && q.state !== 'home'); const q = others[(Math.random() * others.length) | 0]; if (q) return [Math.round(q.x), Math.round(q.y)]; }
    if (R < .65) { const fs = t.objects.filter(o => PART[o.type] && PART[o.type].fav === 'park'); const c = near(fs); if (c) return c; }
    // みち の うえ か、ちかくの あるける ところ
    const roads = Object.keys(t.ground).filter(k => PART[t.ground[k]] && PART[t.ground[k]].road).map(k => k.split(',').map(Number)).filter(([x, y]) => walkable(t, x, y, occ));
    if (roads.length && Math.random() < .7) return roads[(Math.random() * roads.length) | 0];
    for (let i = 0; i < 30; i++) { const x = Math.round(p.x + (Math.random() - .5) * 12), y = Math.round(p.y + (Math.random() - .5) * 12); if (walkable(t, x, y, occ)) return [x, y]; }
    return null;
  }

  update(dt) {
    for (const p of this.list) {
      p.bob += dt * 8;
      if (p.sayT > 0) { p.sayT -= dt; if (p.sayT <= 0) p.say = null; }
      const home = this.homeOf(p.home); if (!home) continue;
      const door = doorCell(home);
      if (p.state === 'home') {
        p.wait -= dt; if (p.wait > 0) continue;
        if (!walkable(this.t, door[0], door[1], this.occ)) { p.wait = 5; continue; } // げんかんが ふさがれて いる
        p.x = door[0]; p.y = door[1]; p.state = 'idle'; p.wait = .5; p.trips = 2 + ((Math.random() * 3) | 0); continue;
      }
      if (p.state === 'idle') {
        p.wait -= dt; if (p.wait > 0) continue;
        let to;
        if (p.trips <= 0) { to = door; p.goingHome = true; } else { to = this.pickTarget(p); p.goingHome = false; }
        const pa = to && path(this.t, this.occ, [Math.round(p.x), Math.round(p.y)], to);
        if (pa && pa.length) { p.path = pa; p.state = 'walk'; p.trips--; } else { p.wait = 1 + Math.random() * 2; if (p.goingHome) { p.state = 'home'; p.wait = 6 + Math.random() * 10; } }
        continue;
      }
      if (p.state === 'walk') {
        if (!p.path) { p.state = 'idle'; p.wait = .3; continue; }
        const [tx, ty] = p.path[0], dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), sp = 1.7 * dt;
        if (dx) p.face = Math.sign(dx);
        if (d <= sp) { p.x = tx; p.y = ty; p.path.shift(); if (!p.path.length) { p.path = null; if (p.goingHome && tx === door[0] && ty === door[1]) { p.state = 'home'; p.wait = 6 + Math.random() * 12; } else { p.state = 'idle'; p.wait = 1.5 + Math.random() * 3.5; } } }
        else { p.x += dx / d * sp; p.y += dy / d * sp; }
      }
    }
  }

  talk(p) {
    const fav = FAV[p.id] || 'park';
    p.say = Math.random() < .35 ? FAV_LINE[fav] : LINES[(Math.random() * LINES.length) | 0]; p.sayT = 3.5;
    if (p.state === 'walk') { p.state = 'idle'; p.path = null; p.wait = 2.5; }
  }
  visible() { return this.list.filter(p => p.state !== 'home'); }
  // がめんの てんに いちばん ちかい キャラ（タイル ざひょう）
  at(wx, wy) {
    let best = null, bd = .8;
    for (const p of this.visible()) { const d = Math.hypot(p.x + .5 - wx, p.y + .3 - wy); if (d < bd) { bd = d; best = p; } }
    return best;
  }
}
export { groundAt };

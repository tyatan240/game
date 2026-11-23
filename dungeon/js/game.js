// ゲームの きまり（ターン・こうげき・てきの うごき・アイテム・まほう）。ひょうじとは べつ
import { WORD, WORDS, SPELLS, HERO0, LV_EXP, INV_MAX, MAX_FLOOR, BOSS_FLOORS } from './data.js';
import { genFloor, genTutorial } from './gen.js';

let rand = Math.random;
export const setRand = r => { rand = r; };
const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = a => a[Math.floor(rand() * a.length)];
const en = id => `<b class="en">${WORD[id].en}</b>`;
// HPの けいさんしき（さんすうの れんしゅうにも なる）。ひきざんは マイナスに ならない ように のこりの HPまで
const calc = (who, a, op, b) => `<span class="calc">${who}の HP　${a} ${op} ${b} ＝ ${op === '−' ? a - b : a + b}</span>`;
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/* ---------- あたらしい ぼうけん・かい ---------- */
export function newRun(tutorial = false) {
  const run = { v: 1, tut: tutorial, floor: 0, turn: 0, uid: 1, met: [], spells: [], inv: [], equip: { weapon: null, shield: null }, power: 0,
    hero: { x: 0, y: 0, dir: 'down', hp: HERO0.hp, maxhp: HERO0.hp, mp: HERO0.mp, maxmp: HERO0.mp, lv: 1, exp: 0, atk: HERO0.atk, def: HERO0.def } };
  enterFloor(run, tutorial ? 0 : 1);
  return run;
}
const cellsOf = r => { const c = []; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) c.push([x, y]); return c; };
function freeCell(run, room, avoid = []) {
  const cs = cellsOf(room).filter(([x, y]) => !(x === run.hero.x && y === run.hero.y) && !run.mons.some(m => m.x === x && m.y === y) && !run.items.some(i => i.x === x && i.y === y)
    && !run.boxes.some(b => b.x === x && b.y === y) && !(run.stairs && run.stairs.x === x && run.stairs.y === y) && !avoid.some(([ax, ay]) => ax === x && ay === y));
  return cs.length ? pick(cs) : null;
}
function spawnMon(run, id, x, y, extra = {}) {
  const w = WORD[id], f = Math.max(1, run.floor);
  const hp = Math.round(w.hp * (1 + 0.2 * (f - 1)));
  run.mons.push({ uid: run.uid++, id, x, y, hp, maxhp: hp, atk: w.atk + Math.floor((f - 1) / 3), exp: w.exp + Math.floor(f / 2), tick: 0, ...extra });
}
function rollItem(run) {
  const known = new Set(run.spells), f = run.floor;
  const list = WORDS.filter(w => (w.cat === 'item' || w.cat === 'equip') && w.w && (!w.minFloor || w.minFloor <= f) && !(w.id === 'magicbook' && SPELLS.every(s => known.has(s))));
  let t = rand() * list.reduce((n, w) => n + w.w, 0);
  for (const w of list) { t -= w.w; if (t <= 0) return w.id; }
  return 'apple';
}
export function enterFloor(run, floor) {
  run.floor = floor; run.mons = []; run.items = []; run.boxes = []; run.stairs = null; run.bossDead = false;
  if (floor === 0) { // チュートリアル
    run.map = genTutorial();
    run.hero.x = 2; run.hero.y = 3; run.hero.hp = 12;
    run.items.push({ uid: run.uid++, id: 'apple', x: 11, y: 2 }, { uid: run.uid++, id: 'magicbook', x: 12, y: 6 }, { uid: run.uid++, id: 'sword', x: 10, y: 6 }, { uid: run.uid++, id: 'key', x: 15, y: 6 });
    run.boxes.push({ x: 16, y: 1, open: false });
    spawnMon(run, 'slime', 14, 3, { tame: true, hp: 3, maxhp: 3 }); spawnMon(run, 'slime', 16, 5, { tame: true, hp: 3, maxhp: 3 });
    run.mons.forEach(m => { m.hp = 3; m.maxhp = 3; });
    run.stairs = { x: 24, y: 3 };
  } else {
    const boss = BOSS_FLOORS.includes(floor);
    run.map = genFloor(boss, rand);
    const rooms = run.map.rooms, start = rooms[0];
    run.hero.x = start.x + (start.w >> 1); run.hero.y = start.y + (start.h >> 1);
    if (boss) {
      const R = rooms[1]; spawnMon(run, 'kingslime', R.x + (R.w >> 1), R.y + (R.h >> 1), { boss: true });
      for (let i = 0; i < 2; i++) { const c = freeCell(run, R); if (c) spawnMon(run, 'slime', c[0], c[1]); }
      for (let i = 0; i < 2; i++) { const c = freeCell(run, start); if (c) run.items.push({ uid: run.uid++, id: i ? 'bread' : 'apple', x: c[0], y: c[1] }); }
    } else {
      const last = rooms[rooms.length - 1], sc = freeCell(run, last); run.stairs = { x: sc[0], y: sc[1] };
      const mtypes = WORDS.filter(w => w.cat === 'monster' && !w.boss && w.minFloor <= floor).map(w => w.id);
      for (let i = 0; i < 3 + floor; i++) { const c = freeCell(run, pick(rooms.slice(1))); if (c) spawnMon(run, pick(mtypes), c[0], c[1]); }
      for (let i = 0; i < 4 + (floor > 2 ? 1 : 0); i++) { const c = freeCell(run, pick(rooms)); if (c) run.items.push({ uid: run.uid++, id: rollItem(run), x: c[0], y: c[1] }); }
      if (rand() < 0.45) { // たからばこ と かぎ
        const c = freeCell(run, pick(rooms.slice(1))), k = freeCell(run, pick(rooms));
        if (c && k) { run.boxes.push({ x: c[0], y: c[1], open: false }); run.items.push({ uid: run.uid++, id: 'key', x: k[0], y: k[1] }); }
      }
    }
  }
  run.seen = '0'.repeat(run.map.w * run.map.h); // みえる ところは よびだしがわで updateSeen()
}

/* ---------- みえる ところ ---------- */
export const tileAt = (run, x, y) => (x < 0 || y < 0 || x >= run.map.w || y >= run.map.h) ? '#' : run.map.tiles[y][x];
export const roomAt = (run, x, y) => run.map.rooms.find(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) || null;
export function visible(run) {
  const v = new Set(), h = run.hero, r = roomAt(run, h.x, h.y);
  if (r) for (let y = r.y - 1; y <= r.y + r.h; y++) for (let x = r.x - 1; x <= r.x + r.w; x++) v.add(x + ',' + y);
  for (let y = h.y - 1; y <= h.y + 1; y++) for (let x = h.x - 1; x <= h.x + 1; x++) v.add(x + ',' + y);
  return v;
}
// みた マスを おぼえる。はじめて みた ことば（てき・アイテム・たからばこ・かいだん）を かえす
export function updateSeen(run) {
  const v = visible(run), s = run.seen.split(''), newly = [];
  for (const k of v) { const [x, y] = k.split(',').map(Number); if (x >= 0 && y >= 0 && x < run.map.w && y < run.map.h) s[y * run.map.w + x] = '1'; }
  run.seen = s.join('');
  const meet = id => { if (!run.met.includes(id)) { run.met.push(id); newly.push(id); } };
  for (const m of run.mons) if (v.has(m.x + ',' + m.y)) meet(m.id);
  for (const i of run.items) if (v.has(i.x + ',' + i.y)) meet(i.id);
  for (const b of run.boxes) if (v.has(b.x + ',' + b.y)) meet('treasurebox');
  if (run.stairs && v.has(run.stairs.x + ',' + run.stairs.y)) meet('stairs');
  return newly;
}
export const seenAt = (run, x, y) => run.seen[y * run.map.w + x] === '1';

/* ---------- つよさ ---------- */
const eqItem = (run, slot) => run.inv.find(i => i.uid === run.equip[slot]);
export const heroAtk = run => run.hero.atk + (eqItem(run, 'weapon') ? WORD[eqItem(run, 'weapon').id].atk : 0) + (run.power || 0);
export const heroDef = run => run.hero.def + (eqItem(run, 'shield') ? WORD[eqItem(run, 'shield').id].def : 0);
export const monAt = (run, x, y) => run.mons.find(m => m.x === x && m.y === y);
const boxAt = (run, x, y) => run.boxes.find(b => b.x === x && b.y === y);
const walkable = (run, x, y) => tileAt(run, x, y) !== '#' && !boxAt(run, x, y);
export const onStairs = run => !!run.stairs && run.hero.x === run.stairs.x && run.hero.y === run.stairs.y;

/* ---------- こうどう ---------- */
// action：{t:'move',dir} {t:'attack'} {t:'wait'} {t:'use',uid} {t:'equip',uid} {t:'drop',uid} {t:'cast',id}
// → { ev:[イベント], turn:ターンが すすんだか }
export function act(run, a) {
  const ev = [], h = run.hero;
  let turn = false;
  const say = text => ev.push({ t: 'msg', text });
  if (a.t === 'move') {
    h.dir = a.dir; const [dx, dy] = DIRS[a.dir], nx = h.x + dx, ny = h.y + dy, m = monAt(run, nx, ny), b = boxAt(run, nx, ny);
    if (m) { attackMon(run, m, ev); turn = true; }
    else if (b) { openBox(run, b, ev); turn = !!ev.find(e => e.t === 'open'); }
    else if (walkable(run, nx, ny)) {
      h.x = nx; h.y = ny; turn = true; ev.push({ t: 'step' });
      const it = run.items.find(i => i.x === nx && i.y === ny);
      if (it) { if (run.inv.length < INV_MAX) { run.items = run.items.filter(i => i !== it); run.inv.push({ uid: it.uid, id: it.id, peek: false }); say(`${en(it.id)} を ひろった！`); ev.push({ t: 'pickup', id: it.id }); }
        else say(`もちものが いっぱい（${INV_MAX}こ）。${en(it.id)} は ひろえない`); }
      if (onStairs(run)) ev.push({ t: 'stairs' });
    } else ev.push({ t: 'bump' });
  } else if (a.t === 'attack') {
    const [dx, dy] = DIRS[h.dir], m = monAt(run, h.x + dx, h.y + dy);
    if (m) { attackMon(run, m, ev); turn = true; } else { say('まえに てきが いないよ'); ev.push({ t: 'swing' }); turn = true; }
  } else if (a.t === 'wait') { turn = true; say('ひとやすみ'); }
  else if (a.t === 'use') turn = useItem(run, a.uid, ev);
  else if (a.t === 'equip') turn = equipItem(run, a.uid, ev);
  else if (a.t === 'drop') {
    const it = run.inv.find(i => i.uid === a.uid); if (!it) return { ev, turn: false };
    if (run.equip.weapon === it.uid) run.equip.weapon = null; if (run.equip.shield === it.uid) run.equip.shield = null;
    run.inv = run.inv.filter(i => i !== it);
    if (!run.items.some(i => i.x === h.x && i.y === h.y)) run.items.push({ uid: it.uid, id: it.id, x: h.x, y: h.y });
    say(`${en(it.id)} を すてた`); turn = true;
  } else if (a.t === 'cast') turn = castSpell(run, a.id, ev);
  if (turn) endTurn(run, ev);
  return { ev, turn };
}
function gainExp(run, n, ev) {
  const h = run.hero; h.exp += n;
  while (h.lv + 1 < LV_EXP.length && h.exp >= LV_EXP[h.lv + 1]) {
    h.lv++; h.maxhp += 5; h.hp += 5; h.atk += 1; h.maxmp += 1; h.mp += 1;
    ev.push({ t: 'level', lv: h.lv }); ev.push({ t: 'msg', text: `レベル ${h.lv} に なった！ HPと つよさが あがった！` });
  }
}
function hurtMon(run, m, dmg, ev, how = 'hit') {
  dmg = Math.min(dmg, m.hp); const hp0 = m.hp;
  m.hp -= dmg; ev.push({ t: 'fx', kind: how, x: m.x, y: m.y, n: dmg });
  ev.push({ t: 'msg', text: `${en(m.id)} に ${dmg} ダメージ！` });
  ev.push({ t: 'msg', text: calc(WORD[m.id].en, hp0, '−', dmg), calc: true, monUid: m.uid, monHp: m.hp });
  if (m.hp <= 0) {
    run.mons = run.mons.filter(x => x !== m);
    ev.push({ t: 'kill', id: m.id, x: m.x, y: m.y, uid: m.uid }); ev.push({ t: 'msg', text: `${en(m.id)} を たおした！` });
    gainExp(run, m.exp, ev);
    if (m.boss) { run.bossDead = true; run.stairs = { x: m.x, y: m.y }; ev.push({ t: 'boss', id: m.id }); ev.push({ t: 'msg', text: `${en('stairs')} が あらわれた！` }); }
  }
}
function attackMon(run, m, ev) {
  run.hero.dir = m.x > run.hero.x ? 'right' : m.x < run.hero.x ? 'left' : m.y > run.hero.y ? 'down' : 'up';
  ev.push({ t: 'msg', text: 'モコの こうげき！' });
  hurtMon(run, m, Math.max(1, heroAtk(run) + ri(0, 2)), ev);
}
function openBox(run, b, ev) {
  if (b.open) { ev.push({ t: 'msg', text: `${en('treasurebox')} は からっぽ` }); return; }
  const k = run.inv.find(i => i.id === 'key');
  if (!k) { ev.push({ t: 'msg', text: `${en('treasurebox')} だ。${en('key')} が あれば あけられる` }); ev.push({ t: 'bump' }); return; }
  run.inv = run.inv.filter(i => i !== k); b.open = true;
  const got = run.tut ? ['bread', 'shield'] : [rollItem(run), rollItem(run)]; // れんしゅうは きまった もの
  for (const id of got) {
    if (run.inv.length < INV_MAX) run.inv.push({ uid: run.uid++, id, peek: false });
    else run.items.push({ uid: run.uid++, id, x: run.hero.x, y: run.hero.y });
  }
  ev.push({ t: 'open', got }); ev.push({ t: 'used', id: 'key' });
  ev.push({ t: 'msg', text: `${en('key')} で ${en('treasurebox')} を あけた！ ${got.map(en).join(' と ')} が はいっていた！` });
}
function useItem(run, uid, ev) {
  const it = run.inv.find(i => i.uid === uid); if (!it) return false;
  const w = WORD[it.id], h = run.hero;
  const done = () => { run.inv = run.inv.filter(i => i !== it); ev.push({ t: 'used', id: it.id, read: !it.peek }); };
  if (w.use === 'heal') { const n = Math.min(w.val, h.maxhp - h.hp), hp0 = h.hp; h.hp += n; done(); ev.push({ t: 'fx', kind: 'heal', x: h.x, y: h.y, n }); ev.push({ t: 'msg', text: `${en(it.id)} を ${w.verb === 'のむ' ? 'のんだ' : 'たべた'}！ ${n ? `HPが ${n} かいふく` : 'HPは もう まんたん'}` }); if (n) ev.push({ t: 'msg', text: calc('モコ', hp0, '＋', n), calc: true, heroHp: h.hp }); return true; }
  if (w.use === 'potion') { h.hp = h.maxhp; h.mp = h.maxmp; done(); ev.push({ t: 'fx', kind: 'heal', x: h.x, y: h.y }); ev.push({ t: 'msg', text: `${en(it.id)} を のんだ！ HPと MPが ぜんぶ かいふく！` }); return true; }
  if (w.use === 'book') {
    const left = SPELLS.filter(s => !run.spells.includes(s));
    if (!left.length) { h.mp = h.maxmp; done(); ev.push({ t: 'msg', text: `もう ぜんぶの まほうを しっている。MPが かいふく した！` }); return true; }
    const s = run.tut ? 'fire' : pick(left); run.spells.push(s); done();
    ev.push({ t: 'learn', id: s }); ev.push({ t: 'msg', text: `${en(it.id)} を よんだ！ まほう ${en(s)} を おぼえた！` }); return true;
  }
  if (w.use === 'key') {
    const h2 = run.hero, b = run.boxes.find(b => !b.open && Math.abs(b.x - h2.x) + Math.abs(b.y - h2.y) === 1);
    if (!b) { ev.push({ t: 'msg', text: `${en('treasurebox')} の となりで つかってね` }); return false; }
    openBox(run, b, ev); return true;
  }
  if (w.use === 'feather') { ev.push({ t: 'msg', text: `${en(it.id)} は もっているだけで いいよ（たおれたときに ふっかつ）` }); return false; }
  return false;
}
function equipItem(run, uid, ev) {
  const it = run.inv.find(i => i.uid === uid); if (!it) return false;
  const slot = WORD[it.id].slot; if (!slot) return false;
  if (run.equip[slot] === uid) { run.equip[slot] = null; ev.push({ t: 'msg', text: `${en(it.id)} を はずした` }); return true; }
  run.equip[slot] = uid; ev.push({ t: 'equip', id: it.id, read: !it.peek }); ev.push({ t: 'used', id: it.id, read: !it.peek });
  ev.push({ t: 'msg', text: `${en(it.id)} を そうびした！ ${slot === 'weapon' ? 'つよさ' : 'まもり'}が あがった！` }); return true;
}
function castSpell(run, id, ev) {
  const w = WORD[id], h = run.hero;
  if (!run.spells.includes(id)) return false;
  if (h.mp < w.mp) { ev.push({ t: 'msg', text: `MPが たりない（${en(id)} は MP ${w.mp}）` }); return false; }
  if (w.kind === 'self') { h.mp -= w.mp; const n = Math.min(w.val, h.maxhp - h.hp), hp0 = h.hp; h.hp += n; ev.push({ t: 'cast', id }); ev.push({ t: 'fx', kind: 'heal', x: h.x, y: h.y, n }); ev.push({ t: 'msg', text: `${en(id)}！ ${n ? `HPが ${n} かいふく` : 'HPは もう まんたん'}` }); if (n) ev.push({ t: 'msg', text: calc('モコ', hp0, '＋', n), calc: true, heroHp: h.hp }); return true; }
  if (w.kind === 'near') {
    const v = visible(run), ms = run.mons.filter(m => v.has(m.x + ',' + m.y)).sort((a, b) => (Math.abs(a.x - h.x) + Math.abs(a.y - h.y)) - (Math.abs(b.x - h.x) + Math.abs(b.y - h.y)));
    if (!ms.length) { ev.push({ t: 'msg', text: 'ちかくに てきが いないよ' }); return false; }
    h.mp -= w.mp; ev.push({ t: 'cast', id }); ev.push({ t: 'msg', text: `モコの まほう ${en(id)}！` }); hurtMon(run, ms[0], w.dmg + Math.floor(h.lv / 2), ev, 'fire'); return true;
  }
  if (w.kind === 'line') {
    const [dx, dy] = DIRS[h.dir]; h.mp -= w.mp; ev.push({ t: 'cast', id }); ev.push({ t: 'msg', text: `モコの まほう ${en(id)}！` });
    let x = h.x + dx, y = h.y + dy, hit = 0; const path = [];
    while (tileAt(run, x, y) !== '#' && path.length < 8) { path.push([x, y]); const m = monAt(run, x, y); if (m) { hurtMon(run, m, w.dmg + Math.floor(h.lv / 2), ev, 'water'); hit++; } x += dx; y += dy; }
    ev.push({ t: 'fx', kind: 'beam', path });
    if (!hit) ev.push({ t: 'msg', text: `${en(id)}！ …でも なにも いなかった` });
    return true;
  }
  return false;
}

/* ---------- てきの ばん ---------- */
function endTurn(run, ev) {
  const h = run.hero; run.turn++;
  for (const m of [...run.mons]) {
    if (!run.mons.includes(m) || m.tame) continue;
    const w = WORD[m.id];
    if (w.move === 'slow' && (m.tick = (m.tick + 1) % 2)) continue;
    const d = Math.abs(m.x - h.x) + Math.abs(m.y - h.y);
    if (d === 1) { // こうげき
      const dmg = Math.min(h.hp, Math.max(1, m.atk + ri(-1, 1) - heroDef(run))), hp0 = h.hp;
      h.hp -= dmg; ev.push({ t: 'fx', kind: 'hurt', x: h.x, y: h.y, n: dmg }); ev.push({ t: 'msg', text: `${en(m.id)} の こうげき！ ${dmg} ダメージ` }); ev.push({ t: 'msg', text: calc('モコ', hp0, '−', dmg), calc: true, heroHp: h.hp }); ev.push({ t: 'hurt' });
      if (h.hp <= 0) break;
      continue;
    }
    let dirs = Object.values(DIRS);
    if (w.move === 'erratic' && rand() < 0.5) dirs = [pick(dirs)];
    else if (d <= (w.sight || 7)) dirs = [...dirs].sort((a, b) => (Math.abs(m.x + a[0] - h.x) + Math.abs(m.y + a[1] - h.y)) - (Math.abs(m.x + b[0] - h.x) + Math.abs(m.y + b[1] - h.y)));
    else if (rand() < 0.6) continue; else dirs = [pick(dirs)];
    for (const [dx, dy] of dirs) {
      const nx = m.x + dx, ny = m.y + dy;
      if (walkable(run, nx, ny) && !monAt(run, nx, ny) && !(nx === h.x && ny === h.y) && Math.abs(nx - h.x) + Math.abs(ny - h.y) <= d + (w.move === 'erratic' ? 1 : 0)) { m.x = nx; m.y = ny; break; }
    }
  }
  if (run.tut && h.hp < 1) h.hp = 1; // チュートリアルでは たおれない
  if (h.hp <= 0) {
    const f = run.inv.find(i => i.id === 'angelfeather');
    if (f) { run.inv = run.inv.filter(i => i !== f); h.hp = Math.ceil(h.maxhp / 2); ev.push({ t: 'revive' }); ev.push({ t: 'used', id: 'angelfeather', read: true }); ev.push({ t: 'msg', text: `${en('angelfeather')} が ひかって ふっかつ した！` }); }
    else { ev.push({ t: 'dead' }); return; }
  }
  if (run.turn % 3 === 0 && h.hp < h.maxhp) h.hp++;
  if (run.turn % 6 === 0 && h.mp < h.maxmp) h.mp++;
  for (const id of updateSeen(run)) ev.push({ t: 'meet', id });
}

// かいだんで つぎの かいへ → { clear:さいごまで いった, floor }
export function descend(run) {
  if (!onStairs(run)) return null;
  if (run.tut) return { tutDone: true };
  if (run.floor >= MAX_FLOOR) return { clear: true, floor: run.floor };
  enterFloor(run, run.floor + 1);
  return { floor: run.floor, meet: updateSeen(run) };
}

// ゲームの きまり（ターン・こうげき・てきの うごき・アイテム・まほう）。ひょうじとは べつ
import { WORD, WORDS, SPELLS, HERO0, LV_EXP, MAX_FLOOR, BOSS_FLOORS, BOSS_OF, MINION_OF, BAGS, BAG_MAX, bagOf } from './data.js';
import { RARE_BY_DEPTH, CARDS } from './cards.js';
import { quizKind } from './quiz.js';
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
// mode：'english'（イングリッシュダンジョン）／'treasure'（たからさがし：てきが つよく、カードを あつめる）
export function newRun(tutorial = false, mode = 'english') {
  const run = { v: 1, tut: tutorial, mode, floor: 0, turn: 0, uid: 1, met: [], spells: [], inv: [], equip: { weapon: null, shield: null, armor: null }, power: 0, stuck: 0, cards: [],
    hero: { x: 0, y: 0, dir: 'down', hp: HERO0.hp, maxhp: HERO0.hp, mp: HERO0.mp, maxmp: HERO0.mp, lv: 1, exp: 0, atk: HERO0.atk, def: HERO0.def } };
  if (mode === 'treasure') { // スタートの もちもの：sword（そうび）・apple 2こ・magic book
    const sw = run.uid++; run.inv.push({ uid: sw, id: 'sword', peek: true }, { uid: run.uid++, id: 'apple', peek: true }, { uid: run.uid++, id: 'apple', peek: true }, { uid: run.uid++, id: 'magicbook', peek: true }); run.equip.weapon = sw;
  }
  enterFloor(run, tutorial ? 0 : 1);
  return run;
}
export const isTreasure = run => run && run.mode === 'treasure';
// てき・アイテムの つよさに つかう かい（たからさがしは 1かい ＋1 → 5かいから ＋5かいぶん つよい）
const ef = run => isTreasure(run) ? Math.min(MAX_FLOOR, run.floor + Math.min(5, run.floor)) : run.floor;
// カードの レア（ふかいほど たかい）。shift：かくし部屋などで 1だん ふかい わりあい
export function rollRare(run, shift = 0) {
  const f = Math.min(MAX_FLOOR, Math.max(1, run.floor + shift * 5)), p = (RARE_BY_DEPTH.find(b => f <= b.to) || RARE_BY_DEPTH[RARE_BY_DEPTH.length - 1]).p;
  let t = rand() * 100; for (let i = 0; i < 3; i++) { t -= p[i]; if (t < 0) return i + 1; } return 1;
}
const cellsOf = r => { const c = []; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) c.push([x, y]); return c; };
function freeCell(run, room, avoid = []) {
  const cs = cellsOf(room).filter(([x, y]) => !(x === run.hero.x && y === run.hero.y) && !run.mons.some(m => m.x === x && m.y === y) && !run.items.some(i => i.x === x && i.y === y)
    && !run.boxes.some(b => b.x === x && b.y === y) && !(run.stairs && run.stairs.x === x && run.stairs.y === y) && !avoid.some(([ax, ay]) => ax === x && ay === y));
  return cs.length ? pick(cs) : null;
}
function spawnMon(run, id, x, y, extra = {}) {
  // つよさは その てきが でて くる かい から すこしずつ あがる（ボスは きまった つよさ）
  const w = WORD[id], f = Math.max(1, ef(run)), up = (w.boss || w.hboss) ? 0 : Math.max(0, f - (w.minFloor || 1)), tb = w.boss && isTreasure(run); // たからさがしの ボスは つよめ
  const hp = Math.round(w.hp * (1 + 0.2 * up) * (tb ? 1.3 : 1));
  run.mons.push({ uid: run.uid++, id, x, y, hp, maxhp: hp, atk: w.atk + Math.floor(up / 2) + Math.floor(f / 4) + (tb ? 2 : 0), def: w.def || 0, exp: w.exp + Math.floor(f / 2), tick: 0, ...extra });
}
function rollItem(run) {
  const known = new Set(run.spells), f = ef(run);
  const owned = new Set(run.inv.map(i => i.id).concat(run.items.map(i => i.id))); // おなじ そうびは なんこも でない
  const list = WORDS.filter(w => (w.cat === 'item' || w.cat === 'equip') && w.w && (!w.minFloor || w.minFloor <= f) && (!w.maxFloor || w.maxFloor >= f || w.cat !== 'equip') && !(w.cat === 'equip' && owned.has(w.id)) && !(w.id === 'magicbook' && learnable(run).every(s => known.has(s))));
  let t = rand() * list.reduce((n, w) => n + w.w, 0);
  for (const w of list) { t -= w.w; if (t <= 0) return w.id; }
  return 'apple';
}
// その かいで おぼえられる まほう（つよい まほうは おなじ なかまの ひとつ したを しって いたら）
const learnable = run => SPELLS.filter(s => { const w = WORD[s]; return (!w.minFloor || w.minFloor <= Math.max(1, ef(run))) && (w.tier || 1) <= 1 + Math.max(0, ...run.spells.filter(k => WORD[k].fam === w.fam).map(k => WORD[k].tier || 1)); });
// ふくろ（そうび・たべもの・ほん/どうぐ）に まだ はいるか
export const bagCount = (run, bag) => run.inv.filter(i => bagOf(i.id) === bag).length;
export const bagRoom = (run, id) => id === 'key' || bagCount(run, bagOf(id)) < BAG_MAX[bagOf(id)]; // かぎは ふくろが いっぱいでも ひろえる
const bagName = id => BAGS.find(b => b.id === bagOf(id)).name;
export function enterFloor(run, floor) {
  if (run.equip && !('armor' in run.equip)) run.equip.armor = null; // ふるい ほぞんの ぼうけん
  run.stuck = 0;
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
      const R = rooms[1], bid = BOSS_OF[floor] || 'kingslime'; spawnMon(run, bid, R.x + (R.w >> 1), R.y + (R.h >> 1), { boss: true });
      for (let i = 0; i < 2; i++) { const c = freeCell(run, R); if (c) spawnMon(run, MINION_OF[bid] || 'slime', c[0], c[1]); }
      const food = floor >= 10 ? ['meat', 'bread', 'potion'] : ['apple', 'bread'];
      food.forEach(id => { const c = freeCell(run, start); if (c) run.items.push({ uid: run.uid++, id, x: c[0], y: c[1] }); });
    } else {
      const last = rooms[rooms.length - 1], sc = freeCell(run, last); run.stairs = { x: sc[0], y: sc[1] };
      const canMagic = run.spells.some(s => WORD[s].dmg); // まほうで しか たおせない てきは、こうげきの まほうを おぼえてから
      const fl = ef(run), mtypes = WORDS.filter(w => w.cat === 'monster' && !w.boss && !w.hboss && w.minFloor <= fl && (!w.maxFloor || w.maxFloor >= fl) && (!w.hard || canMagic)).map(w => w.id);
      for (let i = 0; i < Math.min(8, 3 + floor); i++) { const c = freeCell(run, pick(rooms.slice(1))); if (c) spawnMon(run, pick(mtypes), c[0], c[1]); }
      for (let i = 0; i < 4 + (floor > 2 ? 1 : 0) + (floor > 10 ? 1 : 0); i++) { const c = freeCell(run, pick(rooms)); if (c) run.items.push({ uid: run.uid++, id: rollItem(run), x: c[0], y: c[1] }); }
      // たからばこ と かぎ（たからさがしは 1かいに 0〜2こ）
      const nBox = isTreasure(run) ? (rand() < 0.6 ? 1 : 0) + (rand() < 0.2 ? 1 : 0) : (rand() < 0.45 ? 1 : 0);
      for (let i = 0; i < nBox; i++) {
        // たからばこは みちの でいりぐちを ふさがない ところ（となりに つうろが ない マス）
        const nearDoor = ([x, y]) => Object.values(DIRS).some(([dx, dy]) => tileAt(run, x + dx, y + dy) === ',');
        const R = pick(rooms.slice(1)), c = freeCell(run, R, cellsOf(R).filter(nearDoor)), k = c && freeCell(run, pick(rooms), [c]); // かぎは たからばこと おなじ マスに おかない
        if (c && k) { run.boxes.push({ x: c[0], y: c[1], open: false }); run.items.push({ uid: run.uid++, id: 'key', x: k[0], y: k[1] }); }
      }
      // たからさがし：ゆかに カードが おちている ことも ある（★ が おおい）
      if (isTreasure(run) && rand() < 0.2) { const c = freeCell(run, pick(rooms.slice(1))); if (c) run.items.push({ uid: run.uid++, id: 'tcard', x: c[0], y: c[1], rare: rollRare(run, -1) }); }
    }
  }
  unstackBoxes(run);
  run.secrets = []; run.traps = []; run.letters = [];
  if (isTreasure(run) && floor > 0 && !BOSS_FLOORS.includes(floor)) { placeSecrets(run); placeTraps(run); }
  run.seen = '0'.repeat(run.map.w * run.map.h); // みえる ところは よびだしがわで updateSeen()
}

/* ---------- かくし部屋（たからさがし）---------- */
// かべの なかに ちいさな へやを よやく（まだ かべの まま）。いりぐちは つうろ・へやの となりの「あやしい かべ」1マス
//   ひらくまで タイルは '#' の まま。とびらの クイズに せいかい すると openSecret() で ほる
function placeSecrets(run) {
  const f = run.floor, W = run.map.w, H = run.map.h, tl = run.map.tiles;
  const wantGold = f >= 11 && !run.hbossDone && rand() < 0.4; // かくしボスの なぞの とびら
  const n = (rand() < (f <= 5 ? 0.6 : f <= 10 ? 0.8 : 1) ? 1 : 0) + (rand() < (f <= 5 ? 0.1 : f <= 10 ? 0.25 : 0.45) ? 1 : 0) + (wantGold ? 1 : 0);
  const isOpen = (x, y) => x >= 0 && y >= 0 && x < W && y < H && tl[y][x] !== '#';
  for (let tries = 0; run.secrets.length < n && tries < 400; tries++) {
    const w = ri(3, 4), h = 3, x = ri(2, W - w - 3), y = ri(2, H - h - 3);
    let ok = true;
    for (let yy = y - 1; yy <= y + h && ok; yy++) for (let xx = x - 1; xx <= x + w; xx++) if (isOpen(xx, yy)) { ok = false; break; }
    if (!ok || run.secrets.some(o => x - 2 < o.x + o.w && o.x - 2 < x + w && y - 2 < o.y + o.h && o.y - 2 < y + h)) continue;
    const cands = [];
    for (let xx = x; xx < x + w; xx++) { cands.push([xx, y - 1, xx, y - 2], [xx, y + h, xx, y + h + 1]); }
    for (let yy = y; yy < y + h; yy++) { cands.push([x - 1, yy, x - 2, yy], [x + w, yy, x + w + 1, yy]); }
    const ds = cands.filter(([, , ox, oy]) => isOpen(ox, oy) && !(run.stairs && run.stairs.x === ox && run.stairs.y === oy) && !run.boxes.some(b => b.x === ox && b.y === oy));
    if (!ds.length) continue;
    const [dx, dy] = pick(ds);
    run.secrets.push({ x, y, w, h, door: { x: dx, y: dy }, open: false, lock: 0, kind: run.secrets.length === n - 1 && wantGold ? 'gold' : secretKind(f) });
  }
  for (const s of run.secrets) { if (s.kind === 'hint') setupHint(run, s); if (s.kind === 'collect') setupCollect(run, s); }
}
// とびらの しゅるい：クイズ（quiz.js）＋ 11かいから えいごだけの ヒント（いろの たいまつ）・16かいから もじあつめ
function secretKind(f) {
  const r = rand();
  if (f >= 16 && r < 0.25) return 'collect';
  if (f >= 11 && r < 0.55) return 'hint';
  return quizKind(f, rand);
}
const COLORS = ['red', 'blue', 'yellow'];
// えいごだけの ヒント：かんばん「Look at the BLUE torch.」と、いろの ちがう たいまつ 3つ（ほんものは とびらの かべ）
function setupHint(run, s) {
  const tl = run.map.tiles, W = run.map.w, H = run.map.h, used = new Set([s.door.x + ',' + s.door.y]);
  const doors = new Set(run.secrets.map(o => o.door.x + ',' + o.door.y));
  const walls = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (tl[y][x] !== '#' || doors.has(x + ',' + y)) continue;
    if (Object.values(DIRS).some(([dx, dy]) => tl[y + dy] && tl[y + dy][x + dx] === '.')) walls.push([x, y]);
  }
  const color = pick(COLORS), others = COLORS.filter(c => c !== color);
  s.color = color; s.torches = [{ x: s.door.x, y: s.door.y, color }];
  for (const c of others) {
    const cand = walls.filter(([x, y]) => !used.has(x + ',' + y) && s.torches.every(t => Math.abs(t.x - x) + Math.abs(t.y - y) >= 4) && !run.secrets.some(o => x >= o.x - 1 && x <= o.x + o.w && y >= o.y - 1 && y <= o.y + o.h));
    if (!cand.length) continue; const [x, y] = pick(cand); used.add(x + ',' + y); s.torches.push({ x, y, color: c });
  }
  const c = freeCell(run, pick(run.map.rooms)); if (c) run.items.push({ uid: run.uid++, id: 'sign', x: c[0], y: c[1], text: `Look at the ${color.toUpperCase()} torch.`, sid: run.secrets.indexOf(s) });
}
// もじあつめ：ことばの もじを ゆかに ばらまく。ぜんぶ ひろって とびらで ならべる
function setupCollect(run, s) {
  const card = pick(CARDS.filter(c => /^[a-z]{3,4}$/.test(c.en) && c.rare <= 2));
  s.card = card.id; s.word = card.en; const sid = run.secrets.indexOf(s);
  for (const L of card.en) { const c = freeCell(run, pick(run.map.rooms)); if (c) run.items.push({ uid: run.uid++, id: 'ltile', x: c[0], y: c[1], letter: L, sid }); else run.letters = [...(run.letters || []), { sid, letter: L }]; }
}
// わな（たからさがし 11かいから）：おとしあな（したの かいへ）・ねむりの ゆか（2ターン うごけない）。「しらべる」で みつけると もう ひっかからない
function placeTraps(run) {
  run.traps = [];
  if (run.floor < 11) return;
  const n = 1 + (rand() < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) { const c = freeCell(run, pick(run.map.rooms.slice(1))); if (c && !run.traps.some(t => t.x === c[0] && t.y === c[1])) run.traps.push({ x: c[0], y: c[1], kind: rand() < 0.5 ? 'pit' : 'sleep', found: false }); }
}
// せいかい → かくし部屋を ほって なかに たからもの（カードは 1だん ふかい わりあい）
export function openSecret(run, i) {
  const s = run.secrets && run.secrets[i], ev = []; if (!s || s.open) return ev;
  s.open = true;
  const rows = run.map.tiles.map(r => r.split(''));
  for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) rows[y][x] = '.';
  rows[s.door.y][s.door.x] = ',';
  run.map.tiles = rows.map(r => r.join(''));
  run.map.rooms.push({ x: s.x, y: s.y, w: s.w, h: s.h, secret: true });
  const cells = []; for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) cells.push([x, y]);
  const free = () => { const c = cells.filter(([x, y]) => !run.items.some(it => it.x === x && it.y === y)); return c.length ? pick(c) : null; };
  if (s.kind === 'gold') { // なぞの とびら → かくしボス
    const bid = pick(['treasuredragon', 'crystalgolem', 'shadowking']); spawnMon(run, bid, s.x + (s.w >> 1), s.y + 1, { hboss: true });
    ev.push({ t: 'secret', i }); ev.push({ t: 'hboss', id: bid }); ev.push({ t: 'msg', text: `${en('goldkey')} で なぞの とびらが ひらいた！ かくしボス ${en(bid)} が あらわれた！` });
    for (const id of updateSeen(run)) ev.push({ t: 'meet', id });
    return ev;
  }
  const nCard = rand() < 0.3 ? 2 : 1;
  for (let k = 0; k < nCard; k++) { const c = free(); if (c) run.items.push({ uid: run.uid++, id: 'tcard', x: c[0], y: c[1], rare: rollRare(run, 1) }); }
  if (rand() < 0.6) { const c = free(); if (c) run.items.push({ uid: run.uid++, id: rollItem(run), x: c[0], y: c[1] }); }
  // きんの かぎ（11かいから。かくしボスに あう まで）
  if (run.floor >= 11 && !run.hbossDone && !run.inv.some(it => it.id === 'goldkey') && !run.items.some(it => it.id === 'goldkey') && rand() < 0.35) { const c = free(); if (c) run.items.push({ uid: run.uid++, id: 'goldkey', x: c[0], y: c[1] }); }
  ev.push({ t: 'secret', i }); ev.push({ t: 'msg', text: 'かくし部屋の とびらが ひらいた！ なかに たからが ある！' });
  for (const id of updateSeen(run)) ev.push({ t: 'meet', id });
  return ev;
}
// まちがい → その とびらは 5ターン しまる
export function failSecret(run, i) { const s = run.secrets && run.secrets[i]; if (s) s.lock = run.turn + 5; }
export const secretAt = (run, x, y) => (run.secrets || []).find(s => !s.open && s.door.x === x && s.door.y === y) || null;
// にせものの たいまつ（えいごだけの ヒント）
export const decoyAt = (run, x, y) => { for (const s of run.secrets || []) if (!s.open && s.kind === 'hint') { const t = (s.torches || []).find(t => t.x === x && t.y === y && !(t.x === s.door.x && t.y === s.door.y)); if (t) return { s, t }; } return null; };
export const lettersOf = (run, s) => (run.letters || []).filter(l => l.sid === run.secrets.indexOf(s)).map(l => l.letter);

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
export const heroDef = run => run.hero.def + ['shield', 'armor'].reduce((n, s) => n + (eqItem(run, s) ? WORD[eqItem(run, s).id].def : 0), 0);
export const monAt = (run, x, y) => run.mons.find(m => m.x === x && m.y === y);
const boxAt = (run, x, y) => run.boxes.find(b => b.x === x && b.y === y);
const walkable = (run, x, y) => tileAt(run, x, y) !== '#' && !boxAt(run, x, y);
// ghost は かべも とおれる（いちばん そとがわ だけ だめ）
const monCan = (run, m, x, y) => WORD[m.id].wall ? (x > 0 && y > 0 && x < run.map.w - 1 && y < run.map.h - 1 && !boxAt(run, x, y)) : walkable(run, x, y);
export const onStairs = run => !!run.stairs && run.hero.x === run.stairs.x && run.hero.y === run.stairs.y;

/* ---------- こうどう ---------- */
// action：{t:'move',dir} {t:'attack'} {t:'wait'} {t:'use',uid} {t:'equip',uid} {t:'drop',uid} {t:'cast',id}
// → { ev:[イベント], turn:ターンが すすんだか }
export function act(run, a) {
  const ev = [], h = run.hero;
  let turn = false;
  const say = text => ev.push({ t: 'msg', text });
  if (a.t === 'move' && run.stuck > 0 && !monAt(run, h.x + DIRS[a.dir][0], h.y + DIRS[a.dir][1])) {
    run.stuck--; h.dir = a.dir; turn = true; say(run.stuckWhy === 'sleep' ? 'ぐうぐう…ねむって いて うごけない！' : `${en('spider')} の いとで うごけない！`); if (!run.stuck) run.stuckWhy = null; ev.push({ t: 'bump' });
  } else if (a.t === 'move') {
    h.dir = a.dir; const [dx, dy] = DIRS[a.dir], nx = h.x + dx, ny = h.y + dy, m = monAt(run, nx, ny), b = boxAt(run, nx, ny);
    if (m) { attackMon(run, m, ev); turn = true; }
    else if (b) { openBox(run, b, ev); turn = !!ev.find(e => e.t === 'open'); }
    else if (walkable(run, nx, ny)) {
      h.x = nx; h.y = ny; turn = true; ev.push({ t: 'step' });
      const it = run.items.find(i => i.x === nx && i.y === ny);
      if (it && it.id === 'ltile') { run.items = run.items.filter(i => i !== it); (run.letters = run.letters || []).push({ sid: it.sid, letter: it.letter }); say(`もじ <b class="en">${it.letter}</b> を ひろった！`); ev.push({ t: 'letter', letter: it.letter }); }
      else if (it && it.id === 'sign') { say(`かんばんに なにか かいてある… <b class="en">${it.text}</b>`); ev.push({ t: 'sign', text: it.text }); }
      else if (it && it.id === 'tcard') { run.items = run.items.filter(i => i !== it); ev.push({ t: 'msg', text: 'たからの カードを みつけた！' }); ev.push({ t: 'treasure', rare: it.rare || 1, src: 'floor' }); }
      else if (it && WORD[it.id].cat === 'equip' && run.inv.some(i => i.id === it.id)) say(`${en(it.id)} は もう もっているよ`);
      else if (it) { if (bagRoom(run, it.id)) { run.items = run.items.filter(i => i !== it); run.inv.push({ uid: it.uid, id: it.id, peek: false }); say(`${en(it.id)} を ひろった！`); ev.push({ t: 'pickup', id: it.id }); }
        else say(`「${bagName(it.id)}」が いっぱい（${BAG_MAX[bagOf(it.id)]}こ）。${en(it.id)} は ひろえない`); }
      const trap = (run.traps || []).find(t => t.x === nx && t.y === ny && !t.found);
      if (trap) { trap.found = true;
        if (trap.kind === 'pit') { const d = Math.min(3, h.hp - 1); h.hp -= d; say(`わなだ！ おとしあなに おちた！（HP −${d}）`); ev.push({ t: 'hurt' }); ev.push({ t: 'rope', pit: true }); }
        else { run.stuck = 2; run.stuckWhy = 'sleep'; say('わなだ！ ねむりの ゆか…ねむって しまった（2ターン うごけない）'); ev.push({ t: 'bump' }); } }
      if (onStairs(run)) ev.push({ t: 'stairs' });
    } else ev.push({ t: 'bump' });
  } else if (a.t === 'attack') {
    // まえに てきが いなくても、となりに いれば そちらを むいて こうげき
    const [dx, dy] = DIRS[h.dir], m = monAt(run, h.x + dx, h.y + dy) || Object.values(DIRS).map(([ax, ay]) => monAt(run, h.x + ax, h.y + ay)).find(Boolean);
    if (m) { attackMon(run, m, ev); turn = true; } else { say('まえに てきが いないよ'); ev.push({ t: 'swing' }); turn = true; }
  } else if (a.t === 'wait') { turn = true; say('ひとやすみ'); }
  else if (a.t === 'search') { // しらべる：むいている ほう（または となり）の あやしい かべ・たいまつ → とびら。わなも みつける。なにも なければ ひとやすみ
    turn = true;
    // ちかくの わなを みつける
    const tr = (run.traps || []).filter(t => !t.found && Math.abs(t.x - h.x) + Math.abs(t.y - h.y) <= 2);
    tr.forEach(t => { t.found = true; }); if (tr.length) { say(`わなを みつけた！（${tr.map(t => t.kind === 'pit' ? 'おとしあな' : 'ねむりの ゆか').join('・')}）もう ひっかからないよ`); ev.push({ t: 'trapfound' }); }
    const look = (fn) => { const [dx, dy] = DIRS[h.dir]; let r = fn(h.x + dx, h.y + dy); if (r) return r; for (const [d, [ax, ay]] of Object.entries(DIRS)) { r = fn(h.x + ax, h.y + ay); if (r) { h.dir = d; return r; } } return null; };
    const s = look((x, y) => secretAt(run, x, y)), dc = !s && look((x, y) => decoyAt(run, x, y));
    ev.push({ t: 'search', x: h.x + DIRS[h.dir][0], y: h.y + DIRS[h.dir][1] });
    const idx = o => run.secrets.indexOf(o);
    if (dc) { // ちがう いろの たいまつ
      if (dc.s.lock > run.turn) say(`たいまつは しずかに もえている…（あと ${dc.s.lock - run.turn}ターン）`);
      else { dc.s.lock = run.turn + 5; say(`${dc.t.color.toUpperCase()} の たいまつ…ちがう みたい。5ターン まとう`); ev.push({ t: 'hintAns', i: idx(dc.s), ok: false, user: dc.t.color }); }
    } else if (s && s.lock > run.turn) say(`あやしい かべ。…いまは しまっている（あと ${s.lock - run.turn}ターン）`);
    else if (s && s.kind === 'gold') {
      const gk = run.inv.find(it => it.id === 'goldkey');
      if (gk) { run.inv = run.inv.filter(it => it !== gk); ev.push({ t: 'used', id: 'goldkey', read: !gk.peek }); for (const e of openSecret(run, idx(s))) ev.push(e); turn = false; }
      else say(`きんいろの なぞの とびら。${en('goldkey')} が あれば あけられる`);
    } else if (s && s.kind === 'hint') { turn = false; ev.push({ t: 'hintAns', i: idx(s), ok: true, user: s.color }); } // かんばんの いろの たいまつ＝せいかい
    else if (s && s.kind === 'collect') {
      const have = lettersOf(run, s), need = s.word.split('');
      const left = [...have]; const ok = need.every(L => { const k = left.indexOf(L); if (k < 0) return false; left.splice(k, 1); return true; });
      if (ok) { say('もじが ぜんぶ そろった！ とびらに ならべよう'); ev.push({ t: 'quiz', i: idx(s), kind: 'collect' }); turn = false; }
      else say(`もじあつめの とびら。もじが たりない（もっている もじ：${have.length ? have.join(' ') : 'なし'}・ぜんぶで ${need.length}こ）`);
    }
    else if (s) { say('あやしい かべを しらべた！ もじが うかんで きた…'); ev.push({ t: 'quiz', i: idx(s), kind: s.kind }); turn = false; }
    else if (!tr.length) {
      const near = (run.secrets || []).some(o => !o.open && Math.abs(o.door.x - h.x) + Math.abs(o.door.y - h.y) <= 4);
      say(near ? 'この ちかくの かべが あやしい…（ひびや たいまつの ある かべを しらべよう）' : 'しらべた けど なにも ない（ひとやすみ）');
    }
  }
  else if (a.t === 'use') turn = useItem(run, a.uid, ev);
  else if (a.t === 'equip') turn = equipItem(run, a.uid, ev);
  else if (a.t === 'drop') {
    const it = run.inv.find(i => i.uid === a.uid); if (!it) return { ev, turn: false };
    for (const s of Object.keys(run.equip)) if (run.equip[s] === it.uid) run.equip[s] = null;
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
function hurtMon(run, m, dmg, ev, how = 'hit', note = '', tier = 1) {
  if (WORD[m.id].weak && WORD[m.id].weak === how) { dmg *= 2; note = '（weak！ よく きいた！）' + note; } // かくしボスの よわい まほうは 2ばい
  dmg = Math.min(dmg, m.hp); const hp0 = m.hp;
  m.hp -= dmg; ev.push({ t: 'fx', kind: how, x: m.x, y: m.y, n: dmg, tier });
  ev.push({ t: 'msg', text: `${en(m.id)} に ${dmg} ダメージ！${note}` });
  ev.push({ t: 'msg', text: calc(WORD[m.id].en, hp0, '−', dmg), calc: true, monUid: m.uid, monHp: m.hp });
  if (m.hp <= 0) {
    run.mons = run.mons.filter(x => x !== m);
    ev.push({ t: 'kill', id: m.id, x: m.x, y: m.y, uid: m.uid }); ev.push({ t: 'msg', text: `${en(m.id)} を たおした！` });
    gainExp(run, m.exp, ev);
    if (WORD[m.id].hboss) { run.hbossDone = true; ev.push({ t: 'msg', text: `かくしボスを たおした！ すごい たからが ある！` }); ev.push({ t: 'treasure', rare: 3, src: 'hboss' }); }
    if (m.boss && isTreasure(run)) { const r3 = run.floor >= MAX_FLOOR ? 0.5 : run.floor >= 10 ? 0.25 : 0.1; ev.push({ t: 'treasure', rare: rand() < r3 ? 3 : 2, src: 'boss' }); } // ボスは ★★いじょう
    if (m.boss) { run.bossDead = true; run.stairs = { x: m.x, y: m.y }; ev.push({ t: 'boss', id: m.id }); ev.push({ t: 'msg', text: `${en('stairs')} が あらわれた！ のると ${run.floor >= MAX_FLOOR ? 'ゴール！' : 'つぎへ すすめるよ'}` }); }
  }
}
function attackMon(run, m, ev) {
  run.hero.dir = m.x > run.hero.x ? 'right' : m.x < run.hero.x ? 'left' : m.y > run.hero.y ? 'down' : 'up';
  ev.push({ t: 'bubble', x: run.hero.x, y: run.hero.y, text: 'こうげき！' }); ev.push({ t: 'msg', text: 'モコの こうげき！' });
  const raw = heroAtk(run) + ri(0, 2), def = m.def || 0, hard = WORD[m.id].hard;
  if (hard) { hurtMon(run, m, 1, ev, 'hit', `（${hard}）`); return; } // ふつうの こうげきは 1 だけ
  hurtMon(run, m, Math.max(1, raw - def), ev, 'hit', def ? '（かたい！）' : '');
}
// x,y の ちかくで アイテムを おける ゆか（かべ・はこ・てき・かいだん・ほかの アイテムが ない）。なければ その ばしょ
function freeNear(run, x, y) {
  for (let r = 1; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.abs(dx) + Math.abs(dy) !== r) continue;
    const nx = x + dx, ny = y + dy;
    if (tileAt(run, nx, ny) === '#' || boxAt(run, nx, ny) || monAt(run, nx, ny) || run.items.some(i => i.x === nx && i.y === ny) || (run.stairs && run.stairs.x === nx && run.stairs.y === ny)) continue;
    return [nx, ny];
  }
  return [x, y];
}
// たからばこの したに アイテムが あったら となりへ うつす（ひろえなく ならない ように。ふるい ほぞんの ぼうけんにも つかう）
export function unstackBoxes(run) {
  for (const it of run.items || []) if (run.boxes.some(b => b.x === it.x && b.y === it.y)) { const c = freeNear(run, it.x, it.y); it.x = c[0]; it.y = c[1]; }
}
function openBox(run, b, ev) {
  if (b.open) { ev.push({ t: 'msg', text: `${en('treasurebox')} は からっぽ` }); return; }
  const k = run.inv.find(i => i.id === 'key');
  if (!k) { const left = run.items.filter(i => i.id === 'key').length; ev.push({ t: 'msg', text: `${en('treasurebox')} だ。${en('key')} が あれば あけられる${left ? `（この かいに ${en('key')} が あと ${left}こ あるよ）` : ''}` }); ev.push({ t: 'bump' }); return; }
  run.inv = run.inv.filter(i => i !== k); b.open = true;
  const got = run.tut ? ['bread', 'shield'] : []; // れんしゅうは きまった もの
  const cr = rand(), cardN = isTreasure(run) ? (cr < 0.1 ? 2 : cr < 0.55 ? 1 : 0) : 0; // たからさがし：はんぶんくらいは カード（ときどき 2まい）＋ アイテム
  while (!run.tut && got.length < (cardN ? 1 : 2)) { let id = rollItem(run); for (let k = 0; k < 6 && WORD[id].cat === 'equip' && got.includes(id); k++) id = rollItem(run); got.push(id); }
  const floor = [];
  for (const id of got) {
    if (WORD[id].cat === 'equip' && run.inv.some(i => i.id === id)) continue; // もう もっている そうびは ふえない
    if (bagRoom(run, id)) { run.inv.push({ uid: run.uid++, id, peek: false }); continue; }
    // もちものが いっぱい → モコの まわりの あいている ゆかに おく（ふんだら ひろえる）
    const c = freeNear(run, run.hero.x, run.hero.y);
    run.items.push({ uid: run.uid++, id, x: c[0], y: c[1] }); floor.push(id);
  }
  ev.push({ t: 'bubble', x: run.hero.x, y: run.hero.y, text: 'Open, treasure box!' }); ev.push({ t: 'open', got }); ev.push({ t: 'used', id: 'key' });
  ev.push({ t: 'msg', text: `${en('key')} で ${en('treasurebox')} を あけた！ ${got.map(en).join(' と ')} が はいっていた！` });
  if (cardN) ev.push({ t: 'msg', text: `たからの カードも ${cardN}まい はいっていた！` });
  for (let i = 0; i < cardN; i++) ev.push({ t: 'treasure', rare: rollRare(run), src: 'box' });
  if (floor.length) ev.push({ t: 'msg', text: `もちものが いっぱい！ ${floor.map(en).join(' と ')} は ゆかに おいたよ（「${bagName(floor[0])}」）` });
}
function useItem(run, uid, ev) {
  const it = run.inv.find(i => i.uid === uid); if (!it) return false;
  const w = WORD[it.id], h = run.hero;
  const done = () => { run.inv = run.inv.filter(i => i !== it); ev.push({ t: 'used', id: it.id, read: !it.peek }); };
  if (w.use === 'heal') { const n = Math.min(w.val, h.maxhp - h.hp), hp0 = h.hp; h.hp += n; done(); ev.push({ t: 'fx', kind: 'heal', x: h.x, y: h.y, n }); ev.push({ t: 'msg', text: `${en(it.id)} を ${w.verb === 'のむ' ? 'のんだ' : 'たべた'}！ ${n ? `HPが ${n} かいふく` : 'HPは もう まんたん'}` }); if (n) ev.push({ t: 'msg', text: calc('モコ', hp0, '＋', n), calc: true, heroHp: h.hp }); return true; }
  if (w.use === 'mp') { const n = Math.min(w.val, h.maxmp - h.mp), mp0 = h.mp; h.mp += n; done(); ev.push({ t: 'fx', kind: 'mp', x: h.x, y: h.y, n }); ev.push({ t: 'msg', text: `${en(it.id)} を ${w.verb === 'のむ' ? 'のんだ' : 'たべた'}！ ${n ? `MPが ${n} かいふく` : 'MPは もう まんたん'}` }); if (n) ev.push({ t: 'msg', text: `<span class="calc mp">モコの MP　${mp0} ＋ ${n} ＝ ${h.mp}</span>` }); return true; }
  if (w.use === 'potion') { h.hp = h.maxhp; h.mp = h.maxmp; done(); ev.push({ t: 'fx', kind: 'heal', x: h.x, y: h.y }); ev.push({ t: 'msg', text: `${en(it.id)} を のんだ！ HPと MPが ぜんぶ かいふく！` }); return true; }
  if (w.use === 'book') {
    const left = learnable(run).filter(s => !run.spells.includes(s));
    if (!left.length) { h.mp = h.maxmp; done(); ev.push({ t: 'msg', text: `もう ぜんぶの まほうを しっている。MPが かいふく した！` }); return true; }
    const s = run.tut ? 'fire' : pick(left); run.spells.push(s); done();
    ev.push({ t: 'learn', id: s }); ev.push({ t: 'msg', text: `${en(it.id)} を よんだ！ まほう ${en(s)} を おぼえた！` }); return true;
  }
  if (w.use === 'key') {
    const h2 = run.hero, b = run.boxes.find(b => !b.open && Math.abs(b.x - h2.x) + Math.abs(b.y - h2.y) === 1);
    if (!b) { ev.push({ t: 'msg', text: `${en('treasurebox')} の となりで つかってね` }); return false; }
    openBox(run, b, ev); return true;
  }
  if (w.use === 'torch') { done(); revealAll(run); ev.push({ t: 'reveal' }); ev.push({ t: 'msg', text: `${en(it.id)} で あかるく なった！ この かいの ちずが ぜんぶ みえる！` }); return true; }
  if (w.use === 'rope') {
    if (run.tut || BOSS_FLOORS.includes(run.floor)) { ev.push({ t: 'msg', text: `ボスの かいでは ${en(it.id)} は つかえないよ` }); return false; }
    done(); ev.push({ t: 'msg', text: `${en(it.id)} を つかって うえへ のぼる！` }); ev.push({ t: 'rope' }); return true;
  }
  if (w.use === 'feather') { ev.push({ t: 'msg', text: `${en(it.id)} は もっているだけで いいよ（たおれたときに ふっかつ）` }); return false; }
  return false;
}
function equipItem(run, uid, ev) {
  const it = run.inv.find(i => i.uid === uid); if (!it) return false;
  const slot = WORD[it.id].slot; if (!slot) return false;
  if (run.equip[slot] === uid) { run.equip[slot] = null; ev.push({ t: 'msg', text: `${en(it.id)} を はずした` }); return true; }
  run.equip[slot] = uid; ev.push({ t: 'equip', id: it.id, read: !it.peek }); ev.push({ t: 'used', id: it.id, read: !it.peek });
  const w = WORD[it.id];
  ev.push({ t: 'msg', text: `${en(it.id)} を そうびした！ ${slot === 'weapon' ? `つよさ ＋${w.atk}` : `まもり ＋${w.def}`}` }); return true;
}
function revealAll(run) { run.seen = '1'.repeat(run.map.w * run.map.h); }
// まほうの あたる ところ（えらんだ ときに みせる・つかう ときも おなじ けいさん）
//   → { cells:[[x,y]], mons:[てき], text:せつめい, none:あたる てきが いない ときの ことば }
export function spellTargets(run, id) {
  const w = WORD[id], h = run.hero, v = visible(run);
  const seen = run.mons.filter(m => v.has(m.x + ',' + m.y));
  const dist = m => Math.abs(m.x - h.x) + Math.abs(m.y - h.y);
  const floorCells = () => [...v].map(k => k.split(',').map(Number)).filter(([x, y]) => tileAt(run, x, y) !== '#');
  if (w.kind === 'self') return { cells: [[h.x, h.y]], mons: [], text: `じぶんの HPを ${w.val} かいふく` };
  if (w.kind === 'map') return { cells: [[h.x, h.y]], mons: [], text: 'この かいの ちずと かいだんが みえる' };
  if (w.kind === 'all') return { cells: floorCells(), mons: seen, text: 'みえる てき ぜんぶ に あたる', none: 'ちかくに てきが いないよ' };
  if (w.kind === 'near') { const m = [...seen].sort((a, b) => dist(a) - dist(b))[0]; return { cells: m ? [[m.x, m.y]] : [], mons: m ? [m] : [], text: 'いちばん ちかい てき に あたる', none: 'ちかくに てきが いないよ' }; }
  if (w.kind === 'line') {
    const [dx, dy] = DIRS[h.dir], cells = [], mons = []; let x = h.x + dx, y = h.y + dy;
    while (tileAt(run, x, y) !== '#' && cells.length < 8) { cells.push([x, y]); const m = monAt(run, x, y); if (m) mons.push(m); x += dx; y += dy; }
    return { cells, mons, text: 'むいている ほうへ まっすぐ（やじるしで むきを かえられる）', line: true };
  }
  if (w.kind === 'push') {
    const pool = w.wide ? seen : Object.values(DIRS).map(([dx, dy]) => monAt(run, h.x + dx, h.y + dy)).filter(Boolean);
    const cells = w.wide ? floorCells() : Object.values(DIRS).map(([dx, dy]) => [h.x + dx, h.y + dy]).filter(([x, y]) => tileAt(run, x, y) !== '#');
    const mons = pool.filter(m => !m.boss && !WORD[m.id].hboss);
    return { cells, mons, text: w.wide ? 'みえる てき ぜんぶを ふきとばす' : 'となりの てきを ふきとばす', none: pool.length ? 'ボスは おもくて ふきとばせない！' : w.wide ? 'ちかくに てきが いないよ' : 'となりに てきが いないよ' };
  }
  return { cells: [], mons: [], text: '' };
}
function castSpell(run, id, ev) {
  const w = WORD[id], h = run.hero, tier = w.tier || 1, fam = w.fam || id, pow = Math.floor(h.lv / 2);
  if (!run.spells.includes(id)) return false;
  if (h.mp < w.mp) { ev.push({ t: 'msg', text: `MPが たりない（${en(id)} は MP ${w.mp}）` }); return false; }
  const tg = spellTargets(run, id);
  if (tg.none && !tg.mons.length && w.kind !== 'line') { ev.push({ t: 'msg', text: tg.none }); return false; }
  // まず まほうの えんしゅつ（spell）→ そのあと ダメージ
  h.mp -= w.mp; ev.push({ t: 'cast', id });
  ev.push({ t: 'bubble', x: h.x, y: h.y, text: `${w.en}！`, tier });
  if (tier >= 2) ev.push({ t: 'fx', kind: 'aura', fam, tier, x: h.x, y: h.y });
  ev.push({ t: 'msg', text: `モコの まほう ${en(id)}！` });
  ev.push({ t: 'spell', id, fam, tier, kind: w.kind, from: [h.x, h.y], cells: tg.cells, to: tg.mons.map(m => [m.x, m.y]) });
  if (tier >= 2 && (w.kind === 'all' || w.wide)) ev.push({ t: 'fx', kind: 'flash', fam, tier });
  const freeze = m => { if (!w.freeze || !run.mons.includes(m)) return; if (m.boss || WORD[m.id].hboss) { m.frozen = 1; return; } m.frozen = w.freeze; ev.push({ t: 'msg', text: `${en(m.id)} は こおって うごけない！` }); };
  if (w.kind === 'self') { const n = Math.min(w.val, h.maxhp - h.hp), hp0 = h.hp; h.hp += n; ev.push({ t: 'fx', kind: 'heal', x: h.x, y: h.y, n }); ev.push({ t: 'msg', text: `${n ? `HPが ${n} かいふく` : 'HPは もう まんたん'}` }); if (n) ev.push({ t: 'msg', text: calc('モコ', hp0, '＋', n), calc: true, heroHp: h.hp }); return true; }
  if (w.kind === 'map') { revealAll(run); ev.push({ t: 'reveal' }); ev.push({ t: 'msg', text: `ちずと ${en('stairs')} が みえた！` }); return true; }
  if (w.kind === 'push') {
    for (const m of tg.mons) {
      const sx = Math.abs(m.x - h.x) >= Math.abs(m.y - h.y) ? Math.sign(m.x - h.x) : 0, sy = sx ? 0 : Math.sign(m.y - h.y);
      let n = 0; while (n < 4 && monCan(run, m, m.x + sx, m.y + sy) && !monAt(run, m.x + sx, m.y + sy) && tileAt(run, m.x + sx, m.y + sy) !== '#' && !(m.x + sx === h.x && m.y + sy === h.y)) { m.x += sx; m.y += sy; n++; }
      m.frozen = Math.max(m.frozen || 0, 1); ev.push({ t: 'fx', kind: 'wind', x: m.x, y: m.y, tier, uid: m.uid });
      ev.push({ t: 'msg', text: `${en(m.id)} を ふきとばした！` });
      if (w.dmg) hurtMon(run, m, w.dmg + pow, ev, 'wind', '', tier);
    }
    return true;
  }
  if (!tg.mons.length) { ev.push({ t: 'msg', text: '…でも なにも いなかった' }); return true; }
  for (const m of tg.mons) { if (!run.mons.includes(m)) continue; hurtMon(run, m, w.dmg + pow, ev, fam, '', tier); freeze(m); }
  return true;
}

/* ---------- てきの ばん ---------- */
function linePath(a, b) { const p = [], dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y); let x = a.x + dx, y = a.y + dy; while (!(x === b.x && y === b.y)) { p.push([x, y]); x += dx; y += dy; } p.push([b.x, b.y]); return p; }
function lineClear(run, a, b) { return linePath(a, b).slice(0, -1).every(([x, y]) => tileAt(run, x, y) !== '#' && !monAt(run, x, y) && !boxAt(run, x, y)); }
function endTurn(run, ev) {
  const h = run.hero; run.turn++;
  ev.push({ t: 'enemyTurn' }); // ここから てきの ばん（ひょうじは ここまで てきを うごく まえの ばしょに かく）
  for (const m of [...run.mons]) {
    if (!run.mons.includes(m) || m.tame) continue;
    const w = WORD[m.id];
    if (m.frozen > 0) { m.frozen--; continue; } // こおって いる・ふきとばされた
    if (w.move === 'slow' && (m.tick = (m.tick + 1) % 2)) continue;
    m.age = (m.age || 0) + 1;
    // queen bee：ときどき なかまを よぶ
    if (m.id === 'queenbee' && m.age % 6 === 0 && run.mons.filter(x => x.id === 'bee').length < 3) {
      const c = freeNear(run, m.x, m.y); if (!(c[0] === m.x && c[1] === m.y) && !(c[0] === h.x && c[1] === h.y)) { spawnMon(run, 'bee', c[0], c[1]); ev.push({ t: 'msg', text: `${en(m.id)} が ${en('bee')} を よんだ！` }); }
    }
    const d = Math.abs(m.x - h.x) + Math.abs(m.y - h.y);
    const hit = (pow, how) => {
      const dmg = Math.min(h.hp, Math.max(1, pow + ri(-1, 1) - heroDef(run))), hp0 = h.hp;
      ev.push({ t: 'bubble', x: m.x, y: m.y, text: how === 'breath' ? 'ほのお！' : 'こうげき！', enemy: true });
      h.hp -= dmg; ev.push({ t: 'fx', kind: 'hurt', x: h.x, y: h.y, n: dmg }); ev.push({ t: 'msg', text: `${en(m.id)} の ${how === 'breath' ? 'ほのお' : 'こうげき'}！ ${dmg} ダメージ` }); ev.push({ t: 'msg', text: calc('モコ', hp0, '−', dmg), calc: true, heroHp: h.hp }); ev.push({ t: 'hurt' });
    };
    if (d === 1) { // こうげき
      hit(m.atk);
      if (w.web && h.hp > 0 && rand() < 0.4) { run.stuck = 1; run.stuckWhy = 'web'; ev.push({ t: 'msg', text: `${en(m.id)} の いとが からまった！ つぎは うごけない` }); }
      if (h.hp <= 0) break;
      continue;
    }
    // dragon：まっすぐ ならんで いて あいだに なにも なければ、とおくから ほのお
    if (w.breath && d <= 4 && (m.x === h.x || m.y === h.y) && rand() < 0.5 && lineClear(run, m, h)) {
      ev.push({ t: 'fx', kind: 'breath', path: linePath(m, h) }); hit(Math.ceil(m.atk * 0.8), 'breath');
      if (h.hp <= 0) break;
      continue;
    }
    let dirs = Object.values(DIRS);
    if (w.move === 'erratic' && rand() < 0.5) dirs = [pick(dirs)];
    else if (d <= (w.sight || 7)) dirs = [...dirs].sort((a, b) => (Math.abs(m.x + a[0] - h.x) + Math.abs(m.y + a[1] - h.y)) - (Math.abs(m.x + b[0] - h.x) + Math.abs(m.y + b[1] - h.y)));
    else if (rand() < 0.6) continue; else dirs = [pick(dirs)];
    for (const [dx, dy] of dirs) {
      const nx = m.x + dx, ny = m.y + dy;
      if (monCan(run, m, nx, ny) && !monAt(run, nx, ny) && !(nx === h.x && ny === h.y) && Math.abs(nx - h.x) + Math.abs(ny - h.y) <= d + (w.move === 'erratic' ? 1 : 0)) { m.x = nx; m.y = ny; break; }
    }
  }
  if (run.tut && h.hp < 1) h.hp = 1; // チュートリアルでは たおれない
  if (h.hp <= 0) {
    const f = run.inv.find(i => i.id === 'angelfeather');
    if (f) { run.inv = run.inv.filter(i => i !== f); h.hp = Math.ceil(h.maxhp / 2); ev.push({ t: 'revive' }); ev.push({ t: 'used', id: 'angelfeather', read: true }); ev.push({ t: 'msg', text: `${en('angelfeather')} が ひかって ふっかつ した！` }); }
    else { ev.push({ t: 'dead' }); return; }
  }
  // HPは あるいても もどらない（たべもの・まほうで かいふく）。MPだけ すこしずつ もどる
  if (run.turn % 6 === 0 && h.mp < h.maxmp) h.mp++;
  for (const id of updateSeen(run)) ev.push({ t: 'meet', id });
}

// かいだんで つぎの かいへ → { clear:さいごまで いった, floor }（rope は かいだん なしで のぼる）
export function descend(run, rope = false) {
  if (!rope && !onStairs(run)) return null;
  if (run.tut) return { tutDone: true };
  if (run.floor >= MAX_FLOOR) return { clear: true, floor: run.floor };
  enterFloor(run, run.floor + 1);
  return { floor: run.floor, meet: updateSeen(run) };
}

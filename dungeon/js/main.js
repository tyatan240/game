// モコの イングリッシュダンジョン：がめん・そうさ・チュートリアル・ずかん・⭐
// core.js（S・save・charSVG・showPop・ACT）を つかう。きまりは game.js、えは art.js、ほぞんは save.js
import { WORD, WORDS, CATS, MAX_FLOOR, INV_MAX, STARS, BOSS_FLOORS } from './data.js';
import { newRun, act, descend, updateSeen, visible, tileAt, seenAt, onStairs, heroAtk, heroDef, monAt, DIRS } from './game.js';
import { drawTile, drawArt, wordArt } from './art.js';
import { load, save as saveDg, flush } from './save.js';
import { sayLetter, unlockAudio, setAudioSettings, sfx } from '../../abc/js/engine/audio.js';

const $id = id => document.getElementById(id);
const cv = $id('cv'), g = cv.getContext('2d');
let D = null, run = null, mode = 'title', heroImg = null, vis = new Set(), fx = [], walking = null, busy = false, logs = [];
let vw = 0, vh = 0, dpr = 1;
const en = id => `<b class="en">${WORD[id].en}</b>`;
const speak = text => { if (D.settings.voice) sayLetter({ speak: text }); };

/* ---------- ほぞん・⭐ ---------- */
function persist() { D.run = run && !run.over ? run : null; saveDg(D); }
function stars(n, why) { if (!n) return; S.points += n; save(); toast(`⭐＋${n} ${why}`); sfx.star(); }
let toastT = null;
function toast(html) { const t = $id('toast'); t.innerHTML = html; t.hidden = false; t.style.top = Math.max(70, $id('dock').getBoundingClientRect().top - 52) + 'px'; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

/* ---------- ずかん ---------- */
const dexOf = id => (D.dex[id] = D.dex[id] || { seen: 0, used: 0, read: 0, looked: 0, first: Date.now() });
function meet(id) {
  const fresh = !D.dex[id]; dexOf(id).seen++;
  if (fresh) {
    toast(`あたらしい ことば！ ${en(id)}（${WORD[id].ja}）`); speak(WORD[id].en);
    const n = Object.keys(D.dex).length, k = Math.floor(n / 10);
    if (k > (D.rewarded.dex || 0)) { D.rewarded.dex = k; setTimeout(() => stars(STARS.dex10, `ずかん ${k * 10}ご！`), 1200); }
  }
}

/* ---------- がめんの おおきさ・かく ---------- */
function resize() {
  dpr = window.devicePixelRatio || 1; vw = innerWidth; vh = innerHeight;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  measureView(); camTarget(true);
}
const T = () => Math.max(32, Math.min(56, Math.floor(Math.min(vw / 17, vh / 13)))); // ひろく みえる ように すこし ちいさめ
// マップの まんなか：うえの ひょうじ（ガイド）と したの ボタンの あいだ
let viewTop = 70, viewBottom = 0;
function measureView() {
  const gd = $id('guide'), top = gd && !gd.hidden ? gd.getBoundingClientRect().bottom : document.querySelector('.dtop').getBoundingClientRect().bottom;
  viewTop = top; viewBottom = $id('dock').getBoundingClientRect().top; // したの らんの うえまでが マップ
}
// カメラ：マップは うごかさず、モコが はしに ちかづいた ときだけ ずらす（ぜんぶ はいる ときは ずっと とまったまま）
let camO = null, camT = null;
function camTarget(force) {
  if (!run) return;
  const t = T(), m = run.map, h = run.hero, mapW = m.w * t, mapH = m.h * t, top = viewTop + 4, bot = viewBottom - 4, mg = 3 * t;
  const axis = (cur, size, lo, hi, p) => {
    if (size <= hi - lo) return lo + (hi - lo - size) / 2; // ぜんぶ はいる
    let o = cur;
    if (force || o == null || o + p < lo + mg || o + p > hi - mg) o = (lo + hi) / 2 - p; // はしに ちかい → モコが まんなかに なるように
    return Math.max(hi - size - t, Math.min(lo + t, o));
  };
  const keep = camT && camT.t === t && !force;
  camT = { t, ox: axis(keep ? camT.ox : null, mapW, 0, vw, (h.x + 0.5) * t), oy: axis(keep ? camT.oy : null, mapH, top, bot, (h.y + 0.5) * t) };
  if (force || !camO || camO.t !== t) camO = { ...camT };
}
function cam() { if (!camO) camTarget(true); return { t: camO.t, ox: camO.ox, oy: camO.oy }; }
function toTile(px, py) { const { t, ox, oy } = cam(); return [Math.floor((px - ox) / t), Math.floor((py - oy) / t)]; }
function makeHero() {
  const svg = charSVG(S.equip, 'normal').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  heroImg = new Image(); heroImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  $id('thero').innerHTML = charSVG(S.equip, 'happy', 'sway');
}
function draw(now) {
  if (camO && camT) { camO.ox += (camT.ox - camO.ox) * 0.22; camO.oy += (camT.oy - camO.oy) * 0.22; } // ずらす ときは なめらかに
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#1e1a2a'; g.fillRect(0, 0, vw, vh);
  if (!run) return;
  const { t, ox, oy } = cam(), m = run.map;
  const x0 = Math.max(0, Math.floor(-ox / t)), y0 = Math.max(0, Math.floor(-oy / t)), x1 = Math.min(m.w - 1, Math.ceil((vw - ox) / t)), y1 = Math.min(m.h - 1, Math.ceil((vh - oy) / t));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) drawTile(g, m.tiles[y][x], ox + x * t, oy + y * t, t, seenAt(run, x, y), vis.has(x + ',' + y));
  const shown = (x, y) => seenAt(run, x, y);
  if (run.stairs && shown(run.stairs.x, run.stairs.y)) drawArt(g, 'dg_stairs', ox + run.stairs.x * t, oy + run.stairs.y * t, t);
  for (const b of run.boxes) if (shown(b.x, b.y)) drawArt(g, b.open ? 'dg_boxopen' : 'dg_box', ox + b.x * t + t * 0.08, oy + b.y * t + t * 0.08, t * 0.84);
  for (const it of run.items) if (shown(it.x, it.y)) drawArt(g, WORD[it.id].art, ox + it.x * t + t * 0.14, oy + it.y * t + t * 0.14, t * 0.72);
  const drawMon = (mo, hp) => {
    const big = WORD[mo.id].boss ? 1.5 : 1, s = t * 0.92 * big, bob = Math.sin(now / 300 + mo.uid) * t * 0.03;
    drawArt(g, WORD[mo.id].art, ox + (mo.x + 0.5) * t - s / 2, oy + (mo.y + 1) * t - s * 0.98 + bob, s);
    if (hp < mo.maxhp) { const w = t * 0.8; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(ox + mo.x * t + t * 0.1, oy + mo.y * t - 4, w, 5); g.fillStyle = '#ff6b6b'; g.fillRect(ox + mo.x * t + t * 0.1, oy + mo.y * t - 4, w * Math.max(0, hp / mo.maxhp), 5); }
  };
  for (const mo of run.mons) if (vis.has(mo.x + ',' + mo.y)) drawMon(mo, monHpShown && monHpShown.has(mo.uid) ? monHpShown.get(mo.uid) : mo.hp);
  for (const gh of ghosts) drawMon(gh, monHpShown && monHpShown.has(gh.uid) ? monHpShown.get(gh.uid) : gh.hp); // たおれた てき（「たおした」まで）
  // モコ
  const h = run.hero, hs = t * 1.15;
  if (heroImg && heroImg.complete) { g.save(); g.translate(ox + (h.x + 0.5) * t, oy + (h.y + 1) * t); if (h.dir === 'left') g.scale(-1, 1); g.drawImage(heroImg, -hs * 0.42, -hs * 1.02, hs * 0.84, hs); g.restore(); }
  else { g.fillStyle = '#ffd34f'; g.beginPath(); g.arc(ox + (h.x + 0.5) * t, oy + (h.y + 0.5) * t, t * 0.35, 0, 7); g.fill(); }
  // むいている ほう（ちいさな やじるし）
  const [dx, dy] = DIRS[h.dir]; g.fillStyle = 'rgba(255,211,79,.9)'; g.beginPath(); const cx = ox + (h.x + 0.5 + dx * 0.55) * t, cy = oy + (h.y + 0.5 + dy * 0.55) * t;
  g.moveTo(cx + dx * t * 0.12, cy + dy * t * 0.12); g.lineTo(cx - dy * t * 0.1 - dx * 0.04 * t, cy + dx * t * 0.1 - dy * 0.04 * t); g.lineTo(cx + dy * t * 0.1 - dx * 0.04 * t, cy - dx * t * 0.1 - dy * 0.04 * t); g.fill();
  drawTutArrow(now, t, ox, oy);
  // えんしゅつ
  fx = fx.filter(f => now - f.t0 < (f.dur || 900));
  for (const f of fx) {
    const k = (now - f.t0) / 900;
    if (f.kind === 'beam') { g.strokeStyle = `rgba(90,170,255,${1 - k})`; g.lineWidth = t * 0.25; g.lineCap = 'round'; g.beginPath(); const p = f.path; if (p.length) { g.moveTo(ox + (h.x + 0.5) * t, oy + (h.y + 0.5) * t); g.lineTo(ox + (p[p.length - 1][0] + 0.5) * t, oy + (p[p.length - 1][1] + 0.5) * t); g.stroke(); } continue; }
    const X = ox + (f.x + 0.5) * t, Y = oy + (f.y + 0.2) * t - k * t * 0.6;
    if (f.kind === 'bubble') { // キャラの うえの ふきだし
      const a = Math.min(1, (1 - (now - f.t0) / f.dur) * 4), fs = Math.max(13, Math.round(t * 0.32));
      g.font = `800 ${fs}px "M PLUS Rounded 1c",sans-serif`; const w = g.measureText(f.text).width + fs, hgt = fs * 1.6, bx = ox + (f.x + 0.5) * t - w / 2, by = oy + f.y * t - hgt - t * 0.6;
      g.globalAlpha = a; g.fillStyle = f.enemy ? '#ffe3e8' : '#fff'; g.strokeStyle = f.enemy ? '#ff6b8a' : '#6ab0ff'; g.lineWidth = 2.5;
      g.beginPath(); g.roundRect ? g.roundRect(bx, by, w, hgt, hgt / 2) : g.rect(bx, by, w, hgt); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(bx + w / 2 - 6, by + hgt - 1); g.lineTo(bx + w / 2, by + hgt + 7); g.lineTo(bx + w / 2 + 6, by + hgt - 1); g.fill();
      g.fillStyle = f.enemy ? '#c8304a' : '#2a6ab8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f.text, bx + w / 2, by + hgt / 2 + 1); g.textBaseline = 'alphabetic'; g.globalAlpha = 1; continue;
    }
    if (f.kind === 'vanish') { const s = t * (1 - k * 0.7); g.globalAlpha = Math.max(0, 1 - k * 1.2); drawArt(g, WORD[f.id].art, ox + (f.x + 0.5) * t - s / 2, oy + (f.y + 0.5) * t - s / 2, s); g.globalAlpha = 1; g.fillStyle = `rgba(255,230,120,${1 - k})`; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = t * (0.2 + k * 0.6); g.beginPath(); g.arc(ox + (f.x + 0.5) * t + Math.cos(a) * d, oy + (f.y + 0.5) * t + Math.sin(a) * d, t * 0.06, 0, 7); g.fill(); } continue; }
    if (f.kind === 'fire') { g.globalAlpha = 1 - k; drawArt(g, 'dg_fire', X - t * 0.4, oy + f.y * t, t * 0.8); g.globalAlpha = 1; }
    if (f.n != null) { g.font = `800 ${Math.round(t * 0.42)}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#fff'; g.fillStyle = f.kind === 'heal' ? '#2f9a5a' : f.kind === 'hurt' ? '#e0304a' : '#e07a1a'; const s = (f.kind === 'heal' ? '+' : '') + f.n; g.strokeText(s, X, Y); g.fillText(s, X, Y); }
  }
  if (fx.some(f => f.kind === 'hurt' && now - f.t0 < 200)) { g.fillStyle = 'rgba(255,60,80,.18)'; g.fillRect(0, 0, vw, vh); }
}
function loop(now) { draw(now); requestAnimationFrame(loop); }

/* ---------- じょうたいの ひょうじ ---------- */
function hud() {
  if (!run) return;
  const h = run.hero;
  $id('floor').textContent = run.tut ? 'れんしゅう' : `${run.floor}かい`;
  const hp = dispHp != null ? dispHp : h.hp; // せんとうちゅうは けいさんしきと いっしょに へる
  $id('hp').textContent = `${hp}/${h.maxhp}`; $id('hpbar').style.width = Math.max(0, 100 * hp / h.maxhp) + '%';
  $id('hpbar').parentNode.parentNode.classList.toggle('low', hp <= h.maxhp * 0.3);
  $id('mp').textContent = `${h.mp}/${h.maxmp}`; $id('mpbar').style.width = (100 * h.mp / h.maxmp) + '%';
  $id('lv').textContent = 'Lv' + h.lv; $id('pts').textContent = S.points;
  $id('bStairs').hidden = !onStairs(run);
  // いまの こうどうの メッセージ（けいさんしき も）は ぜんぶ、まえの ぶんは うすく 1ぎょう
  const cur = logs.filter(l => l.g === logGroup), prev = logs.filter(l => l.g !== logGroup).slice(-1);
  const show = cur.slice(-5); // したの らんは 5ぎょう まで（いまの こうどうが すくない ときは まえの 1ぎょうも うすく）
  $id('log').innerHTML = [...(show.length < 5 ? prev : []).map(l => `<div class="old">${l.t}</div>`), ...show.map(l => `<div>${l.t}</div>`)].join('');
  guide(); measureView(); camTarget(false);
}
let logGroup = 0;
function log(t) { logs.push({ t, g: logGroup }); if (logs.length > 30) logs.shift(); }

/* ---------- こうどう ---------- */
// せんとうが あった ターンは、メッセージと けいさんしきを 1ぎょうずつ ゆっくり だす（その あいだは つぎの そうさを うけつけない）
const MSG_MS = 700, CALC_MS = 1100;
let dispHp = null, fast = false, ghosts = [], monHpShown = null; // せんとうちゅうの ひょうじ：たおれた てきは「たおした」まで のこす
const wait = ms => new Promise(ok => fast ? ok() : setTimeout(ok, ms));
function doAction(a) {
  if (mode !== 'play' || busy || !run) return null;
  if (!tutAllows(a)) { nudge(); return null; } // チュートリアル：いま する こと いがいは できない
  unlockAudio();
  logGroup++;
  const hp0 = run.hero.hp, before = run.mons.map(m => ({ uid: m.uid, id: m.id, x: m.x, y: m.y, hp: m.hp, maxhp: m.maxhp }));
  const r = act(run, a);
  vis = visible(run);
  if (r.turn) { tutFlag('turn'); persist(); }
  const combat = r.ev.some(e => e.t === 'fx' && ['hit', 'fire', 'water', 'hurt'].includes(e.kind));
  if (!combat || fast) { handle(r.ev, false); hud(); return r; }
  busy = true; dispHp = hp0; stopWalk(); stopHold();
  ghosts = before.filter(b => !run.mons.some(m => m.uid === b.uid)); monHpShown = new Map(before.map(b => [b.uid, b.hp]));
  handle(r.ev, true).then(() => { busy = false; dispHp = null; ghosts = []; monHpShown = null; hud(); });
  return r;
}
async function handle(ev, slow) {
  let stairs = false, dead = false;
  for (const e of ev) {
    if (e.t === 'msg') { log(e.text); if (e.heroHp != null) dispHp = e.heroHp; if (e.monUid != null && monHpShown) monHpShown.set(e.monUid, e.monHp); if (slow) { hud(); await wait(e.calc ? CALC_MS : MSG_MS); } }
    else if (e.t === 'fx') fx.push({ ...e, t0: performance.now() });
    else if (e.t === 'bubble') fx.push({ kind: 'bubble', ...e, t0: performance.now(), dur: 1300 });
    else if (e.t === 'meet') meet(e.id);
    else if (e.t === 'pickup') { sfx.tap(); speak(WORD[e.id].en); meet(e.id); tutFlag('pickup', e.id); stopWalk(); }
    else if (e.t === 'used') { const d = dexOf(e.id); d.used++; if (e.read) { d.read++; } tutFlag('used', e.id); }
    else if (e.t === 'equip') tutFlag('equip', e.id);
    else if (e.t === 'learn') { meet(e.id); sfx.unlock(); speak(WORD[e.id].en); tutFlag('learn', e.id); setTimeout(() => showCard(e.id, { learned: true }), 300); }
    else if (e.t === 'cast') { dexOf(e.id).used++; speak(WORD[e.id].en); tutFlag('cast', e.id); }
    else if (e.t === 'kill') { sfx.correct(); tutFlag('kill', e.id); if (slow) { ghosts = ghosts.filter(gh => gh.uid !== e.uid); fx.push({ kind: 'vanish', id: e.id, x: e.x, y: e.y, t0: performance.now() }); } }
    else if (e.t === 'boss') bossDown(e.id);
    else if (e.t === 'level') { sfx.unlock(); fx.push({ kind: 'heal', x: run.hero.x, y: run.hero.y, n: 'Lv' + e.lv, t0: performance.now() }); }
    else if (e.t === 'hurt') { sfx.bump(); stopWalk(); }
    else if (e.t === 'open') { sfx.chest(); e.got.forEach(meet); tutFlag('open'); }
    else if (e.t === 'bump') sfx.bump();
    else if (e.t === 'revive') sfx.unlock();
    else if (e.t === 'stairs') stairs = true;
    else if (e.t === 'dead') dead = true;
  }
  if (dead) { stopWalk(); setTimeout(gameOver, slow ? 300 : 500); return; }
  if (stairs) { stopWalk(); setTimeout(askStairs, 150); }
}
function bossDown(id) {
  if (!D.rewarded.boss.includes(run.floor)) { D.rewarded.boss.push(run.floor); setTimeout(() => stars(STARS.boss, `${WORD[id].en} を たおした！`), 600); }
  sfx.unlock();
}

// できない そうさ → ひかっている ボタンを ゆらす
function nudge() { sfx.bump(); document.querySelectorAll('.hint').forEach(b => { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }); }

/* ---------- いどう（あるく・タップで いどう）---------- */
function stopWalk() { if (walking) { clearInterval(walking); walking = null; } }
function walkTo(tx, ty) {
  stopWalk();
  const h = run.hero, key = (x, y) => x + ',' + y, prev = new Map([[key(h.x, h.y), null]]), q = [[h.x, h.y]];
  let found = false;
  while (q.length) {
    const [x, y] = q.shift(); if (x === tx && y === ty) { found = true; break; }
    for (const [d, [dx, dy]] of Object.entries(DIRS)) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (prev.has(k) || tileAt(run, nx, ny) === '#' || !seenAt(run, nx, ny) || run.boxes.some(b => b.x === nx && b.y === ny)) continue; prev.set(k, [x, y, d]); q.push([nx, ny]); }
  }
  if (!found) return;
  const steps = []; let k = key(tx, ty); while (prev.get(k)) { const p = prev.get(k); steps.unshift(p[2]); k = key(p[0], p[1]); }
  const seenMons = () => run.mons.filter(m => vis.has(m.x + ',' + m.y)).length;
  const m0 = seenMons();
  walking = setInterval(() => {
    const d = steps.shift();
    if (!d || mode !== 'play' || busy) return stopWalk();
    const [dx, dy] = DIRS[d]; if (monAt(run, run.hero.x + dx, run.hero.y + dy)) return stopWalk();
    doAction({ t: 'move', dir: d });
    if (seenMons() > m0) stopWalk();
  }, 220);
}
function tapMap(px, py) {
  if (mode !== 'play' || busy) return;
  const [x, y] = toTile(px, py), h = run.hero, dist = Math.abs(x - h.x) + Math.abs(y - h.y);
  const ti = tutInfo();
  if (ti) { // チュートリアル：しるしの ところ だけ
    const g = ti.goal; if (!g || g.x !== x || g.y !== y) return nudge();
    if (ti.s.tap) return showCard(ti.s.id === 'look' ? 'apple' : run.items.find(i => i.x === x && i.y === y).id, { floor: true, x, y });
    if (ti.dirs.length && !ti.s.foe) return walkTo(x, y);
    if (ti.dirs.length) return doAction({ t: 'move', dir: ti.dirs[0] });
    return;
  }
  const m = vis.has(x + ',' + y) && monAt(run, x, y), it = seenAt(run, x, y) && run.items.find(i => i.x === x && i.y === y), b = seenAt(run, x, y) && run.boxes.find(o => o.x === x && o.y === y);
  const st = run.stairs && seenAt(run, x, y) && run.stairs.x === x && run.stairs.y === y;
  if (m && dist === 1) return doAction({ t: 'move', dir: x > h.x ? 'right' : x < h.x ? 'left' : y > h.y ? 'down' : 'up' });
  if (m) return showCard(m.id, { mon: m });
  if (x === h.x && y === h.y) { if (onStairs(run)) return askStairs(); return; }
  if ((it || b || st) && dist > 1) return showCard(it ? it.id : b ? 'treasurebox' : 'stairs', { floor: true, x, y });
  if (dist === 1 && tileAt(run, x, y) !== '#') return doAction({ t: 'move', dir: x > h.x ? 'right' : x < h.x ? 'left' : y > h.y ? 'down' : 'up' });
  if (seenAt(run, x, y) && tileAt(run, x, y) !== '#') walkTo(x, y);
}

/* ---------- しょうさい カード ---------- */
function showCard(id, ctx = {}) {
  const w = WORD[id]; if (!w) return;
  if (ctx.inv) ctx.inv.peek = true;
  if (!ctx.dex) dexOf(id).looked++;
  tutFlag('look', id);
  let stat = '', btns = '';
  if (ctx.mon) stat = `<div class="dstat">HP ${ctx.mon.hp}/${ctx.mon.maxhp}　つよさ ${ctx.mon.atk}</div>`;
  if (ctx.dex) { const d = D.dex[id] || {}; stat = `<div class="dstat">であった ${d.seen || 0}かい・つかった ${d.used || 0}かい・よめた ${d.read || 0}かい</div>`; }
  if (ctx.inv) {
    const it = ctx.inv, eqd = run.equip.weapon === it.uid || run.equip.shield === it.uid;
    if (w.slot) btns += `<button class="big" data-act="dgEquip" data-arg="${it.uid}">${eqd ? 'はずす' : 'そうびする'}</button>`;
    else if (w.verb) btns += `<button class="big" data-act="dgUse" data-arg="${it.uid}">${w.verb}</button>`;
    btns += `<button class="big gray" data-act="dgDrop" data-arg="${it.uid}">すてる</button>`;
  }
  if (ctx.spell) btns += `<button class="big" data-act="dgCast" data-arg="${id}" ${run.hero.mp < w.mp ? 'disabled' : ''}>つかう（MP ${w.mp}）</button>`;
  const head = ctx.learned ? '<div class="srlabel">あたらしい まほう！</div>' : '';
  showPop(`${head}<div class="dcard"><div class="dart"></div><div class="dname">${w.en}</div><button class="say" data-act="dgSay" data-arg="${id}">🔊 きく</button>
    <div class="dja">「${w.ja}」</div><p class="ddesc">${w.desc}</p>${stat}</div><div class="btns">${btns}<button class="big gray" data-act="${ctx.back || 'close'}">${ctx.back ? 'もどる' : 'とじる'}</button></div>`);
  document.querySelector('#ov .dart').appendChild(wordArt(w.art, 120));
  speak(w.en);
}
function itemsPop() {
  if (!run) return;
  const ti = tutInfo(), want = ti && ti.s.pick; // チュートリアル：つかう もの だけ ひかる（ほかは おせない）
  const rows = run.inv.map(it => {
    const w = WORD[it.id], eqd = run.equip.weapon === it.uid || run.equip.shield === it.uid, ok = !ti || it.id === want, cls = ti && ok ? 'hint' : '';
    const b = w.slot ? `<button class="${cls}" data-act="dgEquip" data-arg="${it.uid}" ${ok ? '' : 'disabled'}>${eqd ? 'はずす' : 'そうび'}</button>` : w.verb ? `<button class="${cls}" data-act="dgUse" data-arg="${it.uid}" ${ok ? '' : 'disabled'}>${w.verb}</button>` : '';
    return `<div class="irow"><span class="ia" data-art="${w.art}"></span><div class="in">${w.en}${eqd ? '<span class="eqm">そうびちゅう</span>' : ''}</div>${b}${ti ? '' : `<button class="q" data-act="dgLook" data-arg="${it.uid}">？</button>`}</div>`;
  }).join('');
  showPop(`<h3>もちもの（${run.inv.length}/${INV_MAX}）</h3><div class="ilist">${rows || '<p class="muted">まだ なにも もっていないよ</p>'}</div>
    ${ti ? '' : '<p class="muted" style="margin:6px 0 0">「？」で いみが わかるよ。いみを みないで つかえたら「よめた」！</p>'}<div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  document.querySelectorAll('#ov [data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 44)));
}
function magicPop() {
  if (!run) return;
  const ti = tutInfo();
  const rows = run.spells.map(id => { const w = WORD[id], ok = !ti || ti.s.spell === id; return `<div class="irow"><span class="ia" data-art="${w.art}"></span><div class="in">${w.en}<small>MP ${w.mp}</small></div><button class="${ti && ok ? 'hint' : ''}" data-act="dgCast" data-arg="${id}" ${run.hero.mp < w.mp || !ok ? 'disabled' : ''}>つかう</button>${ti ? '' : `<button class="q" data-act="dgSpell" data-arg="${id}">？</button>`}</div>`; }).join('');
  showPop(`<h3>まほう（MP ${run.hero.mp}/${run.hero.maxmp}）</h3><div class="ilist">${rows || `<p class="muted">まだ まほうを しらないよ。<b>magic book</b>（まほうの ほん）を よむと おぼえるよ</p>`}</div><div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  document.querySelectorAll('#ov [data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 44)));
}
let dexTab = 'monster';
function dexPop() {
  const list = WORDS.filter(w => w.cat === dexTab), got = WORDS.filter(w => D.dex[w.id]).length;
  showPop(`<div class="dex"><h3>ずかん（${got}/${WORDS.length}）</h3>${tabs(CATS.map(c => [c.id, `${c.en}<br><small>${c.ja}</small>`]), dexTab, 'dgDexTab')}
    <div class="dgrid">${list.map(w => D.dex[w.id] ? `<button data-act="dgDexCard" data-arg="${w.id}"><span data-art="${w.art}"></span><b>${w.en}</b><small>${w.ja}</small></button>` : `<button class="no" data-act="dgDexNo"><i>？</i><small>まだ であって いない</small></button>`).join('')}</div>
    <div class="btns"><button class="big gray" data-act="${mode === 'play' ? 'dgMenu' : 'close'}">もどる</button></div></div>`);
  document.querySelectorAll('#ov [data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 64)));
}

/* ---------- かいだん・ゲームオーバー・クリア ---------- */
function askStairs() {
  if (!run || mode !== 'play' || !onStairs(run)) return;
  meet('stairs');
  const last = !run.tut && run.floor >= MAX_FLOOR, next = run.floor + 1;
  showPop(`<div class="dcard"><div class="dart"></div><div class="dname">stairs</div><div class="dja">「かいだん」</div>
    <p class="ddesc">${run.tut ? 'れんしゅうは おしまい！ ほんとうの ぼうけんへ いこう！' : last ? `${run.floor}かいの さいごの かいだん！` : `${next}かいへ すすむ？${BOSS_FLOORS.includes(next) ? '<br><b style="color:#e0304a">つぎは ボスの かい！</b>' : ''}`}</p></div>
    <div class="btns">${run.tut ? '' : '<button class="big gray" data-act="close">まだ</button>'}<button class="big ${run.tut ? 'hint' : ''}" data-act="dgDown">すすむ</button></div>`);
  document.querySelector('#ov .dart').appendChild(wordArt('dg_stairs', 90));
}
function goDown() {
  closePop();
  const r = descend(run); if (!r) return;
  if (r.tutDone) return tutorialDone();
  if (r.clear) return clearRun();
  sfx.unlock(); vis = visible(run);
  for (const id of updateSeen(run)) meet(id);
  logs = []; logGroup++; log(`${run.floor}かいに ついた！`);
  if (run.floor > D.best) D.best = run.floor;
  if (run.floor > (D.rewarded.floor || 1)) { const n = run.floor - Math.max(1, D.rewarded.floor || 1); D.rewarded.floor = run.floor; stars(STARS.floor * n, `${run.floor}かいに はじめて ついた！`); }
  persist(); camTarget(true); hud();
  const boss = BOSS_FLOORS.includes(run.floor) && run.mons.find(m => m.boss);
  if (boss) setTimeout(() => { if (mode === 'play') showPop(`<h3>ボスの かい！</h3><p>${en(boss.id)}（${WORD[boss.id].ja}）が まっている！<br>たおすと かいだんが あらわれるよ。</p><div class="btns"><button class="big" data-act="close">がんばる！</button></div>`); }, 200);
}
function gameOver() {
  mode = 'over'; const f = run.floor, met = [...run.met];
  run.over = true; D.run = null; if (f > D.best) D.best = f; saveDg(D);
  showPop(`<h3>たおれて しまった……</h3><p><b style="font-size:22px">${f}かい</b> まで いけたよ（さいこう ${D.best}かい）</p>
    <div>こんかい であった ことば</div><div class="wordlist">${met.map(id => `<span><b>${WORD[id].en}</b> ${WORD[id].ja}</span>`).join('')}</div>
    <p class="muted">ずかんと ことばの きろくは のこるよ。また ちょうせん しよう！</p><div class="btns"><button class="big" data-act="dgTitle">タイトルへ</button></div>`);
  run = null;
}
function clearRun() {
  mode = 'over'; D.clears++; D.best = Math.max(D.best, run.floor); run.over = true; D.run = null; saveDg(D);
  sfx.unlock();
  showPop(`<h3>${MAX_FLOOR}かい ぜんぶ クリア！</h3><div style="width:120px;margin:0 auto">${charSVG(S.equip, 'happy', 'hop')}</div>
    <p>すごい！ ${en('kingslime')} も たおしたね！<br>この さきの かいは いま じゅんびちゅう。たのしみに まっててね！</p>
    <div class="btns"><button class="big" data-act="dgTitle">タイトルへ</button></div>`);
  run = null;
}

/* ---------- チュートリアル ---------- */
// つぎに する ことを マップの やじるし と ボタンの ひかりで しめす（せつめいは 1ぎょう）。それ いがいの そうさは できない
const E = t => `<b class="en">${t}</b>`;
const itemPos = id => run.items.find(i => i.id === id) || null;
const TUT = [
  { id: 'move', text: 'ひかっている やじるしを おして すすもう', goal: () => ({ x: 9, y: 3 }) },
  { id: 'look', text: `${E('apple')} を タップ！`, tap: () => itemPos('apple') },
  { id: 'pickup', text: `${E('apple')} の うえに のって ひろおう`, goal: () => itemPos('apple') },
  { id: 'eat', text: `もちもの → ${E('apple')} を たべる`, btn: 'bItems', pick: 'apple' },
  { id: 'attack', text: `${E('slime')} に こうげき！`, goal: () => run.mons[0] || null, foe: true },
  { id: 'key', text: `${E('key')} を ひろおう`, goal: () => itemPos('key') },
  { id: 'box', text: `${E('key')} で ${E('treasure box')} を あけよう（ぶつかる）`, goal: () => run.boxes.find(b => !b.open) || null, foe: true },
  { id: 'bookpick', text: `${E('magic book')} を ひろおう`, goal: () => itemPos('magicbook') },
  { id: 'book', text: `もちもの → ${E('magic book')} を よむ`, btn: 'bItems', pick: 'magicbook' },
  { id: 'fire', text: `まほう → ${E('fire')} を つかう`, btn: 'bMagic', spell: 'fire' },
  { id: 'swordpick', text: `${E('sword')} を ひろおう`, goal: () => itemPos('sword') },
  { id: 'sword', text: `もちもの → ${E('sword')} を そうび`, btn: 'bItems', pick: 'sword' },
  { id: 'stairs', text: `${E('stairs')} に のって かいだんへ`, goal: () => run.stairs, stairs: true },
];
let tut = null;
const tutOn = () => !!(tut && run && run.tut && mode === 'play');
function tutFlag(k, id) {
  if (!tut || !run || !run.tut) return;
  const d = tut.done;
  if (k === 'turn' && run.hero.x >= 9) d.move = true;
  if (k === 'look' && id === 'apple') d.look = true;
  if (k === 'pickup') { if (id === 'apple') d.pickup = true; if (id === 'key') d.key = true; if (id === 'magicbook') d.bookpick = true; if (id === 'sword') d.swordpick = true; }
  if (k === 'used' && id === 'apple') { d.pickup = true; d.eat = true; }
  if (k === 'kill') d.attack = true;
  if (k === 'open') { d.key = true; d.box = true; }
  if (k === 'learn') { d.bookpick = true; d.book = true; }
  if (k === 'cast' && id === 'fire') d.fire = true;
  if (k === 'equip' && id === 'sword') { d.swordpick = true; d.sword = true; }
  // fire の れんしゅう あいてが いなく なったら もう 1ぴき
  if (!d.fire && !run.mons.length) { run.mons.push({ uid: run.uid++, id: 'slime', x: 15, y: 4, hp: 3, maxhp: 3, atk: 0, exp: 1, tick: 0, tame: true }); vis = visible(run); }
}
const tutStep = () => TUT.find(x => !tut.done[x.id]) || TUT[TUT.length - 1];
// いまの だんかいで する こと：{ s, goal, dist（ゴールまでの きょり）, dirs（ちかづく ほうこう）, adj（てき・はこの となり）, btn }
function tutInfo() {
  if (!tutOn()) return null;
  const s = tutStep(), h = run.hero, info = { s, id: s.id, dirs: [], btn: s.btn || null };
  const g = s.goal ? s.goal() : s.tap ? s.tap() : null;
  info.goal = g;
  if (s.goal && g) {
    // ゴールから の きょり（てき・はこ は その となり まで）
    const key = (x, y) => x + ',' + y, dist = new Map(), q = [];
    const solidGoal = s.foe;
    if (solidGoal) { for (const [dx, dy] of Object.values(DIRS)) { const x = g.x + dx, y = g.y + dy; if (tileAt(run, x, y) !== '#') { dist.set(key(x, y), 0); q.push([x, y]); } } }
    else { dist.set(key(g.x, g.y), 0); q.push([g.x, g.y]); }
    while (q.length) { const [x, y] = q.shift(), d = dist.get(key(x, y)); for (const [dx, dy] of Object.values(DIRS)) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (dist.has(k) || tileAt(run, nx, ny) === '#' || run.boxes.some(b => b.x === nx && b.y === ny) || run.mons.some(m => m.x === nx && m.y === ny && m !== g)) continue; dist.set(k, d + 1); q.push([nx, ny]); } }
    const here = dist.get(key(h.x, h.y));
    if (solidGoal && here === 0 && Math.abs(g.x - h.x) + Math.abs(g.y - h.y) === 1) { info.adj = true; info.dirs = [g.x > h.x ? 'right' : g.x < h.x ? 'left' : g.y > h.y ? 'down' : 'up']; }
    else for (const [d, [dx, dy]] of Object.entries(DIRS)) { const v = dist.get(key(h.x + dx, h.y + dy)); if (v != null && here != null && v < here) info.dirs.push(d); }
    if (s.stairs && onStairs(run)) { info.dirs = []; info.btn = 'bStairs'; }
    if (s.foe && info.adj && s.id === 'attack') info.btn = 'bAttack';
  }
  return info;
}
// その そうさを して いいか
function tutAllows(a) {
  const i = tutInfo(); if (!i) return true;
  if (a.t === 'move') return i.dirs.includes(a.dir);
  if (a.t === 'attack') return i.id === 'attack' && i.adj && run.hero.dir === i.dirs[0];
  const it = a.uid != null && run.inv.find(x => x.uid === a.uid);
  if (a.t === 'use') return !!it && it.id === i.s.pick && i.s.id !== 'sword';
  if (a.t === 'equip') return !!it && it.id === 'sword' && i.s.id === 'sword';
  if (a.t === 'cast') return i.s.spell === a.id;
  return false; // まつ・すてる など
}
// ボタンの ひかり と つかえない ボタンの うすく
function tutUI() {
  const i = tutInfo(), on = !!i;
  document.querySelectorAll('#pad [data-dir]').forEach(b => { b.classList.toggle('hint', on && i.dirs.includes(b.dataset.dir)); b.classList.toggle('off', on && !i.dirs.includes(b.dataset.dir)); });
  for (const id of ['bAttack', 'bMagic', 'bItems', 'bWait', 'bStairs']) { const b = $id(id); b.classList.toggle('hint', on && i.btn === id); b.classList.toggle('off', on && i.btn !== id); }
}
function guide() {
  const el = $id('guide');
  if (!tutOn()) { el.hidden = true; tutUI(); return; }
  const s = tutStep();
  el.hidden = false; el.innerHTML = `<small>れんしゅう ${TUT.indexOf(s) + 1}/${TUT.length}</small>${s.text}`;
  tutUI();
}
// マップの うえの やじるし（つぎに いく ところ・タップする もの）
function drawTutArrow(now, t, ox, oy) {
  const i = tutInfo(); if (!i || !i.goal || (i.btn && !i.s.foe && !i.s.stairs) || (i.s.stairs && onStairs(run))) return;
  const g = i.goal, cx = ox + (g.x + 0.5) * t, bob = Math.sin(now / 200) * t * 0.12, top = oy + g.y * t - t * 0.55 + bob;
  g.x != null && (() => {
    const c = cv.getContext('2d');
    c.strokeStyle = `rgba(255,211,79,${0.6 + Math.sin(now / 180) * 0.3})`; c.lineWidth = 4; c.beginPath(); c.arc(cx, oy + (g.y + 0.5) * t, t * 0.52, 0, 7); c.stroke();
    c.fillStyle = '#ffd34f'; c.strokeStyle = '#a86a00'; c.lineWidth = 2.5; c.beginPath();
    c.moveTo(cx, top + t * 0.38); c.lineTo(cx - t * 0.26, top + t * 0.08); c.lineTo(cx - t * 0.1, top + t * 0.08); c.lineTo(cx - t * 0.1, top - t * 0.22); c.lineTo(cx + t * 0.1, top - t * 0.22); c.lineTo(cx + t * 0.1, top + t * 0.08); c.lineTo(cx + t * 0.26, top + t * 0.08); c.closePath(); c.fill(); c.stroke();
  })();
}
function tutorialDone() {
  D.tutorialDone = true; tut = null; saveDg(D); sfx.unlock();
  showPop(`<h3>れんしゅう クリア！</h3><div style="width:110px;margin:0 auto">${charSVG(S.equip, 'happy', 'hop')}</div>
    <p>あった ことばは「ずかん」に のったよ。<br>いよいよ ほんとうの ダンジョンへ！</p><div class="btns"><button class="big" data-act="dgStartReal">ぼうけんに いく！</button></div>`);
  mode = 'over'; run = null;
}

/* ---------- はじめる・タイトル ---------- */
function start(tutorial) {
  closePop(); unlockAudio();
  run = newRun(tutorial); mode = 'play'; logs = []; fx = [];
  tut = tutorial ? { done: {} } : null;
  if (!tutorial) { D.runs++; if (1 > D.best) D.best = 1; log('1かい から ぼうけん スタート！'); }
  else log('れんしゅうの へや。ひかっている ところを みてね');
  vis = visible(run); for (const id of updateSeen(run)) meet(id);
  $id('title').classList.add('hide'); persist(); measureView(); camTarget(true); hud();
}
function resume() { closePop(); unlockAudio(); run = D.run; mode = 'play'; logs = []; logGroup++; log(`${run.tut ? 'れんしゅう' : run.floor + 'かい'} から つづき`); tut = run.tut ? { done: {} } : null; vis = visible(run); $id('title').classList.add('hide'); measureView(); camTarget(true); hud(); }
function toTitle() {
  closePop(); stopWalk(); mode = 'title'; run = null; tut = null;
  $id('title').classList.remove('hide'); $id('guide').hidden = true;
  $id('tCont').hidden = !D.run;
  $id('tbest').innerHTML = D.best ? `さいこう とうたつ <b>${D.best}かい</b>${D.clears ? `　クリア ${D.clears}かい` : ''}` : 'まだ ぼうけんして いないよ';
}
function goPressed() {
  const go = () => { if (!D.tutorialDone) return start(true); showPop(`<h3>あそびかたの せつめいを みる？</h3><p>はじめに「れんしゅうの へや」で うごきかたを れんしゅう できるよ。</p><div class="btns"><button class="big gray" data-act="dgSkipTut">とばす</button><button class="big" data-act="dgTut">みる</button></div>`); };
  if (D.run) return showPop(`<h3>あたらしく ぼうけん する？</h3><p>ちゅうだん している ぼうけん（${D.run.tut ? 'れんしゅう' : D.run.floor + 'かい'}）は なくなるよ。</p><div class="btns"><button class="big gray" data-act="close">やめる</button><button class="big" data-act="dgNew">あたらしく</button></div>`);
  go();
}
function menu() {
  stopWalk();
  showPop(`<h3>メニュー</h3><div class="btns" style="flex-direction:column;gap:8px">
    <button class="big" data-act="close">つづける</button><button class="big sub" data-act="dgDex">ずかん</button>
    <button class="big gray" data-act="dgHome">${run && run.tut ? 'やめて おうちへ' : 'ちゅうだんして おうちへ'}</button></div>
    <p class="muted">ちゅうだん すると、つぎは「つづきから」 あそべるよ</p>`);
}

Object.assign(ACT, {
  close: () => { sfx.tap(); closePop(); if (run) hud(); }, // とじる（core.js には ない ので ここで きめる）
  dgSay: id => speak(WORD[id].en),
  dgUse: uid => { closePop(); doAction({ t: 'use', uid: +uid }); },
  dgEquip: uid => { closePop(); doAction({ t: 'equip', uid: +uid }); },
  dgDrop: uid => { closePop(); doAction({ t: 'drop', uid: +uid }); },
  dgLook: uid => { const it = run.inv.find(i => i.uid === +uid); if (it) showCard(it.id, { inv: it, back: 'dgItems' }); },
  dgItems: () => itemsPop(),
  dgCast: id => { closePop(); doAction({ t: 'cast', id }); },
  dgSpell: id => showCard(id, { spell: true, back: 'dgMagic' }),
  dgMagic: () => magicPop(),
  dgDex: () => dexPop(), dgDexTab: t => { dexTab = t; dexPop(); }, dgDexCard: id => showCard(id, { dex: true, back: 'dgDex' }), dgDexNo: () => {},
  dgMenu: () => menu(),
  dgDown: () => goDown(),
  dgTitle: () => toTitle(),
  dgTut: () => start(true), dgSkipTut: () => start(false), dgStartReal: () => start(false),
  dgNew: () => { D.run = null; saveDg(D); closePop(); goPressed(); },
  dgHome: () => { if (run && run.tut) { run = null; D.run = null; } persist(); flush(D); location.href = '../index.html'; },
});

/* ---------- そうさ ---------- */
let hold = null;
function stopHold() { clearInterval(hold); hold = null; }
function setupInput() {
  const dirOf = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  addEventListener('keydown', e => {
    if (mode !== 'play' || !$id('ov').classList.contains('hide')) return;
    if (dirOf[e.key]) { e.preventDefault(); stopWalk(); doAction({ t: 'move', dir: dirOf[e.key] }); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (onStairs(run)) askStairs(); else doAction({ t: 'attack' }); }
    else if (e.key === 'm') magicPop(); else if (e.key === 'i') itemsPop(); else if (e.key === '.') doAction({ t: 'wait' });
  });
  // おしっぱなしで あるく のは てきが みえない とき だけ（てきが いたら 1かい おす ごとに 1ぽ）
  const monsSeen = () => run && run.mons.some(m => vis.has(m.x + ',' + m.y));
  const press = dir => { stopWalk(); doAction({ t: 'move', dir }); stopHold(); if (!monsSeen()) hold = setInterval(() => { if (monsSeen() || busy) return stopHold(); doAction({ t: 'move', dir }); }, 300); };
  const release = () => stopHold();
  document.querySelectorAll('#pad [data-dir]').forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); press(b.dataset.dir); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, release));
  });
  const tutBtn = id => { const i = tutInfo(); if (i && i.btn !== id) { nudge(); return false; } return true; };
  $id('bAttack').onclick = () => { stopWalk(); if (tutBtn('bAttack')) doAction({ t: 'attack' }); };
  $id('bMagic').onclick = () => { stopWalk(); if (tutBtn('bMagic')) magicPop(); };
  $id('bItems').onclick = () => { stopWalk(); if (tutBtn('bItems')) itemsPop(); };
  $id('bWait').onclick = () => { stopWalk(); if (tutBtn('bWait')) doAction({ t: 'wait' }); };
  $id('bStairs').onclick = () => { if (tutBtn('bStairs')) askStairs(); };
  $id('menuBtn').onclick = () => menu();
  cv.addEventListener('pointerdown', e => { e.preventDefault(); tapMap(e.clientX, e.clientY); });
  $id('tGo').onclick = () => { unlockAudio(); goPressed(); };
  $id('tCont').onclick = () => resume();
  $id('tDex').onclick = () => dexPop();
  $id('tHow').onclick = () => start(true);
  addEventListener('resize', resize);
  addEventListener('pagehide', () => { if (D) { if (run && !run.over) D.run = run; flush(D); } });
}

/* ---------- きどう ---------- */
(async () => {
  resize(); setupInput();
  [, D] = await Promise.all([ready, load()]);
  setAudioSettings({ bgm: false, se: D.settings.se, voice: D.settings.voice && S.settings.sound !== false });
  makeHero(); toTitle();
  requestAnimationFrame(loop);
  document.body.dataset.ready = '1';
})();

// じどう テスト よう
window.__dg = { tutInfo: () => { const i = tutInfo(); return i && { id: i.id, dirs: i.dirs, btn: i.btn, adj: !!i.adj, goal: i.goal && { x: i.goal.x, y: i.goal.y }, pick: i.s.pick, spell: i.s.spell }; }, set fast(v) { fast = v; }, get busy() { return busy; }, get ghosts() { return ghosts; }, get run() { return run; }, get D() { return D; }, get mode() { return mode; }, get tut() { return tut; }, act: doAction, start, resume, toTitle, goDown, showCard, tapMap, toTile, cam: () => cam(), visible: () => vis };

// モコの イングリッシュダンジョン：がめん・そうさ・チュートリアル・ずかん・⭐
// core.js（S・save・charSVG・showPop・ACT）を つかう。きまりは game.js、えは art.js、ほぞんは save.js
import { WORD, WORDS, CATS, MAX_FLOOR, STARS, BOSS_FLOORS, TEST_FLOORS, zoneOf, BAGS, GROUPS, bagOf, FAMS } from './data.js';
import { isTreasure, openSecret, failSecret, unstackBoxes } from './game.js';
import { makeQuiz } from './quiz.js';
import { initTreasure, treasureUnlocked, cardCount, giveCard, showReveals, flipCard, revealNext, albumPop, cardBig, cardSay, revealPending, revealSay, gachaPop, gachaGo, gachaBack, quizPop, quizAns, quizTile, quizBack, quizDone, quizSay } from './treasure.js';
import { CARD, CARD_TOTAL, CARD_STARS } from './cards.js';
import { newRun, act, descend, updateSeen, visible, tileAt, seenAt, onStairs, heroAtk, heroDef, monAt, DIRS, bagCount, spellTargets } from './game.js';
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
// ちゅうだんの ほぞん：えいごの ダンジョンは D.run、たからさがしは D.treasure.run（べつべつ）
let curMode = 'english';
function setSlot(v) { if (curMode === 'treasure') D.treasure.run = v; else D.run = v; }
function persist() { setSlot(run && !run.over ? run : null); saveDg(D); }
function stars(n, why) { if (!n) return; S.points += n; save(); toast(`⭐＋${n} ${why}`); sfx.star(); }
let toastT = null;
function toast(html) { const t = $id('toast'); t.innerHTML = html; t.hidden = false; t.style.top = Math.max(70, (!$id('aim').hidden ? $id('aim') : $id('dock')).getBoundingClientRect().top - 52) + 'px'; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

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
  const { t, ox, oy } = cam(), m = run.map, zone = zoneOf(run.floor);
  const x0 = Math.max(0, Math.floor(-ox / t)), y0 = Math.max(0, Math.floor(-oy / t)), x1 = Math.min(m.w - 1, Math.ceil((vw - ox) / t)), y1 = Math.min(m.h - 1, Math.ceil((vh - oy) / t));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) drawTile(g, m.tiles[y][x], ox + x * t, oy + y * t, t, seenAt(run, x, y), vis.has(x + ',' + y), zone);
  const shown = (x, y) => seenAt(run, x, y);
  if (run.stairs && shown(run.stairs.x, run.stairs.y)) drawArt(g, 'dg_stairs', ox + run.stairs.x * t, oy + run.stairs.y * t, t);
  if (run.rugs) run.map.rooms.forEach((R, i) => { if (run.rugs[i] && shown(R.x + (R.w >> 1), R.y + (R.h >> 1))) drawRug(R, run.rugs[i], t, ox, oy); }); // いろの じゅうたん（えいごだけの ヒント）
  for (const s of run.secrets || []) if (!s.open) {
    if (s.kind === 'hint') { for (const tc of s.torches || []) if (shown(tc.x, tc.y)) drawTorch(tc, s, now, t, ox, oy); }
    else if (s.kind === 'gold') { if (shown(s.door.x, s.door.y)) drawGoldDoor(s, now, t, ox, oy); }
    else if (shown(s.door.x, s.door.y)) drawCrack(s, now, t, ox, oy);
  }
  for (const b of run.boxes) if (shown(b.x, b.y)) drawArt(g, b.open ? 'dg_boxopen' : 'dg_box', ox + b.x * t + t * 0.08, oy + b.y * t + t * 0.08, t * 0.84);
  for (const it of run.items) if (shown(it.x, it.y)) {
    drawArt(g, WORD[it.id].art, ox + it.x * t + t * 0.14, oy + it.y * t + t * 0.14, t * 0.72);
    if (it.id === 'ltile') { g.fillStyle = '#c8701a'; g.font = `900 ${Math.round(t * 0.5)}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.letter.toUpperCase(), ox + (it.x + 0.47) * t, oy + (it.y + 0.47) * t); g.textBaseline = 'alphabetic'; }
  }
  for (const tr of run.traps || []) if (tr.found && shown(tr.x, tr.y)) drawTrap(tr, t, ox, oy);
  const drawMon = (mo, hp) => {
    const big = WORD[mo.id].boss || WORD[mo.id].hboss ? 1.5 : (WORD[mo.id].size || 1), s = t * 0.92 * big, bob = mo.frozen ? 0 : Math.sin(now / 300 + mo.uid) * t * 0.03;
    if (WORD[mo.id].wall) g.globalAlpha = m.tiles[mo.y][mo.x] === '#' ? 0.55 : 0.85; // おばけは すけて いる
    drawArt(g, WORD[mo.id].art, ox + (mo.x + 0.5) * t - s / 2, oy + (mo.y + 1) * t - s * 0.98 + bob, s); g.globalAlpha = 1;
    if (mo.frozen) { g.fillStyle = 'rgba(140,210,255,.38)'; g.fillRect(ox + mo.x * t + 2, oy + mo.y * t + 2, t - 4, t - 4); g.strokeStyle = '#7ac8ff'; g.lineWidth = 2; g.strokeRect(ox + mo.x * t + 2, oy + mo.y * t + 2, t - 4, t - 4); }
    if (hp < mo.maxhp) { const w = t * 0.8; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(ox + mo.x * t + t * 0.1, oy + mo.y * t - 4, w, 5); g.fillStyle = '#ff6b6b'; g.fillRect(ox + mo.x * t + t * 0.1, oy + mo.y * t - 4, w * Math.max(0, hp / mo.maxhp), 5); }
  };
  for (const m0 of run.mons) { const ps = posShown && posShown.get(m0.uid), mo = ps ? { ...m0, x: ps.x, y: ps.y } : m0; if (vis.has(mo.x + ',' + mo.y)) drawMon(mo, monHpShown && monHpShown.has(mo.uid) ? monHpShown.get(mo.uid) : mo.hp); }
  for (const gh of ghosts) drawMon(gh, monHpShown && monHpShown.has(gh.uid) ? monHpShown.get(gh.uid) : gh.hp); // たおれた てき（「たおした」まで）
  // モコ
  const h = run.hero, hs = t * 1.15;
  if (heroImg && heroImg.complete) { g.save(); g.translate(ox + (h.x + 0.5) * t, oy + (h.y + 1) * t); if (h.dir === 'left') g.scale(-1, 1); drawGear(g, hs, 'armor'); g.drawImage(heroImg, -hs * 0.42, -hs * 1.02, hs * 0.84, hs); drawGear(g, hs, 'hand'); g.restore(); }
  else { g.fillStyle = '#ffd34f'; g.beginPath(); g.arc(ox + (h.x + 0.5) * t, oy + (h.y + 0.5) * t, t * 0.35, 0, 7); g.fill(); }
  // むいている ほう（ちいさな やじるし）
  const [dx, dy] = DIRS[h.dir]; g.fillStyle = 'rgba(255,211,79,.9)'; g.beginPath(); const cx = ox + (h.x + 0.5 + dx * 0.55) * t, cy = oy + (h.y + 0.5 + dy * 0.55) * t;
  g.moveTo(cx + dx * t * 0.12, cy + dy * t * 0.12); g.lineTo(cx - dy * t * 0.1 - dx * 0.04 * t, cy + dx * t * 0.1 - dy * 0.04 * t); g.lineTo(cx + dy * t * 0.1 - dx * 0.04 * t, cy - dx * t * 0.1 - dy * 0.04 * t); g.fill();
  drawTutArrow(now, t, ox, oy); drawAim(now, t, ox, oy);
  // えんしゅつ
  fx = fx.filter(f => now - f.t0 < (f.dur || 900));
  for (const f of fx) {
    const k = (now - f.t0) / 900;
    if (f.kind === 'beam' || f.kind === 'breath') { g.strokeStyle = f.kind === 'beam' ? `rgba(90,170,255,${1 - k})` : `rgba(255,120,40,${1 - k})`; g.lineWidth = t * 0.25 * (f.tier || 1); g.lineCap = 'round'; g.beginPath(); const p = f.path; if (p.length) { const s0 = f.kind === 'beam' ? [h.x, h.y] : p[0]; g.moveTo(ox + (s0[0] + 0.5) * t, oy + (s0[1] + 0.5) * t); g.lineTo(ox + (p[p.length - 1][0] + 0.5) * t, oy + (p[p.length - 1][1] + 0.5) * t); g.stroke(); } continue; }
    const X = ox + (f.x + 0.5) * t, Y = oy + (f.y + 0.2) * t - k * t * 0.6;
    if (f.kind === 'bubble') { // キャラの うえの ふきだし（つよい まほうは おおきく）
      const a = Math.min(1, (1 - (now - f.t0) / f.dur) * 4), fs = Math.max(13, Math.round(t * 0.32 * (1 + 0.25 * ((f.tier || 1) - 1))));
      g.font = `800 ${fs}px "M PLUS Rounded 1c",sans-serif`; const w = g.measureText(f.text).width + fs, hgt = fs * 1.6, bx = ox + (f.x + 0.5) * t - w / 2, by = oy + f.y * t - hgt - t * 0.6;
      g.globalAlpha = a; g.fillStyle = f.enemy ? '#ffe3e8' : '#fff'; g.strokeStyle = f.enemy ? '#ff6b8a' : '#6ab0ff'; g.lineWidth = 2.5;
      g.beginPath(); g.roundRect ? g.roundRect(bx, by, w, hgt, hgt / 2) : g.rect(bx, by, w, hgt); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(bx + w / 2 - 6, by + hgt - 1); g.lineTo(bx + w / 2, by + hgt + 7); g.lineTo(bx + w / 2 + 6, by + hgt - 1); g.fill();
      g.fillStyle = f.enemy ? '#c8304a' : '#2a6ab8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f.text, bx + w / 2, by + hgt / 2 + 1); g.textBaseline = 'alphabetic'; g.globalAlpha = 1; continue;
    }
    if (f.kind === 'vanish') { const s = t * (1 - k * 0.7); g.globalAlpha = Math.max(0, 1 - k * 1.2); drawArt(g, WORD[f.id].art, ox + (f.x + 0.5) * t - s / 2, oy + (f.y + 0.5) * t - s / 2, s); g.globalAlpha = 1; g.fillStyle = `rgba(255,230,120,${1 - k})`; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = t * (0.2 + k * 0.6); g.beginPath(); g.arc(ox + (f.x + 0.5) * t + Math.cos(a) * d, oy + (f.y + 0.5) * t + Math.sin(a) * d, t * 0.06, 0, 7); g.fill(); } continue; }
    if (f.kind === 'spell') { drawSpell(f, now, t, ox, oy); continue; }
    if (f.kind === 'search') { const kk = (now - f.t0) / f.dur, cx = ox + (f.x + 0.5) * t, cy = oy + (f.y + 0.5) * t; g.strokeStyle = `rgba(255,255,255,${1 - kk})`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, t * (0.25 + kk * 0.3), 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx + t * 0.25, cy + t * 0.25); g.lineTo(cx + t * 0.45, cy + t * 0.45); g.stroke(); continue; }
    if (f.kind === 'aura') { // つよい まほう：モコの まわりに ひかりの わ（tier 3 は 2じゅう）
      const col = FX_COL[f.fam] || '255,220,120', cx2 = ox + (f.x + 0.5) * t, cy2 = oy + (f.y + 0.5) * t;
      for (let r = 0; r < f.tier - 1; r++) { const kk = Math.min(1, k * 1.3 + r * 0.15); g.strokeStyle = `rgba(${col},${Math.max(0, 1 - kk)})`; g.lineWidth = t * 0.12 * f.tier; g.beginPath(); g.arc(cx2, cy2, t * (0.4 + kk * (0.9 + f.tier * 0.5)), 0, 7); g.stroke(); }
      for (let i = 0; i < 6 * f.tier; i++) { const a = i / (6 * f.tier) * Math.PI * 2 + k * 3, d = t * (0.5 + k * 1.4); g.fillStyle = `rgba(255,250,210,${1 - k})`; g.beginPath(); g.arc(cx2 + Math.cos(a) * d, cy2 + Math.sin(a) * d, t * 0.05 * f.tier, 0, 7); g.fill(); }
      continue;
    }
    if (f.kind === 'flash') { g.fillStyle = `rgba(${FX_COL[f.fam] || '255,255,255'},${0.35 * (1 - k)})`; g.fillRect(0, 0, vw, vh); continue; }
    const fxArt = { fire: 'dg_fire', ice: 'dg_ice', thunder: 'dg_thunder', wind: 'dg_wind', water: 'water' }[f.kind];
    if (fxArt) { const sc = 0.8 * (1 + 0.45 * ((f.tier || 1) - 1)); g.globalAlpha = 1 - k; drawArt(g, fxArt, X - t * sc / 2, oy + (f.y + 0.9) * t - t * sc, t * sc); if ((f.tier || 1) >= 2) { g.strokeStyle = `rgba(${FX_COL[f.kind] || '255,255,255'},${1 - k})`; g.lineWidth = 4; g.beginPath(); g.arc(X, oy + (f.y + 0.5) * t, t * (0.3 + k * 0.9), 0, 7); g.stroke(); } g.globalAlpha = 1; }
    if (f.n != null) { g.font = `800 ${Math.round(t * 0.42)}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#fff'; g.fillStyle = f.kind === 'heal' ? '#2f9a5a' : f.kind === 'mp' ? '#2a6ad8' : f.kind === 'hurt' ? '#e0304a' : '#e07a1a'; const s = (f.kind === 'heal' || f.kind === 'mp' ? '+' : '') + f.n + (f.kind === 'mp' ? ' MP' : ''); g.strokeText(s, X, Y); g.fillText(s, X, Y); }
  }
  if (fx.some(f => f.kind === 'hurt' && now - f.t0 < 200)) { g.fillStyle = 'rgba(255,60,80,.18)'; g.fillRect(0, 0, vw, vh); }
}
function loop(now) { draw(now); requestAnimationFrame(loop); }
// まほうの えんしゅつ（さきに みせる）：まえはん モコから とんでいく、うしろはん あたった ところで はじける
const SPELL_MS = 950, FX_ART = { fire: 'dg_fire', ice: 'dg_ice', thunder: 'dg_thunder', wind: 'dg_wind', water: 'water', heal: 'dg_heal', light: 'dg_light' };
function drawSpell(f, now, t, ox, oy) {
  const k = Math.min(1, (now - f.t0) / f.dur), col = FX_COL[f.fam] || '255,255,255', tier = f.tier || 1, art = FX_ART[f.fam];
  const C = ([x, y]) => [ox + (x + 0.5) * t, oy + (y + 0.5) * t], [hx, hy] = C(f.from);
  const glow = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  if (f.kind2 === 'self' || f.kind2 === 'map') { // じぶんに：ひかりが たちのぼる
    glow(hx, hy, t * (0.8 + k * tier), 0.6 * (1 - k * 0.6));
    for (let i = 0; i < 8 * tier; i++) { const a = i * 2.4, r = t * (0.3 + (i % 4) * 0.15); g.fillStyle = `rgba(255,255,230,${1 - k})`; g.beginPath(); g.arc(hx + Math.cos(a) * r, hy - k * t * (1 + (i % 3) * 0.4), t * 0.05 * tier, 0, 7); g.fill(); }
    if (art) { const s = t * (0.7 + 0.25 * tier) * (0.6 + k * 0.5); g.globalAlpha = 1 - k * 0.7; drawArt(g, art, hx - s / 2, hy - t * 0.4 - k * t * 0.6 - s / 2, s); g.globalAlpha = 1; }
    return;
  }
  if (f.kind2 === 'all' || (f.kind2 === 'push' && f.cells.length > 4)) { // ひろがる：なみが へやに ひろがる
    const R = t * (0.5 + k * 7);
    g.strokeStyle = `rgba(${col},${0.8 * (1 - k)})`; g.lineWidth = t * 0.25 * tier; g.beginPath(); g.arc(hx, hy, R, 0, 7); g.stroke();
    for (const c of f.cells) { const [x, y] = C(c), d = Math.hypot(x - hx, y - hy); if (d < R) { g.fillStyle = `rgba(${col},${0.22 * (1 - k)})`; g.fillRect(x - t / 2, y - t / 2, t, t); } }
  }
  if (f.kind2 === 'line') { // まっすぐ のびる
    const n = Math.max(1, Math.ceil(f.cells.length * Math.min(1, k * 1.8))), last = f.cells[n - 1] || f.from, [ex, ey] = C(last);
    g.strokeStyle = `rgba(${col},${1 - k * 0.6})`; g.lineCap = 'round'; g.lineWidth = t * 0.22 * tier; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${0.8 - k * 0.6})`; g.lineWidth = t * 0.07 * tier; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
    if (art) { const s = t * (0.5 + 0.2 * tier); drawArt(g, art, ex - s / 2, ey - s / 2, s); }
    return;
  }
  // とんでいく → はじける
  for (const to of f.to) {
    const [tx, ty] = C(to);
    if (k < 0.5 && f.kind2 !== 'all') { const p = k / 0.5, x = hx + (tx - hx) * p, y = hy + (ty - hy) * p - Math.sin(p * Math.PI) * t * 0.6; glow(x, y, t * 0.5 * tier, 0.7); if (art) { const s = t * (0.45 + 0.15 * tier); drawArt(g, art, x - s / 2, y - s / 2, s); } }
    else { const p = f.kind2 === 'all' ? k : (k - 0.5) / 0.5, s = t * (0.8 + 0.45 * tier) * (0.7 + p * 0.5); glow(tx, ty, t * (0.6 + p * tier * 0.6), 0.75 * (1 - p)); if (art) { g.globalAlpha = Math.max(0, 1 - p * 0.8); drawArt(g, art, tx - s / 2, ty - s / 2 - t * 0.1, s); g.globalAlpha = 1; } for (let i = 0; i < 6 + 4 * tier; i++) { const a = i / (6 + 4 * tier) * Math.PI * 2, d = t * (0.2 + p * (0.6 + 0.3 * tier)); g.fillStyle = `rgba(255,250,200,${1 - p})`; g.beginPath(); g.arc(tx + Math.cos(a) * d, ty + Math.sin(a) * d, t * 0.05 * tier, 0, 7); g.fill(); } }
  }
}
// あやしい かべ：ひびと、ときどき ひかる ほし（しまっている あいだは うすく）
function drawCrack(s, now, t, ox, oy) {
  const x = ox + s.door.x * t, y = oy + s.door.y * t, locked = s.lock > run.turn;
  g.save(); g.strokeStyle = locked ? 'rgba(60,40,60,.45)' : 'rgba(40,20,40,.8)'; g.lineWidth = Math.max(1.5, t * 0.05); g.lineCap = 'round'; g.beginPath();
  g.moveTo(x + t * 0.5, y + t * 0.12); g.lineTo(x + t * 0.42, y + t * 0.36); g.lineTo(x + t * 0.58, y + t * 0.52); g.lineTo(x + t * 0.44, y + t * 0.82);
  g.moveTo(x + t * 0.42, y + t * 0.36); g.lineTo(x + t * 0.26, y + t * 0.42); g.moveTo(x + t * 0.58, y + t * 0.52); g.lineTo(x + t * 0.76, y + t * 0.6); g.stroke();
  if (!locked) { const a = (Math.sin(now / 320 + s.door.x) + 1) / 2, cx = x + t * 0.68, cy = y + t * 0.28, r = t * 0.16 * (0.5 + a * 0.6);
    g.fillStyle = `rgba(255,240,150,${0.35 + a * 0.6})`; g.beginPath(); g.moveTo(cx, cy - r); g.quadraticCurveTo(cx, cy, cx + r, cy); g.quadraticCurveTo(cx, cy, cx, cy + r); g.quadraticCurveTo(cx, cy, cx - r, cy); g.quadraticCurveTo(cx, cy, cx, cy - r); g.fill(); }
  g.restore();
}
// へやの いろの じゅうたん（「The stairs are in the GREEN room.」）
const RUG = { red: ['#ff6b6b', '#c83a3a'], blue: ['#5aa0ff', '#2a60c8'], yellow: ['#ffd84a', '#c8a020'], green: ['#5ac87a', '#2a8a4a'], pink: ['#ff9ad0', '#d85a9a'], purple: ['#a87ae8', '#6a3ac8'] };
function drawRug(R, col, t, ox, oy) {
  const [f, e] = RUG[col], cx = ox + (R.x + R.w / 2) * t, cy = oy + (R.y + R.h / 2) * t, rx = Math.max(0.9, (R.w - 1.4) / 2) * t, ry = Math.max(0.7, (R.h - 1.4) / 2) * t;
  g.save(); g.globalAlpha = 0.55; g.fillStyle = f; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
  g.globalAlpha = 0.9; g.strokeStyle = e; g.lineWidth = Math.max(2, t * 0.08); g.setLineDash([t * 0.18, t * 0.12]); g.beginPath(); g.ellipse(cx, cy, rx - t * 0.12, ry - t * 0.12, 0, 0, 7); g.stroke(); g.setLineDash([]); g.restore();
}
// いろの たいまつ（えいごだけの ヒント）
const TORCH = { red: ['#ff4a4a', '#ffb0a0'], blue: ['#3a8aff', '#a8d4ff'], yellow: ['#ffd020', '#fff3a0'] };
function drawTorch(tc, s, now, t, ox, oy) {
  const x = ox + tc.x * t, y = oy + tc.y * t, [c1, c2] = TORCH[tc.color], fl = Math.sin(now / 120 + tc.x) * t * 0.04, dim = s.lock > run.turn;
  g.save(); g.globalAlpha = dim ? 0.5 : 1;
  g.fillStyle = '#8a5a3a'; g.fillRect(x + t * 0.44, y + t * 0.45, t * 0.12, t * 0.4);
  const gr = g.createRadialGradient(x + t * 0.5, y + t * 0.32, 1, x + t * 0.5, y + t * 0.32, t * 0.45); gr.addColorStop(0, c2); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, y - t * 0.1, t, t * 0.8);
  g.fillStyle = c1; g.beginPath(); g.moveTo(x + t * 0.5, y + t * 0.08 + fl); g.quadraticCurveTo(x + t * 0.72, y + t * 0.36, x + t * 0.5, y + t * 0.48); g.quadraticCurveTo(x + t * 0.28, y + t * 0.36, x + t * 0.5, y + t * 0.08 + fl); g.fill();
  g.fillStyle = c2; g.beginPath(); g.arc(x + t * 0.5, y + t * 0.36, t * 0.07, 0, 7); g.fill(); g.restore();
}
// きんいろの なぞの とびら（きんの かぎで あく）
function drawGoldDoor(s, now, t, ox, oy) {
  const x = ox + s.door.x * t, y = oy + s.door.y * t, a = (Math.sin(now / 300) + 1) / 2;
  g.save(); g.fillStyle = '#d8a020'; g.fillRect(x + t * 0.12, y + t * 0.06, t * 0.76, t * 0.9); g.fillStyle = '#ffd34f'; g.fillRect(x + t * 0.18, y + t * 0.12, t * 0.64, t * 0.8);
  g.strokeStyle = `rgba(255,255,255,${0.4 + a * 0.5})`; g.lineWidth = 3; g.strokeRect(x + t * 0.12, y + t * 0.06, t * 0.76, t * 0.9);
  g.fillStyle = '#8a5a00'; g.beginPath(); g.arc(x + t * 0.5, y + t * 0.48, t * 0.08, 0, 7); g.fill(); g.fillRect(x + t * 0.47, y + t * 0.5, t * 0.06, t * 0.16); g.restore();
}
// みつけた わな
function drawTrap(tr, t, ox, oy) {
  const x = ox + tr.x * t, y = oy + tr.y * t; g.save();
  if (tr.kind === 'pit') { g.fillStyle = 'rgba(40,30,50,.75)'; g.beginPath(); g.ellipse(x + t / 2, y + t / 2, t * 0.36, t * 0.28, 0, 0, 7); g.fill(); }
  else { g.fillStyle = 'rgba(160,120,220,.45)'; g.fillRect(x + t * 0.1, y + t * 0.1, t * 0.8, t * 0.8); g.fillStyle = '#fff'; g.font = `800 ${Math.round(t * 0.3)}px sans-serif`; g.textAlign = 'center'; g.fillText('zzz', x + t / 2, y + t * 0.6); }
  g.strokeStyle = '#ff4a6a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x + t * 0.2, y + t * 0.2); g.lineTo(x + t * 0.8, y + t * 0.8); g.moveTo(x + t * 0.8, y + t * 0.2); g.lineTo(x + t * 0.2, y + t * 0.8); g.stroke(); g.restore();
}
const FX_COL = { fire: '255,130,50', water: '90,170,255', ice: '140,210,255', thunder: '255,220,60', heal: '120,230,150', wind: '110,210,180', light: '255,240,150' };
// そうびの みため：モコの え の まえ（hand：けん・たて）と うしろ（armor：よろい）に かさねる。原点は あしもと
const gearOf = slot => { const it = run && run.inv.find(i => i.uid === run.equip[slot]); return it ? WORD[it.id] : null; };
function drawGear(c, hs, layer) {
  if (!run) return;
  if (layer === 'armor') return;
  const a = gearOf('armor'), w = gearOf('weapon'), sh = gearOf('shield');
  if (a) drawArt(c, a.art, -hs * 0.2, -hs * 0.47, hs * 0.4); // よろいは からだの まえ
  if (sh) drawArt(c, sh.art, -hs * 0.56, -hs * 0.62, hs * 0.44);
  if (w) { const k = hs * 0.58; c.save(); c.translate(hs * 0.38, -hs * 0.5); c.scale(-1, 1); drawArt(c, w.art, -k * 0.5, -k * 0.5, k); c.restore(); } // けんさきは モコの そとがわ（みぎうえ）
}
// そうびがめんの おおきな え（モコ＋そうび）
function gearView(size) {
  const cvs = document.createElement('canvas'), r = window.devicePixelRatio || 1;
  cvs.width = size * r; cvs.height = size * r; cvs.style.width = cvs.style.height = size + 'px';
  const paint = () => { const c = cvs.getContext('2d'); c.setTransform(r, 0, 0, r, 0, 0); c.clearRect(0, 0, size, size); c.translate(size / 2, size * 0.98); const hs = size * 0.92; drawGear(c, hs, 'armor'); if (heroImg && heroImg.complete) c.drawImage(heroImg, -hs * 0.42, -hs * 1.02, hs * 0.84, hs); drawGear(c, hs, 'hand'); };
  paint(); if (heroImg && !heroImg.complete) heroImg.addEventListener('load', paint, { once: true });
  return cvs;
}

/* ---------- じょうたいの ひょうじ ---------- */
function hud() {
  if (!run) return;
  const h = run.hero;
  $id('floor').textContent = run.tut ? 'れんしゅう' : isTreasure(run) ? `${run.floor}かい・カード${(run.cards || []).length}` : `${run.floor}かい`;
  $id('floor').classList.toggle('tre', isTreasure(run));
  const bw = $id('bWait'), tre = isTreasure(run); if (bw.dataset.tre !== String(tre)) { bw.dataset.tre = tre; bw.textContent = tre ? 'しらべる' : 'まつ'; bw.classList.toggle('search', tre); }
  // あやしい かべを はじめて みつけたら おしえる
  for (const s of run.secrets || []) if (!s.open && !s.noted && seenAt(run, s.door.x, s.door.y)) { s.noted = true; const m = s.kind === 'gold' ? 'きんいろの なぞの とびらを みつけた！ gold key が いるよ' : s.kind === 'hint' ? 'いろの ついた たいまつ が ある…かんばんの ヒントを さがそう' : s.kind === 'collect' ? 'もじあつめの とびら！ ゆかの もじを ぜんぶ ひろって しらべよう' : 'あやしい かべ（ひび）を みつけた！ となりで「しらべる」'; setTimeout(() => toast(m), 400); }
  const hp = dispHp != null ? dispHp : h.hp; // せんとうちゅうは けいさんしきと いっしょに へる
  $id('hp').textContent = `${hp}/${h.maxhp}`; $id('hpbar').style.width = Math.max(0, 100 * hp / h.maxhp) + '%';
  $id('hpbar').parentNode.parentNode.classList.toggle('low', hp <= h.maxhp * 0.3);
  $id('mp').textContent = `${h.mp}/${h.maxmp}`; $id('mpbar').style.width = (100 * h.mp / h.maxmp) + '%';
  $id('lv').textContent = 'Lv' + h.lv; $id('pts').textContent = S.points;
  // いまの そうび（うえの ちいさな え。タップで そうびがめん）
  const sig = ['weapon', 'shield', 'armor'].map(sl => (gearOf(sl) || {}).id || '-').join();
  if ($id('gear').dataset.sig !== sig) { const el = $id('gear'); el.dataset.sig = sig; el.innerHTML = ''; ['weapon', 'shield', 'armor'].forEach(sl => { const w = gearOf(sl), sp = document.createElement('span'); sp.className = w ? 'g' : 'g none'; if (w) sp.appendChild(wordArt(w.art, 24)); el.appendChild(sp); }); }
  $id('gear').title = `つよさ ${heroAtk(run)}・まもり ${heroDef(run)}`;
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
let dispHp = null, fast = false, ghosts = [], monHpShown = null, posShown = null; // posShown：モコの こうどうを みせている あいだは てきを うごく まえの ばしょに かく // せんとうちゅうの ひょうじ：たおれた てきは「たおした」まで のこす
const wait = ms => new Promise(ok => fast ? ok() : setTimeout(ok, ms));
function doAction(a) {
  if (mode !== 'play' || busy || !run) return null;
  if (aim && a.t !== 'cast') endAim();
  if (!tutAllows(a)) { nudge(); return null; } // チュートリアル：いま する こと いがいは できない
  if (tut) tut.lastAct = a.t;
  unlockAudio();
  logGroup++;
  const hp0 = run.hero.hp, before = run.mons.map(m => ({ uid: m.uid, id: m.id, x: m.x, y: m.y, hp: m.hp, maxhp: m.maxhp }));
  const r = act(run, a);
  vis = visible(run);
  if (r.turn) { tutFlag('turn'); persist(); }
  const combat = r.ev.some(e => (e.t === 'fx' && ['hit', 'fire', 'water', 'ice', 'thunder', 'wind', 'hurt'].includes(e.kind) && e.n != null) || e.t === 'spell');
  if (!combat || fast) { handle(r.ev, false); hud(); return r; }
  busy = true; dispHp = hp0; stopWalk(); stopHold();
  ghosts = before.filter(b => !run.mons.some(m => m.uid === b.uid)); monHpShown = new Map(before.map(b => [b.uid, b.hp]));
  posShown = new Map(before.map(b => [b.uid, { x: b.x, y: b.y }]));
  handle(r.ev, true).then(() => { busy = false; dispHp = null; ghosts = []; monHpShown = null; posShown = null; hud(); });
  return r;
}
async function handle(ev, slow) {
  let stairs = false, dead = false, rope = false, gotCard = false, quizI = null, hintAns = null, hbossId = null, signText = null;
  for (const e of ev) {
    if (e.t === 'msg') { log(e.text); if (e.heroHp != null) dispHp = e.heroHp; if (e.monUid != null && monHpShown) monHpShown.set(e.monUid, e.monHp); if (slow) { hud(); await wait(e.calc ? CALC_MS : MSG_MS); } }
    else if (e.t === 'fx') { fx.push({ ...e, t0: performance.now() }); if (e.kind === 'wind' && posShown && e.uid != null) posShown.set(e.uid, { x: e.x, y: e.y }); }
    else if (e.t === 'enemyTurn') posShown = null;
    else if (e.t === 'treasure') { giveCard(e.rare, run); gotCard = true; }
    else if (e.t === 'search') fx.push({ kind: 'search', x: e.x, y: e.y, t0: performance.now(), dur: 900 });
    else if (e.t === 'quiz') quizI = e.i;
    else if (e.t === 'hintAns') hintAns = e;
    else if (e.t === 'hboss') hbossId = e.id;
    else if (e.t === 'sign') signText = e.text;
    else if (e.t === 'letter') { sfx.tap(); speak(e.letter); }
    else if (e.t === 'trapfound') sfx.unlock();
    else if (e.t === 'secret') { sfx.unlock(); vis = visible(run); camTarget(false); } // てきの ばん：ここで うごいた ばしょに
    else if (e.t === 'bubble') fx.push({ kind: 'bubble', ...e, t0: performance.now(), dur: 1300 });
    else if (e.t === 'spell') { fx.push({ ...e, kind: 'spell', kind2: e.kind, t0: performance.now(), dur: SPELL_MS }); if (slow) await wait(SPELL_MS); } // まほうの えんしゅつを みせてから ダメージ
    else if (e.t === 'meet') meet(e.id);
    else if (e.t === 'pickup') { sfx.tap(); speak(WORD[e.id].en); meet(e.id); tutFlag('pickup', e.id); stopWalk(); }
    else if (e.t === 'used') { const d = dexOf(e.id); d.used++; if (e.read) { d.read++; } tutFlag('used', e.id); }
    else if (e.t === 'equip') tutFlag('equip', e.id);
    else if (e.t === 'learn') { meet(e.id); sfx.unlock(); speak(WORD[e.id].en); tutFlag('learn', e.id); setTimeout(() => showCard(e.id, { learned: true }), 300); }
    else if (e.t === 'cast') { dexOf(e.id).used++; speak(WORD[e.id].en); tutFlag('cast', e.id); }
    else if (e.t === 'kill') { sfx.correct(); setTimeout(() => speak(`You beat the ${WORD[e.id].en}!`), 250); tutFlag('kill', e.id); if (slow) { ghosts = ghosts.filter(gh => gh.uid !== e.uid); fx.push({ kind: 'vanish', id: e.id, x: e.x, y: e.y, t0: performance.now() }); } }
    else if (e.t === 'boss') bossDown(e.id);
    else if (e.t === 'level') { sfx.unlock(); fx.push({ kind: 'heal', x: run.hero.x, y: run.hero.y, n: 'Lv' + e.lv, t0: performance.now() }); }
    else if (e.t === 'hurt') { sfx.bump(); stopWalk(); }
    else if (e.t === 'open') { speak('Open, treasure box!'); setTimeout(() => sfx.chest(), 900); const got = e.got; if (fast) got.forEach(meet); else setTimeout(() => got.forEach(meet), 1700); tutFlag('open'); } // あける ときは えいごで「Open, treasure box!」
    else if (e.t === 'bump') sfx.bump();
    else if (e.t === 'revive') sfx.unlock();
    else if (e.t === 'stairs') stairs = true;
    else if (e.t === 'rope') rope = true;
    else if (e.t === 'reveal') sfx.unlock();
    else if (e.t === 'dead') dead = true;
  }
  if (quizI != null) { stopWalk(); setTimeout(() => startQuiz(quizI), 250); } // あやしい かべ → とびらの クイズ
  if (hintAns) { stopWalk(); hintResult(hintAns); }
  if (hbossId) { stopWalk(); const id = hbossId; setTimeout(() => { if (mode !== 'play') return; showPop(`<h3>かくしボス！</h3><div class="dart" style="width:120px;margin:0 auto"></div><p>${en(id)}（${WORD[id].ja}）が あらわれた！<br><b class="en">${WORD[id].desc.split('　')[1] || ''}</b></p><p class="muted">weak の まほうは 2ばい きくよ。たおすと ★★★ の カード！</p><div class="btns"><button class="big" data-act="close">たたかう！</button></div>`); const a = document.querySelector('#ov .dart'); if (a) a.appendChild(wordArt(WORD[id].art, 120)); speak(WORD[id].en); }, 300); }
  if (signText) { stopWalk(); const tx = signText; setTimeout(() => signPop(tx), 200); }
  if (gotCard) { stopWalk(); setTimeout(showReveals, slow ? 200 : 350); } // カードを めくる えんしゅつ（たおれても カードは のこる）
  if (dead) { stopWalk(); setTimeout(gameOver, slow ? 300 : 500); return; }
  if (rope) { stopWalk(); setTimeout(() => { if (run && mode === 'play') goDown(true); }, slow ? 300 : 500); return; }
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
  if (mode !== 'play' || busy || aim) return;
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
  if (st && !it && dist > 0) { speak('stairs'); return walkTo(x, y); } // かいだんを タップ → そこまで あるく（のると「すすむ？」）
  if (it && it.id === 'sign') return signPop(it.text); // かんばんは タップで よめる
  if ((it || b) && dist > 1) return showCard(it ? it.id : 'treasurebox', { floor: true, x, y });
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
  if (ctx.mon) stat = `<div class="dstat">HP ${ctx.mon.hp}/${ctx.mon.maxhp}　つよさ ${ctx.mon.atk}${w.weak ? `<br><b class="en weakb">weak: ${w.weak}</b>` : ''}</div>`;
  if (ctx.dex) { const d = D.dex[id] || {}; stat = `<div class="dstat">であった ${d.seen || 0}かい・つかった ${d.used || 0}かい・よめた ${d.read || 0}かい${d.tq ? `<br>テスト ${d.tq}もん ちゅう ${d.tok || 0}もん せいかい` : ''}</div>`; }
  if (ctx.inv) {
    const it = ctx.inv, eqd = Object.values(run.equip).includes(it.uid);
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
/* ---------- まほうの ねらい（あたる ところを さきに みせる）---------- */
let aim = null;
function startAim(id) {
  closePop(); if (!run || mode !== 'play') return;
  const w = WORD[id]; if (run.hero.mp < w.mp) return;
  stopWalk(); aim = { id }; sfx.tap(); speak(w.en); aimUI();
}
function endAim() { aim = null; aimUI(); }
function aimUI() {
  const el = $id('aim');
  if (!aim || !run) { el.hidden = true; el.innerHTML = ''; tutUI(); return; }
  const w = WORD[aim.id], tg = spellTargets(run, aim.id), can = !(tg.none && !tg.mons.length && w.kind !== 'line');
  el.hidden = false;
  el.innerHTML = `<div class="at"><span class="ia"></span><div class="atx"><b class="en">${w.en}</b> <small>${'★'.repeat(w.tier || 1)}　MP ${w.mp}</small><div class="ad">${can ? tg.text : tg.none}${can && tg.mons.length ? `（てき ${tg.mons.length}ひき）` : ''}</div></div></div>
    <div class="ab"><button id="aimNo" data-act="dgAimNo">やめる</button><button id="aimGo" data-act="dgAimGo" ${can ? '' : 'disabled'}>つかう</button></div>`;
  el.querySelector('.ia').appendChild(wordArt(w.art, 40));
  el.style.top = Math.max(64, $id('dock').getBoundingClientRect().top - el.offsetHeight - 8) + 'px';
  tutUI();
}
// マップに あたる ところを ひからせる
function drawAim(now, t, ox, oy) {
  if (!aim || !run) return;
  const w = WORD[aim.id], tg = spellTargets(run, aim.id), col = FX_COL[w.fam] || '255,220,120', a = 0.28 + Math.sin(now / 160) * 0.12;
  for (const [x, y] of tg.cells) { if (!seenAt(run, x, y)) continue; g.fillStyle = `rgba(${col},${a})`; g.fillRect(ox + x * t + 1, oy + y * t + 1, t - 2, t - 2); g.strokeStyle = `rgba(${col},.9)`; g.lineWidth = 2; g.strokeRect(ox + x * t + 2, oy + y * t + 2, t - 4, t - 4); }
  for (const m of tg.mons) { const cx = ox + (m.x + 0.5) * t, cy = oy + (m.y + 0.5) * t, r = t * (0.55 + Math.sin(now / 140) * 0.06); g.strokeStyle = '#ff3a5a'; g.lineWidth = 3.5; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.beginPath(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.moveTo(cx + dx * r * 0.7, cy + dy * r * 0.7); g.lineTo(cx + dx * r * 1.25, cy + dy * r * 1.25); } g.stroke(); }
}

let bagTab = 'weapon';
const SLOT_NAME = { weapon: 'ぶき', shield: 'たて', armor: 'よろい' };
function itemsPop(tab) {
  if (!run) return;
  const ti = tutInfo(), want = ti && ti.s.pick; // チュートリアル：つかう もの だけ ひかる（ほかは おせない）
  if (want) bagTab = bagOf(want); else if (tab === 'equip') bagTab = BAGS.find(b => b.id === bagTab).group === 'equip' ? bagTab : 'weapon'; else if (tab) bagTab = tab;
  const list = run.inv.filter(it => bagOf(it.id) === bagTab), B = BAGS.find(b => b.id === bagTab), grp = B.group;
  const rows = list.map(it => {
    const w = WORD[it.id], eqd = Object.values(run.equip).includes(it.uid), ok = !ti || it.id === want, cls = ti && ok ? 'hint' : '';
    const stat = w.slot ? `<small>${SLOT_NAME[w.slot]}・${w.atk ? `つよさ ＋${w.atk}` : `まもり ＋${w.def}`}</small>` : w.use === 'heal' ? `<small>HP ＋${w.val}</small>` : '';
    const b = w.slot ? `<button class="${cls}" data-act="dgEquip" data-arg="${it.uid}" ${ok ? '' : 'disabled'}>${eqd ? 'はずす' : 'そうび'}</button>` : w.verb ? `<button class="${cls}" data-act="dgUse" data-arg="${it.uid}" ${ok ? '' : 'disabled'}>${w.verb}</button>` : '';
    return `<div class="irow${eqd ? ' on' : ''}"><span class="ia" data-art="${w.art}"></span><div class="in">${w.en}${eqd ? '<span class="eqm">そうびちゅう</span>' : ''}${stat}</div>${b}${ti ? '' : `<button class="q" data-act="dgLook" data-arg="${it.uid}">？</button>`}</div>`;
  }).join('');
  // うえの タブ：そうび・たべもの・ほん/どうぐ。そうびは その したに ぶき・たて・よろい（べつべつの ふくろ）
  const gCount = gid => BAGS.filter(b => b.group === gid).reduce((n, b) => n + bagCount(run, b.id), 0), gMax = gid => BAGS.filter(b => b.group === gid).reduce((n, b) => n + b.max, 0);
  const tabsH = `<div class="bagtabs">${GROUPS.map(gr => `<button class="${gr.id === grp ? 'on' : ''}" data-act="dgBag" data-arg="${gr.id}" ${ti && gr.id !== grp ? 'disabled' : ''}>${gr.name}<small>${gCount(gr.id)}/${gMax(gr.id)}</small></button>`).join('')}</div>`
    + (grp === 'equip' ? `<div class="bagtabs sub">${BAGS.filter(b => b.group === 'equip').map(b => `<button class="${b.id === bagTab ? 'on' : ''}" data-act="dgBag" data-arg="${b.id}" ${ti && b.id !== bagTab ? 'disabled' : ''}>${b.name}<small>${bagCount(run, b.id)}/${b.max}</small></button>`).join('')}</div>` : '');
  // そうびの タブ：モコの みため と いまの そうび
  const panel = grp === 'equip' ? `<div class="gearpanel"><div class="gv"></div><div class="gslots">${['weapon', 'shield', 'armor'].map(sl => { const w = gearOf(sl); return `<div class="gs"><span class="gl">${SLOT_NAME[sl]}</span>${w ? `<span class="ia" data-art="${w.art}"></span><b class="en">${w.en}</b>` : '<span class="gnone">なし</span>'}</div>`; }).join('')}<div class="gstat">つよさ <b>${heroAtk(run)}</b>　まもり <b>${heroDef(run)}</b></div></div></div>` : '';
  showPop(`<h3>もちもの</h3>${tabsH}${panel}<div class="ilist${panel ? ' short' : ''}">${rows || `<p class="muted">「${B.name}」は まだ ないよ</p>`}</div>
    ${ti ? '' : '<p class="muted" style="margin:6px 0 0">「？」で いみが わかるよ。いみを みないで つかえたら「よめた」！</p>'}<div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  document.querySelectorAll('#ov [data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, el.closest('.gs') ? 30 : 44)));
  const gv = document.querySelector('#ov .gv'); if (gv) gv.appendChild(gearView(120));
}
function magicPop() {
  if (!run) return;
  const ti = tutInfo();
  // おなじ なかま（fire・big fire・wide fire …）を 1ぎょうに ならべる。まだ しらない ものは「？」
  const rows = FAMS.filter(f => run.spells.some(id => WORD[id].fam === f)).map(f => {
    const fam = WORDS.filter(w => w.cat === 'magic' && w.fam === f).sort((a, b) => a.tier - b.tier);
    const cells = fam.map(w => {
      if (!run.spells.includes(w.id)) return `<div class="mcell no"><i>？</i><small>${'★'.repeat(w.tier)}</small></div>`;
      const ok = !ti || ti.s.spell === w.id, dis = run.hero.mp < w.mp || !ok;
      return `<div class="mcell t${w.tier}"><span class="ia" data-art="${w.art}"></span><b class="en">${w.en}</b><small>${'★'.repeat(w.tier)}　MP ${w.mp}</small><div class="mb"><button class="${ti && ok ? 'hint' : ''}" data-act="dgCast" data-arg="${w.id}" ${dis ? 'disabled' : ''}>つかう</button>${ti ? '' : `<button class="q" data-act="dgSpell" data-arg="${w.id}">？</button>`}</div></div>`;
    }).join('');
    return `<div class="mrow">${cells}</div>`;
  }).join('');
  showPop(`<h3>まほう（MP ${run.hero.mp}/${run.hero.maxmp}）</h3><div class="ilist">${rows || `<p class="muted">まだ まほうを しらないよ。<b>magic book</b>（まほうの ほん）を よむと おぼえるよ</p>`}</div><div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  document.querySelectorAll('#ov [data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 52)));
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
  const last = !run.tut && run.floor >= MAX_FLOOR, next = run.floor + 1, test = needTest();
  showPop(`<div class="dcard"><div class="dart"></div><div class="dname">stairs</div><div class="dja">「かいだん」</div>
    <p class="ddesc">${run.tut ? 'れんしゅうは おしまい！ ほんとうの ぼうけんへ いこう！' : last ? `${run.floor}かいの さいごの かいだん！` : `${next}かいへ すすむ？${BOSS_FLOORS.includes(next) ? '<br><b style="color:#e0304a">つぎは ボスの かい！</b>' : ''}`}${test ? '<br><b style="color:#2a6ab8">すすむ まえに ことばの ふくしゅう テスト（5もん）！</b>' : ''}</p></div>
    <div class="btns">${run.tut ? '' : '<button class="big gray" data-act="close">まだ</button>'}<button class="big ${run.tut ? 'hint' : ''}" data-act="dgDown">すすむ</button></div>`);
  document.querySelector('#ov .dart').appendChild(wordArt('dg_stairs', 90));
}
const needTest = () => run && !run.tut && !isTreasure(run) && TEST_FLOORS.includes(run.floor) && run.tested !== run.floor; // たからさがしは テストなし
function goDown(rope = false) {
  closePop(); if (aim) endAim();
  if (!rope && needTest() && onStairs(run)) return startTest(); // ボスの あとは ふくしゅう テスト → おわったら すすむ
  const r = descend(run, rope); if (!r) return;
  if (r.tutDone) return tutorialDone();
  if (r.clear) return clearRun();
  sfx.unlock(); vis = visible(run);
  for (const id of updateSeen(run)) meet(id);
  const z = zoneOf(run.floor), newZone = run.floor > 1 && zoneOf(run.floor - 1) !== z;
  logs = []; logGroup++; log(`${run.floor}かいに ついた！${newZone ? `ここは「${z.name}」` : ''}`);
  if (run.boxes.length) log(`この かいには ${en('treasurebox')} が ${run.boxes.length}こ、${en('key')} も ${run.items.filter(i => i.id === 'key').length}こ あるよ`);
  if (run.power && TEST_FLOORS.includes(run.floor - 1)) log(`ことばの ちから：つよさ ＋${run.power}（${run.floor + 4}かい まで）`);
  if (isTreasure(run)) { if (run.floor > D.treasure.best) D.treasure.best = run.floor; }
  else if (run.floor > D.best) D.best = run.floor;
  if (!isTreasure(run) && run.floor > (D.rewarded.floor || 1)) { const n = run.floor - Math.max(1, D.rewarded.floor || 1); D.rewarded.floor = run.floor; stars(STARS.floor * n, `${run.floor}かいに はじめて ついた！`); }
  persist(); camTarget(true); hud();
  const boss = BOSS_FLOORS.includes(run.floor) && run.mons.find(m => m.boss);
  const fl = run.floor;
  if (boss) setTimeout(() => { if (mode === 'play' && run && run.floor === fl) showPop(`<h3>${run.floor >= MAX_FLOOR ? 'さいごの ボス！' : 'ボスの かい！'}</h3><div class="dart" style="width:110px;margin:0 auto"></div><p>${en(boss.id)}（${WORD[boss.id].ja}）が まっている！<br>たおすと かいだんが あらわれるよ。</p><div class="btns"><button class="big" data-act="close">がんばる！</button></div>`); const a = document.querySelector('#ov .dart'); if (a) a.appendChild(wordArt(WORD[boss.id].art, 110)); speak(WORD[boss.id].en); }, 200);
  else if (newZone) setTimeout(() => { if (mode === 'play' && run && run.floor === fl) toast(`${run.floor}かい「${z.name}」`); }, 300);
}
function gameOver() {
  mode = 'over'; const f = run.floor, met = [...run.met];
  run.over = true; setSlot(null);
  if (isTreasure(run)) { // たからさがし：みつけた カードは のこる
    const T = D.treasure; if (f > T.best) T.best = f; saveDg(D);
    showPop(`<h3>たおれて しまった……</h3><p><b style="font-size:22px">${f}かい</b> まで いけたよ（さいこう ${T.best}かい）</p>
      <div>こんかい みつけた カード（${(run.cards || []).length}まい）</div><div class="wordlist">${cardList(run.cards)}</div>
      <p class="muted">みつけた カードは なくならないよ。また たからを さがしに いこう！</p><div class="btns"><button class="big sub" data-act="dgAlbumT">カードずかん</button><button class="big" data-act="dgTitle">タイトルへ</button></div>`);
    run = null; return;
  }
  if (f > D.best) D.best = f; saveDg(D);
  showPop(`<h3>たおれて しまった……</h3><p><b style="font-size:22px">${f}かい</b> まで いけたよ（さいこう ${D.best}かい）</p>
    <div>こんかい であった ことば</div><div class="wordlist">${met.map(id => `<span><b>${WORD[id].en}</b> ${WORD[id].ja}</span>`).join('')}</div>
    <p class="muted">ずかんと ことばの きろくは のこるよ。また ちょうせん しよう！</p><div class="btns"><button class="big" data-act="dgTitle">タイトルへ</button></div>`);
  run = null;
}
// 20かい クリアの きねん：おうちの きせかえ「ダンジョンの マント」
function giveCape(now) {
  if (!D.rewarded.clear || typeof grantItem !== 'function' || S.owned.includes('a_dcape')) return;
  grantItem('a_dcape'); save();
  if (now) { const w = document.querySelector('#ov .pop'); if (w) w.insertAdjacentHTML('beforeend', '<p class="capeb">きねんに「ダンジョンの マント」を もらったよ！（おうちの きせかえ）</p>'); }
  else toast('20かい クリアの きねん「ダンジョンの マント」を もらったよ！');
}
const cardList = ids => (ids || []).map(id => { const c = CARD[id]; return `<span class="r${c.rare}"><b>${c.en}</b> ${'★'.repeat(c.rare)}</span>`; }).join('') || '<span>なし</span>';
function clearRun() {
  if (isTreasure(run)) { // たからさがしの クリア
    mode = 'over'; const T = D.treasure; T.clears++; T.best = Math.max(T.best, run.floor); run.over = true; setSlot(null);
    const first = !T.rewarded.clear; T.rewarded.clear = true; saveDg(D); sfx.unlock();
    showPop(`<h3>たからさがし クリア！</h3><div style="width:120px;margin:0 auto">${charSVG(S.equip, 'happy', 'hop')}</div>
      <p>${MAX_FLOOR}かいの ボスを たおしたね！</p>
      <div>こんかい みつけた カード（${(run.cards || []).length}まい）</div><div class="wordlist">${cardList(run.cards)}</div>
      <div class="btns"><button class="big sub" data-act="dgAlbumT">カードずかん</button><button class="big" data-act="dgTitle">タイトルへ</button></div>`);
    setTimeout(() => stars(first ? CARD_STARS.firstClear : CARD_STARS.clear, first ? 'はじめての たからさがし クリア！' : 'たからさがし クリア！'), 600);
    run = null; return;
  }
  mode = 'over'; D.clears++; D.best = Math.max(D.best, run.floor); run.over = true; setSlot(null);
  const first = !D.rewarded.clear; D.rewarded.clear = true; saveDg(D);
  sfx.unlock(); const met = [...run.met];
  showPop(`<h3>ダンジョン クリア！</h3><div style="width:120px;margin:0 auto">${charSVG(S.equip, 'happy', 'hop')}</div>
    <p>すごい！ ${MAX_FLOOR}かいの ${en('bigdragon')} を たおしたね！</p>
    <div>こんかい であった ことば（${met.length}こ）</div><div class="wordlist">${met.map(id => `<span><b>${WORD[id].en}</b> ${WORD[id].ja}</span>`).join('')}</div>
    <div class="btns"><button class="big" data-act="dgTitle">タイトルへ</button></div>`);
  if (first) setTimeout(() => stars(STARS.clear, 'はじめての ダンジョン クリア！'), 600);
  giveCape(true);
  run = null;
}

/* ---------- ふくしゅう テスト（5かい ごと。ボスの あと）---------- */
// であった ことばから 5もん。にがてな ことば（テストで まちがえた・まだ よめていない）を さきに だす
const TQ_TYPES = ['en2ja', 'pic2en', 'snd2pic', 'ja2en', 'en2ja'];
let TT = null;
function lhRec(q, pick, ok, stars) {
  try {
    if (typeof LH === 'undefined') return;
    LH.recordAttempt({ questionInstanceId: q.iid, questionKey: `eigo:dungeon:${q.type}:${q.id}`, subject: 'eigo', topic: 'dungeon', skill: 'dungeon-' + q.type, difficulty: Math.ceil(TT.floor / 5), mode: 'test',
      questionText: q.type === 'en2ja' ? `${WORD[q.id].en} の いみ` : q.type === 'ja2en' ? `「${WORD[q.id].ja}」は えいごで？` : q.type === 'pic2en' ? `え → えいご（${WORD[q.id].ja}）` : `おとを きいて え（${WORD[q.id].en}）`,
      correctAnswer: WORD[q.id].en, userAnswer: WORD[pick].en, isCorrect: ok, attemptNumber: 1, earnedStars: stars, params: { id: q.id, floor: TT.floor } });
  } catch (e) { }
}
function pickTestWords() {
  const met = [...new Set(run.met)].filter(id => WORD[id]);
  const pool = met.length >= 5 ? met : [...new Set([...met, ...Object.keys(D.dex).filter(id => WORD[id])])];
  const weak = id => { const d = D.dex[id] || {}; return (d.tq ? (d.tok || 0) / d.tq : 0.3) + Math.min(0.5, (d.read || 0) * 0.1) + Math.random() * 0.35; };
  return pool.sort((a, b) => weak(a) - weak(b)).slice(0, 5);
}
function choicesFor(id) {
  const w = WORD[id], others = WORDS.filter(x => x.id !== id && x.en !== w.en && x.ja !== w.ja && x.art !== w.art);
  const same = others.filter(x => x.cat === w.cat && D.dex[x.id]), rest = others.filter(x => !same.includes(x));
  const sh = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const wrong = [...sh(same), ...sh(rest)].slice(0, 2).map(x => x.id);
  return sh([id, ...wrong]);
}
function startTest() {
  if (!run) return;
  stopWalk();
  const words = pickTestWords();
  TT = { floor: run.floor, i: 0, ok: 0, qs: words.map((id, i) => ({ id, type: TQ_TYPES[i % TQ_TYPES.length], ch: choicesFor(id), iid: `dg-${Date.now()}-${i}` })), answered: false };
  try { if (typeof LH !== 'undefined') LH.startSession({ subject: 'eigo', mode: 'dungeon' }); } catch (e) { }
  showPop(`<h3>ことばの ふくしゅう テスト</h3><p>${run.floor}かいまでに であった ことばから 5もん！<br>せいかいの かずだけ ⭐ と「ことばの ちから」（つぎの 5かい つよく なる）が もらえるよ。</p><div class="btns"><button class="big" data-act="dgTestQ">はじめる</button></div>`);
}
function testQ() {
  const q = TT.qs[TT.i], w = WORD[q.id]; TT.answered = false;
  const head = `<div class="tq-head">ふくしゅう テスト ${TT.i + 1}/${TT.qs.length}</div>`;
  let ask = '', btns = '';
  if (q.type === 'en2ja') { ask = `<div class="tq-en">${w.en}</div><button class="say" data-act="dgSay" data-arg="${q.id}">🔊 きく</button><p>いみは どれ？</p>`; btns = q.ch.map((id, i) => `<button class="big tq-c" data-act="dgAns" data-arg="${i}">${WORD[id].ja}</button>`).join(''); }
  if (q.type === 'ja2en') { ask = `<div class="tq-ja">「${w.ja}」</div><p>えいごで どれ？</p>`; btns = q.ch.map((id, i) => `<button class="big tq-c en" data-act="dgAns" data-arg="${i}">${WORD[id].en}</button>`).join(''); }
  if (q.type === 'pic2en') { ask = `<div class="dart tq-pic"></div><p>この えは えいごで どれ？</p>`; btns = q.ch.map((id, i) => `<button class="big tq-c en" data-act="dgAns" data-arg="${i}">${WORD[id].en}</button>`).join(''); }
  if (q.type === 'snd2pic') { ask = `<button class="say big" data-act="dgSay" data-arg="${q.id}">🔊 もう いちど きく</button><p>きこえた ことばの えは どれ？</p>`; btns = q.ch.map((id, i) => `<button class="tq-p" data-act="dgAns" data-arg="${i}" data-art="${WORD[id].art}"></button>`).join(''); }
  showPop(`<div class="tquiz">${head}${ask}<div class="tq-ch">${btns}</div><div class="tq-fb" id="tqfb"></div></div>`);
  if (q.type === 'pic2en') document.querySelector('#ov .tq-pic').appendChild(wordArt(w.art, 110));
  document.querySelectorAll('#ov .tq-p').forEach(el => el.appendChild(wordArt(el.dataset.art, 76)));
  if (q.type === 'en2ja' || q.type === 'snd2pic') setTimeout(() => speak(w.en), 250);
}
function testAns(i) {
  if (!TT || TT.answered) return; TT.answered = true;
  const q = TT.qs[TT.i], pick = q.ch[i], ok = pick === q.id, d = dexOf(q.id);
  d.tq = (d.tq || 0) + 1; if (ok) { d.tok = (d.tok || 0) + 1; TT.ok++; }
  lhRec(q, pick, ok, ok ? 1 : 0);
  (ok ? sfx.correct : sfx.wrong)();
  document.querySelectorAll('#ov [data-act=dgAns]').forEach((b, j) => { b.disabled = true; b.classList.toggle('ok', q.ch[j] === q.id); b.classList.toggle('ng', j === +i && !ok); });
  const w = WORD[q.id];
  $id('tqfb').innerHTML = `<div class="${ok ? 'tok' : 'tng'}">${ok ? 'せいかい！' : 'ざんねん…'}</div><div><b class="en">${w.en}</b> ＝「${w.ja}」</div><div class="btns"><button class="big" data-act="dgTestNext">${TT.i + 1 < TT.qs.length ? 'つぎへ' : 'けっか'}</button></div>`;
  speak(w.en); saveDg(D);
}
function testNext() {
  TT.i++;
  if (TT.i < TT.qs.length) return testQ();
  const ok = TT.ok, power = ok >= 5 ? 3 : ok >= 3 ? 2 : ok >= 1 ? 1 : 0;
  run.tested = TT.floor; run.power = power; persist();
  try { if (typeof LH !== 'undefined') LH.endSession(); } catch (e) { }
  showPop(`<h3>テストの けっか</h3><div class="tq-score">${ok} / ${TT.qs.length}</div>
    <p>${ok === TT.qs.length ? 'ぜんもん せいかい！ すごい！' : ok >= 3 ? 'よく できました！' : 'まちがえた ことばは つぎも でるよ。ずかんで みて みよう！'}</p>
    ${power ? `<p><b>ことばの ちから！</b> つぎの 5かい つよさ ＋${power}</p>` : ''}
    <div class="wordlist">${TT.qs.map(q => `<span><b>${WORD[q.id].en}</b> ${WORD[q.id].ja}</span>`).join('')}</div>
    <div class="btns"><button class="big" data-act="dgTestDone">すすむ</button></div>`);
  if (ok) setTimeout(() => stars(Math.min(STARS.testMax, ok), 'ふくしゅう テスト'), 500);
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
  { id: 'attack', text: `${E('slime')} の となりで「こうげき」ボタン！`, goal: () => run.mons[0] || null, foe: true },
  { id: 'bump', text: `やじるしで ${E('slime')} に ぶつかっても こうげき できるよ！`, goal: () => run.mons[0] || null, foe: true },
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
  if (k === 'kill') { if (tut.lastAct === 'attack' && !d.attack) d.attack = true; else if (d.attack) d.bump = true; else d.attack = true; }
  if (k === 'open') { d.key = true; d.box = true; }
  if (k === 'learn') { d.bookpick = true; d.book = true; }
  if (k === 'cast' && id === 'fire') d.fire = true;
  if (k === 'equip' && id === 'sword') { d.swordpick = true; d.sword = true; }
  // fire の れんしゅう あいてが いなく なったら もう 1ぴき
  if ((!d.bump || !d.fire) && !run.mons.length) { run.mons.push({ uid: run.uid++, id: 'slime', x: 15, y: 4, hp: 3, maxhp: 3, atk: 0, exp: 1, tick: 0, tame: true }); vis = visible(run); }
}
const tutStep = () => TUT.find(x => !tut.done[x.id]) || TUT[TUT.length - 1];
// いまの だんかいで する こと：{ s, goal, dist（ゴールまでの きょり）, dirs（ちかづく ほうこう）, adj（てき・はこの となり）, btn }
function tutInfo() {
  if (!tutOn()) return null;
  const s = tutStep(), h = run.hero, info = { s, id: s.id, dirs: [], btn: s.btn || null };
  if (aim && s.spell === aim.id) { info.btn = 'aimGo'; return info; } // まほうの ねらい：「つかう」を おす
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
    if (s.id === 'attack' && info.adj) { info.btn = 'bAttack'; info.dirs = []; } // ボタンで こうげき（ぶつかるのは つぎの だんかい）
  }
  return info;
}
// その そうさを して いいか
function tutAllows(a) {
  const i = tutInfo(); if (!i) return true;
  if (a.t === 'move') return i.dirs.includes(a.dir);
  if (a.t === 'attack') return i.id === 'attack' && !!i.adj;
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
  for (const id of ['bAttack', 'bMagic', 'bItems', 'bWait', 'bStairs', 'aimGo', 'aimNo']) { const b = $id(id); if (!b) continue; b.classList.toggle('hint', on && i.btn === id); b.classList.toggle('off', on && i.btn !== id); }
}
function guide() {
  const el = $id('guide');
  if (busy && tutOn()) return; // せんとうの ひょうじが おわるまで つぎの だんかいに しない
  if (!tutOn()) { el.hidden = true; tutUI(); return; }
  const s = tutStep();
  el.hidden = false; el.innerHTML = `<small>れんしゅう ${TUT.indexOf(s) + 1}/${TUT.length}</small>${s.text}`;
  tutUI();
}
// マップの うえの やじるし（つぎに いく ところ・タップする もの）
function drawTutArrow(now, t, ox, oy) {
  if (busy) return;
  const i = tutInfo();
  // ボスを たおした あとは かいだんに やじるし（どこへ いけば いいか わかる ように）
  if (!i && run && run.bossDead && run.stairs && !onStairs(run) && seenAt(run, run.stairs.x, run.stairs.y)) return drawArrowAt(now, t, ox, oy, run.stairs);
  if (!i || !i.goal || (i.btn && !i.s.foe && !i.s.stairs) || (i.s.stairs && onStairs(run))) return;
  drawArrowAt(now, t, ox, oy, i.goal);
}
function drawArrowAt(now, t, ox, oy, g) {
  const cx = ox + (g.x + 0.5) * t, bob = Math.sin(now / 200) * t * 0.12, top = oy + g.y * t - t * 0.55 + bob;
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
function start(tutorial, md = 'english') {
  closePop(); unlockAudio(); aim = null; curMode = tutorial ? 'english' : md;
  run = newRun(tutorial, curMode); mode = 'play'; logs = []; fx = [];
  tut = tutorial ? { done: {} } : null;
  if (curMode === 'treasure') { D.treasure.runs++; if (1 > D.treasure.best) D.treasure.best = 1; log('たからさがし スタート！ たからばこ と カードを さがそう'); }
  else if (!tutorial) { D.runs++; if (1 > D.best) D.best = 1; log('1かい から ぼうけん スタート！'); }
  else log('れんしゅうの へや。ひかっている ところを みてね');
  vis = visible(run); for (const id of updateSeen(run)) meet(id);
  $id('title').classList.add('hide'); persist(); measureView(); camTarget(true); hud();
}
function resume(md = 'english') { closePop(); unlockAudio(); curMode = md; run = md === 'treasure' ? D.treasure.run : D.run; if (!run) return; unstackBoxes(run); /* まえの ほぞんで かぎが たからばこの したに なっていたら なおす */ mode = 'play'; logs = []; logGroup++; log(`${run.tut ? 'れんしゅう' : run.floor + 'かい'} から つづき`); tut = run.tut ? { done: {} } : null; vis = visible(run); $id('title').classList.add('hide'); measureView(); camTarget(true); hud(); }
function toTitle() {
  closePop(); stopWalk(); aim = null; aimUI(); mode = 'title'; run = null; tut = null;
  $id('title').classList.remove('hide'); $id('guide').hidden = true;
  $id('tCont').hidden = !D.run;
  $id('tbest').innerHTML = D.best ? `さいこう とうたつ <b>${D.best}かい</b>${D.clears ? `　クリア ${D.clears}かい` : ''}` : 'まだ ぼうけんして いないよ';
  // たからさがし：20かい クリアで あそべる
  const tb = $id('tTreasure'), un = treasureUnlocked();
  tb.classList.toggle('locked', !un); tb.innerHTML = un ? `たからさがし<small>カード ${cardCount()} / ${CARD_TOTAL}</small>` : `たからさがし<small>20かいを クリアすると あそべるよ</small>`;
}
/* ---------- かくし部屋の とびらの クイズ ---------- */
function startQuiz(i) {
  if (!run || mode !== 'play' || !run.secrets || !run.secrets[i]) return;
  const s = run.secrets[i], q = s.kind === 'collect' ? makeQuiz('collect', Math.random, s.card) : makeQuiz(s.kind), iid = `tq-${Date.now()}`;
  try { if (typeof LH !== 'undefined') LH.begin(iid); } catch (e) { }
  quizPop(q, (ok, q2, user) => {
    try { if (typeof LH !== 'undefined') LH.recordAttempt({ questionInstanceId: iid, questionKey: `eigo:treasure:${q2.kind}:${q2.card.id}`, subject: 'eigo', topic: 'treasure', skill: 'treasure-' + q2.kind, difficulty: Math.ceil(run.floor / 5), mode: 'quiz', questionText: q2.kind === 'riddle' ? q2.en : q2.kind === 'letter' ? q2.shown : q2.kind === 'order' ? q2.tiles.join(' ') : `え → えいご（${q2.card.ja}）`, correctAnswer: q2.card.en, userAnswer: user, isCorrect: ok, attemptNumber: 1, earnedStars: ok ? 1 : 0, params: { card: q2.card.id, floor: run.floor } }); } catch (e) { }
    if (!run) return;
    logGroup++;
    if (ok) { stars(1, 'とびらの クイズ せいかい！'); handle(openSecret(run, i), false); }
    else { failSecret(run, i); log('とびらは しまって しまった…（5ターン たったら また しらべよう）'); }
    persist(); hud();
  });
}

// えいごだけの ヒント：かんばんの いろの たいまつを しらべた ばあい
function hintResult(e) {
  const s = run.secrets[e.i]; if (!s) return;
  try { if (typeof LH !== 'undefined') LH.recordAttempt({ questionInstanceId: `th-${Date.now()}`, questionKey: `eigo:treasure:hint:${s.color}`, subject: 'eigo', topic: 'treasure', skill: 'treasure-hint', difficulty: Math.ceil(run.floor / 5), mode: 'quiz', questionText: `Look at the ${s.color.toUpperCase()} torch.`, correctAnswer: s.color, userAnswer: e.user, isCorrect: e.ok, attemptNumber: 1, earnedStars: e.ok ? 1 : 0, params: { floor: run.floor } }); } catch (er) { }
  if (!e.ok) { sfx.wrong(); return; }
  sfx.correct(); speak(`${s.color} torch!`); stars(1, 'えいごの ヒント せいかい！'); logGroup++; log(`<b class="en">${s.color.toUpperCase()}</b> の たいまつだ！`);
  handle(openSecret(run, e.i), false); persist(); hud();
}
function signPop(text) {
  if (mode !== 'play') return;
  showPop(`<div class="dcard"><div class="dart"></div><div class="dname">sign</div><p class="signtx">${text}</p><button class="say" data-act="dgSignSay" data-arg="${text}">🔊 きく</button>
    <p class="muted">えいごだけの ヒント。よんで みよう！</p></div><div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  document.querySelector('#ov .dart').appendChild(wordArt('dg_sign', 90)); speak(text);
}

/* ---------- たからさがしの メニュー ---------- */
function treasureMenu() {
  if (!treasureUnlocked()) { sfx.bump(); return showPop(`<h3>たからさがし ダンジョン</h3><p>イングリッシュダンジョンを <b>20かいまで クリア</b> すると あそべるよ。</p><div class="btns"><button class="big gray" data-act="close">とじる</button></div>`); }
  const T = D.treasure;
  showPop(`<h3>たからさがし ダンジョン</h3>
    <p>A〜Z の たからの カードを あつめよう！<br>たからばこ・ボス から カードが でるよ。ふかい かいほど レアが でやすい！</p>
    <div class="tmenu-stat">カード <b>${cardCount()} / ${CARD_TOTAL}</b>　もじバッジ <b>${T.badges.length}</b>　かけら <b>${T.shards}</b><br>さいこう ${T.best}かい・クリア ${T.clears}かい</div>
    <div class="btns" style="flex-direction:column;gap:8px">
      ${T.run ? `<button class="big" data-act="dgTCont">つづきから（${T.run.floor}かい）</button>` : ''}
      <button class="big ${T.run ? 'sub' : ''}" data-act="dgTGo">${T.run ? 'あたらしく ぼうけん' : 'ぼうけんに いく！'}</button>
      <button class="big sub" data-act="dgAlbumT">カードずかん</button>
      <button class="big sub gcbtn" data-act="dgGacha">カードガチャ（かけら ${T.shards}こ）</button>
      <button class="big gray" data-act="close">もどる</button></div>`);
}
function goPressed() {
  const go = () => { if (!D.tutorialDone) return start(true); showPop(`<h3>あそびかたの せつめいを みる？</h3><p>はじめに「れんしゅうの へや」で うごきかたを れんしゅう できるよ。</p><div class="btns"><button class="big gray" data-act="dgSkipTut">とばす</button><button class="big" data-act="dgTut">みる</button></div>`); };
  if (D.run) return showPop(`<h3>あたらしく ぼうけん する？</h3><p>ちゅうだん している ぼうけん（${D.run.tut ? 'れんしゅう' : D.run.floor + 'かい'}）は なくなるよ。</p><div class="btns"><button class="big gray" data-act="close">やめる</button><button class="big" data-act="dgNew">あたらしく</button></div>`);
  go();
}
function menu() {
  stopWalk();
  showPop(`<h3>メニュー</h3><div class="btns" style="flex-direction:column;gap:8px">
    <button class="big" data-act="close">つづける</button>${isTreasure(run) ? '<button class="big sub" data-act="dgAlbumM">カードずかん</button>' : ''}<button class="big sub" data-act="dgDex">ずかん</button>
    <button class="big gray" data-act="dgHome">${run && run.tut ? 'やめて おうちへ' : 'ちゅうだんして おうちへ'}</button></div>
    <p class="muted">ちゅうだん すると、つぎは「つづきから」 あそべるよ</p>`);
}

Object.assign(ACT, {
  close: () => { sfx.tap(); closePop(); if (run) hud(); }, // とじる（core.js には ない ので ここで きめる）
  dgSay: id => speak(WORD[id].en),
  dgUse: uid => { closePop(); doAction({ t: 'use', uid: +uid }); },
  dgEquip: uid => { closePop(); doAction({ t: 'equip', uid: +uid }); if (mode === 'play' && run) itemsPop(); }, // そうびしても とじない（つづけて えらべる）
  dgDrop: uid => { closePop(); doAction({ t: 'drop', uid: +uid }); },
  dgLook: uid => { const it = run.inv.find(i => i.uid === +uid); if (it) showCard(it.id, { inv: it, back: 'dgItems' }); },
  dgItems: () => itemsPop(), dgBag: b => { sfx.tap(); itemsPop(b); }, dgGear: () => { stopWalk(); if (!tutInfo()) itemsPop('equip'); },
  dgCast: id => startAim(id), // まず あたる ところを みせる →「つかう」で ほんとうに つかう
  dgAimGo: () => { if (!aim) return; const id = aim.id; endAim(); doAction({ t: 'cast', id }); },
  dgAimNo: () => { sfx.tap(); endAim(); },
  dgSpell: id => showCard(id, { spell: true, back: 'dgMagic' }),
  dgMagic: () => magicPop(),
  dgDex: () => dexPop(), dgDexTab: t => { dexTab = t; dexPop(); }, dgDexCard: id => showCard(id, { dex: true, back: 'dgDex' }), dgDexNo: () => {},
  dgMenu: () => menu(),
  dgDown: () => goDown(),
  dgTestQ: () => testQ(), dgAns: i => testAns(+i), dgTestNext: () => testNext(), dgTestDone: () => { TT = null; goDown(); },
  dgTitle: () => toTitle(),
  dgTut: () => start(true), dgSkipTut: () => start(false), dgStartReal: () => start(false),
  dgNew: () => { D.run = null; saveDg(D); closePop(); goPressed(); },
  dgTreasure: () => treasureMenu(),
  dgTGo: () => { if (D.treasure.run) return showPop(`<h3>あたらしく ぼうけん する？</h3><p>ちゅうだん している たからさがし（${D.treasure.run.floor}かい）は なくなるよ。<br>カードは なくならないよ。</p><div class="btns"><button class="big gray" data-act="dgTreasure">やめる</button><button class="big" data-act="dgTNew">あたらしく</button></div>`); start(false, 'treasure'); },
  dgTNew: () => { D.treasure.run = null; saveDg(D); start(false, 'treasure'); },
  dgTCont: () => resume('treasure'),
  dgAlbumT: () => albumPop(null, mode === 'title' || mode === 'over' ? (mode === 'title' ? 'dgTreasure' : 'dgTitle') : 'close'),
  dgAlbumM: () => albumPop(null, 'dgMenu'),
  dgAlbum: L => { sfx.tap(); albumPop(L); },
  dgCardBig: id => cardBig(id), dgCardSay: id => cardSay(id),
  dgGacha: () => { sfx.tap(); gachaPop(); }, dgGachaGo: () => gachaGo(), dgGachaBack: () => { gachaBack(); treasureMenu(); },
  dgSignSay: t => speak(t),
  dgFlip: () => flipCard(), dgRevealNext: () => revealNext(), dgRevealSay: () => revealSay(),
  dgQzAns: i => quizAns(i), dgQzTile: i => quizTile(i), dgQzBack: () => quizBack(), dgQzDone: () => quizDone(), dgQzSay: () => quizSay(),
  dgHome: () => { if (run && run.tut) { run = null; D.run = null; } persist(); flush(D); location.href = '../index.html'; },
});

/* ---------- そうさ ---------- */
let hold = null;
function stopHold() { clearInterval(hold); hold = null; }
function setupInput() {
  const dirOf = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  addEventListener('keydown', e => {
    if (mode !== 'play' || !$id('ov').classList.contains('hide')) return;
    if (dirOf[e.key]) { e.preventDefault(); stopWalk(); if (aim) { run.hero.dir = dirOf[e.key]; aimUI(); } else doAction({ t: 'move', dir: dirOf[e.key] }); }
    else if (aim && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); ACT.dgAimGo(); }
    else if (aim && e.key === 'Escape') ACT.dgAimNo();
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (onStairs(run)) askStairs(); else doAction({ t: 'attack' }); }
    else if (e.key === 'm') magicPop(); else if (e.key === 'i') itemsPop(); else if (e.key === '.') doAction({ t: 'wait' }); else if (e.key === 'f') doAction({ t: 'search' });
  });
  // おしっぱなしで あるく のは てきが みえない とき だけ（てきが いたら 1かい おす ごとに 1ぽ）
  const monsSeen = () => run && run.mons.some(m => vis.has(m.x + ',' + m.y));
  const press = dir => { stopWalk(); if (aim) { if (!busy) { run.hero.dir = dir; aimUI(); } return; } doAction({ t: 'move', dir }); stopHold(); if (!monsSeen()) hold = setInterval(() => { if (monsSeen() || busy) return stopHold(); doAction({ t: 'move', dir }); }, 300); };
  const release = () => stopHold();
  document.querySelectorAll('#pad [data-dir]').forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); press(b.dataset.dir); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, release));
  });
  const tutBtn = id => { const i = tutInfo(); if (i && i.btn !== id) { nudge(); return false; } return true; };
  $id('bAttack').onclick = () => { stopWalk(); if (aim) endAim(); if (tutBtn('bAttack')) doAction({ t: 'attack' }); };
  $id('bMagic').onclick = () => { stopWalk(); if (aim) endAim(); if (tutBtn('bMagic')) magicPop(); };
  $id('bItems').onclick = () => { stopWalk(); if (aim) endAim(); if (tutBtn('bItems')) itemsPop(); };
  $id('bWait').onclick = () => { stopWalk(); if (aim) endAim(); if (tutBtn('bWait')) doAction({ t: isTreasure(run) ? 'search' : 'wait' }); }; // たからさがしでは「しらべる」
  $id('bStairs').onclick = () => { if (tutBtn('bStairs')) askStairs(); };
  $id('menuBtn').onclick = () => menu();
  $id('gear').onclick = () => ACT.dgGear();
  cv.addEventListener('pointerdown', e => { e.preventDefault(); tapMap(e.clientX, e.clientY); });
  $id('tGo').onclick = () => { unlockAudio(); goPressed(); };
  $id('tCont').onclick = () => resume();
  $id('tDex').onclick = () => dexPop();
  $id('tHow').onclick = () => start(true);
  $id('tTreasure').onclick = () => { unlockAudio(); treasureMenu(); };
  addEventListener('resize', resize);
  addEventListener('pagehide', () => { if (D) { if (run && !run.over) setSlot(run); flush(D); } });
}

/* ---------- きどう ---------- */
(async () => {
  resize(); setupInput();
  [, D] = await Promise.all([ready, load()]);
  setAudioSettings({ bgm: false, se: D.settings.se, voice: D.settings.voice && S.settings.sound !== false });
  setTimeout(() => giveCape(false), 800); // まえに クリアした ひとにも マントを わたす
  initTreasure({ D: () => D, speak, stars, toast, sfx, save: () => saveDg(D), onRevealDone: () => { if (run) hud(); } });
  makeHero(); toTitle();
  requestAnimationFrame(loop);
  document.body.dataset.ready = '1';
})();

// じどう テスト よう
window.__dg = { tutInfo: () => { const i = tutInfo(); return i && { id: i.id, dirs: i.dirs, btn: i.btn, adj: !!i.adj, goal: i.goal && { x: i.goal.x, y: i.goal.y }, pick: i.s.pick, spell: i.s.spell }; }, set fast(v) { fast = v; }, get busy() { return busy; }, get ghosts() { return ghosts; }, get run() { return run; }, get D() { return D; }, get mode() { return mode; }, get tut() { return tut; }, act: doAction, start, resume, toTitle, goDown, showCard, tapMap, toTile, cam: () => cam(), visible: () => vis, signPop, shownPos: uid => posShown && posShown.get(uid), treasureMenu, startQuiz, get revealing() { return revealPending(); }, get test() { return TT; }, startTest, get aim() { return aim; } };

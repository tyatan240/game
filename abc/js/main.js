// ABCぼうけん：ゲームの すすみかた（ループ・えがく・イベント）
import { TS, groundTile, drawWater, drawBridge, drawPlank, treeSprite, bushSprite, rockSprite, fenceSprite, houseSprite, drawSign, drawChest, drawCritter, starPath,
  appleTreeSprite, wellSprite, drawHive, drawGate, drawVines, drawFlowerbed, drawBee, WORD_ART, wordArt } from './engine/art.js';
import { drawLetterGate, drawCastle, drawSunstone, drawMound, drawShed, drawKeyboard, drawBasketStand, drawBowl, drawBigTree, drawPaint,
  drawSunbedTile, drawPondTile, drawColorBedTile } from './engine/art2.js';
import * as input from './engine/input.js';
import { unlockAudio, setAudioSettings, sfx } from './engine/audio.js';
import { LETTERS } from './data/letters.js';
import { WORD, WORDS } from './data/words.js';
import { SPELLS } from './data/combos.js';
import { START, ITEMS, INV, STORY } from './data/world1.js';
import { AREAS, ORDER, CHAPTER, WHERE } from './data/areas.js';
import { W, H, area, setArea, tileAt, isWater, isPath, things, move, facing, heroTile, markPos, exitAt, exitOpen, isOpenGate, vinesKey, solidAt, inside } from './game/world.js';
import { load, save, replayState, getRecord } from './game/state.js';
import { record, pickTargets, choiceCount, levelOf } from './game/learning.js';
import { letterQuestion, wordQuestion, shuffle } from './game/quiz.js';
import { activeQuests, currentStep, stepFor, advance, objective, QUEST } from './game/quests.js';
import { tryCast, hintFor, applyEffects, comboKey } from './game/magic.js';
import * as ui from './ui/ui.js';
import { sendStars, housePoints } from './game/house.js';

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
// かいわの かおアイコン：なまえ → どうぶつ
for (const a of Object.values(AREAS)) for (const n of a.NPCS) if (!ui.SPEAKER_KIND[n.name]) ui.SPEAKER_KIND[n.name] = n.kind;
const ALL_LETTERS = LETTERS.map(l => l.id);
let S = load();
let mode = 'title';            // title / play / event
let hero = { x: 0, y: 0, dir: 'down', step: 0, moving: false };
let cam = { x: 0, y: 0 }, scale = 2, dpr = 1, vw = 0, vh = 0;
let bridgeAnim = S.flags.bridgeOpen ? 1 : 0, bossHop = 0, saveT = 0;
let bloomAnim = 0, beeAnim = 0, fx = [], hops = {}, trail = [];
const anim = {};               // ひろい ものの へんか（0〜1）：sunbed / drypond / redbed / bluebed
// id → しらべられる もの（すべての エリア）
const OBJ = {};
for (const a of Object.values(AREAS)) for (const o of [...a.OBJECTS, ...a.NPCS, ...a.SIGNS]) OBJ[o.id] = o;
// マス → ひろい もの（じめんを かく ため）
const GROUND_KINDS = new Set(['flowerbed', 'sunbed', 'pond', 'colorbed']);
const groundObj = {};
for (const a of Object.values(AREAS)) { const m = groundObj[a.id] = new Map(); for (const o of a.OBJECTS) if (GROUND_KINDS.has(o.kind)) for (let y = o.y; y < o.y + (o.h || 1); y++) for (let x = o.x; x < o.x + (o.w || 1); x++) m.set(x + ',' + y, o); }
const done = (k, v) => S.world[k] && S.world[k] !== v;   // S.world[k] が しょきと ちがう

/* ---------- がめんの おおきさ ---------- */
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  vw = innerWidth; vh = innerHeight;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
  scale = Math.max(1.2, Math.min(vh / (TS * 9.5), vw / (TS * 13)));
  document.body.classList.toggle('portrait', vh > vw);
}
addEventListener('resize', resize); resize();

/* ---------- えんしゅつ（fx）---------- */
const playFx = (type, dur, data = {}) => new Promise(res => fx.push({ type, t0: performance.now() / 1000, dur, data, res }));
const center = o => ({ x: (o.x + (o.w || 1) / 2) * TS, y: (o.y + (o.h || 1) / 2) * TS });
const wait = ms => new Promise(r => setTimeout(r, ms));
function drawFx(t, s) {
  fx = fx.filter(f => {
    const k = (t - f.t0) / f.dur;
    if (k >= 1) { f.res(); return false; }
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const X = v => (v - cam.x), Y = v => (v - cam.y);
    if (f.type === 'sparks') {
      for (let i = 0; i < 18; i++) {
        const q = Math.max(0, Math.min(1, k * 1.4 - i * 0.025)), a = f.data.a, b = f.data.b;
        const mx = (a.x + b.x) / 2 + Math.sin(i * 2.1) * 40, my = Math.min(a.y, b.y) - 50 - (i % 3) * 10;
        const x = (1 - q) ** 2 * a.x + 2 * (1 - q) * q * mx + q * q * b.x, y = (1 - q) ** 2 * a.y + 2 * (1 - q) * q * my + q * q * b.y;
        ctx.globalAlpha = q < 1 ? 1 : 0; ctx.fillStyle = ['#fff6a0', '#ffd0e8', '#bfe8ff'][i % 3];
        starPath(ctx, X(x), Y(y), 4, 1.7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (f.type === 'rain') {
      const r = f.data.rect; ctx.strokeStyle = 'rgba(120,190,255,.85)'; ctx.lineWidth = 1.6;
      for (let i = 0; i < 60; i++) {
        const x = r.x * TS + ((i * 37) % ((r.w || 1) * TS)), y = r.y * TS - 20 + (((t * 260) + i * 53) % ((r.h || 1) * TS + 20));
        ctx.beginPath(); ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(x) - 2, Y(y) + 7); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(170,210,255,.25)'; ctx.beginPath(); ctx.ellipse(X((r.x + (r.w || 1) / 2) * TS), Y((r.y - 0.6) * TS), (r.w || 1) * TS * 0.6, 16, 0, 0, 7); ctx.fill();
    }
    if (f.type === 'beams') { // おひさまの ひかり
      const r = f.data.rect; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.55;
      for (let i = 0; i < 5; i++) { const x = r.x * TS + (i + 0.5) * (r.w * TS / 5); const g = ctx.createLinearGradient(0, Y(r.y * TS - 140), 0, Y((r.y + r.h) * TS)); g.addColorStop(0, 'rgba(255,246,160,0)'); g.addColorStop(1, 'rgba(255,240,140,1)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X(x - 4), Y(r.y * TS - 140)); ctx.lineTo(X(x + 4), Y(r.y * TS - 140)); ctx.lineTo(X(x + 12), Y((r.y + r.h) * TS)); ctx.lineTo(X(x - 12), Y((r.y + r.h) * TS)); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    if (f.type === 'apple') {
      const a = f.data.a, b = f.data.b, x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 30;
      ctx.save(); ctx.translate(X(x) - 7, Y(y) - 7); ctx.scale(0.14, 0.14); WORD_ART[f.data.art || 'apple'](ctx); ctx.restore();
    }
    if (f.type === 'fly') { // とりが とんでいく
      const a = f.data.a, b = f.data.b, x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 40;
      ctx.save(); ctx.translate(X(x), Y(y)); drawCritter(ctx, 'bird', 0, 0, b.x > a.x ? 'right' : 'left', k * 6, {}); ctx.restore();
    }
    if (f.type === 'burst' || f.type === 'splash' || f.type === 'dirt') {
      const c = f.data.c, cols = f.type === 'splash' ? [f.data.col, '#ffffff'] : f.type === 'dirt' ? ['#a8805a', '#7a5a3a'] : ['#fff6a0', '#ffb6d6'];
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2, d = 6 + k * 34; ctx.globalAlpha = 1 - k; ctx.fillStyle = cols[i % 2];
        if (f.type === 'burst') { starPath(ctx, X(c.x) + Math.cos(a) * d, Y(c.y) + Math.sin(a) * d, 4, 1.6); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(X(c.x) + Math.cos(a) * d, Y(c.y) + Math.sin(a) * d - (f.type === 'dirt' ? Math.sin(k * Math.PI) * 14 : 0), 3.2, 0, 7); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
    return true;
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/* ---------- えがく ---------- */
function groundState(o) {
  if (o.kind === 'flowerbed') return S.world.flowerbed === 'bloom' ? bloomAnim : 0;
  return anim[o.id] || 0;
}
function draw(t) {
  const s = scale * dpr, A = area();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#3f8f4a'; ctx.fillRect(0, 0, cv.width, cv.height);
  const viewW = vw / scale, viewH = vh / scale;
  const x0 = Math.floor(cam.x / TS) - 1, y0 = Math.floor(cam.y / TS) - 2, x1 = Math.ceil((cam.x + viewW) / TS) + 1, y1 = Math.ceil((cam.y + viewH) / TS) + 2;
  const px = v => Math.round((v - cam.x) * s), py = v => Math.round((v - cam.y) * s);
  const gmap = groundObj[A.id];
  // じめん
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const ch = tileAt(tx, ty), X = px(tx * TS), Y = py(ty * TS), go = gmap.get(tx + ',' + ty);
    if (ch === '~' || ch === '=' || ch === 'p' || go) {
      ctx.setTransform(s, 0, 0, s, X, Y);
      if (go) {
        const p = groundState(go);
        if (go.kind === 'flowerbed') drawFlowerbed(ctx, tx, ty, p);
        else if (go.kind === 'sunbed') drawSunbedTile(ctx, tx, ty, p);
        else if (go.kind === 'pond') drawPondTile(ctx, tx, ty, p, t, S.world.pond === 'full');
        else if (go.kind === 'colorbed') drawColorBedTile(ctx, tx, ty, go.color, p);
      }
      else if (ch === '~') drawWater(ctx, tx, ty, t, isWater);
      else if (ch === '=') { drawWater(ctx, tx, ty, t, isWater); drawBridge(ctx, bridgeAnim, tx === 26 ? 0 : 1); }
      else drawPlank(ctx);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else ctx.drawImage(groundTile(ch === 'g' || ch === 'v' ? ':' : ch === 's' ? '.' : ch, tx, ty, s, isPath), X, Y);
  }
  // もの（したに ある もの ほど まえ）
  const list = [];
  const spr = (img, tx, ty) => () => ctx.drawImage(img, px(tx * TS), py(ty * TS));
  const at = (X, Y, f) => () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); f(); };
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const ch = tileAt(tx, ty);
    if (ch === 'T') list.push([ty * TS + TS, spr(treeSprite(s, (tx * 7 + ty * 3) % 5 === 0 ? 1 : 0), tx, ty - 1)]);
    else if (ch === 'b') list.push([ty * TS + TS - 2, spr(bushSprite(s), tx, ty)]);
    else if (ch === 'r') list.push([ty * TS + TS - 2, spr(rockSprite(s), tx, ty)]);
    else if (ch === 'F') list.push([ty * TS + TS - 4, spr(fenceSprite(s), tx, ty)]);
    else if (ch === 'v' && S.world[vinesKey()] !== 'open') list.push([ty * TS + TS - 2, at(tx * TS, ty * TS, () => drawVines(ctx))]);
    else if (ch === 'h' && tileAt(tx - 1, ty) !== 'h' && tileAt(tx, ty - 1) !== 'h') list.push([(ty + 2) * TS, spr(houseSprite(s), tx, ty - 1)]);
  }
  const near = mode === 'play' ? facing(hero, S) : null;
  const all = things(S);
  for (const o of all) {
    if (o.x + (o.w || 1) < x0 || o.x > x1 || o.y + (o.h || 1) < y0 || o.y > y1) continue;
    const X = o.x * TS, Y = o.y * TS, k = o.ref.kind, bottom = (o.y + (o.h || 1)) * TS;
    if (o.type === 'sign') list.push([Y + TS - 3, at(X, Y, () => drawSign(ctx, o.ref.label || 'ABC'))]);
    else if (o.type === 'chest') list.push([Y + TS - 3, at(X, Y, () => drawChest(ctx, !!S.chests[o.ref.id], t))]);
    else if (k === 'appletree') list.push([Y + TS, spr(appleTreeSprite(s), o.x, o.y - 1)]);
    else if (k === 'well') list.push([Y + TS, spr(wellSprite(s), o.x, o.y - 1)]);
    else if (k === 'hive') list.push([Y + TS - 2, at(X, Y, () => drawHive(ctx, !!S.world.bees))]);
    else if (k === 'gate') list.push([Y + TS - 1, at(X, Y, () => drawGate(ctx, S.world.gate === 'open'))]);
    else if (k === 'lettergate') list.push([Y + TS, at(X, Y, () => drawLetterGate(ctx, CHAPTER[o.ref.area].letters, isOpenGate(o, S), t))]);
    else if (k === 'castlegate') list.push([bottom, at(X, Y, () => drawCastle(ctx, S.world.gate_garden === 'open', t))]);
    else if (k === 'sunstone') list.push([Y + TS - 2, at(X, Y, () => drawSunstone(ctx, t))]);
    else if (k === 'mound') list.push([Y + TS - 2, at(X, Y, () => drawMound(ctx, S.world.mound === 'dug'))]);
    else if (k === 'shed') list.push([bottom, at(X, Y, () => drawShed(ctx, S.world.shed === 'open'))]);
    else if (k === 'keyboard') list.push([Y + TS - 2, at(X, Y, () => drawKeyboard(ctx))]);
    else if (k === 'basketstand') list.push([Y + TS - 2, at(X, Y, () => drawBasketStand(ctx))]);
    else if (k === 'bowl') list.push([Y + TS - 4, at(X, Y, () => drawBowl(ctx, S.world.bowl === 'full'))]);
    else if (k === 'bigtree') list.push([bottom, at(X, Y - TS, () => drawBigTree(ctx, S.world.nest === 'yes', t))]);
    else if (k === 'paint') list.push([Y + TS - 2, at(X, Y, () => drawPaint(ctx, o.ref.color))]);
    else if (o.type === 'npc') {
      const n = o.ref, boss = !!n.boss, hop = hops[n.id] || (boss ? bossHop : 0), bob = hop ? Math.abs(Math.sin(hop * Math.PI * 3)) * -6 : 0;
      list.push([Y + TS - 3, () => {
        ctx.setTransform(s, 0, 0, s, px(X + TS / 2), py(Y + TS - 3 + bob));
        drawCritter(ctx, n.kind, 0, 0, n.letter && !boss ? 'down' : lookAt(o), (t * 0.8 + n.x) % 2 < 0.25 ? 0.5 : 0, { scale: boss ? 1.35 : 1, happy: hop > 0, small: n.small });
      }]);
    }
  }
  // なかまの ミケ（うしろを ついてくる）
  if (S.world.kitten === 'follow' && trail.length) {
    const p = trail[Math.max(0, trail.length - 18)];
    list.push([p.y, () => { ctx.setTransform(s, 0, 0, s, px(p.x), py(p.y)); drawCritter(ctx, 'cat', 0, 0, p.dir, hero.moving ? hero.step : 0, { small: true }); }]);
  }
  list.push([hero.y, () => { ctx.setTransform(s, 0, 0, s, px(hero.x), py(hero.y)); drawCritter(ctx, 'fox', 0, 0, hero.dir, hero.moving ? hero.step : 0, { scarf: S.wear.scarf, hat: S.wear.hat }); }]);
  list.sort((a, b) => a[0] - b[0]).forEach(([, f]) => { f(); ctx.setTransform(1, 0, 0, 1, 0, 0); });
  // ハチ（しまの はなばたけ）
  if (A.id === 'island' && S.world.bees) {
    const fb = OBJ.flowerbed, c = center(fb), arrive = beeAnim;
    for (let i = 0; i < 6; i++) {
      const a = t * (0.9 + i * 0.13) + i * 1.05, rx = fb.w * TS * 0.45, ry = fb.h * TS * 0.38;
      let x = c.x + Math.cos(a) * rx, y = c.y + Math.sin(a * 1.3) * ry - 6;
      if (arrive < 1) { x = x + (1 - arrive) * (600 + i * 40); y = y - (1 - arrive) * 120; }
      ctx.setTransform(s, 0, 0, s, px(x), py(y)); drawBee(ctx, 0, 0, t + i, Math.cos(a) > 0 ? -1 : 1);
    }
    const hv = OBJ.hive; for (let i = 0; i < 2; i++) { ctx.setTransform(s, 0, 0, s, px((hv.x + 0.5) * TS + Math.cos(t * 2 + i * 3) * 12), py(hv.y * TS - 2 + Math.sin(t * 3 + i) * 5)); drawBee(ctx, 0, 0, t + i); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // くらい もり（ひまわりが げんきに なると あかるく なる）
  if (A.id === 'forest') { const k = 1 - (anim.sunbed || 0); if (k > 0) { ctx.fillStyle = `rgba(20,40,70,${0.3 * k})`; ctx.fillRect(0, 0, cv.width, cv.height); } }
  // ふきだし（もじ・！）
  const questT = new Set(activeQuests(S).map(q => currentStep(S, q).target));
  for (const o of all) {
    if (o.type !== 'npc') continue;
    const n = o.ref, X = (o.x + 0.5) * TS, Y = o.y * TS - (n.boss ? 20 : 12);
    let label = null, col = '#fff';
    if (n.letter) label = S.learned.includes(n.letter) ? n.letter : '?';
    if (n.boss && !S.flags.bossCleared) { label = S.learned.length >= 5 ? '!' : '…'; }
    if (n.id === 'rabbit' && !S.flags.intro) label = null;
    if (questT.has(n.id)) { label = '!'; col = '#ffe08a'; }
    if (near === o) { label = label || '!'; col = '#fff3a0'; }
    if (label) bubble(px(X), py(Y + Math.sin(t * 3 + o.x) * 1.5), label, col, s);
  }
  for (const o of all) if (o.type !== 'npc' && (near === o || questT.has(o.ref.id))) { const m = markPos(o); bubble(px(m.x * TS), py(m.y * TS - tallOf(o) + Math.sin(t * 3) * 1.5), '!', near === o ? '#fff3a0' : '#ffe08a', s); }
  if (mode === 'play' || mode === 'event') guideMarks(t, px, py, s, all);
  drawFx(t, s);
}
const tallOf = o => ({ appletree: 34, well: 34, bigtree: 40, castlegate: 22, lettergate: 10, shed: 8 })[o.ref.kind] ?? 6;

let curObj = null;
// めじるしの いち。ちがう エリアの ものは、そちらへ つづく でぐちを さす
function exitToward(areaId) {
  const A = area(), ci = ORDER.indexOf(A.id), ti = ORDER.indexOf(areaId);
  const to = ti > ci ? ORDER[ci + 1] : ORDER[ci - 1];
  return A.exits.find(e => e.to === to);
}
function targetPoints(all) {
  if (!curObj || !curObj.targets.length) return [];
  const A = area(), out = [];
  for (const id of curObj.targets) {
    const ar = id.startsWith('area:') ? id.slice(5) : WHERE[id];
    if (ar && ar !== A.id) { const e = exitToward(ar); if (e) out.push({ x: (e.x + 0.5) * TS, y: (e.y + 0.5) * TS, top: e.y * TS - 6 }); continue; }
    const o = all.find(x => x.ref.id === id); if (!o) continue;
    const m = markPos(o);
    out.push({ x: m.x * TS, y: (o.y + (o.h || 1) / 2) * TS, top: m.y * TS - (o.type === 'npc' ? 34 : tallOf(o) + 8) });
  }
  return out;
}
function guideMarks(t, px, py, s, all) {
  const pts = targetPoints(all);
  if (!pts.length) return;
  const viewW = vw / scale, viewH = vh / scale;
  pts.sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y));
  pts.forEach((p, i) => {
    const sx = p.x - cam.x, sy = p.top - cam.y, onScreen = sx > 0 && sx < viewW && sy > 0 && sy < viewH;
    if (onScreen) {
      ctx.setTransform(s, 0, 0, s, px(p.x), py(p.top + Math.sin(t * 5) * 3));
      ctx.fillStyle = '#ffb020'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-7, -9); ctx.lineTo(7, -9); ctx.lineTo(0, 0); ctx.closePath(); ctx.stroke(); ctx.fill();
    } else if (i === 0) {
      const cx = viewW / 2, cy = viewH / 2, dx = p.x - cam.x - cx, dy = p.y - cam.y - cy, a = Math.atan2(dy, dx);
      const m = 34, k = Math.min((viewW / 2 - m) / Math.abs(dx || 1e-6), (viewH / 2 - m) / Math.abs(dy || 1e-6));
      ctx.setTransform(s, 0, 0, s, Math.round((cx + dx * k) * s), Math.round((cy + dy * k) * s)); ctx.rotate(a);
      const pulse = 1 + Math.sin(t * 6) * 0.08; ctx.scale(pulse, pulse);
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffb020'; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -7); ctx.lineTo(-2, 0); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
    }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function lookAt(o) {
  const dx = hero.x - (o.x + 0.5) * TS, dy = hero.y - (o.y + 1) * TS;
  if (Math.hypot(dx, dy) > TS * 4) return 'down';
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
function bubble(x, y, label, col, s) {
  ctx.setTransform(s, 0, 0, s, x, y);
  ctx.fillStyle = col; ctx.strokeStyle = '#7a5a5a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-8, -26, 16, 16, 5) : ctx.rect(-8, -26, 16, 16); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-3, -10.5); ctx.lineTo(0, -6); ctx.lineTo(3, -10.5); ctx.fill();
  ctx.fillStyle = label === '?' || label === '…' ? '#a08a8a' : '#e0508a'; ctx.font = '800 11px "M PLUS Rounded 1c", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, -17.5);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/* ---------- HUD ---------- */
let lastGoal = '';
function hud() {
  document.getElementById('starN').textContent = S.stars;
  const letters = (CHAPTER[area().id] || CHAPTER.island).letters;
  document.getElementById('slots').innerHTML = letters.map(id => `<i class="${S.learned.includes(id) ? 'got' : ''}">${S.learned.includes(id) ? id : ''}</i>`).join('') + `<em>${S.learned.length}/26</em>`;
  curObj = objective(S);
  const text = curObj ? curObj.text : '';
  if (text !== lastGoal) {
    lastGoal = text; const g = document.getElementById('goal');
    g.innerHTML = text ? `<span>つぎは</span>${text}` : ''; g.classList.toggle('hide', !text);
    g.classList.remove('new'); void g.offsetWidth; if (text) g.classList.add('new');
  }
}
function areaBanner(name) {
  const b = document.getElementById('areaName'); b.textContent = name;
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}

/* ---------- エリアの いどう ---------- */
function placeAt(p) { hero.x = (p.x + 0.5) * TS; hero.y = (p.y + 1) * TS - 4; hero.dir = p.dir || hero.dir; trail = []; }
function initAnims() {
  bridgeAnim = S.flags.bridgeOpen ? 1 : 0; bloomAnim = S.world.flowerbed === 'bloom' ? 1 : 0; beeAnim = S.world.bees ? 1 : 0;
  anim.sunbed = S.world.sunbed === 'sunny' ? 1 : 0; anim.drypond = S.world.pond === 'full' ? 1 : 0;
  anim.redbed = S.world.redbed === 'red' ? 1 : 0; anim.bluebed = S.world.bluebed === 'blue' ? 1 : 0;
}
let moving = false;
async function goArea(id, entry) {
  if (moving) return; moving = true; mode = 'event';
  const f = document.getElementById('fade'); f.classList.add('on'); await wait(320);
  setArea(id); placeAt(AREAS[id].entries[entry]);
  if (!S.areas.includes(id)) S.areas.push(id);
  cam.x = hero.x - vw / scale / 2; cam.y = hero.y - vh / scale / 2;
  persist(); hud(); f.classList.remove('on'); areaBanner(AREAS[id].name); sfx.tap();
  await wait(250); mode = 'play'; moving = false;
}

/* ---------- ループ ---------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = now / 1000;
  if (mode === 'play' && !ui.busy()) {
    const d = input.currentDir();
    hero.moving = false;
    if (d) {
      hero.dir = d;
      hero.moving = move(hero, d, 3.4 * TS * dt, S);
      if (hero.moving) { hero.step = (hero.step + dt * 3.2) % 2; trail.push({ x: hero.x, y: hero.y, dir: hero.dir }); if (trail.length > 40) trail.shift(); }
      saveT += dt;
      if (saveT > 2) { saveT = 0; persist(); }
      const ht = heroTile(hero), e = exitAt(ht.x, ht.y);
      if (e && exitOpen(e, S)) goArea(e.to, e.entry);
    }
  } else hero.moving = false;
  if (bridgeAnim > 0 && bridgeAnim < 1) bridgeAnim = Math.min(1, bridgeAnim + dt * 0.7);
  if (bossHop > 0) bossHop = Math.max(0, bossHop - dt);
  for (const k in hops) { hops[k] = Math.max(0, hops[k] - dt); if (!hops[k]) delete hops[k]; }
  if (S.world.flowerbed === 'bloom' && bloomAnim < 1 && !fx.some(f => f.type === 'rain')) bloomAnim = Math.min(1, bloomAnim + dt * 0.45);
  if (S.world.bees && beeAnim < 1) beeAnim = Math.min(1, beeAnim + dt * 0.5);
  for (const [id, cond] of [['sunbed', S.world.sunbed === 'sunny'], ['drypond', S.world.pond === 'full'], ['redbed', S.world.redbed === 'red'], ['bluebed', S.world.bluebed === 'blue']])
    if (cond && (anim[id] || 0) < 1 && !fx.some(f => f.type === 'rain' || f.type === 'beams')) anim[id] = Math.min(1, (anim[id] || 0) + dt * 0.5);
  const viewW = vw / scale, viewH = vh / scale;
  let tx = hero.x - viewW / 2, ty = hero.y - TS / 2 - viewH / 2;
  if (mode === 'title') { tx = (Math.sin(t * 0.08) * 0.5 + 0.5) * (W() * TS - viewW); ty = 8 * TS - viewH / 2 + Math.sin(t * 0.13) * TS * 2; }
  tx = Math.max(0, Math.min(W() * TS - viewW, tx)); ty = Math.max(0, Math.min(H() * TS - viewH, ty));
  cam.x += (tx - cam.x) * (mode === 'title' ? 1 : Math.min(1, dt * 8)); cam.y += (ty - cam.y) * (mode === 'title' ? 1 : Math.min(1, dt * 8));
  draw(t);
  requestAnimationFrame(frame);
}

function persist() {
  S.hero = { x: hero.x / TS, y: hero.y / TS, dir: hero.dir, area: area().id }; save(S);
  // ★が ふえたら おうちの ⭐にも とどける
  if ((S.stars || 0) > (S.starsSent || 0)) sendStars(S, () => save(S)).then(n => { if (n) toast(`おうちの ⭐に ＋${n} とどいたよ`); });
}
function toast(text) { const e = document.getElementById('toast'); e.textContent = text; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); }
addEventListener('pagehide', () => { if (mode !== 'title' && S.started) persist(); });

/* ---------- イベント ---------- */
const sayH = lines => ui.say(lines, S.wear);
function answerLog(q, ok, first) { const key = q.voice && q.voice.word ? 'w:' + q.target : q.target; S.records[key] = record(getRecord(S, key), ok, first); }
const wordStatus = id => levelOf(S.records['w:' + id]) >= 2 ? 'おぼえた' : 'まほうが つかえる';
const SPEAKER_SAY = n => (n.talk && (!n.talkWhen || S.quests[n.talkWhen.quest] === 'done')) ? n.talk : null;

async function talk(o) {
  mode = 'event';
  try {
    const f = stepFor(S, o.ref.id);
    if (f && await runStep(f.q, f.st, o)) return;
    if (o.type === 'sign') {
      await sayH(o.ref.text.map(x => ['', x]));
      if (o.ref.letters) await ui.letterBoard(o.ref.letters, S.learned);
      await offerReview(o.ref.id);
    } else if (o.type === 'chest') await openChest(o.ref);
    else if (o.ref.kind === 'lettergate' || o.ref.kind === 'castlegate') await letterGate(o.ref);
    else if (o.type === 'obj') await examine(o.ref);
    else if (o.ref.boss) await bossEvent();
    else if (o.ref.letter && !S.learned.includes(o.ref.letter)) await teacher(o.ref);
    else if (SPEAKER_SAY(o.ref)) { await sayH(SPEAKER_SAY(o.ref)); await offerReview(o.ref.id); }
    else if (o.ref.letter) await teacher(o.ref);
    else if (o.ref.id === 'rabbit') await sayH(!S.flags.bossCleared ? STORY.rabbitAgain(5 - ['A', 'B', 'C', 'D', 'E'].filter(l => S.learned.includes(l)).length) : STORY.rabbitFree);
    else if (o.ref.id === 'mouse') await sayH([['チュチュ', S.world.bees ? 'ハチさん かわいいね！ ぶんぶん！' : S.world.flowerbed === 'bloom' ? 'おはな きれい！ ありがとう！' : 'おはなが かれちゃって かなしいな……']]);
    else await sayH([[o.ref.name, 'こんにちは！']]);
  } finally { persist(); hud(); if (mode === 'event') mode = 'play'; }
}

async function examine(ob) {
  const d = Array.isArray(ob.desc) ? ob.desc : (ob.desc || {})[ob.state ? ob.state(S.world) : ''];
  if (ob.kind === 'gate' && S.world.gate === 'open') await sayH([['', 'もんは ひらいているよ。']]);
  else if (d) await sayH(d);
  await offerReview(ob.id);
}
// おぼえた ことばの ばしょでは おさらいが できる（えらべる）
async function offerReview(placeId) {
  const ws = WORDS.filter(x => x.learnAt === placeId && S.words[x.id]);
  if (!ws.length) return;
  const w = ws[Math.floor(Math.random() * ws.length)];
  if (!(await ui.confirm(`「${w.word}」の おさらい クイズを する？`, 'する', 'しない'))) return;
  const kind = ['picWord', 'wordPic', 'listenPic'][Math.floor(Math.random() * 3)];
  await ui.quiz([wordQuestion(w.id, kind, levelOf(S.records['w:' + w.id]) >= 2 ? 4 : 3)], { title: 'ことばの おさらい', onAnswer: answerLog });
}

async function runStep(q, st, o) {
  if (st.on === 'talk') { await sayH(st.lines); await finishStep(q, st); return true; }
  if (st.on === 'learn') {
    if (st.pre) await sayH(st.pre);
    await learnWord(st.word);
    await finishStep(q, st); return true;
  }
  if (st.on === 'deliver' || st.on === 'use') {
    if (!(S.inv[st.item] > 0)) {
      if (st.on === 'deliver') await sayH([[o.ref.name, `${INV[st.item].name}を もってきてね！`]]);
      else await examine(o.ref);
      return true;
    }
    await sayH(st.lines);
    if (st.take) S.inv[st.item] -= 1;
    await finishStep(q, st); return true;
  }
  if (st.on === 'spell') { await castAt(o, q, st); return true; }
  return false;
}
async function finishStep(q, st) {
  if (st.effect) {
    applyEffects(st.effect, S);
    if (st.fx === 'gate') { sfx.unlock(); await playFx('burst', 0.9, { c: center(OBJ.gate) }); }
  }
  const fin = advance(S, q); persist(); hud();
  const r = st.reward || {};
  if (r.item) { S.inv[r.item] = (S.inv[r.item] || 0) + 1; sfx.chest(); await ui.notice(`${INV[r.item].name}を もらった！`, 'メニューの「もちもの」で みられるよ。', wordArt(INV[r.item].art, 110)); }
  if (r.star) { S.stars += r.star; persist(); await ui.starFly(r.star, hud); }
  if (fin) { sfx.unlock(); await ui.notice('クエスト クリア！', `「${q.title}」を クリアしたよ！`); }
  persist(); hud();
}

async function learnWord(id) {
  await ui.teachWord(id);
  await ui.quiz([wordQuestion(id, 'listenPic', 3)], { title: `${WORD[id].word} の クイズ`, onAnswer: answerLog });
  if (!S.words[id]) S.words[id] = { at: Date.now() };
  persist();
  await ui.wordCard(id, wordStatus(id));
}

// まほうの えんしゅつ（fx の なまえ ごと）
const FX = {
  harvest: async (o) => { sfx.star(); await playFx('apple', 0.9, { a: { x: center(o).x, y: o.y * TS - 20 }, b: { x: hero.x, y: hero.y - 16 } }); },
  'rain-bloom': async (o, sp) => {
    bloomAnim = 0; applyEffects(sp.effect.filter(e => e.set && e.set[0] === 'flowerbed'), S);
    await playFx('rain', 1.8, { rect: OBJ.flowerbed }); sfx.star(); await wait(2300);
    sfx.unlock(); await playFx('burst', 0.9, { c: { x: 49.5 * TS, y: 11 * TS } }); hops.mouse = 1.5;
  },
  bees: async () => { beeAnim = 0; S.world.bees = true; sfx.star(); await wait(2200); hops.mouse = 1.5; },
  honey: async (o) => { sfx.chest(); await playFx('burst', 0.9, { c: center(o) }); await playFx('apple', 0.8, { art: 'honey', a: { x: center(o).x, y: o.y * TS }, b: { x: hero.x, y: hero.y - 16 } }); },
  sun: async (o) => { anim.sunbed = 0; S.world.sunbed = 'sunny'; sfx.star(); await playFx('beams', 2.0, { rect: o }); await wait(1800); hops.hippo = 1.5; },
  dig: async (o) => { sfx.bump(); await playFx('dirt', 0.8, { c: center(o) }); sfx.bump(); await playFx('dirt', 0.8, { c: center(o) }); S.world.mound = 'dug'; sfx.unlock(); await playFx('burst', 0.9, { c: { x: 38.5 * TS, y: 10.5 * TS } }); hops.puppy = 1.5; },
  door: async (o) => { sfx.unlock(); await playFx('burst', 1.0, { c: center(o) }); },
  basket: async (o) => { for (let i = 0; i < 3; i++) { sfx.tap(); await playFx('apple', 0.45, { a: { x: center(o).x + (i - 1) * 10, y: o.y * TS - 20 }, b: { x: hero.x, y: hero.y - 16 } }); } },
  milk: async (o) => { sfx.star(); await playFx('splash', 0.9, { c: center(o), col: '#ffffff' }); hops.kitten = 1.5; await wait(900); },
  pond: async (o) => { anim.drypond = 0; S.world.pond = 'full'; await playFx('rain', 1.6, { rect: o }); sfx.star(); await wait(1800); hops.turtle = 1.5; },
  nest: async (o) => { const b = OBJ.bird; sfx.star(); await playFx('fly', 1.4, { a: { x: (b.x + 0.5) * TS, y: b.y * TS }, b: { x: (o.x + 1.4) * TS, y: (o.y - 0.2) * TS } }); S.world.nest = 'yes'; await playFx('burst', 0.7, { c: { x: (o.x + 1.4) * TS, y: o.y * TS } }); },
  paint: async (o) => { anim[o.id] = 0; sfx.star(); await playFx('splash', 1.0, { c: center(o), col: o.color === 'red' ? '#ff4f5e' : '#4f8fff' }); S.world[o.id] = o.color; await wait(1800); },
};
async function castAt(o, q, st) {
  let fails = 0, hinted = false;
  const sel = await ui.magic(S, {
    title: st.prompt || 'ことばを くみあわせよう！', levelOf,
    check: s => { const r = tryCast(s, o.ref.id, S); if (!r.ok) fails++; return r; },
    hint: () => { hinted = true; return hintFor(o.ref.id, S); },
  });
  if (!sel) return;
  const sp = tryCast(sel, o.ref.id, S).spell;
  sel.forEach(id => { S.records['w:' + id] = record(getRecord(S, 'w:' + id), true, fails === 0 && !hinted); });
  if (sel.length > 1 && !S.combos.includes(comboKey(sel))) S.combos.push(comboKey(sel));
  await playFx('sparks', 1.1, { a: { x: hero.x, y: hero.y - 20 }, b: center(o) });
  if (FX[sp.fx]) await FX[sp.fx](o.ref, sp);
  applyEffects(sp.effect, S); persist(); hud();
  await sayH([['', sp.text]]);
  for (const e of sp.effect) if (e.give) await ui.notice(`${INV[e.give].name}を てに いれた！`, 'メニューの「もちもの」に はいったよ。', wordArt(INV[e.give].art, 110));
  await finishStep(q, st);
}

// もじを おしえる どうぶつ
async function teacher(n) {
  const id = n.letter, ch = CHAPTER[area().id] || CHAPTER.island;
  const pool = [...new Set([...ch.letters, ...S.learned])];
  if (!S.learned.includes(id)) {
    await sayH(STORY.teacherHello(n));
    await ui.teach(id);
    await ui.quiz([letterQuestion(id, pool, 'find', 3)], { title: `${n.name}の クイズ`, onAnswer: answerLog });
    S.learned.push(id); S.stars += 1; persist();
    await ui.starFly(1, hud);
    await sayH(STORY.teacherDone(n, id));
    if (ch.letters.every(l => S.learned.includes(l))) {
      if (ch.area === 'island') await ui.notice('ほしが 5こ あつまった！', 'もじを ぜんぶ おぼえたね！<br>はしの まえの ドラコに あいに いこう。');
      else await ui.notice(`${ch.letters.join('・')} を ぜんぶ おぼえた！`, 'こまっている どうぶつを ことばの まほうで たすけよう！ うえの「つぎは」を みてね。');
    }
  } else {
    await sayH(STORY.teacherReview(n));
    const [target] = pickTargets(S.learned, S.records, 1);
    const kind = Math.random() < 0.5 ? 'find' : 'listen';
    await ui.quiz([letterQuestion(target, pool, kind, choiceCount(S.records[target]))], { title: 'おさらい', onAnswer: answerLog });
    await sayH([[n.name, 'よく できました！']]);
  }
}

// もじの もん・おしろの もん（エリアの さいごの おさらい）
async function letterGate(ob) {
  const ch = CHAPTER[ob.area], key = 'gate_' + ob.area;
  if (S.world[key] === 'open') return sayH([['', ob.final ? 'おしろの もんは ひらいているよ。' : 'もじの もんは ひらいているよ。']]);
  const left = ch.letters.filter(l => !S.learned.includes(l));
  if (left.length) return sayH([['', `${ob.name}だ。${ch.letters.join('・')} の もじが きざまれている。`], ['', `あと ${left.join('・')} を おぼえたら おさらい できるよ。`]]);
  const ql = ch.quests.filter(id => S.quests[id] !== 'done');
  if (ql.length) return sayH([['', `${ob.name}だ。`], ['', `まだ こまっている どうぶつが いるみたい。「${QUEST[ql[0]].title}」を たすけてから きてね。`]]);
  await sayH(ob.final
    ? [['', 'おしろの もんに A から Z までの もじが ひかっている！'], ['', 'さいごの おさらい！ ぜんぶの もじから 6もん こたえよう！']]
    : [['', 'もじの もんが ひかっている！'], ['', `${ch.letters.join('・')} の おさらい クイズに こたえると、もんが ひらくよ！`]]);
  const ids = ob.final ? pickTargets(ALL_LETTERS, S.records, 6) : shuffle(ch.letters).slice(0, 5);
  const pool = ob.final ? ALL_LETTERS : ch.letters;
  await ui.quiz(ids.map((id, i) => letterQuestion(id, pool, i % 2 ? 'listen' : 'find', 4)), { title: ob.final ? 'さいごの おさらい' : 'もじの もんの おさらい', onAnswer: answerLog });
  S.world[key] = 'open'; sfx.unlock(); persist();
  await playFx('burst', 1.0, { c: center(ob) });
  S.stars += 3; persist(); await ui.starFly(3, hud);
  if (ob.final) {
    S.flags.alphabetClear = true; S.clears = (S.clears || 0) + 1; persist(); hud();
    const r = await ui.ending(STORY.ending, S);
    if (r === 'title') toTitle();
    else if (r === 'replay') { mode = 'title'; setTimeout(() => startGame(true, true), 50); }
  } else await ui.notice('もんが ひらいた！', `つぎは「${AREAS[ch.next].name}」へ いこう！`);
}

async function openChest(c) {
  if (S.chests[c.id]) return sayH(STORY.chestOpened);
  if (S.learned.length < 2) return sayH(STORY.chestLocked);
  await sayH(STORY.chestStart);
  const targets = pickTargets(S.learned, S.records, c.questions);
  const qs = targets.map((id, i) => letterQuestion(id, S.learned, i % 2 ? 'listen' : 'find', choiceCount(S.records[id])));
  await ui.quiz(qs, { title: 'たからばこ クイズ', onAnswer: answerLog });
  S.chests[c.id] = true; sfx.chest();
  const had = S.items.includes(c.item);
  S.stars += 1; if (!had) S.items.push(c.item); S.wear[c.item] = true; persist();
  await ui.starFly(1, hud);
  if (had) await ui.notice('ほしを みつけた！', `${ITEMS[c.item].name}は もう もっているよ。`);
  else await ui.notice(`${ITEMS[c.item].name} を てに いれた！`, 'さっそく つけてみたよ。メニューの「もちもの」で はずせるよ。', ui.heroPic(S.wear));
}

async function bossEvent() {
  const L = ['A', 'B', 'C', 'D', 'E'];
  if (S.flags.bossCleared) return sayH(STORY.bossAfter);
  const missing = L.filter(id => !S.learned.includes(id));
  if (missing.length) return sayH(STORY.bossLocked(missing));
  await sayH(STORY.bossStart);
  const qs = shuffle(L).map((id, i) => letterQuestion(id, L, i % 2 ? 'listen' : 'find', 4));
  await ui.quiz(qs, { title: 'ドラコの おさらい クイズ', onAnswer: answerLog });
  await sayH(STORY.bossClear);
  S.flags.bossCleared = true; S.flags.bridgeOpen = true; bossHop = 1.2; bridgeAnim = 0.001; sfx.unlock(); persist();
  await wait(1700);
  S.stars += 3; persist();
  await ui.starFly(3, hud);
  await ui.notice('はしが なおった！', 'でも むこうの もんには かぎが かかっている みたい。ラビに はなしかけてみよう！');
}

/* ---------- タイトル ---------- */
const titleEl = document.getElementById('title');
function toTitle() {
  if (mode !== 'title' && S.started) persist(); // きどう ちょくごは まだ いちが きまって いないので ほぞん しない
  mode = 'title';
  titleEl.classList.remove('hide');
  document.getElementById('cont').style.display = S.started ? '' : 'none';
  document.getElementById('start').textContent = S.clears ? 'もういちど ぼうけん' : 'はじめから';
  const cb = document.getElementById('clears'); cb.textContent = S.clears ? `🏆 クリア ${S.clears}かい` : ''; cb.style.display = S.clears ? '' : 'none';
  document.getElementById('housePts').textContent = housePoints();
  document.body.classList.add('intitle');
}
async function startGame(fresh, skipAsk = false) {
  unlockAudio();
  if (fresh && S.started && !skipAsk && !(await ui.confirm('さいしょから ぼうけん する？<br><small>おぼえた もじの きろく・ほし・きがえは のこるよ</small>', 'はじめる', 'やめる'))) return;
  if (fresh) S = replayState(S);
  titleEl.classList.add('hide'); document.body.classList.remove('intitle');
  S.started = true;
  const useStart = fresh || !S.hero.x;
  setArea(useStart ? 'island' : (S.hero.area || 'island'));
  if (useStart) placeAt(START); else { hero.x = S.hero.x * TS; hero.y = S.hero.y * TS; hero.dir = S.hero.dir || 'down'; trail = []; }
  // まえの ばんの セーブ：もんの むこうに いたら、もんの てまえに もどす
  if (area().id === 'island' && heroTile(hero).x >= 28 && S.world.gate !== 'open') placeAt({ x: 24, y: 11, dir: 'right' });
  if (!S.areas.includes(area().id)) S.areas.push(area().id);
  initAnims();
  cam.x = hero.x - vw / scale / 2; cam.y = hero.y - vh / scale / 2;
  lastGoal = null; hud(); persist();
  mode = 'event';
  if (!S.flags.intro) {
    await wait(500);
    await sayH(STORY.intro);
    S.flags.intro = true; persist(); hud();
  } else areaBanner(area().name);
  mode = 'play';
}
document.getElementById('start').onclick = () => { sfx.tap(); startGame(true); };
document.getElementById('cont').onclick = () => { sfx.tap(); startGame(false); };

/* ---------- そうさ ---------- */
input.bindPad(document.getElementById('pad'));
input.bindButton(document.getElementById('act'), 'action');
document.getElementById('menuBtn').addEventListener('pointerdown', e => { e.preventDefault(); openMenu(); });
input.on('any', unlockAudio);
input.on('action', () => {
  if (mode !== 'play' || ui.busy()) return;
  const o = facing(hero, S);
  if (o) { if (o.type === 'npc') hero.dir = turnTo(o); talk(o); }
});
input.on('menu', () => { if (ui.closeByMenuKey()) return; openMenu(); });
function turnTo(o) { const dx = (o.x + 0.5) * TS - hero.x, dy = (o.y + 1) * TS - hero.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
async function openMenu() {
  if (mode !== 'play' || ui.busy()) return;
  mode = 'event'; sfx.tap();
  await ui.menu(S, {
    ids: ALL_LETTERS, levelOf, itemsInfo: ITEMS, invInfo: INV,
    onSettings: () => { setAudioSettings(S.settings); persist(); },
    onWear: k => { S.wear[k] = !S.wear[k]; persist(); },
    onTitle: () => toTitle(),
    onHome: () => { persist(); location.href = '../index.html'; },
  });
  if (mode === 'event') mode = 'play';
}

setAudioSettings(S.settings);
toTitle();
requestAnimationFrame(frame);

// うごきの かくにん よう（テストで つかう）
window.__abc = { get S() { return S; }, get hero() { return hero; }, get mode() { return mode; }, set S(v) { S = v; }, talk, facing: () => facing(hero, S), objective: () => objective(S), SPELLS,
  area: () => area().id, goArea, step: () => { const q = activeQuests(S)[0]; return q ? { quest: q.id, ...currentStep(S, q) } : null; }, steps: () => activeQuests(S).map(q => q.id + ':' + currentStep(S, q).id),
  where: id => WHERE[id], stepFor: id => { const f = stepFor(S, id); return f ? { quest: f.q.id, ...f.st } : null; },
  // あいての となりの あいている マスへ いどうして、そちらを むく
  approach: id => {
    const o = things(S).find(x => x.ref.id === id); if (!o) return false;
    const cands = [];
    for (let y = o.y - 1; y <= o.y + (o.h || 1); y++) for (let x = o.x - 1; x <= o.x + (o.w || 1); x++) {
      if (inside(o, x, y) || solidAt(x, y, S)) continue;
      const dir = y < o.y ? 'down' : y >= o.y + (o.h || 1) ? 'up' : x < o.x ? 'right' : 'left';
      if ((x < o.x || x >= o.x + (o.w || 1)) && (y < o.y || y >= o.y + (o.h || 1))) continue;
      cands.push({ x, y, dir });
    }
    const c = cands[0]; if (!c) return false;
    hero.x = (c.x + 0.5) * TS; hero.y = (c.y + 1) * TS - 4; hero.dir = c.dir; return true;
  },
  tp: (x, y, dir = 'down') => { hero.x = (x + 0.5) * TS; hero.y = (y + 1) * TS - 4; hero.dir = dir; trail = []; } };

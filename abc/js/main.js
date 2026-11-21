// ABCぼうけん：ゲームの すすみかた（ループ・えがく・イベント）
import { TS, groundTile, drawWater, drawBridge, drawPlank, treeSprite, bushSprite, rockSprite, fenceSprite, houseSprite, drawSign, drawChest, drawCritter, starPath,
  appleTreeSprite, wellSprite, drawHive, drawGate, drawVines, drawFlowerbed, drawBee, WORD_ART, wordArt } from './engine/art.js';
import * as input from './engine/input.js';
import { unlockAudio, setAudioSettings, sfx } from './engine/audio.js';
import { WORLD1_LETTERS } from './data/letters.js';
import { WORD, WORDS } from './data/words.js';
import { SPELLS } from './data/combos.js';
import { START, CHESTS, GOAL, ITEMS, INV, STORY, OBJECTS } from './data/world1.js';
import { W, H, tileAt, isWater, isPath, things, move, facing, heroTile, markPos } from './game/world.js';
import { load, save, defaultState, getRecord } from './game/state.js';
import { record, pickTargets, choiceCount, levelOf } from './game/learning.js';
import { letterQuestion, wordQuestion, shuffle } from './game/quiz.js';
import { activeQuest, currentStep, advance, objective } from './game/quests.js';
import { tryCast, hintFor, applyEffects, comboKey } from './game/magic.js';
import * as ui from './ui/ui.js';

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let S = load();
let mode = 'title';            // title / play / event
let hero = { x: 0, y: 0, dir: 'down', step: 0, moving: false };
let cam = { x: 0, y: 0 }, scale = 2, dpr = 1, vw = 0, vh = 0;
let bridgeAnim = S.flags.bridgeOpen ? 1 : 0, bossHop = 0, saveT = 0;
let bloomAnim = 0, beeAnim = 0, fx = [], hops = {};
const OBJ = Object.fromEntries(OBJECTS.map(o => [o.id, o]));

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
function drawFx(t, px, py, s) {
  fx = fx.filter(f => {
    const k = (t - f.t0) / f.dur;
    if (k >= 1) { f.res(); return false; }
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const X = v => (v - cam.x), Y = v => (v - cam.y);
    if (f.type === 'sparks') { // しゅじんこう → ばしょ へ ひかりの つぶ
      for (let i = 0; i < 18; i++) {
        const q = Math.max(0, Math.min(1, k * 1.4 - i * 0.025)), a = f.data.a, b = f.data.b;
        const mx = (a.x + b.x) / 2 + Math.sin(i * 2.1) * 40, my = Math.min(a.y, b.y) - 50 - (i % 3) * 10;
        const x = (1 - q) ** 2 * a.x + 2 * (1 - q) * q * mx + q * q * b.x, y = (1 - q) ** 2 * a.y + 2 * (1 - q) * q * my + q * q * b.y;
        ctx.globalAlpha = q < 1 ? 1 : 0; ctx.fillStyle = ['#fff6a0', '#ffd0e8', '#bfe8ff'][i % 3];
        starPath(ctx, X(x), Y(y), 4, 1.7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (f.type === 'rain') { // はなばたけに あめ
      const r = f.data.rect; ctx.strokeStyle = 'rgba(120,190,255,.85)'; ctx.lineWidth = 1.6;
      for (let i = 0; i < 60; i++) {
        const x = r.x * TS + ((i * 37) % (r.w * TS)), y = r.y * TS - 20 + (((t * 260) + i * 53) % (r.h * TS + 20));
        ctx.beginPath(); ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(x) - 2, Y(y) + 7); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(170,210,255,.25)'; ctx.beginPath(); ctx.ellipse(X((r.x + r.w / 2) * TS), Y((r.y - 0.6) * TS), r.w * TS * 0.6, 16, 0, 0, 7); ctx.fill();
    }
    if (f.type === 'apple') { // りんごが おちてくる
      const a = f.data.a, b = f.data.b, x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 30;
      ctx.save(); ctx.translate(X(x) - 7, Y(y) - 7); ctx.scale(0.14, 0.14); WORD_ART.apple(ctx); ctx.restore();
    }
    if (f.type === 'burst') { // きらきら
      const c = f.data.c;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 6 + k * 30; ctx.globalAlpha = 1 - k; ctx.fillStyle = i % 2 ? '#fff6a0' : '#ffb6d6'; starPath(ctx, X(c.x) + Math.cos(a) * d, Y(c.y) + Math.sin(a) * d, 4, 1.6); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    return true;
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/* ---------- えがく ---------- */
function draw(t) {
  const s = scale * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#3f8f4a'; ctx.fillRect(0, 0, cv.width, cv.height);
  const viewW = vw / scale, viewH = vh / scale;
  const x0 = Math.floor(cam.x / TS) - 1, y0 = Math.floor(cam.y / TS) - 2, x1 = Math.ceil((cam.x + viewW) / TS) + 1, y1 = Math.ceil((cam.y + viewH) / TS) + 2;
  const px = v => Math.round((v - cam.x) * s), py = v => Math.round((v - cam.y) * s);
  const bloomP = S.world.flowerbed === 'bloom' ? bloomAnim : 0;
  // じめん
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const ch = tileAt(tx, ty), X = px(tx * TS), Y = py(ty * TS);
    if (ch === '~' || ch === '=' || ch === 'p' || ch === 'f') {
      ctx.setTransform(s, 0, 0, s, X, Y);
      if (ch === '~') drawWater(ctx, tx, ty, t, isWater);
      else if (ch === '=') { drawWater(ctx, tx, ty, t, isWater); drawBridge(ctx, bridgeAnim, tx === 26 ? 0 : 1); }
      else if (ch === 'f') drawFlowerbed(ctx, tx, ty, bloomP);
      else drawPlank(ctx);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else ctx.drawImage(groundTile(ch === 'g' || ch === 'v' ? ':' : ch, tx, ty, s, isPath), X, Y);
  }
  // もの（したに ある もの ほど まえ）
  const list = [];
  const spr = (img, tx, ty) => () => ctx.drawImage(img, px(tx * TS), py(ty * TS));
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const ch = tileAt(tx, ty);
    if (ch === 'T') list.push([ty * TS + TS, spr(treeSprite(s, (tx * 7 + ty * 3) % 5 === 0 ? 1 : 0), tx, ty - 1)]);
    else if (ch === 'b') list.push([ty * TS + TS - 2, spr(bushSprite(s), tx, ty)]);
    else if (ch === 'r') list.push([ty * TS + TS - 2, spr(rockSprite(s), tx, ty)]);
    else if (ch === 'F') list.push([ty * TS + TS - 4, spr(fenceSprite(s), tx, ty)]);
    else if (ch === 'v' && S.world.vines !== 'open') list.push([ty * TS + TS - 2, () => { ctx.setTransform(s, 0, 0, s, px(tx * TS), py(ty * TS)); drawVines(ctx); }]);
    else if (ch === 'h' && tileAt(tx - 1, ty) !== 'h' && tileAt(tx, ty - 1) !== 'h') list.push([(ty + 2) * TS, spr(houseSprite(s), tx, ty - 1)]);
  }
  const near = mode === 'play' ? facing(hero, S) : null;
  const all = things(S);
  for (const o of all) {
    if (o.x + (o.w || 1) < x0 || o.x > x1 || o.y + (o.h || 1) < y0 || o.y > y1) continue;
    const X = o.x * TS, Y = o.y * TS, k = o.ref.kind;
    if (o.type === 'sign') list.push([Y + TS - 3, () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); drawSign(ctx, o.ref.label || 'ABC'); }]);
    else if (o.type === 'chest') list.push([Y + TS - 3, () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); drawChest(ctx, !!S.chests[o.ref.id], t); }]);
    else if (k === 'appletree') list.push([Y + TS, spr(appleTreeSprite(s), o.x, o.y - 1)]);
    else if (k === 'well') list.push([Y + TS, spr(wellSprite(s), o.x, o.y - 1)]);
    else if (k === 'hive') list.push([Y + TS - 2, () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); drawHive(ctx, !!S.world.bees); }]);
    else if (k === 'gate') list.push([Y + TS - 1, () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); drawGate(ctx, S.world.gate === 'open'); }]);
    else if (o.type === 'npc') {
      const n = o.ref, boss = !!n.boss, hop = hops[n.id] || (boss ? bossHop : 0), bob = hop ? Math.abs(Math.sin(hop * Math.PI * 3)) * -6 : 0;
      list.push([Y + TS - 3, () => {
        ctx.setTransform(s, 0, 0, s, px(X + TS / 2), py(Y + TS - 3 + bob));
        const look = n.id === 'rabbit' || boss || n.id === 'mouse' ? lookAt(o) : 'down';
        drawCritter(ctx, n.kind, 0, 0, look, (t * 0.8 + n.x) % 2 < 0.25 ? 0.5 : 0, { scale: boss ? 1.35 : 1, happy: hop > 0 });
      }]);
    }
  }
  list.push([hero.y, () => { ctx.setTransform(s, 0, 0, s, px(hero.x), py(hero.y)); drawCritter(ctx, 'fox', 0, 0, hero.dir, hero.moving ? hero.step : 0, { scarf: S.wear.scarf, hat: S.wear.hat }); }]);
  list.sort((a, b) => a[0] - b[0]).forEach(([, f]) => { f(); ctx.setTransform(1, 0, 0, 1, 0, 0); });
  // ハチ（はなばたけの まわりを とぶ）
  if (S.world.bees) {
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
  // ふきだし（もじ・！）
  for (const o of all) {
    if (o.type !== 'npc') continue;
    const n = o.ref, X = (o.x + 0.5) * TS, Y = o.y * TS - (n.boss ? 20 : 12);
    let label = null, col = '#fff';
    if (n.letter) label = S.learned.includes(n.letter) ? n.letter : '?';
    if (n.boss && !S.flags.bossCleared) { label = S.learned.length >= WORLD1_LETTERS.length ? '!' : '…'; }
    if (n.id === 'rabbit' && !S.flags.intro) label = null;
    if (near === o) { label = label || '!'; col = '#fff3a0'; }
    if (label) bubble(px(X), py(Y + Math.sin(t * 3 + o.x) * 1.5), label, col, s);
  }
  for (const o of all) if (near === o && o.type !== 'npc') { const m = markPos(o); bubble(px(m.x * TS), py(m.y * TS - (o.ref.kind === 'appletree' || o.ref.kind === 'well' ? 34 : 6) + Math.sin(t * 3) * 1.5), '!', '#fff3a0', s); }
  // もくてきちの めじるし（▼）と、がめんの そとなら やじるし
  if (mode === 'play' || mode === 'event') guideMarks(t, px, py, s, all);
  drawFx(t, px, py, s);
}
let curObj = null;
function targetPoints(all) {
  if (!curObj || !curObj.targets.length) return [];
  return curObj.targets.map(id => {
    if (id === 'goal') return { x: (GOAL.x + 0.5) * TS, y: GOAL.y * TS, top: GOAL.y * TS - 8 };
    const o = all.find(x => x.ref.id === id); if (!o) return null;
    const m = markPos(o), tall = o.ref.kind === 'appletree' || o.ref.kind === 'well';
    return { x: m.x * TS, y: (o.y + (o.h || 1) / 2) * TS, top: m.y * TS - (o.type === 'npc' ? 34 : tall ? 46 : 14) };
  }).filter(Boolean);
}
function guideMarks(t, px, py, s, all) {
  const pts = targetPoints(all);
  if (!pts.length) return;
  const viewW = vw / scale, viewH = vh / scale;
  // いちばん ちかい もくてきち
  pts.sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y));
  pts.forEach((p, i) => {
    const sx = p.x - cam.x, sy = p.top - cam.y, onScreen = sx > 0 && sx < viewW && sy > 0 && sy < viewH;
    if (onScreen) {
      ctx.setTransform(s, 0, 0, s, px(p.x), py(p.top + Math.sin(t * 5) * 3));
      ctx.fillStyle = '#ffb020'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-7, -9); ctx.lineTo(7, -9); ctx.lineTo(0, 0); ctx.closePath(); ctx.stroke(); ctx.fill();
    } else if (i === 0) {
      // がめんの はしに やじるし
      const cx = viewW / 2, cy = viewH / 2, dx = p.x - cam.x - cx, dy = p.y - cam.y - cy, a = Math.atan2(dy, dx);
      const m = 34, k = Math.min((viewW / 2 - m) / Math.abs(dx || 1e-6), (viewH / 2 - m) / Math.abs(dy || 1e-6));
      const ax = cx + dx * k, ay = cy + dy * k;
      ctx.setTransform(s, 0, 0, s, Math.round(ax * s), Math.round(ay * s)); ctx.rotate(a);
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
  document.getElementById('slots').innerHTML = WORLD1_LETTERS.map(id => `<i class="${S.learned.includes(id) ? 'got' : ''}">${S.learned.includes(id) ? id : ''}</i>`).join('');
  curObj = objective(S);
  const text = curObj ? curObj.text : '';
  if (text !== lastGoal) {
    lastGoal = text; const g = document.getElementById('goal');
    g.innerHTML = text ? `<span>つぎは</span>${text}` : ''; g.classList.toggle('hide', !text);
    g.classList.remove('new'); void g.offsetWidth; if (text) g.classList.add('new');
  }
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
      if (hero.moving) hero.step = (hero.step + dt * 3.2) % 2;
      saveT += dt;
      if (saveT > 2) { saveT = 0; persist(); }
    }
    checkGoal();
  } else hero.moving = false;
  if (bridgeAnim > 0 && bridgeAnim < 1) bridgeAnim = Math.min(1, bridgeAnim + dt * 0.7);
  if (bossHop > 0) bossHop = Math.max(0, bossHop - dt);
  for (const k in hops) { hops[k] = Math.max(0, hops[k] - dt); if (!hops[k]) delete hops[k]; }
  if (S.world.flowerbed === 'bloom' && bloomAnim < 1 && !fx.some(f => f.type === 'rain')) bloomAnim = Math.min(1, bloomAnim + dt * 0.45);
  if (S.world.bees && beeAnim < 1) beeAnim = Math.min(1, beeAnim + dt * 0.5);
  const viewW = vw / scale, viewH = vh / scale;
  let tx = hero.x - viewW / 2, ty = hero.y - TS / 2 - viewH / 2;
  if (mode === 'title') { tx = (Math.sin(t * 0.08) * 0.5 + 0.5) * (W * TS - viewW); ty = 8 * TS - viewH / 2 + Math.sin(t * 0.13) * TS * 2; }
  tx = Math.max(0, Math.min(W * TS - viewW, tx)); ty = Math.max(0, Math.min(H * TS - viewH, ty));
  cam.x += (tx - cam.x) * (mode === 'title' ? 1 : Math.min(1, dt * 8)); cam.y += (ty - cam.y) * (mode === 'title' ? 1 : Math.min(1, dt * 8));
  draw(t);
  requestAnimationFrame(frame);
}

function persist() { S.hero = { x: hero.x / TS, y: hero.y / TS, dir: hero.dir }; save(S); }

/* ---------- イベント ---------- */
const sayH = lines => ui.say(lines, S.wear);
function answerLog(q, ok, first) { const key = q.voice && q.voice.word ? 'w:' + q.target : q.target; S.records[key] = record(getRecord(S, key), ok, first); }
const wordStatus = id => levelOf(S.records['w:' + id]) >= 2 ? 'おぼえた' : 'まほうが つかえる';

async function talk(o) {
  mode = 'event';
  try {
    const q = activeQuest(S), st = currentStep(S, q);
    if (st && st.target === o.ref.id && await runStep(q, st, o)) return;
    if (o.type === 'sign') {
      await sayH(o.ref.text.map(x => ['', x]));
      if (o.ref.letters) await ui.letterBoard(o.ref.letters, S.learned);
      await offerReview(o.ref.id);
    } else if (o.type === 'chest') await openChest(o.ref);
    else if (o.type === 'obj') await examine(o.ref);
    else if (o.ref.boss) await bossEvent();
    else if (o.ref.letter) await teacher(o.ref);
    else if (o.ref.id === 'rabbit') await sayH(!S.flags.bossCleared ? STORY.rabbitAgain(WORLD1_LETTERS.length - S.learned.length) : STORY.rabbitFree);
    else if (o.ref.id === 'mouse') await sayH([['チュチュ', S.world.bees ? 'ハチさん かわいいね！ ぶんぶん！' : S.world.flowerbed === 'bloom' ? 'おはな きれい！ ありがとう！' : 'おはなが かれちゃって かなしいな……']]);
  } finally { persist(); hud(); mode = 'play'; }
}

// しらべる（もの）
async function examine(ob) {
  const d = Array.isArray(ob.desc) ? ob.desc : (ob.desc || {})[ob.state ? ob.state(S.world) : ''];
  if (ob.kind === 'gate' && S.world.gate === 'open') await sayH([['', 'もんは ひらいているよ。']]);
  else if (d) await sayH(d);
  await offerReview(ob.id);
}
// おぼえた ことばの ばしょでは おさらいが できる（えらべる）
async function offerReview(placeId) {
  const w = WORDS.find(x => x.learnAt === placeId && S.words[x.id]);
  if (!w) return;
  if (!(await ui.confirm(`「${w.word}」の おさらい クイズを する？`, 'する', 'しない'))) return;
  const kind = ['picWord', 'wordPic', 'listenPic'][Math.floor(Math.random() * 3)];
  await ui.quiz([wordQuestion(w.id, kind, levelOf(S.records['w:' + w.id]) >= 2 ? 4 : 3)], { title: 'ことばの おさらい', onAnswer: answerLog });
}

// クエストの だんかいを すすめる。true：この ばしょの イベントを おこなった
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
  const done = advance(S, q); persist(); hud();
  const r = st.reward || {};
  if (r.item) { S.inv[r.item] = (S.inv[r.item] || 0) + 1; sfx.chest(); await ui.notice(`${INV[r.item].name}を もらった！`, 'メニューの「もちもの」で みられるよ。', artCanvas(INV[r.item].art)); }
  if (r.star) { S.stars += r.star; persist(); await ui.starFly(r.star, hud); }
  if (done) { sfx.unlock(); await ui.notice('クエスト クリア！', `「${q.title}」を クリアしたよ！`); }
  persist(); hud();
}
const artCanvas = (art, size = 110) => wordArt(art, size);

// たんごを おぼえる イベント（えと おと → かんたんな クイズ → カード ゲット）
async function learnWord(id) {
  await ui.teachWord(id);
  await ui.quiz([wordQuestion(id, 'listenPic', 3)], { title: `${WORD[id].word} の クイズ`, onAnswer: answerLog });
  if (!S.words[id]) S.words[id] = { at: Date.now() };
  persist();
  await ui.wordCard(id, wordStatus(id));
}

// まほう・くみあわせを つかう
async function castAt(o, q, st) {
  let fails = 0, hinted = false;
  const sel = await ui.magic(S, {
    title: st.prompt || 'ことばを くみあわせよう！', levelOf,
    check: s => { const r = tryCast(s, o.ref.id, S); if (!r.ok) fails++; return r; },
    hint: () => { hinted = true; return hintFor(o.ref.id, S); },
  });
  if (!sel) return;
  const sp = tryCast(sel, o.ref.id, S).spell;
  // つかった ことばは しぜんな ふくしゅう として きろく（いっかいめで せいこう した ときだけ）
  sel.forEach(id => { S.records['w:' + id] = record(getRecord(S, 'w:' + id), true, fails === 0 && !hinted); });
  if (sel.length > 1 && !S.combos.includes(comboKey(sel))) S.combos.push(comboKey(sel));
  const a = { x: hero.x, y: hero.y - 20 }, b = center(o);
  await playFx('sparks', 1.1, { a, b });
  if (sp.fx === 'harvest') { sfx.star(); await playFx('apple', 0.9, { a: { x: b.x, y: o.y * TS - 20 }, b: { x: hero.x, y: hero.y - 16 } }); }
  if (sp.fx === 'rain-bloom') {
    bloomAnim = 0; applyEffects(sp.effect.filter(e => e.set && e.set[0] === 'flowerbed'), S);
    await playFx('rain', 1.8, { rect: OBJ.flowerbed });
    sfx.star(); await new Promise(r => setTimeout(r, 2300));
    sfx.unlock(); await playFx('burst', 0.9, { c: { x: 49.5 * TS, y: 11 * TS } });
    hops.mouse = 1.5;
  }
  if (sp.fx === 'bees') { beeAnim = 0; S.world.bees = true; sfx.star(); await new Promise(r => setTimeout(r, 2200)); hops.mouse = 1.5; }
  applyEffects(sp.effect, S); persist(); hud();
  await sayH([['', sp.text]]);
  if (sp.fx === 'harvest') await ui.notice('りんごを てに いれた！', 'メニューの「もちもの」に はいったよ。', artCanvas('apple'));
  await finishStep(q, st);
}

async function teacher(n) {
  const id = n.letter;
  if (!S.learned.includes(id)) {
    await sayH(STORY.teacherHello(n));
    await ui.teach(id);
    await ui.quiz([letterQuestion(id, WORLD1_LETTERS, 'find', 3)], { title: `${n.name}の クイズ`, onAnswer: answerLog });
    S.learned.push(id); S.stars += 1; persist();
    await ui.starFly(1, hud);
    await sayH(STORY.teacherDone(n, id));
    if (WORLD1_LETTERS.length === S.learned.length) await ui.notice('ほしが 5こ あつまった！', 'もじを ぜんぶ おぼえたね！<br>はしの まえの ドラコに あいに いこう。');
  } else {
    await sayH(STORY.teacherReview(n));
    const [target] = pickTargets(S.learned, S.records, 1);
    const kind = Math.random() < 0.5 ? 'find' : 'listen';
    await ui.quiz([letterQuestion(target, WORLD1_LETTERS, kind, choiceCount(S.records[target]))], { title: 'おさらい', onAnswer: answerLog });
    await sayH([[n.name, 'よく できました！']]);
  }
}

async function openChest(c) {
  if (S.chests[c.id]) return sayH(STORY.chestOpened);
  if (S.learned.length < 2) return sayH(STORY.chestLocked);
  await sayH(STORY.chestStart);
  const targets = pickTargets(S.learned, S.records, c.questions);
  const qs = targets.map((id, i) => letterQuestion(id, WORLD1_LETTERS, i % 2 ? 'listen' : 'find', choiceCount(S.records[id])));
  await ui.quiz(qs, { title: 'たからばこ クイズ', onAnswer: answerLog });
  S.chests[c.id] = true; sfx.chest();
  S.stars += 1; S.items.push(c.item); S.wear[c.item] = true; persist();
  await ui.starFly(1, hud);
  await ui.notice(`${ITEMS[c.item].name} を てに いれた！`, 'さっそく つけてみたよ。メニューの「もちもの」で はずせるよ。', ui.heroPic(S.wear));
}

async function bossEvent() {
  if (S.flags.bossCleared) return sayH(STORY.bossAfter);
  const missing = WORLD1_LETTERS.filter(id => !S.learned.includes(id));
  if (missing.length) return sayH(STORY.bossLocked(missing));
  await sayH(STORY.bossStart);
  const order = shuffle(WORLD1_LETTERS);
  const qs = order.map((id, i) => letterQuestion(id, WORLD1_LETTERS, i % 2 ? 'listen' : 'find', 4));
  await ui.quiz(qs, { title: 'ドラコの おさらい クイズ', onAnswer: answerLog });
  await sayH(STORY.bossClear);
  S.flags.bossCleared = true; S.flags.bridgeOpen = true; bossHop = 1.2; bridgeAnim = 0.001; sfx.unlock(); persist();
  await new Promise(r => setTimeout(r, 1700));
  S.stars += 3; persist();
  await ui.starFly(3, hud);
  await ui.notice('はしが なおった！', 'でも むこうの もんには かぎが かかっている みたい。ラビに はなしかけてみよう！');
}

async function checkGoal() {
  if (S.quests.bee !== 'done' || S.flags.world1Clear || mode !== 'play') return;
  const t = heroTile(hero);
  if (t.x >= GOAL.x && Math.abs(t.y - GOAL.y) <= 1) {
    mode = 'event'; S.flags.world1Clear = true; persist(); hud(); sfx.unlock();
    const r = await ui.ending(STORY.ending, S);
    if (r === 'title') toTitle(); else mode = 'play';
  }
}

/* ---------- タイトル ---------- */
const titleEl = document.getElementById('title');
function toTitle() {
  if (mode !== 'title' && S.started) persist(); // きどう ちょくごは まだ いちが きまって いないので ほぞん しない
  mode = 'title';
  titleEl.classList.remove('hide');
  document.getElementById('cont').style.display = S.started ? '' : 'none';
  document.body.classList.add('intitle');
}
async function startGame(fresh) {
  unlockAudio();
  if (fresh && S.started && !(await ui.confirm('いまの ぼうけんの きろくを けして、さいしょから はじめる？', 'はじめる', 'やめる'))) return;
  if (fresh) { const keep = S.settings; S = defaultState(); S.settings = keep; }
  titleEl.classList.add('hide'); document.body.classList.remove('intitle');
  S.started = true;
  const useStart = fresh || !S.hero.x;
  const p = useStart ? START : S.hero;
  hero = { x: useStart ? (START.x + 0.5) * TS : p.x * TS, y: useStart ? (START.y + 1) * TS - 4 : p.y * TS, dir: p.dir || 'down', step: 0, moving: false };
  // まえの ばんの セーブ：もんの むこうに いたら、もんの てまえに もどす
  if (heroTile(hero).x >= 28 && S.world.gate !== 'open') { hero.x = 24.5 * TS; hero.y = 12 * TS - 4; hero.dir = 'right'; }
  bridgeAnim = S.flags.bridgeOpen ? 1 : 0; bloomAnim = S.world.flowerbed === 'bloom' ? 1 : 0; beeAnim = S.world.bees ? 1 : 0;
  cam.x = hero.x - vw / scale / 2; cam.y = hero.y - vh / scale / 2;
  lastGoal = null; hud(); persist();
  mode = 'event';
  if (!S.flags.intro) {
    await new Promise(r => setTimeout(r, 500));
    await sayH(STORY.intro);
    S.flags.intro = true; persist(); hud();
  }
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
    ids: WORLD1_LETTERS, levelOf, itemsInfo: ITEMS, invInfo: INV,
    onSettings: () => { setAudioSettings(S.settings); persist(); },
    onWear: k => { S.wear[k] = !S.wear[k]; persist(); },
    onTitle: () => toTitle(),
  });
  if (mode === 'event') mode = 'play';
}

setAudioSettings(S.settings);
toTitle();
requestAnimationFrame(frame);

// うごきの かくにん よう（テストで つかう）
window.__abc = { get S() { return S; }, get hero() { return hero; }, get mode() { return mode; }, set S(v) { S = v; }, talk, facing: () => facing(hero, S), objective: () => objective(S), SPELLS, step: () => { const q = activeQuest(S); return q ? { quest: q.id, ...currentStep(S, q) } : null; },
  tp: (x, y, dir = 'down') => { hero.x = (x + 0.5) * TS; hero.y = (y + 1) * TS - 4; hero.dir = dir; } };

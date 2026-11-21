// ABCぼうけん：ゲームの すすみかた（ループ・えがく・イベント）
import { TS, groundTile, drawWater, drawBridge, drawPlank, treeSprite, bushSprite, rockSprite, fenceSprite, houseSprite, drawSign, drawChest, drawCritter, starPath } from './engine/art.js';
import * as input from './engine/input.js';
import { unlockAudio, setAudioSettings, sfx, sayLetter } from './engine/audio.js';
import { LETTER, WORLD1_LETTERS } from './data/letters.js';
import { START, NPCS, CHESTS, GOAL, ITEMS, STORY } from './data/world1.js';
import { W, H, tileAt, isWater, isPath, things, move, facing, heroTile, bossPos } from './game/world.js';
import { load, save, defaultState, getRecord, SAVE_KEY } from './game/state.js';
import { record, pickTargets, choiceCount, levelOf } from './game/learning.js';
import { letterQuestion, shuffle } from './game/quiz.js';
import * as ui from './ui/ui.js';

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let S = load();
let mode = 'title';            // title / play / event
let hero = { x: 0, y: 0, dir: 'down', step: 0, moving: false };
let cam = { x: 0, y: 0 }, scale = 2, dpr = 1, vw = 0, vh = 0;
let bridgeAnim = S.flags.bridgeOpen ? 1 : 0, chestAnim = {}, bossHop = 0, saveT = 0;

/* ---------- がめんの おおきさ ---------- */
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  vw = innerWidth; vh = innerHeight;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
  // たて 10マス・よこ 14マス くらいが みえる おおきさ
  scale = Math.max(1.2, Math.min(vh / (TS * 9.5), vw / (TS * 13)));
  document.body.classList.toggle('portrait', vh > vw);
}
addEventListener('resize', resize); resize();

/* ---------- えがく ---------- */
function draw(t) {
  const s = scale * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#3f8f4a'; ctx.fillRect(0, 0, cv.width, cv.height);
  const viewW = vw / scale, viewH = vh / scale;
  const x0 = Math.floor(cam.x / TS) - 1, y0 = Math.floor(cam.y / TS) - 2, x1 = Math.ceil((cam.x + viewW) / TS) + 1, y1 = Math.ceil((cam.y + viewH) / TS) + 2;
  const px = v => Math.round((v - cam.x) * s), py = v => Math.round((v - cam.y) * s);
  // じめん
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const ch = tileAt(tx, ty), X = px(tx * TS), Y = py(ty * TS);
    if (ch === '~' || ch === '=' || ch === 'p') {
      ctx.setTransform(s, 0, 0, s, X, Y);
      if (ch === '~') drawWater(ctx, tx, ty, t, isWater);
      else if (ch === '=') { drawWater(ctx, tx, ty, t, isWater); drawBridge(ctx, bridgeAnim, tx === 26 ? 0 : 1); }
      else drawPlank(ctx);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else ctx.drawImage(groundTile(ch, tx, ty, s, isPath), X, Y);
  }
  // もの（したに ある もの ほど まえ）
  const list = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const ch = tileAt(tx, ty);
    if (ch === 'T') list.push([ty * TS + TS, () => ctx.drawImage(treeSprite(s, (tx * 7 + ty * 3) % 5 === 0 ? 1 : 0), px(tx * TS), py((ty - 1) * TS))]);
    else if (ch === 'b') list.push([ty * TS + TS - 2, () => ctx.drawImage(bushSprite(s), px(tx * TS), py(ty * TS))]);
    else if (ch === 'r') list.push([ty * TS + TS - 2, () => ctx.drawImage(rockSprite(s), px(tx * TS), py(ty * TS))]);
    else if (ch === 'F') list.push([ty * TS + TS - 4, () => ctx.drawImage(fenceSprite(s), px(tx * TS), py(ty * TS))]);
    else if (ch === 'h' && tileAt(tx - 1, ty) !== 'h' && tileAt(tx, ty - 1) !== 'h') list.push([(ty + 2) * TS, () => ctx.drawImage(houseSprite(s), px(tx * TS), py((ty - 1) * TS))]);
  }
  const near = mode === 'play' ? facing(hero, S) : null;
  for (const o of things(S)) {
    if (o.x < x0 || o.x > x1 || o.y < y0 || o.y > y1) continue;
    const X = o.x * TS, Y = o.y * TS;
    if (o.type === 'sign') list.push([Y + TS - 3, () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); drawSign(ctx, o.ref.letters ? 'ABCDE' : o.ref.id === 'bridge' ? 'はし' : o.ref.id === 'pond' ? 'いけ' : 'ABC'); }]);
    if (o.type === 'chest') list.push([Y + TS - 3, () => { ctx.setTransform(s, 0, 0, s, px(X), py(Y)); drawChest(ctx, !!S.chests[o.ref.id], t); }]);
    if (o.type === 'npc') {
      const n = o.ref, boss = !!n.boss, bob = boss ? Math.abs(Math.sin(bossHop * Math.PI * 3)) * -6 : 0;
      list.push([Y + TS - 3, () => {
        ctx.setTransform(s, 0, 0, s, px(X + TS / 2), py(Y + TS - 3 + bob));
        const look = n.id === 'rabbit' || boss ? lookAt(o) : 'down';
        drawCritter(ctx, n.kind, 0, 0, look, (t * 0.8 + n.x) % 2 < 0.25 ? 0.5 : 0, { scale: boss ? 1.35 : 1 });
      }]);
    }
  }
  // しゅじんこう
  list.push([hero.y, () => { ctx.setTransform(s, 0, 0, s, px(hero.x), py(hero.y)); drawCritter(ctx, 'fox', 0, 0, hero.dir, hero.moving ? hero.step : 0, { scarf: S.wear.scarf, hat: S.wear.hat }); }]);
  list.sort((a, b) => a[0] - b[0]).forEach(([, f]) => { f(); ctx.setTransform(1, 0, 0, 1, 0, 0); });
  // ふきだし（もじ・！）
  for (const o of things(S)) {
    if (o.type !== 'npc') continue;
    const n = o.ref, X = (o.x + 0.5) * TS, Y = o.y * TS - (n.boss ? 20 : 12);
    let label = null, col = '#fff';
    if (n.letter) label = S.learned.includes(n.letter) ? n.letter : '?';
    if (n.boss && !S.flags.bossCleared) { label = S.learned.length >= WORLD1_LETTERS.length ? '!' : '…'; }
    if (n.id === 'rabbit' && !S.flags.intro) label = null;
    if (near === o) { label = label || '!'; col = '#fff3a0'; }
    if (label) bubble(px(X), py(Y + Math.sin(t * 3 + o.x) * 1.5), label, col, s);
  }
  for (const o of things(S)) if (near === o && o.type !== 'npc') bubble(px((o.x + 0.5) * TS), py(o.y * TS - 6 + Math.sin(t * 3) * 1.5), '!', '#fff3a0', s);
  // おわりの もりの いりぐち
  if (S.flags.bridgeOpen && !S.flags.ending) {
    ctx.setTransform(s, 0, 0, s, px((GOAL.x + 0.5) * TS), py((GOAL.y + 0.5) * TS));
    ctx.globalAlpha = 0.6 + Math.sin(t * 4) * 0.3; ctx.fillStyle = '#fff6b0'; starPath(ctx, 0, 0, 8, 3.5); ctx.fill(); ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
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
function hud() {
  document.getElementById('starN').textContent = S.stars;
  document.getElementById('slots').innerHTML = WORLD1_LETTERS.map(id => `<i class="${S.learned.includes(id) ? 'got' : ''}">${S.learned.includes(id) ? id : ''}</i>`).join('');
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
  // カメラ
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
function answerLog(q, ok, first) { S.records[q.target] = record(getRecord(S, q.target), ok, first); }

async function talk(o) {
  mode = 'event';
  try {
    if (o.type === 'sign') {
      await sayH(o.ref.text.map(x => ['', x]));
      if (o.ref.letters) await ui.letterBoard(o.ref.letters, S.learned);
    } else if (o.type === 'chest') await openChest(o.ref);
    else if (o.ref.boss) await bossEvent();
    else if (o.ref.letter) await teacher(o.ref);
    else if (o.ref.id === 'rabbit') await sayH(STORY.rabbitAgain(WORLD1_LETTERS.length - S.learned.length));
  } finally { persist(); hud(); mode = 'play'; }
}

async function teacher(n) {
  const id = n.letter;
  if (!S.learned.includes(id)) {
    await sayH(STORY.teacherHello(n));
    await ui.teach(id);
    const pool = WORLD1_LETTERS;
    await ui.quiz([letterQuestion(id, pool, 'find', 3)], { title: `${n.name}の クイズ`, onAnswer: answerLog });
    S.learned.push(id); S.stars += 1; persist();
    await ui.starFly(1, hud);
    await sayH(STORY.teacherDone(n, id));
    const left = WORLD1_LETTERS.length - S.learned.length;
    if (left === 0) await ui.notice('ほしが 5こ あつまった！', 'もじを ぜんぶ おぼえたね！<br>はしの まえの ドラコに あいに いこう。');
  } else {
    // おさらい：おぼえた もじの なかから にがてを ゆうせん
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
  await ui.notice(`${ITEMS[c.item].name} を てに いれた！`, 'さっそく つけてみたよ。メニューの「きがえ」で はずせるよ。', ui.heroPic(S.wear));
}

async function bossEvent() {
  if (S.flags.bossCleared) return sayH(STORY.bossAfter);
  const missing = WORLD1_LETTERS.filter(id => !S.learned.includes(id));
  if (missing.length) return sayH(STORY.bossLocked(missing));
  await sayH(STORY.bossStart);
  // 5もじ ぜんぶ 1かいずつ、4たく（「きく」もんだい も まぜる）
  const order = shuffle(WORLD1_LETTERS);
  const qs = order.map((id, i) => letterQuestion(id, WORLD1_LETTERS, i % 2 ? 'listen' : 'find', 4));
  await ui.quiz(qs, { title: 'ドラコの おさらい クイズ', onAnswer: answerLog });
  await sayH(STORY.bossClear);
  // はしが なおる
  S.flags.bossCleared = true; S.flags.bridgeOpen = true; bossHop = 1.2; bridgeAnim = 0.001; sfx.unlock(); persist();
  await new Promise(r => setTimeout(r, 1700));
  S.stars += 3; persist();
  await ui.starFly(3, hud);
  await ui.notice('はしが なおった！', 'むこうの もりへ わたってみよう！');
}

async function checkGoal() {
  if (!S.flags.bridgeOpen || S.flags.ending || mode !== 'play') return;
  const t = heroTile(hero);
  if (t.x >= GOAL.x && t.y >= GOAL.y - 1 && t.y <= GOAL.y + 1) {
    mode = 'event'; S.flags.ending = true; persist(); sfx.unlock();
    const r = await ui.ending(STORY.ending, S);
    if (r === 'title') toTitle(); else mode = 'play';
  }
}

/* ---------- タイトル ---------- */
const titleEl = document.getElementById('title');
function toTitle() {
  if (mode !== 'title' && S.started) persist(); // きどう ちょくごは まだ いちが きまって いないので ほぞん しない
  mode = 'title'; titleEl.classList.remove('hide');
  document.getElementById('cont').style.display = S.started ? '' : 'none';
  document.body.classList.add('intitle');
}
async function startGame(fresh) {
  unlockAudio();
  if (fresh && S.started && !(await ui.confirm('いまの ぼうけんの きろくを けして、さいしょから はじめる？', 'はじめる', 'やめる'))) return;
  if (fresh) { const keep = S.settings; S = defaultState(); S.settings = keep; }
  titleEl.classList.add('hide'); document.body.classList.remove('intitle');
  S.started = true;
  const p = fresh || !S.hero.x ? START : S.hero;
  hero = { x: fresh || !S.hero.x ? (START.x + 0.5) * TS : p.x * TS, y: fresh || !S.hero.x ? (START.y + 1) * TS - 4 : p.y * TS, dir: p.dir || 'down', step: 0, moving: false };
  bridgeAnim = S.flags.bridgeOpen ? 1 : 0;
  cam.x = hero.x - vw / scale / 2; cam.y = hero.y - vh / scale / 2;
  hud(); persist();
  mode = 'event';
  if (!S.flags.intro) {
    await new Promise(r => setTimeout(r, 500));
    await sayH(STORY.intro);
    S.flags.intro = true; persist();
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
  if (o) { const T = o.type === 'npc' ? o : null; if (T) hero.dir = turnTo(o); talk(o); }
});
input.on('menu', () => { if (ui.closeByMenuKey()) return; openMenu(); });
function turnTo(o) { const dx = (o.x + 0.5) * TS - hero.x, dy = (o.y + 1) * TS - hero.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
async function openMenu() {
  if (mode !== 'play' || ui.busy()) return;
  mode = 'event'; sfx.tap();
  await ui.menu(S, {
    ids: WORLD1_LETTERS, levelOf, itemsInfo: ITEMS,
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
window.__abc = { get S() { return S; }, get hero() { return hero; }, get mode() { return mode; }, set S(v) { S = v; }, talk, facing: () => facing(hero, S), SAVE_KEY, tp: (x, y, dir = 'down') => { hero.x = (x + 0.5) * TS; hero.y = (y + 1) * TS - 4; hero.dir = dir; } };

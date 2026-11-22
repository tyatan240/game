// ロボモコの ブロックタウン（フェーズ1：じぶんの てで つくる）
// せかいの データ（world/）・えがく がわ（render/）・そうさ（この ファイル）を わけている。
import { BLOCKS, BLOCK } from './data/blocks.js';
import { World, newWorld } from './world/world.js';
import { loadSave, writeSave } from './world/storage.js';
import { BuildScene } from './render/scene.js';
import { drawIcon } from './render/icons.js';
import { RobotView } from './render/robotModel.js';
import { Robot, Runner, ERR } from './robot/robot.js';
import { sanitize } from './robot/program.js';
import { RobotPanel } from './ui/robotPanel.js';
import { QUESTS } from './quest/quests.js';
import { addHousePoints } from './quest/house.js';

const $ = id => document.getElementById(id);
const MSG = { out: 'そこには おけないよ', full: 'もう ブロックが あるよ', top: 'はなの うえには おけないよ', id: 'その ブロックは つかえないよ' };

// app: 'free'（じゆうに つくる）/ 'robot'（ロボットに おねがい）
const ui = { quest: { done: [], loopBuilt: false }, app: 'free', sel: 'wood', rot: 0, mode: 'place', pending: null, seenHelp: false };
let world, scene, robot, runner, rview, panel, prog = [];

// ---------- おと（WebAudio。みじかい「ぽん」）----------
let ac = null;
function beep(f, d = .08, type = 'sine', vol = .18) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(f * 1.5, ac.currentTime + d);
    g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d + .05);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .06);
  } catch { /* おとが でなくても あそべる */ }
}
const sPlace = () => beep(520, .07), sErase = () => beep(300, .08, 'triangle'), sNg = () => beep(180, .1, 'square', .08), sTap = () => beep(700, .03, 'sine', .08);

// ---------- ほぞん ----------
let saveTimer = 0;
function saveNow() {
  clearTimeout(saveTimer); saveTimer = 0;
  if (!world) return;
  writeSave({ world: world.toJSON(), cam: scene.camState(), sel: ui.sel, rot: ui.rot, seenHelp: ui.seenHelp,
    app: ui.app, robot: robot.toJSON(), prog, speed: runner.speed, quest: ui.quest });
}
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 300); }
addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });

// ---------- おしらせ ----------
let toastT = 0;
function toast(msg, good) {
  const t = $('toast'); t.textContent = msg; t.className = 'toast' + (good ? ' good' : ''); t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 1600);
}

// ---------- パレット ----------
function buildPalette() {
  const nav = $('palette'); nav.innerHTML = '';
  for (const b of BLOCKS) {
    const btn = document.createElement('button');
    btn.className = 'blk'; btn.dataset.id = b.id; btn.setAttribute('aria-label', b.name);
    const cv = document.createElement('canvas'); cv.width = cv.height = 104; drawIcon(cv, b);
    const sp = document.createElement('span'); sp.textContent = b.name;
    btn.append(cv, sp);
    btn.addEventListener('click', () => { select(b.id); sTap(); });
    nav.append(btn);
  }
}
function select(id) {
  if (!BLOCK[id]) return;
  if (ui.sel !== id) ui.rot = 0;
  ui.sel = id; setMode('place', true);
  for (const el of document.querySelectorAll('.blk')) el.classList.toggle('on', el.dataset.id === id);
  $('rot').hidden = !BLOCK[id].rotate;
  refreshPending(); saveSoon();
}
function setMode(m, quiet) {
  ui.mode = m;
  $('mPlace').classList.toggle('on', m === 'place');
  $('mErase').classList.toggle('on', m === 'erase');
  if (!quiet) { clearPending(); sTap(); }
}
function rotate() {
  ui.rot = (ui.rot + 1) % 4; sTap();
  refreshPending(); if (hoverCell) showHover(); saveSoon();
}

// ---------- ねらい（どこに おく／けす）----------
// target = { mode, x,y,z, ok, reason, id, r }
function targetAt(cx, cy) {
  const p = scene.pick(cx, cy);
  if (ui.mode === 'erase') {
    if (!p.hit) return null;
    return { mode: 'erase', ...p.hit, ok: true };
  }
  if (!p.place) return null;
  const c = world.canPlace(p.place.x, p.place.y, p.place.z, ui.sel);
  return { mode: 'place', ...p.place, ok: c.ok, reason: c.reason, id: ui.sel, r: ui.rot };
}
const same = (a, b) => a && b && a.mode === b.mode && a.x === b.x && a.y === b.y && a.z === b.z;

function setPending(t) {
  ui.pending = t; scene.showPreview(t);
  const ok = $('ok');
  if (t && t.ok) {
    ok.hidden = false; ok.classList.toggle('erase', t.mode === 'erase');
    ok.querySelector('span').textContent = t.mode === 'erase' ? 'ここを けす' : 'ここに おく';
  } else ok.hidden = true;
}
function clearPending() { setPending(null); }
// えらんだ ブロック・むきが かわったら、プレビューも つくりなおす
function refreshPending() {
  const t = ui.pending; if (!t) return;
  if (t.mode !== ui.mode) return clearPending();
  if (t.mode === 'place') {
    const c = world.canPlace(t.x, t.y, t.z, ui.sel);
    setPending({ ...t, id: ui.sel, r: ui.rot, ok: c.ok, reason: c.reason });
  } else setPending(world.has(t.x, t.y, t.z) ? t : null);
}

function commit(t) {
  if (!t) return false;
  if (!t.ok) { sNg(); toast(MSG[t.reason] || MSG.out); return false; }
  let done = false;
  if (t.mode === 'place') { done = world.place(t.x, t.y, t.z, t.id, t.r); if (done) sPlace(); }
  else { done = world.remove(t.x, t.y, t.z); if (done) sErase(); }
  clearPending();
  return done;
}

// タッチ：1かいめで プレビュー、おなじ ところを もういちど（か「ここに おく」）で きまり
// マウス：うごかすと プレビュー、クリックで きまり
function tap(cx, cy, type) {
  if (ui.app === 'robot') return tapRobot(cx, cy);
  const t = targetAt(cx, cy);
  if (type === 'mouse') { commit(t); showHoverAt(cx, cy); return; }
  if (!t) { clearPending(); return; }
  if (same(ui.pending, t) && t.ok) { commit(t); return; }
  setPending(t);
  if (!t.ok) { sNg(); toast(MSG[t.reason] || MSG.out); } else sTap();
}

// ロボットモード：タップした ところへ ロボを つれていく（じっこう していない とき）
function tapRobot(cx, cy) {
  if (runner.state !== 'idle') return;
  const p = scene.pick(cx, cy), c = p.hit || p.place;
  if (!c) return;
  const from = robot.pos();
  if (robot.moveTo(c.x, c.z)) { rview.play('move', from, robot.pos(), robot.dir, 380); sTap(); saveSoon(); }
}

// つくる ⇄ ロボット
function setApp(a, quiet) {
  if (runner.state !== 'idle') return;
  ui.app = a;
  document.body.classList.toggle('robot', a === 'robot');
  $('tabFree').classList.toggle('on', a === 'free');
  $('tabRobot').classList.toggle('on', a === 'robot');
  $('rpanel').hidden = $('rpal').hidden = a !== 'robot';
  rview.showArrows(a === 'robot');
  clearPending(); hoverXY = null; scene.showPreview(null);
  if (a === 'robot') { scene.snapAz(); panel.render(); }
  layout();
  if (!quiet) { sTap(); saveSoon(); }
}
// パレットの たかさに あわせて パネルの したを きめる
function layout() {
  const pal = ui.app === 'robot' ? $('rpal') : $('palette');
  document.documentElement.style.setProperty('--palH', (pal.offsetHeight + 8) + 'px');
  // せかいを みえる ところの まんなかに
  const top = document.querySelector('.top').offsetHeight, rp = $('rpanel');
  const ins = { t: top * .6, b: pal.offsetHeight, l: 0, r: 0 };
  if (ui.app === 'robot') {
    const r = rp.getBoundingClientRect();
    if (innerWidth > innerHeight) ins.l = r.right; else ins.b = innerHeight - r.top;
  }
  scene.setInset(ins);
}
addEventListener('resize', () => layout());

let hoverCell = null, hoverXY = null;
function showHoverAt(cx, cy) { if (ui.app !== 'free') return; hoverXY = [cx, cy]; showHover(); }
function showHover() {
  if (!hoverXY) return;
  hoverCell = targetAt(hoverXY[0], hoverXY[1]);
  scene.showPreview(hoverCell);
}

// ---------- ゆび・マウス ----------
function setupInput(cv) {
  const pts = new Map();
  let start = null, multi = false, pinch = null;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const mid = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };

  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, btn: e.button }; multi = false; }
    else if (pts.size === 2) { multi = true; pinch = { d: dist(), m: mid() }; }
  });
  cv.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) {
      if (e.pointerType === 'mouse' && ui.mode) showHoverAt(e.clientX, e.clientY);
      return;
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1 && start && !multi) {
      if (!start.moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) start.moved = true;
      if (start.moved) {
        const dx = e.clientX - start.lx, dy = e.clientY - start.ly;
        // マウスの みぎ ボタン：いどう、それ いがい：まわす
        if (start.btn === 2) scene.pan(dx, dy); else scene.orbit(dx, dy);
        start.lx = e.clientX; start.ly = e.clientY;
        if (e.pointerType === 'mouse') scene.showPreview(null);
      }
    } else if (pts.size === 2 && pinch) {
      const d = dist(), m = mid();
      if (pinch.d > 0) scene.zoomBy(d / pinch.d);
      scene.pan(m.x - pinch.m.x, m.y - pinch.m.y);
      pinch = { d, m };
    }
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size === 0) {
      if (start && !start.moved && !multi && e.type === 'pointerup' && start.btn !== 2) tap(e.clientX, e.clientY, e.pointerType);
      if (start && start.moved) saveSoon();
      if (multi) saveSoon();
      start = null; multi = false; pinch = null;
    } else if (pts.size === 1) { pinch = null; const [p] = pts.values(); start = { x: p.x, y: p.y, lx: p.x, ly: p.y, moved: true, btn: 0 }; }
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !pts.size) { hoverXY = null; scene.showPreview(ui.pending); } });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => { e.preventDefault(); scene.zoomBy(Math.exp(-e.deltaY * .0015)); saveSoon(); }, { passive: false });
  // iOS の ピンチで がめん ぜんたいが ズームしないように
  document.addEventListener('gesturestart', e => e.preventDefault());
}

function setupButtons() {
  $('mPlace').onclick = () => setMode('place');
  $('mErase').onclick = () => setMode('erase');
  $('rot').onclick = rotate;
  $('undo').onclick = () => { if (runner.state === 'idle' && world.undo()) { sTap(); clearPending(); } };
  $('redo').onclick = () => { if (runner.state === 'idle' && world.redo()) { sTap(); clearPending(); } };
  $('tabFree').onclick = () => setApp('free');
  $('tabRobot').onclick = () => setApp('robot');
  $('turnL').onclick = () => { scene.turn(-1); sTap(); clearPending(); saveSoon(); };
  $('turnR').onclick = () => { scene.turn(1); sTap(); clearPending(); saveSoon(); };
  $('zIn').onclick = () => { scene.zoomBy(1.25); sTap(); saveSoon(); };
  $('zOut').onclick = () => { scene.zoomBy(1 / 1.25); sTap(); saveSoon(); };
  $('camReset').onclick = () => { scene.resetCamera(ui.app === 'robot' ? 0 : Math.PI / 4); sTap(); clearPending(); saveSoon(); };
  $('ok').onclick = () => commit(ui.pending);
  $('menu').onclick = () => { $('menuDlg').hidden = false; };
  $('menuClose').onclick = () => { $('menuDlg').hidden = true; };
  $('openHelp').onclick = () => { $('menuDlg').hidden = true; $('help').hidden = false; };
  $('helpOk').onclick = () => { $('help').hidden = true; ui.seenHelp = true; saveSoon(); };
  $('askNew').onclick = () => { $('menuDlg').hidden = true; $('newDlg').hidden = false; };
  $('newNo').onclick = () => { $('newDlg').hidden = true; };
  $('newYes').onclick = () => { $('newDlg').hidden = true; world.reset(true); clearPending(); toast('あたらしい まちだよ', true); };

  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (runner.state !== 'idle' || ui.app === 'robot') {
      if (k === ' ') { e.preventDefault(); $('rPlay').click(); }
      else if (k === '[' || k === 'q') scene.turn(-1);
      else if (k === ']' || k === 'e') scene.turn(1);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); (e.shiftKey ? world.redo() : world.undo()); clearPending(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); world.redo(); clearPending(); return; }
    if (/^[1-9]$/.test(e.key) && BLOCKS[+e.key - 1]) select(BLOCKS[+e.key - 1].id);
    else if (k === 'r') { if (BLOCK[ui.sel].rotate) rotate(); }
    else if (k === 'x') setMode(ui.mode === 'erase' ? 'place' : 'erase');
    else if (k === '[' || k === 'q') scene.turn(-1);
    else if (k === ']' || k === 'e') scene.turn(1);
    else if (k === '+' || k === '=') scene.zoomBy(1.25);
    else if (k === '-') scene.zoomBy(1 / 1.25);
    else if (k === 'enter' && ui.pending) commit(ui.pending);
    else if (k === 'escape') clearPending();
  });
}

function refreshButtons() {
  const idle = !runner || runner.state === 'idle';
  $('undo').disabled = !idle || !world.canUndo();
  $('redo').disabled = !idle || !world.canRedo();
  for (const id of ['tabFree', 'tabRobot']) $(id).disabled = !idle;
}

// ロボ・じっこう がかり・パネルを つくる
function setupRobot(data) {
  robot = new Robot(world, data && data.robot);
  prog = sanitize(data && data.prog);
  rview = new RobotView(scene.scene);
  scene.animators.push(rview);
  rview.place(robot.pos(), robot.dir);
  rview.showArrows(false);
  runner = new Runner(world, robot, {
    step(s, res, ms) {
      rview.play(res.kind, res.from, res.to, robot.dir, ms);
      panel.mark(s, !res.ok);
      if (!res.ok) sNg(); else if (res.kind === 'put') sPlace(); else if (res.kind === 'break') sErase(); else if (res.kind === 'move') beep(440, .04, 'sine', .07);
    },
    state() { panel.updateControls(); refreshButtons(); },
    end(r) {
      if (!r.ok) { toast(ERR[r.reason] || 'うまく いかなかったよ'); panel.mark(r.step, true); }
      else { panel.mark(null); if (r.done) { toast('できた！', true); beep(660, .1); setTimeout(() => beep(880, .12), 110); if (prog.some(c => c.t === 'loop' && c.n >= 2 && c.body.some(d => d.t === 'put'))) { ui.quest.loopBuilt = true; questCheck(); } } }
      refreshButtons(); saveNow();
    },
  });
  if (data && Number.isInteger(data.speed) && data.speed >= 0 && data.speed < 3) runner.speed = data.speed;
  panel = new RobotPanel({
    runner, getProg: () => prog, setProg: p => { prog = p; },
    onEdit: () => { panel.mark(null); saveSoon(); }, toast, sound: { tap: sTap, ng: sNg },
  });
  scene.onCamera = az => panel.setArrows(az);
  panel.setArrows(scene.az);
  // てで つくりかえたら ロボは その れつの うえに のる
  world.onChange(() => { if (runner.state === 'idle') rview.place(robot.pos(), robot.dir); });
}

/* ---------- おだい（5ステージ）---------- */
const curQuest = () => QUESTS.find(q => !ui.quest.done.includes(q.id)) || null;
function qState(q) { const [have, need] = q.check(world, ui.quest); const extra = q.need ? q.need(ui.quest) : true; return { have, need, ok: have >= need && extra, extra }; }
function questBar() {
  const q = curQuest(), b = $('qbar');
  if (!q) { b.hidden = false; b.className = 'qbar ok'; b.textContent = '🏆 おだい ぜんぶ クリア！'; return; }
  const s = qState(q); b.hidden = false; b.className = 'qbar';
  b.textContent = `🎯 おだい${q.id}：${q.name}（${s.have}/${s.need}${q.need && !s.extra ? '・くりかえし' : ''}）`;
}
let qT = 0;
function questCheck() { clearTimeout(qT); qT = setTimeout(questNow, 250); }
function questNow() {
  const q = curQuest(); if (!q) return questBar();
  if (qState(q).ok) {
    ui.quest.done.push(q.id); addHousePoints(q.reward); saveNow();
    confetti(); beep(523, .1); setTimeout(() => beep(659, .1), 110); setTimeout(() => beep(784, .1), 220); setTimeout(() => beep(1047, .2), 340);
    const next = curQuest();
    $('questCard').innerHTML = `<div class="h">🎉 おだい${q.id} クリア！</div><p style="font-size:17px;font-weight:800">「${q.name}」</p>
      ${q.id === 5 ? '<p>むらびとが あそびに きたよ！ すてきな むらだね！</p>' : '<p>すごい！ つくった ものは そのまま のこるよ</p>'}
      <p style="font-size:20px;font-weight:800;color:#e0719a">おうちの ⭐ ＋${q.reward}</p>
      <p class="muted" style="font-size:12px">まなんだ こと：${q.learn}</p>
      <button class="big" id="qnext">${next ? `つぎの おだいへ（${next.name}）` : 'やったー！'}</button>`;
    $('questDlg').hidden = false; $('qnext').onclick = () => { $('questDlg').hidden = true; questBar(); };
  }
  questBar();
}
function openQuests() {
  const cur = curQuest();
  $('questCard').innerHTML = `<div class="h">🎯 おだい</div><div class="qlist">${QUESTS.map(q => { const done = ui.quest.done.includes(q.id), s = qState(q);
    return `<div class="qrow ${done ? 'done' : ''} ${cur && cur.id === q.id ? 'now' : ''}"><span class="n">${done ? '✔' : q.id}</span><span style="flex:1"><b>${q.name}</b><small>${q.text}</small>
    ${!done && cur && cur.id === q.id ? `<span class="qprog"><i style="width:${Math.min(100, s.have / s.need * 100)}%"></i></span>${q.need && !s.extra ? `<small>💡 ${q.hint}</small>` : ''}` : ''}<small>ごほうび ⭐${q.reward}</small></span></div>`; }).join('')}</div>
    <p class="muted" style="font-size:12px">みた目は じゆう！ じょうけんを みたせば クリアだよ</p><button class="big sub" id="qclose">とじる</button>`;
  $('questDlg').hidden = false; $('qclose').onclick = () => { $('questDlg').hidden = true; };
}
function confetti() {
  const c = document.createElement('div'); c.className = 'confetti';
  const cs = ['#ff8fb1', '#ffd34f', '#5bbbe6', '#3dbb6a', '#c3a8ff'];
  for (let i = 0; i < 40; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = cs[i % 5]; e.style.animationDelay = Math.random() * .6 + 's'; c.appendChild(e); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 2600);
}

async function start() {
  const data = await loadSave();
  world = new World();
  if (data && data.world) world.load(data.world); else world = newWorld();
  scene = new BuildScene($('cv'), world);
  if (data) { scene.setCam(data.cam); ui.seenHelp = !!data.seenHelp; }
  setupRobot(data);
  buildPalette();
  select(data && BLOCK[data.sel] ? data.sel : 'wood');
  ui.rot = data && Number.isInteger(data.rot) ? ((data.rot % 4) + 4) % 4 : 0;
  setupInput($('cv')); setupButtons();
  world.onChange(() => { refreshButtons(); saveSoon(); if (hoverXY) showHover(); });
  scene.onTurn = () => { if (hoverXY) showHover(); };
  refreshButtons();
  if (data && data.quest && Array.isArray(data.quest.done)) ui.quest = { done: data.quest.done.filter(n => QUESTS.some(q => q.id === n)), loopBuilt: !!data.quest.loopBuilt };
  world.onChange(() => questCheck());
  $('questBtn').onclick = () => { sTap(); openQuests(); }; $('qbar').onclick = () => { sTap(); openQuests(); };
  questBar();
  setApp(data && data.app === 'robot' ? 'robot' : 'free', true);
  layout();
  if (!ui.seenHelp) $('help').hidden = false;
  if (!data) saveNow();

  // テストと、あとで つなぐ ロボット用の いりぐち
  window.__build = {
    world, scene, ui, BLOCKS, robot, runner, panel, setApp, questNow, openQuests, QUESTS,
    get prog() { return prog; }, set prog(p) { prog = sanitize(p); panel.render(); },
    select, setMode, rotate, commit, tap, saveNow,
    targetAt, toScreen: (x, y, z) => scene.toScreen(x, y, z),
  };
  document.body.dataset.ready = '1';
}
start();

// ロボモコの ブロックタウン（フェーズ1：じぶんの てで つくる）
// せかいの データ（world/）・えがく がわ（render/）・そうさ（この ファイル）を わけている。
import { BLOCKS, BLOCK } from './data/blocks.js';
import { World, newWorld } from './world/world.js';
import { loadSave, writeSave } from './world/storage.js';
import { BuildScene } from './render/scene.js';
import { drawIcon } from './render/icons.js';

const $ = id => document.getElementById(id);
const MSG = { out: 'そこには おけないよ', full: 'もう ブロックが あるよ', top: 'はなの うえには おけないよ', id: 'その ブロックは つかえないよ' };

const ui = { sel: 'wood', rot: 0, mode: 'place', pending: null, seenHelp: false };
let world, scene;

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
  writeSave({ world: world.toJSON(), cam: scene.camState(), sel: ui.sel, rot: ui.rot, seenHelp: ui.seenHelp });
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
  const t = targetAt(cx, cy);
  if (type === 'mouse') { commit(t); showHoverAt(cx, cy); return; }
  if (!t) { clearPending(); return; }
  if (same(ui.pending, t) && t.ok) { commit(t); return; }
  setPending(t);
  if (!t.ok) { sNg(); toast(MSG[t.reason] || MSG.out); } else sTap();
}

let hoverCell = null, hoverXY = null;
function showHoverAt(cx, cy) { hoverXY = [cx, cy]; showHover(); }
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
  $('undo').onclick = () => { if (world.undo()) { sTap(); clearPending(); } };
  $('redo').onclick = () => { if (world.redo()) { sTap(); clearPending(); } };
  $('turnL').onclick = () => { scene.turn(-1); sTap(); clearPending(); saveSoon(); };
  $('turnR').onclick = () => { scene.turn(1); sTap(); clearPending(); saveSoon(); };
  $('zIn').onclick = () => { scene.zoomBy(1.25); sTap(); saveSoon(); };
  $('zOut').onclick = () => { scene.zoomBy(1 / 1.25); sTap(); saveSoon(); };
  $('camReset').onclick = () => { scene.resetCamera(); sTap(); clearPending(); saveSoon(); };
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
  $('undo').disabled = !world.canUndo();
  $('redo').disabled = !world.canRedo();
}

async function start() {
  const data = await loadSave();
  world = new World();
  if (data && data.world) world.load(data.world); else world = newWorld();
  scene = new BuildScene($('cv'), world);
  if (data) { scene.setCam(data.cam); ui.seenHelp = !!data.seenHelp; }
  buildPalette();
  select(data && BLOCK[data.sel] ? data.sel : 'wood');
  ui.rot = data && Number.isInteger(data.rot) ? ((data.rot % 4) + 4) % 4 : 0;
  setupInput($('cv')); setupButtons();
  world.onChange(() => { refreshButtons(); saveSoon(); if (hoverXY) showHover(); });
  scene.onTurn = () => { if (hoverXY) showHover(); };
  refreshButtons();
  if (!ui.seenHelp) $('help').hidden = false;
  if (!data) saveNow();

  // テストと、あとで つなぐ ロボット用の いりぐち
  window.__build = {
    world, scene, ui, BLOCKS,
    select, setMode, rotate, commit, tap, saveNow,
    targetAt, toScreen: (x, y, z) => scene.toScreen(x, y, z),
  };
  document.body.dataset.ready = '1';
}
start();

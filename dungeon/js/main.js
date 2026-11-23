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
function toast(html) { const t = $id('toast'); t.innerHTML = html; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

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
  measureView();
}
const T = () => Math.max(34, Math.min(64, Math.floor(Math.min(vw / 11, vh / 11))));
// マップの まんなか：うえの ひょうじ（ガイド）と したの ボタンの あいだ
let viewTop = 70, viewBottom = 0;
function measureView() {
  const gd = $id('guide'), top = gd && !gd.hidden ? gd.getBoundingClientRect().bottom : document.querySelector('.dtop').getBoundingClientRect().bottom;
  const padTop = $id('pad').getBoundingClientRect().top, actsTop = $id('acts').getBoundingClientRect().top;
  viewTop = top; viewBottom = vw < vh ? Math.min(padTop, actsTop) : vh; // たてがめんは ボタンが した に ある
}
function cam() { const t = T(); return { t, ox: vw / 2 - (run.hero.x + 0.5) * t, oy: (viewTop + viewBottom) / 2 - (run.hero.y + 0.5) * t }; }
function toTile(px, py) { const { t, ox, oy } = cam(); return [Math.floor((px - ox) / t), Math.floor((py - oy) / t)]; }
function makeHero() {
  const svg = charSVG(S.equip, 'normal').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  heroImg = new Image(); heroImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  $id('thero').innerHTML = charSVG(S.equip, 'happy', 'sway');
}
function draw(now) {
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
  for (const mo of run.mons) {
    if (!vis.has(mo.x + ',' + mo.y)) continue;
    const big = WORD[mo.id].boss ? 1.5 : 1, s = t * 0.92 * big, bob = Math.sin(now / 300 + mo.uid) * t * 0.03;
    drawArt(g, WORD[mo.id].art, ox + (mo.x + 0.5) * t - s / 2, oy + (mo.y + 1) * t - s * 0.98 + bob, s);
    if (mo.hp < mo.maxhp) { const w = t * 0.8; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(ox + mo.x * t + t * 0.1, oy + mo.y * t - 4, w, 5); g.fillStyle = '#ff6b6b'; g.fillRect(ox + mo.x * t + t * 0.1, oy + mo.y * t - 4, w * Math.max(0, mo.hp / mo.maxhp), 5); }
  }
  // モコ
  const h = run.hero, hs = t * 1.15;
  if (heroImg && heroImg.complete) { g.save(); g.translate(ox + (h.x + 0.5) * t, oy + (h.y + 1) * t); if (h.dir === 'left') g.scale(-1, 1); g.drawImage(heroImg, -hs * 0.42, -hs * 1.02, hs * 0.84, hs); g.restore(); }
  else { g.fillStyle = '#ffd34f'; g.beginPath(); g.arc(ox + (h.x + 0.5) * t, oy + (h.y + 0.5) * t, t * 0.35, 0, 7); g.fill(); }
  // むいている ほう（ちいさな やじるし）
  const [dx, dy] = DIRS[h.dir]; g.fillStyle = 'rgba(255,211,79,.9)'; g.beginPath(); const cx = ox + (h.x + 0.5 + dx * 0.55) * t, cy = oy + (h.y + 0.5 + dy * 0.55) * t;
  g.moveTo(cx + dx * t * 0.12, cy + dy * t * 0.12); g.lineTo(cx - dy * t * 0.1 - dx * 0.04 * t, cy + dx * t * 0.1 - dy * 0.04 * t); g.lineTo(cx + dy * t * 0.1 - dx * 0.04 * t, cy - dx * t * 0.1 - dy * 0.04 * t); g.fill();
  // えんしゅつ
  fx = fx.filter(f => now - f.t0 < 900);
  for (const f of fx) {
    const k = (now - f.t0) / 900;
    if (f.kind === 'beam') { g.strokeStyle = `rgba(90,170,255,${1 - k})`; g.lineWidth = t * 0.25; g.lineCap = 'round'; g.beginPath(); const p = f.path; if (p.length) { g.moveTo(ox + (h.x + 0.5) * t, oy + (h.y + 0.5) * t); g.lineTo(ox + (p[p.length - 1][0] + 0.5) * t, oy + (p[p.length - 1][1] + 0.5) * t); g.stroke(); } continue; }
    const X = ox + (f.x + 0.5) * t, Y = oy + (f.y + 0.2) * t - k * t * 0.6;
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
  $id('hp').textContent = `${h.hp}/${h.maxhp}`; $id('hpbar').style.width = Math.max(0, 100 * h.hp / h.maxhp) + '%';
  $id('hpbar').parentNode.parentNode.classList.toggle('low', h.hp <= h.maxhp * 0.3);
  $id('mp').textContent = `${h.mp}/${h.maxmp}`; $id('mpbar').style.width = (100 * h.mp / h.maxmp) + '%';
  $id('lv').textContent = 'Lv' + h.lv; $id('pts').textContent = S.points;
  $id('bStairs').hidden = !onStairs(run);
  $id('log').innerHTML = logs.slice(-3).map((t, i, a) => `<div class="${i < a.length - 1 ? 'old' : ''}">${t}</div>`).join('');
  guide(); measureView();
}
function log(t) { logs.push(t); if (logs.length > 20) logs.shift(); }

/* ---------- こうどう ---------- */
function doAction(a) {
  if (mode !== 'play' || busy || !run) return null;
  unlockAudio();
  const r = act(run, a);
  vis = visible(run);
  handle(r.ev);
  if (r.turn) { tutFlag('turn'); persist(); }
  hud();
  return r;
}
function handle(ev) {
  let stairs = false;
  for (const e of ev) {
    if (e.t === 'msg') log(e.text);
    else if (e.t === 'fx') fx.push({ ...e, t0: performance.now() });
    else if (e.t === 'meet') meet(e.id);
    else if (e.t === 'pickup') { sfx.tap(); speak(WORD[e.id].en); meet(e.id); tutFlag('pickup', e.id); stopWalk(); }
    else if (e.t === 'used') { const d = dexOf(e.id); d.used++; if (e.read) { d.read++; } tutFlag('used', e.id); }
    else if (e.t === 'equip') tutFlag('equip', e.id);
    else if (e.t === 'learn') { meet(e.id); sfx.unlock(); speak(WORD[e.id].en); tutFlag('learn', e.id); setTimeout(() => showCard(e.id, { learned: true }), 300); }
    else if (e.t === 'cast') { dexOf(e.id).used++; speak(WORD[e.id].en); tutFlag('cast', e.id); }
    else if (e.t === 'kill') { sfx.correct(); tutFlag('kill', e.id); }
    else if (e.t === 'boss') bossDown(e.id);
    else if (e.t === 'level') { sfx.unlock(); fx.push({ kind: 'heal', x: run.hero.x, y: run.hero.y, n: 'Lv' + e.lv, t0: performance.now() }); }
    else if (e.t === 'hurt') { sfx.bump(); stopWalk(); }
    else if (e.t === 'open') { sfx.chest(); e.got.forEach(meet); }
    else if (e.t === 'bump') sfx.bump();
    else if (e.t === 'revive') sfx.unlock();
    else if (e.t === 'stairs') stairs = true;
    else if (e.t === 'dead') { stopWalk(); setTimeout(gameOver, 500); return; }
  }
  if (stairs) { stopWalk(); setTimeout(askStairs, 150); }
}
function bossDown(id) {
  if (!D.rewarded.boss.includes(run.floor)) { D.rewarded.boss.push(run.floor); setTimeout(() => stars(STARS.boss, `${WORD[id].en} を たおした！`), 600); }
  sfx.unlock();
}

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
  }, 140);
}
function tapMap(px, py) {
  if (mode !== 'play' || busy) return;
  const [x, y] = toTile(px, py), h = run.hero, dist = Math.abs(x - h.x) + Math.abs(y - h.y);
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
  const rows = run.inv.map(it => {
    const w = WORD[it.id], eqd = run.equip.weapon === it.uid || run.equip.shield === it.uid;
    const b = w.slot ? `<button data-act="dgEquip" data-arg="${it.uid}">${eqd ? 'はずす' : 'そうび'}</button>` : w.verb ? `<button data-act="dgUse" data-arg="${it.uid}">${w.verb}</button>` : '';
    return `<div class="irow"><span class="ia" data-art="${w.art}"></span><div class="in">${w.en}${eqd ? '<span class="eqm">そうびちゅう</span>' : ''}</div>${b}<button class="q" data-act="dgLook" data-arg="${it.uid}">？</button></div>`;
  }).join('');
  showPop(`<h3>もちもの（${run.inv.length}/${INV_MAX}）</h3><div class="ilist">${rows || '<p class="muted">まだ なにも もっていないよ</p>'}</div>
    <p class="muted" style="margin:6px 0 0">「？」で いみが わかるよ。いみを みないで つかえたら「よめた」！</p><div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  document.querySelectorAll('#ov [data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 44)));
}
function magicPop() {
  if (!run) return;
  const rows = run.spells.map(id => { const w = WORD[id]; return `<div class="irow"><span class="ia" data-art="${w.art}"></span><div class="in">${w.en}<small>MP ${w.mp}</small></div><button data-act="dgCast" data-arg="${id}" ${run.hero.mp < w.mp ? 'disabled' : ''}>つかう</button><button class="q" data-act="dgSpell" data-arg="${id}">？</button></div>`; }).join('');
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
  if (!onStairs(run) || mode !== 'play') return;
  meet('stairs');
  const last = !run.tut && run.floor >= MAX_FLOOR, next = run.floor + 1;
  showPop(`<div class="dcard"><div class="dart"></div><div class="dname">stairs</div><div class="dja">「かいだん」</div>
    <p class="ddesc">${run.tut ? 'れんしゅうは おしまい！ ほんとうの ぼうけんへ いこう！' : last ? `${run.floor}かいの さいごの かいだん！` : `${next}かいへ すすむ？${BOSS_FLOORS.includes(next) ? '<br><b style="color:#e0304a">つぎは ボスの かい！</b>' : ''}`}</p></div>
    <div class="btns"><button class="big gray" data-act="close">まだ</button><button class="big" data-act="dgDown">すすむ</button></div>`);
  document.querySelector('#ov .dart').appendChild(wordArt('dg_stairs', 90));
}
function goDown() {
  closePop();
  const r = descend(run); if (!r) return;
  if (r.tutDone) return tutorialDone();
  if (r.clear) return clearRun();
  sfx.unlock(); vis = visible(run);
  for (const id of updateSeen(run)) meet(id);
  logs = [`${run.floor}かいに ついた！`];
  if (run.floor > D.best) D.best = run.floor;
  if (run.floor > (D.rewarded.floor || 1)) { const n = run.floor - Math.max(1, D.rewarded.floor || 1); D.rewarded.floor = run.floor; stars(STARS.floor * n, `${run.floor}かいに はじめて ついた！`); }
  persist(); hud();
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
const TUT = [
  { id: 'move', text: 'やじるしの ボタンで うごいて みよう！ みぎの へやへ すすもう', sub: 'いきたい マスを タップしても うごけるよ' },
  { id: 'look', text: `${'<b class="en">apple</b>'} を タップして しらべて みよう！`, sub: 'なまえは えいご。タップすると いみと おとが わかるよ' },
  { id: 'eat', text: `${'<b class="en">apple</b>'} の うえに のって ひろったら、「もちもの」で たべよう！`, sub: 'たべると HPが かいふく するよ' },
  { id: 'attack', text: `${'<b class="en">slime</b>'} の となりで「こうげき」！（ぶつかっても こうげき できるよ）`, sub: 'てきの なまえも えいご。れんしゅうの slime は こうげき して こないよ' },
  { id: 'book', text: `${'<b class="en">magic book</b>'} を ひろって、「もちもの」で よもう！`, sub: 'まほうを おぼえられるよ' },
  { id: 'fire', text: `「まほう」から ${'<b class="en">fire</b>'} を つかって、${'<b class="en">slime</b>'} を こうげき！`, sub: 'まほうは MPを つかうよ' },
  { id: 'sword', text: `${'<b class="en">sword</b>'} を ひろって、「もちもの」で そうび しよう！`, sub: 'つよさが あがるよ' },
  { id: 'stairs', text: `みぎの へやの ${'<b class="en">stairs</b>'} に のって「かいだん」！`, sub: 'つぎの かいへ すすめるよ' },
];
let tut = null;
function tutFlag(k, id) {
  if (!tut || !run || !run.tut) return;
  if (k === 'turn') tut.moves = (tut.moves || 0) + 1;
  if (k === 'turn' && tut.moves >= 3) tut.done.move = true;
  if (k === 'look' && id === 'apple') tut.done.look = true;
  if (k === 'used' && id === 'apple') tut.done.eat = true;
  if (k === 'kill') tut.done.attack = true;
  if (k === 'learn') tut.done.book = true;
  if (k === 'cast' && id === 'fire') tut.done.fire = true;
  if (k === 'equip' && id === 'sword') tut.done.sword = true;
  // fire の れんしゅう あいてが いなく なったら もう 1ぴき
  if (!tut.done.fire && tut.done.book && !run.mons.length) { run.mons.push({ uid: run.uid++, id: 'slime', x: 15, y: 4, hp: 3, maxhp: 3, atk: 0, exp: 1, tick: 0, tame: true }); vis = visible(run); }
}
function guide() {
  const el = $id('guide');
  if (!tut || !run || !run.tut) { el.hidden = true; return; }
  const s = TUT.find(x => !tut.done[x.id]) || TUT[TUT.length - 1];
  el.hidden = false; el.innerHTML = `<small>れんしゅう ${TUT.indexOf(s) + 1}/${TUT.length}</small>${s.text}<small style="margin-top:2px">${s.sub}</small>`;
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
  tut = tutorial ? { done: {}, moves: 0 } : null;
  if (!tutorial) { D.runs++; if (1 > D.best) D.best = 1; log('1かい から ぼうけん スタート！'); }
  else log('れんしゅうの へや。うえの せつめいを みてね');
  vis = visible(run); for (const id of updateSeen(run)) meet(id);
  $id('title').classList.add('hide'); persist(); hud();
}
function resume() { closePop(); unlockAudio(); run = D.run; mode = 'play'; logs = [`${run.tut ? 'れんしゅう' : run.floor + 'かい'} から つづき`]; tut = run.tut ? { done: {}, moves: 0 } : null; vis = visible(run); $id('title').classList.add('hide'); hud(); }
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
function setupInput() {
  const dirOf = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  addEventListener('keydown', e => {
    if (mode !== 'play' || !$id('ov').classList.contains('hide')) return;
    if (dirOf[e.key]) { e.preventDefault(); stopWalk(); doAction({ t: 'move', dir: dirOf[e.key] }); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (onStairs(run)) askStairs(); else doAction({ t: 'attack' }); }
    else if (e.key === 'm') magicPop(); else if (e.key === 'i') itemsPop(); else if (e.key === '.') doAction({ t: 'wait' });
  });
  let hold = null;
  const press = dir => { stopWalk(); doAction({ t: 'move', dir }); clearInterval(hold); hold = setInterval(() => doAction({ t: 'move', dir }), 230); };
  const release = () => { clearInterval(hold); hold = null; };
  document.querySelectorAll('#pad [data-dir]').forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); press(b.dataset.dir); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, release));
  });
  $id('bAttack').onclick = () => { stopWalk(); doAction({ t: 'attack' }); };
  $id('bMagic').onclick = () => { stopWalk(); magicPop(); };
  $id('bItems').onclick = () => { stopWalk(); itemsPop(); };
  $id('bWait').onclick = () => { stopWalk(); doAction({ t: 'wait' }); };
  $id('bStairs').onclick = () => askStairs();
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
window.__dg = { get run() { return run; }, get D() { return D; }, get mode() { return mode; }, get tut() { return tut; }, act: doAction, start, resume, toTitle, goDown, showCard, tapMap, toTile, cam: () => cam(), visible: () => vis };

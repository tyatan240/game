// モコの まち：がめん・そうさ・つくる・まちの おみせ・じゅうにん
// core.js（クラシック）の S・save()・charSVG・ITEM・showPop・ACT を つかう（ほし と キャラ は おうちと きょうつう）
import { CATS, PARTS, PART, SHOP_PARTS, LOOK, FAV, FAV_NAME } from './data/parts.js';
import { W, H, loadTown, saveTown, groundAt, sizeOf, occupancy, canPlace, canPaint, hasPart, History, inMap, openArea, CUSTOM_SIZES } from './town/town.js';
import { QUESTS, QUEST } from './data/quests.js';
import { MOBS, MOB, HW_COOLDOWN, HW_REWARD, newHomework, NOT_YET, mobEquip } from './data/mobs.js';
import { AREAS, AREA, scoreTown } from './data/areas.js';
import { drawGround, drawObject, drawIcon } from './render/art.js';
import { People, charImage } from './town/people.js';

const $id = id => document.getElementById(id);
const TS = 48;                                   // zoom 1 の 1マス（CSS px）
const MSG = { out: 'そこには おけないよ', full: 'もう なにか あるよ', water: 'みずの うえには おけないよ', land: 'はしは みずの うえに おいてね', lock: 'まだ ひらいて いない とち だよ' };

let town, hist, people;
const cam = { x: 20, y: 20, zoom: 1 };
const ui = { mode: 'view', cat: 'house', tool: null, pending: null, sel: null, moving: null, dirtyGround: true };
// tool: { kind:'part', id, r } / { kind:'select' }

/* ---------- ほし（おうちと きょうつう）---------- */
const owns = id => S.owned.includes(id);
const myChars = () => S.owned.filter(id => ITEM[id] && ITEM[id].cat === 'char');
const avatar = () => S.equip.char;
const lookFor = id => id === avatar() ? { ...S.equip } : { ...S.equip, ...(S.looks && S.looks[id] || {}), char: id };
function charHTML(id) { return charSVG(lookFor(id), 'happy'); }

/* ---------- ほぞん ---------- */
let saveT = 0;
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(saveNow, 300); }
function saveNow() { clearTimeout(saveT); if (!town) return; town.camera = { x: +cam.x.toFixed(2), y: +cam.y.toFixed(2), zoom: +cam.zoom.toFixed(3) }; saveTown(town); }
addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });

/* ---------- おしらせ ---------- */
let toastT = 0;
function toast(m, ng) { const e = $id('toast'); e.textContent = m; e.className = 'ttoast' + (ng ? ' ng' : ''); e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { e.hidden = true; }, 2200); }
function hint(m) { const e = $id('hint'); e.hidden = !m; if (m) e.textContent = m; }

/* ---------- えがく ---------- */
const cv = $id('cv'), g = cv.getContext('2d');
let vw = 1, vh = 1, dpr = 1;
function resize() { dpr = Math.min(2, devicePixelRatio || 1); vw = innerWidth; vh = innerHeight; cv.width = vw * dpr; cv.height = vh * dpr; clampCam(); }
addEventListener('resize', resize);
const T = () => TS * cam.zoom;
const toScreen = (x, y) => [(x - cam.x) * T() + vw / 2, (y - cam.y) * T() + vh / 2];
const toWorld = (sx, sy) => [(sx - vw / 2) / T() + cam.x, (sy - vh / 2) / T() + cam.y];
function clampCam() { cam.zoom = Math.min(2.4, Math.max(.45, cam.zoom)); cam.x = Math.min(W, Math.max(0, cam.x)); cam.y = Math.min(H, Math.max(0, cam.y)); }

// じめんは まとめて 1まいの え に しておく（かわった ときだけ かきなおす）
const GT = 32, gcv = document.createElement('canvas'); gcv.width = W * GT; gcv.height = H * GT;
function rebuildGround() {
  const gg = gcv.getContext('2d');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const id = groundAt(town, x, y), same = (a, b) => inMap(a, b) && (groundAt(town, a, b) === id || (PART[id] && PART[id].road && PART[groundAt(town, a, b)] && PART[groundAt(town, a, b)].road));
    gg.save(); gg.translate(x * GT, y * GT); drawGround(gg, id, x, y, GT, { u: same(x, y - 1), d: same(x, y + 1), l: same(x - 1, y), r: same(x + 1, y) }); gg.restore();
  }
  ui.dirtyGround = false;
}

function draw(time) {
  if (ui.dirtyGround) rebuildGround();
  const t = T();
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#8fcf6e'; g.fillRect(0, 0, vw, vh);
  const [ox, oy] = toScreen(0, 0);
  g.imageSmoothingEnabled = true; g.drawImage(gcv, ox, oy, W * t, H * t);
  g.strokeStyle = 'rgba(80,120,60,.5)'; g.lineWidth = 3; g.strokeRect(ox, oy, W * t, H * t);
  for (const a of AREAS) if (!town.unlockedAreas.includes(a.id)) drawLocked(a, t, time);
  if (ui.mode === 'build') { // ます目
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath();
    const [x0, y0] = toWorld(0, 0), [x1, y1] = toWorld(vw, vh);
    for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W, Math.ceil(x1)); x++) { const [sx] = toScreen(x, 0); g.moveTo(sx, Math.max(oy, 0)); g.lineTo(sx, Math.min(oy + H * t, vh)); }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H, Math.ceil(y1)); y++) { const [, sy] = toScreen(0, y); g.moveTo(Math.max(ox, 0), sy); g.lineTo(Math.min(ox + W * t, vw), sy); }
    g.stroke();
  }
  // もの と キャラを したから じゅんに
  const items = [];
  const [wx0, wy0] = toWorld(-2 * t, -3 * t), [wx1, wy1] = toWorld(vw + 2 * t, vh + 3 * t);
  for (const o of town.objects) {
    if (ui.moving && o.id === ui.moving.id) continue;
    const [w, h] = sizeOf(o); if (o.x + w < wx0 || o.x > wx1 || o.y + h < wy0 || o.y > wy1) continue;
    items.push({ y: o.y + h - .01, o });
  }
  for (const p of people.visible()) items.push({ y: p.y + .99, p });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) {
    if (it.o) {
      const [sx, sy] = toScreen(it.o.x, it.o.y);
      g.save(); g.translate(sx, sy); drawObject(g, it.o, t, time);
      if (ui.sel && ui.sel.id === it.o.id) { const [w, h] = sizeOf(it.o); g.strokeStyle = '#ff6fae'; g.lineWidth = 4; g.setLineDash([8, 6]); g.strokeRect(2, 2, w * t - 4, h * t - 4); g.setLineDash([]); }
      g.restore();
    } else drawPerson(it.p, t);
  }
  // プレビュー
  const pv = ui.pending;
  if (pv) {
    const [sx, sy] = toScreen(pv.x, pv.y), [w, h] = sizeOf(pv);
    g.save(); g.translate(sx, sy);
    g.fillStyle = pv.ok ? 'rgba(120,230,140,.35)' : 'rgba(255,80,80,.38)'; g.fillRect(0, 0, w * t, h * t);
    g.strokeStyle = pv.ok ? '#fff' : '#ff4d4d'; g.lineWidth = 3; g.strokeRect(1, 1, w * t - 2, h * t - 2);
    g.globalAlpha = pv.ok ? .7 : .45; drawObject(g, pv, t, time); g.restore();
  }
  const asking = new Set([...activeQuestsCache.map(a => a.who), ...MOBS.filter(m => hwState(m).active).map(m => m.id)]);
  for (const p of people.visible()) { if (p.say) bubble(p, t); else if (asking.has(p.id)) mark(p, t, time); }
}

// まだ ひらいて いない とち：くもで おおう
function drawLocked(a, t, time) {
  const [x0, y0] = toScreen(a.x0, a.y0), w = (a.x1 - a.x0 + 1) * t, h = (a.y1 - a.y0 + 1) * t;
  if (x0 > vw || y0 > vh || x0 + w < 0 || y0 + h < 0) return;
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.fillStyle = 'rgba(236,246,255,.86)'; g.fillRect(x0, y0, w, h);
  g.fillStyle = 'rgba(255,255,255,.9)';
  for (let y = a.y0; y <= a.y1; y += 3) for (let x = a.x0 + ((y / 3) % 2) * 1.5; x <= a.x1; x += 3) { const [sx, sy] = toScreen(x + .5, y + .8); g.beginPath(); g.arc(sx, sy, t * .55, 0, 7); g.arc(sx + t * .55, sy - t * .25, t * .5, 0, 7); g.arc(sx + t * 1.1, sy, t * .45, 0, 7); g.fill(); }
  const [cx, cy] = toScreen((a.x0 + a.x1 + 1) / 2, (a.y0 + a.y1 + 1) / 2);
  g.font = `800 ${Math.max(13, t * .34)}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const label = `🔒 ${a.name}`, sub = `まち レベル ${a.lv} で ひらくよ`, tw = Math.max(g.measureText(label).width, g.measureText(sub).width) + 28, bh = Math.max(56, t * 1.3);
  g.fillStyle = '#fff'; g.strokeStyle = '#c9dcef'; g.lineWidth = 3;
  g.beginPath(); { const x = cx - tw / 2, y = cy - bh / 2, r = 14; g.moveTo(x + r, y); g.arcTo(x + tw, y, x + tw, y + bh, r); g.arcTo(x + tw, y + bh, x, y + bh, r); g.arcTo(x, y + bh, x, y, r); g.arcTo(x, y, x + tw, y, r); g.closePath(); } g.fill(); g.stroke();
  g.fillStyle = '#5a7fa8'; g.fillText(label, cx, cy - bh * .2); g.fillStyle = '#9aaebf'; g.font = `800 ${Math.max(11, t * .26)}px "M PLUS Rounded 1c",sans-serif`; g.fillText(sub, cx, cy + bh * .22);
  g.restore();
}

let activeQuestsCache = [];
function mark(p, t, time) {
  const [sx, sy] = toScreen(p.x + .5, p.y + .85 - 1.35), r = Math.max(10, t * .2), bob = Math.sin(time / 250) * r * .2;
  g.fillStyle = '#ff6fae'; g.beginPath(); g.arc(sx, sy + bob, r, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#fff'; g.font = `800 ${r * 1.4}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('！', sx, sy + bob + 1);
}
function drawPerson(p, t) {
  const img = charImage(p.mob ? mobEquip(p.id) : lookFor(p.id)); if (!img.complete || !img.naturalWidth) return;
  const [sx, sy] = toScreen(p.x + .5, p.y + .85), h = t * 1.25, w = h * 200 / 240;
  const hop = p.state === 'walk' ? Math.abs(Math.sin(p.bob)) * t * .08 : 0;
  g.fillStyle = 'rgba(40,70,40,.2)'; g.beginPath(); g.ellipse(sx, sy, w * .3, t * .08, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.translate(sx, sy - hop); if (p.face < 0) g.scale(-1, 1); g.drawImage(img, -w / 2, -h, w, h); g.restore();
}
function bubble(p, t) {
  const [sx, sy] = toScreen(p.x + .5, p.y + .85 - 1.3);
  g.font = `800 ${Math.max(12, t * .28)}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(p.say).width + 20, bh = Math.max(26, t * .52);
  g.fillStyle = '#fff'; g.strokeStyle = '#f3b8cc'; g.lineWidth = 2;
  g.beginPath(); { const x = sx - tw / 2, y = sy - bh, r = bh / 2; g.moveTo(x + r, y); g.arcTo(x + tw, y, x + tw, y + bh, r); g.arcTo(x + tw, y + bh, x, y + bh, r); g.arcTo(x, y + bh, x, y, r); g.arcTo(x, y, x + tw, y, r); g.closePath(); } g.fill(); g.stroke();
  g.beginPath(); g.moveTo(sx - 6, sy - 1); g.lineTo(sx, sy + 8); g.lineTo(sx + 6, sy - 1); g.fill();
  g.fillStyle = '#5a4646'; g.fillText(p.say, sx, sy - bh / 2);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  people.update(dt);
  draw(now);
  requestAnimationFrame(frame);
}

/* ---------- タップした ところ ---------- */
// たてものは やねの ところ（うえに はみだした ところ）を タップしても えらべる
function objectAt(wx, wy) {
  const cx = Math.floor(wx), cy = Math.floor(wy);
  let best = null;
  for (const o of town.objects) {
    const [w, h] = sizeOf(o), p = PART[o.type], tall = p && (p.home || p.fixed || /school|cafe|tree|lamp|swing|slide/.test(o.type)) ? 1 : 0;
    if (cx >= o.x && cx < o.x + w && wy >= o.y - tall && cy < o.y + h) if (!best || o.y + h > best.y + sizeOf(best)[1]) best = o;
  }
  return best;
}

/* ---------- つくる ---------- */
function anchorFor(type, r, cx, cy, size) { const o = { type, r, x: 0, y: 0, size }, [w, h] = sizeOf(o); return { x: cx - Math.floor((w - 1) / 2), y: cy - (h - 1) }; }
const tplOf = tl => tl && tl.tpl ? town.templates.find(x => x.id === tl.tpl) : null;
function setPending(p) {
  ui.pending = p;
  renderAct();
}
function placePending() {
  const pv = ui.pending; if (!pv) return;
  if (!pv.ok) { toast(MSG[pv.reason] || MSG.out, true); return; }
  hist.push();
  if (ui.moving) {
    const o = town.objects.find(o => o.id === ui.moving.id); if (o) { o.x = pv.x; o.y = pv.y; o.r = pv.r; }
    ui.moving = null; ui.sel = o || null; ui.tool = { kind: 'select' };
    toast('うごかしたよ！');
  } else {
    const p = PART[pv.type], o = { id: 'o' + town.seq++, type: pv.type, x: pv.x, y: pv.y, r: pv.r };
    if (p.home) { o.look = JSON.parse(JSON.stringify(pv.look || p.look || {})); o.residents = []; if (p.custom) o.size = pv.size || [...p.size]; }
    town.objects.push(o);
    pop();
  }
  ui.pending = null; changed(); renderAct(); renderBuild();
}
function changed() { people.changed(town); checkLevel(); questBadge(); saveSoon(); refreshUndo(); }

/* ---------- じゅうにんの おねがい（フェーズ4）---------- */
// おわって いない おねがいを じゅんばんに 3つ。たのむ ひと は じゅうにん（いなければ モコ）
function activeQuests() {
  const who = [avatar(), ...town.objects.flatMap(o => o.residents || [])].filter(owns);
  return QUESTS.filter(q => !town.quests.done.includes(q.id)).slice(0, 3).map((q, i) => {
    const [have, need] = q.check(town, PART);
    return { q, have: Math.min(have, need), need, ok: have >= need, who: who[(QUESTS.indexOf(q) + 1) % who.length] || avatar() };
  });
}
function questBadge() { activeQuestsCache = activeQuests(); const n = activeQuestsCache.filter(a => a.ok).length; const b = $id('qbadge'); if (b) { b.hidden = !n; b.textContent = n; } }
function openQuests() {
  const list = activeQuests(), done = town.quests.done.length;
  showPop(`<h3>💌 じゅうにんの おねがい</h3>
  <div class="quests">${list.map(a => `<div class="quest ${a.ok ? 'ok' : ''}"><div class="qwho">${charHTML(a.who)}</div><div class="qbody"><b>${ITEM[a.who].name}</b><div class="qtext">「${a.q.text}」</div>
   <div class="qbar"><i style="width:${a.have / a.need * 100}%"></i></div><div class="qrow"><span>${a.have} / ${a.need}</span><span class="qrew"><img alt="" src="${iconURL(a.q.reward)}">${PART[a.q.reward].name}</span></div>
   ${a.ok ? `<button class="big" data-act="tclaim" data-arg="${a.q.id}">🎁 できた！ うけとる</button>` : ''}</div></div>`).join('') || '<p>ぜんぶの おねがいを かなえたよ！ ありがとう！</p>'}</div>
  <h3 style="font-size:18px;margin-top:14px">📒 しゅくだいの おてつだい</h3>
  <div class="quests">${MOBS.map(m => { const h = hwState(m); return `<div class="quest ${h.active ? '' : 'ok'}"><div class="qwho">${charSVG(mobEquip(m.id), 'happy')}</div><div class="qbody"><b>${m.name}</b>（${m.sname}）
   <div class="qtext">${h.active ? `「しゅくだいを てつだって！」<br><small>${h.active.label}</small>` : h.cool ? `ありがとう！ また あとで たのむね<br><small>あと ${h.cool}ぷん</small>` : `<small>${NOT_YET[m.subj] || ''}</small>`}</div>
   ${h.active ? `<a class="big" href="${hwLink(m, h.active)}" style="text-decoration:none;text-align:center;display:block">✏️ てつだう</a>` : ''}</div></div>`; }).join('')}</div>
  <p class="muted" style="margin:6px 0 0">かなえた おねがい：${done} / ${QUESTS.length}</p>
  <div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  wide();
}
/* ---------- モブじゅうにんの しゅくだい ---------- */
// かなえてから 1じかん たつと、あたらしい しゅくだい（もんだい・レベルは ランダム）
function hwState(m) {
  const now = Date.now(); let st = town.mobs[m.id];
  if (!st || (st.doneAt && now - st.doneAt >= HW_COOLDOWN)) {
    const h = newHomework(m.subj); if (!h) return {};
    st = town.mobs[m.id] = { key: h.key, label: h.label, at: now }; saveSoon();
  }
  if (st.doneAt) return { cool: Math.max(1, Math.ceil((st.doneAt + HW_COOLDOWN - now) / 60000)) };
  return { active: st };
}
const hwLink = (m, st) => `${m.page}#hw=${m.id}|${st.key}`;
function openHomework(m) {
  const h = hwState(m);
  showPop(`${charSVG(mobEquip(m.id), h.active ? 'normal' : 'happy', 'hop')}<h3>${m.name}</h3>
  ${h.active ? `<div style="font-weight:800;font-size:17px">「${m.sname}の しゅくだいを てつだって！」</div><div class="muted" style="margin:6px 0">${h.active.label}</div><div>おわったら まちに もどってきてね。おれいに ⭐${HW_REWARD}</div>
   <div class="btns"><button class="big gray" data-act="close">あとで</button><a class="big" href="${hwLink(m, h.active)}" style="text-decoration:none;text-align:center">✏️ てつだう</a></div>`
    : h.cool ? `<div>この まえは ありがとう！<br>また あとで たのむね（あと ${h.cool}ぷん）</div><div class="btns"><button class="big" data-act="close">うん！</button></div>`
      : `<div>${NOT_YET[m.subj] || 'いまは だいじょうぶ！'}</div><div class="btns"><button class="big" data-act="close">うん！</button></div>`}`);
}
// しゅくだいが おわっていたら おれい（おうちの データ S.hw に おわった じこくが はいる）
function hwCheck() {
  for (const m of MOBS) {
    const st = town.mobs[m.id];
    if (!st || st.doneAt || !(S.hw && S.hw[m.id] > st.at)) continue;
    st.doneAt = Date.now(); S.points += HW_REWARD; save(); saveNow(); updPts();
    if ($id('ov').classList.contains('hide')) {
      beep(523); setTimeout(() => beep(659), 90); setTimeout(() => beep(784), 180);
      showPop(`<div class="srlabel">📒 しゅくだい おわったよ！</div>${charSVG(mobEquip(m.id), 'happy', 'hop')}<h3>${m.name}</h3><div>「てつだって くれて ありがとう！」</div><div class="stars" style="margin:8px 0">⭐＋${HW_REWARD}</div><div class="muted">1じかん たったら また たのむね</div><div class="btns"><button class="big" data-act="close">どういたしまして！</button></div>`);
    }
  }
}

function claimQuest(id) {
  const q = QUEST[id]; if (!q || town.quests.done.includes(id)) return;
  const [have, need] = q.check(town, PART); if (have < need) return openQuests();
  town.quests.done.push(id); if (!town.unlockedParts.includes(q.reward)) town.unlockedParts.push(q.reward); saveNow();
  beep(523); setTimeout(() => beep(659), 90); setTimeout(() => beep(784), 180); setTimeout(() => beep(1047, .15), 280);
  showPop(`<div class="srlabel">🎁 おねがい かなえたよ！</div><img class="bigprev" alt="" src="${iconURL(q.reward)}"><h3>${PART[q.reward].name}</h3><div>ありがとう！ おれいに これを どうぞ。<br>「つくる」で おけるよ（おみせには ない とくべつな もの）</div>
  <div class="btns"><button class="big gray" data-act="tquests">おねがいへ</button><button class="big" data-act="tuse" data-arg="${q.reward}">つくる</button></div>`);
  questBadge(); if (ui.mode === 'build') renderBuild();
}
Object.assign(ACT, { tclaim: id => claimQuest(id), tquests: () => openQuests() });

/* ---------- まちレベル・あたらしい とち ---------- */
function levelInfo() { return scoreTown(town, PART); }
function showLevel() {
  const L = levelInfo(), lv = town.townLevel, nx = AREAS.find(a => a.lv > lv);
  $id('lv').textContent = 'Lv' + lv;
  const pr = L.next == null ? 1 : Math.max(0, Math.min(1, (L.score - L.prev) / (L.next - L.prev)));
  $id('lvbar').style.width = (pr * 100) + '%';
  return { L, nx };
}
// レベルが あがったら とちを ひらく（いちど ひらいた とちは とじない）
function checkLevel(quiet) {
  const L = levelInfo();
  if (L.lv > town.townLevel) {
    const before = town.townLevel; town.townLevel = L.lv;
    const opened = AREAS.filter(a => a.lv <= L.lv && !town.unlockedAreas.includes(a.id)).filter(a => openArea(town, a.id));
    if (opened.length) { people.changed(town); ui.dirtyGround = true; }
    if (!quiet) levelUp(before, L.lv, opened);
    saveSoon();
  }
  showLevel();
}
function levelUp(from, to, opened) {
  beep(523); setTimeout(() => beep(659), 100); setTimeout(() => beep(784), 200); setTimeout(() => beep(1047, .15), 320);
  showPop(`<div class="srlabel">🎉 まち レベル アップ！</div><h3>Lv${from} → Lv${to}</h3>
  ${opened.length ? `<div>あたらしい とちが ひらいたよ！</div><div style="font-size:20px;font-weight:800;margin:6px 0">${opened.map(a => a.icon + ' ' + a.name).join('<br>')}</div>` : '<div>まちが すてきに なってきたね！</div>'}
  <div class="btns">${opened.length ? `<button class="big" data-act="tgoarea" data-arg="${opened[0].id}">みに いく</button>` : '<button class="big" data-act="close">やったー！</button>'}</div>`);
}
function openLevel() {
  const { L, nx } = showLevel();
  const rows = Object.entries(L.parts).map(([k, v]) => `<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`).join('');
  showPop(`<h3>🏙️ まち レベル ${town.townLevel}</h3>
  <div>まちの すてきポイント：<b>${L.score}</b>${L.next != null ? `　つぎの レベルまで あと <b>${Math.max(0, L.next - L.score)}</b>` : ''}</div>
  <table style="margin:8px auto;font-weight:800;font-size:14px;border-spacing:12px 2px">${rows}</table>
  <div class="muted" style="margin:0">いろんな しゅるいを おいたり、なかまを すませたり、こうえんを つくると あがるよ</div>
  ${nx ? `<div style="margin-top:8px;font-weight:800">つぎの とち：${nx.icon} ${nx.name}（Lv${nx.lv}）</div>` : '<div style="margin-top:8px;font-weight:800">ぜんぶの とちが ひらいたよ！</div>'}
  <div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
}
function paintAt(cx, cy) {
  const id = ui.tool.id;
  if (PART[id].paint) { // かべ：なぞった マスに 1こずつ おく
    const o = { type: id, x: cx, y: cy, r: 0 }; if (!canPlace(town, o).ok) return false;
    town.objects.push({ id: 'o' + town.seq++, ...o }); return true;
  }
  if (!canPaint(town, cx, cy, id)) return false;
  if (id === 'grass') delete town.ground[cx + ',' + cy]; else town.ground[cx + ',' + cy] = id;
  ui.dirtyGround = true; return true;
}

let ac = null;
function beep(f, d = .07, type = 'sine', v = .14) { try { if (S.settings && S.settings.sound === false) return; ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), gg = ac.createGain(); o.type = type; o.frequency.value = f; gg.gain.setValueAtTime(v, ac.currentTime); gg.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d + .05); o.connect(gg).connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .06); } catch { } }
const pop = () => { beep(520); setTimeout(() => beep(780), 60); };

function tapBuild(wx, wy) {
  const cx = Math.floor(wx), cy = Math.floor(wy), tl = ui.tool;
  if (!tl) return;
  if (tl.kind === 'part' && (PART[tl.id].layer === 'ground' || PART[tl.id].paint)) return; // ぬる・かべ は pointer で
  if (tl.kind === 'part' || ui.moving) {
    const type = ui.moving ? ui.moving.type : tl.id, r = ui.moving ? (ui.pending ? ui.pending.r : ui.moving.r) : (tl.r || 0), tp = !ui.moving && tplOf(tl);
    const size = ui.moving ? ui.moving.size : tp ? tp.size : undefined, look = ui.moving ? ui.moving.look : tp ? tp.look : undefined;
    const a = anchorFor(type, r, cx, cy, size), o = { type, r, ...a, size, look };
    const c = canPlace(town, o, ui.moving && ui.moving.id);
    if (ui.pending && ui.pending.x === a.x && ui.pending.y === a.y && c.ok) { placePending(); return; }
    setPending({ ...o, ok: c.ok, reason: c.reason });
    if (!c.ok) { toast(MSG[c.reason] || MSG.out, true); beep(200, .08, 'square', .05); } else beep(700, .03);
    return;
  }
  if (tl.kind === 'select') { ui.sel = objectAt(wx, wy); beep(660, .03); renderAct(); }
}

function tapView(wx, wy) {
  const p = people.at(wx, wy);
  if (p && p.mob) { beep(880, .05); return openHomework(MOB[p.id]); }
  if (p) { const aq = activeQuestsCache.find(a => a.who === p.id); if (aq && Math.random() < .6) { p.say = aq.ok ? 'できたね！ おねがいを みて！' : aq.q.text; p.sayT = 3.5; } else people.talk(p); beep(880, .05); return; }
  const o = objectAt(wx, wy); if (!o) return;
  if (o.type === 'town_shop') return openShop();
  if (o.type === 'moko_house') return openMokoHouse(o);
  if (PART[o.type] && PART[o.type].home) return openResidents(o);
}

/* ---------- ゆび・マウス ---------- */
function setupInput() {
  const pts = new Map(); let st = null, pinch = null, painting = false;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const mid = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  const paintMode = () => ui.mode === 'build' && ui.tool && ui.tool.kind === 'part' && (PART[ui.tool.id].layer === 'ground' || PART[ui.tool.id].paint);
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      st = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, multi: false };
      if (paintMode()) { painting = true; hist.push(); const [wx, wy] = toWorld(e.clientX, e.clientY); if (paintAt(Math.floor(wx), Math.floor(wy))) beep(600, .02, 'sine', .06); }
    } else if (pts.size === 2) { if (st) st.multi = true; if (painting) { painting = false; } pinch = { d: dist(), m: mid() }; }
  });
  cv.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1 && st && !st.multi) {
      if (!st.moved && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 8) st.moved = true;
      if (painting) { const [wx, wy] = toWorld(e.clientX, e.clientY); if (paintAt(Math.floor(wx), Math.floor(wy))) beep(600, .02, 'sine', .05); }
      else if (st.moved) { cam.x -= (e.clientX - st.lx) / T(); cam.y -= (e.clientY - st.ly) / T(); clampCam(); }
      st.lx = e.clientX; st.ly = e.clientY;
    } else if (pts.size === 2 && pinch) {
      const d = dist(), m = mid();
      const [bx, by] = toWorld(m.x, m.y);
      if (pinch.d > 0) cam.zoom *= d / pinch.d; clampCam();
      const [ax, ay] = toWorld(m.x, m.y); cam.x += bx - ax; cam.y += by - ay;
      cam.x -= (m.x - pinch.m.x) / T(); cam.y -= (m.y - pinch.m.y) / T(); clampCam();
      pinch = { d, m };
    }
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size === 0) {
      if (painting) { painting = false; if (hist.undo.length && hist.undo[hist.undo.length - 1] === hist.snap()) hist.undo.pop(); else changed(); }
      else if (st && !st.moved && !st.multi && e.type === 'pointerup') { const [wx, wy] = toWorld(e.clientX, e.clientY); ui.mode === 'build' ? tapBuild(wx, wy) : tapView(wx, wy); }
      else saveSoon();
      st = null; pinch = null;
    } else if (pts.size === 1) { pinch = null; const [p] = pts.values(); st = { x: p.x, y: p.y, lx: p.x, ly: p.y, moved: true, multi: true }; }
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); const [bx, by] = toWorld(e.clientX, e.clientY); cam.zoom *= Math.exp(-e.deltaY * .0015); clampCam(); const [ax, ay] = toWorld(e.clientX, e.clientY); cam.x += bx - ax; cam.y += by - ay; clampCam(); saveSoon(); }, { passive: false });
  document.addEventListener('gesturestart', e => e.preventDefault());
}

/* ---------- つくる パネル ---------- */
const iconCache = new Map();
function iconURL(id, look) {
  const k = id + JSON.stringify(look || ''); if (iconCache.has(k)) return iconCache.get(k);
  const c = document.createElement('canvas'); c.width = c.height = 116; drawIcon(c, id, look);
  const u = c.toDataURL(); iconCache.set(k, u); return u;
}
const BUILD_CATS = CATS.filter(c => c.id !== 'look');
function renderBuild() {
  $id('bcats').innerHTML = BUILD_CATS.map(c => `<button class="${c.id === ui.cat ? 'on' : ''}" data-c="${c.id}">${c.icon} ${c.name}</button>`).join('');
  const list = PARTS.filter(p => p.cat === ui.cat && !p.fixed && hasPart(town, p.id));
  const tpls = ui.cat === 'house' ? town.templates.filter(x => hasPart(town, x.type)) : [];
  $id('bparts').innerHTML = tpls.map(x => `<button class="pt tpl ${ui.tool && ui.tool.tpl === x.id ? 'on' : ''}" data-tpl="${x.id}"><img alt="" src="${iconURL(x.type, { ...x.look, size: x.size })}">⭐ おきにいり<i class="x" data-deltpl="${x.id}">×</i></button>`).join('') + list.map(p => `<button class="pt ${ui.tool && ui.tool.kind === 'part' && !ui.tool.tpl && ui.tool.id === p.id ? 'on' : ''}" data-p="${p.id}"><img alt="" src="${iconURL(p.id)}">${p.name}</button>`).join('')
    + `<button class="pt more" data-shop="${ui.cat}"><span>🛍️</span>おみせで<br>ふやす</button>`;
  $id('tSel').classList.toggle('on', !!ui.tool && ui.tool.kind === 'select');
  refreshUndo();
}
function refreshUndo() { if (!hist) return; $id('tUndo').disabled = !hist.undo.length; $id('tRedo').disabled = !hist.redo.length; }
function chooseTool(tl) {
  ui.tool = tl; ui.pending = null; ui.sel = null; ui.moving = null;
  if (tl && tl.kind === 'part') hint(PART[tl.id].layer === 'ground' ? 'ゆびで なぞって ぬろう（ふたゆびで うごかす）' : PART[tl.id].paint ? 'ゆびで なぞって かべを つくろう（ふたゆびで うごかす）' : 'おきたい ところを タップ → もういちど タップで おく');
  else if (tl && tl.kind === 'select') hint('うごかしたい もの・けしたい ものを タップ');
  else hint('');
  renderBuild(); renderAct();
}
function setMode(m) {
  ui.mode = m; ui.pending = null; ui.sel = null; ui.moving = null;
  $id('build').hidden = m !== 'build'; $id('tnav').hidden = m === 'build';
  if (m === 'build') { if (!ui.tool) ui.tool = { kind: 'part', id: 'house_basic', r: 0 }; chooseTool(ui.tool); }
  else { hint(''); renderAct(); }
}

// えらんだ もの・プレビュー の ボタン
function renderAct() {
  const a = $id('act'), b = [];
  if (ui.mode === 'build' && ui.pending) {
    const p = PART[ui.pending.type];
    if (p.rotate) b.push(`<button data-a="rot">🔄 まわす</button>`);
    b.push(`<button data-a="cancel">やめる</button>`);
    b.push(`<button class="go" data-a="place" ${ui.pending.ok ? '' : 'disabled'}>✓ ${ui.moving ? 'ここへ うごかす' : 'ここに おく'}</button>`);
  } else if (ui.mode === 'build' && ui.moving) {
    b.push(`<button data-a="cancel">やめる</button>`);
    hint('どこへ うごかす？ タップしてね');
  } else if (ui.mode === 'build' && ui.sel) {
    const p = PART[ui.sel.type];
    b.push(`<button data-a="move">✋ うごかす</button>`);
    if (p.rotate) b.push(`<button data-a="rotsel">🔄 まわす</button>`);
    if ((p.home && !p.bed) || ui.sel.type === 'moko_house') b.push(`<button data-a="looks">🎨 みため</button>`);
    if (p.home) b.push(`<button data-a="res">🐾 すむひと</button>`);
    if (!p.fixed) b.push(`<button class="del" data-a="del">🗑 けす</button>`);
  }
  a.innerHTML = b.join(''); a.hidden = !b.length;
  const panel = ui.mode === 'build' ? $id('build') : $id('tnav');
  a.style.bottom = (panel.offsetHeight + 12) + 'px';
}
function setupButtons() {
  $id('bBuild').onclick = () => { beep(660, .03); setMode('build'); };
  $id('tDone').onclick = () => { beep(660, .03); setMode('view'); saveNow(); };
  $id('tSel').onclick = () => chooseTool({ kind: 'select' });
  $id('tUndo').onclick = () => { if (hist.back()) { ui.dirtyGround = true; ui.sel = null; ui.pending = null; ui.moving = null; changed(); renderAct(); beep(500, .04); } };
  $id('tRedo').onclick = () => { if (hist.fwd()) { ui.dirtyGround = true; ui.sel = null; ui.pending = null; ui.moving = null; changed(); renderAct(); beep(560, .04); } };
  $id('bcats').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; ui.cat = b.dataset.c; beep(660, .03); renderBuild(); });
  $id('bparts').addEventListener('click', e => {
    const s = e.target.closest('[data-shop]'); if (s) return openShop(s.dataset.shop);
    const d = e.target.closest('[data-deltpl]'); if (d) { town.templates = town.templates.filter(x => x.id !== d.dataset.deltpl); if (ui.tool && ui.tool.tpl === d.dataset.deltpl) ui.tool = null; saveSoon(); renderBuild(); toast('おきにいりから はずしたよ'); return; }
    const tb = e.target.closest('[data-tpl]'); if (tb) { const x = town.templates.find(y => y.id === tb.dataset.tpl); if (x) { beep(660, .03); chooseTool({ kind: 'part', id: x.type, r: 0, tpl: x.id }); } return; }
    const b = e.target.closest('[data-p]'); if (!b) return; beep(660, .03); chooseTool({ kind: 'part', id: b.dataset.p, r: 0 });
  });
  $id('act').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const k = b.dataset.a;
    if (k === 'place') placePending();
    else if (k === 'cancel') { ui.pending = null; if (ui.moving) { ui.sel = town.objects.find(o => o.id === ui.moving.id) || null; ui.moving = null; hint(''); } renderAct(); }
    else if (k === 'rot') { const pv = ui.pending, r = (pv.r + 1) % 2, a = { type: pv.type, r, x: pv.x, y: pv.y }, c = canPlace(town, a, ui.moving && ui.moving.id); setPending({ ...a, ok: c.ok, reason: c.reason }); if (ui.tool && ui.tool.kind === 'part') ui.tool.r = r; }
    else if (k === 'move') { ui.moving = { ...ui.sel }; ui.sel = null; renderAct(); }
    else if (k === 'rotsel') { const o = ui.sel, n = { ...o, r: (o.r + 1) % 2 }; if (canPlace(town, n, o.id).ok) { hist.push(); o.r = n.r; changed(); } else toast('まわすと はみだすよ', true); }
    else if (k === 'del') { hist.push(); town.objects = town.objects.filter(o => o !== ui.sel); ui.sel = null; changed(); renderAct(); beep(300, .08, 'triangle'); toast('けしたよ（もどす で もどせるよ）'); }
    else if (k === 'looks') openLooks(ui.sel);
    else if (k === 'res') openResidents(ui.sel);
    beep(660, .03);
  });
  $id('bShop').onclick = () => openShop();
  $id('bFriends').onclick = () => openFriends();
  $id('bQuest').onclick = () => openQuests();
  $id('lvchip').onclick = () => openLevel();
}

/* ---------- まちの おみせ（おへやの おみせとは べつ）---------- */
let shopCat = 'house';
function wide() { const p = document.querySelector('#ov .pop'); if (p) p.style.maxWidth = '560px'; }
function openShop(cat) {
  if (cat && CATS.some(c => c.id === cat)) shopCat = cat;
  const list = SHOP_PARTS.filter(p => p.cat === shopCat && p.price > 0).sort((a, b) => a.price - b.price);
  showPop(`<h3>🛍️ まちの おみせ</h3><div style="font-weight:800;color:#e0719a">⭐ ${S.points}</div>
  ${tabs(CATS.map(c => [c.id, c.icon + ' ' + c.name]), shopCat, 'tshopcat')}
  <div class="tshop"><div class="items">${list.map(p => { const own = hasPart(town, p.id); return `<button class="item ${own ? 'own' : ''}" data-act="tpart" data-arg="${p.id}"><img alt="" src="${iconURL(p.id)}"><div class="n">${p.name}</div><div class="p">${own ? '✔ つかえる' : '⭐' + p.price}</div></button>`; }).join('') || '<p class="muted">この カテゴリは ぜんぶ つかえるよ</p>'}</div></div>
  <p class="muted" style="margin:6px 0 0">かうと なんこでも おけるよ</p>
  <div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  wide();
}
function partInfo(id) {
  const p = PART[id], own = hasPart(town, id), need = p.price - S.points;
  showPop(`<img class="bigprev" alt="" src="${iconURL(id)}"><h3>${p.name}</h3>
  ${own ? '<div>✔ もう つかえるよ</div>' : need > 0 ? `<div>⭐${p.price}　<b style="color:#c63d46">あと ⭐${need}</b></div><div class="muted">おべんきょうで あつめよう！</div>` : `<div>⭐${p.price} で かう？</div>`}
  <div class="btns"><button class="big gray" data-act="tshop">もどる</button>${!own && need <= 0 ? `<button class="big" data-act="tbuy" data-arg="${id}">かう！</button>` : own && p.cat !== 'look' ? `<button class="big" data-act="tuse" data-arg="${id}">つくる</button>` : ''}</div>`);
}
// かう：さきに パーツを つかえる ように して まちを ほぞん → それから ⭐を へらして ほぞん
// （とちゅうで とまっても「⭐だけ へって つかえない」には ならない）
function buy(id) {
  const p = PART[id];
  if (!p || p.fixed || hasPart(town, id) || S.points < p.price) return partInfo(id);
  town.unlockedParts.push(id); saveNow();
  S.points -= p.price; save();
  beep(523); setTimeout(() => beep(659), 90); setTimeout(() => beep(784), 180);
  showPop(`<img class="bigprev" alt="" src="${iconURL(id)}"><h3>つかえる ように なったよ！</h3><div>${p.name}${p.cat === 'look' ? '：おうちを えらんで「みため」で かえられるよ' : '：「つくる」で なんこでも おけるよ'}</div>
  <div class="btns"><button class="big gray" data-act="tshop">おみせに もどる</button>${p.cat !== 'look' ? `<button class="big" data-act="tuse" data-arg="${id}">つくる</button>` : ''}</div>`);
  if (ui.mode === 'build') renderBuild();
}
Object.assign(ACT, {
  tgoarea: id => { closePop(); const a = AREA[id]; if (a) { cam.x = (a.x0 + a.x1 + 1) / 2; cam.y = (a.y0 + a.y1 + 1) / 2; clampCam(); saveSoon(); } },
  close: () => { closePop(); beep(600, .03); }, // とじる・まちに いる・おわり（core.js には ない ので ここで きめる）
  tshopcat: c => { shopCat = c; openShop(); },
  tshop: () => openShop(),
  tpart: id => { beep(660, .03); partInfo(id); },
  tbuy: id => buy(id),
  tuse: id => { closePop(); const p = PART[id]; ui.cat = p.cat; setMode('build'); chooseTool({ kind: 'part', id, r: 0 }); },
});

/* ---------- じゅうにん ---------- */
function liveIn(c) { return town.objects.find(o => (o.residents || []).includes(c)); }
function openResidents(o) {
  const chars = myChars().filter(c => c !== avatar()), name = PART[o.type].name;
  showPop(`<h3>${name}</h3><div style="font-weight:800">この おうちに だれが すむ？（2にん まで）</div>
  <div class="people" style="margin-top:8px">${chars.map(c => { const h = liveIn(c), here = h && h.id === o.id; return `<button class="person ${here ? 'on' : ''}" data-act="tres" data-arg="${o.id}|${c}">${charHTML(c)}${ITEM[c].name}<small>${here ? '✔ すんでいる' : h ? 'ほかの おうちに すんでいる' : ''}</small></button>`; }).join('') || '<p class="muted">ガチャや おみせで なかまを ふやそう！</p>'}</div>
  <p class="muted" style="margin:6px 0 0">${ITEM[avatar()].name} は モコの おうちに すんでいるよ</p>
  <div class="btns"><button class="big gray" data-act="close">とじる</button>${PART[o.type].bed ? '' : `<button class="big sub" data-act="tlooks" data-arg="${o.id}">🎨 みため</button>`}</div>
  ${PART[o.type].bed ? '' : `<div class="btns" style="margin-top:8px"><button class="big" data-act="tinside" data-arg="${o.id}">🏠 なかを みる</button></div>`}`);
  wide();
}
function toggleResident(oid, c) {
  const o = town.objects.find(x => x.id === oid); if (!o || !owns(c)) return;
  const here = (o.residents || []).includes(c);
  if (here) o.residents = o.residents.filter(x => x !== c);
  else {
    if ((o.residents || []).length >= 2) { toast('2にん まで だよ', true); return; }
    for (const x of town.objects) if (x.residents) x.residents = x.residents.filter(y => y !== c); // ひっこし
    o.residents = [...(o.residents || []), c];
    toast(`${ITEM[c].name} が すむ ことに なったよ！`);
  }
  people.sync(town, avatar(), MOBS.map(m => m.id)); saveNow(); beep(here ? 400 : 700, .06); openResidents(o); checkLevel(); questBadge();
}
function openMokoHouse(o) {
  showPop(`${charSVG(S.equip, 'happy', 'hop')}<h3>モコの おうち</h3><div>おへやに もどる？</div>
  <div class="btns"><button class="big gray" data-act="close">まちに いる</button><a class="big" href="../index.html" style="text-decoration:none;text-align:center">🏠 おへやへ</a></div>
  <div class="btns" style="margin-top:8px"><button class="big sub" data-act="tlooks" data-arg="${o.id}">🎨 おうちの みため</button></div>`);
}
function openFriends() {
  const chars = myChars();
  showPop(`<h3>🐾 まちの なかま</h3>
  <div class="people">${chars.map(c => { const h = c === avatar() ? town.objects.find(o => o.type === 'moko_house') : liveIn(c); return `<button class="person ${h ? 'on' : 'off'}" data-act="tfind" data-arg="${c}">${charHTML(c)}${ITEM[c].name}<small>${h ? PART[h.type].name : 'おうちが まだ ないよ'}</small><small>すき：${FAV_NAME[FAV[c] || 'park']}</small></button>`; }).join('')}</div>
  <p class="muted" style="margin:6px 0 0">おうちを タップすると すむ ひとを きめられるよ</p>
  <div class="btns"><button class="big gray" data-act="close">とじる</button></div>`);
  wide();
}
Object.assign(ACT, {
  tres: a => { const [oid, c] = a.split('|'); toggleResident(oid, c); },
  tfind: c => { closePop(); const p = people.list.find(q => q.id === c); if (p && p.state !== 'home') { cam.x = p.x + .5; cam.y = p.y; people.talk(p); } else { const h = c === avatar() ? town.objects.find(o => o.type === 'moko_house') : liveIn(c); if (h) { cam.x = h.x + 1; cam.y = h.y + 1; toast(h ? 'おうちの なかに いるよ' : ''); } else toast('おうちを たてて すんで もらおう！'); } clampCam(); },
  tlooks: id => openLooks(town.objects.find(o => o.id === id)),
});

/* ---------- おうちの なか（おへやで もっている かぐ・かべ・ゆかで かざる）---------- */
// o.room = { wall, floor, furn:[] }（もっている もの だけ つかえる。おへやと おなじ かぐを つかっても だいじょうぶ）
let inTab = 'furn';
function roomOf(o) { const r = o.room || {}; return { wall: r.wall && owns(r.wall) ? r.wall : 'w_cream', floor: r.floor && owns(r.floor) ? r.floor : 'f_wood', furn: (r.furn || []).filter(owns) }; }
function openInside(o, tab) {
  if (!o) return closePop(); if (tab) inTab = tab;
  const r = roomOf(o), who = (o.residents || []).filter(owns).slice(0, 2);
  const svg = roomSVG({ equip: { wall: r.wall, floor: r.floor }, furn: r.furn }, 'happy', 'sway', who.map(lookFor));
  const list = S.owned.filter(id => ITEM[id] && ITEM[id].cat === inTab);
  const sel = id => inTab === 'furn' ? r.furn.includes(id) : r[inTab] === id;
  showPop(`<h3>🏠 ${PART[o.type].name}の なか</h3><div class="inroom">${svg}</div>
  <div class="muted" style="margin:4px 0">${who.length ? who.map(c => ITEM[c].name).join(' と ') + ' が すんでいるよ' : 'まだ だれも すんで いないよ'}</div>
  ${tabs([['furn', '🪴 かぐ'], ['wall', '🧱 かべ'], ['floor', '🟫 ゆか']], inTab, 'tintab')}
  <div class="items intems">${list.map(id => `<button class="item ${sel(id) ? 'sel' : ''}" data-act="tinset" data-arg="${o.id}|${id}">${thumb(ITEM[id])}<div class="n">${ITEM[id].name}</div>${inTab === 'furn' ? `<div class="p">${sel(id) ? 'おいてる' : ''}</div>` : ''}</button>`).join('') || '<p class="muted">おへやの おみせや ガチャで あつめよう！</p>'}</div>
  <div class="btns"><button class="big gray" data-act="close">とじる</button>${who.length < 2 ? `<button class="big sub" data-act="tresof" data-arg="${o.id}">🐾 すむひと</button>` : ''}</div>`);
  wide();
}
function setInside(oid, id) {
  const o = town.objects.find(x => x.id === oid), it = ITEM[id]; if (!o || !it || !owns(id)) return;
  const r = roomOf(o);
  if (it.cat === 'furn') r.furn = r.furn.includes(id) ? r.furn.filter(x => x !== id) : [...r.furn, id];
  else if (it.cat === 'wall' || it.cat === 'floor') r[it.cat] = id;
  o.room = r; saveSoon(); beep(700, .04); openInside(o);
}
Object.assign(ACT, {
  tinside: id => { lastInside = id; openInside(town.objects.find(o => o.id === id), 'furn'); },
  tintab: k => { inTab = k; openInside(town.objects.find(o => o.id === lastInside)); },
  tinset: a => { const [oid, id] = a.split('|'); lastInside = oid; setInside(oid, id); },
  tresof: id => openResidents(town.objects.find(o => o.id === id)),
});
let lastInside = null;

/* ---------- おうちの みため ---------- */
function openLooks(o) {
  if (!o) return closePop();
  const p = PART[o.type], look = { ...(p.look || {}), ...(o.look || {}) };
  if (!look.shape) look.shape = o.type === 'house_castle' || o.type === 'school' ? 'flat' : 'gable';
  if (!Array.isArray(look.deco)) look.deco = [];
  const on = (kind, v) => kind === 'deco' ? look.deco.includes(v) : look[kind] === v;
  const row = (kind, label) => `<h4>${label}</h4><div class="swl">${LOOK(kind).filter(x => hasPart(town, x.id)).map(x => { const v = x.id.replace(kind + '_', ''); return `<button class="${on(kind, v) ? 'on' : ''}" data-act="tlook" data-arg="${o.id}|${kind}|${v}"><img alt="" src="${iconURL(x.id)}">${x.name.replace(/の (やね|かべ|ドア|まど)$/, '')}</button>`; }).join('')}</div>`;
  const sizes = p.custom ? `<h4>おおきさ</h4><div class="swl">${CUSTOM_SIZES.map(([w, h]) => { const cur = sizeOf(o); return `<button class="${cur[0] === w && cur[1] === h ? 'on' : ''}" data-act="tlook" data-arg="${o.id}|size|${w}x${h}"><b style="font-size:18px">${w}×${h}</b><br>マス</button>`; }).join('')}</div>` : '';
  showPop(`<h3>🎨 みためを かえる</h3><img class="bigprev" alt="" src="${iconURL(o.type, { ...look, size: o.size })}">
  <div class="looks">${sizes}${row('shape', 'やねの かたち')}${row('roof', 'やねの いろ')}${row('wall', 'かべ')}${row('door', 'ドア')}${row('window', 'まど')}${row('deco', 'かざり（いくつでも）')}</div>
  <div class="btns"><button class="big gray" data-act="close">おわり</button><button class="big sub" data-act="tshopcat" data-arg="look">🛍️ ふやす</button></div>
  ${p.home ? `<div class="btns" style="margin-top:8px"><button class="big" data-act="ttpl" data-arg="${o.id}">⭐ おきにいりに いれる</button></div>` : ''}`);
  wide();
}
ACT.tlook = a => {
  const [oid, kind, v] = a.split('|'); const o = town.objects.find(x => x.id === oid); if (!o) return;
  if (kind === 'size') { const sz = v.split('x').map(Number), c = canPlace(town, { ...o, size: sz }, o.id); if (!c.ok) { toast('その おおきさだと ぶつかるよ', true); beep(200, .08, 'square', .05); return; } hist.push(); o.size = sz; changed(); beep(700, .04); return openLooks(o); }
  hist.push();
  const base = { ...(PART[o.type].look || {}), ...(o.look || {}) };
  if (kind === 'deco') { const d = Array.isArray(base.deco) ? base.deco : []; base.deco = d.includes(v) ? d.filter(x => x !== v) : [...d, v]; } else base[kind] = v;
  o.look = base; changed(); beep(700, .04); openLooks(o);
};
// おきにいり（テンプレート）：おなじ みための おうちを なんけんでも
ACT.ttpl = oid => {
  const o = town.objects.find(x => x.id === oid); if (!o) return;
  if (town.templates.length >= 8) { toast('おきにいりは 8こ まで だよ', true); return; }
  const type = o.type === 'moko_house' ? 'house_basic' : o.type;
  town.templates.push({ id: 't' + Date.now().toString(36), type, look: JSON.parse(JSON.stringify({ ...(PART[o.type].look || {}), ...(o.look || {}) })), size: o.size ? [...o.size] : undefined });
  saveSoon(); beep(784, .06); toast('おきにいりに いれたよ！「つくる」の おうちで つかえるよ');
};

/* ---------- はじめる ---------- */
async function start() {
  // おうちの データ（core.js の ready）と まちの データを いっしょに よむ（どちらも まちじかんの じょうげん つき）
  [, town] = await Promise.all([ready, loadTown()]);
  hist = new History(town);
  Object.assign(cam, town.camera || {});
  people = new People(); people.sync(town, avatar(), MOBS.map(m => m.id));
  resize(); setupInput(); setupButtons();
  $id('tname').textContent = town.townName;
  updPts();
  checkLevel(true);
  questBadge();
  setTimeout(hwCheck, 400);
  // あたらしい なかま（ガチャ・おみせで ふえた キャラ）
  const mine = myChars();
  if (!Array.isArray(town.knownChars)) town.knownChars = mine;
  else { const nw = mine.filter(c => !town.knownChars.includes(c)); if (nw.length) { town.knownChars.push(...nw); setTimeout(() => toast(`あたらしい なかまが ふえたよ！ ${ITEM[nw[0]].name}${nw.length > 1 ? ` ほか ${nw.length - 1}にん` : ''}`), 600); } }
  saveTown(town);
  requestAnimationFrame(t => { last = t; frame(t); });
  // テスト・あとの フェーズ よう
  window.__town = { get town() { return town; }, cam, ui, people, hist, toScreen, toWorld, setMode, chooseTool, tapBuild, tapView, placePending, buy, toggleResident, saveNow, objectAt, levelInfo, checkLevel, openInside, setInside, changed, activeQuests, claimQuest, openLooks, hwState, hwCheck, openHomework };
  document.body.dataset.ready = '1';
}
// ほかの へやで ⭐ が かわったら（core.js の resync から よばれる）
window.render = () => { updPts(); if (town) hwCheck(); };
start();

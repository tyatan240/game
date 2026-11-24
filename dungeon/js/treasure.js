// たからさがしダンジョン：カードを もらう・めくる えんしゅつ・アルバム（カードずかん）・たからさがしの メニュー
// main.js から initTreasure(ctx) で D・speak・stars・toast・sfx を もらって つかう（ゲームの きまりは game.js）
import { CARDS, CARD, LETTERS, CARD_TOTAL, SHARDS, CARD_STARS } from './cards.js';
import { wordArt } from './art.js';

let X = null;
export function initTreasure(ctx) { X = ctx; }
const TD = () => X.D().treasure;
const RARE_NAME = { 1: 'ふつう', 2: 'レア', 3: 'キラ' };
const stars = r => '★'.repeat(r);

// 20かい クリアで あそべる（管理者モードでは さいしょから）
export function treasureUnlocked() {
  const D = X.D();
  return !!(D.rewarded.clear || D.clears > 0 || (typeof ADMIN === 'function' && ADMIN()));
}
export const cardCount = () => Object.keys(TD().cards).length;

/* ---------- カードを えらぶ・もらう ---------- */
// おなじ レアの なかでは まだ もっていない カードが すこし でやすい（6わり）
export function pickCard(rare) {
  const list = CARDS.filter(c => c.rare === rare), un = list.filter(c => !TD().cards[c.id]);
  const pool = un.length && Math.random() < 0.6 ? un : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
// カードを もらう（すぐ ほぞん。たおれても のこる）→ { card, isNew, shards, badge }
export function giveCard(rare, run) {
  const T = TD(), card = pickCard(rare), had = T.cards[card.id];
  const res = { card, isNew: !had, shards: 0, badge: false };
  if (had) { had.n++; res.shards = SHARDS[card.rare]; T.shards += res.shards; }
  else {
    T.cards[card.id] = { n: 1, first: Date.now() };
    X.stars(CARD_STARS[card.rare], `あたらしい カード ${card.en}`);
    if (CARDS.filter(c => c.letter === card.letter).every(c => T.cards[c.id]) && !T.badges.includes(card.letter)) {
      T.badges.push(card.letter); res.badge = true;
      setTimeout(() => X.stars(CARD_STARS.badge, `「${card.letter}」の バッジ！`), 1600);
    }
    if (cardCount() >= CARD_TOTAL && !T.rewarded.complete) { // 78まい コンプリート：⭐100 と きねんの かんむり（おうちの きせかえ）
      T.rewarded.complete = true; res.complete = true;
      try { if (typeof grantItem === 'function') { grantItem('h_treasure'); save(); } } catch (e) { }
      setTimeout(() => X.stars(CARD_STARS.complete, 'カード コンプリート！'), 2600);
    }
  }
  if (run) (run.cards = run.cards || []).push(card.id);
  X.save();
  queue.push(res);
  return res;
}

/* ---------- カードの みため ---------- */
// カード 1まいの HTML（あとで data-art に え を いれる）。size：'s'（アルバム）・'m'（めくる）・'l'（おおきく）
// レアカードの きらきら（ばしょと はやさを ずらした ほし）
const SPARKS = [[14, 18, 0], [82, 12, .6], [70, 46, 1.2], [20, 58, .3], [88, 70, 1.6], [46, 8, 2.1], [10, 84, .9], [60, 86, 1.9], [32, 30, 1.4], [92, 40, .2], [6, 40, 1.7], [38, 72, .5], [78, 90, 1.1], [52, 54, 2.4]].map(([x, y, d], i) => `<i style="left:${x}%;top:${y}%;animation-delay:${d}s;--s:${[1, .7, 1.3, .8][i % 4]}"></i>`).join('');
export function cardHTML(card, size = 'm') {
  const w = card.en, first = w[0], rest = w.slice(1);
  return `<div class="tcard r${card.rare} ${size}" data-card="${card.id}">
    <div class="tc-in">${card.rare > 1 ? `<div class="bgfx"></div>${card.rare === 3 ? '<div class="bgfx2"></div><div class="bokeh"></div>' : ''}<div class="glitter"></div><div class="sparks">${SPARKS}</div>` : ''}
      <div class="tc-top"><span class="tc-no">No.${String(card.no).padStart(3, '0')}</span><span class="tc-rare">${stars(card.rare)}</span></div>
      <div class="tc-big">${card.letter}</div>
      <div class="tc-art" data-art="${card.art}"></div>
      <div class="tc-name"><b>${first}</b>${rest}</div>
      <div class="tc-ja">${card.ja}</div>${card.rare === 3 ? '<div class="tc-rib">★ キラカード ★</div>' : card.rare === 2 ? '<div class="tc-rib">レア</div>' : ''}
    </div>${card.rare === 3 ? '<div class="holo"></div><div class="glint"></div>' : card.rare === 2 ? '<div class="sheen"></div>' : ''}
  </div>`;
}
export function fillArt(root, px) {
  root.querySelectorAll('.tcard .tc-art[data-art]').forEach(el => { if (!el.firstChild) el.appendChild(wordArt(el.dataset.art, px || Math.round(el.getBoundingClientRect().width) || 80)); });
  // キラ：ゆびで なぞると ひかりが うごく
  root.querySelectorAll('.tcard.r3').forEach(el => {
    el.onpointermove = e => { const r = el.getBoundingClientRect(); el.style.setProperty('--hx', ((e.clientX - r.left) / r.width * 100) + '%'); el.style.setProperty('--hy', ((e.clientY - r.top) / r.height * 100) + '%'); el.classList.add('touch'); };
    el.onpointerleave = () => el.classList.remove('touch');
  });
}

/* ---------- カードを めくる えんしゅつ ---------- */
// うらむき（ひかりの いろで レアが すこし わかる）→ タップで めくる → よみあげ・NEW!
const queue = [];
let showing = false;
export const revealPending = () => queue.length > 0 || showing;
export function showReveals() {
  if (showing || !queue.length) return;
  if (!document.getElementById('ov').classList.contains('hide')) { setTimeout(showReveals, 400); return; } // ほかの がめんが おわってから
  showing = true;
  const r = queue.shift(), c = r.card;
  X.sfx.chest();
  showPop(`<div class="reveal">
    <div class="rv-head">たからの カード！</div>
    <div class="flip r${c.rare}" data-act="dgFlip"><div class="flip-in"><div class="back"><div class="back-mark">？</div></div><div class="front">${cardHTML(c, 'm')}</div></div></div>
    <div class="rv-msg">タップして めくろう</div>
    <div class="btns rv-btns" hidden><button class="big sub" data-act="dgRevealSay">🔊 きく</button><button class="big" data-act="dgRevealNext">${queue.length ? 'つぎの カード' : 'やったね！'}</button></div>
  </div>`);
  fillArt(document.getElementById('ov'), 110);
  current = r;
}
let current = null;
export function flipCard() {
  const el = document.querySelector('#ov .flip'); if (!el || el.classList.contains('open') || !current) return;
  el.classList.add('open');
  const r = current, c = r.card;
  setTimeout(() => {
    X.speak(`${c.letter}, ${c.en}!`);
    if (c.rare === 3) X.sfx.unlock(); else X.sfx.correct();
    const msg = document.querySelector('#ov .rv-msg');
    if (msg) msg.innerHTML = `${r.isNew ? '<b class="newb">NEW!</b> ' : ''}<b class="en">${c.en}</b>「${c.ja}」 ${stars(c.rare)} ${RARE_NAME[c.rare]}`
      + (r.isNew ? '' : `<br><small>もう もっている カード → きらきらの かけら ＋${r.shards}</small>`)
      + (r.badge ? `<br><b class="badgeb">「${c.letter}」の 3まいが そろった！ もじバッジ！</b>` : '')
      + (r.complete ? `<br><b class="badgeb">78まい ぜんぶ そろった！ コンプリート！<br>きねんの「たからさがしの かんむり」を もらったよ（おうちの きせかえ）</b>` : '');
    if (r.badge || r.complete) { const f = document.querySelector('#ov .reveal'); if (f) f.classList.add('party'); }
    const b = document.querySelector('#ov .rv-btns'); if (b) b.hidden = false;
  }, 550);
}
export const revealSay = () => { if (current) X.speak(`${current.card.letter}, ${current.card.en}!`); }; // なんかいでも きける
export function revealNext() { showing = false; current = null; closePop(); if (queue.length) setTimeout(showReveals, 150); else if (gachaOn) gachaPop(); else X.onRevealDone(); } // ガチャの あとは ガチャの がめんへ

/* ---------- アルバム（カードずかん）---------- */
let page = 'A';
export function albumPop(letter, back) {
  if (letter) page = letter;
  const T = TD(), got = cardCount();
  const strip = LETTERS.map(L => {
    const n = CARDS.filter(c => c.letter === L && T.cards[c.id]).length;
    return `<button class="al-l ${L === page ? 'on' : ''} ${n === 3 ? 'full' : n ? 'some' : ''}" data-act="dgAlbum" data-arg="${L}">${L}</button>`;
  }).join('');
  const slots = CARDS.filter(c => c.letter === page).map(c => {
    const own = T.cards[c.id];
    return own ? `<div class="al-slot" data-act="dgCardBig" data-arg="${c.id}">${cardHTML(c, 's')}${own.n > 1 ? `<span class="al-n">×${own.n}</span>` : ''}</div>`
      : `<div class="al-slot no"><div class="al-empty"><b>${c.letter}</b><i>？</i><small>${stars(c.rare)}</small></div></div>`;
  }).join('');
  const i = LETTERS.indexOf(page); if (back) albumBack = back;
  showPop(`<div class="album"><h3>カードずかん <small>${got} / ${CARD_TOTAL}</small></h3>
    <div class="al-strip">${strip}</div>
    <div class="al-page"><button class="al-nav" data-act="dgAlbum" data-arg="${LETTERS[(i + 25) % 26]}">◀</button>
      <div class="al-cards">${slots}</div>
      <button class="al-nav" data-act="dgAlbum" data-arg="${LETTERS[(i + 1) % 26]}">▶</button></div>
    <div class="al-info">${T.badges.includes(page) ? `<b class="badgeb">「${page}」バッジ ゲット！</b>` : `「${page}」の カード ${CARDS.filter(c => c.letter === page && T.cards[c.id]).length} / 3`}　もじバッジ ${T.badges.length} / 26　かけら ${T.shards}</div>
    <div class="btns"><button class="big gray" data-act="${albumBack}">もどる</button></div></div>`);
  fillArt(document.getElementById('ov'), 64);
}
let albumBack = 'close';
export function cardBig(id) {
  const c = CARD[id], own = TD().cards[id]; if (!c || !own) return;
  showPop(`<div class="cardbig">${cardHTML(c, 'l')}
    <button class="say" data-act="dgCardSay" data-arg="${id}">🔊 きく</button>
    <p class="cb-ex">${c.ex}</p><p class="muted">${own.n}まい もっている・${RARE_NAME[c.rare]}（${stars(c.rare)}）</p>
    <div class="btns"><button class="big gray" data-act="dgAlbum" data-arg="${c.letter}">もどる</button></div></div>`);
  fillArt(document.getElementById('ov'), 150);
  X.speak(`${c.letter}, ${c.en}. ${c.ex}`);
}
export const cardSay = id => { const c = CARD[id]; if (c) X.speak(`${c.en}. ${c.ex}`); };
export const albumBackAct = () => albumBack;

/* ---------- かくし部屋の とびらの クイズ ---------- */
// q は quiz.js の makeQuiz()。こたえが きまったら done(ok, q, userAnswer)
import { QUIZ_NAME } from './quiz.js';
let Q = null;
export function quizPop(q, done) {
  Q = { q, done, picked: [], answered: false };
  const head = `<div class="qz-head">${QUIZ_NAME[q.kind]}</div>`;
  let body = '';
  if (q.kind === 'word') body = `<div class="qz-art" data-art="${q.card.art}"></div><p>この え は えいごで どれ？</p><div class="qz-ch">${q.choices.map((id, i) => `<button class="big qz-c en" data-act="dgQzAns" data-arg="${i}">${CARD[id].en}</button>`).join('')}</div>`;
  if (q.kind === 'letter') body = `<div class="qz-art" data-art="${q.card.art}"></div><div class="qz-word">${q.shown.replace('_', '<b class="qz-blank">？</b>')}</div><p>はじめの もじは どれ？</p><div class="qz-ch">${q.choices.map((L, i) => `<button class="big qz-l" data-act="dgQzAns" data-arg="${i}">${L}</button>`).join('')}</div>`;
  if (q.kind === 'order' || q.kind === 'collect') body = `<div class="qz-art" data-art="${q.card.art}"></div><div class="qz-slots">${q.answer.split('').map(() => '<span></span>').join('')}</div><p>もじを じゅんばんに タップして ことばを つくろう</p><div class="qz-ch">${q.tiles.map((L, i) => `<button class="big qz-l" data-act="dgQzTile" data-arg="${i}">${L}</button>`).join('')}</div><div class="btns"><button class="big gray" data-act="dgQzBack">ひとつ けす</button></div>`;
  if (q.kind === 'riddle') body = `<div class="qz-rid">${q.en}</div><button class="say" data-act="dgQzSay">🔊 もう いちど きく</button><p>なんの こと？ えを えらぼう</p><div class="qz-ch">${q.choices.map((id, i) => `<button class="qz-p" data-act="dgQzAns" data-arg="${i}" data-art="${CARD[id].art}"></button>`).join('')}</div>`;
  showPop(`<div class="quiz">${head}${body}<div class="qz-fb" id="qzfb"></div></div>`);
  document.querySelectorAll('#ov .qz-art[data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 96)));
  document.querySelectorAll('#ov .qz-p[data-art]').forEach(el => el.appendChild(wordArt(el.dataset.art, 70)));
  if (q.kind === 'riddle') setTimeout(() => X.speak(q.en), 300);
}
export const quizSay = () => { if (Q && Q.q.kind === 'riddle') X.speak(Q.q.en); };
export function quizTile(i) {
  if (!Q || Q.answered || (Q.q.kind !== 'order' && Q.q.kind !== 'collect')) return;
  const b = document.querySelector(`#ov [data-act=dgQzTile][data-arg="${i}"]`); if (!b || b.disabled) return;
  X.sfx.tap(); b.disabled = true; Q.picked.push(+i);
  const slots = document.querySelectorAll('#ov .qz-slots span'); slots[Q.picked.length - 1].textContent = Q.q.tiles[i];
  if (Q.picked.length === Q.q.answer.length) quizAns(null);
}
export function quizBack() {
  if (!Q || Q.answered || !Q.picked.length) return;
  const i = Q.picked.pop(); document.querySelector(`#ov [data-act=dgQzTile][data-arg="${i}"]`).disabled = false;
  document.querySelectorAll('#ov .qz-slots span')[Q.picked.length].textContent = '';
}
export function quizAns(i) {
  if (!Q || Q.answered) return; Q.answered = true;
  const q = Q.q; let ok, user;
  if (q.kind === 'order' || q.kind === 'collect') { user = Q.picked.map(k => q.tiles[k]).join(''); ok = user === q.answer; }
  else { ok = +i === q.answer; user = q.kind === 'letter' ? q.choices[i] : CARD[q.choices[i]].en;
    document.querySelectorAll('#ov [data-act=dgQzAns]').forEach((b, j) => { b.disabled = true; b.classList.toggle('ok', j === q.answer); b.classList.toggle('ng', j === +i && !ok); }); }
  document.querySelectorAll('#ov [data-act=dgQzTile],#ov [data-act=dgQzBack]').forEach(b => { b.disabled = true; });
  (ok ? X.sfx.correct : X.sfx.wrong)();
  X.speak(q.card.en);
  document.getElementById('qzfb').innerHTML = `<div class="${ok ? 'tok' : 'tng'}">${ok ? 'せいかい！ とびらが ひらいた！' : 'ざんねん… とびらは 5ターン しまるよ'}</div>
    <div><b class="en">${q.card.en}</b> ＝「${q.card.ja}」${q.kind === 'riddle' ? `<br><small>${q.en}（${q.ja}）</small>` : ''}</div>
    <div class="btns"><button class="big" data-act="dgQzDone">${ok ? 'なかへ はいる' : 'とじる'}</button></div>`;
  Q.result = { ok, user };
}
export function quizDone() { if (!Q || !Q.result) return; const { ok, user } = Q.result, { q, done } = Q; Q = null; closePop(); done(ok, q, user); }
export const quizState = () => Q && Q.q; // テスト よう

/* ---------- かけらの カードガチャ（かけら 10こで 1かい。10かいごとに ★★いじょう かくてい）---------- */
export const GACHA_COST = 10, GACHA_PITY = 10, GACHA_P = [70, 25, 5];
let gachaOn = false;
export const inGacha = () => gachaOn;
export function gachaPop() {
  const T = TD(), g = T.gacha, can = T.shards >= GACHA_COST, left = GACHA_PITY - (g.pity % GACHA_PITY);
  gachaOn = true;
  showPop(`<div class="gacha"><h3>かけらの カードガチャ</h3>
    <div class="gc-mach"><div class="gc-glass"><span class="tcard-back b1"></span><span class="tcard-back b2"></span><span class="tcard-back b3"></span></div><div class="gc-base">GACHA</div></div>
    <div class="gc-shard">きらきらの かけら <b>${T.shards}</b> こ</div>
    <p class="gc-info">かけら <b>${GACHA_COST}こ</b> で 1かい まわせるよ。<br>${left === 1 ? '<b class="gc-pity">つぎは ★★いじょう かくてい！</b>' : `あと <b>${left}かい</b> で ★★いじょう かくてい！`}</p>
    <div class="gc-rate">★ ${GACHA_P[0]}%　★★ ${GACHA_P[1]}%　★★★ ${GACHA_P[2]}%</div>
    <div class="btns" style="flex-direction:column;gap:8px">
      <button class="big gc-go" data-act="dgGachaGo" ${can ? '' : 'disabled'}>${can ? 'まわす！（かけら 10こ）' : `かけらが たりない（あと ${GACHA_COST - T.shards}こ）`}</button>
      <button class="big gray" data-act="dgGachaBack">もどる</button></div>
    <p class="muted">かけらは、もっている カードが また でた ときに もらえるよ（★1こ・★★3こ・★★★10こ）</p></div>`);
}
export function gachaGo() {
  const T = TD(); if (T.shards < GACHA_COST) return;
  T.shards -= GACHA_COST; T.gacha.pulls++; T.gacha.pity++;
  let rare;
  if (T.gacha.pity >= GACHA_PITY) rare = Math.random() < GACHA_P[2] / (GACHA_P[1] + GACHA_P[2]) ? 3 : 2; // かくてい
  else { const t = Math.random() * 100; rare = t < GACHA_P[2] ? 3 : t < GACHA_P[2] + GACHA_P[1] ? 2 : 1; }
  if (rare >= 2) T.gacha.pity = 0; lastRare = rare;
  X.sfx.unlock(); X.save();
  const el = document.querySelector('#ov .gc-mach'); if (el) el.classList.add('spin');
  setTimeout(() => { closePop(); giveCard(rare, null); showReveals(); }, 900);
}
export const gachaBack = () => { gachaOn = false; };
let lastRare = 0; export const gachaLast = () => lastRare; // テスト よう

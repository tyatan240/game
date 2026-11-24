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
    if (cardCount() >= CARD_TOTAL && !T.rewarded.complete) { T.rewarded.complete = true; setTimeout(() => X.stars(CARD_STARS.complete, 'カード コンプリート！'), 2600); }
  }
  if (run) (run.cards = run.cards || []).push(card.id);
  X.save();
  queue.push(res);
  return res;
}

/* ---------- カードの みため ---------- */
// カード 1まいの HTML（あとで data-art に え を いれる）。size：'s'（アルバム）・'m'（めくる）・'l'（おおきく）
export function cardHTML(card, size = 'm') {
  const w = card.en, first = w[0], rest = w.slice(1);
  return `<div class="tcard r${card.rare} ${size}" data-card="${card.id}">
    <div class="tc-in">
      <div class="tc-top"><span class="tc-no">No.${String(card.no).padStart(3, '0')}</span><span class="tc-rare">${stars(card.rare)}</span></div>
      <div class="tc-big">${card.letter}</div>
      <div class="tc-art" data-art="${card.art}"></div>
      <div class="tc-name"><b>${first}</b>${rest}</div>
      <div class="tc-ja">${card.ja}</div>
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
    <div class="btns rv-btns" hidden><button class="big" data-act="dgRevealNext">${queue.length ? 'つぎの カード' : 'やったね！'}</button></div>
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
      + (r.badge ? `<br><b class="badgeb">「${c.letter}」の 3まいが そろった！ もじバッジ！</b>` : '');
    const b = document.querySelector('#ov .rv-btns'); if (b) b.hidden = false;
  }, 550);
}
export function revealNext() { showing = false; current = null; closePop(); if (queue.length) setTimeout(showReveals, 150); else X.onRevealDone(); }

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

/* まいにち 1ページの えほん「モコの ものがたり」。index.html で core.js の あとに よむ（S・save・showPop・closePop・ACT・charInner を つかう）
   「きょうの もくひょう」を 1つ たっせい すると、その日 1ページ ひらく（1日 1ページ。つづきは あした）
   1わ 7ページ。よみおわると ⭐5 と ほんだなへ。よみあげ（1ぶんずつ ひからせる）
   ほぞん：S.book = { story, open, last, seen:{"story-page":1}, rewarded:[storyId] }（core.js の defBook／merge） */
'use strict';

/* ---------- ばめんの え（SVG 320×200）---------- */
const BK_EQ = id => ({ char: id, outfit: 'o_none', hat: 'h_none', acc: 'a_none' });
// キャラを おく（charInner は 200×240。x,y は あしもとの まんなか、h は たかさ）
function bkChar(who, x, y, h = 90, mood = 'happy', flip = false) {
  const eq = who === 'moko' ? S.equip : BK_EQ(who), k = h / 240;
  return `<g transform="translate(${x - 100 * k * (flip ? -1 : 1)} ${y - h}) scale(${flip ? -k : k} ${k})">${typeof charInner === 'function' ? charInner(eq, mood) : ''}</g>`;
}
const bkStar = (x, y, r, c = '#fff3a8') => `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;
const BK_BG = {
  room: () => `<rect width="320" height="200" fill="#fff3e0"/><rect y="132" width="320" height="68" fill="#e8c497"/><path d="M0 132 H320" stroke="#c89a60" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${i * 70} 150 h60 M${i * 70 + 30} 172 h60" stroke="#d4ab78" stroke-width="2"/>`).join('')}<rect x="30" y="22" width="78" height="62" rx="6" fill="#bfe6ff" stroke="#fff" stroke-width="6"/><path d="M69 22 V84 M30 53 H108" stroke="#fff" stroke-width="4"/><rect x="22" y="16" width="94" height="10" rx="4" fill="#ff9ab4"/>`,
  night: () => `<rect width="320" height="200" fill="#3a3a6a"/><rect y="132" width="320" height="68" fill="#7a6a8a"/><rect x="30" y="22" width="78" height="62" rx="6" fill="#1e2050" stroke="#c8c0e0" stroke-width="6"/><circle cx="86" cy="42" r="10" fill="#fff3a8"/>${bkStar(48, 38, 4)}${bkStar(60, 66, 3)}`,
  park: () => `<rect width="320" height="200" fill="#cfeeff"/><circle cx="270" cy="34" r="20" fill="#ffe066"/><rect y="128" width="320" height="72" fill="#9adf7a"/><ellipse cx="60" cy="128" rx="90" ry="20" fill="#8ad06a"/><rect x="246" y="70" width="14" height="66" fill="#a8763a"/><circle cx="253" cy="62" r="34" fill="#5ac87a"/><circle cx="232" cy="74" r="22" fill="#6ad08a"/><circle cx="276" cy="76" r="20" fill="#6ad08a"/><ellipse cx="80" cy="34" rx="30" ry="12" fill="#fff"/><ellipse cx="100" cy="28" rx="20" ry="10" fill="#fff"/>`,
  town: () => `<rect width="320" height="200" fill="#cfeeff"/><rect y="140" width="320" height="60" fill="#d8d0c8"/><path d="M0 170 H320" stroke="#fff" stroke-width="4" stroke-dasharray="18 14"/>${[[10, '#ffb0a0', '#e85a4a'], [110, '#fff0b0', '#7ab0e0'], [210, '#c8e8c0', '#ff9ab4']].map(([x, w, r]) => `<rect x="${x}" y="72" width="90" height="70" fill="${w}"/><path d="M${x - 6} 74 L${x + 45} 36 L${x + 96} 74Z" fill="${r}"/><rect x="${x + 36}" y="104" width="20" height="38" rx="3" fill="#a8763a"/><rect x="${x + 10}" y="88" width="18" height="16" fill="#bfe6ff"/><rect x="${x + 62}" y="88" width="18" height="16" fill="#bfe6ff"/>`).join('')}`,
  shop: () => `<rect width="320" height="200" fill="#fff6e0"/><path d="M0 0 H320 V30 H0Z" fill="#ff8a6a"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 40} 30 q20 18 40 0" fill="${i % 2 ? '#fff' : '#ff8a6a'}"/>`).join('')}<rect x="10" y="120" width="300" height="80" fill="#c8904a"/><rect x="10" y="114" width="300" height="10" fill="#a8703a"/><text x="160" y="72" text-anchor="middle" font-size="22" font-weight="900" fill="#c8562a">やおや</text>`,
  sky: () => `<rect width="320" height="200" fill="#2a2a5a"/>${[[30, 30], [90, 60], [150, 24], [210, 50], [280, 30], [250, 90], [60, 100], [120, 120]].map(([x, y], i) => bkStar(x, y, 3 + (i % 3)))}<circle cx="270" cy="150" r="22" fill="#fff3a8"/><rect y="170" width="320" height="30" fill="#4a4a7a"/>`,
};
// こもの
const BK_P = {
  box: (x, y) => `<rect x="${x - 26}" y="${y - 34}" width="52" height="34" fill="#d8a868" stroke="#a8703a" stroke-width="3"/><path d="M${x - 26} ${y - 34} L${x - 18} ${y - 44} L${x + 34} ${y - 44} L${x + 26} ${y - 34}" fill="#e8c088" stroke="#a8703a" stroke-width="3"/><path d="M${x} ${y - 34} V${y}" stroke="#ff6b8a" stroke-width="5"/>`,
  egg: (x, y, s = 1, crack = false) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -44 C20 -44 26 -12 24 -4 C22 10 12 14 0 14 C-12 14 -22 10 -24 -4 C-26 -12 -20 -44 0 -44Z" fill="#fff6e0" stroke="#e0a060" stroke-width="3"/><path d="M-20 -12 q10 -6 20 0 q10 6 20 0" stroke="#ffb070" stroke-width="4" fill="none"/>${crack ? '<path d="M-8 -34 l5 6 l-4 5 l6 4 l-3 6" stroke="#8a6a4a" stroke-width="2.5" fill="none"/>' : ''}</g>`,
  blanket: (x, y) => `<path d="M${x - 40} ${y} q40 -40 80 0Z" fill="#ff9ab4" stroke="#e06a8a" stroke-width="3"/>${[0, 1, 2].map(i => `<circle cx="${x - 20 + i * 20}" cy="${y - 10}" r="3" fill="#fff"/>`).join('')}`,
  chick: (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-14" rx="16" ry="14" fill="#fff3a0" stroke="#e0c040" stroke-width="2.5"/><circle cx="-5" cy="-17" r="2.4" fill="#4a3a3a"/><circle cx="5" cy="-17" r="2.4" fill="#4a3a3a"/><path d="M-3 -12 L3 -12 L0 -8Z" fill="#ffa030"/><path d="M-16 -4 q-6 -14 4 -18 M16 -4 q6 -14 -4 -18" fill="none"/><path d="M-20 2 l6 -6 l6 4 l6 -5 l6 5 l6 -4 l6 6" fill="#fff6e0" stroke="#e0a060" stroke-width="2.5"/></g>`,
  basket: (x, y) => `<path d="M${x - 24} ${y - 22} h48 l-6 22 h-36z" fill="#d8a868" stroke="#a8703a" stroke-width="3"/><path d="M${x - 18} ${y - 22} q18 -26 36 0" fill="none" stroke="#a8703a" stroke-width="4"/>`,
  apple: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="0" r="11" fill="#ff4a5a" stroke="#c82a3a" stroke-width="2"/><path d="M0 -10 q2 -6 6 -7" stroke="#8a5a2a" stroke-width="2.5" fill="none"/><ellipse cx="6" cy="-13" rx="5" ry="3" fill="#5ac87a"/></g>`,
  carrot: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(20)"><path d="M-6 -12 L6 -12 L0 18Z" fill="#ff8a30" stroke="#d8601a" stroke-width="2"/><path d="M0 -12 l-6 -10 M0 -12 l0 -12 M0 -12 l6 -10" stroke="#5ac87a" stroke-width="3"/></g>`,
  coin: (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="#ffd34f" stroke="#c8901a" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#c8901a" stroke-width="1.5"/>`,
  poster: (x, y, full = true, letters = 'ABC') => `<rect x="${x - 50}" y="${y - 40}" width="100" height="64" rx="4" fill="#fff" stroke="#c8b8e8" stroke-width="4"/>${full ? letters.split('').map((L, i) => `<text x="${x - 30 + i * 30}" y="${y + 6}" text-anchor="middle" font-size="28" font-weight="900" fill="${['#ff5a6a', '#4ab0ff', '#5ac87a'][i % 3]}">${L}</text>`).join('') : '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-size="18" font-weight="900" fill="#d8d0e8">？ ？ ？</text>'}`,
  letter: (x, y, L, c = '#ff5a6a', s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><text x="0" y="0" text-anchor="middle" font-size="34" font-weight="900" fill="${c}" stroke="#fff" stroke-width="3" paint-order="stroke">${L}</text><circle cx="-8" cy="-14" r="2.4" fill="#4a3a3a"/><circle cx="8" cy="-14" r="2.4" fill="#4a3a3a"/></g>`,
  ball: (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="#ff6b6b" stroke="#c84a4a" stroke-width="2.5"/><path d="M${x - 14} ${y} h28" stroke="#fff" stroke-width="4"/>`,
  zzz: (x, y) => `<text x="${x}" y="${y}" font-size="16" font-weight="900" fill="#c8c0ff">z z z</text>`,
  heart: (x, y) => `<path d="M${x} ${y + 10} c-14 -10 -12 -22 -4 -22 c2 0 4 2 4 4 c0 -2 2 -4 4 -4 c8 0 10 12 -4 22z" fill="#ff5a8a"/>`,
  wing: (x, y, L) => `<g transform="translate(${x} ${y})"><path d="M-14 -16 q-14 -8 -10 6 M14 -16 q14 -8 10 6" stroke="#fff" stroke-width="5" fill="none"/></g>`,
};
const bkScene = parts => `<svg viewBox="0 0 320 200" class="bk-scene" aria-hidden="true">${parts.join('')}</svg>`;

/* ---------- おはなし（1わ 7ページ）---------- */
const BOOKS = [
  { id: 'egg', title: 'モコと なぞの たまご', cover: () => bkScene([BK_BG.room(), BK_P.egg(160, 160, 1.4), bkChar('moko', 90, 190, 110)]), pages: [
    { s: () => bkScene([BK_BG.room(), BK_P.box(200, 168), bkChar('moko', 110, 192, 110, 'normal')]), t: ['ある あさ、モコの おうちに', 'ちいさな はこが とどきました。', '「なにが はいって いるのかな？」'] },
    { s: () => bkScene([BK_BG.room(), BK_P.box(210, 172), BK_P.egg(210, 132, 0.9), bkChar('moko', 110, 192, 110)]), t: ['はこを あけると、', 'まるい たまごが はいって いました。', '「わあ、なぞの たまごだ！」'] },
    { s: () => bkScene([BK_BG.park(), BK_P.egg(160, 176, 0.8), bkChar('moko', 90, 192, 100), bkChar('c_hamster', 230, 192, 80), bkChar('c_penguin', 290, 192, 84, 'happy', true)]), t: ['ともだちの ポテと ペペが', 'たまごを みに きました。', '「なにが うまれるのかな？」'] },
    { s: () => bkScene([BK_BG.park(), BK_P.egg(160, 176, 0.8), bkChar('c_hamster', 80, 192, 86), bkChar('c_penguin', 240, 192, 90, 'happy', true), BK_P.chick(120, 70)]), t: ['ポテは「きっと ちいさな とりだよ」。', 'ペペは「ドラゴンかも！」と いいました。'] },
    { s: () => bkScene([BK_BG.night(), BK_P.egg(200, 176, 0.8), BK_P.blanket(200, 182), bkChar('moko', 100, 192, 100, 'sleepy'), BK_P.zzz(120, 90)]), t: ['よる、モコは たまごに', 'もうふを かけました。', '「あったかく してね。おやすみ」'] },
    { s: () => bkScene([BK_BG.room(), BK_P.egg(190, 174, 1, true), bkChar('moko', 100, 192, 110, 'normal'), `<text x="236" y="100" font-size="22" font-weight="900" fill="#e0719a">ことこと…</text>`]), t: ['つぎの あさ、たまごが', 'ことこと うごきました。', 'ぴしっ！ ひびが はいりました。'] },
    { s: () => bkScene([BK_BG.room(), BK_P.egg(200, 174, 1, true), bkChar('moko', 100, 192, 110), BK_P.heart(160, 60), BK_P.heart(250, 80)]), t: ['「いっしょに べんきょう して、', 'まいにち あたためようね」', 'たまごは きょうも まって います。'] },
  ] },
  { id: 'otsukai', title: 'モコ、まちへ おつかい', cover: () => bkScene([BK_BG.town(), bkChar('moko', 160, 196, 110), BK_P.basket(210, 170)]), pages: [
    { s: () => bkScene([BK_BG.room(), BK_P.apple(220, 100, 1.2), BK_P.apple(250, 100, 1.2), BK_P.apple(280, 100, 1.2), BK_P.carrot(230, 140, 1.2), BK_P.carrot(270, 140, 1.2), bkChar('moko', 100, 192, 110, 'normal')]), t: ['「モコ、おつかいに いって くれる？」', 'りんご 3こ と にんじん 2ほん。'] },
    { s: () => bkScene([BK_BG.town(), bkChar('moko', 150, 196, 110), BK_P.basket(200, 170)]), t: ['モコは かごを もって、', 'まちへ でかけました。'] },
    { s: () => bkScene([BK_BG.shop(), ...[0, 1, 2, 3, 4, 5].map(i => BK_P.apple(160 + (i % 3) * 28, 104 - Math.floor(i / 3) * 22, 1.1)), bkChar('moko', 80, 196, 100, 'normal')]), t: ['やおやさんには りんごが たくさん。', '「1こ、2こ、3こ。」'] },
    { s: () => bkScene([BK_BG.shop(), ...[0, 1, 2, 3].map(i => BK_P.carrot(170 + i * 30, 96, 1.2)), bkChar('moko', 80, 196, 100, 'normal')]), t: ['にんじんも かぞえます。', '「1ぽん、2ほん。」', 'ぜんぶで いくつかな？'] },
    { s: () => bkScene([BK_BG.shop(), BK_P.basket(200, 112), BK_P.apple(188, 88), BK_P.apple(206, 86), BK_P.coin(250, 104), BK_P.coin(268, 104), bkChar('moko', 90, 196, 100)]), t: ['りんご 3こ と にんじん 2ほんで、', 'ぜんぶで 5こ！', 'モコは おかねを はらいました。'] },
    { s: () => bkScene([BK_BG.town(), bkChar('moko', 110, 196, 104), BK_P.basket(156, 170), bkChar('c_hamster', 240, 196, 80, 'happy', true), BK_P.apple(200, 120)]), t: ['かえりみち、ポテに あいました。', '「りんごを 1こ どうぞ！」'] },
    { s: () => bkScene([BK_BG.room(), BK_P.apple(210, 120, 1.3), BK_P.apple(244, 120, 1.3), `<text x="226" y="80" text-anchor="middle" font-size="22" font-weight="900" fill="#4a8fe0">3 − 1 ＝ 2</text>`, bkChar('moko', 100, 192, 110)]), t: ['おうちで かぞえると、りんごは 2こ。', '3 ひく 1 は 2。', '「ちゃんと かぞえられたね！」'] },
  ] },
  { id: 'abc', title: 'きえた ABC', cover: () => bkScene([BK_BG.room(), BK_P.poster(210, 80), bkChar('moko', 90, 192, 110)]), pages: [
    { s: () => bkScene([BK_BG.room(), BK_P.poster(210, 80), bkChar('moko', 90, 192, 110, 'normal')]), t: ['モコの へやには', 'ABC の ポスターが あります。'] },
    { s: () => bkScene([BK_BG.room(), BK_P.poster(210, 80, false), BK_P.letter(150, 40, 'A', '#ff5a6a', 0.8), BK_P.letter(260, 30, 'B', '#4ab0ff', 0.8), BK_P.letter(300, 70, 'C', '#5ac87a', 0.8), bkChar('moko', 80, 192, 110, 'normal')]), t: ['ある ひ、もじが ぱたぱた', 'とんで いって しまいました！'] },
    { s: () => bkScene([BK_BG.park(), BK_P.letter(254, 50, 'A'), BK_P.apple(228, 80), BK_P.apple(280, 90), bkChar('moko', 110, 192, 104)]), t: ['こうえんの きに A が いました。', '「A は apple の A！」'] },
    { s: () => bkScene([BK_BG.park(), BK_P.ball(200, 172), BK_P.letter(200, 130, 'B', '#4ab0ff'), bkChar('c_penguin', 270, 192, 88, 'happy', true), bkChar('moko', 90, 192, 104)]), t: ['ペペが ボールで あそんで いると、', 'B が ころころ。', '「B は ball の B！」'] },
    { s: () => bkScene([BK_BG.room(), bkChar('c_cat', 220, 192, 90, 'sleepy', true), BK_P.letter(150, 150, 'C', '#5ac87a'), BK_P.zzz(240, 90), bkChar('moko', 70, 192, 100)]), t: ['ミルクの となりで', 'C が ねて いました。', '「C は cat の C！」'] },
    { s: () => bkScene([BK_BG.sky(), ...'DEFGHIJ'.split('').map((L, i) => BK_P.letter(30 + i * 42, 60 + (i % 2) * 34, L, ['#ffd34f', '#ff9ab4', '#9ad4ff'][i % 3], 0.7)), bkChar('moko', 160, 196, 90)]), t: ['よるの そらに のこりの もじが', 'きらきら ひかって います。', '「みんな かえって おいで！」'] },
    { s: () => bkScene([BK_BG.room(), BK_P.poster(210, 80), bkStar(150, 40, 8), bkStar(278, 34, 7), bkChar('moko', 90, 192, 110)]), t: ['ABC が ぜんぶ もどって きました。', '「よし、えいごの ぼうけんに', 'いこう！」'] },
  ] },
];
const BK_PAGES = 7;

/* ---------- ページが ひらく（1日 1ページ。もくひょうを 1つ たっせい）---------- */
const bkToday = () => (typeof todayStr === 'function' ? todayStr() : new Date().toISOString().slice(0, 10));
const bkGoalOk = () => { try { const d = dailyOf(S); return goals().some(g => d[g.key] >= g.need); } catch (e) { return false; } };
const bkKey = (si, pi) => `${BOOKS[si].id}-${pi}`;
function bookUpdate() {
  const B = S.book, today = bkToday();
  if (B.last === today || !bkGoalOk() || B.story >= BOOKS.length) return false;
  if (B.open >= BK_PAGES) { if (B.story + 1 >= BOOKS.length) return false; B.story++; B.open = 0; } // つぎの おはなしへ
  B.open++; B.last = today; save(); return true;
}
const bkUnread = () => { const B = S.book; if (B.story >= BOOKS.length) return 0; let n = 0; for (let i = 0; i < B.open; i++) if (!B.seen[bkKey(B.story, i)]) n++; return n; };

/* ---------- おうちの カード ---------- */
function bookHomeCard() {
  const B = S.book, bk = BOOKS[Math.min(B.story, BOOKS.length - 1)], u = bkUnread(), ok = bkGoalOk();
  const sub = u ? `あたらしい ページが よめるよ！` : B.last === bkToday() ? 'つづきは あした！' : ok ? '' : 'もくひょうを 1つ たっせいすると つぎの ページが よめるよ';
  return `<button class="card bk-card ${u ? 'new' : ''}" data-act="bkOpen"><span class="bk-ci">${BK_ICON}</span><span class="bk-ct"><b>📖 えほん「${bk.title}」${u ? '<i class="bk-new">NEW</i>' : ''}</b><small>${B.open}/${BK_PAGES}ページ　${sub}</small></span></button>`;
}
const BK_ICON = `<svg viewBox="0 0 60 44" width="48" height="36"><path d="M30 8 Q18 2 4 6 V40 Q18 36 30 42Z" fill="#ffb0c8" stroke="#e06a8a" stroke-width="3"/><path d="M30 8 Q42 2 56 6 V40 Q42 36 30 42Z" fill="#bfe0ff" stroke="#5a9ae0" stroke-width="3"/><path d="M30 8 V42" stroke="#a88a8a" stroke-width="2"/></svg>`;

/* ---------- よむ ---------- */
let bkSi = 0, bkPi = 0, bkSpeakId = 0;
function bookOpen(si, pi) {
  const B = S.book;
  bkSi = si != null ? si : Math.min(B.story, BOOKS.length - 1);
  const max = bkSi < B.story ? BK_PAGES : B.open; // よめる ページ
  if (!max) return bookShelf();
  bkPi = pi != null ? pi : (() => { for (let i = 0; i < max; i++) if (!B.seen[bkKey(bkSi, i)]) return i; return max - 1; })();
  const bk = BOOKS[bkSi], pg = bk.pages[bkPi], last = bkPi === BK_PAGES - 1, canNext = bkPi + 1 < max;
  B.seen[bkKey(bkSi, bkPi)] = 1;
  let fin = '';
  if (last) {
    if (!B.rewarded.includes(bk.id)) { B.rewarded.push(bk.id); setTimeout(() => { S.points += 5; if (typeof updPts === 'function') updPts(); save(); if (typeof sBuy === 'function') sBuy(); }, 900); fin = '<div class="bk-fin">おしまい！ ⭐5 もらったよ</div>'; }
    else fin = '<div class="bk-fin">おしまい</div>';
    if (BOOKS[bkSi + 1]) fin += `<div class="bk-peek">つぎの おはなし：「${BOOKS[bkSi + 1].title}」<span>${BOOKS[bkSi + 1].cover()}</span></div>`;
  }
  save();
  showPop(`<div class="bk-read"><div class="bk-head"><b>${bk.title}</b><small>${bkPi + 1} / ${BK_PAGES}</small></div>
    <div class="bk-pic">${pg.s()}</div>
    <div class="bk-text">${pg.t.map((l, i) => `<span class="bk-l" data-i="${i}">${l}</span>`).join('')}</div>${fin}
    <div class="bk-nav"><button class="bk-arrow" data-act="bkPage" data-arg="${bkPi - 1}" ${bkPi ? '' : 'disabled'}>◀</button>
      <button class="bk-say" data-act="bkSay">🔊 よむ</button>
      <button class="bk-arrow" data-act="bkPage" data-arg="${bkPi + 1}" ${canNext ? '' : 'disabled'}>▶</button></div>
    ${!canNext && !last ? '<div class="bk-wait">つづきは あした！（もくひょうを 1つ たっせい すると よめるよ）</div>' : ''}
    <div class="btns"><button class="big sub" data-act="bkShelf">ほんだな</button><button class="big gray" data-act="bkClose">とじる</button></div></div>`);
  setTimeout(bookSay, 400);
}
// 1ぶんずつ ひからせて よみあげ
function bookSay() {
  const pg = BOOKS[bkSi] && BOOKS[bkSi].pages[bkPi]; if (!pg) return;
  const id = ++bkSpeakId, els = [...document.querySelectorAll('#ov .bk-l')];
  try { if (S.settings.sound === false || !('speechSynthesis' in window)) return; speechSynthesis.cancel(); } catch (e) { return; }
  const step = i => {
    if (id !== bkSpeakId) return; els.forEach((e, j) => e.classList.toggle('on', j === i)); if (i >= pg.t.length) return;
    const u = new SpeechSynthesisUtterance(pg.t[i].replace(/[「」]/g, '')); u.lang = 'ja-JP'; u.rate = 0.9; u.pitch = 1.1;
    let done = false; const next = () => { if (done) return; done = true; step(i + 1); };
    u.onend = next; u.onerror = next; setTimeout(next, 900 + pg.t[i].length * 260); // onend が こない ときの ための よび
    speechSynthesis.speak(u);
  };
  step(0);
}
/* ---------- ほんだな ---------- */
function bookShelf() {
  const B = S.book;
  showPop(`<div class="bk-shelf"><h3>📚 ほんだな</h3><div class="bk-books">${BOOKS.map((bk, i) => {
    const state = i < B.story || (i === B.story && B.open >= BK_PAGES && B.rewarded.includes(bk.id)) ? 'done' : i === B.story && B.open ? 'now' : 'lock';
    return state === 'lock' ? `<div class="bk-b lock"><span class="bk-cv">${bk.cover()}</span><b>？？？</b><small>まだ よめないよ</small></div>`
      : `<button class="bk-b ${state}" data-act="bkFrom" data-arg="${i}"><span class="bk-cv">${bk.cover()}</span><b>${bk.title}</b><small>${state === 'done' ? 'よみおわった！ ⭐' : `${B.open}/${BK_PAGES}ページ`}</small></button>`;
  }).join('')}</div><p class="muted">まいにち もくひょうを 1つ たっせい すると、つぎの ページが ひらくよ</p>
    <div class="btns"><button class="big gray" data-act="bkClose">とじる</button></div></div>`);
}

Object.assign(ACT, {
  bkOpen: () => bookOpen(),
  bkPage: i => { try { speechSynthesis.cancel(); } catch (e) { } bkSpeakId++; bookOpen(bkSi, +i); },
  bkSay: () => bookSay(),
  bkShelf: () => { bkSpeakId++; try { speechSynthesis.cancel(); } catch (e) { } bookShelf(); },
  bkFrom: i => bookOpen(+i, 0),
  bkClose: () => { bkSpeakId++; try { speechSynthesis.cancel(); } catch (e) { } closePop(); if (typeof render === 'function') render(); },
});

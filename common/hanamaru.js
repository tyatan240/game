/* はなまるスタンプ（パパ・ママから こどもへ）。index.html で core.js の あとに よむ（S・save・showPop・closePop・ACT を つかう）
   ・おくる：⚙️せってい（保護者確認の あと）の「はなまるを おくる」
   ・うけとる：おうちを ひらくと モコが「おてがみが とどいてるよ！」→ スタンプが ポンと おされる＋ひとことを よみあげ
   ・はなまるノート：もらった スタンプを カレンダーで みかえす
   ほぞん：S.notes = { senders:[{id,name,color}], list:[{id,from,stamp,text,day,at,seen}] }（core.js の defNotes／merge） */
'use strict';

/* ---------- スタンプの え（16しゅるい。すべて SVG。0〜100）---------- */
const hmPetals = (cols, stroke, fill) => {
  let s = '';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, x = 50 + Math.cos(a) * 30, y = 50 + Math.sin(a) * 30, c = Array.isArray(cols) ? cols[i % cols.length] : cols;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="13" ry="9" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${fill || 'none'}" stroke="${c}" stroke-width="4"/>`;
  }
  const sc = Array.isArray(cols) ? cols[0] : cols;
  return s + `<path d="M50 50 m-4 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0" fill="none" stroke="${stroke || sc}" stroke-width="4" stroke-linecap="round"/>`;
};
const hmSpark = (x, y, r, c = '#fff3a8') => `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;
const hmWord = (lines, col, size = 17) => `<circle cx="50" cy="50" r="44" fill="#fff" stroke="${col}" stroke-width="5"/><circle cx="50" cy="50" r="37" fill="none" stroke="${col}" stroke-width="2"/>`
  + lines.map((t, i) => `<text x="50" y="${50 + (i - (lines.length - 1) / 2) * (size + 3) + size * 0.36}" text-anchor="middle" font-size="${size}" font-weight="900" fill="${col}" font-family="'M PLUS Rounded 1c',sans-serif">${t}</text>`).join('');
const HM_STAMPS = [
  // はなまる
  { id: 'hanamaru', name: 'はなまる', svg: () => hmPetals('#e8384f') },
  { id: 'niji', name: 'にじいろ はなまる', special: true, svg: () => hmPetals(['#ff5a5a', '#ffa030', '#ffd84a', '#5ac87a', '#4ab0ff', '#9a6af0'], '#ff5a8a') + hmSpark(86, 14, 7) },
  { id: 'kin', name: 'きんの はなまる', special: true, svg: () => `<circle cx="50" cy="50" r="46" fill="#fff6c8"/>` + hmPetals('#d8a020', '#c8901a', '#ffe680') + hmSpark(14, 16, 7, '#ffd34f') + hmSpark(88, 84, 6, '#ffd34f') },
  // ことば
  { id: 'yoku', name: 'よく できました', svg: () => hmWord(['よく', 'できました'], '#e8384f', 15) },
  { id: 'ganba', name: 'がんばったね', svg: () => hmWord(['がんばった', 'ね！'], '#ff7a2a', 15) },
  { id: 'sugoi', name: 'すごい！', svg: () => hmWord(['すごい！'], '#e8384f', 22) },
  { id: 'hyaku', name: '100てん', svg: () => `<circle cx="50" cy="50" r="44" fill="#fff" stroke="#e8384f" stroke-width="5"/><text x="50" y="58" text-anchor="middle" font-size="34" font-weight="900" fill="#e8384f" font-family="sans-serif">100</text><text x="50" y="80" text-anchor="middle" font-size="13" font-weight="900" fill="#e8384f">てん</text><path d="M24 66 Q50 74 76 66" stroke="#e8384f" stroke-width="3" fill="none"/>` },
  { id: 'arigato', name: 'ありがとう', svg: () => hmWord(['ありがとう'], '#ff6b9a', 16) + `<path d="M50 74 c-6 -6 -10 -2 -6 3 l6 5 l6 -5 c4 -5 0 -9 -6 -3z" fill="#ff6b9a"/>` },
  // かお・きもち
  { id: 'niko', name: 'にこにこ', svg: () => `<circle cx="50" cy="50" r="40" fill="#ffd84a" stroke="#e0a820" stroke-width="4"/><path d="M34 44 q5 -7 10 0 M56 44 q5 -7 10 0" stroke="#6a4a2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 58 Q50 78 68 58" fill="#fff" stroke="#6a4a2a" stroke-width="4" stroke-linejoin="round"/><circle cx="28" cy="58" r="5" fill="#ff9ab4" opacity=".7"/><circle cx="72" cy="58" r="5" fill="#ff9ab4" opacity=".7"/>` },
  { id: 'heart', name: 'ハート', svg: () => `<path d="M50 86 C10 60 12 24 32 22 C42 21 48 28 50 34 C52 28 58 21 68 22 C88 24 90 60 50 86Z" fill="#ff5a8a" stroke="#d83a6a" stroke-width="4"/><ellipse cx="34" cy="38" rx="6" ry="9" transform="rotate(-30 34 38)" fill="#fff" opacity=".55"/>` },
  { id: 'gyu', name: 'ぎゅー', svg: () => `<circle cx="28" cy="22" r="10" fill="#c8904a" stroke="#8a5a2a" stroke-width="3"/><circle cx="72" cy="22" r="10" fill="#c8904a" stroke="#8a5a2a" stroke-width="3"/><circle cx="50" cy="44" r="30" fill="#d8a060" stroke="#8a5a2a" stroke-width="3"/><circle cx="40" cy="40" r="3.5" fill="#4a3a3a"/><circle cx="60" cy="40" r="3.5" fill="#4a3a3a"/><ellipse cx="50" cy="50" rx="7" ry="5" fill="#fff0d8"/><path d="M50 92 C30 78 32 62 42 62 C46 62 50 66 50 68 C50 66 54 62 58 62 C68 62 70 78 50 92Z" fill="#ff5a8a" stroke="#d83a6a" stroke-width="3"/><path d="M24 62 Q30 80 44 76 M76 62 Q70 80 56 76" stroke="#8a5a2a" stroke-width="8" fill="none" stroke-linecap="round"/>` },
  { id: 'good', name: 'グッド', svg: () => `<rect x="30" y="44" width="42" height="40" rx="10" fill="#ffd9b8" stroke="#c8865a" stroke-width="4"/><path d="M40 46 L40 26 Q40 14 50 16 Q56 18 54 30 L52 44" fill="#ffd9b8" stroke="#c8865a" stroke-width="4" stroke-linejoin="round"/><path d="M38 56 L72 56 M38 66 L72 66 M38 76 L70 76" stroke="#c8865a" stroke-width="3"/><rect x="18" y="46" width="14" height="38" rx="4" fill="#4a8fe0" stroke="#2a60b0" stroke-width="3"/>` + hmSpark(82, 22, 7, '#ffd34f') },
  // とくべつ
  { id: 'star', name: 'ほし', svg: () => `<path d="M50 8 L61 36 L91 38 L68 57 L76 87 L50 70 L24 87 L32 57 L9 38 L39 36Z" fill="#ffd34f" stroke="#d8a020" stroke-width="4" stroke-linejoin="round"/><circle cx="42" cy="50" r="3.5" fill="#6a4a2a"/><circle cx="58" cy="50" r="3.5" fill="#6a4a2a"/><path d="M43 59 Q50 65 57 59" stroke="#6a4a2a" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  { id: 'trophy', name: 'トロフィー', svg: () => `<path d="M30 14 L70 14 L68 46 Q66 62 50 64 Q34 62 32 46Z" fill="#ffd34f" stroke="#c8901a" stroke-width="4"/><path d="M30 20 Q12 20 16 36 Q20 46 32 44 M70 20 Q88 20 84 36 Q80 46 68 44" fill="none" stroke="#c8901a" stroke-width="4"/><rect x="45" y="62" width="10" height="14" fill="#e8b020"/><rect x="30" y="76" width="40" height="12" rx="3" fill="#a8703a" stroke="#6a4a1a" stroke-width="3"/><path d="M50 24 L53 32 L61 32 L55 37 L57 45 L50 40 L43 45 L45 37 L39 32 L47 32Z" fill="#fff6c8"/>` },
  { id: 'crown', name: 'おうかん', special: true, svg: () => `<path d="M14 74 L10 30 L32 48 L50 18 L68 48 L90 30 L86 74Z" fill="#ffd34f" stroke="#c8901a" stroke-width="4" stroke-linejoin="round"/><rect x="14" y="70" width="72" height="14" rx="4" fill="#ffb020" stroke="#c8901a" stroke-width="3"/><circle cx="32" cy="77" r="4.5" fill="#ff4a6a"/><circle cx="50" cy="77" r="4.5" fill="#4ab0ff"/><circle cx="68" cy="77" r="4.5" fill="#5ac87a"/><circle cx="10" cy="30" r="5" fill="#fff3a8"/><circle cx="50" cy="18" r="5" fill="#fff3a8"/><circle cx="90" cy="30" r="5" fill="#fff3a8"/>` + hmSpark(84, 12, 7, '#ffd34f') },
  { id: 'flower', name: 'おはな', svg: () => `<path d="M50 60 Q48 80 46 94" stroke="#5ac87a" stroke-width="5" fill="none"/><ellipse cx="38" cy="82" rx="10" ry="5" transform="rotate(-30 38 82)" fill="#5ac87a"/>` + [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(50 + Math.cos(a) * 18).toFixed(1)}" cy="${(40 + Math.sin(a) * 18).toFixed(1)}" r="14" fill="#ff9ad0" stroke="#e06aa8" stroke-width="3"/>`; }).join('') + `<circle cx="50" cy="40" r="11" fill="#ffd34f" stroke="#e0a820" stroke-width="3"/>` },
];
const HM_STAMP = Object.fromEntries(HM_STAMPS.map(s => [s.id, s]));
const HM_PRESETS = ['よく がんばったね！', 'すごいね！', 'あしたも たのしみ！', 'だいすき', 'ありがとう', 'さいごまで できたね'];
const HM_COLORS = ['#4a8fe0', '#ff6b9a', '#3aa86a', '#ff9a3a', '#9a6af0'];
const hmSvg = (id, size = 80) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="width:${size}px;height:${size}px;flex:none" aria-hidden="true">${(HM_STAMP[id] || HM_STAMPS[0]).svg()}</svg>`;
const hmEsc = t => String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hmSender = id => (S.notes.senders.find(x => x.id === id) || { name: 'おうちのひと', color: '#888' });
// だれから の ふち と なまえ つきの スタンプ
const hmStampBox = (n, size = 80) => { const sd = hmSender(n.from); return `<span class="hm-st" style="--hc:${sd.color}">${hmSvg(n.stamp, size)}<i>${hmEsc(sd.name)}</i></span>`; };
const hmDayLabel = day => { const [, m, d] = day.split('-').map(Number); return `${m}がつ ${d}にち`; };
const hmToday = () => (typeof todayStr === 'function' ? todayStr() : new Date().toISOString().slice(0, 10));
const hmDayOff = n => { const t = new Date(); t.setDate(t.getDate() + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
function hmSay(text) { // にほんごで よみあげ
  try { if (S.settings.sound === false || !('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = 0.95; u.pitch = 1.1; speechSynthesis.speak(u); } catch (e) { }
}

/* ---------- おとな：⚙️せっていの カード ---------- */
function hmSettingsCard() {
  const N = S.notes, recent = [...N.list].sort((a, b) => b.at - a.at).slice(0, 5);
  return `<div class="card hm-card"><b>💮 はなまるスタンプ（パパ・ママから）</b>
    <div class="muted" style="text-align:left">がんばった日に スタンプと ひとことを おくると、つぎに ひらいた ときに モコが「おてがみ」として とどけます。⭐は ふえません。</div>
    <button class="big hm-sendbtn" data-act="hmSend">💮 はなまるを おくる</button>
    <div class="hm-senders">${N.senders.map((sd, i) => `<div class="row"><span class="hm-dot" style="background:${sd.color}"></span>
      <input class="hm-name" value="${hmEsc(sd.name)}" maxlength="8" data-i="${i}" onchange="hmRename(${i},this.value)" aria-label="なまえ">
      <span class="hm-cols">${HM_COLORS.map(c => `<button class="hm-col ${c === sd.color ? 'on' : ''}" style="background:${c}" data-act="hmColor" data-arg="${i}|${c}" aria-label="いろ"></button>`).join('')}</span>
      ${N.senders.length > 1 && !N.list.some(n => n.from === sd.id) ? `<button class="hm-x" data-act="hmDelSender" data-arg="${i}" aria-label="けす">×</button>` : ''}</div>`).join('')}
      ${N.senders.length < 4 ? '<button class="hm-add" data-act="hmAddSender">＋ おくる ひとを ふやす（おばあちゃん など）</button>' : ''}</div>
    ${recent.length ? `<div class="hm-recent"><small>さいきん おくった スタンプ</small>${recent.map(n => `<div class="hm-ri">${hmStampBox(n, 36)}<span>${hmDayLabel(n.day)}${n.text ? '「' + hmEsc(n.text) + '」' : ''}<br><small>${n.seen ? 'みたよ ✓' : 'まだ みていない'}</small></span>${n.seen ? '' : `<button class="hm-x" data-act="hmUndo" data-arg="${n.id}">とりけす</button>`}</div>`).join('')}</div>` : ''}
  </div>`;
}
function hmRename(i, v) { const sd = S.notes.senders[i]; if (!sd) return; sd.name = String(v).trim().slice(0, 8) || sd.name; save(); }

/* ---------- おとな：おくる がめん ---------- */
let HM = null;
function hmSendPop() {
  if (!HM) HM = { from: S.notes.senders[0].id, stamp: 'hanamaru', text: '', day: hmToday() };
  const N = S.notes, today = hmToday(), yday = hmDayOff(-1);
  showPop(`<div class="hm-send"><div class="hm-body"><h3>💮 はなまるを おくる</h3>
    <div class="hm-lbl">だれから</div><div class="hm-from">${N.senders.map(sd => `<button class="${HM.from === sd.id ? 'on' : ''}" style="--hc:${sd.color}" data-act="hmFrom" data-arg="${sd.id}">${hmEsc(sd.name)}</button>`).join('')}</div>
    <div class="hm-lbl">スタンプ</div><div class="hm-grid">${HM_STAMPS.map(st => `<button class="${HM.stamp === st.id ? 'on' : ''}" data-act="hmStamp" data-arg="${st.id}" title="${st.name}">${hmSvg(st.id, 44)}</button>`).join('')}</div>
    <div class="hm-lbl">ひとこと（なくても いいよ）</div><input id="hmText" maxlength="20" value="${hmEsc(HM.text)}" placeholder="れい：7のだん すごい！" oninput="HM.text=this.value">
    <div class="hm-pre">${HM_PRESETS.map(t => `<button data-act="hmPre" data-arg="${t}">${t}</button>`).join('')}</div>
    <div class="hm-lbl">どの日の がんばりに</div><div class="hm-from">${[[today, 'きょう'], [yday, 'きのう']].map(([d, l]) => `<button class="${HM.day === d ? 'on' : ''}" style="--hc:#7c6cf0" data-act="hmDay" data-arg="${d}">${l}（${hmDayLabel(d)}）</button>`).join('')}</div>
    <div class="hm-sum" id="hmSum">…</div></div>
    <div class="hm-foot"><span class="hm-prev" id="hmPrev">${hmStampBox(HM, 54)}</span><button class="big gray" data-act="hmCancel">やめる</button><button class="big" data-act="hmGo">おくる</button></div></div>`);
  hmDaySummary(HM.day).then(t => { const e = document.getElementById('hmSum'); if (e) e.innerHTML = t; });
}
// えらんだ ものを その ばで かえる（がめんを つくりなおさない＝スクロールが もどらない）
function hmRefresh(sum) {
  document.querySelectorAll('#ov [data-act=hmFrom]').forEach(b => b.classList.toggle('on', b.dataset.arg === HM.from));
  document.querySelectorAll('#ov [data-act=hmStamp]').forEach(b => b.classList.toggle('on', b.dataset.arg === HM.stamp));
  document.querySelectorAll('#ov [data-act=hmDay]').forEach(b => b.classList.toggle('on', b.dataset.arg === HM.day));
  const t = document.getElementById('hmText'); if (t && t.value !== HM.text) t.value = HM.text;
  const pv = document.getElementById('hmPrev'); if (pv) pv.innerHTML = hmStampBox(HM, 54);
  if (sum) hmDaySummary(HM.day).then(x => { const e = document.getElementById('hmSum'); if (e) e.innerHTML = x; });
}
// その日の べんきょうの まとめ（学習履歴から）
async function hmDaySummary(day) {
  try {
    if (typeof LH === 'undefined') return '';
    const [y, m, d] = day.split('-').map(Number), st = +new Date(y, m - 1, d), all = await LH.getAttempts({ startDate: st, endDate: st + 864e5 - 1 });
    if (!all.length) return 'この日の べんきょうの きろくは まだ ないよ';
    const name = { sansu: 'さんすう', kokugo: 'こくご', eigo: 'えいご', prog: 'プログラミング' }, by = {};
    for (const a of all) { const b = by[a.subject] = by[a.subject] || { n: 0, ok: 0 }; b.n++; if (a.isCorrect) b.ok++; }
    return 'この日の べんきょう：' + Object.entries(by).map(([k, v]) => `${name[k] || k} ${v.n}もん（${v.ok}せいかい）`).join('・');
  } catch (e) { return ''; }
}
function hmGo() {
  const t = document.getElementById('hmText'); if (t) HM.text = t.value.trim().slice(0, 20);
  const n = { id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), from: HM.from, stamp: HM.stamp, text: HM.text, day: HM.day, at: Date.now(), seen: false };
  S.notes.list.push(n); save();
  HM = null;
  showPop(`<h3>おくったよ！</h3><div class="hm-prev">${hmStampBox(n, 90)}</div><p>${hmEsc(n.text)}</p><p class="muted">つぎに おうちを ひらいた とき、モコが「おてがみ」として とどけます。</p>
    <div class="btns"><button class="big sub" data-act="hmSend">もう 1つ おくる</button><button class="big gray" data-act="hmClose">とじる</button></div>`);
  if (typeof sBuy === 'function') sBuy();
}

/* ---------- こども：おてがみ（スタンプが ポンと おされる）---------- */
const hmUnseen = () => S.notes.list.filter(n => !n.seen).sort((a, b) => a.at - b.at);
let hmShownOnce = false;
// おうちを ひらいた ときに よぶ。ほかの ポップアップが ある ときは おわるまで まつ
function hmCheck(tries = 0) {
  if (!hmUnseen().length || hmShownOnce || view !== 'home') return;
  const ov = document.getElementById('ov');
  if (ov && !ov.classList.contains('hide')) { if (tries < 40) setTimeout(() => hmCheck(tries + 1), 700); return; }
  hmShownOnce = true; hmEnvelope();
}
function hmEnvelope() {
  const u = hmUnseen(); if (!u.length) return;
  const names = [...new Set(u.map(n => hmSender(n.from).name))].join('と ');
  showPop(`<div class="hm-letter"><div class="hm-env-big" data-act="hmOpen">${HM_ENV_SVG}<span class="hm-badge">${u.length}</span></div>
    <h3>おてがみが とどいてるよ！</h3><p>${hmEsc(names)}から ${u.length}まい</p><div class="btns"><button class="big" data-act="hmOpen">ひらく</button></div></div>`);
  hmSay(`${names}から、おてがみが とどいてるよ`);
}
function hmOpen() {
  const n = hmUnseen()[0]; if (!n) return closePop();
  const sd = hmSender(n.from), st = HM_STAMP[n.stamp] || HM_STAMPS[0], left = hmUnseen().length - 1;
  showPop(`<div class="hm-paper" style="--hc:${sd.color}"><div class="hm-to">${hmDayLabel(n.day)}の がんばりに</div>
    <div class="hm-press ${st.special ? 'kira' : ''}">${hmSvg(n.stamp, 150)}</div>
    <div class="hm-msg">${n.text ? hmEsc(n.text) : hmEsc(st.name)}</div><div class="hm-from-l">${hmEsc(sd.name)} より</div></div>
    <div class="btns">${left ? `<button class="big" data-act="hmNext">つぎの おてがみ（あと ${left}まい）</button>` : '<button class="big" data-act="hmThanks">ありがとう！</button>'}</div>`);
  n.seen = true; n.seenAt = Date.now(); save();
  if (typeof sBuy === 'function') setTimeout(sBuy, 350);
  setTimeout(() => hmSay(`${sd.name}から。${n.text || st.name}`), 500);
}
const HM_ENV_SVG = `<svg viewBox="0 0 120 90" width="150" height="112"><rect x="6" y="14" width="108" height="70" rx="8" fill="#fff8f0" stroke="#e0a8b8" stroke-width="4"/><path d="M8 18 L60 56 L112 18" fill="#ffe4ec" stroke="#e0a8b8" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="52" r="11" fill="#ff5a8a"/><path d="M60 58 c-7 -6 -9 -11 -4 -12 c2 0 4 2 4 3 c0 -1 2 -3 4 -3 c5 1 3 6 -4 12z" fill="#fff"/></svg>`;

/* ---------- はなまるノート（カレンダー）---------- */
let hmMonth = null;
function hmNotePop(ym) {
  const now = new Date(); hmMonth = ym || hmMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [y, m] = hmMonth.split('-').map(Number), first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate();
  const list = S.notes.list.filter(n => n.seen && n.day.startsWith(hmMonth)), byDay = {};
  for (const n of list) (byDay[n.day] = byDay[n.day] || []).push(n);
  const cells = []; for (let i = 0; i < first.getDay(); i++) cells.push('<div class="hm-c empty"></div>');
  for (let d = 1; d <= days; d++) {
    const key = `${hmMonth}-${String(d).padStart(2, '0')}`, ns = byDay[key] || [];
    cells.push(`<div class="hm-c ${ns.length ? 'has' : ''} ${key === hmToday() ? 'today' : ''}" ${ns.length ? `data-act="hmDayView" data-arg="${key}"` : ''}><b>${d}</b>${ns.slice(0, 2).map(n => hmSvg(n.stamp, 26)).join('')}${ns.length > 2 ? `<i>+${ns.length - 2}</i>` : ''}</div>`);
  }
  const pm = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`, nm = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const cnt = S.notes.senders.map(sd => `<span style="color:${sd.color}">${hmEsc(sd.name)} ${list.filter(n => n.from === sd.id).length}こ</span>`).join('　');
  showPop(`<div class="hm-note"><h3>💮 はなまるノート</h3>
    <div class="hm-mon"><button data-act="hmMon" data-arg="${pm}">◀</button><b>${y}ねん ${m}がつ</b><button data-act="hmMon" data-arg="${nm}">▶</button></div>
    <div class="hm-wk">${['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'].map(w => `<span>${w}</span>`).join('')}</div>
    <div class="hm-cal">${cells.join('')}</div>
    <div class="hm-cnt">この つきの スタンプ：${cnt}</div>
    <div class="btns"><button class="big gray" data-act="hmClose">とじる</button></div></div>`);
}
function hmDayView(day) {
  const ns = S.notes.list.filter(n => n.seen && n.day === day).sort((a, b) => a.at - b.at);
  showPop(`<div class="hm-dayv"><h3>${hmDayLabel(day)}の はなまる</h3>${ns.map(n => `<div class="hm-dn">${hmStampBox(n, 80)}<div>${n.text ? hmEsc(n.text) : hmEsc((HM_STAMP[n.stamp] || {}).name)}</div></div>`).join('')}
    <div class="btns"><button class="big gray" data-act="hmMon" data-arg="${day.slice(0, 7)}">もどる</button></div></div>`);
}
// おうちの カード（ノートへの いりぐち と、まだ みていない おてがみ）
function hmHomeCard() {
  const total = S.notes.list.filter(n => n.seen).length, u = hmUnseen().length;
  if (!total && !u) return '';
  return `<button class="card hm-homecard" data-act="${u ? 'hmEnv' : 'hmNote'}"><span class="hm-hi">${u ? HM_ENV_SVG.replace('width="150" height="112"', 'width="46" height="34"') : hmSvg('hanamaru', 40)}</span>
    <span class="hm-ht"><b>${u ? 'おてがみが とどいてるよ！' : '💮 はなまるノート'}</b><small>${u ? `${u}まい まだ ひらいて いないよ` : `もらった スタンプ ${total}こ`}</small></span></button>`;
}

// おうちの ちいさな アイコン（おてがみ が あると かずの バッジ）
function hmMini() {
  const total = S.notes.list.filter(n => n.seen).length, u = hmUnseen().length;
  if (!total && !u) return '';
  return `<button class="mini hm-mini ${u ? 'on' : ''}" data-act="${u ? 'hmEnv' : 'hmNote'}" aria-label="${u ? 'おてがみ' : 'はなまるノート'}">${u ? HM_ENV_SVG.replace('width="150" height="112"', 'width="38" height="28"') : hmSvg('hanamaru', 30)}<span>${u ? 'おてがみ' : 'はなまる'}</span>${u ? `<i class="mb">${u}</i>` : ''}</button>`;
}
Object.assign(ACT, {
  hmSend: () => { HM = null; hmSendPop(); },
  hmFrom: id => { HM.from = id; hmRefresh(); },
  hmStamp: id => { HM.stamp = id; hmRefresh(); },
  hmPre: t => { HM.text = t; hmRefresh(); },
  hmDay: d => { HM.day = d; hmRefresh(true); },
  hmGo: () => hmGo(),
  hmCancel: () => { HM = null; closePop(); },
  hmClose: () => { closePop(); if (typeof render === 'function') render(); },
  hmColor: a => { const [i, c] = a.split('|'); const sd = S.notes.senders[+i]; if (sd) { sd.color = c; save(); render(); } },
  hmAddSender: () => { const N = S.notes; if (N.senders.length >= 4) return; N.senders.push({ id: 's' + Date.now().toString(36), name: 'おばあちゃん', color: HM_COLORS[N.senders.length % HM_COLORS.length] }); save(); render(); },
  hmDelSender: i => { const N = S.notes, sd = N.senders[+i]; if (!sd || N.senders.length <= 1 || N.list.some(n => n.from === sd.id)) return; N.senders.splice(+i, 1); save(); render(); },
  hmUndo: id => { const N = S.notes, n = N.list.find(x => x.id === id); if (!n || n.seen) return; N.list = N.list.filter(x => x !== n); save(); render(); }, // まだ みていない ものだけ とりけせる（おくりまちがい）
  hmEnv: () => hmEnvelope(),
  hmOpen: () => hmOpen(),
  hmNext: () => hmOpen(),
  hmThanks: () => { closePop(); if (typeof render === 'function') render(); hmSay('ありがとう！'); },
  hmNote: () => hmNotePop(),
  hmMon: ym => hmNotePop(ym),
  hmDayView: d => hmDayView(d),
});

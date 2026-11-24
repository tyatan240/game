/* モコの ペット（おへやで そだてる）。index.html で core.js の あとに よむ（S・save・showPop・closePop・ACT を つかう）
   たまご（べんきょうした日 3日で かえる）→ なまえ → ごはん（その日の べんきょうで もらえる）で そだつ
   あかちゃん → こども（ごはん10）→ おとな（30。いちばん べんきょうした きょうかで すがたが かわる）→ とくべつ（60）
   よわらない・いなくならない（あえない日が つづくと さびしがる だけ）。ほぞん：S.pet（core.js の defPet／merge） */
'use strict';

const PET_KINDS = {
  cat: { name: 'ねこ', body: '#ffe2b8', dark: '#e0a060', egg: '#ffe9c8', eggMark: '#ffb070' },
  bird: { name: 'とり', body: '#bfe6ff', dark: '#5aa8e0', egg: '#e2f4ff', eggMark: '#6ab8f0' },
  dragon: { name: 'ドラゴンの こ', body: '#b8ecb0', dark: '#4aa85a', egg: '#e6f8e0', eggMark: '#5ac87a' },
};
const PET_STAGES = [{ id: 'baby', name: 'あかちゃん', food: 0, k: 0.72 }, { id: 'child', name: 'こども', food: 10, k: 0.86 }, { id: 'adult', name: 'おとな', food: 30, k: 1 }, { id: 'special', name: 'とくべつ', food: 60, k: 1.05 }];
const PET_FORMS = { sansu: 'ほしの もよう（さんすう）', kokugo: 'はかせ（こくご）', eigo: 'つばさ（えいご）', prog: 'ロボ（プログラミング）' };
const PET_NAMES = ['ぴよ', 'もふ', 'ころ', 'ぽん', 'るる'];
const EGG_DAYS = 3, FOOD_MAX = 3;
const P = () => S.pet;
const petDay = () => (typeof todayStr === 'function' ? todayStr() : new Date().toISOString().slice(0, 10));
const stageOf = pt => [...PET_STAGES].reverse().find(s => pt.food >= s.food) || PET_STAGES[0];
const nextStage = pt => PET_STAGES.find(s => s.food > pt.food) || null;
const petEsc = t => String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- え（SVG。0〜100）---------- */
function petSVG(pt, size = 90, mood = '') {
  const K = PET_KINDS[pt.kind] || PET_KINDS.cat, st = stageOf(pt), k = st.k, form = st.food >= 30 ? pt.form : null, sp = st.id === 'special';
  const eyeR = st.id === 'baby' ? 5.2 : 4.4, happy = mood === 'happy';
  const eyes = happy ? `<path d="M37 50 q4 -6 8 0 M55 50 q4 -6 8 0" stroke="#4a3a3a" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<circle cx="41" cy="50" r="${eyeR}" fill="#4a3a3a"/><circle cx="59" cy="50" r="${eyeR}" fill="#4a3a3a"/><circle cx="42.5" cy="48" r="1.6" fill="#fff"/><circle cx="60.5" cy="48" r="1.6" fill="#fff"/>`;
  const glowEyes = form === 'prog' ? `<circle cx="41" cy="50" r="${eyeR + 2}" fill="#7affd8" opacity=".55"/><circle cx="59" cy="50" r="${eyeR + 2}" fill="#7affd8" opacity=".55"/>` : '';
  const cheeks = `<ellipse cx="33" cy="58" rx="5" ry="3.2" fill="#ff9ab4" opacity=".6"/><ellipse cx="67" cy="58" rx="5" ry="3.2" fill="#ff9ab4" opacity=".6"/>`;
  let back = '', front = '', mouth = `<path d="M46 58 q4 4 8 0" stroke="#4a3a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  if (pt.kind === 'cat') {
    back = `<path d="M74 78 q20 -2 16 -22" stroke="${K.dark}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    front = `<path d="M26 38 L30 16 L44 30Z M74 38 L70 16 L56 30Z" fill="${K.body}" stroke="${K.dark}" stroke-width="3" stroke-linejoin="round"/><path d="M30 34 L32 22 L39 30Z M70 34 L68 22 L61 30Z" fill="#ffb8c8"/>`;
    mouth = `<path d="M44 58 q3 3 6 0 q3 3 6 0" stroke="#4a3a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  } else if (pt.kind === 'bird') {
    back = `<ellipse cx="22" cy="62" rx="10" ry="16" transform="rotate(25 22 62)" fill="${K.dark}" opacity=".8"/><ellipse cx="78" cy="62" rx="10" ry="16" transform="rotate(-25 78 62)" fill="${K.dark}" opacity=".8"/>`;
    front = `<path d="M46 26 q4 -14 8 -2 q6 -10 4 4" fill="${K.dark}"/>`;
    mouth = `<path d="M45 56 L55 56 L50 63Z" fill="#ffb020" stroke="#d88a10" stroke-width="1.5" stroke-linejoin="round"/>`;
  } else {
    back = `<path d="M72 80 q24 4 20 -18 l-6 6" stroke="${K.dark}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M24 50 L8 36 L14 54 L4 58 L22 64Z M76 50 L92 36 L86 54 L96 58 L78 64Z" fill="${K.dark}" opacity=".85"/>`;
    front = `<path d="M36 30 L32 14 L44 26Z M64 30 L68 14 L56 26Z" fill="#fff3c8" stroke="#d8b060" stroke-width="2"/>`;
  }
  // おとなの すがた（いちばん べんきょうした きょうか）
  let deco = '';
  if (form === 'sansu') deco = `<path d="M38 76 l2 5 5 .4 -4 3 1.4 5 -4.4 -2.8 -4.4 2.8 1.4 -5 -4 -3 5 -.4z" fill="#ffd34f"/><path d="M62 74 l2 5 5 .4 -4 3 1.4 5 -4.4 -2.8 -4.4 2.8 1.4 -5 -4 -3 5 -.4z" fill="#ff8fb1"/><text x="50" y="88" text-anchor="middle" font-size="9" font-weight="900" fill="#7c6cf0">123</text>`;
  if (form === 'kokugo') deco = `<circle cx="41" cy="50" r="8" fill="none" stroke="#6a4a2a" stroke-width="2.4"/><circle cx="59" cy="50" r="8" fill="none" stroke="#6a4a2a" stroke-width="2.4"/><path d="M49 50 h2" stroke="#6a4a2a" stroke-width="2.4"/><rect x="56" y="70" width="20" height="15" rx="2" fill="#e8384f" stroke="#a82030" stroke-width="2"/><path d="M66 70 v15" stroke="#fff" stroke-width="1.5"/>`;
  if (form === 'eigo') deco = `<path d="M22 56 q-16 -14 -6 -26 q6 10 16 14z M78 56 q16 -14 6 -26 q-6 10 -16 14z" fill="#fff" stroke="#9ab8e0" stroke-width="2"/><path d="M40 70 L50 76 L60 70 L60 80 L50 76 L40 80Z" fill="#ff6b9a"/><text x="50" y="92" text-anchor="middle" font-size="8" font-weight="900" fill="#4a8fe0">ABC</text>`;
  if (form === 'prog') deco = `<path d="M50 24 V10" stroke="#7a8aa8" stroke-width="2.5"/><circle cx="50" cy="9" r="4" fill="#ff5a5a"/><rect x="40" y="72" width="20" height="10" rx="3" fill="#c8d4e8" stroke="#7a8aa8" stroke-width="2"/><circle cx="46" cy="77" r="2" fill="#5ac87a"/><circle cx="54" cy="77" r="2" fill="#ffd34f"/>`;
  const crown = sp ? `<path d="M38 22 L38 12 L44 17 L50 8 L56 17 L62 12 L62 22Z" fill="#ffd34f" stroke="#c8901a" stroke-width="2" stroke-linejoin="round"/>` : '';
  const aura = sp ? `<circle cx="50" cy="56" r="46" fill="url(#pglow)"/><defs><radialGradient id="pglow"><stop offset="55%" stop-color="#fff3a8" stop-opacity=".0"/><stop offset="80%" stop-color="#ffd34f" stop-opacity=".45"/><stop offset="100%" stop-color="#ffd34f" stop-opacity="0"/></radialGradient></defs>` + [[12, 20], [88, 26], [84, 86], [14, 82]].map(([x, y]) => `<path d="M${x} ${y - 6} Q${x} ${y} ${x + 6} ${y} Q${x} ${y} ${x} ${y + 6} Q${x} ${y} ${x - 6} ${y} Q${x} ${y} ${x} ${y - 6}Z" fill="#fff3a8"/>`).join('') : '';
  const body = `<ellipse cx="50" cy="94" rx="${26 * k}" ry="4" fill="rgba(0,0,0,.12)"/>
    <g transform="translate(50 92) scale(${k}) translate(-50 -92)">${back}<ellipse cx="50" cy="62" rx="30" ry="28" fill="${K.body}" stroke="${K.dark}" stroke-width="3"/>
    <ellipse cx="50" cy="70" rx="17" ry="13" fill="#fff" opacity=".55"/>${front}${glowEyes}${eyes}${cheeks}${mouth}${deco}${crown}
    <ellipse cx="34" cy="88" rx="8" ry="4.5" fill="${K.body}" stroke="${K.dark}" stroke-width="2.4"/><ellipse cx="66" cy="88" rx="8" ry="4.5" fill="${K.body}" stroke="${K.dark}" stroke-width="2.4"/></g>`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="width:${size}px;height:${size}px" aria-hidden="true">${aura}${body}</svg>`;
}
function eggSVG(egg, size = 70) {
  const K = PET_KINDS[egg.kind] || PET_KINDS.cat, w = Math.min(EGG_DAYS, egg.warm || 0);
  const crack = ['', '<path d="M38 44 l6 6 l-4 6 l6 4" stroke="#8a6a4a" stroke-width="2.5" fill="none"/>',
    '<path d="M38 44 l6 6 l-4 6 l6 4 M60 36 l-4 7 l6 5 l-3 6" stroke="#8a6a4a" stroke-width="2.5" fill="none"/>',
    '<path d="M38 44 l6 6 l-4 6 l6 4 M60 36 l-4 7 l6 5 l-3 6 M30 66 l10 -2 l6 6 l10 -4 l8 4 l8 -3" stroke="#8a6a4a" stroke-width="2.5" fill="none"/>'][w];
  const marks = `<path d="M24 58 q13 -8 26 0 q13 8 26 0" stroke="${K.eggMark}" stroke-width="5" fill="none"/><circle cx="38" cy="34" r="4" fill="${K.eggMark}"/><circle cx="62" cy="76" r="4" fill="${K.eggMark}"/>`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="width:${size}px;height:${size}px" aria-hidden="true"><ellipse cx="50" cy="93" rx="22" ry="4" fill="rgba(0,0,0,.12)"/><path d="M50 10 C76 10 82 52 80 64 C78 84 66 92 50 92 C34 92 22 84 20 64 C18 52 24 10 50 10Z" fill="${K.egg}" stroke="${K.dark}" stroke-width="3"/>${marks}${crack}<ellipse cx="38" cy="30" rx="5" ry="9" transform="rotate(20 38 30)" fill="#fff" opacity=".7"/></svg>`;
}

/* ---------- まいにちの こうしん（その日 といた もんだいの かず → ごはん・たまごを あたためる）---------- */
let petBusy = false;
async function petUpdate() {
  if (petBusy) return; petBusy = true;
  try {
    const p = P(), day = petDay(); let changed = false;
    if (!p.started) { p.started = true; if (!p.eggs.length && !p.pets.length) p.eggs.push({ kind: 'cat', warm: 0, last: '', at: Date.now(), first: true }); changed = true; }
    if (p.eggs.length && p.eggs[0].first && !p.eggs[0].kindSet) { p.eggs[0].kind = ['cat', 'bird', 'dragon'][Math.floor(Math.random() * 3)]; p.eggs[0].kindSet = true; changed = true; }
    let n = 0;
    try { if (typeof LH !== 'undefined') { const [y, m, d] = day.split('-').map(Number); n = (await LH.getAttempts({ startDate: +new Date(y, m - 1, d) })).length; } } catch (e) { }
    if (p.day.d !== day) { p.day = { d: day, earned: 0 }; changed = true; }
    const goalAll = typeof dailyOf === 'function' && dailyOf(S).all ? 1 : 0;
    const want = (n >= 1 ? Math.min(FOOD_MAX, 1 + Math.floor(n / 5)) : 0) + goalAll;
    if (want > p.day.earned) { p.stock += want - p.day.earned; p.day.earned = want; changed = true; }
    if (n >= 1) for (const e of p.eggs) if (e.last !== day) { e.warm = (e.warm || 0) + 1; e.last = day; changed = true; }
    if (changed) { save(); const ov = document.getElementById('ov'); if (typeof view !== 'undefined' && view === 'home' && typeof render === 'function' && ov && ov.classList.contains('hide')) render(); }
    return n;
  } finally { petBusy = false; }
}

/* ---------- おへやの ペット と おしらせ ---------- */
// おへやの なかに たまご と ペット（さいきんの 3びき）を おく
function petLayer() {
  const p = P(); if (!p.started) return '';
  const items = [...p.eggs.slice(0, 1).map(e => ({ egg: e })), ...p.pets.slice(-3).reverse().map(pt => ({ pt }))].slice(0, 3);
  const pos = [[8, 62], [24, 70], [64, 70]];
  return items.map((it, i) => it.egg
    ? `<button class="pet-in egg ${it.egg.warm >= EGG_DAYS ? 'ready' : ''}" style="left:${pos[i][0]}%;top:${pos[i][1]}%" data-act="petEgg" aria-label="たまご">${eggSVG(it.egg, 64)}</button>`
    : `<button class="pet-in" style="left:${pos[i][0]}%;top:${pos[i][1]}%" data-act="petOpen" data-arg="${it.pt.id}" aria-label="${petEsc(it.pt.name)}">${petSVG(it.pt, 72)}</button>`).join('');
}
// おうちの カード：ごはんの おしらせ
function petHomeCard() {
  const p = P(); if (!p.started) return '';
  const egg = p.eggs[0], e = p.day.d === petDay() ? p.day.earned : 0;
  const msg = egg && !p.pets.length ? (egg.warm >= EGG_DAYS ? 'たまごが うごいてる！ タップしてみて！' : `たまごを あたためよう：べんきょうした 日 ${egg.warm || 0} / ${EGG_DAYS}`)
    : `🍙 ごはん ${p.stock}こ（きょう もらった ${Math.min(e, FOOD_MAX + 1)}こ）${e < FOOD_MAX ? '・もんだいを とくと もらえるよ' : ''}`;
  return `<button class="card pet-card" data-act="${egg && (egg.warm >= EGG_DAYS || !p.pets.length) ? 'petEgg' : 'petOpen'}" data-arg="${p.pets.length ? p.pets[p.pets.length - 1].id : ''}"><span class="pet-ci">${egg && !p.pets.length ? eggSVG(egg, 40) : petSVG(p.pets[p.pets.length - 1], 44)}</span><span class="pet-ct"><b>${egg && !p.pets.length ? 'なぞの たまご' : petEsc(p.pets[p.pets.length - 1].name)}</b><small>${msg}</small></span></button>`;
}
// はじめて：たまごが とどく ／ かえる じゅんびが できた ／ さびしかった
let petShown = false;
function petCheck(tries = 0) {
  if (petShown || typeof view === 'undefined' || view !== 'home') return;
  const ov = document.getElementById('ov');
  if ((ov && !ov.classList.contains('hide')) || (typeof hmUnseen === 'function' && hmUnseen().length)) { if (tries < 40) setTimeout(() => petCheck(tries + 1), 800); return; }
  const p = P(), today = petDay(); petShown = true;
  const egg = p.eggs[0];
  if (egg && egg.first && !egg.greeted) { egg.greeted = true; save(); return showPop(`<div class="pet-pop"><h3>なにか とどいたよ！</h3>${eggSVG(egg, 120)}<p>なぞの たまご。<br>べんきょうした 日が ${EGG_DAYS}日 たまると かえるよ！</p><div class="btns"><button class="big" data-act="petClose">たのしみ！</button></div></div>`); }
  if (egg && egg.warm >= EGG_DAYS) return petHatch();
  const last = p.lastSeen, gap = last ? Math.round((new Date(today) - new Date(last)) / 864e5) : 0;
  p.lastSeen = today; save();
  const pt = p.pets[p.pets.length - 1];
  if (pt && gap >= 2) showPop(`<div class="pet-pop"><div class="pet-hop">${petSVG(pt, 130, 'happy')}</div><h3>${petEsc(pt.name)}</h3><p>さびしかったよ〜！<br>また あえて うれしい！</p><div class="btns"><button class="big" data-act="petClose">ただいま！</button></div></div>`);
}

/* ---------- たまごが かえる ---------- */
function petHatch() {
  const egg = P().eggs[0]; if (!egg) return;
  if (egg.warm < EGG_DAYS) return showPop(`<div class="pet-pop">${eggSVG(egg, 120)}<h3>なぞの たまご</h3><p>べんきょうした 日 <b>${egg.warm || 0} / ${EGG_DAYS}</b><br>あと ${EGG_DAYS - (egg.warm || 0)}日 べんきょうすると かえるよ！<br><small>（1もん でも とけば その日は OK）</small></p><div class="btns"><button class="big gray" data-act="petClose">とじる</button></div></div>`);
  showPop(`<div class="pet-pop"><h3>たまごが うごいてる…！</h3><div class="pet-crack">${eggSVG(egg, 140)}</div><div class="btns"><button class="big" data-act="petHatchGo">タップして かえす！</button></div></div>`);
}
function petHatchGo() {
  const p = P(), egg = p.eggs.shift(); if (!egg) return;
  const pt = { id: 'p' + Date.now().toString(36), kind: egg.kind, name: '', food: 0, form: null, born: Date.now(), bornDay: petDay() };
  p.pets.push(pt); save();
  if (typeof sBuy === 'function') sBuy();
  petNamePop(pt.id);
}
function petNamePop(id) {
  const pt = P().pets.find(x => x.id === id); if (!pt) return;
  showPop(`<div class="pet-pop"><h3>うまれたよ！ ${PET_KINDS[pt.kind].name}の あかちゃん！</h3><div class="pet-born">${petSVG(pt, 140, 'happy')}</div>
    <p>なまえを つけてね（5もじ まで）</p><input id="petName" maxlength="5" value="${petEsc(pt.name)}" placeholder="なまえ">
    <div class="pet-names">${PET_NAMES.map(n => `<button data-act="petNamePick" data-arg="${n}">${n}</button>`).join('')}</div>
    <div class="btns"><button class="big" data-act="petNameOk" data-arg="${id}">これに する！</button></div></div>`);
}

/* ---------- ペットの へや（ごはん・そだつ）---------- */
const PET_TALK = ['きょうは なにを べんきょうする？', 'いっしょに がんばろうね！', 'ごはん おいしいなあ', 'モコと あそぶの たのしい！', 'もんだいを とくと ごはんが もらえるよ', 'きのうより つよく なった きが する！', 'ねむたく なって きた…', 'おへや すてき！'];
function petOpen(id) {
  const p = P(), pt = p.pets.find(x => x.id === id) || p.pets[p.pets.length - 1]; if (!pt) return petHatch();
  const st = stageOf(pt), nx = nextStage(pt), cur = st.food, pct = nx ? Math.round((pt.food - cur) / (nx.food - cur) * 100) : 100;
  showPop(`<div class="pet-pop"><div class="pet-talk">${PET_TALK[Math.floor(Math.random() * PET_TALK.length)]}</div><div class="pet-big" id="petBig">${petSVG(pt, 150)}</div>
    <h3>${petEsc(pt.name)} <small>${PET_KINDS[pt.kind].name}・${st.name}${pt.form && pt.food >= 30 ? `（${PET_FORMS[pt.form]}）` : ''}</small></h3>
    <div class="pet-bar"><i style="width:${pct}%"></i></div><div class="pet-next">${nx ? `${nx.name}まで あと ごはん ${nx.food - pt.food}こ` : 'いちばん おおきく なったよ！'}</div>
    <div class="btns" style="flex-direction:column;gap:8px"><button class="big" data-act="petFeed" data-arg="${pt.id}" ${p.stock ? '' : 'disabled'}>🍙 ごはんを あげる（のこり ${p.stock}こ）</button>
    ${p.stock ? '' : '<p class="muted" style="margin:0">もんだいを とくと ごはんが もらえるよ（1もんで 1こ、5もんごとに もう 1こ）</p>'}
    ${p.pets.length > 1 ? '<button class="big sub" data-act="petDex">ペット ずかん</button>' : ''}<button class="big gray" data-act="petClose">とじる</button></div></div>`);
}
async function petFeed(id) {
  const p = P(), pt = p.pets.find(x => x.id === id); if (!pt || !p.stock) return;
  const before = stageOf(pt).id; p.stock--; pt.food++; pt.lastFed = Date.now();
  if (pt.food >= 30 && !pt.form) pt.form = await petTopSubject(pt);
  save();
  const after = stageOf(pt).id;
  if (typeof sBuy === 'function') sBuy();
  if (after !== before) return petGrow(pt, before);
  petOpen(id);
  const b = document.getElementById('petBig'); if (b) { b.classList.add('eat'); b.insertAdjacentHTML('beforeend', '<span class="pet-heart">♥</span><span class="pet-heart h2">♥</span>'); }
}
// いちばん たくさん といた きょうか（うまれてから）
async function petTopSubject(pt) {
  try { const all = await LH.getAttempts({ startDate: pt.born || 0 }), c = {}; for (const a of all) if (PET_FORMS[a.subject]) c[a.subject] = (c[a.subject] || 0) + 1; const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return top ? top[0] : 'sansu'; } catch (e) { return 'sansu'; }
}
function petGrow(pt, from) {
  const st = stageOf(pt), p = P();
  let extra = '';
  if (st.id === 'adult') {
    extra = `<p>いちばん がんばった べんきょうで すがたが かわったよ：<b>${PET_FORMS[pt.form] || ''}</b></p>`;
    if (!p.eggs.length) { const had = new Set(p.pets.map(x => x.kind)), left = Object.keys(PET_KINDS).filter(k => !had.has(k)); p.eggs.push({ kind: (left.length ? left : Object.keys(PET_KINDS))[Math.floor(Math.random() * (left.length || 3))], warm: 0, last: '', at: Date.now() }); save(); extra += '<p>あれ？ あたらしい たまごが とどいたよ！</p>'; }
  }
  showPop(`<div class="pet-pop pet-grow"><h3>${petEsc(pt.name)}が ${st.name}に なった！</h3><div class="pet-big grow">${petSVG(pt, 160, 'happy')}</div>${extra}<div class="btns"><button class="big" data-act="petOpen" data-arg="${pt.id}">やったね！</button></div></div>`);
  if (typeof sOk === 'function') sOk();
}
function petDex() {
  const p = P();
  showPop(`<div class="pet-pop"><h3>ペット ずかん</h3><div class="pet-dex">${p.pets.map(pt => `<button data-act="petOpen" data-arg="${pt.id}">${petSVG(pt, 70)}<b>${petEsc(pt.name)}</b><small>${stageOf(pt).name}</small></button>`).join('')}${p.eggs.map(e => `<button data-act="petEgg">${eggSVG(e, 60)}<b>たまご</b><small>${e.warm || 0} / ${EGG_DAYS}</small></button>`).join('')}</div>
    <div class="btns"><button class="big gray" data-act="petClose">とじる</button></div></div>`);
}

Object.assign(ACT, {
  petEgg: () => petHatch(),
  petHatchGo: () => petHatchGo(),
  petNamePick: n => { const i = document.getElementById('petName'); if (i) i.value = n; },
  petNameOk: id => { const pt = P().pets.find(x => x.id === id), i = document.getElementById('petName'); if (!pt) return; pt.name = (i && i.value.trim().slice(0, 5)) || PET_NAMES[0]; save(); petOpen(id); },
  petOpen: id => petOpen(id),
  petFeed: id => petFeed(id),
  petDex: () => petDex(),
  petClose: () => { closePop(); if (typeof render === 'function') render(); },
});

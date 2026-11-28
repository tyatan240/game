// がめんの パーツ（かいわ・もじカード・クイズ・メニュー など）。DOM で つくり、Promise で けっかを かえす
import { portrait, drawCritter, starPath, wordArt } from '../engine/art.js';
import { sfx, sayLetter } from '../engine/audio.js';
import { LETTER } from '../data/letters.js';
import { WORD, WORDS } from '../data/words.js';
import { SOUND } from '../data/phonics.js';
import { LEVEL_NAME } from '../game/learning.js';
import * as input from '../engine/input.js';

const $ = s => document.querySelector(s);
const layer = () => $('#layer');
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
export const SPEAKER_KIND = { 'ラビ': 'rabbit', 'ありさん': 'ant', 'くまさん': 'bear', 'ねこさん': 'cat', 'いぬさん': 'dog', 'ぞうさん': 'elephant', 'ドラコ': 'dragon', 'チュチュ': 'mouse', 'きみ': 'fox',
  // ワールド3
  'インコの せんせい': 'bird', 'ひつじの せんせい': 'sheep', 'ぶたの せんせい': 'pig', 'くまの せんせい': 'bear', 'しかの せんせい': 'deer', 'はりねずみの せんせい': 'hedgehog',
  'アヒルさん': 'duck', 'うしさん': 'cow', 'ペンギンさん': 'penguin', 'コアラさん': 'koala', 'おさるさん': 'monkey', 'ライオンさん': 'lion',
  'くだものやさん': 'monkey', 'たまごやさん': 'chick', 'パンやさん': 'cat', 'ふうせんやさん': 'tiger',
  'うさぎの せんせい': 'rabbit', 'ふくろうの せんせい': 'owl', 'かんばんやさん': 'goat', 'ひよこの ピッピ': 'chick', 'かえるの せんせい': 'frog', 'ぞうの せんせい': 'elephant',
  'しろくまの ポーラ': 'polar', 'しまうまの コーチ': 'zebra', 'とうの ふくろう': 'owl', 'ひつじの もんばん': 'sheep', 'やぎの もんばん': 'goat', 'しかの もんばん': 'deer' };
const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
export const STAR_SVG = `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="#ffd34f" stroke="#e5a91c" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

// いま ひらいている がめん（アクションボタン・Enter で すすめる ため）
let current = null;
export const busy = () => !!current;
input.on('action', () => { if (current && current.onAction) current.onAction(); });

function open(el, onAction) { layer().appendChild(el); current = { el, onAction }; input.clearDirs(); return el; }
function close() { if (current) { current.el.remove(); current = null; } }

/* ---------- かいわ ---------- */
export function say(lines, heroOpts = {}) {
  return new Promise(resolve => {
    let i = 0, typing = null, full = '';
    const el = open(h(`<div class="dlg" role="dialog"><div class="pic"></div><div class="body"><div class="name"></div><div class="txt"></div><div class="next">▼</div></div></div>`), () => advance());
    const show = () => {
      const [who, text] = lines[i];
      const kind = SPEAKER_KIND[who];
      el.querySelector('.pic').innerHTML = ''; el.classList.toggle('narr', !kind);
      if (kind) el.querySelector('.pic').appendChild(portrait(kind, 64, kind === 'fox' ? heroOpts : {}));
      el.querySelector('.name').textContent = who;
      full = text; let n = 0; const t = el.querySelector('.txt'); t.textContent = '';
      clearInterval(typing);
      typing = setInterval(() => { n += 2; t.textContent = full.slice(0, n); if (n % 6 === 0) sfx.talk(); if (n >= full.length) { clearInterval(typing); typing = null; } }, 30);
    };
    const advance = () => {
      if (typing) { clearInterval(typing); typing = null; el.querySelector('.txt').textContent = full; return; }
      sfx.tap(); i++;
      if (i >= lines.length) { close(); resolve(); } else show();
    };
    el.addEventListener('pointerdown', e => { e.preventDefault(); advance(); });
    show();
  });
}

/* ---------- あたらしい もじを おしえる カード ---------- */
export function teach(id) {
  const L = LETTER[id];
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card teach">
      <div class="small">あたらしい もじ</div>
      <div class="bigletter">${L.upper}</div>
      <div class="lname">「${L.name}」</div>
      <button class="sound" aria-label="もういちど きく">${SPEAKER_ICON}<span>きく</span></button>
      <button class="go">おぼえた！ クイズへ</button></div></div>`), () => done());
    const play = () => { sfx.tap(); sayLetter(L); el.querySelector('.bigletter').classList.remove('pulse'); void el.offsetWidth; el.querySelector('.bigletter').classList.add('pulse'); };
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelector('.sound').onclick = play;
    el.querySelector('.bigletter').onclick = play;
    el.querySelector('.go').onclick = done;
    setTimeout(play, 350);
  });
}

// こもじを おしえる カード（ワールド2）：おおもじ と こもじ の ペア。タップで おと
export function teachLower(ids) {
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card teach">
      <div class="small">あたらしい こもじ</div>
      <div class="pairs">${ids.map(id => `<button class="pair" data-id="${id}"><b>${LETTER[id].upper}</b><span>${LETTER[id].lower}</span></button>`).join('')}</div>
      <div class="lname">タップすると よみかたが きこえるよ</div>
      <button class="go">おぼえた！ クイズへ</button></div></div>`), () => done());
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelectorAll('.pair').forEach(b => b.onclick = () => { sfx.tap(); sayLetter(LETTER[b.dataset.id]); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); });
    el.querySelector('.go').onclick = done;
  });
}

/* ---------- クイズ ---------- */
// qs：quiz.js の もんだいの はいれつ。onAnswer(q, ok, firstTry) で きろくする
export function quiz(qs, { title = 'クイズ', onAnswer = () => {} } = {}) {
  return new Promise(resolve => {
    let i = 0, first = true, locked = false;
    const el = open(h(`<div class="modal"><div class="card quiz"><div class="qhead"><span class="qt"></span><span class="dots"></span></div>
      <div class="prompt"></div><button class="sound">${SPEAKER_ICON}<span>もういちど きく</span></button>
      <div class="choices"></div><div class="fb">&nbsp;</div></div></div>`), null);
    const play = () => { const q = qs[i]; if (q.silent) return; const v = q.voice || LETTER[q.target]; if (v) sayLetter(v); };
    el.querySelector('.sound').onclick = () => { sfx.tap(); play(); };
    const show = () => {
      const q = qs[i]; first = true; locked = false;
      window.__abcQ = q; // じどうテスト よう
      el.querySelector('.qt').textContent = title;
      el.querySelector('.dots').innerHTML = qs.length > 1 ? qs.map((_, k) => `<i class="${k < i ? 'ok' : k === i ? 'now' : ''}"></i>`).join('') : '';
      el.querySelector('.prompt').innerHTML = '';
      if (q.picture) el.querySelector('.prompt').appendChild(wordArt(q.picture, 110));
      if (q.en) el.querySelector('.prompt').appendChild(h(`<div class="entext">${q.en}</div>`)); // ワールド3：えいごの ぶんを よむ
      el.querySelector('.prompt').appendChild(document.createTextNode(q.prompt));
      el.querySelector('.sound').style.visibility = q.silent ? 'hidden' : '';
      el.querySelector('.fb').innerHTML = '&nbsp;';
      const box = el.querySelector('.choices'); box.className = 'choices n' + q.choices.length; box.innerHTML = '';
      q.choices.forEach(c => {
        const r = q.render || 'letter';
        const o = r === 'opt' ? q.opts[c] : null;
        const b = h(`<button class="ch ${r === 'lower' ? 'letter' : r}" data-v="${c}">${r === 'letter' ? LETTER[c].upper : r === 'lower' ? LETTER[c].lower : r === 'word' ? WORD[c].word : ''}</button>`);
        if (r === 'pic') { b.appendChild(wordArt(WORD[c].art, 92)); if (WORD[c].world === 3) b.appendChild(h(`<span class="pja">${WORD[c].ja}</span>`)); } // ワールド3：えに いみも つける
        if (o) { if (o.art) b.appendChild(wordArt(o.art, 64)); if (o.text) b.appendChild(h(`<span class="otext">${o.text}</span>`)); }
        b.onclick = () => pick(c, b); box.appendChild(b);
      });
      setTimeout(play, 300);
    };
    const pick = (c, b) => {
      if (locked || b.disabled) return;
      const q = qs[i];
      if (c === q.answer) {
        locked = true; b.classList.add('ok'); sfx.correct(); { const v = q.okVoice || q.voice || LETTER[c]; if (v) sayLetter(v); }
        onAnswer(q, true, first);
        el.querySelector('.fb').innerHTML = `<span class="good">せいかい！ ${q.label ? q.label(c) : c}</span>`;
        setTimeout(() => { i++; if (i >= qs.length) { close(); resolve(); } else show(); }, 1300);
      } else {
        if (first) onAnswer(q, false, true);
        first = false; b.disabled = true; b.classList.add('ng'); sfx.wrong();
        el.querySelector('.fb').innerHTML = `<span class="oops">${q.hintVoice ? 'おしい！ よみかたを きいて みよう' : 'おしい！ もういちど きいて みよう'}</span>`;
        setTimeout(() => { if (q.silent && q.hintVoice) sayLetter(q.hintVoice); else play(); }, 500); // ワールド4：よむ もんだいは まちがえたら ことばを きかせる
      }
    };
    show();
  });
}

/* ---------- ほしが とんでいく ---------- */
export function starFly(n, onEach) {
  return new Promise(resolve => {
    const target = $('#starN').getBoundingClientRect();
    let left = n;
    for (let k = 0; k < n; k++) setTimeout(() => {
      const s = h(`<div class="flystar">${STAR_SVG}</div>`); document.body.appendChild(s);
      s.style.left = (innerWidth / 2 - 30) + 'px'; s.style.top = (innerHeight / 2 - 30) + 'px';
      sfx.star();
      requestAnimationFrame(() => requestAnimationFrame(() => { s.style.left = (target.left - 18) + 'px'; s.style.top = (target.top - 18) + 'px'; s.style.transform = 'scale(.5) rotate(200deg)'; }));
      setTimeout(() => { s.remove(); onEach && onEach(); const c = $('#hud .stars'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); if (--left === 0) resolve(); }, 750);
    }, k * 260);
  });
}

/* ---------- おしらせ（アイテム・はしが ひらいた など）---------- */
export function notice(title, text, pic) {
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card notice"><div class="pic"></div><h2>${title}</h2><p>${text}</p><button class="go">OK</button></div></div>`), () => done());
    if (pic) el.querySelector('.pic').appendChild(pic);
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelector('.go').onclick = done;
  });
}
export function heroPic(opts, size = 110) { return portrait('fox', size, opts); }

/* ---------- もじの かんばん（タップで よみかた）---------- */
export function letterBoard(ids, learned) {
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card board"><h2>もじの かんばん</h2><p>もじを タップすると よみかたが きこえるよ</p><div class="tiles">${ids.map(id => `<button class="tile ${learned.includes(id) ? 'got' : ''}" data-id="${id}">${id}<small>${LETTER[id].name}</small></button>`).join('')}</div><button class="go">とじる</button></div></div>`), () => done());
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelectorAll('.tile').forEach(b => b.onclick = () => { sayLetter(LETTER[b.dataset.id]); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); });
    el.querySelector('.go').onclick = done;
  });
}

/* ---------- メニュー ---------- */
export function menu(st, { ids, levelOf, onSettings, onTitle, itemsInfo, onWear, invInfo = {}, onHome }) {
  return new Promise(resolve => {
    let tab = 'abc';
    const el = open(h(`<div class="modal"><div class="card menu"><div class="tabs"><button data-t="abc">もじ</button><button data-t="words">ことばずかん</button><button data-t="wear">もちもの</button><button data-t="set">せってい</button></div><div class="pane"></div><div class="row2"><button class="go gray" data-a="title">タイトルへ</button><button class="go home" data-a="home">おうちへ</button><button class="go" data-a="close">とじる</button></div></div></div>`), null);
    const pane = el.querySelector('.pane');
    const draw = () => {
      el.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
      if (tab === 'abc') {
        pane.innerHTML = `<div class="tiles">${ids.map(id => { const r = st.records[id], lv = levelOf(r); return `<button class="tile lv${lv} ${st.learned.includes(id) ? 'got' : ''}" data-id="${id}">${id}<small>${LEVEL_NAME[lv]}</small><em>${r ? r.correct + '/' + r.asked : '0/0'}</em></button>`; }).join('')}</div><p class="muted">タップで よみかた。「おぼえた」に なるまで おさらい しよう！</p>`;
        pane.querySelectorAll('.tile').forEach(b => b.onclick = () => sayLetter(LETTER[b.dataset.id]));
      } else if (tab === 'words') {
        pane.innerHTML = `<div class="wcards">${WORDS.filter(w => !w.future || st.words[w.id]).map(w => wordCardHTML(w, st, levelOf)).join('')}</div><p class="muted">カードを タップすると よみかたが きこえるよ</p>`;
        pane.querySelectorAll('.wcard').forEach(b => { const w = WORD[b.dataset.id]; if (st.words[w.id]) { b.querySelector('.art').appendChild(wordArt(w.art, 64)); b.onclick = () => sayLetter(w); } });
      } else if (tab === 'wear') {
        const own = Object.keys(itemsInfo).filter(k => st.items.includes(k));
        const inv = Object.keys(st.inv || {}).filter(k => st.inv[k] > 0 && invInfo[k]);
        pane.innerHTML = `<div class="sec">もちもの</div><div class="invs">${inv.length ? inv.map(k => `<div class="inv" data-k="${k}"><span class="art"></span>${invInfo[k].name}${st.inv[k] > 1 ? ' ×' + st.inv[k] : ''}</div>`).join('') : '<p class="muted">まだ なにも もっていないよ</p>'}</div>
          <div class="sec">きがえ</div><div class="wearbox"><div class="pic"></div><div class="witems">${own.length ? own.map(k => `<button class="wi ${st.wear[k] ? 'on' : ''}" data-k="${k}">${itemsInfo[k].name}<small>${st.wear[k] ? 'つけてる' : 'はずしてる'}</small></button>`).join('') : '<p class="muted">たからばこを あけると きがえが ふえるよ</p>'}</div></div>`;
        pane.querySelectorAll('.inv').forEach(d => d.querySelector('.art').appendChild(wordArt(invInfo[d.dataset.k].art, 40)));
        pane.querySelector('.pic').appendChild(heroPic(st.wear, 110));
        pane.querySelectorAll('.wi').forEach(b => b.onclick = () => { onWear(b.dataset.k); sfx.tap(); draw(); });
      } else {
        const sw = (k, label) => `<div class="setrow"><span>${label}</span><button class="sw ${st.settings[k] ? 'on' : ''}" data-k="${k}"><i></i></button></div>`;
        pane.innerHTML = sw('bgm', 'BGM（おんがく）') + sw('se', 'こうかおん') + sw('voice', 'えいごの こえ') + `<div class="setrow"><span>こえの テスト</span><button class="mini" data-test>A B C</button></div><p class="muted">えいごの こえが きこえない ときは、たんまつの おとの おおきさと マナーモードを たしかめてね。</p>`;
        pane.querySelectorAll('.sw').forEach(b => b.onclick = () => { st.settings[b.dataset.k] = !st.settings[b.dataset.k]; onSettings(); sfx.tap(); draw(); });
        pane.querySelector('[data-test]').onclick = () => { ['A', 'B', 'C'].forEach((id, k) => setTimeout(() => sayLetter(LETTER[id]), k * 900)); };
      }
    };
    el.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; sfx.tap(); draw(); });
    el.querySelector('[data-a=close]').onclick = () => { sfx.tap(); close(); resolve('close'); };
    el.querySelector('[data-a=title]').onclick = () => { sfx.tap(); close(); onTitle(); resolve('title'); };
    el.querySelector('[data-a=home]').onclick = () => { sfx.tap(); close(); resolve('home'); onHome && onHome(); };
    current.onAction = null; current.onMenu = () => { close(); resolve('close'); };
    draw();
  });
}
export function closeByMenuKey() { if (current && current.onMenu) { current.onMenu(); return true; } return false; }

/* ---------- おしまい ---------- */
export function ending(info, st) {
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card ending"><div class="pic"></div><h2>${info.title}</h2><p>${info.text}</p>
      <div class="sum"><div>おぼえた もじ<b>${st.learned.length}こ</b></div><div>あつめた ほし<b><span class="st">${STAR_SVG}</span>${st.stars}</b></div>${st.clears ? `<div>クリア<b>${st.clears}かいめ</b></div>` : ''}</div>
      <div class="row2"><button class="go gray" data-a="title">タイトルへ</button><button class="go" data-a="stay">もっと あそぶ</button><button class="go replay" data-a="replay">もういちど さいしょから</button></div>
      <p class="muted">もういちど あそんでも、おぼえた もじの きろく・ほし・きがえは のこるよ</p></div></div>`), null);
    el.querySelector('.pic').appendChild(heroPic(st.wear, 120));
    el.querySelector('[data-a=title]').onclick = () => { sfx.tap(); close(); resolve('title'); };
    el.querySelector('[data-a=stay]').onclick = () => { sfx.tap(); close(); resolve('stay'); };
    el.querySelector('[data-a=replay]').onclick = () => { sfx.tap(); close(); resolve('replay'); };
  });
}

/* ---------- かくにん ---------- */
export function confirm(text, yes = 'はい', no = 'いいえ') {
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card notice"><p>${text}</p><div class="row2"><button class="go gray" data-a="no">${no}</button><button class="go" data-a="yes">${yes}</button></div></div></div>`), null);
    el.querySelector('[data-a=no]').onclick = () => { sfx.tap(); close(); resolve(false); };
    el.querySelector('[data-a=yes]').onclick = () => { sfx.tap(); close(); resolve(true); };
  });
}

/* ---------- ことばの まほう ---------- */
const STATUS = (st, id, levelOf) => !st.words[id] ? '？' : levelOf(st.records['w:' + id]) >= 2 ? 'おぼえた' : 'まほうが つかえる';
function wordCardHTML(w, st, levelOf) {
  const got = !!st.words[w.id];
  return `<button class="wcard ${got ? 'got' : ''}" data-id="${w.id}"><span class="art">${got ? '' : '<b>？</b>'}</span><span class="en">${got ? w.word : '？？？'}</span><span class="ja">${got ? w.ja : ''}</span><small>${STATUS(st, w.id, levelOf)}</small></button>`;
}

// あたらしい たんごを おぼえる カード
export function teachWord(id) {
  const W = WORD[id];
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card teach word">
      <div class="small">あたらしい ことば</div><div class="wart"></div>
      <div class="bigword">${W.word}</div><div class="lname">「${W.ja}」</div>
      <button class="sound">${SPEAKER_ICON}<span>きく</span></button>
      <button class="go">おぼえた！ クイズへ</button></div></div>`), () => done());
    el.querySelector('.wart').appendChild(wordArt(W.art, 120));
    const play = () => { sfx.tap(); sayLetter(W); const b = el.querySelector('.bigword'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); };
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelector('.sound').onclick = play; el.querySelector('.wart').onclick = play; el.querySelector('.bigword').onclick = play;
    el.querySelector('.go').onclick = done;
    setTimeout(play, 350);
  });
}

// たんごカード ゲット！
export function wordCard(id, status) {
  const W = WORD[id];
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card getcard"><div class="small shine">ことばカード ゲット！</div>
      <div class="bigcard"><div class="wart"></div><div class="en">${W.word}</div><div class="ja">${W.ja}</div><button class="sound">${SPEAKER_ICON}</button><small>${status}</small></div>
      <p>「${W.magic}」が つかえるように なった！</p><button class="go">やったー！</button></div></div>`), () => done());
    el.querySelector('.wart').appendChild(wordArt(W.art, 110));
    el.querySelector('.sound').onclick = () => sayLetter(W);
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelector('.go').onclick = done;
    sfx.star(); setTimeout(() => sayLetter(W), 400);
  });
}

// くみあわせ がめん：check(sel) → {ok, msg}、hint() → {text, highlight}
export function magic(st, { title = 'ことばを くみあわせよう！', check, hint, levelOf }) {
  return new Promise(resolve => {
    let sel = [];
    const el = open(h(`<div class="modal"><div class="card magic"><h2>${title}</h2>
      <div class="slots"><div class="slot" data-i="0"></div><span class="plus">＋</span><div class="slot" data-i="1"></div></div>
      <div class="mmsg">&nbsp;</div>
      <div class="row2"><button class="go gray" data-a="cancel">やめる</button><button class="go cast" data-a="cast">まほうを つかう！</button><button class="go hintb" data-a="hint">ヒント</button></div>
      <div class="wcards">${WORDS.filter(w => (w.world || 1) === 1 && (!w.future || st.words[w.id])).map(w => wordCardHTML(w, st, levelOf)).join('')}</div></div></div>`), null);
    const msg = t => { el.querySelector('.mmsg').innerHTML = t; };
    el.querySelectorAll('.wcard').forEach(b => {
      const w = WORD[b.dataset.id];
      if (st.words[w.id]) b.querySelector('.art').appendChild(wordArt(w.art, 56));
      b.onclick = () => {
        if (!st.words[w.id]) { sfx.tap(); msg(w.learnAt ? `この ことばは「${w.place}」で おぼえられるよ` : 'まだ ひみつの ことばだよ'); return; }
        sayLetter(w);
        const i = sel.indexOf(w.id);
        if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 2) sel.shift(); sel.push(w.id); }
        draw();
      };
    });
    const draw = () => {
      el.querySelectorAll('.slot').forEach((s, i) => {
        s.innerHTML = ''; s.classList.toggle('on', !!sel[i]);
        if (sel[i]) { s.appendChild(wordArt(WORD[sel[i]].art, 54)); s.appendChild(h(`<b>${WORD[sel[i]].word}</b>`)); s.onclick = () => { sel.splice(i, 1); sfx.tap(); draw(); }; }
        else s.onclick = null;
      });
      el.querySelectorAll('.wcard').forEach(b => b.classList.toggle('sel', sel.includes(b.dataset.id)));
      el.querySelector('.cast').disabled = !sel.length;
    };
    el.querySelector('[data-a=cancel]').onclick = () => { sfx.tap(); close(); resolve(null); };
    el.querySelector('[data-a=hint]').onclick = () => {
      sfx.tap(); const r = hint(); msg(r.text);
      el.querySelectorAll('.wcard').forEach(b => b.classList.toggle('glow', r.highlight.includes(b.dataset.id)));
    };
    el.querySelector('[data-a=cast]').onclick = () => {
      if (!sel.length) return;
      const r = check([...sel]);
      if (!r.ok) { sfx.wrong(); msg(`<span class="oops">${r.msg}</span>`); el.querySelector('.slots').classList.remove('shake'); void el.offsetWidth; el.querySelector('.slots').classList.add('shake'); return; }
      // がったい えんしゅつ
      sfx.unlock(); el.querySelector('.slots').classList.add('merge'); msg('<span class="good">まほうが はつどう！</span>');
      setTimeout(() => { close(); resolve([...sel]); }, 1300);
    };
    draw();
  });
}

/* ---------- ワールド4「おとの しま」---------- */
// もじの おとを ならべて おしえる カード：こもじ・おとの めやす・その おとで はじまる ことば（え）。タップで ことばを よむ
export const sayPhon = id => { const s = SOUND[id], w = WORD[s.key]; sayLetter({ audio: s.audio, speak: w.speak }); };
export function teachSounds(ids) {
  return new Promise(resolve => {
    const kw = id => { const w = WORD[SOUND[id].key].word.toLowerCase(), pos = SOUND[id].pos, k = pos === 'last' ? w.length - 1 : pos === 'mid' ? Math.floor(w.length / 2) : 0; return `${w.slice(0, k)}<em>${w[k]}</em>${w.slice(k + 1)}`; };
    const el = open(h(`<div class="modal"><div class="card teach w4teach">
      <div class="small">もじの おと</div>
      <div class="w4sounds">${ids.map(id => `<button class="w4s" data-id="${id}"><b class="sl">${SOUND[id].label || id}</b><span class="art"></span><span class="kw">${kw(id)}</span><small>なまえ「${LETTER[id.toUpperCase()].name}」<br>おと「<b>${SOUND[id].kana}</b>」</small></button>`).join('')}</div>
      <div class="w4note">もじには「なまえ」と「おと」が あるよ。タップすると その おとが はいった ことばが きこえるよ（ピンクの もじが その おと）</div>
      <button class="go">おぼえた！ クイズへ</button></div></div>`), () => done());
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelectorAll('.w4s').forEach(b => { const s = SOUND[b.dataset.id]; b.querySelector('.art').appendChild(wordArt(WORD[s.key].art, 72)); b.onclick = () => { sfx.tap(); sayPhon(b.dataset.id); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }; });
    el.querySelector('.go').onclick = done;
    setTimeout(() => sayPhon(ids[0]), 400);
  });
}

// つなげて よむ：もじの タイルに おとの めやすを つけて じゅんに ひからせる（ク・ア・トゥ → cat）
export const blendTiles = (word, kana) => `<span class="blend">${word.split('').map((ch, i) => `<i style="--d:${(i * 0.7).toFixed(1)}s">${ch}<small>${kana(ch)}</small></i>`).join('')}</span>`;
// きいた ことばを もじで つくる：ことばを きく → もじを じゅんばんに えらぶ。{ first }（いちども まちがえなかったか）を かえす
export function spell({ word, art, letters, title = 'おとで つくろう！' }) {
  return new Promise(resolve => {
    const w = word.toLowerCase(), voice = { speak: w };
    let k = 0, first = true;
    const el = open(h(`<div class="modal"><div class="card magic w4spell"><div class="small">${title}</div><div class="spic"></div>
      <button class="sound">${SPEAKER_ICON}<span>ことばを きく</span></button>
      <div class="sslots">${w.split('').map((_, i) => `<i data-k="${i}"></i>`).join('')}</div>
      <div class="mmsg">&nbsp;</div>
      <div class="stiles">${letters.map((ch, i) => `<button class="stile" data-i="${i}">${ch}</button>`).join('')}</div></div></div>`), null);
    el.querySelector('.spic').appendChild(wordArt(art, 96));
    window.__abcSpell = { word: w, letters }; // じどうテスト よう
    const play = () => sayLetter(voice);
    el.querySelector('.sound').onclick = () => { sfx.tap(); play(); };
    el.querySelectorAll('.stile').forEach(b => b.onclick = () => {
      if (b.disabled || k >= w.length) return;
      const ch = letters[+b.dataset.i];
      if (ch === w[k]) {
        sfx.tap(); b.disabled = true; b.classList.add('used');
        const s = el.querySelector(`.sslots i[data-k="${k}"]`); s.textContent = ch; s.classList.add('on'); k++;
        if (k >= w.length) { sfx.correct(); play(); el.querySelector('.mmsg').innerHTML = `<span class="good">できた！ ${w}</span>`; el.querySelector('.sslots').classList.add('merge'); setTimeout(() => { close(); resolve({ first }); }, 1500); }
      } else {
        first = false; sfx.wrong(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        el.querySelector('.mmsg').innerHTML = `<span class="oops">${k + 1}ばんめの おとを よく きいて みよう</span>`; setTimeout(play, 400);
      }
    });
    setTimeout(play, 350);
  });
}

/* ---------- ワールド3「ことばの まち」---------- */
// ことばを まとめて おしえる カード（タップで よみかた）
export function teachWords(ids) {
  return new Promise(resolve => {
    const el = open(h(`<div class="modal"><div class="card teach w3teach">
      <div class="small">あたらしい ことば</div>
      <div class="w3cards">${ids.map(id => `<button class="w3c" data-id="${id}"><span class="art"></span><b>${WORD[id].word}</b><small>${WORD[id].ja}</small></button>`).join('')}</div>
      <div class="lname">タップすると えいごが きこえるよ</div>
      <button class="go">おぼえた！ クイズへ</button></div></div>`), () => done());
    const done = () => { sfx.tap(); close(); resolve(); };
    el.querySelectorAll('.w3c').forEach(b => { const w = WORD[b.dataset.id]; b.querySelector('.art').appendChild(wordArt(w.art, 64)); b.onclick = () => { sfx.tap(); sayLetter(w); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }; });
    el.querySelector('.go').onclick = done;
  });
}
// ぶんの かた。words が あれば はめた ぶん、なければ スロット（labels で スロットの いみを したに だす）
const frameHTML = (f, words, labels) => { let k = 0; return f.tpl.map(p => {
  if (p !== '＿') return `<span class="${/^[.,!?]/.test(p) ? 'punct' : ''}">${p}</span>`;
  const n = k++;
  if (words && words[n]) return `<b class="fw">${f.card ? f.card(words[n]) : words[n].word}</b>`;
  return labels ? `<span class="fslotw"><i class="fslot" data-k="${n}"></i><small>${(f.slotJa || [])[n] || ''}</small></span>` : `<i class="fslot" data-k="${n}"></i>`;
}).join(' '); };
// ぶんの かたを おしえる カード（f.lesson を 1まいずつ）
export function teachFrame(f) {
  return new Promise(resolve => {
    let i = 0;
    const el = open(h(`<div class="modal"><div class="card teach w3teach"><div class="small">あたらしい ぶんカード「${f.title}」</div><div class="lpage"></div>
      <div class="dots lsn">${f.lesson.map(() => '<i></i>').join('')}</div><button class="go">つぎへ</button></div></div>`), () => next());
    const page = el.querySelector('.lpage');
    const show = () => {
      const L = f.lesson[i];
      el.querySelectorAll('.lsn i').forEach((d, k) => d.className = k < i ? 'ok' : k === i ? 'now' : '');
      el.querySelector('.go').textContent = i === f.lesson.length - 1 ? 'つくって みる！' : 'つぎへ';
      if (L.big) {
        page.innerHTML = `<button class="bigword lbig">${L.big}</button><p class="ltext">${L.text}</p>`;
        const play = () => { sfx.tap(); sayLetter({ speak: L.say }); const b = page.querySelector('.lbig'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); };
        page.querySelector('.lbig').onclick = play; setTimeout(play, 300);
      } else if (L.frame) {
        page.innerHTML = `<div class="frame big">${frameHTML(f, null, true)}</div><p class="ltext">${L.text}</p>`;
      } else {
        page.innerHTML = `<p class="ltext">${L.text}</p><div class="exs">${L.examples.map((ids, k) => { const ws = ids.map(id => WORD[id]); return `<button class="ex" data-k="${k}"><span class="frame">${frameHTML(f, ws)}</span><small>＝ ${f.ja(ws)}</small></button>`; }).join('')}</div>`;
        page.querySelectorAll('.ex').forEach(b => b.onclick = () => { sfx.tap(); sayLetter({ speak: f.make(L.examples[+b.dataset.k].map(id => WORD[id])) }); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); });
        setTimeout(() => sayLetter({ speak: f.make(L.examples[0].map(id => WORD[id])) }), 300);
      }
    };
    const next = () => { sfx.tap(); i++; if (i >= f.lesson.length) { close(); resolve(); } else show(); };
    el.querySelector('.go').onclick = next;
    show();
  });
}
// ぶんカードで ぶんを つくる：check(ids) → {ok, msg}。つくった ことばの id を かえす（やめたら null）
export function sentence(st, { frame: f, title = 'ぶんを つくろう！', task = '', picture = null, check, hint }) {
  return new Promise(resolve => {
    const wt = w => f.card ? f.card(w) : w.word;
    let sel = f.slots.map(() => null);
    const cards = WORDS.filter(w => w.world === 3 && f.slots.includes(w.kind) && st.words[w.id]);
    const el = open(h(`<div class="modal"><div class="card magic w3sent"><div class="small">${title}</div>${task ? `<h2 class="task">${task}</h2>` : ''}<div class="spic"></div>
      <div class="frame big"></div>
      <div class="mmsg">&nbsp;</div>
      <div class="row2"><button class="go gray" data-a="cancel">やめる</button><button class="go cast" data-a="say">いう！</button>${hint ? '<button class="go hintb" data-a="hint">ヒント</button>' : ''}</div>
      <div class="w3cards">${cards.map(w => `<button class="w3c" data-id="${w.id}"><span class="art"></span><b>${wt(w)}</b><small>${w.ja}</small></button>`).join('')}</div></div></div>`), null);
    if (picture) el.querySelector('.spic').appendChild(wordArt(picture, 90));
    const msg = t => { el.querySelector('.mmsg').innerHTML = t; };
    const draw = () => {
      const box = el.querySelector('.frame');
      box.innerHTML = frameHTML(f, null, true);
      box.querySelectorAll('.fslot').forEach(s => { const k = +s.dataset.k; if (sel[k]) { s.textContent = wt(WORD[sel[k]]); s.classList.add('on'); s.onclick = () => { sel[k] = null; sfx.tap(); draw(); }; } });
      el.querySelectorAll('.w3c').forEach(b => b.classList.toggle('sel', sel.includes(b.dataset.id)));
      el.querySelector('[data-a=say]').disabled = sel.some(x => !x);
    };
    el.querySelectorAll('.w3c').forEach(b => {
      const w = WORD[b.dataset.id];
      b.querySelector('.art').appendChild(wordArt(w.art, 48));
      b.onclick = () => {
        sayLetter(w);
        const k = sel.indexOf(w.id); if (k >= 0) { sel[k] = null; draw(); return; }
        let slot = f.slots.findIndex((kind, i) => kind === w.kind && !sel[i]);
        if (slot < 0) slot = f.slots.findIndex(kind => kind === w.kind); // いっぱいなら いれかえ
        sel[slot] = w.id; draw();
      };
    });
    el.querySelector('[data-a=cancel]').onclick = () => { sfx.tap(); close(); resolve(null); };
    if (hint) el.querySelector('[data-a=hint]').onclick = () => { sfx.tap(); const r = hint(); msg(r.text); el.querySelectorAll('.w3c').forEach(b => b.classList.toggle('glow', (r.highlight || []).includes(b.dataset.id))); };
    el.querySelector('[data-a=say]').onclick = () => {
      if (sel.some(x => !x)) return;
      const text = f.make(sel.map(id => WORD[id]));
      sayLetter({ speak: text });
      const r = check([...sel]);
      if (!r.ok) { sfx.wrong(); msg(`<span class="oops">「${text}」 … ${r.msg}</span>`); const fr = el.querySelector('.frame'); fr.classList.remove('shake'); void fr.offsetWidth; fr.classList.add('shake'); return; }
      sfx.unlock(); msg(`<span class="good">「${text}」 ＝ ${f.ja(sel.map(id => WORD[id]))}</span>`); el.querySelector('.frame').classList.add('merge');
      setTimeout(() => { close(); resolve([...sel]); }, 1600);
    };
    draw();
  });
}

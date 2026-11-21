// がめんの パーツ（かいわ・もじカード・クイズ・メニュー など）。DOM で つくり、Promise で けっかを かえす
import { portrait, drawCritter, starPath, wordArt } from '../engine/art.js';
import { sfx, sayLetter } from '../engine/audio.js';
import { LETTER } from '../data/letters.js';
import { WORD, WORDS } from '../data/words.js';
import { LEVEL_NAME } from '../game/learning.js';
import * as input from '../engine/input.js';

const $ = s => document.querySelector(s);
const layer = () => $('#layer');
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
export const SPEAKER_KIND = { 'ラビ': 'rabbit', 'ありさん': 'ant', 'くまさん': 'bear', 'ねこさん': 'cat', 'いぬさん': 'dog', 'ぞうさん': 'elephant', 'ドラコ': 'dragon', 'チュチュ': 'mouse', 'きみ': 'fox' };
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

/* ---------- クイズ ---------- */
// qs：quiz.js の もんだいの はいれつ。onAnswer(q, ok, firstTry) で きろくする
export function quiz(qs, { title = 'クイズ', onAnswer = () => {} } = {}) {
  return new Promise(resolve => {
    let i = 0, first = true, locked = false;
    const el = open(h(`<div class="modal"><div class="card quiz"><div class="qhead"><span class="qt"></span><span class="dots"></span></div>
      <div class="prompt"></div><button class="sound">${SPEAKER_ICON}<span>もういちど きく</span></button>
      <div class="choices"></div><div class="fb">&nbsp;</div></div></div>`), null);
    const play = () => sayLetter(qs[i].voice || LETTER[qs[i].target]);
    el.querySelector('.sound').onclick = () => { sfx.tap(); play(); };
    const show = () => {
      const q = qs[i]; first = true; locked = false;
      window.__abcQ = q; // じどうテスト よう
      el.querySelector('.qt').textContent = title;
      el.querySelector('.dots').innerHTML = qs.length > 1 ? qs.map((_, k) => `<i class="${k < i ? 'ok' : k === i ? 'now' : ''}"></i>`).join('') : '';
      el.querySelector('.prompt').innerHTML = '';
      if (q.picture) el.querySelector('.prompt').appendChild(wordArt(q.picture, 110));
      el.querySelector('.prompt').appendChild(document.createTextNode(q.prompt));
      el.querySelector('.fb').innerHTML = '&nbsp;';
      const box = el.querySelector('.choices'); box.className = 'choices n' + q.choices.length; box.innerHTML = '';
      q.choices.forEach(c => {
        const r = q.render || 'letter';
        const b = h(`<button class="ch ${r}" data-v="${c}">${r === 'letter' ? LETTER[c].upper : r === 'word' ? WORD[c].word : ''}</button>`);
        if (r === 'pic') b.appendChild(wordArt(WORD[c].art, 92));
        b.onclick = () => pick(c, b); box.appendChild(b);
      });
      setTimeout(play, 300);
    };
    const pick = (c, b) => {
      if (locked || b.disabled) return;
      const q = qs[i];
      if (c === q.answer) {
        locked = true; b.classList.add('ok'); sfx.correct(); sayLetter(q.voice || LETTER[c]);
        onAnswer(q, true, first);
        el.querySelector('.fb').innerHTML = `<span class="good">せいかい！ ${q.label ? q.label(c) : c}</span>`;
        setTimeout(() => { i++; if (i >= qs.length) { close(); resolve(); } else show(); }, 1300);
      } else {
        if (first) onAnswer(q, false, true);
        first = false; b.disabled = true; b.classList.add('ng'); sfx.wrong();
        el.querySelector('.fb').innerHTML = '<span class="oops">おしい！ もういちど きいて みよう</span>';
        setTimeout(play, 500);
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
      <div class="wcards">${WORDS.filter(w => !w.future || st.words[w.id]).map(w => wordCardHTML(w, st, levelOf)).join('')}</div></div></div>`), null);
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

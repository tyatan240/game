/* 保護者向け 学習レポート。データは端末内の IndexedDB（common/learning-history.js）だけを読む。外部には送らない。
   保護者確認（かけ算）を通るまで、レポートは作らない。 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = 86400000;
  const SUBJ = { sansu: '算数', kokugo: '国語', eigo: '英語', prog: 'プログラミング' };
  const PAGE = { sansu: '../sansu/index.html', kokugo: '../kokugo/index.html', eigo: '../eigo/index.html', prog: '../program/index.html' };
  const PROG_TOPIC = { seq: 'ならべて うごかす（1〜6）', loop: 'くりかえし（7〜12）', seq2: 'もっと ならべて（13〜20）', loop2: 'もっと くりかえし（21〜30）' };
  const MODE = { practice: '練習', test: 'テスト', testprac: 'テスト練習', stage: 'ステージ' };
  const MIN_N = 5;          // これより少ない回答では 評価を断定しない
  const SUGGEST_N = 10;     // 復習提案に必要な 初回回答の数

  function topicName(subject, topic) {
    try {
      if (subject === 'sansu' && typeof TYPE !== 'undefined' && TYPE[topic]) return TYPE[topic].name;
      if (subject === 'kokugo' && typeof KTYPE !== 'undefined' && KTYPE[topic]) return KTYPE[topic].name;
      if (subject === 'eigo' && typeof ETYPE !== 'undefined' && ETYPE[topic]) return ETYPE[topic].name;
    } catch (e) { }
    if (subject === 'prog') return PROG_TOPIC[topic] || topic;
    return topic;
  }
  const pct = (a, b) => b ? Math.round(a / b * 100) : null;
  const pctTxt = (a, b) => b ? `${pct(a, b)}%` : '—';
  function fmtTime(ms) { const m = Math.round(ms / 60000); if (m < 1) return ms > 0 ? '1分未満' : '0分'; const h = Math.floor(m / 60); return h ? `${h}時間${m % 60}分` : `${m}分`; }
  const fmtDate = ms => { const d = new Date(ms); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const startOfDay = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return +d; };

  /* ---------- 保護者確認 ---------- */
  const TOKEN = 'moko-parent-ok', TOKEN_MS = 10 * 60 * 1000;
  let gq = null;
  function showGate() {
    $('#report').hidden = true; $('#report').innerHTML = ''; $('#gate').hidden = false;
    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    gq = [r(6, 9), r(6, 9)]; $('#gq').textContent = `${gq[0]} × ${gq[1]} =`; $('#gin').value = ''; $('#gmsg').textContent = '';
    setTimeout(() => $('#gin').focus(), 100);
  }
  function gateOk() {
    if (Number($('#gin').value) === gq[0] * gq[1]) { $('#gate').hidden = true; open(); }
    else $('#gmsg').textContent = 'ちがいます';
  }
  $('#gok').onclick = gateOk;
  $('#gin').addEventListener('keydown', e => { if (e.key === 'Enter') gateOk(); });
  // 設定画面（かけ算を通った直後）から来たときだけ、確認を省く。トークンは1回で使い切る
  function hasToken() { try { const t = +sessionStorage.getItem(TOKEN); sessionStorage.removeItem(TOKEN); return t && Date.now() - t < TOKEN_MS; } catch (e) { return false; } }
  // 画面を離れるときは 閲覧状態を終える（戻る・ホームへ・アプリ切替で戻ってきたら もう一度確認）
  addEventListener('pagehide', () => { try { sessionStorage.removeItem(TOKEN); } catch (e) { } $('#report').innerHTML = ''; $('#report').hidden = true; });
  addEventListener('pageshow', e => { if (e.persisted) showGate(); });

  /* ---------- 集計 ---------- */
  let ALL = [], period = '7', subjF = '', mistakeSubj = '', showAllMistakes = false;
  let C = null; // ALL から つくる まとめ（ALL が かわったら つくりなおす）
  function cache() {
    if (C && C.src === ALL) return C;
    const insts = LH.instances(ALL), byKey = new Map(), dayMin = new Map();
    for (const q of insts) { if (!byKey.has(q.questionKey)) byKey.set(q.questionKey, []); byKey.get(q.questionKey).push(q); }
    for (const a of ALL) dayMin.set(a.day, (dayMin.get(a.day) || 0) + (a.activeMs || 0) / 60000);
    return (C = { src: ALL, insts, byKey, dayMin, days: new Set(ALL.map(a => a.day)) });
  }
  function rangeOf(p) {
    const t0 = startOfDay(Date.now());
    if (p === 'today') return [t0, Infinity, 1];
    if (p === '7') return [t0 - 6 * DAY, Infinity, 7];
    if (p === '30') return [t0 - 29 * DAY, Infinity, 30];
    const first = ALL.length ? startOfDay(Math.min(...ALL.map(a => a.ts))) : t0;
    return [0, Infinity, Math.min(90, Math.max(1, Math.round((t0 - first) / DAY) + 1))];
  }
  const inRange = (a, [f, t]) => a.ts >= f && a.ts < t;

  // あとの日に 同じ問題／同じ単元で 正解したか（定着の確認）
  function laterCheck(q, insts) {
    const same = (cache().byKey.get(q.questionKey) || []).filter(x => x.ts > q.ts && x.day !== q.day && x.hasFirst);
    if (same.some(x => x.firstOk)) return { tag: 'ok', text: '後日 同じ問題に正解' };
    if (same.length) return { tag: 'ng', text: '後日 同じ問題に再挑戦（まだ不正解）' };
    const topic = insts.filter(x => x.ts > q.ts && x.day !== q.day && x.hasFirst && x.topic === q.topic && x.subject === q.subject);
    if (topic.some(x => x.firstOk)) return { tag: 'wait', text: '同じ単元の別の問題には正解（参考）' };
    return { tag: '', text: '後日の確認はまだ' };
  }

  /* ---------- グラフ（SVG を その場で作る。外部サービスは使わない）---------- */
  // 日付の目もり：多いときは間引き、最後の日は 近すぎなければ出す
  const showLabel = (i, n) => { if (n <= 10 || i === n - 1) return true; const st = Math.ceil(n / 8); return i % st === 0 && n - 1 - i >= st * .75; };
  function barChart(days, vals, fmt, color) {
    const W = 600, H = 170, P = 26, n = days.length, max = Math.max(1, ...vals), bw = (W - P * 2) / n;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
    s += `<line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="#dde5ee"/>`;
    vals.forEach((v, i) => {
      const h = (H - P * 2) * v / max, x = P + i * bw + bw * .15, y = H - P - h;
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * .7).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="3" fill="${color}"><title>${days[i]}：${fmt(v)}</title></rect>`;
      if (showLabel(i, n)) s += `<text x="${(x + bw * .35).toFixed(1)}" y="${H - 8}" font-size="11" text-anchor="middle" fill="#6b7c8c">${days[i].slice(5).replace('-', '/')}</text>`;
      if (v && n <= 14) s += `<text x="${(x + bw * .35).toFixed(1)}" y="${(y - 4).toFixed(1)}" font-size="10.5" text-anchor="middle" fill="#2f3d4a">${fmt(v)}</text>`;
    });
    s += `<text x="${P}" y="14" font-size="11" fill="#6b7c8c">最大 ${fmt(max)}</text></svg>`;
    return s;
  }
  function lineChart(days, vals) { // vals: null（データ少）または 0〜100
    const W = 600, H = 170, P = 26, n = days.length, x = i => P + (W - P * 2) * (n === 1 ? .5 : i / (n - 1)), y = v => H - P - (H - P * 2) * v / 100;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
    [0, 50, 100].forEach(v => { s += `<line x1="${P}" y1="${y(v)}" x2="${W - P}" y2="${y(v)}" stroke="#edf1f5"/><text x="2" y="${y(v) + 4}" font-size="10" fill="#6b7c8c">${v}%</text>`; });
    let path = '', pts = '';
    vals.forEach((v, i) => { if (v == null) { path += ' '; return; } path += `${/\d$/.test(path.trim()) ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `; pts += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5" fill="#3dbb6a"><title>${days[i]}：${v}%</title></circle>`; });
    s += `<path d="${path.replace(/ (?=M)/g, ' ')}" fill="none" stroke="#3dbb6a" stroke-width="2.5"/>${pts}`;
    days.forEach((d, i) => { if (showLabel(i, n)) s += `<text x="${x(i).toFixed(1)}" y="${H - 8}" font-size="11" text-anchor="middle" fill="#6b7c8c">${d.slice(5).replace('-', '/')}</text>`; });
    return s + '</svg>';
  }
  const hbar = (label, v, n, sub) => `<div class="bar"><span class="t" title="${esc(label)}">${esc(label)}</span><span class="track"><span class="fill ${n < MIN_N ? 'low' : ''}" style="width:${v ?? 0}%"></span></span><span class="v">${v == null ? '—' : v + '%'}（${n}問${sub ? '・' + sub : ''}）</span></div>`;

  /* ---------- 画面 ---------- */
  async function open() {
    $('#report').hidden = false; $('#report').innerHTML = '<p class="muted">読み込んでいます…</p>';
    ALL = await LH.getAttempts();
    draw();
  }
  function draw() {
    const R = rangeOf(period), atts = ALL.filter(a => inRange(a, R) && (!subjF || a.subject === subjF));
    const insts = cache().insts, sum = LH.summarize(atts.filter(a => a.subject !== 'prog'));
    const tAll = atts.reduce((n, a) => n + (a.activeMs || 0), 0);
    const days = []; for (let i = R[2] - 1; i >= 0; i--) days.push(LH.dayKey(startOfDay(Date.now()) - i * DAY));
    const dayMap = new Map(); for (const a of atts) { if (!dayMap.has(a.day)) dayMap.set(a.day, []); dayMap.get(a.day).push(a); }
    const byDay = d => dayMap.get(d) || [];
    const dayTime = days.map(d => byDay(d).reduce((n, a) => n + (a.activeMs || 0), 0) / 60000);
    const dayQ = days.map(d => LH.instances(byDay(d).filter(a => a.subject !== 'prog')).filter(q => q.hasFirst).length);
    const dayAcc = days.map(d => { const s = LH.summarize(byDay(d).filter(a => a.subject !== 'prog')); return s.questions >= 3 ? pct(s.firstOk, s.questions) : null; });
    const H = [];
    H.push(`<div class="tabs" id="ptabs">${[['today', '今日'], ['7', '7日間'], ['30', '30日間'], ['all', '全期間']].map(([k, l]) => `<button data-p="${k}" class="${k === period ? 'on' : ''}">${l}</button>`).join('')}</div>`);
    H.push(`<div class="tabs" id="stabs">${[['', 'すべての教科'], ['sansu', '算数'], ['kokugo', '国語'], ['eigo', '英語'], ['prog', 'プログラミング']].map(([k, l]) => `<button data-s="${k}" class="${k === subjF ? 'on' : ''}">${l}</button>`).join('')}</div>`);
    if (!ALL.length) H.push(`<div class="card"><h2>まだ記録がありません</h2><p class="muted">さんすう・こくご・えいご・プログラミングで問題を解くと、ここに記録が表示されます。記録はこの端末の中だけに保存されます。</p></div>`);

    // 概要
    H.push(`<div class="card"><h2>概要</h2><div class="kpis">
      <div class="kpi"><span>学習時間</span><b>${fmtTime(tAll)}</b><small>問題に取り組んだ時間</small></div>
      <div class="kpi"><span>問題数</span><b>${sum.questions}問</b><small>回答 ${sum.attempts}回</small></div>
      <div class="kpi"><span>初回正答率</span><b>${pctTxt(sum.firstOk, sum.questions)}</b><small>${sum.firstOk} / ${sum.questions}問</small></div>
      <div class="kpi"><span>解き直し成功</span><b>${sum.retryOk}問</b><small>初回不正解 ${sum.firstWrong}問中（${pctTxt(sum.retryOk, sum.firstWrong)}）</small></div>
      <div class="kpi"><span>学習した日数</span><b>${new Set(atts.map(a => a.day)).size}日</b><small>${period === 'today' ? '今日' : R[2] + '日間のうち'}</small></div></div>
      ${sum.firstWrong ? `<p class="muted" style="margin:8px 0 0">初回不正解 ${sum.firstWrong}問の内訳：解き直しで正解 ${sum.retryOk}・解き直したが不正解 ${sum.retryNg}・未再挑戦 ${sum.notRetried}（うちテストなど解き直しのない形式 ${sum.notRetriable}）</p>` : ''}
      ${sum.questions && sum.questions < MIN_N * 2 ? `<div class="note">問題数が少ないため、正答率は参考値です。</div>` : ''}
      <p class="muted" style="margin:8px 0 0">※ 初回正答率は「同じ出題の1回目の答え」だけで計算します。解き直しで正解しても初回正答率は変わりません。学習時間は問題を表示してから答えるまでの時間で、画面を閉じていた時間や、1問あたり60秒（文章を読む問題・プログラミングは180秒）を超えた分は含みません。</p></div>`);

    // 推移
    H.push(`<div class="grid two">
      <div class="card"><h2>日別の学習時間</h2>${barChart(days, dayTime, v => v < 1 && v > 0 ? '<1分' : Math.round(v) + '分', '#4a8fe0')}</div>
      <div class="card"><h2>日別の問題数</h2>${barChart(days, dayQ, v => v + '問', '#f0a92e')}</div></div>`);
    H.push(`<div class="card"><h2>初回正答率の推移</h2>${lineChart(days, dayAcc)}<p class="muted" style="margin:4px 0 0">1日3問以上解いた日だけ表示します。日によって問題の種類やレベル（練習・テスト）が違うため、上下だけで判断しないでください。</p></div>`);

    // 教科別・単元別
    const subjects = subjF ? [subjF] : ['sansu', 'kokugo', 'eigo', 'prog'];
    let sh = '';
    for (const s of subjects) {
      const a = atts.filter(x => x.subject === s); if (!a.length && subjF !== s) continue;
      const tm = a.reduce((n, x) => n + (x.activeMs || 0), 0);
      if (s === 'prog') {
        const qs = LH.instances(a), cleared = qs.filter(q => q.finalOk);
        sh += `<div class="subj"><h3>${SUBJ[s]}</h3><div class="row"><span>学習時間 <b>${fmtTime(tm)}</b></span><span>ステージ挑戦 <b>${qs.length}回</b>（実行 ${a.length}回）</span><span>クリア <b>${cleared.length}回</b>（${pctTxt(cleared.length, qs.length)}）</span><span>1回目の実行でクリア <b>${qs.filter(q => q.firstOk).length}回</b></span></div>`;
        const bt = LH.byTopic(a);
        sh += bt.map(t => { const q = LH.instances(a.filter(x => x.topic === t.topic)); return hbar(topicName(s, t.topic), pct(q.filter(x => x.finalOk).length, q.length), q.length, 'クリア率'); }).join('');
        const best = {}; a.forEach(x => { if (x.isCorrect) { const st = x.params && x.params.stage; if (st != null) best[st] = Math.max(best[st] || 0, x.params.stars || 0); } });
        if (Object.keys(best).length) sh += `<p class="muted">クリアしたステージ：${Object.keys(best).map(k => +k + 1).sort((x, y) => x - y).map(k => `${k}${'★'.repeat(best[k - 1])}`).join('、')}</p>`;
        sh += `<p class="muted">プログラミングは「ステージを開いて実行した回数」と「クリアできたか」で表示します（正誤問題とは性質が違うため、正答率には含めません）。</p></div>`;
        continue;
      }
      const ss = LH.summarize(a);
      sh += `<div class="subj"><h3>${SUBJ[s]}</h3><div class="row"><span>学習時間 <b>${fmtTime(tm)}</b></span><span>問題数 <b>${ss.questions}問</b></span><span>初回正答率 <b>${pctTxt(ss.firstOk, ss.questions)}</b></span><span>解き直し成功 <b>${ss.retryOk} / ${ss.firstWrong}</b></span></div>`;
      sh += LH.byTopic(a).sort((x, y) => y.questions - x.questions).map(t => hbar(topicName(s, t.topic), pct(t.firstOk, t.questions), t.questions, '初回')).join('');
      sh += '</div>';
    }
    H.push(`<div class="card"><h2>教科別・単元別</h2>${sh || '<p class="muted">この期間の記録はありません。</p>'}<p class="muted" style="margin:6px 0 0">グラフは単元ごとの初回正答率です。灰色は回答が${MIN_N}問未満で、評価を断定できない単元です。</p></div>`);

    // 英語（ABCぼうけん）の習得状況
    if (!subjF || subjF === 'eigo') H.push(`<div class="card" id="encard"><h2>🔤 英語の習得状況（ABCぼうけん）</h2>${english()}</div>`);

    // 成長レポート・復習提案・継続
    H.push(`<div class="grid two"><div class="card"><h2>🌱 成長レポート</h2>${growth()}</div><div class="card"><h2>📝 復習すると よさそうな単元</h2>${suggestions()}</div></div>`);
    H.push(`<div class="card"><h2>📅 学習の継続</h2>${streak()}</div>`);

    // 間違えた問題
    H.push(`<div class="card" id="mist"><h2>まちがえた問題</h2>${mistakes(insts, R)}</div>`);

    // バックアップ
    H.push(`<div class="card"><h2>学習データの保存・復元</h2>
      <p class="muted">学習履歴はこの端末の中（ブラウザ）だけに保存され、外部には送信されません。おうちの⚙️設定の「データの ひきつぎ」のコードには<b>学習履歴は含まれません</b>。端末を移すときやバックアップには、ここから保存してください。</p>
      <div class="btns"><button class="btn" id="exj">学習データを保存（JSON）</button><button class="btn sub" id="exc">表として保存（CSV）</button></div>
      <div class="btns"><label class="btn sub" style="display:inline-block">JSONから復元<input type="file" id="imf" accept="application/json,.json" hidden></label><button class="btn warn" id="del">学習履歴を削除</button></div>
      <div class="muted" id="bkmsg"></div>
      <p class="muted">記録件数：回答 ${ALL.length}件${LH.errors() ? `・保存の再試行 ${LH.errors()}回` : ''}</p></div>`);
    $('#report').innerHTML = H.join('');
    bind();
  }

  // ABCぼうけんの データ（文字・単語・文）を あとから 読みこむ（ES Modules なので dynamic import）
  let ABCD = null;
  Promise.all([import('../abc/js/data/words.js'), import('../abc/js/data/sentences.js'), import('../abc/js/game/learning.js')])
    .then(([w, s, l]) => { ABCD = { WORDS: w.WORDS, WORD: w.WORD, FRAMES: s.FRAMES, levelOf: l.levelOf }; const c = $('#encard'); if (c) c.innerHTML = '<h2>🔤 英語の習得状況（ABCぼうけん）</h2>' + english(); })
    .catch(() => { ABCD = false; });
  function english() {
    if (ABCD === null) return '<p class="muted">読みこみ中…</p>';
    if (!ABCD) return '<p class="muted">ABCぼうけんのデータを読みこめませんでした。</p>';
    let d = {}; try { d = JSON.parse(localStorage.getItem('abc-adventure-v1') || 'null') || {}; } catch (e) { }
    if (!d.started && !Object.keys(d.records || {}).length) return '<p class="muted">まだ ABCぼうけん の記録がありません。</p>';
    const { WORDS, WORD, FRAMES, levelOf } = ABCD, recs = d.records || {}, now = Date.now();
    // 学習の記録は ワールドを またいで 1つ（slots の 進み具合は 合算しない）。覚えた単語は いまの進み＋しまってある進み の合計
    const slots = Object.values(d.slots || {}), known = new Set(Object.keys(d.words || {})), lw = new Set(d.learned || []), ll = new Set(d.lower || []), fr = new Set(Object.keys(d.sentences || {}));
    for (const s of slots) { Object.keys(s.words || {}).forEach(x => known.add(x)); (s.learned || []).forEach(x => lw.add(x)); (s.lower || []).forEach(x => ll.add(x)); Object.keys(s.sentences || {}).forEach(x => fr.add(x)); }
    const w1 = WORDS.filter(w => (w.world || 1) === 1 && !w.future), w3 = WORDS.filter(w => w.world === 3);
    const learnedN = ids => ids.filter(id => levelOf(recs[id]) >= 2).length;
    const kpi = (label, n, total, sub) => `<div class="kpi"><span>${label}</span><b>${n} / ${total}</b><small>${sub || ''}</small></div>`;
    const weak = Object.entries(recs).filter(([k, r]) => r && r.asked >= 2 && r.correct / r.asked < 0.7)
      .map(([k, r]) => { const id = k.replace(/^(w:|l:|ph:|s:)/, ''), kind = k.startsWith('w:') ? '単語' : k.startsWith('l:') ? '小文字' : k.startsWith('ph:') ? '最初の音' : k.startsWith('s:') ? '文' : '大文字';
        const name = k.startsWith('w:') && WORD[id] ? `${WORD[id].word}（${WORD[id].ja}）` : k.startsWith('l:') ? id.toLowerCase() : k.startsWith('ph:') && WORD[id] ? WORD[id].word : k.startsWith('s:') ? (FRAMES.find(f => f.id === id) || {}).title || id : id;
        return { kind, name, acc: r.correct / r.asked, n: r.asked }; })
      .sort((a, b) => a.acc - b.acc).slice(0, 10);
    const due = Object.values(recs).filter(r => r && r.asked && r.due && r.due <= now).length;
    return `<div class="kpis">
      ${kpi('大文字（A〜Z）', lw.size, 26, `「覚えた」${learnedN([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'])}`)}
      ${kpi('小文字（a〜z）', ll.size, 26, `「覚えた」${learnedN([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(x => 'l:' + x))}`)}
      ${kpi('単語（ワールド1）', w1.filter(w => known.has(w.id)).length, w1.length, `「覚えた」${learnedN(w1.map(w => 'w:' + w.id))}`)}
      ${kpi('ことば（ワールド3）', w3.filter(w => known.has(w.id)).length, w3.length, `「覚えた」${learnedN(w3.map(w => 'w:' + w.id))}`)}
      ${kpi('文の形', fr.size, FRAMES.length, FRAMES.filter(f => fr.has(f.id)).map(f => f.tpl.join(' ').replace(' .', '.')).join(' / '))}</div>
      <p class="muted" style="margin:8px 0 0">クリア回数：ワールド1（大文字）${d.clears || 0}回・ワールド2（小文字）${d.w2clears || 0}回・ワールド3（ことばの まち）${d.w3clears || 0}回。
      「覚えた」は 3回以上正解・2回連続正解・正答率70%以上。復習の時期が来ている項目：${due}件（英語の部屋の「きょうの ふくしゅう」で出ます）。</p>
      <h3 style="margin:12px 0 4px">苦手な項目（2回以上出題・正答率70%未満）</h3>
      ${weak.length ? weak.map(x => hbar(`${x.kind}：${x.name}`, Math.round(x.acc * 100), x.n, '正答率')).join('') : '<p class="muted">いまのところ苦手な項目はありません。</p>'}`;
  }

  function growth() {
    const now = startOfDay(Date.now()), wk = ALL.filter(a => a.ts >= now - 6 * DAY), prev = ALL.filter(a => a.ts >= now - 13 * DAY && a.ts < now - 6 * DAY);
    const msgs = [];
    const insts = cache().insts;
    // 単元ごとの初回正答率の変化（今週と先週、どちらも十分なとき）
    const tw = LH.byTopic(wk), tp = LH.byTopic(prev);
    for (const t of tw) {
      if (t.subject === 'prog') continue;
      const p = tp.find(x => x.subject === t.subject && x.topic === t.topic);
      if (p && t.questions >= MIN_N && p.questions >= MIN_N) {
        const d = pct(t.firstOk, t.questions) - pct(p.firstOk, p.questions);
        if (d >= 10) msgs.push(`先週より「${topicName(t.subject, t.topic)}」の初回正答率が上がりました（${pct(p.firstOk, p.questions)}% → ${pct(t.firstOk, t.questions)}%）`);
      }
    }
    // 以前まちがえた問題に、後日正解
    const wrongBefore = insts.filter(q => q.hasFirst && !q.firstOk);
    const fixed = new Set(); for (const q of wrongBefore) { if ((cache().byKey.get(q.questionKey) || []).some(x => x.ts > q.ts && x.day !== q.day && x.firstOk && x.ts >= now - 6 * DAY)) fixed.add(q.questionKey); }
    if (fixed.size) msgs.push(`前にまちがえた問題に、この7日間で ${fixed.size}問 正解できました`);
    // 新しい単元
    const before = new Set(ALL.filter(a => a.ts < now - 6 * DAY).map(a => a.subject + '|' + a.topic));
    const newT = [...new Set(wk.map(a => a.subject + '|' + a.topic))].filter(k => !before.has(k));
    if (newT.length && ALL.some(a => a.ts < now - 6 * DAY)) msgs.push(`この7日間に新しい単元に挑戦しました：${newT.slice(0, 4).map(k => { const [s, t] = k.split('|'); return '「' + topicName(s, t) + '」'; }).join('')}`);
    // 解き直し
    const ws = LH.summarize(wk.filter(a => a.subject !== 'prog')); if (ws.retryOk) msgs.push(`この7日間、まちがえたあと解き直して正解した問題が ${ws.retryOk}問 あります`);
    const pc = LH.instances(wk.filter(a => a.subject === 'prog')).filter(q => q.finalOk && !q.firstOk).length; if (pc) msgs.push(`プログラミングで、失敗してもあきらめずに ${pc}回 クリアしました`);
    const d7 = new Set(wk.map(a => a.day)).size; if (d7) msgs.push(`7日間のうち ${d7}日 勉強しました`);
    if (!prev.length && wk.length) msgs.push('先週の記録がないため、先週との比較はまだできません');
    return msgs.length ? `<ul class="msgs">${msgs.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="muted">まだ比較できません。記録がたまると、ここに成長が表示されます。</p>';
  }

  function suggestions() {
    const now = startOfDay(Date.now()), recent = ALL.filter(a => a.ts >= now - 29 * DAY && a.subject !== 'prog');
    const out = [];
    for (const t of LH.byTopic(recent)) {
      if (t.questions < SUGGEST_N) continue;
      const a = recent.filter(x => x.subject === t.subject && x.topic === t.topic);
      const last = LH.instances(a).filter(q => q.hasFirst).sort((x, y) => y.ts - x.ts).slice(0, 10);
      const all = pct(t.firstOk, t.questions), lastAcc = pct(last.filter(q => q.firstOk).length, last.length), retry = t.firstWrong ? pct(t.retryOk, t.firstWrong) : 100;
      // 初回正答率が低め、かつ 最近も低め（最近よくなっている単元は出さない）。テストの多い単元は 少し甘めに
      const tests = a.filter(x => x.mode !== 'practice').length / a.length;
      const th = 70 - tests * 10;
      if (all < th && lastAcc < th + 10) out.push({ t, score: all + lastAcc / 2 - (100 - retry) / 10, all, lastAcc });
    }
    out.sort((x, y) => x.score - y.score);
    if (!out.length) return `<p class="muted">今のところ、特に復習が必要そうな単元はありません（1つの単元で${SUGGEST_N}問以上の回答がたまると判定します）。</p>`;
    return out.slice(0, 4).map(({ t, all, lastAcc }) => `<div class="sugg"><span>「${esc(topicName(t.subject, t.topic))}」（${SUBJ[t.subject]}）を もうすこし れんしゅうすると よさそうです<br><span class="muted">初回正答率 ${all}%・最近10問 ${lastAcc}%（${t.questions}問）</span></span><a class="btn sub" href="${PAGE[t.subject]}#start=${encodeURIComponent(t.topic)}">練習へ</a></div>`).join('') + '<p class="muted">回答数・最近の結果・解き直しの結果をもとにした目安です。</p>';
  }

  function streak() {
    const days = cache().days, today = startOfDay(Date.now());
    let s = 0; for (let i = days.has(LH.dayKey(today)) ? 0 : 1; days.has(LH.dayKey(today - i * DAY)); i++) s++;
    const cells = []; const start = today - 27 * DAY - new Date(today - 27 * DAY).getDay() * DAY;
    for (let t = start; t <= today; t += DAY) {
      const k = LH.dayKey(t), m = cache().dayMin.get(k) || 0;
      cells.push(`<i class="${m >= 15 ? 'l3' : m >= 5 ? 'l2' : m > 0 ? 'l1' : ''} ${t === today ? 'today' : ''}" title="${k}：${Math.round(m)}分">${new Date(t).getDate()}</i>`);
    }
    const d30 = [...days].filter(d => d >= LH.dayKey(today - 29 * DAY)).length;
    return `<div class="row" style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px"><span>連続 <b>${s}日</b></span><span>30日間で <b>${d30}日</b> 勉強</span></div>
      <div class="cal">${['日', '月', '火', '水', '木', '金', '土'].map(d => `<i style="background:none">${d}</i>`).join('')}${cells.join('')}</div><p class="muted">色が濃いほど学習時間が長い日です（5分・15分で色が変わります）。</p>`;
  }

  function mistakes(insts, R) {
    let list = insts.filter(q => q.hasFirst && !q.firstOk && q.ts >= R[0] && q.subject !== 'prog' && (!mistakeSubj || q.subject === mistakeSubj) && (!subjF || q.subject === subjF)).sort((x, y) => y.ts - x.ts);
    const n = list.length; if (!showAllMistakes) list = list.slice(0, 20);
    const items = list.map(q => {
      const lc = laterCheck(q, insts), final = q.retryOk ? '<span class="tag ok">解き直しで正解</span>' : q.retries ? '<span class="tag ng">解き直したが不正解</span>' : q.canRetry ? '<span class="tag wait">未再挑戦</span>' : '<span class="tag">解き直しのない形式</span>';
      return `<div class="item"><div class="q">${esc(q.first.questionText)}</div>
        <div>こたえ：<b style="color:#c63d46">${esc(q.list.map(a => a.userAnswer).join(' → '))}</b>　正解：<b>${esc(q.first.correctAnswer)}</b></div>
        <div class="meta"><span>${SUBJ[q.subject]}・${esc(topicName(q.subject, q.topic))}・${MODE[q.mode] || ''}</span><span>${fmtDate(q.ts)}</span><span>再挑戦 ${q.retries}回</span></div>
        <div style="margin-top:4px">${final} ${lc.tag !== undefined ? `<span class="tag ${lc.tag}">${lc.text}</span>` : ''}</div></div>`;
    }).join('');
    return `<div class="filters"><select id="msub"><option value="">すべて</option>${['sansu', 'kokugo', 'eigo'].map(s => `<option value="${s}" ${s === mistakeSubj ? 'selected' : ''}>${SUBJ[s]}</option>`).join('')}</select><span class="muted" style="align-self:center">${n}問（この期間に初回でまちがえた問題）</span></div>
      <div class="list">${items || '<p class="muted">この期間にまちがえた問題はありません。</p>'}</div>
      ${n > list.length ? `<div class="btns"><button class="btn sub" id="mmore">すべて表示（${n}問）</button></div>` : ''}`;
  }

  /* ---------- 操作 ---------- */
  function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  const stamp = () => LH.dayKey(Date.now());
  function confirmDlg(html, ok) {
    const d = document.createElement('div'); d.className = 'dlg'; d.innerHTML = `<div class="card">${html}<div class="btns" style="justify-content:flex-end"><button class="btn sub" data-x="0">やめる</button><button class="btn" data-x="1">はい</button></div></div>`;
    d.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; d.remove(); if (b.dataset.x === '1') ok(); };
    document.body.appendChild(d);
  }
  function bind() {
    $('#ptabs').onclick = e => { const b = e.target.closest('[data-p]'); if (b) { period = b.dataset.p; draw(); } };
    $('#stabs').onclick = e => { const b = e.target.closest('[data-s]'); if (b) { subjF = b.dataset.s; draw(); } };
    const ms = $('#msub'); if (ms) ms.onchange = () => { mistakeSubj = ms.value; draw(); $('#mist').scrollIntoView(); };
    const mm = $('#mmore'); if (mm) mm.onclick = () => { showAllMistakes = true; draw(); $('#mist').scrollIntoView(); };
    $('#exj').onclick = async () => { const o = await LH.exportAll(); download(`moko-learning-${stamp()}.json`, JSON.stringify(o), 'application/json'); $('#bkmsg').textContent = `保存しました（回答 ${o.attempts.length}件）`; };
    $('#exc').onclick = async () => {
      const o = await LH.exportAll(), cols = ['timestamp', 'subject', 'topic', 'mode', 'questionText', 'userAnswer', 'correctAnswer', 'isCorrect', 'attemptNumber', 'activeMs', 'earnedStars', 'questionKey', 'questionInstanceId'];
      const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      download(`moko-learning-${stamp()}.csv`, '﻿' + [cols.join(','), ...o.attempts.sort((a, b) => a.ts - b.ts).map(a => cols.map(c => q(c === 'subject' ? SUBJ[a.subject] || a.subject : c === 'topic' ? topicName(a.subject, a.topic) : a[c])).join(','))].join('\r\n'), 'text/csv');
    };
    $('#imf').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      let o; try { o = JSON.parse(await f.text()); } catch (err) { $('#bkmsg').textContent = 'JSONファイルとして読めませんでした'; return; }
      let pre; try { pre = await LH.importData(o, true); } catch (err) { $('#bkmsg').textContent = err.message === 'version' ? 'このアプリより新しい形式のファイルです（読み込めません）' : '学習データのファイルではありません'; return; }
      confirmDlg(`<h2>学習履歴を復元しますか？</h2><p>追加 ${pre.added}件・すでにある（同じID）${pre.skipped}件・不正なデータ ${pre.rejected}件<br>今ある記録は消えません。同じIDの記録は追加しません。</p>`, async () => {
        try { const r = await LH.importData(o); ALL = await LH.getAttempts(); draw(); $('#bkmsg').textContent = `復元しました（追加 ${r.added}件）`; } catch (err) { $('#bkmsg').textContent = '復元に失敗しました'; }
      });
    };
    $('#del').onclick = () => confirmDlg('<h2>学習履歴を削除しますか？</h2><p>この端末の学習履歴（レポートの記録）をすべて削除します。星・持ち物・まち などのゲームのデータは消えません。<br><b>元に戻せません。</b>必要なら先に「学習データを保存」してください。</p>', () =>
      confirmDlg('<h2>本当に削除しますか？</h2>', async () => { await LH.clearAll(); ALL = []; draw(); $('#bkmsg').textContent = '削除しました'; }));
  }

  if (hasToken()) { $('#gate').hidden = true; open(); } else showGate();
  window.__report = { get all() { return ALL; }, draw, open, setPeriod: p => { period = p; draw(); }, setSubj: s => { subjF = s; draw(); } };
})();

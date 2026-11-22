/* 学習履歴（保護者向けレポート用）。IndexedDB "moko-learning-history" に保存する。
   - 既存のセーブデータ（moko-math-v1 など）には触らない。
   - 保存に失敗しても、問題・星の処理は止めない（例外を外に出さない。キューで再試行）。
   - core.js に依存しない（program/ のように core.js を読まないページでも使える）。
   クラシックスクリプト。グローバル LearningHistory（短縮 LH）を定義する。 */
(function () {
  'use strict';
  const DB = 'moko-learning-history', VER = 1, SCHEMA = 1;
  const IDLE_MS = 60000;          // 無操作の上限（1問あたり。これを超えた分は学習時間に含めない）
  const IDLE_READING_MS = 180000; // 長い文章を読む問題（よみとり）・プログラミング
  const LIMIT = 2000;             // IndexedDB の返事を待つ上限

  let dbP = null;
  function open() {
    if (dbP) return dbP;
    dbP = new Promise((ok, ng) => {
      let done = false; const t = setTimeout(() => { if (!done) { done = true; ng(new Error('idb timeout')); } }, LIMIT);
      try {
        const q = indexedDB.open(DB, VER);
        q.onupgradeneeded = () => {
          const db = q.result;
          if (!db.objectStoreNames.contains('attempts')) {
            const s = db.createObjectStore('attempts', { keyPath: 'id' });
            s.createIndex('ts', 'ts'); s.createIndex('subject', 'subject'); s.createIndex('questionKey', 'questionKey'); s.createIndex('topic', 'topic'); s.createIndex('instance', 'questionInstanceId');
          }
          if (!db.objectStoreNames.contains('sessions')) { const s = db.createObjectStore('sessions', { keyPath: 'id' }); s.createIndex('start', 'start'); s.createIndex('subject', 'subject'); }
          if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata', { keyPath: 'k' });
        };
        q.onsuccess = () => { if (done) return; done = true; clearTimeout(t); const db = q.result; try { db.transaction('metadata', 'readwrite').objectStore('metadata').put({ k: 'schema', v: SCHEMA }); } catch (e) { } ok(db); };
        q.onerror = () => { if (done) return; done = true; clearTimeout(t); ng(q.error); };
      } catch (e) { done = true; clearTimeout(t); ng(e); }
    }).catch(e => { dbP = null; throw e; });
    return dbP;
  }
  function tx(store, mode, fn) {
    return open().then(db => new Promise((ok, ng) => {
      const t = db.transaction(store, mode), st = t.objectStore(store); let out;
      try { out = fn(st); } catch (e) { ng(e); return; }
      t.oncomplete = () => ok(out && 'result' in out ? out.result : out); t.onerror = () => ng(t.error); t.onabort = () => ng(t.error);
    }));
  }

  /* ---------- 書き込みキュー（失敗しても止めない・再試行）---------- */
  const queue = []; let busy = false, errors = 0;
  function enqueue(store, rec) { queue.push({ store, rec, tries: 0 }); flush(); }
  function flush() {
    if (busy || !queue.length) return; busy = true;
    const job = queue[0];
    tx(job.store, 'readwrite', st => st.put(job.rec)).then(() => { queue.shift(); busy = false; flush(); }).catch(() => {
      errors++; job.tries++; busy = false;
      if (job.tries >= 4) { queue.shift(); remember(job); flush(); } else setTimeout(flush, 800 * job.tries);
    });
  }
  // どうしても保存できなかった記録は localStorage に一時退避（次に開いたとき再試行）
  const PENDING = 'moko-learning-pending';
  function remember(job) { try { const a = JSON.parse(localStorage.getItem(PENDING) || '[]'); a.push(job); localStorage.setItem(PENDING, JSON.stringify(a.slice(-200))); } catch (e) { } }
  function retryPending() { try { const a = JSON.parse(localStorage.getItem(PENDING) || '[]'); if (!a.length) return; localStorage.removeItem(PENDING); a.forEach(j => enqueue(j.store, j.rec)); } catch (e) { } }

  /* ---------- 時間の計測（非表示の間は止める）---------- */
  let hiddenAt = 0, hiddenTotal = 0;
  const now = () => Date.now();
  const activeNow = () => now() - hiddenTotal - (hiddenAt ? now() - hiddenAt : 0); // 表示されていた時間の累計時計
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { if (!hiddenAt) hiddenAt = now(); }
    else if (hiddenAt) { hiddenTotal += now() - hiddenAt; hiddenAt = 0; }
  });
  const uid = p => p + now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pad = n => String(n).padStart(2, '0');
  function isoLocal(ms) { const d = new Date(ms), o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-'; return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${s}${pad(Math.floor(Math.abs(o) / 60))}:${pad(Math.abs(o) % 60)}`; }
  const dayKey = ms => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  let session = null;           // 今の学習セッション
  const begun = new Map();      // 出題ID → 取り組み開始（表示時間の時計）
  const seen = new Set();       // 出題ID#回答回数（二重記録を防ぐ）

  function saveSession() { if (session) enqueue('sessions', { ...session }); }
  const LH = {
    IDLE_MS, IDLE_READING_MS, dayKey,
    newInstance: () => uid('q'),
    // セッション開始（前のセッションは閉じる）
    startSession(o = {}) {
      try {
        LH.endSession();
        const t = now();
        session = { id: uid('s'), subject: o.subject || '', mode: o.mode || '', start: t, timestamp: isoLocal(t), end: t, activeMs: 0, attempts: 0, correctFirst: 0 };
        saveSession(); return session.id;
      } catch (e) { return null; }
    },
    endSession() { try { if (!session) return; session.end = now(); saveSession(); session = null; } catch (e) { } },
    // 問題を表示したとき（取り組み開始）
    begin(instanceId) { try { if (instanceId) begun.set(instanceId, activeNow()); } catch (e) { } },
    // 回答が確定したとき。既存の正誤判定・星の処理のあとに呼ぶ
    recordAttempt(a) {
      try {
        const key = a.questionInstanceId + '#' + a.attemptNumber;
        if (!a.questionInstanceId || seen.has(key)) return null; seen.add(key);
        const t = now(), cap = a.reading || a.subject === 'prog' ? IDLE_READING_MS : IDLE_MS;
        const st = begun.has(a.questionInstanceId) ? begun.get(a.questionInstanceId) : activeNow();
        const raw = Math.max(0, activeNow() - st);
        begun.set(a.questionInstanceId, activeNow()); // 解き直しは 前の回答から 数える
        const rec = {
          id: uid('a'), ts: t, timestamp: isoLocal(t), day: dayKey(t), sessionId: session ? session.id : null,
          questionInstanceId: a.questionInstanceId, questionKey: a.questionKey, subject: a.subject, topic: a.topic, skill: a.skill || a.topic,
          difficulty: a.difficulty || 0, mode: a.mode || '', questionText: String(a.questionText || ''), correctAnswer: String(a.correctAnswer ?? ''),
          userAnswer: String(a.userAnswer ?? ''), isCorrect: !!a.isCorrect, attemptNumber: a.attemptNumber || 1, hintUsed: !!a.hintUsed,
          responseTimeMs: raw, activeMs: Math.min(raw, cap), idleCut: raw > cap, earnedStars: a.earnedStars || 0, params: a.params || null,
        };
        enqueue('attempts', rec);
        if (session) { session.activeMs += rec.activeMs; session.attempts++; if (rec.attemptNumber === 1 && rec.isCorrect) session.correctFirst++; session.end = t; saveSession(); }
        return rec.id;
      } catch (e) { return null; }
    },
    pending: () => queue.length,
    errors: () => errors,
    flushed: () => new Promise(ok => { const w = () => (!queue.length && !busy) ? ok() : setTimeout(w, 50); w(); }),

    /* ---------- 読み出し（保護者画面用）---------- */
    async getAttempts(o = {}) {
      try {
        const from = o.startDate ? +new Date(o.startDate) : 0, to = o.endDate ? +new Date(o.endDate) : Infinity;
        const all = await tx('attempts', 'readonly', st => st.index('ts').getAll(IDBKeyRange.bound(from, Math.min(to, 8.64e15))));
        return (all || []).filter(a => (!o.subject || a.subject === o.subject) && (!o.topic || a.topic === o.topic) && (!o.incorrectOnly || !a.isCorrect));
      } catch (e) { return []; }
    },
    async getSessions() { try { return (await tx('sessions', 'readonly', st => st.getAll())) || []; } catch (e) { return []; } },
    async getSummary(o = {}) { return LH.summarize(await LH.getAttempts(o)); },
    async getTopicStats(o = {}) { return LH.byTopic(await LH.getAttempts(o)); },

    // 出題ごとにまとめる（初回正答・解き直しの区別）
    instances(atts) {
      const m = new Map();
      for (const a of atts) { let q = m.get(a.questionInstanceId); if (!q) m.set(a.questionInstanceId, q = { id: a.questionInstanceId, list: [] }); q.list.push(a); }
      for (const q of m.values()) {
        q.list.sort((x, y) => x.attemptNumber - y.attemptNumber || x.ts - y.ts);
        const f = q.list[0]; Object.assign(q, { first: f, subject: f.subject, topic: f.topic, questionKey: f.questionKey, ts: f.ts, day: f.day, mode: f.mode });
        q.hasFirst = f.attemptNumber === 1; q.firstOk = q.hasFirst && f.isCorrect;
        q.retries = q.list.filter(a => a.attemptNumber > 1).length;
        q.finalOk = q.list.some(a => a.isCorrect);
        q.retryOk = !q.firstOk && q.list.some(a => a.attemptNumber > 1 && a.isCorrect);
        q.canRetry = f.mode === 'practice' || f.subject === 'prog';
      }
      return [...m.values()];
    },
    summarize(atts) {
      const qs = LH.instances(atts).filter(q => q.hasFirst), firstWrong = qs.filter(q => !q.firstOk);
      const retried = firstWrong.filter(q => q.retries > 0);
      return {
        attempts: atts.length, questions: qs.length, timeMs: atts.reduce((n, a) => n + (a.activeMs || 0), 0),
        firstOk: qs.filter(q => q.firstOk).length, firstWrong: firstWrong.length,
        retryOk: firstWrong.filter(q => q.retryOk).length, retryNg: retried.filter(q => !q.retryOk).length, notRetried: firstWrong.length - retried.length,
        notRetriable: firstWrong.filter(q => !q.canRetry).length,
        days: new Set(atts.map(a => a.day)).size,
      };
    },
    byTopic(atts) {
      const m = {};
      for (const a of atts) { const k = a.subject + '|' + a.topic; (m[k] = m[k] || []).push(a); }
      return Object.entries(m).map(([k, list]) => { const [subject, topic] = k.split('|'); return { subject, topic, ...LH.summarize(list) }; });
    },

    /* ---------- バックアップ ---------- */
    async exportAll() {
      let attempts = [], sessions = [];
      try { attempts = (await tx('attempts', 'readonly', st => st.getAll())) || []; sessions = (await tx('sessions', 'readonly', st => st.getAll())) || []; } catch (e) { }
      return { format: 'moko-learning-history', version: SCHEMA, exportedAt: isoLocal(now()), attempts, sessions };
    },
    // 形式・バージョンを確かめ、壊れた記録は拒否、同じ ID は飛ばす → {added, skipped, rejected}
    async importData(o, dryRun) {
      if (!o || o.format !== 'moko-learning-history') throw new Error('format');
      if (typeof o.version !== 'number' || o.version > SCHEMA) throw new Error('version');
      if (!Array.isArray(o.attempts) || !Array.isArray(o.sessions || [])) throw new Error('format');
      const okA = a => a && typeof a.id === 'string' && typeof a.ts === 'number' && typeof a.questionInstanceId === 'string' && typeof a.subject === 'string' && typeof a.isCorrect === 'boolean' && Number.isInteger(a.attemptNumber);
      const okS = s => s && typeof s.id === 'string' && typeof s.start === 'number';
      const have = new Set((await tx('attempts', 'readonly', st => st.getAllKeys())) || []);
      const haveS = new Set((await tx('sessions', 'readonly', st => st.getAllKeys())) || []);
      const res = { added: 0, skipped: 0, rejected: 0 };
      const addA = [], addS = [];
      for (const a of o.attempts) { if (!okA(a)) res.rejected++; else if (have.has(a.id)) res.skipped++; else { addA.push({ ...a, day: a.day || dayKey(a.ts), activeMs: Math.min(+a.activeMs || 0, IDLE_READING_MS) }); res.added++; } }
      for (const s of o.sessions || []) if (okS(s) && !haveS.has(s.id)) addS.push(s);
      if (!dryRun) {
        await tx('attempts', 'readwrite', st => { addA.forEach(a => st.put(a)); });
        if (addS.length) await tx('sessions', 'readwrite', st => { addS.forEach(s => st.put(s)); });
      }
      return res;
    },
    async clearAll() { await tx('attempts', 'readwrite', st => st.clear()); await tx('sessions', 'readwrite', st => st.clear()); },
  };
  addEventListener('pagehide', () => LH.endSession());
  setTimeout(retryPending, 1000);
  window.LearningHistory = window.LH = LH;
})();

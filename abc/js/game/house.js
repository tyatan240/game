// おべんきょうハウス（おうち）との つなぎ：ABCぼうけんの ★を おうちの ⭐ポイントに とどける
// おうちの データ（moko-math-v1）は localStorage と IndexedDB の 2かしょに ある。
// あたらしい ほうを よんで points（と きょうの もくひょう）だけを たし、りょうほうに かく（ほかの こうもくには さわらない）
//
// だいじ：iPad の ホームがめんアプリでは IndexedDB が へんじを しない ことが ある。
// それを まってから かくと、★が とどかないまま「おうちへ」で ページが かわって しまう。
// そこで IndexedDB は さきに（きどう したとき）よんでおき、★が ふえたら localStorage に すぐ かく。
// IndexedDB への かきこみは あとから（まちじかんの じょうげん つき）。おうちは t が あたらしい ほうを つかう。
const HOUSE = 'moko-math-v1';
const LIMIT = 1500; // IndexedDB を まつ じかんの じょうげん（ms）
const timeout = (p, v) => Promise.race([p, new Promise(ok => setTimeout(() => ok(v), LIMIT))]);
const idbOpen = () => new Promise((ok, ng) => {
  try { const q = indexedDB.open('moko-house', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => ok(q.result); q.onerror = () => ng(q.error); } catch (e) { ng(e); }
});
const idbGet = db => new Promise(ok => { try { const r = db.transaction('kv').objectStore('kv').get(HOUSE); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); } catch (e) { ok(null); } });
const idbPut = (db, v) => new Promise(ok => { try { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, HOUSE); t.oncomplete = () => ok(); t.onerror = () => ok(); } catch (e) { ok(); } });

let dbP = null;
const getDb = () => (dbP = dbP || timeout(idbOpen().catch(() => null), null).then(db => { if (!db) dbP = null; return db; }));
// IndexedDB に ある おうちの データ（さきよみ。まだ よめて いなければ null）
let idbCopy = null;
export const houseReady = getDb().then(db => db ? timeout(idbGet(db), null) : null).then(v => { if (v) idbCopy = v; return v; }).catch(() => null);

function readHouse() {
  let d = null; try { d = JSON.parse(localStorage.getItem(HOUSE) || 'null'); } catch (e) { }
  if (idbCopy && (!d || (idbCopy.t || 0) > (d.t || 0))) d = idbCopy;
  return d && typeof d === 'object' ? JSON.parse(JSON.stringify(d)) : {};
}

// まだ とどけていない ★（S.stars − S.starsSent）を おくる。おくった ⭐の かずを かえす
// （await の まえに localStorage へ かきおわる ので、すぐ ページを かえても なくならない）
export async function sendStars(S, saveFn) {
  const pending = (S.stars || 0) - (S.starsSent || 0);
  if (pending <= 0) return 0;
  const d = readHouse();
  const mul = d.settings && typeof d.settings.abcPts === 'number' ? d.settings.abcPts : 10; // おうちの ⚙️せってい（しょきち 10）
  const add = pending * mul;
  d.points = (d.points || 0) + add; d.t = Date.now();
  // きょうの もくひょう（ぼうけんを すすめる）：きょう あつめた ★の かず
  const now = new Date(), day = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
  if (!d.daily || d.daily.day !== day) d.daily = { day, sansu: 0, kokugo: 0, eigo: 0, abc: 0, prog: 0, got: {}, all: false };
  d.daily.abc = (d.daily.abc || 0) + pending;
  try { localStorage.setItem(HOUSE, JSON.stringify(d)); } catch (e) { }
  idbCopy = d;
  S.starsSent = (S.starsSent || 0) + pending; saveFn && saveFn();
  // IndexedDB にも（へんじが なくても まちつづけない）
  const db = await getDb();
  if (db) await timeout(idbPut(db, d), null);
  return add;
}
// おうちの いまの ⭐（タイトルに ひょうじ）
export function housePoints() { return readHouse().points || 0; }

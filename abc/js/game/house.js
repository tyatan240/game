// おべんきょうハウス（おうち）との つなぎ：ABCぼうけんの ★を おうちの ⭐ポイントに とどける
// おうちの データ（moko-math-v1）は localStorage と IndexedDB の 2かしょに ある。
// あたらしい ほうを よんで points だけを たし、りょうほうに かく（ほかの こうもくには さわらない）
const HOUSE = 'moko-math-v1';
const idbOpen = () => new Promise((ok, ng) => {
  try { const q = indexedDB.open('moko-house', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => ok(q.result); q.onerror = () => ng(q.error); } catch (e) { ng(e); }
});
const idbGet = db => new Promise(ok => { try { const r = db.transaction('kv').objectStore('kv').get(HOUSE); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); } catch (e) { ok(null); } });
const idbPut = (db, v) => new Promise(ok => { try { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, HOUSE); t.oncomplete = () => ok(); t.onerror = () => ok(); } catch (e) { ok(); } });

let busy = false;
// まだ とどけていない ★（S.stars − S.starsSent）を おくる。おくった ⭐の かずを かえす
export async function sendStars(S, saveFn) {
  const pending = (S.stars || 0) - (S.starsSent || 0);
  if (pending <= 0 || busy) return 0;
  busy = true;
  try {
    let d = null; try { d = JSON.parse(localStorage.getItem(HOUSE) || 'null'); } catch (e) { }
    let db = null; try { db = await idbOpen(); const v = await idbGet(db); if (v && (!d || (v.t || 0) > (d.t || 0))) d = v; } catch (e) { }
    d = d && typeof d === 'object' ? d : {};
    const mul = d.settings && typeof d.settings.abcPts === 'number' ? d.settings.abcPts : 10; // おうちの ⚙️せってい（しょきち 10）
    const add = pending * mul;
    d.points = (d.points || 0) + add; d.t = Date.now();
    try { localStorage.setItem(HOUSE, JSON.stringify(d)); } catch (e) { }
    if (db) await idbPut(db, d);
    S.starsSent = (S.starsSent || 0) + pending; saveFn && saveFn();
    return add;
  } finally { busy = false; }
}
// おうちの いまの ⭐（タイトルに ひょうじ）
export function housePoints() { try { return (JSON.parse(localStorage.getItem(HOUSE) || 'null') || {}).points || 0; } catch (e) { return 0; } }

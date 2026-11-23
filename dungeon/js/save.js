// ほぞん：localStorage と IndexedDB（moko-dungeon / kv）に 2かしょ。t が あたらしい ほうを よむ
// ほかの ゲームの データには さわらない（⭐ だけ main.js で おうちの points に たす）
export const KEY = 'moko-dungeon-v1';
const DB = 'moko-dungeon';

export function defData() {
  return {
    v: 1, t: 0,
    best: 0,          // さいこう とうたつ かい
    clears: 0,        // さいごの かいまで いった かいすう
    runs: 0,          // ぼうけんに でた かいすう
    tutorialDone: false,
    dex: {},          // ずかん { id: { seen, used, read, looked, first } }
    rewarded: { floor: 0, boss: [], dex: 0, clear: false }, // ⭐を もう もらった もの（clear：20かい クリア）
    settings: { voice: true, se: true },
    run: null,        // ちゅうだん ちゅうの ぼうけん（game.js の run）
  };
}
export function merge(d) {
  const s = defData(); if (!d || typeof d !== 'object') return s;
  for (const k of ['t', 'best', 'clears', 'runs']) if (typeof d[k] === 'number') s[k] = d[k];
  s.tutorialDone = !!d.tutorialDone;
  if (d.dex && typeof d.dex === 'object') s.dex = d.dex;
  if (d.rewarded && typeof d.rewarded === 'object') s.rewarded = { ...s.rewarded, ...d.rewarded, boss: Array.isArray(d.rewarded.boss) ? d.rewarded.boss : [] };
  if (d.settings && typeof d.settings === 'object') s.settings = { ...s.settings, ...d.settings };
  if (d.run && typeof d.run === 'object' && d.run.map && d.run.hero) s.run = d.run;
  return s;
}

let dbp = null;
const open = () => dbp || (dbp = new Promise((ok, ng) => { try { const q = indexedDB.open(DB, 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => ok(q.result); q.onerror = () => ng(q.error); } catch (e) { ng(e); } }));
const tx = (mode, fn) => open().then(db => new Promise((ok, ng) => { const t = db.transaction('kv', mode), r = fn(t.objectStore('kv')); t.oncomplete = () => ok(r && r.result); t.onerror = () => ng(t.error); }));
const idbGet = () => Promise.race([tx('readonly', s => s.get(KEY)).catch(() => null), new Promise(ok => setTimeout(() => ok(null), 1500))]);
const lsGet = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };

export async function load() {
  const a = lsGet(), b = await idbGet();
  return merge((b && (!a || (b.t || 0) > (a.t || 0))) ? b : a);
}
let idbT = null;
export function save(d) {
  d.t = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { }
  clearTimeout(idbT); idbT = setTimeout(() => { tx('readwrite', s => s.put(JSON.parse(JSON.stringify(d)), KEY)).catch(() => { }); }, 400);
}
export function flush(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } tx('readwrite', s => s.put(JSON.parse(JSON.stringify(d)), KEY)).catch(() => { }); }

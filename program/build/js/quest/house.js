// おうち（moko-math-v1）の ⭐ に ごほうびを たす。localStorage に すぐ かき、IndexedDB は あとから（へんじを またない）。
// points だけを たす（ほかの こうもくには さわらない）。
const HOUSE = 'moko-math-v1';
let idbCopy = null;
function db() {
  return new Promise((ok, ng) => {
    try { const q = indexedDB.open('moko-house', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => ok(q.result); q.onerror = () => ng(q.error); } catch (e) { ng(e); }
  });
}
const timeout = (p, v) => Promise.race([p, new Promise(ok => setTimeout(() => ok(v), 1500))]);
// ひらいた ときに IndexedDB の ほうを さきに よんでおく
timeout(db().then(d => new Promise(ok => { const r = d.transaction('kv').objectStore('kv').get(HOUSE); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); })).catch(() => null), null).then(v => { if (v) idbCopy = v; });

export function addHousePoints(n) {
  if (!(n > 0)) return;
  let d = null; try { d = JSON.parse(localStorage.getItem(HOUSE) || 'null'); } catch { }
  if (idbCopy && (!d || (idbCopy.t || 0) > (d.t || 0))) d = idbCopy;
  d = d && typeof d === 'object' ? JSON.parse(JSON.stringify(d)) : {};
  d.points = (d.points || 0) + n; d.t = Date.now();
  try { localStorage.setItem(HOUSE, JSON.stringify(d)); } catch { }
  idbCopy = d;
  timeout(db(), null).then(x => { try { if (x) x.transaction('kv', 'readwrite').objectStore('kv').put(d, HOUSE); } catch { } }).catch(() => { });
}
export function housePoints() { try { return (JSON.parse(localStorage.getItem(HOUSE) || 'null') || {}).points || 0; } catch { return 0; } }

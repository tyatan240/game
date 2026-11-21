// ほぞん：localStorage と IndexedDB の りょうほうに かく（iPad の ホームがめんアプリで きえる たいさく）
// キー robomoko-build-v1 は かえない。かたちは ついかのみ。
// { v:1, t:さいごに ほぞんした じこく, world:{size,blocks}, cam:{az,el,zoom}, sel:'えらんだ ブロック', rot, seenHelp }
export const KEY = 'robomoko-build-v1';
const DB = 'robomoko-build', STORE = 'kv';

function idb() {
  return new Promise((ok, ng) => {
    if (!('indexedDB' in self)) return ng(new Error('no idb'));
    const rq = indexedDB.open(DB, 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore(STORE);
    rq.onsuccess = () => ok(rq.result);
    rq.onerror = () => ng(rq.error);
  });
}
async function idbGet() {
  try {
    const db = await idb();
    return await new Promise(ok => {
      const rq = db.transaction(STORE).objectStore(STORE).get(KEY);
      rq.onsuccess = () => ok(rq.result || null); rq.onerror = () => ok(null);
    });
  } catch { return null; }
}
async function idbPut(v) {
  try {
    const db = await idb();
    db.transaction(STORE, 'readwrite').objectStore(STORE).put(v, KEY);
  } catch { /* つかえない ときは localStorage だけ */ }
}
function lsGet() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

// あたらしい ほう（t が おおきい ほう）を つかう
export async function loadSave() {
  const a = lsGet(), b = await idbGet();
  if (a && b) return (b.t || 0) > (a.t || 0) ? b : a;
  return a || b || null;
}

export function writeSave(data) {
  const v = { v: 1, ...data, t: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* いっぱい など */ }
  idbPut(v);
  return v;
}

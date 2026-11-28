/* おへや ＝ おうちで えらんだ キャラが まちで すんでいる いえの なか（index.html で つかう）
   - まちで いえに すんでいる キャラを えらぶと、おへやの かべ・ゆか・かぐ は その いえの なか（moko-town-v1 の objects[].room）に なる
   - おへやで かえると まちの いえにも かく。まちで かえた ものは おうちを ひらいた ときに よむ
   - いえの ない キャラ（はじめの モコ など）の おへやは S.baseRoom に とっておく（もとの おへや）
   データは たすだけ：moko-math-v1 の baseRoom・roomOwner、moko-town-v1 は もとから ある room を つかう */
const RL_KEY = 'moko-town-v1';
let rlReady = false; // まちから よみおわるまで まちへは かかない（ふるい へやで うわがき しない）
function rlTown() { try { const t = JSON.parse(localStorage.getItem(RL_KEY) || 'null'); return t && Array.isArray(t.objects) ? t : null; } catch (e) { return null; } }
function rlWrite(t) {
  t.t = Date.now(); try { localStorage.setItem(RL_KEY, JSON.stringify(t)); } catch (e) { }
  try { const q = indexedDB.open('moko-town', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => { try { q.result.transaction('kv', 'readwrite').objectStore('kv').put(t, RL_KEY); } catch (e) { } }; } catch (e) { }
}
// その キャラが すんでいる いえ（モコの おうち は のぞく。モコの おうちは もとの おへや）
function rlHouse(t, c) { return t ? t.objects.find(o => o.type !== 'moko_house' && Array.isArray(o.residents) && o.residents.includes(c)) || null : null; }
const rlOwn = id => !!ITEM[id] && S.owned.includes(id);
function rlRoomOf(o) { const r = o.room || {}; return { wall: r.wall && rlOwn(r.wall) ? r.wall : 'w_cream', floor: r.floor && rlOwn(r.floor) ? r.floor : 'f_wood', furn: (r.furn || []).filter(rlOwn) }; }
const rlCur = () => ({ wall: S.equip.wall, floor: S.equip.floor, furn: [...S.furn] });
function rlSet(r) { S.equip.wall = r.wall; S.equip.floor = r.floor; S.furn = [...r.furn]; }
const rlSame = (a, b) => a.wall === b.wall && a.floor === b.floor && a.furn.join() === b.furn.join();
// おうちを ひらいた とき：まちの いえの なかを おへやに よみこむ
function roomPull() {
  const t = rlTown(), h = rlHouse(t, S.equip.char), owner = S.roomOwner || null;
  if (h) { if (owner === null) S.baseRoom = rlCur(); rlSet(rlRoomOf(h)); S.roomOwner = h.id; }
  else if (owner !== null) { if (S.baseRoom) rlSet(S.baseRoom); S.roomOwner = null; }
  rlReady = true; save();
}
// おへやを かえた あと（render）：まちの いえに かく。キャラが かわったら へやを いれかえる
function roomPush() {
  if (!rlReady) return;
  const t = rlTown(), owner = S.roomOwner || null, h = rlHouse(t, S.equip.char), target = h ? h.id : null;
  if (owner !== target) {
    if (owner === null) S.baseRoom = rlCur();
    else { const o = t && t.objects.find(x => x.id === owner); if (o) { o.room = rlCur(); rlWrite(t); } }
    if (h) rlSet(rlRoomOf(h)); else if (S.baseRoom) rlSet(S.baseRoom);
    S.roomOwner = target; save(); return;
  }
  if (h) { const r = rlCur(); if (!rlSame(r, rlRoomOf(h))) { h.room = r; rlWrite(t); } }
}
// いまの おへやが どの いえの なかか（ひょうじ よう）
function roomHouseName() { const t = rlTown(), h = rlHouse(t, S.equip.char); return h ? h : null; }

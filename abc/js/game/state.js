// セーブデータ（この たんまつの なかに ほぞん）
// ※ おべんきょうハウス の データ（moko-math-v1）とは べつ。ほしの きょうつうかは あとの こうていで おこなう
import { newRecord } from './learning.js';
export const SAVE_KEY = 'abc-adventure-v1';

export function defaultState() {
  return {
    v: 1, t: 0,
    started: false,
    hero: { x: 0, y: 0, dir: 'down' },
    stars: 0,
    starsSent: 0,
    clears: 0,            // ワールド1（A〜Z）を クリアした かいすう         // おうちの ⭐に とどけおわった ★の かず（おうちとの つなぎ）
    learned: [],          // おぼえた もじ（どうぶつの クイズに こたえた もの）
    lower: [],            // おぼえた こもじ（ワールド2 こもじの もり）
    flags: {},            // intro / bridgeOpen / bossCleared / ending など
    chests: {},           // あけた たからばこ
    items: [],            // もっている アイテム
    wear: { scarf: false, hat: false },
    records: {},          // がくしゅう きろく（もじ ごと。たんごは 'w:apple' の ように w: を つける）
    // ↓ ことばの まほう（v1 の あとから ついか。ふるい データには load() で おぎなう）
    words: {},            // おぼえた たんご { water: { at: じこく } }（＝まほうが つかえる）
    combos: [],           // みつけた くみあわせ
    quests: {},           // クエストの すすみ { apple: 'harvest', flowers: 'done' }（がくしゅう きろくとは べつ）
    inv: {},              // クエストの もちもの { apple: 1, bridgeKey: 1 }（きがえの items とは べつ）
    world: {},            // マップの へんか { gate: 'open', flowerbed: 'bloom', vines: 'open', bees: true }
    sentences: {},        // ワールド3：おぼえた ぶんの かた { im: { at, made:['im:happy'] } }
    areas: ['meadow'],    // いける ばしょ
    slots: {},            // ワールドごとの つづき { 1: {ぼうけんの すすみ}, 2: …, 3: … }（いま あそんでいる ワールドの ぶんは うえの こうもくに ある）
    w2clears: 0,          // ワールド2（こもじの もん）を クリアした かいすう（ワールド3を えらべる じょうけん）
    settings: { bgm: true, se: true, voice: true },
  };
}

export function load() {
  const base = defaultState();
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d || typeof d !== 'object') return base;
    // たりない こうもくは しょきち で おぎなう（ふるい データでも こわれない）
    return { ...base, ...d, hero: { ...base.hero, ...d.hero }, flags: { ...d.flags }, chests: { ...d.chests },
      wear: { ...base.wear, ...d.wear }, records: { ...d.records }, settings: { ...base.settings, ...d.settings },
      learned: Array.isArray(d.learned) ? d.learned : [], lower: Array.isArray(d.lower) ? d.lower : [], items: Array.isArray(d.items) ? d.items : [],
      words: { ...d.words }, sentences: { ...d.sentences }, quests: { ...d.quests }, inv: { ...d.inv }, world: { ...d.world },
      combos: Array.isArray(d.combos) ? d.combos : [], areas: Array.isArray(d.areas) ? d.areas : ['meadow'],
      slots: d.slots && typeof d.slots === 'object' ? { ...d.slots } : {}, w2clears: d.w2clears || (d.flags && d.flags.lowerClear ? 1 : 0) };
  } catch (e) { return base; }
}

export function save(st) {
  st.t = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) { /* ほぞん できない ときは なにも しない */ }
}

// もういちど さいしょから：ぼうけんの すすみは もどすが、がくしゅう きろく・ほし・きがえ・せってい・クリア かいすうは のこす
export const KEEP_ON_REPLAY = ['settings', 'records', 'stars', 'starsSent', 'items', 'wear', 'clears', 'slots', 'w2clears'];

// ワールドごとの つづき：ぼうけんの すすみ（KEEP_ON_REPLAY いがい）を とりだす／もどす
const PROGRESS = () => Object.keys(defaultState()).filter(k => !KEEP_ON_REPLAY.includes(k) && k !== 'v' && k !== 't');
export const worldOf = areaId => !areaId ? 1 : areaId === 'lower' ? 2 : areaId.startsWith('w3') ? 3 : 1;
export function snapshot(st) { const o = {}; for (const k of PROGRESS()) o[k] = JSON.parse(JSON.stringify(st[k] ?? null)); return o; }
export function restore(st, snap) {
  const base = defaultState();
  for (const k of PROGRESS()) st[k] = snap && snap[k] != null ? JSON.parse(JSON.stringify(snap[k])) : base[k];
  st.hero = { ...base.hero, ...st.hero }; st.flags = st.flags || {}; st.world = st.world || {};
  return st;
}
export function replayState(old) {
  const s = defaultState();
  for (const k of KEEP_ON_REPLAY) if (old[k] !== undefined) s[k] = old[k];
  return s;
}

// ワールド2（こもじの もり）から はじめる：ワールド1（A〜Z）を ぜんぶ おえた じょうたいを データから つくる
//   spells・quests・chapters は data の もの（ここで import すると じゅんかんするので ひきすうで もらう）
export function world2State(old, { letters, words, spells, quests, areas }) {
  const s = replayState(old);
  const eff = list => { for (const e of list || []) { if (e.set) s.world[e.set[0]] = e.set[1]; if (e.area && !s.areas.includes(e.area)) s.areas.push(e.area); } };
  const walk = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o.effect)) eff(o.effect); for (const k in o) if (k !== 'effect') walk(o[k]); };
  for (const q of quests) { walk(q); s.quests[q.id] = 'done'; }
  for (const sp of spells) { eff(sp.effect); if (sp.words.length > 1) { const k = [...sp.words].sort().join('+'); if (!s.combos.includes(k)) s.combos.push(k); } }
  for (const w of words) s.words[w.id] = { at: Date.now() };
  for (const a of areas) { if (!s.areas.includes(a)) s.areas.push(a); if (a !== 'island' && a !== 'lower') s.world['gate_' + a] = 'open'; }
  s.world.gate = 'open';
  s.learned = [...letters];
  s.inv = {};
  s.flags = { intro: true, bossCleared: true, bridgeOpen: true, alphabetClear: true };
  s.started = true;
  return s;
}

// ワールド3（ことばの まち）から はじめる：ワールド1・2を おえた じょうたい
export function world3State(old, data) {
  const s = world2State(old, data);
  s.lower = 'abcdefghijklmnopqrstuvwxyz'.split('');
  s.flags.lowerClear = true; s.world.gate_lower = 'open';
  if (!s.areas.includes('lower')) s.areas.push('lower');
  return s;
}

export function getRecord(st, id) { return st.records[id] || newRecord(); }

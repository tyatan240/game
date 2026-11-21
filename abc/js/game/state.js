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
    areas: ['meadow'],    // いける ばしょ
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
      learned: Array.isArray(d.learned) ? d.learned : [], items: Array.isArray(d.items) ? d.items : [],
      words: { ...d.words }, quests: { ...d.quests }, inv: { ...d.inv }, world: { ...d.world },
      combos: Array.isArray(d.combos) ? d.combos : [], areas: Array.isArray(d.areas) ? d.areas : ['meadow'] };
  } catch (e) { return base; }
}

export function save(st) {
  st.t = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) { /* ほぞん できない ときは なにも しない */ }
}

// もういちど さいしょから：ぼうけんの すすみは もどすが、がくしゅう きろく・ほし・きがえ・せってい・クリア かいすうは のこす
export const KEEP_ON_REPLAY = ['settings', 'records', 'stars', 'starsSent', 'items', 'wear', 'clears'];
export function replayState(old) {
  const s = defaultState();
  for (const k of KEEP_ON_REPLAY) if (old[k] !== undefined) s[k] = old[k];
  return s;
}

export function getRecord(st, id) { return st.records[id] || newRecord(); }

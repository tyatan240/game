// ことばの まほう：えらんだ たんごと ばしょから、おきる ことを きめる（ひょうじとは べつ）
import { SPELLS } from '../data/combos.js';
import { QUESTS } from '../data/quests.js';
import { WORD } from '../data/words.js';
import { activeQuest, currentStep } from './quests.js';

// じゅんばんに かんけい なく おなじに する
export const comboKey = ids => [...ids].sort().join('+');
const SPELL_BY_KEY = Object.fromEntries(SPELLS.filter(s => !s.future).map(s => [comboKey(s.words), s]));

export function condMet(when, S) {
  if (!when) return true;
  if (when.quest) { const q = QUESTS.find(x => x.id === when.quest); if (activeQuest(S) !== q || currentStep(S, q).id !== when.step) return false; }
  if (when.world) for (const k in when.world) if (S.world[k] !== when.world[k]) return false;
  return true;
}

// この ばしょで いま つかえる まほう（なければ null）
export function spellHere(target, S) {
  const q = activeQuest(S), st = currentStep(S, q);
  if (st && st.on === 'spell' && st.target === target) return SPELLS.find(s => s.id === st.spell) || null;
  return null;
}

// えらんだ ことばで まほうを ためす → { ok, spell } か { ok:false, msg }
export function tryCast(sel, target, S) {
  const sp = SPELL_BY_KEY[comboKey(sel)], want = spellHere(target, S);
  if (sp && sp.target === target && condMet(sp.when, S)) return { ok: true, spell: sp };
  if (sp && sp.target !== target) return { ok: false, msg: 'その まほうは ここでは つかえない みたい。べつの ばしょで ためしてね！' };
  if (sp && !condMet(sp.when, S)) return { ok: false, msg: sp.doneText || 'いまは なにも おきないみたい。' };
  if (want) return { ok: false, msg: (sel.length === 1 && want.words.length > 1 ? 'ことばを 2まい えらんでね。' : '') + want.hint };
  return { ok: false, msg: 'なにも おきなかった……。べつの ことばで ためしてみよう！' };
}

// ヒント：ひつような ことばと、まだ おぼえていない ことばの ばしょ
export function hintFor(target, S) {
  const want = spellHere(target, S);
  if (!want) return { text: 'ここでは いま まほうは いらない みたい。', highlight: [] };
  const missing = want.words.filter(id => !S.words[id]);
  if (missing.length) return { text: missing.map(id => `${WORD[id].ja}の ことばは「${WORD[id].place}」で おぼえられるよ。`).join(' '), highlight: [] };
  return { text: `${want.hint}。ひかっている カードを えらんでね！`, highlight: want.words };
}

// こうかを セーブデータに はんえい する（えんしゅつは main.js）
export function applyEffects(effects = [], S) {
  const got = { stars: 0, items: [] };
  for (const e of effects) {
    if (e.set) S.world[e.set[0]] = e.set[1];
    if (e.give) { S.inv[e.give] = (S.inv[e.give] || 0) + 1; got.items.push(e.give); }
    if (e.take) { S.inv[e.take] = Math.max(0, (S.inv[e.take] || 0) - 1); }
    if (e.star) { S.stars += e.star; got.stars += e.star; }
    if (e.area && !S.areas.includes(e.area)) S.areas.push(e.area);
  }
  return got;
}

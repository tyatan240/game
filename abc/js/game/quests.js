// クエストと チャプターの すすみかた（データは data/quests.js・data/areas.js）。ひょうじとは べつ
import { QUESTS } from '../data/quests.js';
import { AREAS, CHAPTERS, CHAPTER } from '../data/areas.js';

export const QUEST = Object.fromEntries(QUESTS.map(q => [q.id, q]));
export const lettersDone = (S, areaId) => CHAPTER[areaId].letters.every(id => S.learned.includes(id));
// ワールド3：その エリアの ことば と ぶんの かたを ぜんぶ ならった
export const w3Left = (S, areaId) => { const ch = CHAPTER[areaId]; return { words: ch.words.filter(id => !S.words[id]), frames: (ch.frames || []).filter(id => !(S.sentences || {})[id]) }; };
export const w3Learned = (S, areaId) => { const l = w3Left(S, areaId); return !l.words.length && !l.frames.length; };
const reqMet = (r, S) => !r || ((!r.flag || S.flags[r.flag]) && (!r.quest || S.quests[r.quest] === 'done') && (!r.letters || lettersDone(S, r.letters)) && (!r.w3 || w3Learned(S, r.w3)));

// いま すすめられる クエスト（いくつでも）
export function activeQuests(S) { return QUESTS.filter(q => !q.future && S.quests[q.id] !== 'done' && reqMet(q.requires, S)); }
export function activeQuest(S) { return activeQuests(S)[0] || null; }
export function currentStep(S, q) {
  if (!q) return null;
  const id = S.quests[q.id];
  return q.steps.find(s => s.id === id) || q.steps[0];
}
// この あいてを めあてに している クエストの だんかい
export function stepFor(S, targetId) {
  for (const q of activeQuests(S)) { const st = currentStep(S, q); if (st.target === targetId) return { q, st }; }
  return null;
}
export function advance(S, q) {
  const i = q.steps.indexOf(currentStep(S, q));
  S.quests[q.id] = i + 1 < q.steps.length ? q.steps[i + 1].id : 'done';
  return S.quests[q.id] === 'done';
}
export const isStep = (S, questId, stepId) => { const q = QUEST[questId]; return !!q && activeQuests(S).includes(q) && currentStep(S, q).id === stepId; };
export const gateOpen = (S, ch) => ch.gate ? S.world['gate_' + ch.area] === 'open' : true;
export function chapterDone(S, ch) {
  if (ch.lower) return ch.lower.every(id => (S.lower || []).includes(id)) && gateOpen(S, ch);
  if (ch.w3) return w3Learned(S, ch.area) && ch.quests.every(q => S.quests[q] === 'done') && gateOpen(S, ch);
  return ch.letters.every(id => S.learned.includes(id)) && (!ch.boss || S.flags.bossCleared) && ch.quests.every(q => S.quests[q] === 'done') && gateOpen(S, ch);
}

// がめん うえの「つぎは」と、めじるしを つける ばしょ（ちがう エリアなら でぐちを さす）
export function objective(S) {
  if (!S.flags.intro) return null;
  for (const ch of CHAPTERS) {
    if (ch.lower) { // ワールド2：こもじ
      if (!S.flags.alphabetClear) break;
      const ll = ch.lower.filter(id => !(S.lower || []).includes(id));
      if (ll.length) return { text: `もりの せんせいに こもじを おそわろう！（あと ${ll.length}）`, targets: AREAS[ch.area].NPCS.filter(n => n.lower && n.lower.some(l => ll.includes(l))).map(n => n.id), area: ch.area };
      if (!gateOpen(S, ch)) return { text: 'こもじの もんで さいごの おさらいを しよう！', targets: [ch.gate], area: ch.area };
      if (ch.next && !S.areas.includes(ch.next)) return { text: `もりの ひがしから「${AREAS[ch.next].name}」へ いこう！`, targets: ['area:' + ch.next], area: ch.area };
      continue;
    }
    if (ch.w3) { // ワールド3：ことばの まち
      if (!S.flags.lowerClear) break;
      const l = w3Left(S, ch.area);
      if (l.words.length || l.frames.length) {
        const n = l.words.length + l.frames.length;
        return { text: `せんせいに えいごを ならおう！（あと ${n}）`, targets: AREAS[ch.area].NPCS.filter(x => (x.teach && x.teach.some(w => l.words.includes(w))) || (x.frame && l.frames.includes(x.frame))).map(x => x.id), area: ch.area };
      }
      for (const id of ch.quests) {
        if (S.quests[id] === 'done') continue;
        const q = QUEST[id]; if (!reqMet(q.requires, S)) continue;
        const st = currentStep(S, q);
        return { text: st.goal, targets: [st.target], quest: q.title, area: ch.area };
      }
      if (!gateOpen(S, ch)) return { text: `「${AREAS[ch.area].OBJECTS.find(o => o.id === ch.gate).name}」で おさらいを しよう！`, targets: [ch.gate], area: ch.area };
      if (ch.next && !S.areas.includes(ch.next)) return { text: `つぎの ばしょ「${AREAS[ch.next].name}」へ いこう！`, targets: ['area:' + ch.next], area: ch.area };
      if (!ch.next) return { text: 'つぎの まちは じゅんびちゅう！ ことばの まちで おさらいも できるよ', targets: [] };
      continue;
    }
    const left = ch.letters.filter(id => !S.learned.includes(id));
    if (left.length) {
      const ids = AREAS[ch.area].NPCS.filter(n => n.letter && left.includes(n.letter)).map(n => n.id);
      return { text: `どうぶつに あって もじを おぼえよう！（あと ${left.length}）`, targets: ids, area: ch.area };
    }
    if (ch.boss && !S.flags.bossCleared) return { text: 'はしの まえの ドラコに はなしかけよう！', targets: ['boss'], area: ch.area };
    for (const id of ch.quests) {
      if (S.quests[id] === 'done') continue;
      const q = QUEST[id];
      if (!reqMet(q.requires, S)) continue;
      const st = currentStep(S, q);
      return { text: st.goal, targets: [st.target], quest: q.title, area: ch.area };
    }
    if (ch.gate && !gateOpen(S, ch)) return { text: ch.final ? 'おしろの もんで さいごの おさらいを しよう！' : 'もじの もんで おさらいを しよう！', targets: [ch.gate], area: ch.area };
    if (ch.next && !S.areas.includes(ch.next)) return { text: `つぎの ばしょ「${AREAS[ch.next].name}」へ いこう！`, targets: ['area:' + ch.next], area: ch.area };
  }
  return { text: 'じゆうに たんけん しよう！ どうぶつに おさらいも できるよ', targets: [] };
}

// クエストの すすみかた（データは data/quests.js）。ひょうじとは べつ
import { QUESTS } from '../data/quests.js';
import { WORLD1_LETTERS } from '../data/letters.js';
import { NPCS, GOAL } from '../data/world1.js';

const reqMet = (r, S) => !r || ((!r.flag || S.flags[r.flag]) && (!r.quest || S.quests[r.quest] === 'done'));

// いま すすめられる クエスト（じゅんばんに 1つ）
export function activeQuest(S) {
  return QUESTS.find(q => !q.future && S.quests[q.id] !== 'done' && reqMet(q.requires, S)) || null;
}
export function currentStep(S, q) {
  if (!q) return null;
  const id = S.quests[q.id];
  return q.steps.find(s => s.id === id) || q.steps[0];
}
// つぎの だんかいへ。さいごなら 'done'
export function advance(S, q) {
  const i = q.steps.indexOf(currentStep(S, q));
  S.quests[q.id] = i + 1 < q.steps.length ? q.steps[i + 1].id : 'done';
  return S.quests[q.id] === 'done';
}
export const isStep = (S, questId, stepId) => {
  const q = QUESTS.find(x => x.id === questId);
  return !!q && activeQuest(S) === q && currentStep(S, q).id === stepId;
};

// がめん うえの「つぎは」と、めじるしを つける ばしょ
export function objective(S) {
  if (!S.flags.intro) return null;
  const left = WORLD1_LETTERS.filter(id => !S.learned.includes(id));
  if (left.length) {
    const ids = NPCS.filter(n => n.letter && left.includes(n.letter)).map(n => n.id);
    return { text: `どうぶつに あって もじを おぼえよう！（あと ${left.length}）`, targets: ids };
  }
  if (!S.flags.bossCleared) return { text: 'はしの まえの ドラコに はなしかけよう！', targets: ['boss'] };
  const q = activeQuest(S);
  if (q) { const st = currentStep(S, q); return { text: st.goal, targets: [st.target], quest: q.title }; }
  if (S.quests.bee === 'done' && !S.flags.world1Clear) return { text: 'みぎの もりの いりぐちへ いこう！', targets: ['goal'], goal: GOAL };
  return { text: 'じゆうに たんけん しよう！ どうぶつに おさらいも できるよ', targets: [] };
}

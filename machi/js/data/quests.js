// じゅうにんの おねがい（じゅんばんに 3つまで でる）。たっせい すると おみせに ない パーツが もらえる。
// check(t, PART) → [いま, ひつよう]    reward … もらえる パーツ（parts.js の quest）
import { doorCell } from '../town/town.js';

const homes = (t, P) => t.objects.filter(o => P[o.type] && P[o.type].home);
const count = (t, P, f) => t.objects.filter(o => P[o.type] && f(P[o.type], o)).length;

// モコの おうち から みち だけで いける おうちの かず（げんかんの まえが みち）
function connected(t, P) {
  const isRoad = (x, y) => { const g = t.ground[x + ',' + y]; return g && P[g] && P[g].road; };
  const moko = t.objects.find(o => o.type === 'moko_house'); if (!moko) return 0;
  const [sx, sy] = doorCell(moko); if (!isRoad(sx, sy)) return 0;
  const seen = new Set([sx + ',' + sy]), q = [[sx, sy]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && isRoad(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
  return homes(t, P).filter(o => o.type !== 'moko_house').filter(o => { const [x, y] = doorCell(o); return seen.has(x + ',' + y); }).length;
}

export const QUESTS = [
  { id: 'flowers', text: 'おはなを 5こ うえて！', reward: 'flower_rainbow', check: (t, P) => [count(t, P, p => p.fav === 'flower' && p.walk), 5] },
  { id: 'house2', text: 'おうちを もう 1けん つくって！', reward: 'well', check: (t, P) => [homes(t, P).filter(o => o.type !== 'moko_house').length, 2] },
  { id: 'park', text: 'こうえんを つくって！（ブランコ・すなば など）', reward: 'statue', check: (t, P) => [count(t, P, p => p.cat === 'park' && p.fav === 'park') ? 1 : 0, 1] },
  { id: 'road', text: 'みちで おうちを つないで！', reward: 'windmill', check: (t, P) => [Math.min(connected(t, P), 2), 2] },
  { id: 'bench', text: 'ベンチを 2こ おいて ひとやすみ したいな', reward: 'lamp_star', check: (t, P) => [count(t, P, (p, o) => o.type === 'bench'), 2] },
  { id: 'friends3', text: 'なかまを 3にん おうちに すませて！', reward: 'carousel', check: (t, P) => [homes(t, P).reduce((n, o) => n + (o.residents || []).length, 0), 3] },
  { id: 'forest', text: 'きを 10ぽん うえて もりを つくろう！', reward: 'tree_star', check: (t, P) => [count(t, P, p => p.fav === 'forest' && p.cat === 'nature'), 10] },
];
export const QUEST = Object.fromEntries(QUESTS.map(q => [q.id, q]));

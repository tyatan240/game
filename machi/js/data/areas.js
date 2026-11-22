// まちの エリア（まちレベルで ひらく）。ちずは 40×40 マス、x0〜x1・y0〜y1 は はしを ふくむ。
// fill … はじめて ひらいた ときに おく しぜん・じめん（なにも ない マスだけ）
export const AREAS = [
  { id: 'central', name: 'まんなかの まち', lv: 1, x0: 8, y0: 8, x1: 31, y1: 31 },
  { id: 'forest', name: 'もりの エリア', lv: 2, x0: 8, y0: 0, x1: 31, y1: 7, icon: '🌲', fill: 'forest' },
  { id: 'river', name: 'かわの エリア', lv: 3, x0: 32, y0: 0, x1: 39, y1: 39, icon: '🏞️', fill: 'river' },
  { id: 'beach', name: 'うみべの エリア', lv: 4, x0: 8, y0: 32, x1: 31, y1: 39, icon: '🏖️', fill: 'beach' },
  { id: 'meadow', name: 'おはなばたけ', lv: 5, x0: 0, y0: 0, x1: 7, y1: 39, icon: '🌷', fill: 'meadow' },
];
export const AREA = Object.fromEntries(AREAS.map(a => [a.id, a]));
export const areaOf = (x, y) => AREAS.find(a => x >= a.x0 && x <= a.x1 && y >= a.y0 && y <= a.y1) || null;

// まちレベル：おなじ ものを たくさん おくだけでは あがらない ように、しゅるい・じゅうにん・しせつを おもく みる
export const LEVELS = [0, 120, 250, 400, 580, 800]; // Lv1, Lv2, …（つぎの レベルに ひつような ポイント）
export function scoreTown(t, PART) {
  const obj = t.objects.filter(o => PART[o.type] && !PART[o.type].fixed);
  const homes = obj.filter(o => PART[o.type].home);
  const residents = homes.reduce((n, o) => n + (o.residents || []).length, 0);
  const types = new Set(obj.map(o => o.type)).size;
  const nature = obj.filter(o => PART[o.type].cat === 'nature').length;
  const roads = Object.values(t.ground).filter(id => PART[id] && PART[id].road).length;
  const facilities = new Set(obj.filter(o => ['park', 'special', 'garden'].includes(PART[o.type].cat)).map(o => o.type)).size;
  const parts = {
    おうち: Math.min(homes.length, 8) * 12,
    じゅうにん: residents * 15,
    しゅるい: types * 6,
    しぜん: Math.min(nature, 30) * 2,
    みち: Math.min(roads, 60),
    しせつ: facilities * 10,
  };
  const score = Object.values(parts).reduce((a, b) => a + b, 0);
  let lv = 1; while (lv < LEVELS.length && score >= LEVELS[lv]) lv++;
  return { score, lv, parts, next: LEVELS[lv] ?? null, prev: LEVELS[lv - 1] };
}

// がくしゅう きろく（もじ・たんご ごと）と、にがてを ゆうせんする しゅつだい
// ひょうじとは かんけい ない じゅんすいな ロジック
export const LEVEL = { NEW: 0, PRACTICE: 1, LEARNED: 2 };
export const LEVEL_NAME = ['はじめて', 'れんしゅう中', 'おぼえた'];
const DAY = 86400000;
const INTERVAL = [0, 1, 3, 7, 14]; // れんぞく せいかい すうに おうじた ふくしゅうまでの ひすう

export function newRecord() {
  return { asked: 0, correct: 0, streak: 0, lastAsked: null, lastCorrect: null, level: LEVEL.NEW, due: 0 };
}

export function levelOf(rec) {
  if (!rec || rec.correct === 0) return LEVEL.NEW;
  const acc = rec.correct / Math.max(1, rec.asked);
  if (rec.correct >= 3 && rec.streak >= 2 && acc >= 0.7) return LEVEL.LEARNED;
  return LEVEL.PRACTICE;
}

// こたえた ときに きろくを こうしん する（firstTry：その もんだいの さいしょの こたえか）
export function record(rec, ok, firstTry, now = Date.now()) {
  const r = { ...newRecord(), ...rec };
  if (!firstTry) return r; // やりなおしは かぞえない
  r.asked++;
  r.lastAsked = now;
  if (ok) {
    r.correct++;
    r.streak++;
    r.lastCorrect = now;
    r.due = now + INTERVAL[Math.min(r.streak, INTERVAL.length - 1)] * DAY;
  } else {
    r.streak = 0;
    r.due = now;
  }
  r.level = levelOf(r);
  return r;
}

// にがて・ふくしゅうびが きた もの・あたらしい ものを ゆうせんして n こ えらぶ
export function pickTargets(ids, records, n, now = Date.now(), rand = Math.random) {
  const score = id => {
    const r = records[id] || newRecord();
    const lv = levelOf(r);
    const acc = r.asked ? r.correct / r.asked : 0;
    return (lv === LEVEL.NEW ? 3 : lv === LEVEL.PRACTICE ? 2 : 1) + (r.due <= now ? 1.5 : 0) + (1 - acc) * 2 + rand() * 1.2;
  };
  const scored = ids.map(id => [id, score(id)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const out = [];
  while (out.length < n && scored.length) out.push(...scored.slice(0, n - out.length));
  return out;
}

// なんたく に するか（しょきゅう 3たく → ちゅうきゅう 4たく）
export function choiceCount(rec, min = 3) {
  return Math.max(min, levelOf(rec) === LEVEL.LEARNED ? 4 : 3);
}

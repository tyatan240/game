// ロボモコの プログラム（データだけ）。
// かたちは プログラミングの へや（program/index.html）と おなじ：
//   いどう {t:'U'|'D'|'L'|'R'}、くりかえし {t:'loop', n:2〜9, body:[…]}（くりかえしの なかに くりかえしは いれない）
// たてもの よう に ふやした めいれい：
//   {t:'put', b:'wood'} … ブロックを えらんで おく（ロボの あしもとに おいて、その うえに のる → つむと たかく なる）
//   {t:'break'}         … あしもとの ブロックを こわす
//   {t:'wait'}          … まつ
import { BLOCK } from '../data/blocks.js';

// いどうの むき：U＝おく（-z）、D＝てまえ（+z）、L＝ひだり（-x）、R＝みぎ（+x）。
// カメラを まわしても やじるしの えが いっしょに まわるので、みた とおりの むきに うごく。
export const DIRS = {
  U: { dx: 0, dz: -1, color: '#4a8fe0', r: 2 },
  D: { dx: 0, dz: 1, color: '#f0a92e', r: 0 },
  L: { dx: -1, dz: 0, color: '#3dbb6a', r: 3 },
  R: { dx: 1, dz: 0, color: '#e2574c', r: 1 },
};
export const MOVES = ['U', 'R', 'D', 'L'];

export const MAX_CMDS = 40;     // プログラムに いれられる めいれいの かず
export const MAX_STEPS = 600;   // 1かいの じっこうで うごく かずの じょうげん（かたまらない ため）
export const LOOP_MIN = 2, LOOP_MAX = 9;

export function count(prog) {
  return prog.reduce((n, c) => n + (c.t === 'loop' ? 1 + c.body.length : 1), 0);
}

function okCmd(c) {
  if (!c || typeof c !== 'object') return null;
  if (DIRS[c.t]) return { t: c.t };
  if (c.t === 'put') return { t: 'put', b: typeof c.b === 'string' ? c.b : 'wood' }; // しらない b も のこす
  if (c.t === 'break' || c.t === 'wait') return { t: c.t };
  return null;
}
// ほぞんから よむ とき：へんな ものを とりのぞく
export function sanitize(prog) {
  const out = [];
  if (!Array.isArray(prog)) return out;
  for (const c of prog) {
    if (c && c.t === 'loop') {
      const n = Math.min(LOOP_MAX, Math.max(LOOP_MIN, c.n | 0));
      out.push({ t: 'loop', n, body: (Array.isArray(c.body) ? c.body : []).map(okCmd).filter(Boolean) });
    } else { const k = okCmd(c); if (k) out.push(k); }
  }
  return out;
}

// じっこうする じゅんばんに ならべる。id は がめんの めいれいの ばしょ（'c3'、くりかえしの なかは 'c3_1'）
export function steps(prog) {
  const out = [];
  prog.forEach((c, i) => {
    if (c.t !== 'loop') { out.push({ ...c, id: 'c' + i }); return; }
    for (let k = 0; k < c.n; k++) c.body.forEach((d, j) => out.push({ ...d, id: 'c' + i + '_' + j, box: 'c' + i, round: k }));
  });
  return out.slice(0, MAX_STEPS);
}

export const known = c => c.t !== 'put' || !!BLOCK[c.b];

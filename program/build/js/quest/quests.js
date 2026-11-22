// おだい（5ステージ）。みた目の かんぜん いっちでは なく、「ひつような じょうけん」を みたせば クリア。
// せかいの データ（world.js）だけを みる。つくった ものは クリアの あとも のこる。
import { BLOCK } from '../data/blocks.js';

const WALL = id => !!BLOCK[id] && BLOCK[id].solid !== false && id !== 'roof'; // かべに なる ブロック（ドア・ガラスも ふくむ）
const BUILD = id => ['wood', 'stone', 'brick'].includes(id);

// おなじ たかさで よこに ならんだ いちばん ながい れつ
function longestRun(world, ok) {
  let best = 0;
  for (let y = 1; y < world.h; y++) for (let z = 0; z < world.d; z++) for (let x = 0; x < world.w; x++) {
    for (const [dx, dz] of [[1, 0], [0, 1]]) {
      const px = x - dx, pz = z - dz; if (world.inBounds(px, y, pz) && ok(world.get(px, y, pz))) continue; // れつの はじめ だけ
      let n = 0; while (world.inBounds(x + dx * n, y, z + dz * n) && ok(world.get(x + dx * n, y, z + dz * n))) n++;
      if (n > best) best = n;
    }
  }
  return best;
}
// y の たかさで まわりが ぜんぶ かべの しかく（よこ・たて 3 いじょう）
function rooms(world, y = 1) {
  const full = (x, z) => { const c = world.get(x, y, z); return c && WALL(c.id); };
  const out = [];
  for (let x0 = 0; x0 < world.w - 2; x0++) for (let z0 = 0; z0 < world.d - 2; z0++) {
    if (!full(x0, z0)) continue;
    for (let x1 = x0 + 2; x1 < world.w && full(x1, z0); x1++) {
      let ok1 = true; for (let x = x0; x <= x1; x++) if (!full(x, z0)) { ok1 = false; break; } if (!ok1) break;
      for (let z1 = z0 + 2; z1 < world.d && full(x0, z1) && full(x1, z1); z1++) {
        let ok = true;
        for (let x = x0; x <= x1 && ok; x++) if (!full(x, z1)) ok = false;
        for (let z = z0; z <= z1 && ok; z++) if (!full(x0, z) || !full(x1, z)) ok = false;
        if (ok) out.push({ x0, z0, x1, z1 });
      }
    }
  }
  return out;
}
const onEdge = (r, x, z) => (x === r.x0 || x === r.x1 || z === r.z0 || z === r.z1) && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
// おうち：へやの かべに ドア（1だんめ）と ガラス（まど）、うえに やね
function isHouse(world, r) {
  let door = false, glass = false, roof = 0;
  for (const b of world.each()) {
    if (b.id === 'door' && b.y === 1 && onEdge(r, b.x, b.z)) door = true;
    if (b.id === 'glass' && b.y >= 1 && b.y <= 3 && onEdge(r, b.x, b.z)) glass = true;
    if (b.id === 'roof' && b.y >= 2 && b.x >= r.x0 - 1 && b.x <= r.x1 + 1 && b.z >= r.z0 - 1 && b.z <= r.z1 + 1) roof++;
  }
  return door && glass && roof >= 3;
}
function houses(world) {
  const hs = rooms(world).filter(r => isHouse(world, r)).sort((a, b) => (a.x1 - a.x0) * (a.z1 - a.z0) - (b.x1 - b.x0) * (b.z1 - b.z0));
  const pick = [];
  for (const r of hs) if (!pick.some(p => !(r.x1 < p.x0 || r.x0 > p.x1 || r.z1 < p.z0 || r.z0 > p.z1))) pick.push(r);
  return pick;
}

// check(world) → [いま, ひつよう]。need(st) が あれば それも ひつよう（st.loopBuilt … ロボットが くりかえしで ブロックを おいた）
export const QUESTS = [
  { id: 1, name: 'かべを つくろう', text: 'きの ブロックを よこに 4こ ならべよう', learn: 'じゅんばんに めいれいする（じゅんじ じっこう）', reward: 20, check: w => [Math.min(longestRun(w, c => c && c.id === 'wood'), 4), 4] },
  { id: 2, name: 'ながい かべを つくろう', text: 'ロボットの「くりかえす」で、ブロックを 8こ つながった かべに しよう', learn: 'おなじ ことを くりかえす（くりかえし）', reward: 30, check: w => [Math.min(longestRun(w, c => c && BUILD(c.id)), 8), 8], need: st => st.loopBuilt, hint: '「ロボット」で くりかえすを つかって ブロックを おいてね' },
  { id: 3, name: 'おへやを つくろう', text: 'かべで ぐるっと かこんだ しかくい へやを つくろう（3×3 いじょう）', learn: 'めいれいを くみあわせる', reward: 40, check: w => [rooms(w).length ? 1 : 0, 1] },
  { id: 4, name: 'おうちを つくろう', text: 'へやに ドア・ガラスの まど・やねを つけて おうちに しよう', learn: 'けいかくを たてて じゅんばんに つくる', reward: 50, check: w => [houses(w).length ? 1 : 0, 1] },
  { id: 5, name: 'むらを つくろう', text: 'おうちを 3けん たてて むらに しよう。むらびとが あそびに くるよ！', learn: 'おなじ プログラムを つかいまわす', reward: 80, check: w => [Math.min(houses(w).length, 3), 3] },
];
export { rooms, houses, longestRun };

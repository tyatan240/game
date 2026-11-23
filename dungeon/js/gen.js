// マップを つくる（へやと つうろ）。ひょうじとは べつ
//   タイル：'#' かべ ／ '.' へやの ゆか ／ ',' つうろ
export const W = 34, H = 22;

const ri = (rand, a, b) => a + Math.floor(rand() * (b - a + 1));
function blank(w, h) { return Array.from({ length: h }, () => Array(w).fill('#')); }
function carve(g, r, c = '.') { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) g[y][x] = c; }
function corridor(g, a, b, rand) {
  // a の まんなか → b の まんなか（L じ）
  const ax = a.x + (a.w >> 1), ay = a.y + (a.h >> 1), bx = b.x + (b.w >> 1), by = b.y + (b.h >> 1);
  const dig = (x, y) => { if (g[y][x] === '#') g[y][x] = ','; };
  if (rand() < 0.5) { for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) dig(x, ay); for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) dig(bx, y); }
  else { for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) dig(ax, y); for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) dig(x, by); }
}
const overlap = (a, b) => a.x - 1 < b.x + b.w && b.x - 1 < a.x + a.w && a.y - 1 < b.y + b.h && b.y - 1 < a.y + a.h;

// ふつうの かい：へや 4〜6こ を つうろで つなぐ
export function genFloor(boss, rand = Math.random) {
  const g = blank(W, H), rooms = [];
  if (boss) { // ボスの かい：ちいさな へや ＋ おおきな ボスの へや
    rooms.push({ x: 2, y: 8, w: 5, h: 5 }, { x: 15, y: 4, w: 16, h: 13 });
  } else {
    for (let t = 0; t < 200 && rooms.length < 6; t++) {
      const r = { w: ri(rand, 4, 8), h: ri(rand, 3, 6) }; r.x = ri(rand, 1, W - r.w - 2); r.y = ri(rand, 1, H - r.h - 2);
      if (!rooms.some(o => overlap(o, r))) rooms.push(r);
    }
    rooms.sort((a, b) => a.x - b.x);
  }
  rooms.forEach(r => carve(g, r));
  for (let i = 1; i < rooms.length; i++) corridor(g, rooms[i - 1], rooms[i], rand);
  if (!boss && rooms.length > 3) corridor(g, rooms[0], rooms[rooms.length - 1], rand); // わっか（にげみち）
  rooms.forEach(r => carve(g, r)); // つうろで けずれた へやの かたちを もどす
  return { w: W, h: H, tiles: g.map(r => r.join('')), rooms };
}

// チュートリアル（れんしゅうの へや）：きまった かたち
export function genTutorial() {
  const w = 28, h = 9, g = blank(w, h);
  const A = { x: 1, y: 2, w: 5, h: 4 }, B = { x: 9, y: 1, w: 9, h: 7 }, C = { x: 21, y: 2, w: 5, h: 4 };
  [A, B, C].forEach(r => carve(g, r));
  for (let x = 6; x < 9; x++) g[3][x] = ',';
  for (let x = 18; x < 21; x++) g[4][x] = ',';
  return { w, h, tiles: g.map(r => r.join('')), rooms: [A, B, C] };
}

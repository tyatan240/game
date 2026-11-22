// ブロックの めんの もようを Canvas に かく（がぞう ファイルは つかわない）
const N = 16;
const cache = new Map();

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function hash(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
export function shade(c, f) { const [r, g, b] = hex(c); const k = v => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${k(r)},${k(g)},${k(b)})`; }

const PAT = {
  speck(g, c, R) {
    g.fillStyle = c; g.fillRect(0, 0, N, N);
    for (let i = 0; i < 40; i++) { g.fillStyle = shade(c, R() < .5 ? .88 : 1.1); g.fillRect(R() * N | 0, R() * N | 0, 1, 1); }
  },
  grassSide(g, c, R, b) {
    PAT.speck(g, c, R);
    const gr = b.top; g.fillStyle = gr; g.fillRect(0, 0, N, 4);
    for (let x = 0; x < N; x++) if (R() < .5) g.fillRect(x, 4, 1, 1 + (R() * 2 | 0));
    g.fillStyle = shade(gr, 1.12); for (let i = 0; i < 6; i++) g.fillRect(R() * N | 0, R() * 3 | 0, 1, 1);
  },
  plank(g, c, R) {
    g.fillStyle = c; g.fillRect(0, 0, N, N);
    for (let y = 0; y < N; y += 4) {
      g.fillStyle = shade(c, .78); g.fillRect(0, y + 3, N, 1);
      const off = (y / 4) % 2 ? 4 : 11; g.fillRect(off, y, 1, 3);
      g.fillStyle = shade(c, 1.07); for (let i = 0; i < 3; i++) g.fillRect(R() * N | 0, y + (R() * 3 | 0), 2, 1);
    }
  },
  stone(g, c, R) {
    PAT.speck(g, c, R);
    g.fillStyle = shade(c, .75);
    [[2, 3, 4], [9, 2, 3], [5, 9, 5], [11, 11, 3], [1, 13, 2]].forEach(([x, y, l]) => { g.fillRect(x, y, l, 1); g.fillRect(x + l - 1, y + 1, 1, 1); });
    g.fillStyle = shade(c, 1.12); g.fillRect(3, 4, 2, 1); g.fillRect(10, 3, 1, 1); g.fillRect(6, 10, 2, 1);
  },
  brick(g, c) {
    g.fillStyle = c; g.fillRect(0, 0, N, N);
    g.fillStyle = '#efe3d3';
    for (let y = 0; y < N; y += 4) { g.fillRect(0, y + 3, N, 1); const o = (y / 4) % 2 ? 0 : 4; for (let x = o; x < N; x += 8) g.fillRect(x, y, 1, 3); }
    g.fillStyle = shade(c, 1.12); for (let y = 0; y < N; y += 4) g.fillRect(((y / 4) % 2 ? 2 : 6), y, 3, 1);
  },
  glass(g, c) {
    g.clearRect(0, 0, N, N);
    g.fillStyle = 'rgba(200,236,255,0.28)'; g.fillRect(0, 0, N, N);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, N, 1); g.fillRect(0, N - 1, N, 1); g.fillRect(0, 0, 1, N); g.fillRect(N - 1, 0, 1, N);
    g.fillStyle = shade(c, .85); g.fillRect(1, 1, N - 2, 1); g.fillRect(1, N - 2, N - 2, 1); g.fillRect(1, 1, 1, N - 2); g.fillRect(N - 2, 1, 1, N - 2);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(4, 3, 1, 1); g.fillRect(3, 4, 1, 1); g.fillRect(5, 3, 1, 1); g.fillRect(3, 5, 1, 1);
  },
  tile(g, c) {
    g.fillStyle = c; g.fillRect(0, 0, N, N);
    for (let y = 0; y < N; y += 4) {
      g.fillStyle = shade(c, .72); g.fillRect(0, y + 3, N, 1);
      const o = (y / 4) % 2 ? 0 : 4; for (let x = o; x < N; x += 8) g.fillRect(x, y, 1, 3);
      g.fillStyle = shade(c, 1.15); g.fillRect(0, y, N, 1);
    }
  },
  door(g, c) {
    g.fillStyle = c; g.fillRect(0, 0, N, N);
    g.fillStyle = shade(c, .7); g.fillRect(0, 0, N, 1); g.fillRect(0, 0, 1, N); g.fillRect(N - 1, 0, 1, N);
    g.fillStyle = shade(c, .82); g.fillRect(3, 2, 10, 5); g.fillRect(3, 9, 10, 6);
    g.fillStyle = shade(c, 1.1); g.fillRect(4, 3, 8, 3); g.fillRect(4, 10, 8, 4);
    g.fillStyle = '#ffd84a'; g.fillRect(11, 8, 2, 2);
  },
};

// めんの キャンバス（id と めんごとに 1まい）
export function faceCanvas(b, face) {
  const k = b.id + ':' + face;
  if (cache.has(k)) return cache.get(k);
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const g = cv.getContext('2d');
  const pat = (b.pattern && b.pattern[face]) || 'speck';
  (PAT[pat] || PAT.speck)(g, b[face] || b.side || '#cccccc', rng(hash(k)), b);
  cache.set(k, cv);
  return cv;
}

// え：すべて この ファイルで かく オリジナル（がぞう ファイル・えもじは つかわない）
// 1マス = TS（32）の ろんり たんいで かき、ひょうじの ときに かくだい する
export const TS = 32;

const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const C = {
  grass: '#9edc7f', grass2: '#94d474', tuft: '#7cc463', path: '#f3dcaa', pebble: '#e2c58c', water: '#7ccaf3', water2: '#a6dcfa', foam: '#e4f6ff',
  wood: '#c98f55', woodD: '#9c6a3a', leaf: '#5fbf5a', leafD: '#45a447', leafL: '#86d675', trunk: '#9a6a43', ink: '#4a3a3a',
};

/* ---------- じめん（キャッシュして つかう）---------- */
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

function grass(ctx, tx, ty) {
  ctx.fillStyle = (tx + ty) % 2 ? C.grass : C.grass2; ctx.fillRect(0, 0, TS, TS);
  ctx.strokeStyle = C.tuft; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const x = 4 + hash(tx * 3 + i, ty) * 24, y = 6 + hash(tx, ty * 3 + i) * 22;
    ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x - 1, y - 3); ctx.moveTo(x + 1, y); ctx.lineTo(x + 2, y - 3); ctx.stroke();
  }
}
function flowers(ctx, tx, ty) {
  grass(ctx, tx, ty);
  const cols = ['#ff9ec0', '#fff3a0', '#ffffff', '#c7b3ff'];
  for (let i = 0; i < 3; i++) {
    const x = 5 + hash(tx + i * 7, ty) * 22, y = 5 + hash(tx, ty + i * 5) * 22, c = cols[Math.floor(hash(tx * i + 1, ty + i) * cols.length)];
    ctx.fillStyle = c;
    for (let k = 0; k < 5; k++) { const a = k * 1.2566; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 2.4, y + Math.sin(a) * 2.4, 1.8, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#ffc94d'; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 7); ctx.fill();
  }
}
function path(ctx, tx, ty, isPath) {
  grass(ctx, tx, ty);
  ctx.fillStyle = C.path;
  const n = isPath(tx, ty - 1), s = isPath(tx, ty + 1), w = isPath(tx - 1, ty), e = isPath(tx + 1, ty);
  const m = 3;
  rr(ctx, w ? 0 : m, n ? 0 : m, TS - (w ? 0 : m) - (e ? 0 : m), TS - (n ? 0 : m) - (s ? 0 : m), 8); ctx.fill();
  ctx.fillStyle = C.pebble;
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(8 + hash(tx + i, ty * 2) * 16, 8 + hash(tx * 2, ty + i) * 16, 1.8, 1.3, 0, 0, 7); ctx.fill(); }
}
const GROUND = { '.': grass, ',': flowers, T: grass, b: grass, r: grass, F: grass, h: grass };

// 1マスぶんの じめんを キャッシュ
const cache = new Map();
let cacheScale = 0;
export function groundTile(ch, tx, ty, s, isPath) {
  if (s !== cacheScale) { cache.clear(); cacheScale = s; }
  const variant = ch === ':' ? `${isPath(tx, ty - 1)}${isPath(tx, ty + 1)}${isPath(tx - 1, ty)}${isPath(tx + 1, ty)}${(tx + ty) % 2}${Math.floor(hash(tx, ty) * 4)}` : `${(tx + ty) % 2}${Math.floor(hash(tx, ty) * 6)}`;
  const key = ch + variant;
  let c = cache.get(key);
  if (!c) {
    c = document.createElement('canvas'); c.width = c.height = Math.ceil(TS * s) + 1;
    const x = c.getContext('2d'); x.scale(c.width / TS, c.height / TS); // すこし おおきめに かいて すきまを なくす
    if (ch === ':') path(x, tx, ty, isPath); else (GROUND[ch] || grass)(x, tx, ty);
    cache.set(key, c);
  }
  return c;
}

// みず（うごくので まいかい かく）
export function drawWater(ctx, tx, ty, t, isWater) {
  ctx.fillStyle = C.water; ctx.fillRect(0, 0, TS + 0.6, TS + 0.6);
  ctx.strokeStyle = C.water2; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const y = 9 + i * 14 + Math.sin(t * 1.5 + tx + i) * 1.5, x = 6 + ((t * 6 + hash(tx, ty + i) * 20) % 20);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 3, y - 2.5, x + 6, y); ctx.stroke();
  }
  ctx.fillStyle = C.foam;
  if (!isWater(tx, ty - 1)) { ctx.fillRect(0, 0, TS, 3); }
  if (!isWater(tx, ty + 1)) { ctx.fillRect(0, TS - 2, TS, 2); }
  if (!isWater(tx - 1, ty)) { ctx.fillRect(0, 0, 2.5, TS); }
  if (!isWater(tx + 1, ty)) { ctx.fillRect(TS - 2.5, 0, 2.5, TS); }
}

// おおきな はし（open：0〜1 で だんだん できる）
export function drawBridge(ctx, open, col) {
  ctx.fillStyle = C.water; ctx.fillRect(0, 0, TS, TS);
  // はしら
  ctx.fillStyle = C.woodD;
  if (col === 0) { ctx.fillRect(1, 2, 4, 7); ctx.fillRect(1, TS - 9, 4, 7); }
  if (col === 1) { ctx.fillRect(TS - 5, 2, 4, 7); ctx.fillRect(TS - 5, TS - 9, 4, 7); }
  const planks = 6, shown = Math.round(open * planks * 2) - col * planks;
  for (let i = 0; i < Math.min(planks, shown); i++) {
    ctx.fillStyle = i % 2 ? C.wood : '#d39c62'; ctx.fillRect(i * (TS / planks), 6, TS / planks - 0.8, TS - 12);
  }
  if (shown >= planks) { ctx.fillStyle = C.woodD; ctx.fillRect(0, 4, TS, 3); ctx.fillRect(0, TS - 7, TS, 3); }
  if (open <= 0 && col === 0) { // こわれた いた
    ctx.save(); ctx.translate(14, 18); ctx.rotate(0.4); ctx.fillStyle = '#b07b46'; ctx.fillRect(-6, -2, 12, 4); ctx.restore();
  }
}
export function drawPlank(ctx) {
  ctx.fillStyle = C.water; ctx.fillRect(0, 0, TS, TS);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? C.wood : '#d39c62'; ctx.fillRect(4, i * 8 + 0.5, TS - 8, 7); }
  ctx.fillStyle = C.woodD; ctx.fillRect(3, 0, 2, TS); ctx.fillRect(TS - 5, 0, 2, TS);
}

/* ---------- もの（y の じゅんに かく）---------- */
const spriteCache = new Map();
let spriteScale = 0;
function cached(key, wT, hT, s, draw) {
  if (s !== spriteScale) { spriteCache.clear(); spriteScale = s; }
  let c = spriteCache.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = Math.ceil(wT * TS * s); c.height = Math.ceil(hT * TS * s); const x = c.getContext('2d'); x.scale(s, s); draw(x); spriteCache.set(key, c); }
  return c;
}
// き（1マス はば・2マス たかさ）
export function treeSprite(s, v) {
  return cached('tree' + v, 1, 2, s, ctx => {
    ctx.fillStyle = 'rgba(40,80,40,.22)'; ctx.beginPath(); ctx.ellipse(16, 58, 13, 4.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = C.trunk; rr(ctx, 12.5, 40, 7, 18, 3); ctx.fill();
    const g = v ? ['#4fb257', '#3f9c49', '#7fd17a'] : [C.leaf, C.leafD, C.leafL];
    ctx.fillStyle = g[1]; ctx.beginPath(); ctx.arc(16, 30, 15, 0, 7); ctx.fill();
    ctx.fillStyle = g[0]; ctx.beginPath(); ctx.arc(9, 30, 9, 0, 7); ctx.arc(23, 30, 9, 0, 7); ctx.arc(16, 20, 11, 0, 7); ctx.fill();
    ctx.fillStyle = g[2]; ctx.beginPath(); ctx.arc(12, 17, 4.5, 0, 7); ctx.arc(20, 25, 3, 0, 7); ctx.fill();
    if (v) { ctx.fillStyle = '#ff7a7a'; [[9, 28], [22, 33], [17, 22]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }); }
  });
}
export function bushSprite(s) {
  return cached('bush', 1, 1, s, ctx => {
    ctx.fillStyle = 'rgba(40,80,40,.2)'; ctx.beginPath(); ctx.ellipse(16, 27, 12, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#4fb257'; ctx.beginPath(); ctx.arc(10, 19, 8, 0, 7); ctx.arc(22, 19, 8, 0, 7); ctx.arc(16, 13, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#7fd17a'; ctx.beginPath(); ctx.arc(13, 10, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff8fb1'; [[9, 18], [20, 14], [23, 21]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 7); ctx.fill(); });
  });
}
export function rockSprite(s) {
  return cached('rock', 1, 1, s, ctx => {
    ctx.fillStyle = 'rgba(40,60,40,.2)'; ctx.beginPath(); ctx.ellipse(16, 27, 12, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#b9c0c9'; ctx.beginPath(); ctx.ellipse(16, 19, 12, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#d7dde4'; ctx.beginPath(); ctx.ellipse(13, 16, 6, 4, -0.3, 0, 7); ctx.fill();
  });
}
export function fenceSprite(s) {
  return cached('fence', 1, 1, s, ctx => {
    ctx.fillStyle = '#e9cfa6'; ctx.fillRect(0, 13, 32, 4); ctx.fillRect(0, 21, 32, 4);
    ctx.fillStyle = '#f5e2c3'; [6, 22].forEach(x => { rr(ctx, x - 3, 8, 6, 20, 2); ctx.fill(); });
    ctx.strokeStyle = '#c9a57a'; ctx.lineWidth = 1; [6, 22].forEach(x => { rr(ctx, x - 3, 8, 6, 20, 2); ctx.stroke(); });
  });
}
// いえ（3マス はば・3マス たかさ。うえ 1マスは やね）
export function houseSprite(s) {
  return cached('house', 3, 3, s, ctx => {
    ctx.fillStyle = 'rgba(40,80,40,.2)'; ctx.fillRect(4, 90, 88, 6);
    ctx.fillStyle = '#fff3e0'; rr(ctx, 8, 40, 80, 52, 4); ctx.fill(); ctx.strokeStyle = '#e2c29a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ff8a7a'; ctx.beginPath(); ctx.moveTo(0, 44); ctx.lineTo(48, 6); ctx.lineTo(96, 44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8695a'; ctx.fillRect(0, 42, 96, 6);
    ctx.fillStyle = '#c98f55'; rr(ctx, 40, 62, 16, 30, 6); ctx.fill(); ctx.fillStyle = '#ffd34f'; ctx.beginPath(); ctx.arc(52, 78, 1.8, 0, 7); ctx.fill();
    [[16, 56], [66, 56]].forEach(([x, y]) => { ctx.fillStyle = '#bfe6ff'; rr(ctx, x, y, 14, 14, 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 7, y); ctx.lineTo(x + 7, y + 14); ctx.stroke(); });
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(48, 30, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#ff8fb1'; ctx.beginPath(); ctx.arc(48, 30, 3, 0, 7); ctx.fill();
  });
}

// かんばん
export function drawSign(ctx, text) {
  ctx.fillStyle = 'rgba(40,80,40,.2)'; ctx.beginPath(); ctx.ellipse(16, 29, 9, 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = C.woodD; ctx.fillRect(14, 14, 4, 15);
  ctx.fillStyle = '#e3b57c'; rr(ctx, 2, 2, 28, 16, 3); ctx.fill(); ctx.strokeStyle = C.woodD; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.font = `800 ${text.length > 3 ? 7 : 10}px "M PLUS Rounded 1c", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 16, 10.5);
}
// たからばこ
export function drawChest(ctx, open, t) {
  ctx.fillStyle = 'rgba(40,80,40,.22)'; ctx.beginPath(); ctx.ellipse(16, 28, 12, 3.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#c47a3c'; rr(ctx, 4, 13, 24, 15, 3); ctx.fill();
  ctx.fillStyle = '#ffcf4d'; ctx.fillRect(4, 18, 24, 3); ctx.fillRect(14, 13, 4, 15);
  if (open) {
    ctx.fillStyle = '#8a4f22'; rr(ctx, 5, 9, 22, 6, 2); ctx.fill();
    ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.ellipse(16, 14, 9, 3, 0, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = '#d98b48'; rr(ctx, 3, 6, 26, 10, 5); ctx.fill();
    ctx.fillStyle = '#ffcf4d'; ctx.fillRect(14, 6, 4, 10); ctx.fillStyle = '#fff6c4'; ctx.beginPath(); ctx.arc(16, 15, 2.2, 0, 7); ctx.fill();
    const k = (Math.sin(t * 3) + 1) / 2; ctx.globalAlpha = 0.4 + k * 0.6; starPath(ctx, 27, 5, 3.5, 1.5); ctx.fillStyle = '#fff'; ctx.fill(); ctx.globalAlpha = 1;
  }
}
export function starPath(ctx, cx, cy, R, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; ctx[i ? 'lineTo' : 'moveTo'](cx + q * Math.cos(a), cy + q * Math.sin(a)); }
  ctx.closePath();
}

/* ---------- キャラクター（どうぶつ）---------- */
// kind ごとの いろ と かたち
const KIND = {
  fox: { body: '#ffa552', light: '#fff4e6', line: '#d9782c', ear: 'tri', tail: 'fox' },
  rabbit: { body: '#fffaf5', light: '#ffffff', line: '#e2c8c0', ear: 'long', inner: '#ffc2d1' },
  ant: { body: '#b5694a', light: '#d88e6e', line: '#7a4030', ear: 'antenna' },
  bear: { body: '#c08a58', light: '#f2d6b3', line: '#8f5f35', ear: 'round', inner: '#e6b48a' },
  cat: { body: '#cfd3dd', light: '#ffffff', line: '#99a0b0', ear: 'tri', inner: '#ffc2d1', whisker: true },
  dog: { body: '#f0cf9c', light: '#fff4e2', line: '#c49a5f', ear: 'flop', inner: '#b98a55' },
  elephant: { body: '#b6c4e0', light: '#d8e1f2', line: '#7f8fb5', ear: 'big', trunk: true },
  dragon: { body: '#8fd88a', light: '#fff3b0', line: '#5aa65a', ear: 'horn', wings: true },
};
// cx,cy：あしもとの まんなか（ろんり たんい）。dir：up/down/left/right。step：あるく アニメ
export function drawCritter(ctx, kind, cx, cy, dir = 'down', step = 0, opts = {}) {
  const K = KIND[kind] || KIND.fox, sc = opts.scale || 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  const bob = Math.abs(Math.sin(step * Math.PI)) * -1.5, side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, back = dir === 'up';
  // かげ
  ctx.fillStyle = 'rgba(40,60,40,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, 7); ctx.fill();
  ctx.translate(0, bob);
  ctx.lineWidth = 1.3; ctx.strokeStyle = K.line;
  // しっぽ・はね（うしろ）
  if (K.tail === 'fox') { ctx.fillStyle = K.body; ctx.save(); ctx.translate(side ? -side * 6 : 5, -6); ctx.rotate(side ? -side * 0.5 : 0.6); ctx.beginPath(); ctx.ellipse(0, -4, 4, 7, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(0, -9, 2.5, 3, 0, 0, 7); ctx.fill(); ctx.restore(); }
  if (K.wings) { ctx.fillStyle = '#b9ecb4'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 5, -12); ctx.quadraticCurveTo(s * 15, -22, s * 14, -9); ctx.quadraticCurveTo(s * 10, -10, s * 5, -7); ctx.fill(); ctx.stroke(); }); }
  // あし
  const lf = Math.sin(step * Math.PI * 2) * 1.6;
  ctx.fillStyle = K.body;
  ctx.beginPath(); ctx.ellipse(-3.5, -1.5 + (side ? 0 : lf * 0.4), 3, 2.2, 0, 0, 7); ctx.ellipse(3.5, -1.5 - (side ? 0 : lf * 0.4), 3, 2.2, 0, 0, 7); ctx.fill(); ctx.stroke();
  // からだ
  ctx.beginPath(); ctx.ellipse(side * 0.5, -7, 6.5, 6, 0, 0, 7); ctx.fill(); ctx.stroke();
  if (!back) { ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(side * 1.5, -6.5, 4, 4, 0, 0, 7); ctx.fill(); }
  // スカーフ
  if (opts.scarf) { ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.ellipse(0, -12, 6.5, 2.3, 0, 0, 7); ctx.fill(); if (!back) { ctx.fillRect(side >= 0 ? 1 : -4, -12, 3, 6); } }
  // みみ（うしろの ぶぶん）
  const hy = -19;
  if (K.ear === 'big') { ctx.fillStyle = K.body; [-1, 1].forEach(s => { if (side && s !== -side) return; ctx.beginPath(); ctx.ellipse(s * 10, hy + 1, 6, 7.5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e9c3d6'; ctx.beginPath(); ctx.ellipse(s * 10, hy + 1, 3.5, 4.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = K.body; }); }
  if (K.ear === 'long') { [-1, 1].forEach(s => { ctx.fillStyle = K.body; ctx.save(); ctx.translate(s * 4 - side * 2, hy - 8); ctx.rotate(s * 0.15); ctx.beginPath(); ctx.ellipse(0, -2, 3.3, 8.5, 0, 0, 7); ctx.fill(); ctx.stroke(); if (!back) { ctx.fillStyle = K.inner; ctx.beginPath(); ctx.ellipse(0, -1.5, 1.6, 6, 0, 0, 7); ctx.fill(); } ctx.restore(); }); }
  if (K.ear === 'antenna') { ctx.strokeStyle = K.line; ctx.lineWidth = 1.4; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3, hy - 7); ctx.quadraticCurveTo(s * 6, hy - 14, s * 9, hy - 13); ctx.stroke(); ctx.fillStyle = K.line; ctx.beginPath(); ctx.arc(s * 9, hy - 13, 1.6, 0, 7); ctx.fill(); }); ctx.lineWidth = 1.3; }
  if (K.ear === 'horn') { ctx.fillStyle = '#fff3b0'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3, hy - 7); ctx.lineTo(s * 6, hy - 14); ctx.lineTo(s * 7.5, hy - 6); ctx.fill(); ctx.stroke(); }); }
  // あたま
  ctx.fillStyle = K.body; ctx.beginPath(); ctx.arc(side * 1, hy, 9, 0, 7); ctx.fill(); ctx.stroke();
  // みみ（まえ）
  const ear = (x, y, rot) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = K.body; ctx.beginPath(); ctx.moveTo(-3.5, 2); ctx.lineTo(0, -6); ctx.lineTo(3.5, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); if (K.inner && !back) { ctx.fillStyle = K.inner; ctx.beginPath(); ctx.moveTo(-1.8, 1); ctx.lineTo(0, -3.5); ctx.lineTo(1.8, 1); ctx.fill(); } ctx.restore(); };
  if (K.ear === 'tri') { ear(-5 + side, hy - 6.5, -0.35); ear(5 + side, hy - 6.5, 0.35); if (kind === 'fox' && !back) { ctx.fillStyle = '#6b4030'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 5.6 + side, hy - 11.5, 1.3, 0, 7); ctx.fill(); }); } }
  if (K.ear === 'round') { ctx.fillStyle = K.body; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 6.5 + side, hy - 6.5, 3.3, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.inner; ctx.beginPath(); ctx.arc(s * 6.5 + side, hy - 6.5, 1.6, 0, 7); ctx.fill(); ctx.fillStyle = K.body; }); }
  if (K.ear === 'flop') { ctx.fillStyle = K.inner; [-1, 1].forEach(s => { if (side && s === side) return; ctx.beginPath(); ctx.ellipse(s * 8.5 + side, hy, 3, 6.5, s * 0.25, 0, 7); ctx.fill(); }); }
  // かお
  if (!back) {
    const fx = side * 3.5, eyeY = hy + 0.5;
    if (kind === 'fox' || kind === 'dog' || kind === 'bear') { ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(fx * 1.1, hy + 4, 4.5, 3.3, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.ink;
    const eye = x => { ctx.beginPath(); ctx.ellipse(x, eyeY, 1.4, 1.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 0.5, eyeY - 0.7, 0.55, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; };
    if (opts.happy) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; [-3.5, 3.5].forEach(x => { ctx.beginPath(); ctx.arc(fx + x, eyeY + 1, 1.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
    else if (side) { eye(fx + 1.5); eye(fx - 3.5); } else { eye(-3.5); eye(3.5); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(fx * 1.2, hy + 3.2, 1.2, 0.9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,140,160,.55)'; [-1, 1].forEach(s => { if (side && s === -side) return; ctx.beginPath(); ctx.ellipse(fx + s * 6, hy + 3.5, 1.9, 1.2, 0, 0, 7); ctx.fill(); });
    if (K.whisker) { ctx.strokeStyle = '#8d93a3'; ctx.lineWidth = 0.6; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(fx + s * 4, hy + 3); ctx.lineTo(fx + s * 9, hy + 2); ctx.moveTo(fx + s * 4, hy + 4); ctx.lineTo(fx + s * 9, hy + 5); ctx.stroke(); }); ctx.lineWidth = 1.3; }
    if (K.trunk) { ctx.strokeStyle = K.body; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx, hy + 3); ctx.quadraticCurveTo(fx + side * 3, hy + 9, fx + (side || 1) * 4, hy + 10); ctx.stroke(); ctx.lineWidth = 1.3; }
  }
  // ぼうし
  if (opts.hat) { ctx.fillStyle = '#7c6cf0'; ctx.beginPath(); ctx.moveTo(-7 + side, hy - 6); ctx.lineTo(side * 2, hy - 20); ctx.lineTo(7 + side, hy - 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffd34f'; starPath(ctx, side * 2, hy - 20, 3.2, 1.4); ctx.fill(); ctx.beginPath(); ctx.arc(side - 1, hy - 11, 1.2, 0, 7); ctx.arc(side + 2.5, hy - 8.5, 1, 0, 7); ctx.fill(); }
  ctx.restore();
}

// かいわの かおアイコン（ちいさい canvas に かく）
export function portrait(kind, size = 64, opts = {}) {
  const c = document.createElement('canvas'), d = window.devicePixelRatio || 1;
  c.width = c.height = size * d; c.style.width = c.style.height = size + 'px';
  const x = c.getContext('2d'); x.scale(size * d / 32, size * d / 32);
  drawCritter(x, kind, 16, 34, 'down', 0, { ...opts, happy: true });
  return c;
}

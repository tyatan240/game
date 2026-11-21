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
  mouse: { body: '#d9d3e0', light: '#f7f3fa', line: '#9f97ab', ear: 'mouse', inner: '#ffc2d1', whisker: true, tail: 'mouse' },
  // F〜Z の どうぶつ
  frog: { body: '#8fd46a', light: '#e9f8c8', line: '#5a9a3a', ear: 'frog', noNose: true },
  goat: { body: '#f6f2ea', light: '#ffffff', line: '#b8b0a0', ear: 'tri', inner: '#f0d0c8', horns: '#c9b48a', beard: true },
  hippo: { body: '#b8a6cc', light: '#ddd0ea', line: '#8a77a3', ear: 'round', inner: '#e9b8cf', muzzle: '#d9cce6' },
  squirrel: { body: '#d98a4a', light: '#ffe6c8', line: '#a85f2a', ear: 'tri', inner: '#ffc2a8', tail: 'squirrel' },
  chick: { body: '#ffe066', light: '#fff4b0', line: '#e5b82c', ear: 'tuft', beak: '#ff9a3c', feet: '#ff9a3c' },
  koala: { body: '#b9bcc6', light: '#e9eaf0', line: '#878b98', ear: 'koala', inner: '#f2f2f6', bignose: true },
  lion: { body: '#f5c35a', light: '#fff0c8', line: '#c9922a', ear: 'round', inner: '#e8a85a', mane: '#d9782c' },
  monkey: { body: '#b07a4a', light: '#f5d6b0', line: '#7f5230', ear: 'side', inner: '#f5d6b0', face: '#f5d6b0' },
  sheep: { body: '#fbf8f2', light: '#ffffff', line: '#c9c2b6', ear: 'flop', inner: '#e9cfc3', wool: true, face: '#f3e1cf' },
  owl: { body: '#b08560', light: '#f3e3c8', line: '#7f5a3a', ear: 'tufts', beak: '#ffb347', face: '#f3e3c8' },
  penguin: { body: '#4d5d8c', light: '#ffffff', line: '#33406b', beak: '#ffb347', feet: '#ffb347', face: '#ffffff' },
  duck: { body: '#ffffff', light: '#ffffff', line: '#c9c2b6', beak: '#ffa53a', feet: '#ffa53a' },
  raccoon: { body: '#a98a6a', light: '#efe0c8', line: '#7a5f45', ear: 'round', inner: '#6a5440', mask: '#6a5440' },
  turtle: { body: '#9fd48a', light: '#e9f8c8', line: '#5a9a3a', shell: '#b98a4a' },
  tiger: { body: '#ffb04a', light: '#fff4e0', line: '#d97a1c', ear: 'round', inner: '#fff4e0', stripes: '#5a3a2a' },
  zebra: { body: '#ffffff', light: '#ffffff', line: '#9a9a9a', ear: 'tri', inner: '#e0e0e0', stripes: '#3a3a3a', muzzle: '#d8d8d8' },
  deer: { body: '#c98f55', light: '#f5e0c0', line: '#9a6a3a', ear: 'tri', inner: '#f5d0b0', antlers: '#8a5a2a', spots: '#f5e6cc' },
  wolf: { body: '#a9b0bf', light: '#eef0f5', line: '#7a8090', ear: 'tri', inner: '#e9c8d0', muzzle: '#eef0f5' },
  hedgehog: { body: '#f0d8b8', light: '#fff2e0', line: '#b8946a', ear: 'round', inner: '#e8b8a0', spikes: '#8a6a4a' },
  pig: { body: '#ffc2cf', light: '#ffe0e8', line: '#e08aa0', ear: 'tri', inner: '#ff9fb4', snout: '#ff9fb4' },
  cow: { body: '#ffffff', light: '#ffffff', line: '#b0a8a0', ear: 'flop', inner: '#e9c3c3', horns: '#e8d8b8', spots: '#4a4040', snout: '#ffc8cf' },
  bird: { body: '#7ac8ff', light: '#e8f6ff', line: '#4a98d0', beak: '#ffb347', ear: 'tuft', feet: '#ffb347', smallwing: true },
  polar: { body: '#fbfbff', light: '#ffffff', line: '#c0c8d6', ear: 'round', inner: '#e9eef8', muzzle: '#ffffff' },
};
// cx,cy：あしもとの まんなか（ろんり たんい）。dir：up/down/left/right。step：あるく アニメ
export function drawCritter(ctx, kind, cx, cy, dir = 'down', step = 0, opts = {}) {
  const K = KIND[kind] || KIND.fox, sc = (opts.scale || 1) * (opts.small ? 0.78 : 1);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  const bob = Math.abs(Math.sin(step * Math.PI)) * -1.5, side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, back = dir === 'up';
  // かげ
  ctx.fillStyle = 'rgba(40,60,40,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, 7); ctx.fill();
  ctx.translate(0, bob);
  ctx.lineWidth = 1.3; ctx.strokeStyle = K.line;
  // しっぽ・はね（うしろ）
  if (K.tail === 'fox') { ctx.fillStyle = K.body; ctx.save(); ctx.translate(side ? -side * 6 : 5, -6); ctx.rotate(side ? -side * 0.5 : 0.6); ctx.beginPath(); ctx.ellipse(0, -4, 4, 7, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(0, -9, 2.5, 3, 0, 0, 7); ctx.fill(); ctx.restore(); }
  if (K.tail === 'mouse') { ctx.strokeStyle = '#c7a8b8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(side ? -side * 5 : 5, -4); ctx.quadraticCurveTo(side ? -side * 14 : 14, -2, side ? -side * 11 : 12, -12); ctx.stroke(); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
  if (K.tail === 'squirrel') { ctx.fillStyle = K.body; ctx.save(); ctx.translate(side ? -side * 7 : 7, -10); ctx.rotate(side ? -side * 0.3 : 0.3); ctx.beginPath(); ctx.ellipse(0, -5, 5.5, 10, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(0, -9, 2.5, 4, 0, 0, 7); ctx.fill(); ctx.restore(); }
  if (K.shell) { ctx.fillStyle = K.shell; ctx.beginPath(); ctx.ellipse(side * -1, -8, 11, 9, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#8a6a34'; ctx.stroke(); ctx.strokeStyle = K.line; }
  if (K.wings) { ctx.fillStyle = '#b9ecb4'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 5, -12); ctx.quadraticCurveTo(s * 15, -22, s * 14, -9); ctx.quadraticCurveTo(s * 10, -10, s * 5, -7); ctx.fill(); ctx.stroke(); }); }
  // あし
  const lf = Math.sin(step * Math.PI * 2) * 1.6;
  ctx.fillStyle = K.feet || K.body;
  ctx.beginPath(); ctx.ellipse(-3.5, -1.5 + (side ? 0 : lf * 0.4), 3, 2.2, 0, 0, 7); ctx.ellipse(3.5, -1.5 - (side ? 0 : lf * 0.4), 3, 2.2, 0, 0, 7); ctx.fill(); ctx.stroke();
  // からだ
  ctx.beginPath(); ctx.ellipse(side * 0.5, -7, 6.5, 6, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = K.body;
  if (!back) { ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(side * 1.5, -6.5, 4, 4, 0, 0, 7); ctx.fill(); }
  if (K.spots) { ctx.fillStyle = K.spots; [[-4, -9, 1.8], [3.5, -5, 1.5], [-1, -3.5, 1.2]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x + side, y, r * 1.2, r, 0, 0, 7); ctx.fill(); }); }
  if (K.stripes) { ctx.strokeStyle = K.stripes; ctx.lineWidth = 1.2; [-4, 0, 4].forEach(x => { ctx.beginPath(); ctx.moveTo(x - 1.5 + side, -11.5); ctx.lineTo(x + side, -8.5); ctx.stroke(); }); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
  if (K.smallwing) { ctx.fillStyle = '#5ab0ec'; [-1, 1].forEach(s => { if (side && s === side) return; ctx.beginPath(); ctx.ellipse(s * 6.5, -7, 2.4, 4.2, s * 0.4, 0, 7); ctx.fill(); }); }
  // スカーフ
  if (opts.scarf) { ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.ellipse(0, -12, 6.5, 2.3, 0, 0, 7); ctx.fill(); if (!back) { ctx.fillRect(side >= 0 ? 1 : -4, -12, 3, 6); } }
  // みみ（うしろの ぶぶん）
  const hy = -19;
  if (K.mane) { ctx.fillStyle = K.mane; ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ctx.arc(side + Math.cos(a) * 9.5, hy + Math.sin(a) * 9.5, 3.6, 0, 7); } ctx.fill(); }
  if (K.wool) { ctx.fillStyle = K.body; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.arc(side + Math.cos(a) * 8.5, hy + Math.sin(a) * 8.5, 3.4, 0, 7); } ctx.fill(); ctx.stroke(); }
  if (K.spikes) { ctx.fillStyle = K.spikes; ctx.beginPath(); for (let i = 0; i < 11; i++) { const a = Math.PI * (0.95 + i * 0.11), b = a + 0.12; ctx.moveTo(side + Math.cos(a - 0.12) * 8, hy + Math.sin(a - 0.12) * 8); ctx.lineTo(side + Math.cos(a) * 14, hy + Math.sin(a) * 14); ctx.lineTo(side + Math.cos(b) * 8, hy + Math.sin(b) * 8); } ctx.fill(); }
  if (K.ear === 'koala') { [-1, 1].forEach(s => { ctx.fillStyle = K.body; ctx.beginPath(); ctx.arc(s * 9 + side, hy - 4, 5.5, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.inner; ctx.beginPath(); ctx.arc(s * 9 + side, hy - 4, 3.3, 0, 7); ctx.fill(); }); }
  if (K.ear === 'side') { [-1, 1].forEach(s => { if (side && s === side) return; ctx.fillStyle = K.body; ctx.beginPath(); ctx.arc(s * 9.5 + side, hy + 1, 3.6, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.inner; ctx.beginPath(); ctx.arc(s * 9.5 + side, hy + 1, 2, 0, 7); ctx.fill(); }); }
  if (K.ear === 'big') { ctx.fillStyle = K.body; [-1, 1].forEach(s => { if (side && s !== -side) return; ctx.beginPath(); ctx.ellipse(s * 10, hy + 1, 6, 7.5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e9c3d6'; ctx.beginPath(); ctx.ellipse(s * 10, hy + 1, 3.5, 4.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = K.body; }); }
  if (K.ear === 'mouse') { [-1, 1].forEach(s => { ctx.fillStyle = K.body; ctx.beginPath(); ctx.arc(s * 7.5 + side, hy - 6, 5.5, 0, 7); ctx.fill(); ctx.stroke(); if (!back) { ctx.fillStyle = K.inner; ctx.beginPath(); ctx.arc(s * 7.5 + side, hy - 6, 3.4, 0, 7); ctx.fill(); } }); }
  if (K.ear === 'long') { [-1, 1].forEach(s => { ctx.fillStyle = K.body; ctx.save(); ctx.translate(s * 4 - side * 2, hy - 8); ctx.rotate(s * 0.15); ctx.beginPath(); ctx.ellipse(0, -2, 3.3, 8.5, 0, 0, 7); ctx.fill(); ctx.stroke(); if (!back) { ctx.fillStyle = K.inner; ctx.beginPath(); ctx.ellipse(0, -1.5, 1.6, 6, 0, 0, 7); ctx.fill(); } ctx.restore(); }); }
  if (K.ear === 'antenna') { ctx.strokeStyle = K.line; ctx.lineWidth = 1.4; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3, hy - 7); ctx.quadraticCurveTo(s * 6, hy - 14, s * 9, hy - 13); ctx.stroke(); ctx.fillStyle = K.line; ctx.beginPath(); ctx.arc(s * 9, hy - 13, 1.6, 0, 7); ctx.fill(); }); ctx.lineWidth = 1.3; }
  if (K.ear === 'horn') { ctx.fillStyle = '#fff3b0'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3, hy - 7); ctx.lineTo(s * 6, hy - 14); ctx.lineTo(s * 7.5, hy - 6); ctx.fill(); ctx.stroke(); }); }
  // あたま
  ctx.fillStyle = K.body; ctx.beginPath(); ctx.arc(side * 1, hy, 9, 0, 7); ctx.fill(); ctx.stroke();
  // みみ（まえ）
  const ear = (x, y, rot) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = K.body; ctx.beginPath(); ctx.moveTo(-3.5, 2); ctx.lineTo(0, -6); ctx.lineTo(3.5, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); if (K.inner && !back) { ctx.fillStyle = K.inner; ctx.beginPath(); ctx.moveTo(-1.8, 1); ctx.lineTo(0, -3.5); ctx.lineTo(1.8, 1); ctx.fill(); } ctx.restore(); };
  if (K.ear === 'tri') { ear(-5 + side, hy - 6.5, -0.35); ear(5 + side, hy - 6.5, 0.35); if (kind === 'fox' && !back) { ctx.fillStyle = '#6b4030'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 5.6 + side, hy - 11.5, 1.3, 0, 7); ctx.fill(); }); } }
  if (K.ear === 'round') { ctx.fillStyle = K.body; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 6.5 + side, hy - 6.5, 3.3, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = K.inner; ctx.beginPath(); ctx.arc(s * 6.5 + side, hy - 6.5, 1.6, 0, 7); ctx.fill(); ctx.fillStyle = K.body; }); }
  if (K.ear === 'frog') { [-1, 1].forEach(s => { ctx.fillStyle = K.body; ctx.beginPath(); ctx.arc(s * 4.5 + side, hy - 7, 3.8, 0, 7); ctx.fill(); ctx.stroke(); if (!back) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 4.5 + side, hy - 7, 2.6, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(s * 4.5 + side * 1.6, hy - 7, 1.4, 0, 7); ctx.fill(); } }); }
  if (K.ear === 'tuft') { ctx.fillStyle = K.body; ctx.beginPath(); ctx.moveTo(side - 2, hy - 8); ctx.quadraticCurveTo(side - 1, hy - 14, side + 2, hy - 12); ctx.quadraticCurveTo(side + 1, hy - 10, side + 2, hy - 8); ctx.fill(); ctx.stroke(); }
  if (K.ear === 'tufts') { ctx.fillStyle = K.body; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3 + side, hy - 8); ctx.lineTo(s * 8 + side, hy - 13); ctx.lineTo(s * 7.5 + side, hy - 5); ctx.fill(); ctx.stroke(); }); }
  if (K.horns) { ctx.fillStyle = K.horns; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 2.5 + side, hy - 7.5); ctx.quadraticCurveTo(s * 5 + side, hy - 14, s * 7 + side, hy - 12); ctx.lineTo(s * 5 + side, hy - 7); ctx.fill(); ctx.stroke(); }); }
  if (K.antlers) { ctx.strokeStyle = K.antlers; ctx.lineWidth = 1.6; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3 + side, hy - 8); ctx.lineTo(s * 6 + side, hy - 16); ctx.moveTo(s * 4.5 + side, hy - 12); ctx.lineTo(s * 8.5 + side, hy - 13); ctx.moveTo(s * 5.5 + side, hy - 14.5); ctx.lineTo(s * 3.5 + side, hy - 18); ctx.stroke(); }); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
  if (K.ear === 'flop') { ctx.fillStyle = K.inner; [-1, 1].forEach(s => { if (side && s === side) return; ctx.beginPath(); ctx.ellipse(s * 8.5 + side, hy, 3, 6.5, s * 0.25, 0, 7); ctx.fill(); }); }
  // かお
  if (!back) {
    const fx = side * 3.5, eyeY = hy + 0.5;
    if (kind === 'fox' || kind === 'dog' || kind === 'bear') { ctx.fillStyle = K.light; ctx.beginPath(); ctx.ellipse(fx * 1.1, hy + 4, 4.5, 3.3, 0, 0, 7); ctx.fill(); }
    if (K.face) { ctx.fillStyle = K.face; ctx.beginPath(); ctx.ellipse(fx, hy + 1.5, 6.5, 6, 0, 0, 7); ctx.fill(); }
    if (K.muzzle) { ctx.fillStyle = K.muzzle; ctx.beginPath(); ctx.ellipse(fx * 1.1, hy + 4.5, 5.5, 3.8, 0, 0, 7); ctx.fill(); }
    if (K.mask) { ctx.fillStyle = K.mask; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(fx + s * 3.6, hy + 0.8, 3.2, 2.6, s * -0.3, 0, 7); ctx.fill(); }); }
    if (K.stripes) { ctx.strokeStyle = K.stripes; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(side - 2, hy - 8.5); ctx.lineTo(side - 1, hy - 5); ctx.moveTo(side + 2, hy - 8.5); ctx.lineTo(side + 1, hy - 5); ctx.moveTo(side - 8.5, hy - 2); ctx.lineTo(side - 6, hy - 1); ctx.moveTo(side + 8.5, hy - 2); ctx.lineTo(side + 6, hy - 1); ctx.stroke(); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
    ctx.fillStyle = C.ink;
    const eye = x => { ctx.beginPath(); ctx.ellipse(x, eyeY, 1.4, 1.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 0.5, eyeY - 0.7, 0.55, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; };
    if (opts.happy) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; [-3.5, 3.5].forEach(x => { ctx.beginPath(); ctx.arc(fx + x, eyeY + 1, 1.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
    else if (K.ear === 'frog') { /* かえるの めは あたまの うえ */ }
    else if (side) { eye(fx + 1.5); eye(fx - 3.5); } else { eye(-3.5); eye(3.5); }
    if (K.beak) { ctx.fillStyle = K.beak; ctx.beginPath(); ctx.moveTo(fx - 2.5, hy + 2.5); ctx.lineTo(fx + 2.5 + side * 2, hy + 2.5); ctx.lineTo(fx + side * 3, hy + 5.5); ctx.closePath(); ctx.fill(); }
    else if (K.snout) { ctx.fillStyle = K.snout; ctx.beginPath(); ctx.ellipse(fx * 1.2, hy + 4, 3, 2.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(fx * 1.2 + s * 1, hy + 4, 0.55, 0, 7); ctx.fill(); }); }
    else if (K.bignose) { ctx.fillStyle = '#4a4550'; ctx.beginPath(); ctx.ellipse(fx * 1.2, hy + 3.5, 2.2, 2.8, 0, 0, 7); ctx.fill(); }
    else if (K.ear === 'frog') { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(fx, hy + 1, 3.5, 0.3, Math.PI - 0.3); ctx.stroke(); ctx.lineWidth = 1.3; ctx.strokeStyle = K.line; }
    else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(fx * 1.2, hy + 3.2, 1.2, 0.9, 0, 0, 7); ctx.fill(); }
    if (K.beard) { ctx.fillStyle = K.light; ctx.beginPath(); ctx.moveTo(fx - 1.5, hy + 7); ctx.lineTo(fx + 1.5, hy + 7); ctx.lineTo(fx, hy + 11); ctx.fill(); }
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

/* ---------- ことばの え（たんごカード・クイズ・もちもの）---------- */
// 0〜100 の しかくに かく
export const WORD_ART = {
  apple: c => {
    c.fillStyle = '#ff5a5f'; c.beginPath(); c.moveTo(50, 30); c.bezierCurveTo(20, 15, 8, 50, 22, 72); c.bezierCurveTo(32, 90, 44, 88, 50, 84); c.bezierCurveTo(56, 88, 68, 90, 78, 72); c.bezierCurveTo(92, 50, 80, 15, 50, 30); c.fill();
    c.strokeStyle = '#d93a40'; c.lineWidth = 3; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(34, 46, 6, 11, 0.4, 0, 7); c.fill();
    c.strokeStyle = '#8a5a3a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 32); c.quadraticCurveTo(50, 20, 56, 12); c.stroke();
    c.fillStyle = '#6fc95f'; c.beginPath(); c.ellipse(64, 20, 12, 6, -0.5, 0, 7); c.fill();
  },
  water: c => {
    c.fillStyle = '#6cc3f0'; c.beginPath(); c.moveTo(50, 10); c.bezierCurveTo(60, 30, 80, 48, 80, 64); c.arc(50, 64, 30, 0, Math.PI); c.bezierCurveTo(20, 48, 40, 30, 50, 10); c.fill();
    c.strokeStyle = '#3f9ac9'; c.lineWidth = 3; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(38, 62, 6, 12, 0.3, 0, 7); c.fill();
    c.fillStyle = '#3f6a8a'; [[42, 70], [58, 70]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); });
    c.strokeStyle = '#3f6a8a'; c.lineWidth = 2.5; c.beginPath(); c.arc(50, 76, 6, 0.2, Math.PI - 0.2); c.stroke();
  },
  flower: c => {
    c.strokeStyle = '#4fae4f'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 52); c.lineTo(50, 92); c.stroke();
    c.fillStyle = '#6fc95f'; c.beginPath(); c.ellipse(36, 78, 12, 5, 0.5, 0, 7); c.ellipse(64, 72, 12, 5, -0.5, 0, 7); c.fill();
    c.fillStyle = '#ff8fb1'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.beginPath(); c.ellipse(50 + Math.cos(a) * 17, 36 + Math.sin(a) * 17, 11, 11, 0, 0, 7); c.fill(); }
    c.strokeStyle = '#e0688f'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.beginPath(); c.arc(50 + Math.cos(a) * 17, 36 + Math.sin(a) * 17, 11, 0, 7); c.stroke(); }
    c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(50, 36, 11, 0, 7); c.fill();
  },
  bee: c => {
    c.fillStyle = 'rgba(220,240,255,.9)'; c.strokeStyle = '#9ec3e0'; c.lineWidth = 2;
    [[38, 30, -0.5], [60, 28, 0.5]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(x, y, 13, 18, r, 0, 7); c.fill(); c.stroke(); });
    c.fillStyle = '#ffd34f'; c.beginPath(); c.ellipse(50, 58, 28, 22, 0, 0, 7); c.fill();
    c.save(); c.beginPath(); c.ellipse(50, 58, 28, 22, 0, 0, 7); c.clip(); c.fillStyle = '#4a3a3a'; [44, 60].forEach(x => c.fillRect(x, 30, 8, 60)); c.restore();
    c.strokeStyle = '#4a3a3a'; c.lineWidth = 3; c.beginPath(); c.ellipse(50, 58, 28, 22, 0, 0, 7); c.stroke();
    c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(26, 52, 14, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#4a3a3a'; c.beginPath(); c.arc(21, 50, 2.6, 0, 7); c.arc(30, 50, 2.6, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,120,150,.6)'; c.beginPath(); c.arc(18, 56, 3, 0, 7); c.arc(33, 56, 3, 0, 7); c.fill();
    c.beginPath(); c.moveTo(80, 58); c.lineTo(90, 60); c.lineTo(80, 64); c.fillStyle = '#4a3a3a'; c.fill();
  },
  honey: c => {
    c.fillStyle = '#e8a33a'; c.beginPath(); c.moveTo(24, 40); c.quadraticCurveTo(18, 88, 50, 90); c.quadraticCurveTo(82, 88, 76, 40); c.closePath(); c.fill();
    c.strokeStyle = '#b8761c'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#ffcf6a'; c.beginPath(); c.moveTo(24, 40); c.quadraticCurveTo(50, 50, 76, 40); c.lineTo(72, 54); c.quadraticCurveTo(62, 62, 58, 54); c.quadraticCurveTo(50, 66, 42, 56); c.quadraticCurveTo(32, 62, 28, 54); c.closePath(); c.fill();
    c.fillStyle = '#c98f55'; c.fillRect(22, 28, 56, 12); c.strokeStyle = '#9c6a3a'; c.strokeRect(22, 28, 56, 12);
    c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(50, 72, 13, 9, 0, 0, 7); c.fill();
  },
  key: c => {
    c.strokeStyle = '#d9a21c'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.arc(32, 40, 15, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(44, 50); c.lineTo(80, 82); c.moveTo(66, 70); c.lineTo(58, 79); c.moveTo(75, 78); c.lineTo(68, 86); c.stroke();
    c.strokeStyle = '#ffe27a'; c.lineWidth = 4; c.beginPath(); c.arc(32, 40, 15, 3.6, 5.2); c.stroke();
  },
};
export function wordArt(art, size = 96) {
  const c = document.createElement('canvas'), d = window.devicePixelRatio || 1;
  c.width = c.height = Math.round(size * d); c.style.width = c.style.height = size + 'px';
  const x = c.getContext('2d'); x.scale(size * d / 100, size * d / 100);
  (WORD_ART[art] || (() => {}))(x);
  return c;
}

/* ---------- あたらしい もの ---------- */
// りんごの き（1マス はば・2マス たかさ、あかい りんご）
export function appleTreeSprite(s) {
  return cached('appletree', 1, 2, s, ctx => {
    ctx.fillStyle = 'rgba(40,80,40,.22)'; ctx.beginPath(); ctx.ellipse(16, 58, 15, 5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = C.trunk; rr(ctx, 12, 38, 8, 20, 3); ctx.fill();
    ctx.fillStyle = '#3f9c49'; ctx.beginPath(); ctx.arc(16, 28, 17, 0, 7); ctx.fill();
    ctx.fillStyle = '#58b85a'; ctx.beginPath(); ctx.arc(8, 28, 10, 0, 7); ctx.arc(24, 28, 10, 0, 7); ctx.arc(16, 17, 12, 0, 7); ctx.fill();
    [[8, 25], [22, 32], [16, 15], [25, 20], [11, 35]].forEach(([x, y]) => {
      ctx.fillStyle = '#ff4f57'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x - 1, y - 1, 1, 0, 7); ctx.fill();
    });
  });
}
export function wellSprite(s) {
  return cached('well', 1, 2, s, ctx => {
    ctx.fillStyle = 'rgba(40,80,40,.22)'; ctx.beginPath(); ctx.ellipse(16, 60, 15, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = C.woodD; ctx.fillRect(4, 20, 3, 30); ctx.fillRect(25, 20, 3, 30);
    ctx.fillStyle = '#e8695a'; ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(16, 10); ctx.lineTo(32, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a9b3bf'; rr(ctx, 2, 44, 28, 16, 5); ctx.fill();
    ctx.strokeStyle = '#8a95a3'; ctx.lineWidth = 1; [8, 16, 24].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x, 60); ctx.stroke(); }); ctx.beginPath(); ctx.moveTo(2, 52); ctx.lineTo(30, 52); ctx.stroke();
    ctx.fillStyle = '#4a8fc9'; ctx.beginPath(); ctx.ellipse(16, 45, 12, 3.5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8a6a4a'; ctx.beginPath(); ctx.moveTo(16, 22); ctx.lineTo(16, 34); ctx.stroke();
    ctx.fillStyle = '#c98f55'; rr(ctx, 12, 33, 8, 7, 2); ctx.fill();
  });
}
export function drawHive(ctx, bees) {
  ctx.fillStyle = 'rgba(40,80,40,.22)'; ctx.beginPath(); ctx.ellipse(16, 30, 9, 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = C.woodD; ctx.fillRect(14, 16, 4, 14);
  ctx.fillStyle = bees ? '#f2c14e' : '#e8d3a6'; rr(ctx, 6, 0, 20, 18, 5); ctx.fill();
  ctx.strokeStyle = bees ? '#c9942a' : '#c9b48a'; ctx.lineWidth = 1.2; [6, 11].forEach(y => { ctx.beginPath(); ctx.moveTo(7, y); ctx.lineTo(25, y); ctx.stroke(); });
  ctx.fillStyle = '#5a4030'; ctx.beginPath(); ctx.arc(16, 13, 2.4, 0, 7); ctx.fill();
}
export function drawGate(ctx, open) {
  ctx.fillStyle = C.woodD; ctx.fillRect(1, 2, 5, 28); ctx.fillRect(26, 2, 5, 28);
  ctx.fillStyle = '#ffcf4d'; ctx.beginPath(); ctx.arc(3.5, 3, 3, 0, 7); ctx.arc(28.5, 3, 3, 0, 7); ctx.fill();
  if (open) return;
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? C.wood : '#d39c62'; ctx.fillRect(6 + i * 5, 6, 5, 22); }
  ctx.fillStyle = C.woodD; ctx.fillRect(6, 10, 20, 3); ctx.fillRect(6, 21, 20, 3);
  ctx.fillStyle = '#ffcf4d'; rr(ctx, 12, 14, 8, 8, 2); ctx.fill(); ctx.fillStyle = '#7a5a2a'; ctx.beginPath(); ctx.arc(16, 17.5, 1.4, 0, 7); ctx.fill(); ctx.fillRect(15.4, 18, 1.2, 2.5);
}
export function drawVines(ctx) {
  ctx.strokeStyle = '#6b5a3a'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(3 + i * 6, 31); ctx.quadraticCurveTo(i * 7 - 4, 14, 6 + i * 5, 2); ctx.stroke(); }
  ctx.fillStyle = '#5c7a3a'; [[6, 10], [20, 6], [12, 20], [26, 18], [4, 26], [24, 28]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x, y, 3.5, 2, 0.6, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#4a3a2a'; [[9, 15], [17, 11], [22, 23], [7, 21]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 3, y - 1); ctx.lineTo(x + 1, y + 2); ctx.fill(); });
}
// はなばたけ 1マス。p：0（かれている）〜1（まんかい）
export function drawFlowerbed(ctx, tx, ty, p) {
  const wet = Math.min(1, p * 2);
  ctx.fillStyle = mix('#c9a77a', '#8f6a48', wet); ctx.fillRect(0, 0, TS + 0.6, TS + 0.6);
  ctx.fillStyle = mix('#b8956a', '#7a5a3c', wet); for (let i = 0; i < 3; i++) ctx.fillRect(0, 6 + i * 11, TS, 1.5);
  const cols = ['#ff7aa2', '#ffd34f', '#ffffff', '#b99bff', '#ff9e6a', '#7ac8ff'];
  for (let i = 0; i < 2; i++) {
    const x = 8 + i * 16 + (hash(tx, ty + i) - 0.5) * 6, y = 14 + i * 9 + (hash(tx + i, ty) - 0.5) * 4;
    const k = Math.max(0, Math.min(1, p * 1.8 - hash(tx * 3 + i, ty * 5) * 0.8));
    if (k <= 0) { // かれた くき
      ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.quadraticCurveTo(x + 1, y - 2, x + 5, y + 1); ctx.stroke();
      ctx.fillStyle = '#a08a60'; ctx.beginPath(); ctx.ellipse(x + 5, y + 2, 2.2, 1.4, 0.5, 0, 7); ctx.fill();
      continue;
    }
    const h = 4 + k * 8;
    ctx.strokeStyle = '#4fae4f'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 6 - h); ctx.stroke();
    ctx.fillStyle = '#6fc95f'; ctx.beginPath(); ctx.ellipse(x - 2.5, y + 3, 2.6, 1.3, 0.5, 0, 7); ctx.ellipse(x + 2.5, y + 2, 2.6, 1.3, -0.5, 0, 7); ctx.fill();
    if (k > 0.5) {
      const r = (k - 0.5) * 2 * 3.2, cy = y + 6 - h, c = cols[Math.floor(hash(tx + i * 7, ty * 3) * cols.length)];
      ctx.fillStyle = c; for (let j = 0; j < 5; j++) { const a = j * 1.2566; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.75, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#ffc94d'; ctx.beginPath(); ctx.arc(x, cy, r * 0.55, 0, 7); ctx.fill();
    }
  }
}
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
// とんでいる ハチ（ちいさい）
export function drawBee(ctx, x, y, t, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const f = Math.sin(t * 40) * 0.5 + 0.5;
  ctx.fillStyle = 'rgba(230,245,255,.9)'; ctx.beginPath(); ctx.ellipse(-1, -4 - f, 2.6, 3.6 + f, -0.4, 0, 7); ctx.ellipse(2, -4 - f, 2.6, 3.6 + f, 0.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffd34f'; ctx.beginPath(); ctx.ellipse(0, 0, 4.2, 3.2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4a3a3a'; ctx.fillRect(-1.2, -3, 1.4, 6); ctx.fillRect(1.6, -3, 1.2, 6);
  ctx.beginPath(); ctx.arc(-3.2, -0.6, 0.8, 0, 7); ctx.fill();
  ctx.restore();
}

// まちの え（Canvas 2D で その ばで かく。がぞう ファイルは つかわない）
// drawObject は (0,0) が もの の ひだりうえの マス、T が 1マスの おおきさ。たてものは うえに はみだして かく。
import { PART, lookColor } from '../data/parts.js';

const rnd = s => { let v = s >>> 0 || 1; return () => ((v = (v * 1664525 + 1013904223) >>> 0) / 4294967296); };
const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); const c = v => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${c(n >> 16 & 255)},${c(n >> 8 & 255)},${c(n & 255)})`; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function heart(g, x, y, r) { g.beginPath(); g.moveTo(x, y + r); g.bezierCurveTo(x - r * 1.7, y - r * .1, x - r * .75, y - r * 1.35, x, y - r * .35); g.bezierCurveTo(x + r * .75, y - r * 1.35, x + r * 1.7, y - r * .1, x, y + r); g.closePath(); }
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };
function shadow(g, cx, cy, rx, ry) { g.fillStyle = 'rgba(40,70,40,.18)'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
function line(g, c, w) { g.strokeStyle = c; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; }

/* ---------- じめん（1マス） ---------- */
const GROUND = {
  grass: '#a6dc78', road_dirt: '#e2c497', road_stone: '#cfd2da', road_brick: '#e0957a', road_pink: '#f9c6d8', water: '#86cdf2', plaza: '#efe6d6',
};
export function drawGround(g, id, x, y, T, nb) {
  const R = rnd(hash(x, y)), c = GROUND[id] || GROUND.grass;
  g.fillStyle = c; g.fillRect(0, 0, T, T);
  if (id === 'grass') {
    g.fillStyle = (x + y) % 2 ? '#a3d975' : '#a9dd7b'; g.fillRect(0, 0, T, T);
    g.strokeStyle = '#8fc965'; g.lineWidth = T / 24;
    for (let i = 0; i < 3; i++) { const px = R() * T, py = R() * T; g.beginPath(); g.moveTo(px, py); g.lineTo(px - T * .04, py - T * .1); g.moveTo(px, py); g.lineTo(px + T * .05, py - T * .09); g.stroke(); }
    return;
  }
  if (id === 'water') {
    g.fillStyle = '#86cdf2'; g.fillRect(0, 0, T, T);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = T / 20;
    const py = T * (.3 + R() * .4), px = T * (.2 + R() * .3);
    g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + T * .12, py - T * .08, px + T * .24, py); g.stroke();
    // きしべ（となりが みずで ない ところ）
    g.fillStyle = '#c9eafa';
    if (!nb.u) g.fillRect(0, 0, T, T * .1); if (!nb.d) g.fillRect(0, T * .9, T, T * .1);
    if (!nb.l) g.fillRect(0, 0, T * .1, T); if (!nb.r) g.fillRect(T * .9, 0, T * .1, T);
    return;
  }
  // みち：となりが みち で ない へりに ふち
  if (id === 'road_stone' || id === 'plaza') {
    g.strokeStyle = id === 'plaza' ? '#ddd1bb' : '#b3b7c2'; g.lineWidth = T / 28;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { rr(g, i * T / 3 + T * .03 + (j % 2) * T * .06, j * T / 3 + T * .03, T / 3 - T * .08, T / 3 - T * .08, T * .05); g.stroke(); }
  } else if (id === 'road_brick' || id === 'road_pink') {
    g.strokeStyle = id === 'road_pink' ? '#fff' : '#c97a62'; g.lineWidth = T / 28;
    for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(0, j * T / 4); g.lineTo(T, j * T / 4); g.stroke(); for (let i = 0; i < 2; i++) { const xx = (i + (j % 2) * .5) * T / 2; g.beginPath(); g.moveTo(xx, j * T / 4); g.lineTo(xx, (j + 1) * T / 4); g.stroke(); } }
  } else {
    g.fillStyle = shade(c, .93); for (let i = 0; i < 5; i++) { circ(g, R() * T, R() * T, T * .03); g.fill(); }
  }
  g.fillStyle = 'rgba(120,90,50,.18)';
  if (!nb.u) g.fillRect(0, 0, T, T * .07); if (!nb.d) g.fillRect(0, T * .93, T, T * .07);
  if (!nb.l) g.fillRect(0, 0, T * .07, T); if (!nb.r) g.fillRect(T * .93, 0, T * .07, T);
}

/* ---------- おうち ---------- */
function houseBody(g, W, Hh, T, look, opt = {}) {
  const roof = lookColor('roof', look.roof) || '#e8605a', wall = lookColor('wall', look.wall) || '#fff3d9';
  const pad = T * .12, wy = Hh * .28, by = Hh - T * .1;
  shadow(g, W / 2, by + T * .02, W / 2 - pad / 2, T * .16);
  // かべ
  g.fillStyle = wall; line(g, shade(wall.startsWith('#') ? wall : '#ffffff', .7), T / 20);
  g.fillRect(pad, wy, W - pad * 2, by - wy); g.strokeRect(pad, wy, W - pad * 2, by - wy);
  if (look.wall === 'brick') { g.strokeStyle = shade('#d9775f', .8); g.lineWidth = T / 40; for (let y = wy + T * .14, k = 0; y < by; y += T * .14, k++) { g.beginPath(); g.moveTo(pad, y); g.lineTo(W - pad, y); g.stroke(); for (let x = pad + (k % 2) * T * .14; x < W - pad; x += T * .28) { g.beginPath(); g.moveTo(x, y - T * .14); g.lineTo(x, y); g.stroke(); } } }
  if (look.wall === 'wood') { g.strokeStyle = shade('#d9a066', .8); g.lineWidth = T / 40; for (let y = wy + T * .12; y < by; y += T * .12) { g.beginPath(); g.moveTo(pad, y); g.lineTo(W - pad, y); g.stroke(); } }
  // えんとつ
  if (opt.chimney) { g.fillStyle = '#c96d5a'; g.fillRect(W * .7, -T * .55, T * .22, T * .5); g.strokeStyle = '#9c4f40'; g.strokeRect(W * .7, -T * .55, T * .22, T * .5); }
  // やね
  g.fillStyle = roof; line(g, shade(roof, .72), T / 16);
  g.beginPath(); g.moveTo(-T * .04, wy + T * .14); g.lineTo(W * .5 - (opt.flat ? W * .3 : 0), -T * .7); if (opt.flat) g.lineTo(W * .8, -T * .7); g.lineTo(W + T * .04, wy + T * .14); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = shade(roof, .85); g.lineWidth = T / 30;
  for (let k = 1; k < 4; k++) { const yy = -T * .7 + (wy + T * .84) * k / 4, s = (yy + T * .7) / (wy + T * .84); g.beginPath(); g.moveTo(W * .5 - s * W * .52, yy); g.lineTo(W * .5 + s * W * .52, yy); g.stroke(); }
  // ドア
  const dw = T * .42, dh = T * .6, dx = W / 2 - dw / 2, dy = by - dh;
  g.fillStyle = '#a86e45'; line(g, '#7a4b2c', T / 24);
  if (look.door === 'round') { g.beginPath(); g.moveTo(dx, by); g.lineTo(dx, dy + dw / 2); g.arc(W / 2, dy + dw / 2, dw / 2, Math.PI, 0); g.lineTo(dx + dw, by); g.closePath(); g.fill(); g.stroke(); }
  else if (look.door === 'heart') { g.fillStyle = '#ff8fb8'; line(g, '#e0608f', T / 24); g.fillRect(dx, dy, dw, dh); g.strokeRect(dx, dy, dw, dh); g.fillStyle = '#fff'; heart(g, W / 2, dy + dh * .35, dw * .22); g.fill(); }
  else { g.fillRect(dx, dy, dw, dh); g.strokeRect(dx, dy, dw, dh); }
  g.fillStyle = '#ffd34f'; circ(g, dx + dw * .78, dy + dh * .55, T * .035); g.fill();
  // まど
  const wins = W > T * 2.5 ? [W * .2, W * .8] : [W * .24, W * .76], wy2 = wy + (by - wy) * .38;
  for (const cx of wins) {
    const s = T * .3;
    g.fillStyle = '#bfe6ff'; line(g, '#ffffff', T / 18);
    if (look.window === 'round') { circ(g, cx, wy2, s / 2); g.fill(); g.stroke(); }
    else if (look.window === 'heart') { heart(g, cx, wy2, s * .42); g.fill(); g.stroke(); }
    else { g.fillRect(cx - s / 2, wy2 - s / 2, s, s); g.strokeRect(cx - s / 2, wy2 - s / 2, s, s); g.beginPath(); g.moveTo(cx, wy2 - s / 2); g.lineTo(cx, wy2 + s / 2); g.stroke(); }
  }
}

function tree(g, T, kind, seed) {
  const R = rnd(seed), cx = T / 2;
  shadow(g, cx, T * .85, T * .32, T * .1);
  g.fillStyle = '#a06a3e'; g.fillRect(cx - T * .07, T * .4, T * .14, T * .46);
  if (kind === 'pine') {
    g.fillStyle = '#3f9a5b'; line(g, '#2c7a44', T / 24);
    for (let k = 0; k < 3; k++) { const y = T * (.45 - k * .28), w = T * (.42 - k * .09); g.beginPath(); g.moveTo(cx - w, y + T * .12); g.lineTo(cx, y - T * .3); g.lineTo(cx + w, y + T * .12); g.closePath(); g.fill(); g.stroke(); }
    return;
  }
  const col = { basic: '#62b85a', round: '#7acb5f', sakura: '#ffc3dc', apple: '#5fb35a' }[kind] || '#62b85a';
  g.fillStyle = col; line(g, shade(col.startsWith('#') ? col : '#62b85a', .78), T / 22);
  const r = kind === 'round' ? T * .4 : T * .3;
  if (kind === 'round') { circ(g, cx, T * .12, r); g.fill(); g.stroke(); }
  else { [[0, -.12], [-.2, .08], [.2, .08], [0, .16]].forEach(([dx, dy]) => { circ(g, cx + dx * T, T * .22 + dy * T, r); g.fill(); g.stroke(); }); [[0, -.12], [-.2, .08], [.2, .08], [0, .16]].forEach(([dx, dy]) => { circ(g, cx + dx * T, T * .22 + dy * T, r - T / 40); g.fill(); }); }
  if (kind === 'sakura') { g.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { circ(g, cx + (R() - .5) * T * .7, T * (.05 + R() * .4), T * .035); g.fill(); } }
  if (kind === 'apple') { g.fillStyle = '#ef4f4f'; for (let i = 0; i < 5; i++) { circ(g, cx + (R() - .5) * T * .6, T * (.05 + R() * .38), T * .05); g.fill(); } }
}
function flower(g, T, col, seed, tulip) {
  const R = rnd(seed);
  for (let i = 0; i < 4; i++) {
    const x = T * (.2 + R() * .6), y = T * (.3 + R() * .5);
    g.strokeStyle = '#4fae4a'; g.lineWidth = T / 28; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + T * .16); g.stroke();
    if (tulip) { g.fillStyle = col; g.beginPath(); g.moveTo(x - T * .07, y - T * .06); g.lineTo(x - T * .07, y + T * .04); g.quadraticCurveTo(x, y + T * .09, x + T * .07, y + T * .04); g.lineTo(x + T * .07, y - T * .06); g.lineTo(x + T * .035, y - T * .02); g.lineTo(x, y - T * .07); g.lineTo(x - T * .035, y - T * .02); g.closePath(); g.fill(); continue; }
    g.fillStyle = col; for (let k = 0; k < 5; k++) { const a = k * 1.2566; circ(g, x + Math.cos(a) * T * .055, y + Math.sin(a) * T * .055, T * .05); g.fill(); }
    g.fillStyle = col === '#ffd34f' ? '#f08a2c' : '#ffd34f'; circ(g, x, y, T * .035); g.fill();
  }
}

/* ---------- もの ---------- */
export function drawObject(g, o, T, t) {
  const p = PART[o.type]; if (!p) return;
  const [w, h] = p.size && p.rotate && (o.r & 1) ? [p.size[1], p.size[0]] : (p.size || [1, 1]);
  const Wd = w * T, Hd = h * T, seed = hash(o.x || 0, o.y || 0);
  const look = { ...(p.look || {}), ...(o.look || {}) };
  switch (o.type) {
    case 'house_basic': houseBody(g, Wd, Hd, T, look); break;
    case 'house_wood': houseBody(g, Wd, Hd, T, look, { chimney: true }); break;
    case 'house_brick': houseBody(g, Wd, Hd, T, look, { chimney: true }); break;
    case 'house_cake': {
      houseBody(g, Wd, Hd, T, look);
      g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { circ(g, Wd * (.1 + i * .16), Hd * .3, T * .1); g.fill(); }
      g.fillStyle = '#ff4d6d'; circ(g, Wd / 2, -T * .78, T * .14); g.fill(); break;
    }
    case 'house_castle': {
      houseBody(g, Wd, Hd, T, look, { flat: true });
      const roof = lookColor('roof', look.roof) || '#9b7be0';
      for (const cx of [T * .25, Wd - T * .25]) { g.fillStyle = '#fff'; line(g, '#c8bfe0', T / 20); g.fillRect(cx - T * .25, -T * .4, T * .5, Hd * .9); g.strokeRect(cx - T * .25, -T * .4, T * .5, Hd * .9); g.fillStyle = roof; g.beginPath(); g.moveTo(cx - T * .32, -T * .4); g.lineTo(cx, -T * 1.2); g.lineTo(cx + T * .32, -T * .4); g.closePath(); g.fill(); g.stroke(); }
      g.fillStyle = '#ff7eb0'; g.beginPath(); g.moveTo(Wd / 2, -T * .7); g.lineTo(Wd / 2, -T * 1.25); g.lineTo(Wd / 2 + T * .3, -T * 1.1); g.lineTo(Wd / 2, -T * .98); g.fill(); break;
    }
    case 'moko_house': {
      houseBody(g, Wd, Hd, T, look, { chimney: true });
      g.fillStyle = '#ff6fae'; heart(g, Wd / 2, -T * .2, T * .2); g.fill();
      rr(g, Wd / 2 - T * .5, Hd - T * .32, T, T * .26, T * .08); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#ff8fb8'; g.lineWidth = T / 30; g.stroke();
      g.fillStyle = '#e0608f'; g.font = `800 ${T * .17}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('モコ', Wd / 2, Hd - T * .19);
      break;
    }
    case 'town_shop': {
      shadow(g, Wd / 2, Hd - T * .08, Wd / 2 - T * .1, T * .16);
      g.fillStyle = '#fff6e6'; line(g, '#e3c79f', T / 20); g.fillRect(T * .12, -T * .3, Wd - T * .24, Hd + T * .2 - T * .1); g.strokeRect(T * .12, -T * .3, Wd - T * .24, Hd + T * .2 - T * .1);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#fff' : '#ff8fb8'; g.beginPath(); const x0 = i * Wd / 6; g.moveTo(x0, -T * .4); g.lineTo(x0 + Wd / 6, -T * .4); g.lineTo(x0 + Wd / 6, T * .2); g.quadraticCurveTo(x0 + Wd / 12, T * .38, x0, T * .2); g.closePath(); g.fill(); }
      g.strokeStyle = '#e0608f'; g.lineWidth = T / 24; g.strokeRect(0, -T * .4, Wd, T * .6);
      rr(g, Wd / 2 - T * .75, -T * 1.0, T * 1.5, T * .5, T * .12); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#ff8fb8'; g.lineWidth = T / 24; g.stroke();
      g.fillStyle = '#e0608f'; g.font = `800 ${T * .22}px "M PLUS Rounded 1c",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('おみせ', Wd / 2, -T * .75);
      g.fillStyle = '#bfe6ff'; g.strokeStyle = '#fff'; g.lineWidth = T / 18; [[T * .3, T * .55], [Wd - T * 1.0, T * .55]].forEach(([x, y]) => { g.fillRect(x, y, T * .7, T * .55); g.strokeRect(x, y, T * .7, T * .55); });
      g.fillStyle = '#ffd34f'; for (let i = 0; i < 3; i++) { circ(g, T * .45 + i * T * .2, T * 1.0, T * .07); g.fill(); }
      g.fillStyle = '#a86e45'; g.fillRect(Wd / 2 - T * .25, Hd - T * .78, T * .5, T * .7); break;
    }
    case 'school': {
      houseBody(g, Wd, Hd, T, { roof: 'red', wall: 'white', door: 'basic', window: 'square' }, { flat: true });
      g.fillStyle = '#fff'; circ(g, Wd / 2, -T * .15, T * .26); g.fill(); g.strokeStyle = '#555'; g.lineWidth = T / 30; g.stroke();
      g.beginPath(); g.moveTo(Wd / 2, -T * .15); g.lineTo(Wd / 2, -T * .32); g.moveTo(Wd / 2, -T * .15); g.lineTo(Wd / 2 + T * .12, -T * .12); g.stroke();
      g.strokeStyle = '#888'; g.beginPath(); g.moveTo(Wd - T * .3, -T * .3); g.lineTo(Wd - T * .3, -T * 1.4); g.stroke();
      g.fillStyle = '#ff6f6f'; g.fillRect(Wd - T * .3, -T * 1.4, T * .45, T * .3); break;
    }
    case 'cafe': {
      houseBody(g, Wd, Hd, T, { roof: 'pink', wall: 'cream', door: 'round', window: 'round' });
      g.fillStyle = '#fff'; rr(g, Wd / 2 - T * .45, -T * 1.05, T * .9, T * .42, T * .1); g.fill();
      g.fillStyle = '#ffc2d6'; g.fillRect(Wd / 2 - T * .3, -T * .98, T * .6, T * .26); g.fillStyle = '#ff4d6d'; circ(g, Wd / 2, -T * 1.05, T * .08); g.fill(); break;
    }
    case 'tree_basic': tree(g, T, 'basic', seed); break;
    case 'tree_round': tree(g, T, 'round', seed); break;
    case 'tree_pine': tree(g, T, 'pine', seed); break;
    case 'tree_sakura': tree(g, T, 'sakura', seed); break;
    case 'tree_apple': tree(g, T, 'apple', seed); break;
    case 'bush': shadow(g, T / 2, T * .8, T * .35, T * .1); g.fillStyle = '#5bb352'; line(g, '#41913b', T / 24); [[.3, .55], [.7, .55], [.5, .42]].forEach(([x, y]) => { circ(g, x * T, y * T, T * .24); g.fill(); g.stroke(); }); [[.3, .55], [.7, .55], [.5, .42]].forEach(([x, y]) => { circ(g, x * T, y * T, T * .22); g.fill(); }); break;
    case 'tuft': { const R = rnd(seed); g.strokeStyle = '#5fae49'; g.lineWidth = T / 18; for (let k = 0; k < 3; k++) { const x = T * (.25 + R() * .5), y = T * (.5 + R() * .3); for (const d of [-1, 0, 1]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + d * T * .04, y - T * .1, x + d * T * .1, y - T * .2); g.stroke(); } } break; }
    case 'flower_red': flower(g, T, '#ff6b7d', seed); break;
    case 'flower_yellow': flower(g, T, '#ffd34f', seed); break;
    case 'flower_pink': flower(g, T, '#ff9fd0', seed); break;
    case 'flower_tulip': flower(g, T, '#ff7aa8', seed, true); break;
    case 'flower_sun': {
      for (const [x, y] of [[.32, .3], [.68, .42]]) { g.strokeStyle = '#4fae4a'; g.lineWidth = T / 20; g.beginPath(); g.moveTo(x * T, y * T); g.lineTo(x * T, T * .9); g.stroke(); g.fillStyle = '#ffd34f'; for (let k = 0; k < 10; k++) { const a = k * .628; circ(g, x * T + Math.cos(a) * T * .1, y * T + Math.sin(a) * T * .1, T * .06); g.fill(); } g.fillStyle = '#9a6234'; circ(g, x * T, y * T, T * .07); g.fill(); }
      break;
    }
    case 'rock': shadow(g, T / 2, T * .78, T * .32, T * .1); g.fillStyle = '#b9bec8'; line(g, '#8d939f', T / 22); g.beginPath(); g.ellipse(T / 2, T * .6, T * .3, T * .22, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#d6dae2'; circ(g, T * .42, T * .52, T * .07); g.fill(); break;
    case 'bridge': {
      const v = o.r & 1; g.save(); if (v) { g.translate(T, 0); g.rotate(Math.PI / 2); }
      g.fillStyle = '#c98f55'; g.fillRect(0, T * .18, T, T * .64); g.strokeStyle = '#8f5e33'; g.lineWidth = T / 30;
      for (let i = 0; i <= 5; i++) { g.beginPath(); g.moveTo(i * T / 5, T * .18); g.lineTo(i * T / 5, T * .82); g.stroke(); }
      g.fillStyle = '#a86e45'; g.fillRect(0, T * .12, T, T * .07); g.fillRect(0, T * .81, T, T * .07); g.restore(); break;
    }
    case 'fence': {
      const v = o.r & 1; g.fillStyle = '#fffaf0'; line(g, '#cdbb9b', T / 30);
      if (!v) { for (const x of [.1, .5, .9]) { g.fillRect(x * T - T * .05, T * .35, T * .1, T * .45); g.strokeRect(x * T - T * .05, T * .35, T * .1, T * .45); } g.fillRect(0, T * .45, T, T * .08); g.fillRect(0, T * .63, T, T * .08); }
      else { for (const y of [.1, .5, .9]) { g.fillRect(T * .45, y * T - T * .3, T * .1, T * .45); g.strokeRect(T * .45, y * T - T * .3, T * .1, T * .45); } g.fillRect(T * .47, 0, T * .06, T); }
      break;
    }
    case 'flowerbed': { g.fillStyle = '#9a6a45'; line(g, '#744c2e', T / 22); rr(g, T * .06, T * .4, Wd - T * .12, T * .5, T * .1); g.fill(); g.stroke(); g.fillStyle = '#7a5232'; g.fillRect(T * .14, T * .46, Wd - T * .28, T * .14); const cs = ['#ff6b7d', '#ffd34f', '#ff9fd0', '#b48cff']; for (let i = 0; i < 6; i++) { g.fillStyle = cs[i % 4]; const x = T * (.25 + i * .3); for (let k = 0; k < 5; k++) { const a = k * 1.2566; circ(g, x + Math.cos(a) * T * .06, T * .4 + Math.sin(a) * T * .06, T * .055); g.fill(); } g.fillStyle = '#fff6a8'; circ(g, x, T * .4, T * .035); g.fill(); } break; }
    case 'bench': { shadow(g, Wd / 2, T * .85, Wd * .42, T * .1); g.fillStyle = '#c98f55'; line(g, '#8f5e33', T / 26); g.fillRect(T * .15, T * .2, Wd - T * .3, T * .2); g.strokeRect(T * .15, T * .2, Wd - T * .3, T * .2); g.fillRect(T * .1, T * .5, Wd - T * .2, T * .18); g.strokeRect(T * .1, T * .5, Wd - T * .2, T * .18); g.fillStyle = '#6b7380'; for (const x of [T * .25, Wd - T * .3]) g.fillRect(x, T * .68, T * .06, T * .2); break; }
    case 'mailbox': g.fillStyle = '#8a8f99'; g.fillRect(T * .46, T * .4, T * .08, T * .45); g.fillStyle = '#ff6b6b'; line(g, '#d64545', T / 24); rr(g, T * .26, T * .12, T * .48, T * .32, T * .14); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.fillRect(T * .36, T * .24, T * .28, T * .05); break;
    case 'pot': g.fillStyle = '#d9825f'; line(g, '#b35f40', T / 24); g.beginPath(); g.moveTo(T * .28, T * .5); g.lineTo(T * .72, T * .5); g.lineTo(T * .64, T * .88); g.lineTo(T * .36, T * .88); g.closePath(); g.fill(); g.stroke(); flower(g, T * .9, '#ff9fd0', seed); break;
    case 'lamp': shadow(g, T / 2, T * .86, T * .18, T * .06); g.fillStyle = '#4d5d7a'; g.fillRect(T * .46, -T * .3, T * .08, T * 1.15); g.fillStyle = '#fff3a8'; line(g, '#4d5d7a', T / 24); circ(g, T / 2, -T * .38, T * .16); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,240,160,.35)'; circ(g, T / 2, -T * .38, T * .3); g.fill(); break;
    case 'sandbox': g.fillStyle = '#c98f55'; rr(g, T * .08, T * .08, Wd - T * .16, Hd - T * .16, T * .14); g.fill(); g.fillStyle = '#f5dc9f'; rr(g, T * .2, T * .2, Wd - T * .4, Hd - T * .4, T * .1); g.fill(); g.fillStyle = '#ff6b6b'; g.beginPath(); g.moveTo(T * .7, T * 1.1); g.lineTo(T * 1.0, T * .7); g.lineTo(T * 1.3, T * 1.1); g.closePath(); g.fill(); g.fillStyle = '#5a8fe0'; g.fillRect(T * 1.2, T * 1.15, T * .3, T * .2); break;
    case 'swing': { shadow(g, Wd / 2, T * .9, Wd * .45, T * .1); line(g, '#e8605a', T / 12); g.beginPath(); g.moveTo(T * .15, T * .9); g.lineTo(T * .3, -T * .5); g.lineTo(Wd - T * .3, -T * .5); g.lineTo(Wd - T * .15, T * .9); g.stroke(); line(g, '#888', T / 40); for (const x of [Wd * .33, Wd * .67]) { g.beginPath(); g.moveTo(x - T * .12, -T * .5); g.lineTo(x - T * .12, T * .5); g.moveTo(x + T * .12, -T * .5); g.lineTo(x + T * .12, T * .5); g.stroke(); g.fillStyle = '#ffd34f'; g.fillRect(x - T * .18, T * .48, T * .36, T * .08); } break; }
    case 'slide': { shadow(g, Wd / 2, Hd - T * .2, Wd * .45, T * .14); g.fillStyle = '#5a8fe0'; g.fillRect(T * .35, -T * .2, T * .5, Hd - T * .1); line(g, '#3d6fbd', T / 22); g.strokeRect(T * .35, -T * .2, T * .5, Hd - T * .1); for (let y = 0; y < Hd - T * .4; y += T * .25) { g.beginPath(); g.moveTo(T * .35, y); g.lineTo(T * .85, y); g.stroke(); } g.fillStyle = '#ff8fb8'; line(g, '#e0608f', T / 22); g.beginPath(); g.moveTo(T * .85, -T * .2); g.quadraticCurveTo(Wd - T * .2, T * .6, Wd - T * .1, Hd - T * .2); g.lineTo(Wd - T * .45, Hd - T * .2); g.quadraticCurveTo(Wd - T * .6, T * .8, T * .85, T * .2); g.closePath(); g.fill(); g.stroke(); break; }
    case 'fountain': { shadow(g, Wd / 2, Hd - T * .25, Wd * .46, T * .2); g.fillStyle = '#d6dae2'; line(g, '#a4aab6', T / 18); g.beginPath(); g.ellipse(Wd / 2, Hd * .62, Wd * .44, Hd * .3, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#86cdf2'; g.beginPath(); g.ellipse(Wd / 2, Hd * .6, Wd * .36, Hd * .22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d6dae2'; g.fillRect(Wd / 2 - T * .1, Hd * .2, T * .2, Hd * .4); g.strokeRect(Wd / 2 - T * .1, Hd * .2, T * .2, Hd * .4); const tt = (t || 0) / 300; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = T / 16; for (const d of [-1, 1]) { g.beginPath(); g.moveTo(Wd / 2, Hd * .2); g.quadraticCurveTo(Wd / 2 + d * T * .5, -T * .3 + Math.sin(tt) * T * .05, Wd / 2 + d * T * .7, Hd * .55); g.stroke(); } g.fillStyle = '#bfe6ff'; circ(g, Wd / 2, Hd * .18, T * .14); g.fill(); break; }
    case 'rainbow': { const cs = ['#ffadad', '#ffd29a', '#fff0a0', '#bfeab0', '#addcff', '#d4c2ff']; cs.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = T * .1; g.beginPath(); g.arc(Wd / 2, T * .9, Wd * .46 - i * T * .1, Math.PI, 0); g.stroke(); }); g.fillStyle = '#fff'; [[T * .2, T * .85], [Wd - T * .2, T * .85]].forEach(([x, y]) => { circ(g, x, y, T * .18); g.fill(); circ(g, x + T * .14, y + T * .04, T * .13); g.fill(); }); break; }
    default: g.fillStyle = '#ccc'; g.fillRect(0, 0, Wd, Hd);
  }
}

// パレット・おみせ よう の ちいさな え（canvas に おさまる ように）
export function drawIcon(cv, id, look) {
  const g = cv.getContext('2d'), S = cv.width, p = PART[id];
  g.clearRect(0, 0, S, S);
  if (!p) return;
  if (p.layer === 'ground') {
    const T = S * .7; g.save(); g.translate(S * .15, S * .15); rr(g, 0, 0, T, T, T * .14); g.clip(); drawGround(g, id, 3, 5, T, {}); g.restore();
    g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 2; rr(g, S * .15, S * .15, S * .7, S * .7, S * .1); g.stroke(); return;
  }
  if (p.cat === 'look') {
    const T = S * .4;
    g.save(); g.translate(S * .1, S * .42);
    const lk = { roof: 'red', wall: 'cream', door: 'basic', window: 'square' }; lk[p.kind] = id.replace(p.kind + '_', '');
    houseBody(g, T * 2, T * 2 * .9, T, lk); g.restore(); return;
  }
  const [w, h] = p.size || [1, 1], tall = /house|school|cafe|moko|shop/.test(id) ? 1.3 : (id === 'lamp' || id === 'swing' || id.startsWith('tree')) ? .6 : .2;
  const T = Math.min(S * .86 / w, S * .86 / (h + tall));
  g.save(); g.translate((S - w * T) / 2, (S - (h + tall) * T) / 2 + tall * T);
  drawObject(g, { type: id, x: 3, y: 4, r: 0, look }, T, 0); g.restore();
}

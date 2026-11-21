// え（その2）：F〜Z の エリアの もの・ことばの え。すべて コードで かく オリジナル
import { TS, WORD_ART, starPath } from './art.js';

const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
const INK = '#4a3a3a';
const eyes = (c, x1, x2, y, r = 3) => { c.fillStyle = INK; [x1, x2].forEach(x => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); c.fillStyle = '#fff'; [x1, x2].forEach(x => { c.beginPath(); c.arc(x + r * 0.35, y - r * 0.35, r * 0.35, 0, 7); c.fill(); }); };

/* ---------- ことばの え（0〜100 の しかく）---------- */
Object.assign(WORD_ART, {
  sun: c => {
    c.strokeStyle = '#ffb020'; c.lineWidth = 6; c.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(50 + Math.cos(a) * 32, 50 + Math.sin(a) * 32); c.lineTo(50 + Math.cos(a) * 44, 50 + Math.sin(a) * 44); c.stroke(); }
    c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(50, 50, 26, 0, 7); c.fill(); c.strokeStyle = '#f0a81c'; c.lineWidth = 3; c.stroke();
    eyes(c, 41, 59, 46, 3.5); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(50, 54, 8, 0.3, Math.PI - 0.3); c.stroke();
    c.fillStyle = 'rgba(255,120,120,.5)'; [34, 66].forEach(x => { c.beginPath(); c.arc(x, 56, 4, 0, 7); c.fill(); });
  },
  dog: c => {
    c.fillStyle = '#b98a55'; [[24, 46, -0.4], [76, 46, 0.4]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(x, y, 11, 22, r, 0, 7); c.fill(); });
    c.fillStyle = '#f0cf9c'; c.beginPath(); c.arc(50, 52, 30, 0, 7); c.fill(); c.strokeStyle = '#c49a5f'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#fff4e2'; c.beginPath(); c.ellipse(50, 64, 15, 11, 0, 0, 7); c.fill();
    eyes(c, 39, 61, 48); c.fillStyle = INK; c.beginPath(); c.ellipse(50, 60, 5, 4, 0, 0, 7); c.fill();
    c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(50, 64); c.quadraticCurveTo(44, 72, 40, 68); c.moveTo(50, 64); c.quadraticCurveTo(56, 72, 60, 68); c.stroke();
    c.fillStyle = '#ff7a9a'; c.beginPath(); c.ellipse(50, 74, 4, 5, 0, 0, 7); c.fill();
  },
  bone: c => {
    c.save(); c.translate(50, 50); c.rotate(-0.5);
    c.fillStyle = '#fffaf0'; c.strokeStyle = '#c9b48a'; c.lineWidth = 3;
    c.beginPath(); c.rect(-26, -8, 52, 16); [[-28, -9], [-28, 9], [28, -9], [28, 9]].forEach(([x, y]) => { c.moveTo(x + 11, y); c.arc(x, y, 11, 0, 7); }); c.fill();
    [[-28, -9], [-28, 9], [28, -9], [28, 9]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 11, 0, 7); c.stroke(); }); c.fillStyle = '#fffaf0'; c.fillRect(-26, -7, 52, 14);
    c.restore();
  },
  door: c => {
    c.fillStyle = '#c98f55'; c.beginPath(); c.moveTo(24, 92); c.lineTo(24, 34); c.arc(50, 34, 26, Math.PI, 0); c.lineTo(76, 92); c.closePath(); c.fill();
    c.strokeStyle = '#9c6a3a'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = '#a8763f'; c.lineWidth = 2; [38, 50, 62].forEach(x => { c.beginPath(); c.moveTo(x, 20); c.lineTo(x, 90); c.stroke(); });
    c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(66, 58, 4.5, 0, 7); c.fill();
    c.fillStyle = '#bfe6ff'; rr(c, 42, 30, 16, 14, 4); c.fill();
  },
  basket: c => {
    c.strokeStyle = '#a8763f'; c.lineWidth = 6; c.beginPath(); c.arc(50, 48, 26, Math.PI, 0); c.stroke();
    c.fillStyle = '#d9a864'; c.beginPath(); c.moveTo(16, 48); c.lineTo(84, 48); c.lineTo(74, 88); c.lineTo(26, 88); c.closePath(); c.fill();
    c.strokeStyle = '#a8763f'; c.lineWidth = 2.5; c.stroke();
    for (let y = 58; y < 88; y += 10) { c.beginPath(); c.moveTo(18 + (y - 48) * 0.25, y); c.lineTo(82 - (y - 48) * 0.25, y); c.stroke(); }
    for (let x = 30; x < 80; x += 10) { c.beginPath(); c.moveTo(x, 50); c.lineTo(x + (50 - x) * 0.2, 87); c.stroke(); }
    c.fillStyle = '#ff6a6a'; c.fillRect(14, 44, 72, 8);
  },
  cat: c => {
    c.fillStyle = '#cfd3dd'; c.strokeStyle = '#99a0b0'; c.lineWidth = 3;
    [[24, 40, 30, 14, 40, 26], [76, 40, 70, 14, 60, 26]].forEach(([a, b, d, e, f, g]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.closePath(); c.fill(); c.stroke(); });
    c.beginPath(); c.arc(50, 54, 30, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#ffc2d1'; [[29, 28], [71, 28]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y + 4, 4, 0, 7); c.fill(); });
    eyes(c, 39, 61, 50); c.fillStyle = '#ff9fb3'; c.beginPath(); c.moveTo(46, 60); c.lineTo(54, 60); c.lineTo(50, 65); c.fill();
    c.strokeStyle = '#8d93a3'; c.lineWidth = 1.6; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(50 + s * 10, 62); c.lineTo(50 + s * 28, 58); c.moveTo(50 + s * 10, 65); c.lineTo(50 + s * 28, 68); c.stroke(); });
  },
  milk: c => {
    c.fillStyle = '#ffffff'; c.strokeStyle = '#9ab8d8'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(34, 20); c.lineTo(66, 20); c.lineTo(66, 30); c.lineTo(74, 44); c.lineTo(74, 90); c.lineTo(26, 90); c.lineTo(26, 44); c.lineTo(34, 30); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#7ac8ff'; c.fillRect(26, 52, 48, 24);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(50, 64, 8, 0, 7); c.fill(); c.fillStyle = '#7ac8ff'; c.beginPath(); c.arc(50, 64, 4, 0, 7); c.fill();
    c.fillStyle = '#ff8fb1'; c.fillRect(32, 14, 36, 8);
  },
  fish: c => {
    c.fillStyle = '#ff9e5a'; c.strokeStyle = '#d9773a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(70, 50); c.lineTo(92, 32); c.lineTo(92, 68); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(46, 50, 30, 20, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#ffc89a'; c.beginPath(); c.ellipse(44, 56, 18, 8, 0, 0, 7); c.fill();
    eyes(c, 30, 30, 45, 3.5); c.strokeStyle = '#d9773a'; c.beginPath(); c.arc(52, 50, 10, -1, 1); c.stroke();
  },
  bird: c => {
    c.fillStyle = '#7ac8ff'; c.strokeStyle = '#4a98d0'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(80, 52); c.lineTo(94, 44); c.lineTo(92, 62); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(52, 56, 30, 24, 0, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.arc(32, 40, 18, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#5ab0ec'; c.beginPath(); c.ellipse(58, 56, 16, 10, -0.4, 0, 7); c.fill();
    c.fillStyle = '#e8f6ff'; c.beginPath(); c.ellipse(46, 66, 14, 10, 0, 0, 7); c.fill();
    eyes(c, 28, 28, 37, 3.5); c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(14, 40); c.lineTo(4, 44); c.lineTo(15, 47); c.fill();
  },
  tree: c => {
    c.fillStyle = '#9a6a43'; rr(c, 42, 58, 16, 34, 4); c.fill();
    c.fillStyle = '#3f9c49'; c.beginPath(); c.arc(50, 42, 32, 0, 7); c.fill();
    c.fillStyle = '#58b85a'; c.beginPath(); c.arc(34, 44, 18, 0, 7); c.arc(66, 44, 18, 0, 7); c.arc(50, 28, 20, 0, 7); c.fill();
    c.fillStyle = '#86d675'; c.beginPath(); c.arc(42, 22, 7, 0, 7); c.fill();
  },
  red: c => paintBlob(c, '#ff4f5e', '#d92a3c'),
  blue: c => paintBlob(c, '#4f8fff', '#2a5fd9'),
});
function paintBlob(c, col, dark) {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 2, r = 30 + (i % 2 ? 5 : -3) + Math.sin(i * 3) * 3; c[i ? 'lineTo' : 'moveTo'](50 + Math.cos(a) * r, 46 + Math.sin(a) * r); }
  c.closePath(); c.fill(); c.strokeStyle = dark; c.lineWidth = 3; c.stroke();
  c.beginPath(); c.moveTo(60, 72); c.quadraticCurveTo(64, 90, 58, 92); c.quadraticCurveTo(54, 88, 58, 72); c.fill();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(38, 34, 8, 12, 0.5, 0, 7); c.fill();
}

/* ---------- もの ---------- */
// もじの もん（たて 3マス の みちを ふさぐ）。letters：もじ、open：ひらいた
export function drawLetterGate(c, letters, open, t) {
  const pillar = y => { c.fillStyle = 'rgba(40,60,40,.2)'; c.beginPath(); c.ellipse(16, y + 30, 13, 3, 0, 0, 7); c.fill(); c.fillStyle = '#b9bfc9'; rr(c, 6, y - 6, 20, 36, 4); c.fill(); c.fillStyle = '#d7dde4'; rr(c, 4, y - 10, 24, 8, 3); c.fill(); c.strokeStyle = '#8f97a3'; c.lineWidth = 1.2; c.strokeRect(9, y + 2, 14, 22); };
  pillar(0); pillar(64);
  if (open) { c.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3; c.fillStyle = '#fff6a0'; starPath(c, 16, 50, 6, 2.6); c.fill(); c.globalAlpha = 1; return; }
  c.fillStyle = '#a7aeb9'; rr(c, 3, 28, 26, 40, 5); c.fill(); c.strokeStyle = '#7f8794'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#fff3a0'; c.font = '800 7.5px "M PLUS Rounded 1c", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const L = letters.join(''); c.globalAlpha = 0.7 + Math.sin(t * 2) * 0.3;
  c.fillText(L.slice(0, 3), 16, 41); c.fillText(L.slice(3), 16, 53); c.globalAlpha = 1;
}
// おしろの もん（3×3 マス）
export function drawCastle(c, open, t) {
  c.fillStyle = 'rgba(40,60,40,.2)'; c.fillRect(0, 92, 96, 6);
  const tower = x => { c.fillStyle = '#f3eaff'; rr(c, x, 8, 22, 86, 3); c.fill(); c.strokeStyle = '#c4b0e8'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#b48cff'; c.beginPath(); c.moveTo(x - 4, 10); c.lineTo(x + 11, -22); c.lineTo(x + 26, 10); c.closePath(); c.fill(); c.fillStyle = '#9ad6ff'; rr(c, x + 7, 26, 8, 12, 4); c.fill(); };
  c.fillStyle = '#f8f2ff'; c.fillRect(14, 26, 68, 68); c.strokeStyle = '#c4b0e8'; c.lineWidth = 2; c.strokeRect(14, 26, 68, 68);
  for (let x = 16; x < 82; x += 12) { c.fillStyle = '#f8f2ff'; c.fillRect(x, 18, 8, 9); c.strokeRect(x, 18, 8, 9); }
  tower(0); tower(74);
  c.fillStyle = '#ff8fb8'; c.beginPath(); c.moveTo(48, 0); c.lineTo(48, 18); c.stroke(); c.beginPath(); c.moveTo(48, 0); c.lineTo(62, 5); c.lineTo(48, 10); c.fill();
  if (open) { c.fillStyle = '#fff6c4'; c.beginPath(); c.moveTo(32, 94); c.lineTo(32, 58); c.arc(48, 58, 16, Math.PI, 0); c.lineTo(64, 94); c.fill(); c.globalAlpha = 0.6 + Math.sin(t * 3) * 0.3; c.fillStyle = '#ffffff'; starPath(c, 48, 72, 8, 3.5); c.fill(); c.globalAlpha = 1; }
  else {
    c.fillStyle = '#c98f55'; c.beginPath(); c.moveTo(32, 94); c.lineTo(32, 58); c.arc(48, 58, 16, Math.PI, 0); c.lineTo(64, 94); c.fill(); c.strokeStyle = '#9c6a3a'; c.stroke();
    c.strokeStyle = '#a8763f'; [40, 48, 56].forEach(x => { c.beginPath(); c.moveTo(x, 46); c.lineTo(x, 94); c.stroke(); });
    c.fillStyle = '#ffd34f'; c.font = '800 9px "M PLUS Rounded 1c", sans-serif'; c.textAlign = 'center'; c.fillText('A〜Z', 48, 40);
  }
}
export function drawSunstone(c, t) {
  c.globalAlpha = 0.35 + Math.sin(t * 2) * 0.15; c.fillStyle = '#fff2a0'; c.beginPath(); c.arc(16, 18, 15, 0, 7); c.fill(); c.globalAlpha = 1;
  c.fillStyle = 'rgba(40,60,40,.2)'; c.beginPath(); c.ellipse(16, 27, 11, 3.5, 0, 0, 7); c.fill();
  c.fillStyle = '#f0c870'; c.beginPath(); c.ellipse(16, 19, 11, 8, 0, 0, 7); c.fill(); c.strokeStyle = '#d0a040'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#fff6c4'; c.beginPath(); c.ellipse(13, 16, 4, 2.5, -0.3, 0, 7); c.fill();
}
export function drawMound(c, dug) {
  c.fillStyle = 'rgba(40,60,40,.2)'; c.beginPath(); c.ellipse(16, 27, 12, 3.5, 0, 0, 7); c.fill();
  if (dug) { c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(16, 21, 10, 5, 0, 0, 7); c.fill(); c.fillStyle = '#a8805a'; c.beginPath(); c.ellipse(27, 22, 5, 3, 0, 0, 7); c.ellipse(5, 23, 4, 2.5, 0, 0, 7); c.fill(); return; }
  c.fillStyle = '#a8805a'; c.beginPath(); c.ellipse(16, 20, 12, 8, 0, Math.PI, 0); c.lineTo(28, 22); c.lineTo(4, 22); c.fill();
  c.fillStyle = '#8a6a48'; [[10, 17], [19, 15], [22, 19]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.3, 0, 7); c.fill(); });
  c.save(); c.translate(20, 12); c.rotate(-0.6); c.fillStyle = '#fffaf0'; c.fillRect(-1, -4, 2.5, 6); c.beginPath(); c.arc(-0.3, -4.5, 1.5, 0, 7); c.arc(1.6, -4.5, 1.5, 0, 7); c.fill(); c.restore();
}
// こや（2×2 マス）
export function drawShed(c, open) {
  c.fillStyle = 'rgba(40,60,40,.2)'; c.fillRect(2, 60, 60, 5);
  c.fillStyle = '#e9cfa6'; rr(c, 4, 18, 56, 44, 3); c.fill(); c.strokeStyle = '#b8946a'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = '#d4b488'; for (let y = 26; y < 62; y += 7) { c.beginPath(); c.moveTo(5, y); c.lineTo(59, y); c.stroke(); }
  c.fillStyle = '#7aa0d8'; c.beginPath(); c.moveTo(0, 22); c.lineTo(32, 0); c.lineTo(64, 22); c.closePath(); c.fill();
  if (open) { c.fillStyle = '#5a4030'; rr(c, 22, 34, 20, 28, 3); c.fill(); c.fillStyle = '#c98f55'; c.beginPath(); c.moveTo(42, 34); c.lineTo(50, 37); c.lineTo(50, 63); c.lineTo(42, 62); c.fill(); }
  else { c.fillStyle = '#c98f55'; rr(c, 22, 34, 20, 28, 3); c.fill(); c.strokeStyle = '#9c6a3a'; c.stroke(); c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(37, 49, 2, 0, 7); c.fill(); c.fillStyle = '#8a8a96'; rr(c, 29, 44, 6, 7, 1.5); c.fill(); }
}
export function drawKeyboard(c) {
  c.fillStyle = '#9c6a3a'; c.fillRect(14, 16, 4, 14);
  c.fillStyle = '#e3b57c'; rr(c, 3, 2, 26, 16, 3); c.fill(); c.strokeStyle = '#9c6a3a'; c.lineWidth = 1.5; c.stroke();
  [8, 16, 24].forEach((x, i) => { c.strokeStyle = ['#ffcf4d', '#c0c8d6', '#ffcf4d'][i]; c.lineWidth = 2; c.beginPath(); c.arc(x, 8, 2.2, 0, 7); c.moveTo(x, 10); c.lineTo(x, 15); c.moveTo(x, 13); c.lineTo(x + 2, 13); c.stroke(); });
}
export function drawBasketStand(c) {
  c.fillStyle = 'rgba(40,60,40,.2)'; c.beginPath(); c.ellipse(16, 29, 13, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#c99a6c'; c.fillRect(2, 12, 28, 3); c.fillRect(2, 24, 28, 3); c.fillRect(3, 8, 3, 20); c.fillRect(26, 8, 3, 20);
  [[9, 11], [21, 11], [15, 23]].forEach(([x, y]) => { c.fillStyle = '#d9a864'; c.beginPath(); c.moveTo(x - 5, y - 5); c.lineTo(x + 5, y - 5); c.lineTo(x + 4, y); c.lineTo(x - 4, y); c.fill(); c.strokeStyle = '#a8763f'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y - 5, 4, Math.PI, 0); c.stroke(); });
}
export function drawBowl(c, full) {
  c.fillStyle = 'rgba(40,60,40,.2)'; c.beginPath(); c.ellipse(16, 25, 10, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#ff8fb1'; c.beginPath(); c.ellipse(16, 20, 10, 4, 0, 0, Math.PI); c.lineTo(6, 18); c.fill();
  c.fillStyle = full ? '#ffffff' : '#e8c0cc'; c.beginPath(); c.ellipse(16, 18, 9, 3, 0, 0, 7); c.fill(); c.strokeStyle = '#e0688f'; c.lineWidth = 1.2; c.stroke();
}
// おおきな き（2×2 マス ＋ うえ 1マス）
export function drawBigTree(c, nest, t) {
  c.fillStyle = 'rgba(40,80,40,.22)'; c.beginPath(); c.ellipse(32, 92, 26, 6, 0, 0, 7); c.fill();
  c.fillStyle = '#8a5f3c'; rr(c, 24, 50, 16, 44, 4); c.fill();
  c.fillStyle = '#3f9c49'; c.beginPath(); c.arc(32, 36, 32, 0, 7); c.fill();
  c.fillStyle = '#58b85a'; c.beginPath(); c.arc(16, 38, 18, 0, 7); c.arc(48, 38, 18, 0, 7); c.arc(32, 20, 20, 0, 7); c.fill();
  c.fillStyle = '#86d675'; c.beginPath(); c.arc(24, 14, 6, 0, 7); c.fill();
  if (nest) {
    c.fillStyle = '#a8763f'; c.beginPath(); c.ellipse(44, 40, 10, 5, 0, 0, 7); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(35 + i * 4, 37); c.lineTo(38 + i * 4, 44); c.stroke(); }
    const b = Math.abs(Math.sin(t * 4)) * 2;
    c.fillStyle = '#7ac8ff'; c.beginPath(); c.arc(44, 33 - b, 5, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(42.5, 32 - b, 0.9, 0, 7); c.fill(); c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(39, 33 - b); c.lineTo(36.5, 34 - b); c.lineTo(39, 35 - b); c.fill();
  }
}
export function drawPaint(c, col) {
  const k = col === 'red' ? ['#ff4f5e', '#d92a3c'] : ['#4f8fff', '#2a5fd9'];
  c.fillStyle = 'rgba(40,60,40,.2)'; c.beginPath(); c.ellipse(16, 28, 10, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#d7dde4'; c.beginPath(); c.moveTo(7, 12); c.lineTo(25, 12); c.lineTo(23, 28); c.lineTo(9, 28); c.closePath(); c.fill(); c.strokeStyle = '#8f97a3'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = k[0]; c.beginPath(); c.ellipse(16, 12, 9, 3, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(20, 12); c.quadraticCurveTo(22, 20, 20, 21); c.quadraticCurveTo(18, 20, 18, 12); c.fill();
  c.strokeStyle = '#8f97a3'; c.beginPath(); c.arc(16, 12, 9, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
}

/* ---------- じめん（ひろい ものの マス）---------- */
// ひまわりばたけ：p 0（うつむき）〜1（げんき）
export function drawSunbedTile(c, tx, ty, p) {
  c.fillStyle = '#9a7a55'; c.fillRect(0, 0, TS + 0.6, TS + 0.6);
  c.fillStyle = '#86684a'; c.fillRect(0, 10, TS, 1.5); c.fillRect(0, 22, TS, 1.5);
  for (let i = 0; i < 2; i++) {
    const x = 9 + i * 14 + (hash(tx, ty + i) - 0.5) * 4, base = 30, h = 14 + p * 6;
    const lean = (1 - p) * 7, hx = x + lean, hy = base - h + (1 - p) * 6;
    c.strokeStyle = p > 0.3 ? '#4fae4f' : '#7a8a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x, base - h * 0.6, hx, hy); c.stroke();
    c.fillStyle = p > 0.3 ? '#6fc95f' : '#8a9a5a'; c.beginPath(); c.ellipse(x - 3, base - 6, 3, 1.5, 0.5, 0, 7); c.fill();
    const r = 3 + p * 2.5;
    c.fillStyle = p > 0.3 ? '#ffd34f' : '#c9a850'; for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; c.beginPath(); c.ellipse(hx + Math.cos(a) * r, hy + Math.sin(a) * r, 2, 1.2, a, 0, 7); c.fill(); }
    c.fillStyle = '#8a5a2a'; c.beginPath(); c.arc(hx, hy, r * 0.6, 0, 7); c.fill();
  }
}
// ちいさな いけ：p 0（からから）〜1（みず）
export function drawPondTile(c, tx, ty, p, t, fish) {
  c.fillStyle = '#c9a77a'; c.fillRect(0, 0, TS + 0.6, TS + 0.6);
  c.strokeStyle = '#a8865a'; c.lineWidth = 1;
  for (let i = 0; i < 3; i++) { const x = hash(tx * 3 + i, ty) * TS, y = hash(tx, ty * 3 + i) * TS; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 3); c.lineTo(x + 9, y - 2); c.stroke(); }
  if (p <= 0) return;
  c.globalAlpha = Math.min(1, p * 1.4); c.fillStyle = '#7ccaf3'; c.fillRect(0, 0, TS + 0.6, TS + 0.6);
  c.strokeStyle = '#a6dcfa'; c.lineWidth = 1.5; const y = 12 + Math.sin(t * 2 + tx) * 2; c.beginPath(); c.moveTo(6, y); c.quadraticCurveTo(9, y - 2.5, 12, y); c.stroke();
  c.globalAlpha = 1;
  if (fish && p >= 1 && hash(tx, ty) > 0.35) {
    const fx = 16 + Math.sin(t * 1.5 + tx * 2) * 8, fy = 18 + Math.cos(t + ty) * 3, d = Math.cos(t * 1.5 + tx * 2) > 0 ? 1 : -1;
    c.save(); c.translate(fx, fy); c.scale(d * 0.12, 0.12); c.translate(-50, -50); WORD_ART.fish(c); c.restore();
  }
}
// いろの はなだん：col 'white'|'red'|'blue'、p は いろの つき かた
export function drawColorBedTile(c, tx, ty, col, p) {
  c.fillStyle = '#8f6a48'; c.fillRect(0, 0, TS + 0.6, TS + 0.6);
  c.fillStyle = '#7a5a3c'; c.fillRect(0, 26, TS, 6);
  const tgt = col === 'red' ? [255, 79, 94] : col === 'blue' ? [79, 143, 255] : [255, 255, 255];
  const mixc = `rgb(${Math.round(255 + (tgt[0] - 255) * p)},${Math.round(255 + (tgt[1] - 255) * p)},${Math.round(255 + (tgt[2] - 255) * p)})`;
  for (let i = 0; i < 3; i++) {
    const x = 6 + i * 10 + (hash(tx, ty + i) - 0.5) * 3, y = 12 + (i % 2) * 6;
    c.strokeStyle = '#4fae4f'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, 26); c.lineTo(x, y); c.stroke();
    c.fillStyle = mixc; for (let j = 0; j < 5; j++) { const a = j * 1.2566; c.beginPath(); c.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.4, 0, 7); c.fill(); }
    c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(x, y, 1.5, 0, 7); c.fill();
  }
}

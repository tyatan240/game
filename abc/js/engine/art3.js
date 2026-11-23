// え（その3）：ワールド3「ことばの まち」の ことば・もの。すべて コードで かく オリジナル
import { WORD_ART, TS } from './art.js';

const INK = '#4a3a3a';
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };

// かお（きもち）：mood = happy / sleepy / hungry / sorry / ask / plain
function face(c, mood, x = 50, y = 54, r = 34, col = '#ffd98a') {
  c.fillStyle = col; circle(c, x, y, r); c.fill(); c.strokeStyle = '#e0a84a'; c.lineWidth = 3; c.stroke();
  c.fillStyle = 'rgba(255,120,140,.45)'; circle(c, x - r * 0.55, y + r * 0.2, r * 0.13); c.fill(); circle(c, x + r * 0.55, y + r * 0.2, r * 0.13); c.fill();
  c.strokeStyle = INK; c.fillStyle = INK; c.lineWidth = 3; c.lineCap = 'round';
  const ex = r * 0.36, ey = y - r * 0.12;
  if (mood === 'sleepy') { [-1, 1].forEach(s => { c.beginPath(); c.arc(x + s * ex, ey, 5, 0.2, Math.PI - 0.2); c.stroke(); }); }
  else if (mood === 'happy') { [-1, 1].forEach(s => { c.beginPath(); c.arc(x + s * ex, ey + 3, 6, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }); }
  else { [-1, 1].forEach(s => { circle(c, x + s * ex, ey, 4); c.fill(); }); }
  if (mood === 'happy') { c.fillStyle = '#e05a6a'; c.beginPath(); c.arc(x, y + r * 0.22, r * 0.3, 0, Math.PI); c.closePath(); c.fill(); }
  else if (mood === 'sleepy') { c.beginPath(); c.ellipse(x, y + r * 0.35, 4, 5, 0, 0, Math.PI * 2); c.stroke(); }
  else if (mood === 'hungry') { c.fillStyle = '#e05a6a'; c.beginPath(); c.ellipse(x, y + r * 0.35, 9, 7, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#8fd0ff'; c.beginPath(); c.ellipse(x + 10, y + r * 0.6, 3, 5, 0, 0, Math.PI * 2); c.fill(); }
  else if (mood === 'sorry') { c.beginPath(); c.arc(x, y + r * 0.45, 7, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); [-1, 1].forEach(s => { c.beginPath(); c.moveTo(x + s * (ex + 7), ey - 9); c.lineTo(x + s * (ex - 4), ey - 13); c.stroke(); }); c.fillStyle = '#8fd0ff'; c.beginPath(); c.moveTo(x + r * 0.78, y - r * 0.5); c.quadraticCurveTo(x + r * 0.95, y - r * 0.2, x + r * 0.78, y - r * 0.15); c.quadraticCurveTo(x + r * 0.62, y - r * 0.2, x + r * 0.78, y - r * 0.5); c.fill(); }
  else { c.beginPath(); c.arc(x, y + r * 0.25, 7, 0.3, Math.PI - 0.3); c.stroke(); }
}
// て（ふる）
function hand(c, x, y, rot = 0, col = '#ffd0a8') {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = col; c.strokeStyle = '#d99a6a'; c.lineWidth = 2.5;
  [-12, -4, 4, 12].forEach((fx, i) => { rr(c, fx - 4, -34 + Math.abs(i - 1.5) * 4, 8, 26, 4); c.fill(); c.stroke(); });
  c.save(); c.translate(-16, -2); c.rotate(-0.7); rr(c, -4, -16, 8, 20, 4); c.fill(); c.stroke(); c.restore();
  rr(c, -17, -14, 34, 30, 10); c.fill(); c.stroke();
  c.restore();
}
const waves = (c, x, y, s) => { c.strokeStyle = '#ffb347'; c.lineWidth = 3.5; c.lineCap = 'round'; [0, 1].forEach(k => { c.beginPath(); c.arc(x, y, 10 + k * 8, s > 0 ? -0.9 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.9); c.stroke(); }); };

// かず：おおきな すうじ ＋ その かずの まる
function numArt(n) {
  return c => {
    c.fillStyle = '#fff4d6'; rr(c, 6, 6, 88, 88, 16); c.fill(); c.strokeStyle = '#f0c870'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#e0719a'; c.font = '800 40px "M PLUS Rounded 1c", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 50, 34);
    const cols = n > 5 ? 5 : n, rows = n > 5 ? 2 : 1;
    for (let i = 0; i < n; i++) { const r = Math.floor(i / 5), k = i % 5, cnt = r === 0 ? cols : n - 5; const gx = 50 + (k - (cnt - 1) / 2) * 15, gy = rows === 1 ? 72 : 64 + r * 16; c.fillStyle = ['#ff6b7a', '#ffb347', '#6cc070', '#5fa8f0', '#b085f0'][i % 5]; circle(c, gx, gy, 6); c.fill(); }
  };
}
function apple(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.translate(-50, -50); WORD_ART.apple(c); c.restore(); }
function egg(c, x, y, s = 1) { c.fillStyle = '#fffaf0'; c.strokeStyle = '#d9c8a8'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x, y, 13 * s, 17 * s, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(x - 5 * s, y - 6 * s, 3 * s, 5 * s, 0.4, 0, Math.PI * 2); c.fill(); }
function banana(c, x, y, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#ffd84a'; c.strokeStyle = '#d9a91c'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(0, 26, 28, -8); c.quadraticCurveTo(0, 12, -26, -6); c.fill(); c.stroke();
  c.fillStyle = '#7a5a2a'; c.fillRect(25, -12, 6, 6); c.restore();
}
function balloon(c, x, y, col, s = 1) {
  c.strokeStyle = '#9a8a8a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 13 * s); c.quadraticCurveTo(x + 4, y + 26 * s, x, y + 38 * s); c.stroke();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 10 * s, 13 * s, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(x - 3.5 * s, y - 5 * s, 2.5 * s, 4 * s, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 3, y + 14 * s); c.lineTo(x + 3, y + 14 * s); c.lineTo(x, y + 11 * s); c.fill();
}
const BCOL = ['#ff6b7a', '#ffb347', '#ffd84a', '#6cc070', '#5fa8f0', '#b085f0', '#ff8fd0', '#4ad0c0', '#ff6b7a', '#5fa8f0'];

Object.assign(WORD_ART, {
  hello: c => { c.fillStyle = '#fff2b8'; circle(c, 50, 50, 44); c.fill(); hand(c, 52, 66, -0.15); waves(c, 52, 34, 1); waves(c, 48, 34, -1); },
  goodbye: c => {
    c.fillStyle = '#e3efff'; circle(c, 50, 50, 44); c.fill();
    c.fillStyle = '#c98f55'; rr(c, 60, 26, 26, 50, 4); c.fill(); c.fillStyle = '#ffd34f'; circle(c, 80, 52, 2.5); c.fill(); // ドア
    hand(c, 38, 66, 0.25); waves(c, 30, 32, -1);
  },
  thankyou: c => {
    c.fillStyle = '#ff8fb1'; rr(c, 20, 42, 60, 46, 6); c.fill(); c.fillStyle = '#ffb3cc'; rr(c, 16, 32, 68, 14, 4); c.fill();
    c.fillStyle = '#ffd34f'; c.fillRect(45, 32, 10, 56);
    c.strokeStyle = '#ffd34f'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.ellipse(40, 24, 10, 7, 0.4, 0, Math.PI * 2); c.ellipse(60, 24, 10, 7, -0.4, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#e0405a'; c.beginPath(); c.moveTo(78, 20); c.bezierCurveTo(70, 8, 58, 18, 78, 32); c.bezierCurveTo(98, 18, 86, 8, 78, 20); c.fill();
  },
  sorry: c => face(c, 'sorry'),
  goodmorning: c => {
    c.fillStyle = '#cfeaff'; rr(c, 6, 6, 88, 88, 14); c.fill();
    c.strokeStyle = '#ffb020'; c.lineWidth = 5; c.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; c.beginPath(); c.moveTo(50 + Math.cos(a) * 30, 66 + Math.sin(a) * 30); c.lineTo(50 + Math.cos(a) * 40, 66 + Math.sin(a) * 40); c.stroke(); }
    c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(50, 66, 22, Math.PI, 0); c.fill();
    c.fillStyle = '#8fd46a'; rr(c, 6, 66, 88, 28, 0); c.fill();
  },
  goodnight: c => {
    c.fillStyle = '#3a4a8a'; rr(c, 6, 6, 88, 88, 14); c.fill();
    c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(50, 50, 24, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3a4a8a'; c.beginPath(); c.arc(62, 42, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff6c0'; [[22, 24], [78, 72], [26, 74], [80, 22]].forEach(([x, y]) => { circle(c, x, y, 3); c.fill(); });
    c.fillStyle = '#fff'; c.font = '800 16px sans-serif'; c.fillText('z', 66, 70); c.font = '800 11px sans-serif'; c.fillText('z', 76, 60);
  },
  howareyou: c => { face(c, 'plain', 44, 56, 30); c.fillStyle = '#5fa8f0'; c.font = '800 40px "M PLUS Rounded 1c", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 82, 28); },
  happy: c => face(c, 'happy'),
  sleepy: c => { face(c, 'sleepy'); c.fillStyle = '#5fa8f0'; c.font = '800 18px sans-serif'; c.fillText('Z', 74, 26); c.font = '800 12px sans-serif'; c.fillText('z', 86, 14); },
  hungry: c => face(c, 'hungry'),
  apples: c => { apple(c, 30, 56, 0.42); apple(c, 70, 56, 0.42); apple(c, 50, 34, 0.42); },
  bananas: c => { banana(c, 50, 46, -0.2); banana(c, 52, 58, 0); banana(c, 54, 70, 0.2); },
  eggs: c => { egg(c, 32, 58); egg(c, 68, 58); egg(c, 50, 40); },
  pillow: c => {
    c.fillStyle = '#e8f0ff'; c.strokeStyle = '#a8b8e0'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(14, 34); c.quadraticCurveTo(50, 22, 86, 34); c.quadraticCurveTo(94, 52, 86, 70); c.quadraticCurveTo(50, 80, 14, 70); c.quadraticCurveTo(6, 52, 14, 34); c.fill(); c.stroke();
    c.fillStyle = '#ffb3cc'; [[34, 46], [56, 56], [70, 42]].forEach(([x, y]) => { circle(c, x, y, 4); c.fill(); });
  },
  pie: c => {
    c.fillStyle = '#e8b86a'; c.beginPath(); c.ellipse(50, 60, 40, 22, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#c08a3a'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = '#d99a4a'; c.lineWidth = 4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(50 + i * 14 - 8, 44); c.lineTo(50 + i * 14 + 8, 76); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.7)'; [[30, 28], [50, 22], [70, 28]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 3, 7, 0, 0, Math.PI * 2); c.fill(); });
  },
});
for (let n = 1; n <= 10; n++) {
  WORD_ART['n' + n] = numArt(n);
  // ふうせん n こ（かぞえる クイズ）
  WORD_ART['balloon' + n] = c => {
    const cols = Math.min(n, 5), rows = Math.ceil(n / 5);
    for (let i = 0; i < n; i++) { const r = Math.floor(i / 5), k = i % 5, cnt = r === rows - 1 ? n - r * 5 : cols; balloon(c, 50 + (k - (cnt - 1) / 2) * (n <= 3 ? 24 : 17), (rows === 1 ? (n === 1 ? 30 : 34) : 24 + r * 34), BCOL[i], rows === 1 ? (n === 1 ? 2 : n <= 3 ? 1.4 : 1.15) : 0.85); }
  };
}

// おみせの やたい（2マス はば）：goods の え を ならべる。(0,0) は ひだりうえの マス
export function drawStall(c, color, goods) {
  const w = TS * 2;
  c.fillStyle = 'rgba(40,60,40,.22)'; c.beginPath(); c.ellipse(w / 2, TS - 2, w / 2 - 2, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#c98f55'; c.fillRect(4, -14, 4, TS + 10); c.fillRect(w - 8, -14, 4, TS + 10);          // はしら
  c.fillStyle = '#e8c08a'; rr(c, 0, TS * 0.35, w, TS * 0.6, 4); c.fill(); c.strokeStyle = '#b8864e'; c.lineWidth = 1.5; c.stroke(); // だい
  for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : color; c.fillRect(-4 + i * 9, -24, 9, 10); }  // やね
  c.fillStyle = color; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(0.5 + i * 9, -14, 4.5, 0, Math.PI); c.fill(); }
  for (let k = 0; k < 2; k++) { c.save(); c.translate(8 + k * 26, -6); c.scale(0.24, 0.24); (WORD_ART[goods] || (() => {}))(c); c.restore(); }
}

/* ---------- ワールド3 だい2かい：いろ・かたち・うごき・とう ---------- */
const COLORS = { cred: '#ff5a5f', cblue: '#4f8fff', cyellow: '#ffd23f', cgreen: '#4fbf5f', cpink: '#ff8fc8', cwhite: '#ffffff' };
export const colorOf = id => COLORS[id] || '#ccc';
export function shapePath(c, kind, x, y, r) {
  c.beginPath();
  if (kind === 'circle') c.arc(x, y, r, 0, Math.PI * 2);
  else if (kind === 'square') c.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8);
  else if (kind === 'triangle') { c.moveTo(x, y - r); c.lineTo(x + r * 1.05, y + r * 0.8); c.lineTo(x - r * 1.05, y + r * 0.8); c.closePath(); }
  else if (kind === 'star') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; i ? c.lineTo(x + q * Math.cos(a), y + q * Math.sin(a)) : c.moveTo(x + q * Math.cos(a), y + q * Math.sin(a)); } c.closePath(); }
  else if (kind === 'heart') { c.moveTo(x, y + r * 0.85); c.bezierCurveTo(x - r * 1.6, y - r * 0.1, x - r * 0.7, y - r * 1.25, x, y - r * 0.35); c.bezierCurveTo(x + r * 0.7, y - r * 1.25, x + r * 1.6, y - r * 0.1, x, y + r * 0.85); c.closePath(); }
}
// ひと（うごきの え）：pose = swim / run / jump / sing / dance
function kid(c, pose) {
  const skin = '#ffd9b0', shirt = '#ff8fb1', ink = INK;
  c.lineCap = 'round'; c.lineJoin = 'round';
  const limb = (x1, y1, x2, y2, x3, y3, col = skin) => { c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.stroke(); };
  const head = (x, y) => { c.fillStyle = skin; circle(c, x, y, 11); c.fill(); c.strokeStyle = '#d9a070'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#6a4a3a'; c.beginPath(); c.arc(x, y - 2, 11, Math.PI, 0); c.fill(); c.fillStyle = ink; circle(c, x - 4, y + 2, 1.6); c.fill(); circle(c, x + 4, y + 2, 1.6); c.fill(); };
  if (pose === 'swim') {
    c.fillStyle = '#9fd8ff'; rr(c, 6, 52, 88, 40, 10); c.fill();
    limb(30, 56, 20, 42, 12, 36); limb(52, 56, 66, 44, 78, 40);
    head(42, 50);
    c.strokeStyle = '#fff'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(18 + i * 22, 66, 8, Math.PI, 0); c.stroke(); }
    return;
  }
  const by = pose === 'jump' ? 40 : 52; // からだの たかさ
  if (pose === 'jump') { c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(50, 92, 22, 5, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffb347'; c.lineWidth = 3; [[24, 70], [76, 70]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 12); c.moveTo(x - 4, y - 8); c.lineTo(x, y - 12); c.lineTo(x + 4, y - 8); c.stroke(); }); }
  // あし
  if (pose === 'run') { limb(46, by + 18, 34, by + 28, 26, by + 40, '#5a7fc0'); limb(54, by + 18, 64, by + 30, 76, by + 32, '#5a7fc0'); }
  else if (pose === 'jump') { limb(44, by + 18, 36, by + 30, 44, by + 38, '#5a7fc0'); limb(56, by + 18, 64, by + 30, 56, by + 38, '#5a7fc0'); }
  else if (pose === 'dance') { limb(46, by + 18, 40, by + 30, 36, by + 40, '#5a7fc0'); limb(54, by + 18, 66, by + 26, 74, by + 22, '#5a7fc0'); }
  else { limb(45, by + 18, 44, by + 30, 42, by + 40, '#5a7fc0'); limb(55, by + 18, 56, by + 30, 58, by + 40, '#5a7fc0'); }
  // うで
  if (pose === 'run') { limb(44, by + 2, 34, by + 10, 30, by + 2); limb(56, by + 2, 66, by + 12, 72, by + 18); }
  else if (pose === 'jump' || pose === 'dance') { limb(44, by + 2, 34, by - 10, 30, by - 22); limb(56, by + 2, 66, by - 10, 70, by - 22); }
  else { limb(44, by + 2, 36, by + 12, 34, by + 20); limb(56, by + 2, 64, by + 12, 66, by + 20); }
  c.fillStyle = shirt; rr(c, 40, by - 4, 20, 26, 7); c.fill();
  head(50, by - 16);
  if (pose === 'sing') { c.fillStyle = '#e05a6a'; c.beginPath(); c.ellipse(50, by - 10, 3.5, 4, 0, 0, Math.PI * 2); c.fill(); }
  if (pose === 'sing' || pose === 'dance') { c.fillStyle = '#7c6cf0'; [[74, 22], [84, 36], [20, 30]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y + 10, 5, 4, -0.4, 0, Math.PI * 2); c.fill(); c.fillRect(x + 3.5, y - 6, 2.5, 16); }); }
  if (pose === 'run') { c.strokeStyle = '#c8c8c8'; c.lineWidth = 3; [[10, 44], [6, 56], [12, 68]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 12, y); c.stroke(); }); }
}
const scaled = (c, art, x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.translate(-50, -50); (WORD_ART[art] || (() => {}))(c); c.restore(); };
Object.assign(WORD_ART, Object.fromEntries(Object.keys(COLORS).map(id => [id, c => {
  c.fillStyle = COLORS[id]; c.strokeStyle = id === 'cwhite' ? '#c8c0b8' : 'rgba(0,0,0,.18)'; c.lineWidth = 3;
  c.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i % 2 ? 30 : 38; i ? c.lineTo(50 + Math.cos(a) * r, 52 + Math.sin(a) * r) : c.moveTo(50 + Math.cos(a) * r, 52 + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(38, 40, 7, 4, -0.5, 0, Math.PI * 2); c.fill();
}])));
for (const k of ['circle', 'square', 'triangle', 'star', 'heart']) WORD_ART['s_' + k] = c => { c.fillStyle = '#cfd8ea'; c.strokeStyle = '#7a8aa8'; c.lineWidth = 4; shapePath(c, k, 50, 52, 34); c.fill(); c.stroke(); };
for (const k of ['swim', 'run', 'jump', 'sing', 'dance']) WORD_ART['a_' + k] = c => kid(c, k);
WORD_ART.dogs = c => { scaled(c, 'dog', 32, 54, 0.55); scaled(c, 'dog', 68, 54, 0.55); };
WORD_ART.cats = c => { scaled(c, 'cat', 32, 54, 0.55); scaled(c, 'cat', 68, 54, 0.55); };

// かんばん（2マス）：つくった いろと かたちを かく。marks = ['cred:star', …]
export function drawBoard(c, marks) {
  const w = TS * 2;
  c.fillStyle = 'rgba(40,60,40,.22)'; c.beginPath(); c.ellipse(w / 2, TS - 2, w / 2 - 4, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#a8784a'; c.fillRect(8, 6, 4, TS - 8); c.fillRect(w - 12, 6, 4, TS - 8);
  c.fillStyle = '#fff8e8'; rr(c, 0, -18, w, 30, 5); c.fill(); c.strokeStyle = '#c99a5f'; c.lineWidth = 2.5; c.stroke();
  for (let i = 0; i < 3; i++) {
    const m = marks[i], x = 12 + i * 20, y = -3;
    if (m) { const [col, sh] = m.split(':'); c.fillStyle = colorOf(col); c.strokeStyle = col === 'cwhite' ? '#b8b0a8' : 'rgba(0,0,0,.25)'; c.lineWidth = 1.2; shapePath(c, sh, x, y, 7.5); c.fill(); c.stroke(); }
    else { c.strokeStyle = '#e0d0c0'; c.setLineDash([2, 2]); c.lineWidth = 1.2; c.strokeRect(x - 7, y - 7, 14, 14); c.setLineDash([]); }
  }
}
// ことばの とう（3マス × 5マス）。bells … なった かねの かず、open … クリア
export function drawTower(c, bells, open, t) {
  const w = TS * 3, h = TS * 5;
  c.fillStyle = 'rgba(40,60,40,.25)'; c.beginPath(); c.ellipse(w / 2, h - 4, w / 2, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#efe4d2'; rr(c, 8, 30, w - 16, h - 34, 6); c.fill(); c.strokeStyle = '#b8a888'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#7c6cf0'; c.beginPath(); c.moveTo(2, 34); c.lineTo(w / 2, -18); c.lineTo(w - 2, 34); c.closePath(); c.fill();
  c.fillStyle = '#ffd34f'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 3 : 7; i ? c.lineTo(w / 2 + q * Math.cos(a), -22 + q * Math.sin(a)) : c.moveTo(w / 2 + q * Math.cos(a), -22 + q * Math.sin(a)); } c.fill();
  for (let i = 0; i < 3; i++) { // かね（なったら きんいろ）
    const y = 48 + i * 30, on = i < bells;
    c.fillStyle = '#d9cdb8'; rr(c, w / 2 - 14, y - 10, 28, 24, 12); c.fill();
    c.fillStyle = on ? '#ffd34f' : '#b8b0a0'; c.beginPath(); c.moveTo(w / 2 - 8, y + 8); c.quadraticCurveTo(w / 2 - 8, y - 6, w / 2, y - 6); c.quadraticCurveTo(w / 2 + 8, y - 6, w / 2 + 8, y + 8); c.closePath(); c.fill();
    if (on) { c.globalAlpha = 0.4 + Math.sin(t * 4 + i) * 0.3; c.fillStyle = '#fff6a0'; circle(c, w / 2, y + 2, 14); c.fill(); c.globalAlpha = 1; }
  }
  c.fillStyle = open ? '#fff6a0' : '#8a6a4a'; rr(c, w / 2 - 12, h - 34, 24, 30, 10); c.fill();
}

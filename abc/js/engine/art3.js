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

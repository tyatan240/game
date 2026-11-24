// たからさがしの カードの え（A〜Z）。すべて コードで かく オリジナル（0〜100 の しかく）
// ABCぼうけんの WORD_ART に c_ の え を たす（apple・cat・dog・fish・flower・key・milk は もとからの え を つかう）
import { WORD_ART } from '../../abc/js/engine/art.js';

const INK = '#4a3a3a';
const C = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };
const E = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
const R = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
const P = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
const fs = (c, f, s, w = 3) => { c.fillStyle = f; c.fill(); if (s) { c.strokeStyle = s; c.lineWidth = w; c.stroke(); } };
const eyes = (c, x1, x2, y, r = 3.5) => { c.fillStyle = INK; [x1, x2].forEach(x => { C(c, x, y, r); c.fill(); }); c.fillStyle = '#fff'; [x1, x2].forEach(x => { C(c, x + r * 0.35, y - r * 0.4, r * 0.35); c.fill(); }); };
const smile = (c, x, y, r = 5) => { c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.arc(x, y, r, 0.3, Math.PI - 0.3); c.stroke(); };
const cheeks = (c, x1, x2, y) => { c.fillStyle = 'rgba(255,120,150,.45)'; [x1, x2].forEach(x => { E(c, x, y, 4.5, 3); c.fill(); }); };
const star = (c, x, y, r1, r2, n = 5) => { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; i ? c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : c.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); } c.closePath(); };
const gem = (c, x, y, s, col, dark) => { P(c, [[x - s, y - s * 0.4], [x - s * 0.5, y - s], [x + s * 0.5, y - s], [x + s, y - s * 0.4], [x, y + s]]); fs(c, col, dark, 2.5); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - s, y - s * 0.4); c.lineTo(x + s, y - s * 0.4); c.moveTo(x - s * 0.5, y - s); c.lineTo(x - s * 0.2, y - s * 0.4); c.lineTo(x, y + s); c.moveTo(x + s * 0.5, y - s); c.lineTo(x + s * 0.2, y - s * 0.4); c.stroke(); };

Object.assign(WORD_ART, {
  // ===== A =====
  c_ant: c => {
    c.strokeStyle = INK; c.lineWidth = 2.5; c.lineCap = 'round';
    [-1, 1].forEach(s => [58, 66, 74].forEach((y, i) => { c.beginPath(); c.moveTo(50, y - 4); c.lineTo(50 + s * (16 + i * 2), y + 6); c.stroke(); }));
    c.beginPath(); c.moveTo(30, 34); c.quadraticCurveTo(24, 20, 18, 18); c.moveTo(38, 32); c.quadraticCurveTo(40, 18, 46, 14); c.stroke();
    [[34, 42, 13], [55, 60, 10], [74, 70, 15]].forEach(([x, y, r]) => { C(c, x, y, r); fs(c, '#5a4a4a'); });
    eyes(c, 29, 39, 40, 3); c.fillStyle = 'rgba(255,255,255,.3)'; E(c, 70, 64, 6, 4); c.fill();
  },
  c_angel: c => {
    [-1, 1].forEach(s => { E(c, 50 + s * 24, 56, 16, 24, s * 0.5); fs(c, '#fff', '#c8d8f0'); });
    P(c, [[34, 92], [42, 52], [58, 52], [66, 92]]); fs(c, '#fff4fa', '#f0b8d0');
    C(c, 50, 42, 15); fs(c, '#ffe2c8', '#e0b898');
    c.strokeStyle = '#ffd34f'; c.lineWidth = 4; E(c, 50, 20, 14, 4); c.stroke();
    eyes(c, 45, 55, 41, 2.6); smile(c, 50, 46, 3.5); cheeks(c, 41, 59, 47);
    c.fillStyle = '#ffd88a'; c.beginPath(); c.arc(50, 38, 15, Math.PI, 0); c.fill();
  },
  // ===== B =====
  c_ball: c => { C(c, 50, 54, 32); fs(c, '#ff6b6b', '#c84a4a'); c.save(); C(c, 50, 54, 32); c.clip(); c.fillStyle = '#fff'; c.fillRect(16, 48, 68, 12); c.fillStyle = '#ffd34f'; c.fillRect(16, 26, 68, 10); c.restore(); c.fillStyle = 'rgba(255,255,255,.6)'; E(c, 38, 38, 7, 4, -0.5); c.fill(); },
  c_bell: c => {
    c.beginPath(); c.moveTo(24, 74); c.quadraticCurveTo(30, 70, 30, 50); c.quadraticCurveTo(30, 22, 50, 22); c.quadraticCurveTo(70, 22, 70, 50); c.quadraticCurveTo(70, 70, 76, 74); c.closePath(); fs(c, '#ffd34f', '#d8a020');
    C(c, 50, 80, 7); fs(c, '#e8a020'); C(c, 50, 18, 5); fs(c, '#d8a020');
    c.strokeStyle = '#ff6b8a'; c.lineWidth = 5; c.beginPath(); c.moveTo(32, 62); c.lineTo(68, 62); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)'; E(c, 40, 40, 4, 10, 0.2); c.fill();
  },
  c_butterfly: c => {
    [-1, 1].forEach(s => { E(c, 50 + s * 20, 38, 19, 16, s * 0.4); fs(c, '#ff9ad0', '#d8609a'); E(c, 50 + s * 16, 66, 13, 11, -s * 0.4); fs(c, '#ffd34f', '#d8a020'); C(c, 50 + s * 22, 38, 6); fs(c, '#fff'); });
    E(c, 50, 54, 5, 24); fs(c, '#5a4a6a'); c.strokeStyle = '#5a4a6a'; c.lineWidth = 2; c.beginPath(); c.moveTo(48, 32); c.quadraticCurveTo(42, 18, 36, 16); c.moveTo(52, 32); c.quadraticCurveTo(58, 18, 64, 16); c.stroke();
  },
  // ===== C =====
  c_cup: c => { c.beginPath(); c.moveTo(26, 30); c.lineTo(74, 30); c.lineTo(68, 84); c.quadraticCurveTo(50, 90, 32, 84); c.closePath(); fs(c, '#7ac8ff', '#3a88c8'); c.strokeStyle = '#3a88c8'; c.lineWidth = 6; c.beginPath(); c.arc(76, 52, 11, -1.3, 1.3); c.stroke(); E(c, 50, 30, 24, 5); fs(c, '#d8f0ff', '#3a88c8', 2); C(c, 50, 58, 7); fs(c, '#fff'); },
  c_crown: c => { P(c, [[16, 76], [12, 30], [32, 50], [50, 20], [68, 50], [88, 30], [84, 76]]); fs(c, '#ffd34f', '#d8a020'); R(c, 16, 70, 68, 12, 4); fs(c, '#ffb020', '#d8a020'); [[30, 76, '#ff4a6a'], [50, 76, '#4ab0ff'], [70, 76, '#5ac87a']].forEach(([x, y, col]) => { C(c, x, y, 4.5); fs(c, col); }); [[12, 30], [50, 20], [88, 30]].forEach(([x, y]) => { C(c, x, y, 5); fs(c, '#fff3a8', '#d8a020', 2); }); },
  // ===== D =====
  c_drum: c => { R(c, 22, 40, 56, 40, 6); fs(c, '#ff6b6b', '#c84a4a'); c.strokeStyle = '#ffd34f'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(24 + i * 13, 44); c.lineTo(30 + i * 13, 76); } c.stroke(); E(c, 50, 40, 28, 8); fs(c, '#fff4e8', '#c8a888'); c.strokeStyle = '#a8763a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 18); c.lineTo(44, 36); c.moveTo(74, 16); c.lineTo(60, 36); c.stroke(); C(c, 30, 18, 4); fs(c, '#a8763a'); C(c, 74, 16, 4); fs(c, '#a8763a'); },
  c_diamond: c => gem(c, 50, 56, 34, '#bfe8ff', '#5ab0e0'),
  // ===== E =====
  c_egg: c => { c.beginPath(); c.moveTo(50, 16); c.bezierCurveTo(76, 16, 80, 60, 78, 68); c.quadraticCurveTo(74, 90, 50, 90); c.quadraticCurveTo(26, 90, 22, 68); c.bezierCurveTo(20, 60, 24, 16, 50, 16); fs(c, '#fff8ea', '#d8c8a8'); c.fillStyle = 'rgba(255,255,255,.8)'; E(c, 38, 42, 5, 10, 0.3); c.fill(); },
  c_elephant: c => {
    E(c, 56, 64, 28, 20); fs(c, '#b8c0d8', '#7a84a0');
    [[38, 78], [52, 80], [66, 80], [78, 76]].forEach(([x, y]) => { R(c, x - 5, y - 4, 10, 14, 4); fs(c, '#b8c0d8', '#7a84a0'); });
    E(c, 24, 44, 14, 16); fs(c, '#ffc8d8', '#7a84a0'); C(c, 34, 46, 17); fs(c, '#c8d0e8', '#7a84a0');
    c.strokeStyle = '#7a84a0'; c.fillStyle = '#c8d0e8'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(24, 54); c.quadraticCurveTo(14, 70, 22, 80); c.stroke(); c.strokeStyle = '#c8d0e8'; c.lineWidth = 5; c.stroke();
    eyes(c, 36, 36, 42, 2.6); cheeks(c, 42, 42, 52);
  },
  c_eagle: c => {
    [-1, 1].forEach(s => { P(c, [[50, 46], [50 + s * 44, 30], [50 + s * 38, 44], [50 + s * 44, 50], [50 + s * 30, 58]]); fs(c, '#8a5a3a', '#5a3a2a'); });
    E(c, 50, 60, 14, 22); fs(c, '#a8703a', '#5a3a2a'); C(c, 50, 36, 13); fs(c, '#fff', '#c8c8c8');
    P(c, [[50, 40], [62, 42], [52, 50]]); fs(c, '#ffd34f', '#d8a020', 2); eyes(c, 45, 55, 34, 2.4);
    P(c, [[42, 80], [50, 92], [58, 80]]); fs(c, '#fff', '#c8c8c8', 2);
  },
  // ===== F =====
  c_fairy: c => {
    [-1, 1].forEach(s => { E(c, 50 + s * 20, 48, 15, 22, s * 0.6); fs(c, 'rgba(200,240,255,.85)', '#8ac8e8'); });
    P(c, [[38, 88], [44, 54], [56, 54], [62, 88]]); fs(c, '#a8f0c0', '#5ac87a');
    C(c, 50, 42, 13); fs(c, '#ffe2c8', '#e0b898'); c.fillStyle = '#ffb0d0'; c.beginPath(); c.arc(50, 39, 13.5, Math.PI, 0); c.fill();
    eyes(c, 45, 55, 43, 2.4); smile(c, 50, 47, 3); c.strokeStyle = '#d8a020'; c.lineWidth = 2; c.beginPath(); c.moveTo(66, 70); c.lineTo(80, 50); c.stroke(); star(c, 82, 46, 7, 3); fs(c, '#ffd34f');
    [[20, 22], [80, 20], [26, 80]].forEach(([x, y]) => { star(c, x, y, 4, 1.6, 4); fs(c, '#fff3a8'); });
  },
  // ===== G =====
  c_gift: c => { R(c, 20, 44, 60, 44, 4); fs(c, '#ff8fb1', '#d8608a'); R(c, 16, 32, 68, 14, 4); fs(c, '#ffa8c4', '#d8608a'); c.fillStyle = '#ffd34f'; c.fillRect(44, 32, 12, 56); [-1, 1].forEach(s => { E(c, 50 + s * 12, 24, 12, 8, s * 0.5); fs(c, '#ffd34f', '#d8a020', 2); }); C(c, 50, 28, 5); fs(c, '#ffb020'); },
  c_guitar: c => {
    c.save(); c.translate(50, 50); c.rotate(0.5); c.translate(-50, -50);
    R(c, 46, 6, 8, 46, 2); fs(c, '#8a5a3a'); R(c, 43, 2, 14, 12, 3); fs(c, '#5a3a2a');
    E(c, 50, 64, 22, 18); fs(c, '#ffa848', '#c8702a'); E(c, 50, 48, 16, 13); fs(c, '#ffa848', '#c8702a'); E(c, 50, 62, 20, 16); c.fillStyle = '#ffa848'; c.fill();
    C(c, 50, 58, 6); fs(c, '#5a3a2a'); c.strokeStyle = '#fff'; c.lineWidth = 0.8; c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(50 + i * 2, 8); c.lineTo(50 + i * 2, 76); } c.stroke(); R(c, 42, 72, 16, 4, 1); fs(c, '#5a3a2a');
    c.restore();
  },
  c_gold: c => {
    const bar = (x, y) => { P(c, [[x, y + 18], [x + 8, y], [x + 34, y], [x + 42, y + 18]]); fs(c, '#ffd34f', '#c8901a'); P(c, [[x + 8, y], [x + 34, y], [x + 30, y + 6], [x + 12, y + 6]]); fs(c, '#fff0a0'); };
    bar(8, 70); bar(50, 70); bar(29, 50);
    [[20, 30], [78, 36], [50, 26]].forEach(([x, y], i) => { star(c, x, y, 7 - i, 2.6, 4); fs(c, '#fff8c8'); });
  },
  // ===== H =====
  c_hat: c => { E(c, 50, 70, 40, 12); fs(c, '#5a6aa8', '#3a4a88'); c.beginPath(); c.moveTo(28, 70); c.lineTo(32, 30); c.quadraticCurveTo(50, 22, 68, 30); c.lineTo(72, 70); fs(c, '#6a7ac8', '#3a4a88'); c.fillStyle = '#ff6b6b'; c.fillRect(30, 56, 40, 9); C(c, 64, 56, 6); fs(c, '#ffd34f'); },
  c_horse: c => {
    E(c, 52, 58, 26, 15); fs(c, '#c8904a', '#8a5a2a');
    [[34, 70], [44, 72], [60, 72], [70, 70]].forEach(([x, y]) => { R(c, x - 4, y, 8, 20, 3); fs(c, '#c8904a', '#8a5a2a', 2); R(c, x - 4, y + 16, 8, 5, 2); fs(c, '#5a3a2a'); });
    P(c, [[28, 54], [20, 24], [28, 20], [42, 46]]); fs(c, '#c8904a', '#8a5a2a'); E(c, 18, 28, 12, 9, -0.5); fs(c, '#d8a060', '#8a5a2a');
    c.fillStyle = '#5a3a2a'; P(c, [[26, 20], [40, 22], [44, 46], [36, 30]]); c.fill(); c.beginPath(); c.moveTo(78, 52); c.quadraticCurveTo(92, 56, 86, 76); c.lineWidth = 6; c.strokeStyle = '#5a3a2a'; c.stroke();
    eyes(c, 20, 20, 24, 2.4); C(c, 10, 31, 1.6); fs(c, INK);
  },
  c_heart: c => { c.beginPath(); c.moveTo(50, 86); c.bezierCurveTo(8, 60, 10, 22, 32, 20); c.bezierCurveTo(44, 19, 50, 30, 50, 34); c.bezierCurveTo(50, 30, 56, 19, 68, 20); c.bezierCurveTo(90, 22, 92, 60, 50, 86); fs(c, '#ff5a8a', '#c82a5a'); c.fillStyle = 'rgba(255,255,255,.55)'; E(c, 32, 36, 7, 10, -0.6); c.fill(); },
  // ===== I =====
  c_icecream: c => { P(c, [[34, 52], [66, 52], [50, 94]]); fs(c, '#e8b878', '#a8763a'); c.strokeStyle = '#c8904a'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(38 + i * 7, 52); c.lineTo(52 + i * 2, 82); c.moveTo(62 - i * 7, 52); c.lineTo(48 - i * 2, 82); } c.stroke(); C(c, 40, 46, 13); fs(c, '#ffb0c8', '#e07a9a', 2); C(c, 60, 46, 13); fs(c, '#a8e0b0', '#5ab07a', 2); C(c, 50, 30, 13); fs(c, '#fff4d8', '#d8c098', 2); C(c, 50, 15, 5); fs(c, '#ff4a6a'); },
  c_igloo: c => { c.beginPath(); c.moveTo(12, 82); c.arc(50, 82, 38, Math.PI, 0); c.closePath(); fs(c, '#f0f8ff', '#9ab8d8'); c.strokeStyle = '#b8d0e8'; c.lineWidth = 2; [70, 58, 46].forEach(y => { c.beginPath(); c.moveTo(50 - Math.sqrt(38 * 38 - (82 - y) ** 2), y); c.lineTo(50 + Math.sqrt(38 * 38 - (82 - y) ** 2), y); c.stroke(); }); c.beginPath(); c.moveTo(38, 82); c.arc(50, 82, 12, Math.PI, 0); fs(c, '#5a7aa8'); },
  c_island: c => { E(c, 50, 84, 46, 10); fs(c, '#7ac8f0'); E(c, 50, 78, 32, 10); fs(c, '#ffe0a0', '#d8b070'); c.strokeStyle = '#a8763a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(48, 76); c.quadraticCurveTo(52, 50, 60, 32); c.stroke(); c.fillStyle = '#5ac87a'; [-2.4, -1.6, -0.8, 0, 0.7].forEach(a => { c.beginPath(); c.ellipse(60 + Math.cos(a) * 13, 30 + Math.sin(a) * 9, 15, 5, a, 0, Math.PI * 2); c.fill(); }); C(c, 56, 38, 4); fs(c, '#8a5a3a'); },
  // ===== J =====
  c_jam: c => { R(c, 26, 34, 48, 56, 10); fs(c, 'rgba(230,240,255,.9)', '#a8b8d0'); R(c, 29, 46, 42, 41, 8); fs(c, '#e0405a'); R(c, 24, 22, 52, 16, 4); fs(c, '#ff8fb1', '#d8608a'); c.fillStyle = '#fff'; [30, 42, 54, 66].forEach(x => { C(c, x, 30, 3); c.fill(); }); R(c, 36, 56, 28, 18, 4); fs(c, '#fff', '#e0405a', 2); c.fillStyle = '#e0405a'; C(c, 50, 65, 4); c.fill(); },
  c_jet: c => { c.save(); c.translate(50, 50); c.rotate(-0.4); P(c, [[-40, 4], [24, -6], [40, 0], [24, 6], [-40, 8]]); fs(c, '#e8eef8', '#7a8aa8'); P(c, [[-4, -2], [-22, -34], [-12, -34], [12, -2]]); fs(c, '#4ab0ff', '#2a70c8'); P(c, [[-4, 6], [-22, 34], [-12, 34], [12, 6]]); fs(c, '#4ab0ff', '#2a70c8'); P(c, [[-40, 4], [-48, -14], [-38, -14], [-30, 2]]); fs(c, '#ff6b6b', '#c84a4a'); [-8, 2, 12].forEach(x => { C(c, x, 1, 2.4); fs(c, '#7ac8ff'); }); c.restore(); },
  c_jewel: c => { gem(c, 50, 58, 30, '#ff7ab0', '#c83a78'); [[20, 22], [80, 26], [84, 78]].forEach(([x, y], i) => { star(c, x, y, 6 - i, 2.2, 4); fs(c, '#fff3c8'); }); },
  // ===== K =====
  c_kite: c => { P(c, [[50, 10], [78, 40], [50, 74], [22, 40]]); fs(c, '#ff8a5a', '#c8562a'); P(c, [[50, 10], [78, 40], [50, 40]]); fs(c, '#ffd34f'); P(c, [[50, 40], [22, 40], [50, 74]]); fs(c, '#ffd34f'); c.strokeStyle = '#c8562a'; c.lineWidth = 2; c.beginPath(); c.moveTo(50, 10); c.lineTo(50, 74); c.moveTo(22, 40); c.lineTo(78, 40); c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(50, 74); c.bezierCurveTo(40, 84, 60, 88, 50, 96); c.stroke(); [[46, 82], [54, 89]].forEach(([x, y]) => { E(c, x, y, 4, 2.4, 0.5); fs(c, '#5ac8ff'); }); },
  c_king: c => {
    P(c, [[30, 34], [30, 14], [40, 24], [50, 10], [60, 24], [70, 14], [70, 34]]); fs(c, '#ffd34f', '#d8a020', 2);
    C(c, 50, 50, 20); fs(c, '#ffe2c8', '#e0b898'); c.fillStyle = '#e8e0d8'; c.beginPath(); c.moveTo(32, 54); c.quadraticCurveTo(50, 96, 68, 54); c.quadraticCurveTo(50, 70, 32, 54); c.fill(); c.strokeStyle = '#c8c0b8'; c.lineWidth = 1.5; c.stroke();
    eyes(c, 43, 57, 47, 2.8); E(c, 50, 56, 5, 3); fs(c, '#ffb0a0'); P(c, [[28, 96], [32, 72], [68, 72], [72, 96]]); fs(c, '#c83a5a', '#8a1a3a', 2);
  },
  // ===== L =====
  c_lemon: c => { E(c, 50, 54, 34, 24, -0.3); fs(c, '#ffe84a', '#d8b820'); C(c, 82, 42, 4); fs(c, '#d8b820'); c.fillStyle = 'rgba(255,255,255,.6)'; E(c, 36, 44, 9, 4, -0.4); c.fill(); E(c, 30, 30, 9, 4, -0.6); fs(c, '#5ac87a'); },
  c_lamp: c => { c.beginPath(); c.moveTo(16, 70); c.quadraticCurveTo(14, 54, 36, 52); c.lineTo(70, 54); c.quadraticCurveTo(92, 46, 90, 36); c.quadraticCurveTo(80, 52, 72, 64); c.quadraticCurveTo(50, 80, 26, 76); c.closePath(); fs(c, '#ffd34f', '#c8901a'); E(c, 48, 52, 14, 5); fs(c, '#ffb020', '#c8901a', 2); c.strokeStyle = '#c8901a'; c.lineWidth = 4; c.beginPath(); c.arc(16, 62, 8, Math.PI * 0.5, Math.PI * 1.6); c.stroke(); C(c, 48, 44, 4); fs(c, '#c8901a'); c.fillStyle = 'rgba(255,240,160,.7)'; c.beginPath(); c.moveTo(88, 34); c.quadraticCurveTo(98, 18, 86, 8); c.quadraticCurveTo(92, 20, 84, 30); c.fill(); },
  c_lion: c => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; C(c, 50 + Math.cos(a) * 28, 52 + Math.sin(a) * 28, 12); fs(c, '#d8803a'); } C(c, 50, 52, 26); fs(c, '#ffc860', '#c8862a'); [[32, 30], [68, 30]].forEach(([x, y]) => { C(c, x, y, 7); fs(c, '#ffc860', '#c8862a', 2); }); eyes(c, 41, 59, 48, 3.4); E(c, 50, 58, 6, 4); fs(c, '#8a4a2a'); E(c, 50, 64, 10, 7); fs(c, '#fff0d0'); smile(c, 50, 64, 4); cheeks(c, 36, 64, 58); },
  // ===== M =====
  c_map: c => { P(c, [[12, 24], [36, 16], [62, 24], [88, 16], [88, 80], [62, 88], [36, 80], [12, 88]]); fs(c, '#fff0c8', '#c8a060'); c.strokeStyle = '#d8b878'; c.lineWidth = 2; c.beginPath(); c.moveTo(36, 16); c.lineTo(36, 80); c.moveTo(62, 24); c.lineTo(62, 88); c.stroke(); c.setLineDash([4, 4]); c.strokeStyle = '#c84a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, 74); c.quadraticCurveTo(40, 40, 58, 62); c.quadraticCurveTo(70, 72, 72, 40); c.stroke(); c.setLineDash([]); c.lineWidth = 4; c.beginPath(); c.moveTo(66, 34); c.lineTo(78, 46); c.moveTo(78, 34); c.lineTo(66, 46); c.stroke(); },
  c_moon: c => { c.beginPath(); c.arc(50, 50, 34, 0.9, Math.PI * 2 - 0.9, false); c.arc(66, 36, 28, Math.PI * 2 - 1.3, 1.6, true); c.closePath(); fs(c, '#ffe878', '#d8b820'); eyes(c, 32, 32, 52, 2.6); smile(c, 36, 62, 4); [[78, 70], [82, 26], [62, 86]].forEach(([x, y], i) => { star(c, x, y, 6 - i, 2.4); fs(c, '#fff3a8'); }); },
  // ===== N =====
  c_nut: c => { c.beginPath(); c.moveTo(50, 92); c.quadraticCurveTo(20, 80, 24, 50); c.lineTo(76, 50); c.quadraticCurveTo(80, 80, 50, 92); fs(c, '#c8904a', '#8a5a2a'); E(c, 50, 44, 30, 14); fs(c, '#8a5a2a', '#5a3a1a'); c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.5; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(50 + i * 10, 34); c.lineTo(50 + i * 12, 54); } c.stroke(); R(c, 47, 22, 6, 12, 3); fs(c, '#5a3a1a'); c.fillStyle = 'rgba(255,255,255,.4)'; E(c, 36, 66, 4, 8, 0.3); c.fill(); },
  c_nest: c => { E(c, 50, 64, 38, 20); fs(c, '#a8763a', '#6a4a1a'); c.strokeStyle = '#6a4a1a'; c.lineWidth = 2; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(50, 70 - i * 2, 30 + i, Math.PI + 0.2 + i * 0.1, Math.PI * 2 - 0.3); c.stroke(); } [[38, 54], [50, 50], [62, 54]].forEach(([x, y]) => { E(c, x, y, 8, 10); fs(c, '#bfe8ff', '#7ab0d0', 2); }); },
  c_necklace: c => { c.strokeStyle = '#d8a020'; c.lineWidth = 3; c.beginPath(); c.arc(50, 30, 32, 0.3, Math.PI - 0.3); c.stroke(); for (let i = 0; i <= 8; i++) { const a = 0.4 + i * (Math.PI - 0.8) / 8; C(c, 50 + Math.cos(a) * 32, 30 + Math.sin(a) * 32, 4); fs(c, '#fff8f0', '#d8c8b8', 1.5); } gem(c, 50, 74, 12, '#ff5a8a', '#c82a5a'); },
  // ===== O =====
  c_orange: c => { C(c, 50, 56, 32); fs(c, '#ffa030', '#d8701a'); c.fillStyle = 'rgba(255,255,255,.5)'; E(c, 38, 44, 7, 4, -0.5); c.fill(); R(c, 47, 20, 6, 8, 2); fs(c, '#8a5a2a'); E(c, 60, 22, 10, 5, -0.4); fs(c, '#5ac87a'); c.fillStyle = 'rgba(200,100,20,.35)'; [[58, 64], [44, 70], [66, 50]].forEach(([x, y]) => { C(c, x, y, 1.6); c.fill(); }); },
  c_owl: c => { E(c, 50, 58, 30, 34); fs(c, '#a8805a', '#6a4a2a'); E(c, 50, 68, 18, 20); fs(c, '#f0dcc0'); [[-1], [1]].forEach(([s]) => { P(c, [[50 + s * 14, 28], [50 + s * 26, 10], [50 + s * 28, 32]]); fs(c, '#a8805a'); C(c, 50 + s * 12, 44, 11); fs(c, '#fff', '#6a4a2a', 2); C(c, 50 + s * 12, 44, 6); fs(c, INK); C(c, 50 + s * 13.5, 42, 2); fs(c, '#fff'); }); P(c, [[46, 52], [54, 52], [50, 60]]); fs(c, '#ffb020'); c.strokeStyle = '#c8a888'; c.lineWidth = 2; [64, 72, 80].forEach(y => { c.beginPath(); c.arc(50, y, 6, 0.4, Math.PI - 0.4); c.stroke(); }); },
  c_octopus: c => { for (let i = 0; i < 6; i++) { const x = 24 + i * 10.4; c.strokeStyle = '#ff7a9a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 58); c.quadraticCurveTo(x + (i % 2 ? 8 : -8), 74, x, 88); c.stroke(); } c.beginPath(); c.moveTo(18, 62); c.quadraticCurveTo(14, 16, 50, 14); c.quadraticCurveTo(86, 16, 82, 62); c.closePath(); fs(c, '#ff8aa8', '#d85a7a'); eyes(c, 40, 60, 42, 4); cheeks(c, 30, 70, 52); c.beginPath(); C(c, 50, 54, 4); fs(c, '#d85a7a'); c.fillStyle = 'rgba(255,255,255,.45)'; E(c, 34, 26, 6, 4, -0.5); c.fill(); },
  // ===== P =====
  c_pen: c => { c.save(); c.translate(50, 50); c.rotate(0.7); R(c, -7, -40, 14, 62, 4); fs(c, '#4a7ae0', '#2a4aa8'); P(c, [[-7, 22], [7, 22], [0, 40]]); fs(c, '#f0e0c0', '#a8905a', 2); P(c, [[-2, 34], [2, 34], [0, 40]]); fs(c, INK); R(c, 7, -36, 4, 26, 2); fs(c, '#c8d0e0'); R(c, -7, -44, 14, 8, 3); fs(c, '#2a4aa8'); c.restore(); },
  c_pig: c => { [[30, 24], [70, 24]].forEach(([x, y], i) => { P(c, [[x - 10, y + 12], [x + (i ? 6 : -6), y - 8], [x + 10, y + 12]]); fs(c, '#ffb0c4', '#e07a96'); }); C(c, 50, 54, 32); fs(c, '#ffc4d4', '#e07a96'); eyes(c, 38, 62, 46, 3.6); E(c, 50, 62, 12, 9); fs(c, '#ff9ab4', '#e07a96', 2); C(c, 46, 62, 2.2); fs(c, INK); C(c, 54, 62, 2.2); fs(c, INK); cheeks(c, 28, 72, 58); },
  c_pearl: c => { c.beginPath(); c.moveTo(10, 70); c.quadraticCurveTo(50, 98, 90, 70); c.quadraticCurveTo(50, 80, 10, 70); fs(c, '#e8c8d8', '#a8889a'); c.beginPath(); c.moveTo(12, 66); c.quadraticCurveTo(14, 16, 50, 14); c.quadraticCurveTo(86, 16, 88, 66); c.quadraticCurveTo(50, 50, 12, 66); fs(c, '#f4dce8', '#a8889a'); c.strokeStyle = '#c8a8b8'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(50, 56); c.lineTo(50 + i * 16, 20); c.stroke(); } const g = c.createRadialGradient(44, 62, 2, 50, 68, 14); g.addColorStop(0, '#fff'); g.addColorStop(1, '#d8d0f0'); C(c, 50, 68, 13); c.fillStyle = g; c.fill(); },
  // ===== Q =====
  c_quilt: c => { const cols = ['#ff8fb1', '#7ac8ff', '#ffd34f', '#8fe0a8']; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { R(c, 16 + x * 23, 18 + y * 23, 22, 22, 3); fs(c, cols[(x + y * 2) % 4], '#fff', 2); C(c, 27 + x * 23, 29 + y * 23, 3); fs(c, '#fff'); } c.strokeStyle = '#c8a8a8'; c.lineWidth = 1.5; c.setLineDash([3, 3]); R(c, 14, 16, 72, 72, 6); c.stroke(); c.setLineDash([]); },
  c_quiz: c => { R(c, 16, 14, 68, 62, 12); fs(c, '#7c6cf0', '#5a4ac8'); P(c, [[36, 74], [30, 90], [50, 74]]); fs(c, '#7c6cf0'); c.fillStyle = '#fff'; c.font = '800 46px sans-serif'; c.textAlign = 'center'; c.fillText('?', 50, 62); [[22, 22], [78, 70]].forEach(([x, y]) => { star(c, x, y, 5, 2, 4); fs(c, '#ffd34f'); }); },
  c_queen: c => {
    P(c, [[32, 28], [30, 12], [41, 20], [50, 8], [59, 20], [70, 12], [68, 28]]); fs(c, '#ffd34f', '#d8a020', 2); C(c, 50, 16, 3); fs(c, '#ff4a8a');
    c.fillStyle = '#a8703a'; c.beginPath(); c.arc(50, 50, 24, Math.PI, 0); c.lineTo(76, 76); c.lineTo(24, 76); c.closePath(); c.fill();
    C(c, 50, 48, 18); fs(c, '#ffe2c8', '#e0b898'); eyes(c, 43, 57, 47, 2.6); smile(c, 50, 53, 3.5); cheeks(c, 39, 61, 54);
    P(c, [[26, 96], [34, 68], [66, 68], [74, 96]]); fs(c, '#c87ae0', '#8a4aa8', 2);
  },
  // ===== R =====
  c_rock: c => { P(c, [[14, 80], [20, 50], [38, 30], [62, 28], [82, 46], [88, 80]]); fs(c, '#a8a0b0', '#6a6278'); c.fillStyle = 'rgba(255,255,255,.35)'; P(c, [[38, 30], [62, 28], [56, 42], [34, 46]]); c.fill(); c.strokeStyle = '#6a6278'; c.lineWidth = 2; c.beginPath(); c.moveTo(56, 42); c.lineTo(60, 64); c.moveTo(34, 46); c.lineTo(26, 70); c.stroke(); },
  c_robot: c => { c.strokeStyle = '#7a8aa8'; c.lineWidth = 3; c.beginPath(); c.moveTo(50, 20); c.lineTo(50, 8); c.stroke(); C(c, 50, 8, 4); fs(c, '#ff6b6b'); R(c, 28, 20, 44, 32, 8); fs(c, '#c8d4e8', '#7a8aa8'); R(c, 34, 28, 32, 16, 5); fs(c, '#4a5a7a'); C(c, 42, 36, 4); fs(c, '#7affc8'); C(c, 58, 36, 4); fs(c, '#7affc8'); R(c, 30, 56, 40, 32, 6); fs(c, '#a8b8d8', '#7a8aa8'); [[40, 66, '#ff6b6b'], [50, 66, '#ffd34f'], [60, 66, '#5ac87a']].forEach(([x, y, col]) => { C(c, x, y, 3.5); fs(c, col); }); [[18, 58], [76, 58]].forEach(([x, y]) => { R(c, x, y, 8, 22, 4); fs(c, '#c8d4e8', '#7a8aa8', 2); }); },
  c_rainbow: c => { ['#ff6b6b', '#ffa030', '#ffe84a', '#5ac87a', '#4ab0ff', '#9a6af0'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.arc(50, 78, 40 - i * 6, Math.PI, 0); c.stroke(); }); [[14, 80], [86, 80]].forEach(([x, y]) => { [-8, 0, 8].forEach(d => { C(c, x + d, y, 8); fs(c, '#fff', '#d8e4f0', 1.5); }); }); },
  // ===== S =====
  c_sock: c => { c.beginPath(); c.moveTo(34, 12); c.lineTo(62, 12); c.lineTo(62, 58); c.quadraticCurveTo(64, 70, 80, 72); c.quadraticCurveTo(92, 76, 88, 86); c.quadraticCurveTo(80, 92, 56, 88); c.quadraticCurveTo(34, 84, 34, 62); c.closePath(); fs(c, '#ff8fb1', '#d8608a'); c.fillStyle = '#fff'; c.fillRect(34, 12, 28, 10); [32, 44].forEach(y => { c.fillStyle = '#ffd34f'; c.fillRect(35, y, 26, 5); }); },
  c_ship: c => { c.strokeStyle = '#8a5a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(50, 64); c.lineTo(50, 12); c.stroke(); P(c, [[52, 14], [80, 52], [52, 52]]); fs(c, '#fff', '#a8b8d0'); P(c, [[48, 20], [26, 52], [48, 52]]); fs(c, '#ffe8e8', '#a8b8d0'); P(c, [[12, 62], [88, 62], [76, 82], [24, 82]]); fs(c, '#c8703a', '#8a4a2a'); P(c, [[50, 12], [64, 16], [50, 20]]); fs(c, '#ff4a6a'); c.strokeStyle = '#5ab0f0'; c.lineWidth = 3; c.beginPath(); for (let x = 6; x < 94; x += 12) { c.moveTo(x, 90); c.quadraticCurveTo(x + 3, 86, x + 6, 90); c.quadraticCurveTo(x + 9, 94, x + 12, 90); } c.stroke(); },
  c_star: c => { star(c, 50, 54, 40, 17); fs(c, '#ffd34f', '#d8a020'); eyes(c, 43, 57, 52, 3); smile(c, 50, 58, 4); cheeks(c, 37, 63, 60); },
  // ===== T =====
  c_toy: c => { R(c, 20, 52, 28, 28, 4); fs(c, '#ff6b6b', '#c84a4a'); R(c, 52, 52, 28, 28, 4); fs(c, '#4ab0ff', '#2a70c8'); R(c, 36, 24, 28, 28, 4); fs(c, '#ffd34f', '#d8a020'); c.fillStyle = '#fff'; c.font = '800 20px sans-serif'; c.textAlign = 'center'; c.fillText('A', 34, 73); c.fillText('B', 66, 73); c.fillText('C', 50, 45); },
  c_train: c => { R(c, 10, 40, 50, 36, 6); fs(c, '#ff6b6b', '#c84a4a'); R(c, 16, 46, 16, 14, 3); fs(c, '#bfe8ff'); R(c, 60, 52, 30, 24, 6); fs(c, '#ff8a6a', '#c84a4a'); R(c, 66, 36, 10, 16, 2); fs(c, '#5a4a4a'); [[22, 80], [46, 80], [74, 80]].forEach(([x, y]) => { C(c, x, y, 8); fs(c, '#4a4a5a', '#2a2a3a', 2); C(c, x, y, 3); fs(c, '#c8c8d8'); }); [[70, 28, 5], [62, 18, 6], [52, 10, 7]].forEach(([x, y, r]) => { C(c, x, y, r); fs(c, 'rgba(220,220,230,.9)'); }); },
  c_treasure: c => {
    R(c, 16, 50, 68, 38, 6); fs(c, '#c8803a', '#8a4a1a'); c.beginPath(); c.moveTo(16, 50); c.quadraticCurveTo(50, 14, 84, 50); fs(c, '#a8602a', '#8a4a1a');
    [[30, 44], [46, 36], [60, 40], [70, 46], [40, 46]].forEach(([x, y]) => { C(c, x, y, 7); fs(c, '#ffd34f', '#d8a020', 1.5); });
    gem(c, 52, 32, 7, '#ff5a8a', '#c82a5a');
    c.fillStyle = '#ffd34f'; c.fillRect(16, 60, 68, 6); c.fillRect(46, 50, 8, 38); R(c, 44, 62, 12, 12, 2); fs(c, '#ffe066', '#d8a020', 2);
    [[14, 22], [86, 26], [50, 10]].forEach(([x, y], i) => { star(c, x, y, 6 - i, 2.4, 4); fs(c, '#fff8c8'); });
  },
  // ===== U =====
  c_umbrella: c => { c.beginPath(); c.moveTo(12, 50); c.quadraticCurveTo(14, 14, 50, 14); c.quadraticCurveTo(86, 14, 88, 50); for (let i = 0; i < 4; i++) { const x = 88 - i * 19; c.quadraticCurveTo(x - 9.5, 42, x - 19, 50); } fs(c, '#9a6af0', '#6a3ac8'); c.strokeStyle = '#6a3ac8'; c.lineWidth = 2; c.beginPath(); c.moveTo(50, 14); c.quadraticCurveTo(40, 30, 31, 50); c.moveTo(50, 14); c.quadraticCurveTo(60, 30, 69, 50); c.stroke(); c.strokeStyle = '#5a4a4a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 50); c.lineTo(50, 82); c.arc(44, 82, 6, 0, Math.PI); c.stroke(); },
  c_uniform: c => { P(c, [[30, 18], [42, 14], [50, 26], [58, 14], [70, 18], [88, 34], [78, 48], [72, 42], [72, 88], [28, 88], [28, 42], [22, 48], [12, 34]]); fs(c, '#3a5aa8', '#1a3a78'); P(c, [[42, 14], [50, 40], [58, 14], [50, 26]]); fs(c, '#fff'); P(c, [[46, 30], [54, 30], [52, 46], [48, 46]]); fs(c, '#ff4a6a'); c.fillStyle = '#ffd34f'; [52, 62, 72].forEach(y => { C(c, 50, y, 2.6); c.fill(); }); },
  c_unicorn: c => {
    E(c, 54, 60, 26, 16); fs(c, '#fff', '#d8c8e8'); [[38, 72], [48, 74], [62, 74], [72, 72]].forEach(([x, y]) => { R(c, x - 4, y, 8, 18, 3); fs(c, '#fff', '#d8c8e8', 2); });
    P(c, [[30, 56], [22, 26], [32, 22], [44, 48]]); fs(c, '#fff', '#d8c8e8'); E(c, 22, 30, 13, 10, -0.5); fs(c, '#fff', '#d8c8e8');
    P(c, [[24, 20], [30, 2], [32, 22]]); fs(c, '#ffd34f', '#d8a020', 2);
    ['#ff9ad0', '#9ac8ff', '#c89af0'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(34 + i * 3, 22 + i * 6); c.quadraticCurveTo(48 + i * 2, 30 + i * 6, 42 + i * 3, 50 + i * 2); c.stroke(); c.beginPath(); c.moveTo(80, 54 + i * 4); c.quadraticCurveTo(94, 60 + i * 4, 88, 76 + i * 3); c.stroke(); });
    eyes(c, 22, 22, 28, 2.4); cheeks(c, 16, 16, 36);
  },
  // ===== V =====
  c_vase: c => { c.beginPath(); c.moveTo(38, 14); c.lineTo(62, 14); c.quadraticCurveTo(58, 30, 70, 46); c.quadraticCurveTo(84, 70, 62, 90); c.lineTo(38, 90); c.quadraticCurveTo(16, 70, 30, 46); c.quadraticCurveTo(42, 30, 38, 14); fs(c, '#5ab0e0', '#2a78b0'); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(28, 60); c.quadraticCurveTo(50, 50, 72, 60); c.stroke(); [[40, 70], [60, 70], [50, 78]].forEach(([x, y]) => { C(c, x, y, 3.4); fs(c, '#ffd34f'); }); E(c, 50, 14, 12, 3); fs(c, '#2a78b0'); },
  c_violin: c => { c.save(); c.translate(50, 50); c.rotate(-0.5); c.translate(-50, -50); R(c, 46, 4, 8, 36, 2); fs(c, '#5a3a2a'); c.beginPath(); c.moveTo(50, 30); c.bezierCurveTo(30, 30, 30, 50, 40, 56); c.bezierCurveTo(26, 62, 28, 92, 50, 92); c.bezierCurveTo(72, 92, 74, 62, 60, 56); c.bezierCurveTo(70, 50, 70, 30, 50, 30); fs(c, '#c8702a', '#8a4a1a'); c.strokeStyle = '#5a3a2a'; c.lineWidth = 2; [[40, 64], [60, 64]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 6); c.quadraticCurveTo(x + (x < 50 ? -3 : 3), y, x, y + 6); c.stroke(); }); c.strokeStyle = '#fff'; c.lineWidth = 0.8; c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(50 + i * 2, 6); c.lineTo(50 + i * 2, 80); } c.stroke(); c.restore(); c.strokeStyle = '#a8763a'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, 30); c.lineTo(84, 86); c.stroke(); },
  c_volcano: c => { P(c, [[6, 90], [36, 36], [64, 36], [94, 90]]); fs(c, '#8a6a5a', '#5a4a3a'); P(c, [[36, 36], [44, 52], [50, 44], [56, 56], [64, 36]]); fs(c, '#ff5a2a'); c.fillStyle = '#ff7a2a'; [[42, 26, 9], [56, 20, 8], [50, 12, 7]].forEach(([x, y, r]) => { C(c, x, y, r); c.fill(); }); c.fillStyle = '#ffd34f'; [[46, 26, 4], [54, 18, 3]].forEach(([x, y, r]) => { C(c, x, y, r); c.fill(); }); c.fillStyle = '#ff5a2a'; c.beginPath(); c.moveTo(44, 50); c.quadraticCurveTo(38, 70, 30, 76); c.lineTo(36, 76); c.quadraticCurveTo(44, 66, 48, 52); c.fill(); },
  // ===== W =====
  c_watch: c => { R(c, 40, 6, 20, 88, 6); fs(c, '#a8763a', '#6a4a1a'); C(c, 50, 50, 24); fs(c, '#ffd34f', '#d8a020'); C(c, 50, 50, 19); fs(c, '#fff', '#d8c8b8', 1.5); c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 50); c.lineTo(50, 37); c.moveTo(50, 50); c.lineTo(60, 54); c.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; C(c, 50 + Math.cos(a) * 15, 50 + Math.sin(a) * 15, 1.2); fs(c, INK); } },
  c_whale: c => { c.beginPath(); c.moveTo(10, 60); c.quadraticCurveTo(10, 30, 46, 30); c.quadraticCurveTo(78, 30, 80, 56); c.lineTo(94, 44); c.lineTo(92, 70); c.lineTo(80, 64); c.quadraticCurveTo(70, 82, 40, 82); c.quadraticCurveTo(10, 82, 10, 60); fs(c, '#5a8ae0', '#3a5ab0'); c.beginPath(); c.moveTo(14, 66); c.quadraticCurveTo(40, 86, 72, 70); c.quadraticCurveTo(40, 76, 14, 66); fs(c, '#d8e8ff'); eyes(c, 26, 26, 52, 3); smile(c, 30, 60, 5); c.strokeStyle = '#7ac8ff'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(40, 28); c.quadraticCurveTo(36, 14, 28, 12); c.moveTo(40, 28); c.quadraticCurveTo(44, 14, 52, 12); c.stroke(); },
  c_wand: c => { c.strokeStyle = '#7a5aa8'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(22, 88); c.lineTo(60, 42); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(24, 84); c.lineTo(56, 46); c.stroke(); star(c, 66, 32, 20, 8); fs(c, '#ffd34f', '#d8a020'); [[86, 14], [88, 52], [42, 18]].forEach(([x, y], i) => { star(c, x, y, 6 - i, 2.2, 4); fs(c, '#fff3a8'); }); },
  // ===== X =====
  c_xray: c => { R(c, 14, 12, 72, 78, 8); fs(c, '#2a3a5a', '#1a2a3a'); c.strokeStyle = '#e8f4ff'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 22); c.lineTo(50, 80); for (let i = 0; i < 4; i++) { const y = 34 + i * 10; c.moveTo(50, y); c.quadraticCurveTo(36, y - 2, 28, y + 6); c.moveTo(50, y); c.quadraticCurveTo(64, y - 2, 72, y + 6); } c.stroke(); C(c, 50, 22, 7); c.stroke(); },
  c_xylophone: c => { const cols = ['#ff6b6b', '#ffa030', '#ffe84a', '#5ac87a', '#4ab0ff', '#9a6af0']; cols.forEach((col, i) => { R(c, 12 + i * 13, 24 + i * 4, 11, 56 - i * 8, 3); fs(c, col, 'rgba(0,0,0,.2)', 1.5); C(c, 17.5 + i * 13, 30 + i * 4, 1.8); fs(c, '#fff'); }); c.strokeStyle = '#a8763a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(60, 92); c.lineTo(86, 66); c.stroke(); C(c, 88, 64, 5); fs(c, '#ff8fb1'); },
  c_xmastree: c => { R(c, 44, 80, 12, 12, 2); fs(c, '#8a5a3a'); [[50, 18, 22, 44], [50, 34, 28, 62], [50, 52, 34, 82]].forEach(([x, top, w, bot]) => { P(c, [[x, top], [x + w, bot], [x - w, bot]]); fs(c, '#3aa85a', '#2a784a', 2); }); [[42, 46, '#ff4a6a'], [60, 58, '#4ab0ff'], [38, 70, '#ffd34f'], [62, 76, '#ff4a6a'], [52, 66, '#fff']].forEach(([x, y, col]) => { C(c, x, y, 3.6); fs(c, col); }); star(c, 50, 16, 10, 4); fs(c, '#ffd34f', '#d8a020', 2); },
  // ===== Y =====
  c_yoyo: c => { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(50, 4); c.lineTo(50, 34); c.stroke(); C(c, 50, 30, 3); fs(c, INK); C(c, 50, 60, 30); fs(c, '#ff6b6b', '#c84a4a'); C(c, 50, 60, 20); fs(c, '#ff8a8a'); C(c, 50, 60, 6); fs(c, '#ffd34f', '#d8a020', 2); c.fillStyle = 'rgba(255,255,255,.5)'; E(c, 38, 46, 6, 3, -0.6); c.fill(); },
  c_yarn: c => { C(c, 50, 54, 32); fs(c, '#ff8fb1', '#d8608a'); c.strokeStyle = '#d8608a'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(50, 54, 30, 10 + i * 4, -0.6 + i * 0.35, 0, Math.PI * 2); c.stroke(); } c.strokeStyle = '#ff8fb1'; c.lineWidth = 3; c.beginPath(); c.moveTo(78, 70); c.quadraticCurveTo(94, 80, 84, 92); c.stroke(); },
  c_yacht: c => { c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(48, 70); c.lineTo(48, 8); c.stroke(); P(c, [[50, 10], [84, 62], [50, 62]]); fs(c, '#ffe0a8', '#c8a060'); P(c, [[46, 18], [20, 62], [46, 62]]); fs(c, '#ff8a8a', '#c84a4a'); P(c, [[14, 68], [86, 68], [74, 84], [26, 84]]); fs(c, '#fff', '#8aa8c8'); c.fillStyle = '#4ab0ff'; c.fillRect(22, 72, 56, 4); c.strokeStyle = '#5ab0f0'; c.lineWidth = 3; c.beginPath(); for (let x = 6; x < 94; x += 12) { c.moveTo(x, 90); c.quadraticCurveTo(x + 3, 86, x + 6, 90); c.quadraticCurveTo(x + 9, 94, x + 12, 90); } c.stroke(); },
  // ===== Z =====
  c_zero: c => { c.lineWidth = 14; c.strokeStyle = '#7c6cf0'; E(c, 50, 52, 22, 34); c.stroke(); c.lineWidth = 4; c.strokeStyle = '#b8b0ff'; E(c, 46, 48, 20, 31); c.stroke(); },
  c_zipper: c => { R(c, 30, 8, 40, 84, 6); fs(c, '#5a7ac8', '#3a5aa8'); c.fillStyle = '#d8d8e0'; for (let y = 14; y < 88; y += 7) { c.fillRect(44, y, 6, 4); c.fillRect(50, y + 3.5, 6, 4); } R(c, 42, 40, 16, 14, 3); fs(c, '#e8e8f0', '#8a8aa0', 2); R(c, 46, 52, 8, 18, 3); fs(c, '#e8e8f0', '#8a8aa0', 2); },
  c_zebra: c => {
    E(c, 56, 58, 26, 15); fs(c, '#fff', INK, 2.5); [[38, 70], [48, 72], [62, 72], [72, 70]].forEach(([x, y]) => { R(c, x - 4, y, 8, 20, 3); fs(c, '#fff', INK, 2); });
    P(c, [[30, 54], [22, 24], [32, 20], [44, 48]]); fs(c, '#fff', INK, 2.5); E(c, 20, 28, 12, 9, -0.5); fs(c, '#fff', INK, 2.5);
    c.save(); E(c, 56, 58, 26, 15); c.clip(); c.strokeStyle = INK; c.lineWidth = 4; for (let x = 36; x < 84; x += 9) { c.beginPath(); c.moveTo(x, 40); c.quadraticCurveTo(x + 4, 58, x - 2, 76); c.stroke(); } c.restore();
    c.strokeStyle = INK; c.lineWidth = 3; [[26, 30, 34, 34], [30, 38, 40, 40]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
    c.fillStyle = INK; P(c, [[24, 20], [36, 20], [44, 44], [36, 30]]); c.fill(); eyes(c, 20, 20, 25, 2.2); E(c, 10, 32, 5, 4); fs(c, '#5a5a5a');
  },
  // ===== カードの うら・ゆかに おちている カード =====
  dg_tcard: c => {
    c.save(); c.translate(50, 52); c.rotate(-0.15);
    R(c, -24, -32, 48, 64, 7); fs(c, '#7c6cf0', '#4a3ac8');
    R(c, -18, -26, 36, 52, 5); fs(c, '#9a8af8'); star(c, 0, 0, 13, 5.5); fs(c, '#ffd34f', '#d8a020', 2);
    c.restore(); [[80, 18], [18, 24]].forEach(([x, y], i) => { star(c, x, y, 6 - i, 2.4, 4); fs(c, '#fff8c8'); });
  },
});

// え：ダンジョンの モンスター・アイテム・まほう・マップ。すべて コードで かく オリジナル（0〜100 の しかく）
// ABCぼうけんの WORD_ART に たして、wordArt() で カードや ずかんにも つかう
import { WORD_ART, wordArt } from '../../abc/js/engine/art.js';
import '../../abc/js/engine/art2.js';
import '../../abc/js/engine/art3.js';
import './cardart.js'; // たからさがしの カードの え
export { wordArt };

const INK = '#4a3a3a';
const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
function eyes(c, x1, x2, y, r = 4, mood = '') {
  if (mood === 'angry') { c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; [[x1, 1], [x2, -1]].forEach(([x, s]) => { c.beginPath(); c.moveTo(x - 6 * s, y - 9); c.lineTo(x + 4 * s, y - 5); c.stroke(); }); }
  c.fillStyle = INK; [x1, x2].forEach(x => { circle(c, x, y, r); c.fill(); }); c.fillStyle = '#fff'; [x1, x2].forEach(x => { circle(c, x + r * 0.35, y - r * 0.4, r * 0.35); c.fill(); });
}
const cheeks = (c, x1, x2, y) => { c.fillStyle = 'rgba(255,120,150,.45)'; [x1, x2].forEach(x => { c.beginPath(); c.ellipse(x, y, 5, 3.2, 0, 0, Math.PI * 2); c.fill(); }); };
function slime(c, col, dark, crown) {
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(50, 88, 34, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(14, 84); c.quadraticCurveTo(10, 40, 50, 26); c.quadraticCurveTo(90, 40, 86, 84); c.quadraticCurveTo(50, 92, 14, 84); c.fill();
  c.strokeStyle = dark; c.lineWidth = 3; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(32, 48, 6, 10, 0.5, 0, Math.PI * 2); c.fill();
  eyes(c, 40, 60, 60, 4.5); cheeks(c, 30, 70, 70);
  c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(50, 68, 6, 0.3, Math.PI - 0.3); c.stroke();
  if (crown) { c.fillStyle = '#ffd34f'; c.strokeStyle = '#e5a91c'; c.lineWidth = 2; c.beginPath(); c.moveTo(34, 30); c.lineTo(34, 14); c.lineTo(42, 22); c.lineTo(50, 10); c.lineTo(58, 22); c.lineTo(66, 14); c.lineTo(66, 30); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#ff6b8a'; circle(c, 50, 22, 3); c.fill(); }
}

Object.assign(WORD_ART, {
  dg_slime: c => slime(c, '#8fdcff', '#4aa8d8'),
  dg_kingslime: c => slime(c, '#c3a8ff', '#8a6ad8', true),
  dg_rat: c => {
    c.strokeStyle = '#c7a8b8'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(78, 74); c.quadraticCurveTo(96, 70, 90, 50); c.stroke();
    c.fillStyle = '#b8b0c0'; c.beginPath(); c.ellipse(52, 66, 30, 22, 0, 0, Math.PI * 2); c.fill();
    [[30, 32], [64, 30]].forEach(([x, y]) => { c.fillStyle = '#b8b0c0'; circle(c, x, y, 12); c.fill(); c.fillStyle = '#f5c8d6'; circle(c, x, y, 7); c.fill(); });
    c.fillStyle = '#c8c0d0'; circle(c, 46, 48, 22); c.fill();
    eyes(c, 38, 54, 46, 3.5); c.fillStyle = '#ff8fb1'; circle(c, 46, 56, 4); c.fill();
    c.strokeStyle = '#8a8296'; c.lineWidth = 1.5; [[-1, 54], [1, 54], [-1, 58], [1, 58]].forEach(([s, y]) => { c.beginPath(); c.moveTo(46 + s * 6, y); c.lineTo(46 + s * 20, y - 2 + (y - 56)); c.stroke(); });
  },
  dg_bat: c => {
    c.fillStyle = '#7a6aa8'; c.strokeStyle = '#5a4a88'; c.lineWidth = 2;
    [1, -1].forEach(s => { c.beginPath(); c.moveTo(50, 50); c.quadraticCurveTo(50 + s * 30, 20, 50 + s * 46, 34); c.quadraticCurveTo(50 + s * 40, 44, 50 + s * 42, 56); c.quadraticCurveTo(50 + s * 32, 50, 50 + s * 26, 62); c.quadraticCurveTo(50 + s * 18, 52, 50, 60); c.fill(); c.stroke(); });
    c.fillStyle = '#8f80c0'; circle(c, 50, 54, 18); c.fill(); c.stroke();
    [[-1, 0], [1, 0]].forEach(([s]) => { c.beginPath(); c.moveTo(50 + s * 6, 40); c.lineTo(50 + s * 14, 26); c.lineTo(50 + s * 16, 42); c.fill(); });
    eyes(c, 43, 57, 52, 3.5); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(46, 62); c.lineTo(48, 67); c.lineTo(50, 62); c.moveTo(50, 62); c.lineTo(52, 67); c.lineTo(54, 62); c.fill();
  },
  dg_snake: c => {
    c.strokeStyle = '#6cc070'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(20, 80); c.quadraticCurveTo(40, 60, 60, 80); c.quadraticCurveTo(80, 96, 86, 74); c.stroke();
    c.strokeStyle = '#a8e09a'; c.lineWidth = 5; c.setLineDash([4, 8]); c.beginPath(); c.moveTo(20, 80); c.quadraticCurveTo(40, 60, 60, 80); c.quadraticCurveTo(80, 96, 86, 74); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#6cc070'; c.lineWidth = 14; c.beginPath(); c.moveTo(22, 78); c.quadraticCurveTo(16, 52, 34, 40); c.stroke();
    c.fillStyle = '#7ad07e'; c.beginPath(); c.ellipse(42, 36, 20, 16, -0.2, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#4a9a4e'; c.lineWidth = 2.5; c.stroke();
    eyes(c, 36, 50, 32, 3.5); cheeks(c, 30, 56, 42);
    c.strokeStyle = '#ff5a6a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(60, 40); c.lineTo(70, 42); c.moveTo(70, 42); c.lineTo(75, 38); c.moveTo(70, 42); c.lineTo(75, 46); c.stroke();
  },
  dg_angrypig: c => {
    c.fillStyle = '#ffb0c4'; c.strokeStyle = '#e07a96'; c.lineWidth = 3;
    [[30, 26, -0.4], [70, 26, 0.4]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.moveTo(-9, 8); c.lineTo(0, -10); c.lineTo(9, 8); c.closePath(); c.fill(); c.stroke(); c.restore(); });
    circle(c, 50, 56, 32); c.fill(); c.stroke();
    eyes(c, 38, 62, 48, 4, 'angry');
    c.fillStyle = '#ff8fab'; c.beginPath(); c.ellipse(50, 64, 12, 9, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = INK; circle(c, 46, 64, 2.2); c.fill(); circle(c, 54, 64, 2.2); c.fill();
    c.fillStyle = '#ff5a5f'; c.font = '800 20px sans-serif'; c.fillText('!', 80, 30); // おこっている しるし
    c.strokeStyle = '#ff5a5f'; c.lineWidth = 3; c.beginPath(); c.moveTo(14, 28); c.lineTo(22, 22); c.moveTo(16, 36); c.lineTo(24, 34); c.stroke();
  },
  dg_bread: c => {
    c.fillStyle = '#e8b06a'; c.strokeStyle = '#b8803a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(16, 70); c.quadraticCurveTo(12, 34, 50, 30); c.quadraticCurveTo(88, 34, 84, 70); c.quadraticCurveTo(50, 80, 16, 70); c.fill(); c.stroke();
    c.strokeStyle = '#fff2d8'; c.lineWidth = 4; c.lineCap = 'round'; [[34, 44, 40, 56], [48, 40, 54, 54], [62, 44, 68, 56]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
  },
  dg_meat: c => {
    c.fillStyle = '#fff6e8'; c.strokeStyle = '#d8c8a8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(66, 66); c.lineTo(84, 84); c.lineWidth = 8; c.strokeStyle = '#fff6e8'; c.stroke();
    [[82, 80], [88, 86]].forEach(([x, y]) => { c.fillStyle = '#fff6e8'; circle(c, x, y, 6); c.fill(); });
    c.fillStyle = '#c8604a'; c.strokeStyle = '#984030'; c.lineWidth = 3; c.beginPath(); c.ellipse(46, 46, 30, 24, -0.6, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(36, 36, 8, 5, -0.6, 0, Math.PI * 2); c.fill();
  },
  dg_potion: c => {
    c.fillStyle = '#ff8fc8'; c.strokeStyle = '#d0609a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(42, 34); c.lineTo(42, 44); c.quadraticCurveTo(20, 54, 24, 74); c.quadraticCurveTo(30, 92, 50, 92); c.quadraticCurveTo(70, 92, 76, 74); c.quadraticCurveTo(80, 54, 58, 44); c.lineTo(58, 34); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c98f55'; rr(c, 40, 20, 20, 14, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(36, 66, 4, 9, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50, 60); c.bezierCurveTo(40, 52, 36, 66, 50, 76); c.bezierCurveTo(64, 66, 60, 52, 50, 60); c.fill();
  },
  dg_book: c => {
    c.fillStyle = '#7c6cf0'; c.strokeStyle = '#5a4ac8'; c.lineWidth = 3; rr(c, 20, 18, 60, 70, 6); c.fill(); c.stroke();
    c.fillStyle = '#fff6e0'; c.fillRect(74, 22, 6, 62);
    c.fillStyle = '#ffd34f'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 8 : 17; i ? c.lineTo(48 + q * Math.cos(a), 52 + q * Math.sin(a)) : c.moveTo(48 + q * Math.cos(a), 52 + q * Math.sin(a)); } c.fill();
  },
  dg_feather: c => {
    c.fillStyle = '#ffffff'; c.strokeStyle = '#c8d8f0'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(30, 86); c.quadraticCurveTo(24, 40, 70, 14); c.quadraticCurveTo(84, 44, 30, 86); c.fill(); c.stroke();
    c.strokeStyle = '#b0c4e8'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, 86); c.quadraticCurveTo(48, 50, 70, 14); c.stroke();
    c.fillStyle = 'rgba(255,230,120,.6)'; circle(c, 70, 22, 10); c.fill();
  },
  dg_sword: c => sword(c, {}),
  dg_shield: c => shield(c, {}),
  dg_fire: c => {
    c.fillStyle = '#ff7a3a'; c.beginPath(); c.moveTo(50, 10); c.bezierCurveTo(72, 34, 86, 50, 78, 70); c.quadraticCurveTo(70, 90, 50, 90); c.quadraticCurveTo(28, 90, 22, 70); c.bezierCurveTo(16, 50, 34, 40, 40, 24); c.bezierCurveTo(44, 36, 48, 30, 50, 10); c.fill();
    c.fillStyle = '#ffd34f'; c.beginPath(); c.moveTo(50, 44); c.bezierCurveTo(62, 58, 66, 70, 60, 80); c.quadraticCurveTo(50, 88, 40, 80); c.bezierCurveTo(34, 70, 40, 60, 50, 44); c.fill();
  },
  dg_heal: c => {
    c.fillStyle = '#8fe0a8'; circle(c, 50, 50, 36); c.fill(); c.strokeStyle = '#4fbf6f'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#fff'; rr(c, 42, 26, 16, 48, 4); c.fill(); rr(c, 26, 42, 48, 16, 4); c.fill();
    c.fillStyle = '#ff8fb1'; c.beginPath(); c.moveTo(78, 22); c.bezierCurveTo(70, 12, 60, 22, 78, 34); c.bezierCurveTo(96, 22, 86, 12, 78, 22); c.fill();
  },
  dg_box: c => {
    c.fillStyle = '#c98f55'; c.strokeStyle = '#8f5e33'; c.lineWidth = 3; rr(c, 14, 44, 72, 42, 5); c.fill(); c.stroke();
    c.fillStyle = '#d9a066'; c.beginPath(); c.moveTo(14, 46); c.quadraticCurveTo(14, 22, 50, 22); c.quadraticCurveTo(86, 22, 86, 46); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffd34f'; c.fillRect(14, 42, 72, 6); c.fillRect(44, 22, 12, 64); rr(c, 42, 50, 16, 14, 3); c.fill(); c.fillStyle = INK; circle(c, 50, 55, 2.5); c.fill(); c.fillRect(49, 55, 2, 6);
  },
  dg_boxopen: c => {
    c.fillStyle = '#8f5e33'; rr(c, 14, 44, 72, 42, 5); c.fill();
    c.fillStyle = '#c98f55'; c.strokeStyle = '#8f5e33'; c.lineWidth = 3; rr(c, 14, 52, 72, 34, 5); c.fill(); c.stroke();
    c.fillStyle = '#d9a066'; c.beginPath(); c.moveTo(14, 44); c.lineTo(20, 16); c.lineTo(80, 16); c.lineTo(86, 44); c.closePath(); c.fill(); c.stroke();
  },
  dg_stairs: c => {
    c.fillStyle = '#5a4a6a'; rr(c, 12, 12, 76, 76, 8); c.fill();
    for (let i = 0; i < 4; i++) { c.fillStyle = ['#efe4d2', '#e0d2bc', '#d0c0a8', '#bfae94'][i]; c.fillRect(18 + i * 8, 20 + i * 16, 64 - i * 16, 14); }
    c.fillStyle = '#ffd34f'; c.beginPath(); c.moveTo(50, 4); c.lineTo(60, 14); c.lineTo(40, 14); c.closePath(); c.fill();
  },
});

// ===== だい2かい：あたらしい てき・ボス・アイテム・まほう =====
function dragon(c, col, dark, belly, crown) {
  c.fillStyle = col; c.strokeStyle = dark; c.lineWidth = 3;
  // しっぽ・つばさ
  c.beginPath(); c.moveTo(70, 78); c.quadraticCurveTo(96, 80, 92, 60); c.lineTo(86, 66); c.quadraticCurveTo(84, 74, 68, 70); c.fill(); c.stroke();
  [1, -1].forEach(s => { c.beginPath(); c.moveTo(50 + s * 10, 52); c.lineTo(50 + s * 40, 26); c.lineTo(50 + s * 34, 44); c.lineTo(50 + s * 42, 48); c.lineTo(50 + s * 18, 62); c.closePath(); c.fill(); c.stroke(); });
  c.beginPath(); c.ellipse(50, 68, 24, 20, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = belly; c.beginPath(); c.ellipse(50, 72, 14, 13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(50, 40, 20, 17, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#fff3c4'; [38, 62].forEach(x => { c.beginPath(); c.moveTo(x - 4, 26); c.lineTo(x + (x < 50 ? -4 : 4), 14); c.lineTo(x + 4, 26); c.fill(); });
  eyes(c, 42, 58, 38, 3.8); c.fillStyle = INK; circle(c, 46, 48, 1.6); c.fill(); circle(c, 54, 48, 1.6); c.fill();
  if (crown) { c.fillStyle = '#ffd34f'; c.strokeStyle = '#e5a91c'; c.lineWidth = 2; c.beginPath(); c.moveTo(38, 24); c.lineTo(38, 12); c.lineTo(44, 18); c.lineTo(50, 8); c.lineTo(56, 18); c.lineTo(62, 12); c.lineTo(62, 24); c.closePath(); c.fill(); c.stroke(); }
}
function ghost(c, col, crown) {
  c.fillStyle = col; c.strokeStyle = '#9aa0c8'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(20, 86); c.lineTo(20, 46); c.quadraticCurveTo(20, 16, 50, 16); c.quadraticCurveTo(80, 16, 80, 46); c.lineTo(80, 86);
  for (let i = 0; i < 4; i++) { const x = 80 - i * 15; c.quadraticCurveTo(x - 4, 78, x - 7.5, 86); c.quadraticCurveTo(x - 11, 94, x - 15, 86); }
  c.closePath(); c.fill(); c.stroke();
  eyes(c, 40, 60, 46, 4.5); cheeks(c, 32, 68, 56);
  c.fillStyle = INK; c.beginPath(); c.ellipse(50, 62, 5, 6, 0, 0, Math.PI * 2); c.fill();
  [1, -1].forEach(s => { c.fillStyle = col; c.beginPath(); c.ellipse(50 + s * 32, 58, 7, 11, s * 0.6, 0, Math.PI * 2); c.fill(); c.stroke(); });
  if (crown) { c.fillStyle = '#ffd34f'; c.strokeStyle = '#e5a91c'; c.lineWidth = 2; c.beginPath(); c.moveTo(34, 22); c.lineTo(34, 8); c.lineTo(42, 16); c.lineTo(50, 4); c.lineTo(58, 16); c.lineTo(66, 8); c.lineTo(66, 22); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#7ad0ff'; circle(c, 50, 16, 3); c.fill(); }
}
Object.assign(WORD_ART, {
  dg_frog: c => {
    c.fillStyle = '#7ad07e'; c.strokeStyle = '#4a9a4e'; c.lineWidth = 3;
    [[24, 82], [76, 82]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 14, 6, 0, 0, Math.PI * 2); c.fill(); c.stroke(); });
    c.beginPath(); c.ellipse(50, 64, 32, 24, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    [36, 64].forEach(x => { c.fillStyle = '#7ad07e'; circle(c, x, 40, 12); c.fill(); c.stroke(); c.fillStyle = '#fff'; circle(c, x, 40, 7); c.fill(); c.fillStyle = INK; circle(c, x, 41, 4); c.fill(); });
    c.fillStyle = '#c8f0b0'; c.beginPath(); c.ellipse(50, 72, 18, 12, 0, 0, Math.PI * 2); c.fill();
    cheeks(c, 28, 72, 62); c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(50, 56, 12, 0.25, Math.PI - 0.25); c.stroke();
  },
  dg_spider: c => {
    c.strokeStyle = '#5a4a6a'; c.lineWidth = 4; c.lineCap = 'round';
    [-1, 1].forEach(s => [0, 1, 2, 3].forEach(i => { c.beginPath(); c.moveTo(50 + s * 12, 58 + i * 4); c.quadraticCurveTo(50 + s * 32, 38 + i * 10, 50 + s * 42, 56 + i * 12); c.stroke(); }));
    c.strokeStyle = '#ccc'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(50, 4); c.lineTo(50, 40); c.stroke();
    c.fillStyle = '#6a5a7e'; circle(c, 50, 64, 22); c.fill(); c.fillStyle = '#7c6a92'; circle(c, 50, 44, 15); c.fill();
    eyes(c, 44, 56, 44, 3.5); c.fillStyle = '#ff8fab'; circle(c, 50, 70, 5); c.fill();
  },
  dg_crab: c => {
    c.fillStyle = '#ff7a5a'; c.strokeStyle = '#c84a3a'; c.lineWidth = 3;
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(50 + s * 22, 64); c.lineTo(50 + s * 34, 44); c.stroke(); c.beginPath(); c.arc(50 + s * 36, 34, 11, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#ffe9e0'; c.beginPath(); c.moveTo(50 + s * 36, 34); c.lineTo(50 + s * 30, 22); c.lineTo(50 + s * 42, 24); c.fill(); c.fillStyle = '#ff7a5a';
      [0, 1, 2].forEach(i => { c.beginPath(); c.moveTo(50 + s * 22, 72 + i * 4); c.lineTo(50 + s * 40, 78 + i * 6); c.stroke(); }); });
    c.beginPath(); c.ellipse(50, 70, 28, 18, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    [42, 58].forEach(x => { c.beginPath(); c.moveTo(x, 56); c.lineTo(x, 46); c.stroke(); c.fillStyle = '#fff'; circle(c, x, 44, 5); c.fill(); c.fillStyle = INK; circle(c, x, 44, 2.8); c.fill(); c.fillStyle = '#ff7a5a'; });
    cheeks(c, 34, 66, 72); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(50, 72, 5, 0.3, Math.PI - 0.3); c.stroke();
  },
  dg_ghost: c => ghost(c, '#f2f4ff'),
  dg_ghostking: c => ghost(c, '#e4dcff', true),
  dg_wolf: c => {
    c.fillStyle = '#9aa2b8'; c.strokeStyle = '#6a7288'; c.lineWidth = 3;
    [[28, 30, -1], [72, 30, 1]].forEach(([x, y, s]) => { c.beginPath(); c.moveTo(x - 10, y + 14); c.lineTo(x + s * 4, y - 14); c.lineTo(x + 10, y + 14); c.closePath(); c.fill(); c.stroke(); });
    c.beginPath(); c.moveTo(20, 50); c.quadraticCurveTo(20, 24, 50, 26); c.quadraticCurveTo(80, 24, 80, 50); c.quadraticCurveTo(80, 82, 50, 88); c.quadraticCurveTo(20, 82, 20, 50); c.fill(); c.stroke();
    c.fillStyle = '#e8ecf4'; c.beginPath(); c.moveTo(34, 62); c.quadraticCurveTo(50, 50, 66, 62); c.quadraticCurveTo(62, 84, 50, 86); c.quadraticCurveTo(38, 84, 34, 62); c.fill();
    eyes(c, 38, 62, 50, 4, 'angry'); c.fillStyle = INK; c.beginPath(); c.ellipse(50, 66, 6, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(44, 76); c.quadraticCurveTo(50, 80, 56, 76); c.stroke();
  },
  dg_dragon: c => dragon(c, '#ff8a6a', '#c8563a', '#ffd9a8'),
  dg_bigdragon: c => dragon(c, '#a87ae0', '#6a46a8', '#f0d8ff', true),
  dg_queenbee: c => {
    WORD_ART.bee(c);
    c.fillStyle = '#ffd34f'; c.strokeStyle = '#e5a91c'; c.lineWidth = 2; c.beginPath(); c.moveTo(36, 22); c.lineTo(36, 8); c.lineTo(43, 15); c.lineTo(50, 4); c.lineTo(57, 15); c.lineTo(64, 8); c.lineTo(64, 22); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ff6b8a'; circle(c, 50, 15, 3); c.fill();
  },
  dg_banana: c => {
    c.fillStyle = '#ffe066'; c.strokeStyle = '#d8a820'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(22, 30); c.quadraticCurveTo(20, 80, 78, 78); c.quadraticCurveTo(84, 74, 78, 70); c.quadraticCurveTo(36, 70, 32, 28); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#8a6a3a'; c.fillRect(22, 22, 9, 10); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(30, 56, 3, 12, -0.3, 0, Math.PI * 2); c.fill();
  },
  dg_torch: c => {
    c.fillStyle = '#a8723a'; c.strokeStyle = '#7a4a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(42, 44); c.lineTo(58, 44); c.lineTo(54, 92); c.lineTo(46, 92); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ff9a3a'; c.beginPath(); c.moveTo(50, 6); c.quadraticCurveTo(72, 30, 62, 46); c.lineTo(38, 46); c.quadraticCurveTo(28, 30, 50, 6); c.fill();
    c.fillStyle = '#ffe066'; c.beginPath(); c.moveTo(50, 20); c.quadraticCurveTo(62, 36, 56, 46); c.lineTo(44, 46); c.quadraticCurveTo(38, 36, 50, 20); c.fill();
  },
  dg_rope: c => {
    c.strokeStyle = '#c89a5a'; c.lineWidth = 7; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(50, 56, 32 - i * 9, 22 - i * 6, 0, 0, Math.PI * 2); c.stroke(); }
    c.beginPath(); c.moveTo(78, 60); c.quadraticCurveTo(92, 76, 80, 92); c.stroke();
    c.strokeStyle = '#a8763a'; c.lineWidth = 1.5; c.setLineDash([3, 5]); for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(50, 56, 32 - i * 9, 22 - i * 6, 0, 0, Math.PI * 2); c.stroke(); } c.setLineDash([]);
  },
  dg_armor: c => armor(c, {}),
  dg_ice: c => {
    c.strokeStyle = '#5ab0f0'; c.lineWidth = 6; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.beginPath(); c.moveTo(50 - Math.cos(a) * 38, 50 - Math.sin(a) * 38); c.lineTo(50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38); c.stroke(); }
    c.lineWidth = 4; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = 50 + Math.cos(a) * 26, y = 50 + Math.sin(a) * 26; [-0.6, 0.6].forEach(o => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a + o) * 10, y + Math.sin(a + o) * 10); c.stroke(); }); }
    c.fillStyle = '#d8f0ff'; circle(c, 50, 50, 8); c.fill();
  },
  dg_thunder: c => {
    c.fillStyle = '#c8c8d8'; [[34, 26, 18], [56, 22, 20], [72, 30, 15]].forEach(([x, y, r]) => { circle(c, x, y, r); c.fill(); });
    c.fillStyle = '#ffd34f'; c.strokeStyle = '#e09a1c'; c.lineWidth = 3; c.beginPath(); c.moveTo(54, 36); c.lineTo(34, 64); c.lineTo(50, 64); c.lineTo(40, 94); c.lineTo(70, 56); c.lineTo(54, 56); c.lineTo(64, 36); c.closePath(); c.fill(); c.stroke();
  },
  dg_wind: c => {
    c.strokeStyle = '#6ac8b0'; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(10, 36); c.lineTo(62, 36); c.arc(62, 24, 12, Math.PI / 2, -Math.PI * 0.9, true); c.stroke();
    c.beginPath(); c.moveTo(16, 56); c.lineTo(76, 56); c.arc(76, 44, 12, Math.PI / 2, -Math.PI * 0.9, true); c.stroke();
    c.beginPath(); c.moveTo(10, 74); c.lineTo(54, 74); c.arc(54, 84, 10, -Math.PI / 2, Math.PI * 0.9); c.stroke();
  },
  dg_light: c => {
    c.strokeStyle = '#ffd34f'; c.lineWidth = 5; c.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(50 + Math.cos(a) * 28, 50 + Math.sin(a) * 28); c.lineTo(50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42); c.stroke(); }
    c.fillStyle = '#fff3a8'; circle(c, 50, 50, 22); c.fill(); c.fillStyle = '#ffe066'; circle(c, 50, 50, 14); c.fill();
  },
});

// ===== そうび：おなじ かたちで いろ・おおきさを かえる（big・strong・silver・gold）=====
function sparkle(c, x, y, r, col = '#fff') { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); }
function sword(c, o) {
  const bw = o.w || 6, len = o.len || 46, blade = o.blade || '#dfe6f0', edge = o.edge || '#8f9ab0', guard = o.guard || '#ffd34f', grip = o.grip || '#c98f55';
  c.save(); c.translate(50, 50 + (o.len ? (o.len - 46) * 0.25 : 0)); c.rotate(-0.8);
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 14; }
  c.fillStyle = blade; c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-bw, 10); c.lineTo(-bw, -len + 10); c.lineTo(0, -len); c.lineTo(bw, -len + 10); c.lineTo(bw, 10); c.closePath(); c.fill(); c.stroke();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-bw * 0.35, 6); c.lineTo(-bw * 0.35, -len + 14); c.stroke();
  c.fillStyle = guard; rr(c, -12 - bw, 10, 24 + bw * 2, 7, 3); c.fill(); c.fillStyle = grip; rr(c, -4, 17, 8, 20, 3); c.fill(); c.fillStyle = guard; circle(c, 0, 40, 5); c.fill();
  if (o.gem) { c.fillStyle = o.gem; circle(c, 0, 13.5, 3.5); c.fill(); }
  c.restore();
  (o.spark || []).forEach(([x, y, r]) => sparkle(c, x, y, r, o.sparkCol));
}
function shield(c, o) {
  const k = o.k || 1, fill = o.fill || '#5a8fe0', line = o.line || '#3a6ab8', mark = o.mark || '#ffd34f';
  c.save(); c.translate(50, 50); c.scale(k, k); c.translate(-50, -50);
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 12; }
  c.fillStyle = fill; c.strokeStyle = line; c.lineWidth = 3;
  c.beginPath(); c.moveTo(50, 14); c.lineTo(82, 24); c.quadraticCurveTo(82, 70, 50, 88); c.quadraticCurveTo(18, 70, 18, 24); c.closePath(); c.fill(); c.stroke(); c.shadowBlur = 0;
  if (o.rim) { c.strokeStyle = o.rim; c.lineWidth = 4; c.beginPath(); c.moveTo(50, 20); c.lineTo(76, 28); c.quadraticCurveTo(76, 66, 50, 82); c.quadraticCurveTo(24, 66, 24, 28); c.closePath(); c.stroke(); }
  if (o.rivets) { c.fillStyle = o.rim || '#ddd'; [[30, 30], [70, 30], [32, 62], [68, 62], [50, 78]].forEach(([x, y]) => { circle(c, x, y, 3); c.fill(); }); }
  c.fillStyle = mark; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 7 : 15; i ? c.lineTo(50 + q * Math.cos(a), 46 + q * Math.sin(a)) : c.moveTo(50 + q * Math.cos(a), 46 + q * Math.sin(a)); } c.fill();
  c.restore();
  (o.spark || []).forEach(([x, y, r]) => sparkle(c, x, y, r, o.sparkCol));
}
function armor(c, o) {
  const fill = o.fill || '#b8c4d8', line = o.line || '#6a7a96', chest = o.chest || '#dfe6f2', gem = o.gem || '#ffd34f';
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 12; }
  c.fillStyle = fill; c.strokeStyle = line; c.lineWidth = 3;
  c.beginPath(); c.moveTo(30, 20); c.lineTo(42, 16); c.quadraticCurveTo(50, 26, 58, 16); c.lineTo(70, 20); c.lineTo(88, 36); c.lineTo(78, 50); c.lineTo(72, 44); c.lineTo(72, 86); c.lineTo(28, 86); c.lineTo(28, 44); c.lineTo(22, 50); c.lineTo(12, 36); c.closePath(); c.fill(); c.stroke(); c.shadowBlur = 0;
  c.fillStyle = chest; c.beginPath(); c.moveTo(38, 34); c.lineTo(62, 34); c.lineTo(60, 60); c.quadraticCurveTo(50, 70, 40, 60); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = gem; circle(c, 50, 47, 5); c.fill(); c.strokeStyle = line; c.beginPath(); c.moveTo(28, 74); c.lineTo(72, 74); c.stroke();
  if (o.shoulder) { c.fillStyle = o.shoulder; [[20, 38], [80, 38]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 10, 7, x < 50 ? -0.6 : 0.6, 0, Math.PI * 2); c.fill(); c.stroke(); }); }
  (o.spark || []).forEach(([x, y, r]) => sparkle(c, x, y, r, o.sparkCol));
}
// ===== まほう：tier 2（big）は ひかりの わ と きらきら、tier 3（wide）は 3つ ならんで ひろがる =====
function bigMagic(c, base, glow) {
  const g = c.createRadialGradient(50, 52, 6, 50, 52, 50); g.addColorStop(0, glow); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; circle(c, 50, 52, 50); c.fill();
  c.save(); c.translate(50, 54); c.scale(1.08, 1.08); c.translate(-50, -54); base(c); c.restore();
  [[16, 22, 7], [84, 26, 6], [82, 80, 5], [18, 76, 5]].forEach(([x, y, r]) => sparkle(c, x, y, r, '#fff8c8'));
}
function wideMagic(c, base, glow) {
  const g = c.createRadialGradient(50, 60, 8, 50, 60, 56); g.addColorStop(0, glow); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  [[-26, 14, 0.58], [26, 14, 0.58], [0, 0, 0.8]].forEach(([dx, dy, k]) => { c.save(); c.translate(50 + dx, 54 + dy); c.scale(k, k); c.translate(-50, -54); base(c); c.restore(); });
  [[10, 18, 6], [90, 20, 6], [50, 8, 5]].forEach(([x, y, r]) => sparkle(c, x, y, r, '#fff8c8'));
}
Object.assign(WORD_ART, {
  dg_bigsword: c => sword(c, { w: 8, len: 54, guard: '#ffb347' }),
  dg_strongsword: c => sword(c, { w: 9, len: 50, blade: '#9aa6b8', edge: '#4a5468', guard: '#c8304a', grip: '#4a3a3a', gem: '#ffd34f' }),
  dg_silversword: c => sword(c, { w: 7, len: 52, blade: '#f4f8ff', edge: '#a8b8d0', guard: '#c8d4e8', grip: '#6a7a96', gem: '#7ac8ff', glow: '#bfe4ff', spark: [[78, 18, 7], [24, 70, 5]], sparkCol: '#ffffff' }),
  dg_goldsword: c => sword(c, { w: 8, len: 56, blade: '#ffe38a', edge: '#d8a020', guard: '#ff6b8a', grip: '#8a5a2a', gem: '#ff4a6a', glow: '#ffd34f', spark: [[80, 16, 8], [20, 66, 6], [70, 78, 4]], sparkCol: '#fff3a8' }),
  dg_bigshield: c => shield(c, { k: 1.12, fill: '#4fb0a0', line: '#2a7a6e' }),
  dg_strongshield: c => shield(c, { k: 1.1, fill: '#7a8498', line: '#3a4458', rim: '#c8d0dc', rivets: true, mark: '#ff6b6b' }),
  dg_silvershield: c => shield(c, { k: 1.12, fill: '#e8eef8', line: '#98a8c4', rim: '#b8c8e0', mark: '#7ac8ff', glow: '#bfe4ff', spark: [[82, 18, 7], [18, 72, 5]] }),
  dg_strongarmor: c => armor(c, { fill: '#7a8498', line: '#3a4458', chest: '#a8b2c4', gem: '#ff6b6b', shoulder: '#5a6478' }),
  dg_silverarmor: c => armor(c, { fill: '#e8eef8', line: '#98a8c4', chest: '#ffffff', gem: '#7ac8ff', shoulder: '#c8d4e8', glow: '#bfe4ff', spark: [[86, 16, 7], [14, 80, 5]] }),
  dg_bigfire: c => bigMagic(c, WORD_ART.dg_fire, 'rgba(255,150,60,.55)'),
  dg_widefire: c => wideMagic(c, WORD_ART.dg_fire, 'rgba(255,120,40,.5)'),
  dg_bigwater: c => bigMagic(c, WORD_ART.water, 'rgba(90,170,255,.5)'),
  dg_bigice: c => bigMagic(c, WORD_ART.dg_ice, 'rgba(140,210,255,.6)'),
  dg_wideice: c => wideMagic(c, WORD_ART.dg_ice, 'rgba(140,210,255,.55)'),
  dg_bigthunder: c => bigMagic(c, WORD_ART.dg_thunder, 'rgba(255,220,80,.6)'),
  dg_bigheal: c => bigMagic(c, WORD_ART.dg_heal, 'rgba(120,230,150,.55)'),
  dg_bigwind: c => bigMagic(c, WORD_ART.dg_wind, 'rgba(110,210,180,.5)'),
});

// ===== MPを かいふく する もの =====
Object.assign(WORD_ART, {
  dg_candy: c => {
    c.fillStyle = '#ffb0d0'; c.strokeStyle = '#e07aa8'; c.lineWidth = 2.5;
    [[-1, 22], [1, 78]].forEach(([s, x]) => { c.beginPath(); c.moveTo(50 + s * 18, 50); c.lineTo(x, 34); c.lineTo(x, 66); c.closePath(); c.fill(); c.stroke(); });
    c.fillStyle = '#7ac8ff'; c.strokeStyle = '#4a98d8'; circle(c, 50, 50, 20); c.fill(); c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(50, 50, 11, 0.3, 2.6); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.7)'; circle(c, 43, 42, 4); c.fill();
  },
  dg_juice: c => {
    c.fillStyle = 'rgba(220,240,255,.8)'; c.strokeStyle = '#8ab0d0'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(28, 26); c.lineTo(72, 26); c.lineTo(66, 90); c.lineTo(34, 90); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffa83a'; c.beginPath(); c.moveTo(31, 44); c.lineTo(69, 44); c.lineTo(66, 87); c.lineTo(34, 87); c.closePath(); c.fill();
    c.strokeStyle = '#ff6b8a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(56, 70); c.lineTo(62, 22); c.lineTo(74, 10); c.stroke();
    c.fillStyle = '#ffe066'; circle(c, 30, 30, 10); c.fill(); c.strokeStyle = '#e0b020'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(37, 50, 4, 28);
  },
  dg_bluepotion: c => {
    c.fillStyle = '#7ab0ff'; c.strokeStyle = '#3a70d0'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(42, 34); c.lineTo(42, 44); c.quadraticCurveTo(20, 54, 24, 74); c.quadraticCurveTo(30, 92, 50, 92); c.quadraticCurveTo(70, 92, 76, 74); c.quadraticCurveTo(80, 54, 58, 44); c.lineTo(58, 34); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c98f55'; rr(c, 40, 20, 20, 14, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(36, 66, 4, 9, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 5 : 11; i ? c.lineTo(50 + q * Math.cos(a), 70 + q * Math.sin(a)) : c.moveTo(50 + q * Math.cos(a), 70 + q * Math.sin(a)); } c.fill();
  },
});

// ===== まほうで しか たおせない てき（かたい）=====
Object.assign(WORD_ART, {
  dg_turtle: c => {
    c.fillStyle = '#a8d878'; c.strokeStyle = '#6a9a48'; c.lineWidth = 3;
    [[26, 82], [74, 82]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2); c.fill(); c.stroke(); });
    c.beginPath(); c.ellipse(84, 62, 13, 11, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    eyes(c, 82, 92, 59, 2.8); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(88, 66, 3, 0.3, Math.PI - 0.3); c.stroke();
    c.fillStyle = '#6aa858'; c.strokeStyle = '#3a6a30'; c.lineWidth = 3; c.beginPath(); c.moveTo(14, 78); c.quadraticCurveTo(16, 34, 48, 32); c.quadraticCurveTo(78, 34, 78, 78); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#3a6a30'; c.lineWidth = 2.5; c.fillStyle = '#88c070';
    [[46, 50, 10], [30, 64, 8], [62, 64, 8]].forEach(([x, y, r]) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; i ? c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : c.moveTo(x + r, y); } c.closePath(); c.fill(); c.stroke(); });
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(32, 42, 7, 4, -0.5, 0, Math.PI * 2); c.fill();
  },
  dg_snowman: c => {
    c.fillStyle = '#fff'; c.strokeStyle = '#a8c0d8'; c.lineWidth = 3;
    circle(c, 50, 70, 24); c.fill(); c.stroke(); circle(c, 50, 36, 17); c.fill(); c.stroke();
    c.fillStyle = '#ff6b6b'; rr(c, 30, 48, 40, 8, 4); c.fill(); c.fillRect(56, 50, 8, 18);
    c.fillStyle = '#4a5a7a'; rr(c, 36, 12, 28, 8, 2); c.fill(); rr(c, 41, 0, 18, 14, 3); c.fill();
    eyes(c, 44, 56, 34, 3); c.fillStyle = '#ff9a3a'; c.beginPath(); c.moveTo(50, 39); c.lineTo(62, 42); c.lineTo(50, 44); c.fill();
    c.fillStyle = INK; [62, 72, 82].forEach(y => { circle(c, 50, y, 2.6); c.fill(); });
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 3; c.lineCap = 'round'; [[-1], [1]].forEach(([s]) => { c.beginPath(); c.moveTo(50 + s * 22, 64); c.lineTo(50 + s * 38, 50); c.moveTo(50 + s * 33, 54); c.lineTo(50 + s * 36, 46); c.stroke(); });
  },
});

// ===== たからさがし 第3段階：きんの かぎ・もじの タイル・かんばん・かくしボス =====
Object.assign(WORD_ART, {
  dg_goldkey: c => {
    c.save(); c.shadowColor = '#ffd34f'; c.shadowBlur = 12;
    c.strokeStyle = '#d8a020'; c.fillStyle = '#ffd34f'; c.lineWidth = 4;
    circle(c, 34, 36, 18); c.fill(); c.stroke(); circle(c, 34, 36, 8); c.fillStyle = '#fff3a8'; c.fill(); c.stroke();
    c.fillStyle = '#ffd34f'; rr(c, 46, 31, 42, 10, 3); c.fill(); c.stroke(); rr(c, 72, 41, 7, 14, 2); c.fill(); c.stroke(); rr(c, 82, 41, 6, 10, 2); c.fill(); c.stroke();
    c.restore(); c.fillStyle = '#fff'; [[20, 20, 4], [58, 22, 3], [24, 60, 3]].forEach(([x, y, r]) => { c.beginPath(); c.moveTo(x, y - r * 2); c.quadraticCurveTo(x, y, x + r * 2, y); c.quadraticCurveTo(x, y, x, y + r * 2); c.quadraticCurveTo(x, y, x - r * 2, y); c.quadraticCurveTo(x, y, x, y - r * 2); c.fill(); });
  },
  dg_ltile: c => { c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, 18, 22, 68, 68, 12); c.fill(); c.fillStyle = '#fff4d0'; c.strokeStyle = '#d8a020'; c.lineWidth = 4; rr(c, 14, 16, 68, 68, 12); c.fill(); c.stroke(); },
  dg_sign: c => {
    c.fillStyle = '#8a5a3a'; c.fillRect(46, 52, 8, 40);
    c.fillStyle = '#e8c08a'; c.strokeStyle = '#8a5a3a'; c.lineWidth = 4; rr(c, 12, 18, 76, 42, 6); c.fill(); c.stroke();
    c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; [30, 40, 50].forEach(y => { c.beginPath(); c.moveTo(22, y); c.lineTo(y === 50 ? 58 : 78, y); c.stroke(); });
  },
  dg_treasuredragon: c => { dragon(c, '#ffc83a', '#c8901a', '#fff3c8', true); c.fillStyle = '#ff5a8a'; [[40, 68], [60, 68], [50, 78]].forEach(([x, y]) => { circle(c, x, y, 3.5); c.fill(); }); },
  dg_crystalgolem: c => {
    const g = (pts, f) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = f; c.fill(); c.strokeStyle = '#4a8ac8'; c.lineWidth = 2.5; c.stroke(); };
    g([[30, 52], [70, 52], [76, 84], [24, 84]], '#a8e0ff'); g([[14, 50], [30, 46], [28, 78], [12, 74]], '#c8ecff'); g([[86, 50], [70, 46], [72, 78], [88, 74]], '#c8ecff');
    g([[34, 18], [66, 18], [72, 50], [28, 50]], '#d8f4ff'); g([[44, 6], [50, 0], [56, 6], [50, 18]], '#ff8fd8');
    c.fillStyle = INK; [[42, 32], [58, 32]].forEach(([x, y]) => { rr(c, x - 4, y - 4, 8, 8, 2); c.fill(); });
    c.fillStyle = 'rgba(255,255,255,.75)'; [[38, 24], [40, 58], [18, 56]].forEach(([x, y]) => { c.fillRect(x, y, 4, 10); });
  },
  dg_shadowking: c => { ghost(c, '#6a5a8e', true); c.fillStyle = 'rgba(255,80,120,.9)'; [[40, 46], [60, 46]].forEach(([x, y]) => { circle(c, x, y, 3); c.fill(); }); },
});

// ===== 2ごの なまえの てき：もとの え の いろを かえる（べつの キャンバスで いろを かさねて おぼえておく）=====
const tintCache = {};
function tinted(key, base, col, alpha = 0.5, extra) {
  return c => {
    let oc = tintCache[key];
    if (!oc) {
      oc = document.createElement('canvas'); oc.width = oc.height = 200; const x = oc.getContext('2d'); x.scale(2, 2);
      WORD_ART[base](x); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = alpha; x.fillStyle = col; x.fillRect(0, 0, 100, 100);
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; if (extra) extra(x); tintCache[key] = oc;
    }
    c.drawImage(oc, 0, 0, 100, 100);
  };
}
const angryMark = x => { x.fillStyle = '#ff3a4a'; x.font = '900 22px sans-serif'; x.fillText('!', 82, 26); x.strokeStyle = '#ff3a4a'; x.lineWidth = 3; x.beginPath(); x.moveTo(10, 24); x.lineTo(20, 18); x.moveTo(12, 32); x.lineTo(22, 30); x.stroke(); };
Object.assign(WORD_ART, {
  dg_bigslime: c => { slime(c, '#5aa8f0', '#2a68b8'); c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; [[34, 48, 44, 52], [66, 48, 56, 52]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }); },
  dg_bluesnake: tinted('bs', 'dg_snake', '#3a6aff', 0.55),
  dg_littlebat: tinted('lb', 'dg_bat', '#c88aff', 0.35),
  dg_angrywolf: tinted('aw', 'dg_wolf', '#ff4a3a', 0.35, angryMark),
  dg_reddragon: c => dragon(c, '#ff5a4a', '#b82a2a', '#ffd8b8'),
});

// マップの タイル（キャンバスに じかに かく。T … タイルの おおきさ）
export function drawTile(c, ch, x, y, T, seen, lit, zone) {
  if (!seen) { c.fillStyle = '#1e1a2a'; c.fillRect(x, y, T, T); return; }
  const Z = zone || { floor: ['#f4e6cc', '#e2d2b4'], wall: ['#6a5a7a', '#7c6c8e'] };
  if (ch === '#') {
    c.fillStyle = Z.wall[0]; c.fillRect(x, y, T, T);
    c.fillStyle = Z.wall[1]; c.fillRect(x + 1, y + 1, T - 2, T * 0.45); c.fillRect(x + 1, y + T * 0.52, T * 0.45, T * 0.45); c.fillRect(x + T * 0.52, y + T * 0.52, T * 0.47, T * 0.45);
    if (!lit) { c.fillStyle = 'rgba(20,16,40,.32)'; c.fillRect(x, y, T, T); }
    return;
  }
  c.fillStyle = ch === '.' ? Z.floor[0] : Z.floor[1]; c.fillRect(x, y, T, T);
  c.strokeStyle = 'rgba(120,90,60,.12)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
  if (!lit) { c.fillStyle = 'rgba(20,16,40,.28)'; c.fillRect(x, y, T, T); }
}
export function drawArt(c, key, x, y, size) {
  const f = WORD_ART[key]; if (!f) return;
  c.save(); c.translate(x, y); c.scale(size / 100, size / 100); f(c); c.restore();
}

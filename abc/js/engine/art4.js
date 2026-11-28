// え（その4）：ワールド4「おとの しま」の ことば。すべて コードで かく オリジナル（100×100 の なかに かく）
import { WORD_ART, drawCritter } from './art.js';

const INK = '#4a3a3a';
const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };

Object.assign(WORD_ART, {
  // ぶた（どうぶつの え を そのまま おおきく）
  p_pig: c => { c.save(); c.translate(50, 86); c.scale(2.3, 2.3); drawCritter(c, 'pig', 0, 0, 'down', 0, {}); c.restore(); },
  // かまくら（イグルー）
  p_igloo: c => {
    c.fillStyle = '#eaf6ff'; c.strokeStyle = '#8fb8d8'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(10, 80); c.arc(50, 80, 40, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
    c.lineWidth = 2; for (const y of [62, 46]) { c.beginPath(); c.moveTo(14 + (80 - y) * 0.25, y); c.lineTo(86 - (80 - y) * 0.25, y); c.stroke(); }
    for (const [x, y0, y1] of [[34, 62, 80], [66, 62, 80], [50, 46, 62], [30, 46, 62], [70, 46, 62]]) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
    c.fillStyle = '#4a6a8a'; c.beginPath(); c.moveTo(38, 80); c.arc(50, 80, 12, Math.PI, 0); c.closePath(); c.fill();
    c.fillStyle = '#cfe6f8'; c.fillRect(6, 80, 88, 6);
  },
  // ぼうし
  p_hat: c => {
    c.fillStyle = '#5a7fd0'; c.strokeStyle = '#3a5aa8'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(50, 72, 42, 11, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(24, 70); c.lineTo(28, 30); c.quadraticCurveTo(50, 20, 72, 30); c.lineTo(76, 70); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ff6f8f'; c.fillRect(25, 56, 50, 10);
  },
  // ペン
  p_pen: c => {
    c.save(); c.translate(50, 50); c.rotate(-0.7);
    c.fillStyle = '#ff9f43'; c.strokeStyle = '#c8742a'; c.lineWidth = 3;
    c.beginPath(); c.roundRect ? c.roundRect(-9, -40, 18, 62, 4) : c.rect(-9, -40, 18, 62); c.fill(); c.stroke();
    c.fillStyle = '#f2d2a8'; c.beginPath(); c.moveTo(-9, 22); c.lineTo(9, 22); c.lineTo(0, 40); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.moveTo(-3, 33); c.lineTo(3, 33); c.lineTo(0, 40); c.closePath(); c.fill();
    c.fillStyle = '#5a7fd0'; c.fillRect(-9, -40, 18, 12);
    c.restore();
  },
  // とりの す（たまご いり）
  p_nest: c => {
    c.fillStyle = '#fff'; c.strokeStyle = '#c8b8a8'; c.lineWidth = 2;
    for (const [x, y] of [[40, 54], [56, 52], [48, 48]]) { c.beginPath(); c.ellipse(x, y, 9, 12, 0, 0, Math.PI * 2); c.fill(); c.stroke(); }
    c.fillStyle = '#a8784a'; c.strokeStyle = '#7a5230'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(50, 66, 38, 16, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.lineWidth = 2; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(16 + i * 10, 58 + (i % 2) * 6); c.quadraticCurveTo(26 + i * 10, 74, 36 + i * 10, 62); c.stroke(); }
  },
});

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
  // ---- ワールド4 第2回（つなげの たにま・なかまの むら）----
  // どうぶつは drawCritter の え を おおきく
  ...Object.fromEntries([['p_rat', 'mouse'], ['p_fox', 'fox'], ['p_pup', 'dog'], ['p_goat', 'goat'], ['p_lion', 'lion'], ['p_zebra', 'zebra'], ['p_hen', 'chick']]
    .map(([id, kind]) => [id, c => { c.save(); c.translate(50, 86); c.scale(2.3, 2.3); drawCritter(c, kind, 0, 0, 'down', 0, {}); c.restore(); }])),
  p_bat: c => { // バット（やきゅう）
    c.save(); c.translate(50, 52); c.rotate(-0.8); c.fillStyle = '#d8a56a'; c.strokeStyle = '#a8743a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-5, 40); c.lineTo(-9, -30); c.quadraticCurveTo(0, -46, 9, -30); c.lineTo(5, 40); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#7a5230'; c.fillRect(-6, 32, 12, 10); c.restore();
    c.fillStyle = '#fff'; c.strokeStyle = '#d0c0c0'; c.lineWidth = 2; circle(c, 78, 76, 10); c.fill(); c.stroke();
    c.strokeStyle = '#e05a6a'; c.beginPath(); c.arc(70, 76, 8, -0.8, 0.8); c.stroke(); c.beginPath(); c.arc(86, 76, 8, Math.PI - 0.8, Math.PI + 0.8); c.stroke();
  },
  p_fan: c => { // せんぷうき
    c.fillStyle = '#9ad0f0'; c.strokeStyle = '#4a8fc0'; c.lineWidth = 3; circle(c, 50, 40, 28); c.fill(); c.stroke();
    c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { c.save(); c.translate(50, 40); c.rotate(i * 2.1); c.beginPath(); c.ellipse(0, -13, 7, 13, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.fillStyle = '#4a8fc0'; circle(c, 50, 40, 5); c.fill(); c.fillRect(46, 66, 8, 18); c.beginPath(); c.ellipse(50, 86, 20, 6, 0, 0, Math.PI * 2); c.fill();
  },
  p_van: c => { // ワゴンしゃ
    c.fillStyle = '#ffd34f'; c.strokeStyle = '#c89a1a'; c.lineWidth = 3;
    c.beginPath(); c.roundRect ? c.roundRect(10, 32, 80, 40, 10) : c.rect(10, 32, 80, 40); c.fill(); c.stroke();
    c.fillStyle = '#bfe3f8'; c.fillRect(18, 39, 18, 14); c.fillRect(41, 39, 18, 14); c.fillRect(64, 39, 18, 14);
    c.fillStyle = INK; circle(c, 28, 74, 9); c.fill(); circle(c, 72, 74, 9); c.fill(); c.fillStyle = '#ccc'; circle(c, 28, 74, 4); c.fill(); circle(c, 72, 74, 4); c.fill();
  },
  p_map: c => { // ちず
    c.fillStyle = '#f6e6b8'; c.strokeStyle = '#c8a868'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(14, 24); c.lineTo(38, 18); c.lineTo(62, 24); c.lineTo(86, 18); c.lineTo(86, 78); c.lineTo(62, 84); c.lineTo(38, 78); c.lineTo(14, 84); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#e0a868'; c.beginPath(); c.moveTo(38, 18); c.lineTo(38, 78); c.moveTo(62, 24); c.lineTo(62, 84); c.stroke();
    c.strokeStyle = '#e05a6a'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(24, 70); c.quadraticCurveTo(46, 40, 72, 44); c.stroke(); c.setLineDash([]);
    c.lineWidth = 4; c.beginPath(); c.moveTo(68, 38); c.lineTo(78, 50); c.moveTo(78, 38); c.lineTo(68, 50); c.stroke();
  },
  p_cap: c => { // ぼうし（キャップ）
    c.fillStyle = '#ff6f8f'; c.strokeStyle = '#c8456a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(18, 62); c.quadraticCurveTo(20, 24, 54, 24); c.quadraticCurveTo(80, 26, 80, 62); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(80, 64, 18, 6, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#fff'; circle(c, 50, 24, 4); c.fill();
  },
  p_net: c => { // あみ
    c.strokeStyle = '#a8784a'; c.lineWidth = 5; c.beginPath(); c.moveTo(70, 90); c.lineTo(50, 50); c.stroke();
    c.strokeStyle = '#5a9a5a'; c.lineWidth = 4; circle(c, 40, 34, 24); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = '#8ac08a'; for (let i = -18; i <= 18; i += 9) { c.beginPath(); c.moveTo(40 + i, 14); c.lineTo(40 + i, 56); c.moveTo(18, 34 + i); c.lineTo(62, 34 + i); c.stroke(); }
  },
  p_jet: c => { // ジェットき
    c.fillStyle = '#eef2f8'; c.strokeStyle = '#7a8aa8'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(10, 52); c.quadraticCurveTo(50, 40, 88, 50); c.quadraticCurveTo(50, 62, 10, 52); c.fill(); c.stroke();
    c.fillStyle = '#5a7fd0'; c.beginPath(); c.moveTo(44, 50); c.lineTo(30, 22); c.lineTo(58, 48); c.closePath(); c.fill(); c.beginPath(); c.moveTo(44, 54); c.lineTo(30, 80); c.lineTo(58, 56); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(14, 50); c.lineTo(8, 34); c.lineTo(22, 48); c.closePath(); c.fill(); c.fillStyle = '#9fd0f0'; circle(c, 76, 50, 4); c.fill();
  },
  p_bed: c => { // ベッド
    c.fillStyle = '#c8945a'; c.fillRect(10, 40, 8, 44); c.fillRect(82, 52, 8, 32);
    c.fillStyle = '#9fc8f0'; c.strokeStyle = '#5a8fc0'; c.lineWidth = 3; c.beginPath(); c.roundRect ? c.roundRect(16, 54, 70, 20, 6) : c.rect(16, 54, 70, 20); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(30, 52, 12, 7, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#c8945a'; c.fillRect(16, 74, 70, 6);
  },
  p_wig: c => { // かつら（くるくる）
    c.fillStyle = '#f2c84a'; c.strokeStyle = '#c89a1a'; c.lineWidth = 2;
    for (const [x, y] of [[30, 40], [50, 32], [70, 40], [24, 58], [76, 58], [26, 74], [74, 74], [40, 30], [60, 30]]) { circle(c, x, y, 12); c.fill(); c.stroke(); }
    c.fillStyle = '#fff4e6'; c.beginPath(); c.ellipse(50, 60, 18, 22, 0, 0, Math.PI * 2); c.fill();
  },
  p_log: c => { // まるた
    c.fillStyle = '#b07a46'; c.strokeStyle = '#7d5230'; c.lineWidth = 3; c.beginPath(); c.roundRect ? c.roundRect(14, 40, 66, 26, 12) : c.rect(14, 40, 66, 26); c.fill(); c.stroke();
    c.fillStyle = '#e0b880'; c.beginPath(); c.ellipse(80, 53, 10, 13, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.strokeStyle = '#c8945a'; c.beginPath(); c.ellipse(80, 53, 5, 7, 0, 0, Math.PI * 2); c.stroke();
  },
  p_box: c => { // はこ
    c.fillStyle = '#d8a86a'; c.strokeStyle = '#a8743a'; c.lineWidth = 3; c.fillRect(20, 40, 60, 44); c.strokeRect(20, 40, 60, 44);
    c.fillStyle = '#e8bc80'; c.beginPath(); c.moveTo(20, 40); c.lineTo(34, 24); c.lineTo(94, 24); c.lineTo(80, 40); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c8945a'; c.fillRect(46, 40, 8, 44);
  },
  p_bun: c => { // まるい パン
    c.fillStyle = '#e8a860'; c.strokeStyle = '#b8783a'; c.lineWidth = 3; c.beginPath(); c.ellipse(50, 56, 34, 24, 0, Math.PI, 0); c.lineTo(84, 64); c.lineTo(16, 64); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff6d8'; for (const [x, y] of [[38, 44], [52, 40], [64, 46]]) { c.beginPath(); c.ellipse(x, y, 3, 2, 0.4, 0, Math.PI * 2); c.fill(); }
  },
  p_bug: c => { // むし（てんとうむし）
    c.fillStyle = '#e8404a'; c.strokeStyle = INK; c.lineWidth = 3; circle(c, 50, 56, 26); c.fill(); c.stroke();
    c.fillStyle = INK; circle(c, 50, 32, 12); c.fill(); c.beginPath(); c.moveTo(50, 30); c.lineTo(50, 82); c.stroke();
    for (const [x, y] of [[38, 50], [62, 50], [40, 68], [60, 68]]) { circle(c, x, y, 5); c.fill(); }
  },
  p_mug: c => { // マグカップ
    c.fillStyle = '#7ac0e8'; c.strokeStyle = '#3a8ab8'; c.lineWidth = 3; c.beginPath(); c.roundRect ? c.roundRect(22, 30, 46, 52, 8) : c.rect(22, 30, 46, 52); c.fill(); c.stroke();
    c.lineWidth = 6; c.beginPath(); c.arc(70, 54, 12, -1.3, 1.3); c.stroke(); c.fillStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(45, 56, 7, 0, Math.PI * 2); c.fill();
  },
  p_cup: c => { // カップ（ちいさな コップ）
    c.fillStyle = '#ffe08a'; c.strokeStyle = '#c8a028'; c.lineWidth = 3; c.beginPath(); c.moveTo(26, 30); c.lineTo(74, 30); c.lineTo(66, 82); c.lineTo(34, 82); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#8fd0ff'; c.beginPath(); c.moveTo(29, 40); c.lineTo(71, 40); c.lineTo(70, 46); c.lineTo(30, 46); c.closePath(); c.fill();
  },
  p_bus: c => { // バス
    c.fillStyle = '#5ac87a'; c.strokeStyle = '#2f9a5a'; c.lineWidth = 3; c.beginPath(); c.roundRect ? c.roundRect(8, 30, 84, 42, 8) : c.rect(8, 30, 84, 42); c.fill(); c.stroke();
    c.fillStyle = '#e8f6ff'; for (let i = 0; i < 4; i++) c.fillRect(14 + i * 19, 37, 15, 13); c.fillStyle = '#fff'; c.fillRect(8, 56, 84, 4);
    c.fillStyle = INK; circle(c, 26, 74, 8); c.fill(); circle(c, 74, 74, 8); c.fill();
  },
  p_top: c => { // こま
    c.fillStyle = '#ff8f4a'; c.strokeStyle = '#c85a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(18, 40); c.lineTo(82, 40); c.lineTo(50, 84); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffd34f'; c.beginPath(); c.ellipse(50, 40, 32, 9, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#a8743a'; c.fillRect(46, 20, 8, 18);
  },
  p_web: c => { // くもの す
    c.strokeStyle = '#8a9ab0'; c.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(50, 50); c.lineTo(50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40); c.stroke(); }
    for (const r of [10, 20, 30, 40]) { c.beginPath(); for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 4, x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    c.fillStyle = INK; circle(c, 64, 36, 5); c.fill();
  },
  p_octopus: c => { // たこ
    c.fillStyle = '#ff7a8a'; c.strokeStyle = '#c84a5a'; c.lineWidth = 3;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(26 + i * 10, 56); c.quadraticCurveTo(20 + i * 12, 80, 30 + i * 9, 88); c.lineWidth = 7; c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.ellipse(50, 44, 28, 26, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = INK; circle(c, 41, 46, 4); c.fill(); circle(c, 59, 46, 4); c.fill();
  },
  p_umbrella: c => { // かさ
    c.fillStyle = '#7a8af0'; c.strokeStyle = '#4a5ac0'; c.lineWidth = 3; c.beginPath(); c.moveTo(10, 48); c.quadraticCurveTo(50, 2, 90, 48);
    for (let i = 0; i < 4; i++) c.quadraticCurveTo(80 - i * 20, 40, 70 - i * 20, 48); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#7a5230'; c.lineWidth = 4; c.beginPath(); c.moveTo(50, 46); c.lineTo(50, 80); c.arc(58, 80, 8, Math.PI, 0, true); c.stroke();
  },
  p_yoyo: c => { // ヨーヨー
    c.strokeStyle = '#8a7a7a'; c.lineWidth = 2; c.beginPath(); c.moveTo(50, 8); c.lineTo(50, 40); c.stroke();
    c.fillStyle = '#ff6f8f'; c.strokeStyle = '#c8456a'; c.lineWidth = 3; circle(c, 50, 62, 26); c.fill(); c.stroke();
    c.fillStyle = '#ffd34f'; circle(c, 50, 62, 9); c.fill();
  },
  p_queen: c => { // じょおうさまの かんむり
    c.fillStyle = '#ffd34f'; c.strokeStyle = '#c89a1a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(16, 74); c.lineTo(12, 30); c.lineTo(32, 50); c.lineTo(50, 22); c.lineTo(68, 50); c.lineTo(88, 30); c.lineTo(84, 74); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#e05a8a'; circle(c, 50, 58, 7); c.fill(); c.fillStyle = '#5ab0f0'; circle(c, 30, 62, 5); c.fill(); circle(c, 70, 62, 5); c.fill();
  },
});

// パレットの ブロックの え（Canvas 2D。ななめ うえから みた かたち）
import { faceCanvas, shade } from './textures.js';

function face(g, tex, o, u, v, dark) {
  g.save();
  g.setTransform(u[0] / 16, u[1] / 16, v[0] / 16, v[1] / 16, o[0], o[1]);
  g.imageSmoothingEnabled = false;
  g.drawImage(tex, 0, 0);
  if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, 16, 16); }
  g.restore();
}

export function drawIcon(cv, b) {
  const S = cv.width, g = cv.getContext('2d');
  g.clearRect(0, 0, S, S);
  const s = S * .3, cx = S / 2, cy = S * .52, k = .87 * s;
  const T = [cx, cy - s], L = [cx - k, cy - s / 2], R = [cx + k, cy - s / 2], C = [cx, cy], B = [cx, cy + s], LL = [cx - k, cy + s / 2], LR = [cx + k, cy + s / 2];
  const sub = (a, c) => [a[0] - c[0], a[1] - c[1]];
  const poly = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); };

  if (b.shape === 'flower') {
    g.fillStyle = b.side; g.fillRect(cx - S * .03, cy - S * .05, S * .06, S * .35);
    g.beginPath(); g.ellipse(cx + S * .1, cy + S * .17, S * .1, S * .04, -.4, 0, 7); g.fill();
    g.fillStyle = b.top;
    for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; g.beginPath(); g.arc(cx + Math.cos(a) * S * .1, cy - S * .14 + Math.sin(a) * S * .1, S * .08, 0, 7); g.fill(); }
    g.fillStyle = b.center || '#ffd84a'; g.beginPath(); g.arc(cx, cy - S * .14, S * .065, 0, 7); g.fill();
    return;
  }
  if (b.shape === 'door') {
    const w = S * .42, h = S * .66;
    g.imageSmoothingEnabled = false;
    g.drawImage(faceCanvas(b, 'side'), cx - w / 2, cy - h / 2, w, h);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(cx + w / 2, cy - h / 2 + 3, S * .06, h - 3);
    return;
  }
  if (b.shape === 'roof') {
    // ななめの めん（T-R が たかい へり、LL-B が ひくい へり）＋ みぎの さんかく
    poly([R, LR, B], shade(b.side, .75));
    poly([T, R, B, LL], b.top);
    g.strokeStyle = shade(b.top, .7); g.lineWidth = Math.max(1, S / 40);
    for (let i = 1; i < 4; i++) {
      const t = i / 4, a = [T[0] + (LL[0] - T[0]) * t, T[1] + (LL[1] - T[1]) * t], c = [R[0] + (B[0] - R[0]) * t, R[1] + (B[1] - R[1]) * t];
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke();
    }
    return;
  }
  face(g, faceCanvas(b, 'top'), L, sub(T, L), sub(C, L), 0);
  face(g, faceCanvas(b, 'side'), L, sub(C, L), sub(LL, L), .12);
  face(g, faceCanvas(b, 'side'), C, sub(R, C), sub(B, C), .26);
}

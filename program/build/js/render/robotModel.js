// ロボモコの 3D の え（はこを くみあわせて つくる）と、うごきの アニメーション、あしもとの やじるし
import * as THREE from '../vendor/three.module.min.js';
import { DIRS } from '../robot/program.js';

const lam = c => new THREE.MeshLambertMaterial({ color: c });
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
// むき → Y かいてん（ロボの まえは +z）
const YAW = { D: 0, R: Math.PI / 2, U: Math.PI, L: -Math.PI / 2 };

export const ROBOT_COLORS = { sky: '#7fd0f2', pink: '#ff9cc0', green: '#8fdc8a', yellow: '#ffd25e' };

export class RobotView {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();      // いち
    this.body = new THREE.Group();      // はねる・ゆれる
    this.root.add(this.body);
    this.bodyMat = lam(ROBOT_COLORS.sky);
    const dark = lam('#3c98c2'), white = lam('#ffffff'), eye = lam('#2f4858'), pink = lam('#ffb3c7'), ball = lam('#ff8fb1');
    const b = this.body;
    b.add(box(.5, .16, .42, dark, 0, .1, 0));                 // あし（くるま）
    b.add(box(.56, .12, .14, lam('#5bbbe6'), 0, .16, .18));
    b.add(box(.74, .52, .62, this.bodyMat, 0, .48, 0));         // からだ
    b.add(box(.54, .32, .02, white, 0, .5, .32));              // かお
    b.add(box(.08, .1, .02, eye, -.12, .52, .335));
    b.add(box(.08, .1, .02, eye, .12, .52, .335));
    b.add(box(.07, .04, .02, pink, -.2, .42, .335));
    b.add(box(.07, .04, .02, pink, .2, .42, .335));
    b.add(box(.04, .2, .04, lam('#7aa9c0'), 0, .84, 0));       // アンテナ
    const s = new THREE.Mesh(new THREE.SphereGeometry(.08, 12, 8), ball); s.position.set(0, .96, 0); b.add(s);
    b.add(box(.1, .22, .1, dark, -.42, .46, 0));               // うで
    b.add(box(.1, .22, .1, dark, .42, .46, 0));
    this.body.scale.setScalar(1.05);
    scene.add(this.root);

    // あしもとの やじるし（めいれいの やじるしと おなじ いろ。たてものの むこうでも みえる）
    this.arrows = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(0, .32); shape.lineTo(.22, .08); shape.lineTo(.09, .08); shape.lineTo(.09, -.16);
    shape.lineTo(-.09, -.16); shape.lineTo(-.09, .08); shape.lineTo(-.22, .08); shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    for (const k in DIRS) {
      const d = DIRS[k];
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: d.color, depthTest: false, transparent: true, opacity: .9 }));
      m.rotation.x = -Math.PI / 2;                       // ゆかに ねかせる（かたちの +y が せかいの -z）
      m.rotation.z = Math.atan2(-d.dx, -d.dz);           // その むきに むける
      m.position.set(d.dx * .82, .03, d.dz * .82);
      m.renderOrder = 10;
      this.arrows.add(m);
    }
    this.root.add(this.arrows);

    this.anim = null; this.visible = true;
  }

  setColor(c) { this.bodyMat.color.set(ROBOT_COLORS[c] || c); }
  show(v) { this.root.visible = v; this.visible = v; }
  showArrows(v) { this.arrows.visible = v; }

  // すぐに おく
  place(p, dir) {
    this.anim = null;
    this.root.position.set(p.x + .5, p.y, p.z + .5);
    this.body.rotation.set(0, YAW[dir] || 0, 0);
    this.body.position.set(0, 0, 0);
    this.arrows.position.y = .03;
  }

  // アニメーション：kind = move / put / break / wait / bonk
  play(kind, from, to, dir, ms) {
    const dur = Math.max(120, ms * .8);
    this.anim = { kind, from: { ...from }, to: { ...to }, dir, t0: performance.now(), dur,
      yaw0: this.body.rotation.y, yaw1: YAW[dir] ?? this.body.rotation.y };
    // ちかい ほうに まわる
    let dy = this.anim.yaw1 - this.anim.yaw0;
    while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
    this.anim.yaw1 = this.anim.yaw0 + dy;
  }

  // まいフレーム。うごいている あいだは true
  update(now) {
    const a = this.anim; if (!a) return false;
    const t = Math.min(1, (now - a.t0) / a.dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const P = this.root.position, B = this.body;
    B.rotation.y = a.yaw0 + (a.yaw1 - a.yaw0) * Math.min(1, t * 2.5);
    B.position.set(0, 0, 0); B.rotation.z = 0;
    if (a.kind === 'move') {
      P.x = a.from.x + .5 + (a.to.x - a.from.x) * e;
      P.z = a.from.z + .5 + (a.to.z - a.from.z) * e;
      P.y = a.from.y + (a.to.y - a.from.y) * e + Math.sin(Math.PI * t) * (.25 + Math.abs(a.to.y - a.from.y) * .5);
    } else if (a.kind === 'put' || a.kind === 'break') {
      P.set(a.to.x + .5, a.from.y + (a.to.y - a.from.y) * e, a.to.z + .5);
      B.position.y = Math.sin(Math.PI * t) * .35;
    } else if (a.kind === 'bonk') {
      P.set(a.from.x + .5, a.from.y, a.from.z + .5);
      B.rotation.z = Math.sin(t * Math.PI * 6) * .25 * (1 - t);
    } else { // wait：ちょっと ゆれる
      P.set(a.from.x + .5, a.from.y, a.from.z + .5);
      B.position.y = Math.abs(Math.sin(t * Math.PI * 2)) * .08;
    }
    if (t >= 1) { this.anim = null; B.rotation.z = 0; B.position.set(0, 0, 0); P.set(a.to.x + .5, a.to.y, a.to.z + .5); }
    return true;
  }
}

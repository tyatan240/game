// えがく がわ（Three.js）。せかいの データ（world.js）を みて ブロックを ならべる。
// ブロック 1しゅるい・1パーツごとに InstancedMesh を 1つ（ブロックが ふえても かるい）。
import * as THREE from '../vendor/three.module.min.js';
import { BLOCKS, BLOCK } from '../data/blocks.js';
import { faceCanvas } from './textures.js';

const Y = new THREE.Vector3(0, 1, 0);

function tex(b, face) {
  const t = new THREE.CanvasTexture(faceCanvas(b, face));
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const lam = (o) => new THREE.MeshLambertMaterial(o);

// ななめの やね（r=0 で ひくい がわが +z）
function wedgeGeometry() {
  const pos = [], uv = [], groups = [];
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const tri = (a, b, c, ua, ub, uc, n) => {
    const cr = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (cr.dot(n) < 0) { [b, c] = [c, b]; [ub, uc] = [uc, ub]; }
    for (const p of [a, b, c]) pos.push(p.x, p.y, p.z);
    for (const u of [ua, ub, uc]) uv.push(u[0], u[1]);
  };
  const quad = (a, b, c, d, n, mat) => {
    const start = pos.length / 3;
    tri(a, b, c, [0, 0], [1, 0], [1, 1], n); tri(a, c, d, [0, 0], [1, 1], [0, 1], n);
    groups.push([start, 6, mat]);
  };
  const h = .5;
  quad(v(-h, h, -h), v(h, h, -h), v(h, -h, h), v(-h, -h, h), v(0, 1, 1), 0);     // ななめ（やねの かわら）
  quad(v(-h, -h, -h), v(h, -h, -h), v(h, h, -h), v(-h, h, -h), v(0, 0, -1), 1);  // うしろ
  quad(v(-h, -h, h), v(h, -h, h), v(h, -h, -h), v(-h, -h, -h), v(0, -1, 0), 2);  // そこ
  let s = pos.length / 3;
  tri(v(-h, -h, -h), v(-h, -h, h), v(-h, h, -h), [0, 0], [1, 0], [0, 1], v(-1, 0, 0));
  tri(v(h, -h, -h), v(h, -h, h), v(h, h, -h), [1, 0], [0, 0], [1, 1], v(1, 0, 0));
  groups.push([s, 6, 1]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  for (const [st, n, m] of groups) g.addGroup(st, n, m);
  return g;
}

// ブロックの かたち → パーツ [{ geo, mat }]
function makeParts(b) {
  const T = f => tex(b, f);
  switch (b.shape) {
    case 'glass': {
      const m = lam({ map: T('side'), transparent: true, depthWrite: false });
      return [{ geo: new THREE.BoxGeometry(1, 1, 1), mat: m, transparent: true }];
    }
    case 'roof':
      return [{ geo: wedgeGeometry(), mat: [lam({ map: T('top') }), lam({ map: T('side') }), lam({ map: T('bottom') })] }];
    case 'door': {
      const s = lam({ color: b.side }), d = lam({ map: T('side') }), t = lam({ color: b.top });
      return [{ geo: new THREE.BoxGeometry(1, 1, .22), mat: [s, s, t, t, d, d] }];
    }
    case 'flower': {
      const stem = new THREE.BoxGeometry(.12, .55, .12).translate(0, -.22, 0);
      const leaf = new THREE.BoxGeometry(.34, .06, .12).translate(.1, -.28, 0);
      const head = new THREE.BoxGeometry(.44, .16, .44).translate(0, .12, 0);
      const mid = new THREE.BoxGeometry(.18, .06, .18).translate(0, .22, 0);
      const green = lam({ color: b.side });
      return [{ geo: stem, mat: green }, { geo: leaf, mat: green }, { geo: head, mat: lam({ color: b.top }) }, { geo: mid, mat: lam({ color: b.center || '#ffd84a' }) }];
    }
    default: {
      const s = lam({ map: T('side') });
      return [{ geo: new THREE.BoxGeometry(1, 1, 1), mat: [s, s, lam({ map: T('top') }), lam({ map: T('bottom') }), s, s] }];
    }
  }
}

export class BuildScene {
  constructor(canvas, world) {
    this.canvas = canvas; this.world = world;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 400);
    this.target = new THREE.Vector3(world.w / 2, 1.5, world.d / 2);
    this.az = Math.PI / 4; this.azGoal = this.az; this.el = .62; this.zoom = 1;

    this.scene.add(new THREE.AmbientLight(0xffffff, .55));
    const sun = new THREE.DirectionalLight(0xffffff, .7); sun.position.set(.5, 1, .3); this.scene.add(sun);
    const sun2 = new THREE.DirectionalLight(0xffffff, .2); sun2.position.set(-.5, .4, -.8); this.scene.add(sun2);

    // じめんの だい（ブロックでは ない。ここを タップすると y=0 に おける）
    const slabMat = [lam({ color: '#7a5636' }), lam({ color: '#7a5636' }), lam({ color: '#6a4b2f' }), lam({ color: '#5a3f27' }), lam({ color: '#86603d' }), lam({ color: '#86603d' })];
    this.slab = new THREE.Mesh(new THREE.BoxGeometry(world.w, .6, world.d), slabMat);
    this.slab.position.set(world.w / 2, -.3, world.d / 2);
    this.scene.add(this.slab);
    const grid = new THREE.GridHelper(world.w, world.w, 0x8a6a48, 0x8a6a48);
    grid.position.set(world.w / 2, .002, world.d / 2); this.scene.add(grid);

    this.parts = {}; for (const b of BLOCKS) this.parts[b.id] = makeParts(b);
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.meshes = [];

    // プレビュー（はんとうめい）
    this.preview = new THREE.Group(); this.preview.visible = false; this.scene.add(this.preview);
    this.ghostOk = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false });
    this.ghostNg = new THREE.MeshBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: .45, depthWrite: false });
    this.edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.04, 1.04, 1.04)), new THREE.LineBasicMaterial({ color: 0xffffff }));
    this.preview.add(this.edge);
    this.ghost = new THREE.Group(); this.preview.add(this.ghost);
    this.eraseBox = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.06, 1.06), this.ghostNg);

    this.ray = new THREE.Raycaster(); this.ndc = new THREE.Vector2();
    this.dirty = true;
    world.onChange(() => this.rebuild());
    this.resize(); this.rebuild();
    window.addEventListener('resize', () => this.resize());
    const loop = () => { this._tick(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.vw = Math.max(1, r.width); this.vh = Math.max(1, r.height);
    this.renderer.setSize(this.vw, this.vh, false);
    this.updateCamera();
  }

  updateCamera() {
    const c = this.camera, T = this.target, d = 60;
    c.position.set(T.x + d * Math.cos(this.el) * Math.sin(this.az), T.y + d * Math.sin(this.el), T.z + d * Math.cos(this.el) * Math.cos(this.az));
    c.lookAt(T);
    const aspect = this.vw / this.vh;
    const h = Math.max(18, 24 / aspect) / this.zoom;
    c.top = h / 2; c.bottom = -h / 2; c.left = -h * aspect / 2; c.right = h * aspect / 2;
    c.updateProjectionMatrix();
    this.dirty = true;
  }

  // カメラ：90どずつ まわす / ドラッグ / ズーム / いどう / もとに もどす
  turn(dir) { this.azGoal += dir * Math.PI / 2; this.dirty = true; }
  orbit(dx, dy) {
    this.az -= dx * .008; this.azGoal = this.az;
    this.el = Math.min(1.35, Math.max(.25, this.el + dy * .005));
    this.updateCamera();
  }
  zoomBy(f) { this.zoom = Math.min(3.5, Math.max(.5, this.zoom * f)); this.updateCamera(); }
  pan(dx, dy) {
    const unit = (this.camera.top - this.camera.bottom) / this.vh;
    const right = new THREE.Vector3(Math.cos(this.az), 0, -Math.sin(this.az));
    const fwd = new THREE.Vector3(-Math.sin(this.az), 0, -Math.cos(this.az));
    this.target.addScaledVector(right, -dx * unit).addScaledVector(fwd, dy * unit / Math.max(.3, Math.sin(this.el)));
    this.target.x = Math.min(this.world.w, Math.max(0, this.target.x));
    this.target.z = Math.min(this.world.d, Math.max(0, this.target.z));
    this.updateCamera();
  }
  resetCamera() {
    this.target.set(this.world.w / 2, 1.5, this.world.d / 2);
    // いちばん ちかい「ななめ 45ど」へ くるっと もどす
    this.azGoal = Math.round((this.az - Math.PI / 4) / (2 * Math.PI)) * 2 * Math.PI + Math.PI / 4;
    this.el = .62; this.zoom = 1; this.updateCamera();
  }
  camState() { return { az: +this.azGoal.toFixed(4), el: +this.el.toFixed(4), zoom: +this.zoom.toFixed(3) }; }
  setCam(s) {
    if (!s) return;
    if (Number.isFinite(s.az)) this.az = this.azGoal = s.az;
    if (Number.isFinite(s.el)) this.el = Math.min(1.35, Math.max(.25, s.el));
    if (Number.isFinite(s.zoom)) this.zoom = Math.min(3.5, Math.max(.5, s.zoom));
    this.updateCamera();
  }
  isTurning() { return Math.abs(this.azGoal - this.az) > 1e-3; }

  _tick() {
    if (this.isTurning()) {
      this.az += (this.azGoal - this.az) * .22;
      if (Math.abs(this.azGoal - this.az) < 2e-3) this.az = this.azGoal;
      this.updateCamera();
      if (this.onTurn) this.onTurn();
    }
    if (this.dirty) { this.renderer.render(this.scene, this.camera); this.dirty = false; }
  }

  // せかいの データ → メッシュ
  rebuild() {
    for (const m of this.meshes) { this.group.remove(m); m.dispose(); }
    this.meshes = [];
    const by = {};
    for (const c of this.world.each()) { if (!BLOCK[c.id]) continue; (by[c.id] = by[c.id] || []).push(c); }
    const o = new THREE.Object3D();
    for (const id in by) {
      const list = by[id];
      for (const p of this.parts[id]) {
        const m = new THREE.InstancedMesh(p.geo, p.mat, list.length);
        list.forEach((c, i) => {
          o.position.set(c.x + .5, c.y + .5, c.z + .5);
          o.quaternion.setFromAxisAngle(Y, c.r * Math.PI / 2);
          o.updateMatrix(); m.setMatrixAt(i, o.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
        m.computeBoundingSphere();
        m.userData.cells = list;
        if (p.transparent) m.renderOrder = 2;
        this.group.add(m); this.meshes.push(m);
      }
    }
    this.dirty = true;
  }

  // がめんの てん → { hit:{x,y,z} | null, place:{x,y,z} | null }
  pick(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    this.ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    const hits = this.ray.intersectObjects([...this.meshes, this.slab], false);
    for (const h of hits) {
      if (h.object === this.slab) {
        if (h.face.normal.y < .5) return { hit: null, place: null };
        const x = Math.floor(h.point.x), z = Math.floor(h.point.z);
        return { hit: null, place: this.world.inBounds(x, 0, z) ? { x, y: 0, z } : null };
      }
      const c = h.object.userData.cells[h.instanceId];
      const n = h.face.normal.clone().applyAxisAngle(Y, c.r * Math.PI / 2);
      const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
      let d = [0, 0, 0];
      if (ay >= ax && ay >= az) d = [0, Math.sign(n.y), 0]; else if (ax >= az) d = [Math.sign(n.x), 0, 0]; else d = [0, 0, Math.sign(n.z)];
      return { hit: { x: c.x, y: c.y, z: c.z }, place: { x: c.x + d[0], y: c.y + d[1], z: c.z + d[2] } };
    }
    return { hit: null, place: null };
  }

  // プレビュー：mode 'place'（ブロックの かげ）/ 'erase'（あかい はこ）
  showPreview(p) {
    if (!p) { if (this.preview.visible) { this.preview.visible = false; this.dirty = true; } return; }
    this.preview.visible = true;
    this.preview.position.set(p.x + .5, p.y + .5, p.z + .5);
    this.preview.quaternion.setFromAxisAngle(Y, (p.r || 0) * Math.PI / 2);
    this.ghost.clear();
    if (p.mode === 'erase') {
      this.ghost.add(this.eraseBox); this.edge.material.color.set(0xff3b3b);
    } else {
      const mat = p.ok ? this.ghostOk : this.ghostNg;
      if (p.ok) mat.color.set(BLOCK[p.id] ? BLOCK[p.id].top : '#ffffff');
      for (const part of this.parts[p.id] || []) this.ghost.add(new THREE.Mesh(part.geo, mat));
      this.edge.material.color.set(p.ok ? 0xffffff : 0xff3b3b);
    }
    this.dirty = true;
  }

  // テスト・ロボット用：ざひょう → がめんの てん
  toScreen(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  }
}

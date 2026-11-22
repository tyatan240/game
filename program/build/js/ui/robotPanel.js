// 「ロボットに おねがい」の がめん：めいれいの パレット・プログラム・じっこうボタン
import { BLOCKS, BLOCK } from '../data/blocks.js';
import { DIRS, MOVES, MAX_CMDS, LOOP_MIN, LOOP_MAX, count } from '../robot/program.js';
import { SPEEDS } from '../robot/robot.js';
import { drawIcon } from '../render/icons.js';

const $ = id => document.getElementById(id);
const SVG = {
  arrow: '<path d="M12 20V5M5 11l7-7 7 7"/>',
  brk: '<path d="M14 4l6 6-3 3-6-6z" fill="currentColor"/><path d="M12 9L4 17l3 3 8-8"/>',
  wait: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  loop: '<path d="M4 12a8 8 0 0114-5.3"/><path d="M18 2v5h-5"/><path d="M20 12a8 8 0 01-14 5.3"/><path d="M6 22v-5h5"/>',
  down: '<path d="M12 4v14M6 12l6 6 6-6"/>',
};
const svg = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24">${SVG[k]}</svg>`;

const iconCache = {};
function iconURL(id) {
  if (iconCache[id]) return iconCache[id];
  const cv = document.createElement('canvas'); cv.width = cv.height = 96;
  if (BLOCK[id]) drawIcon(cv, BLOCK[id]);
  return (iconCache[id] = cv.toDataURL());
}

// めいれい 1つの え（パレットと プログラムで おなじ）
function face(c) {
  if (DIRS[c.t]) return svg('arrow', 'arr ' + c.t);
  if (c.t === 'put') return `<img alt="" src="${iconURL(c.b)}"><i class="badge">${svg('down')}</i>`;
  if (c.t === 'break') return svg('brk');
  if (c.t === 'wait') return svg('wait');
  return '';
}
const kindCls = c => DIRS[c.t] ? 'mv ' + c.t : c.t;
const LABEL = { U: 'すすむ', R: 'すすむ', D: 'すすむ', L: 'すすむ', break: 'こわす', wait: 'まつ', loop: 'くりかえす' };

export class RobotPanel {
  constructor({ runner, getProg, setProg, onEdit, toast, sound }) {
    this.runner = runner; this.getProg = getProg; this.setProg = setProg;
    this.onEdit = onEdit; this.toast = toast; this.sound = sound;
    this.target = null; // えらんでいる くりかえし（なかに いれる）
    this.buildPalette();
    this.bind();
    this.render();
  }
  get prog() { return this.getProg(); }
  busy() { return this.runner.state !== 'idle'; }

  buildPalette() {
    const items = [...MOVES.map(t => ({ t })), { t: 'loop' }, { t: 'break' }, { t: 'wait' }, ...BLOCKS.map(b => ({ t: 'put', b: b.id }))];
    $('rpal').innerHTML = items.map(c => {
      const label = c.t === 'put' ? BLOCK[c.b].name + 'を おく' : LABEL[c.t];
      const inner = c.t === 'loop' ? svg('loop') : face(c);
      return `<button class="blk rcmd" data-cmd='${JSON.stringify(c)}' aria-label="${label}"><span class="tile ${kindCls(c)}">${inner}</span><span class="lb">${label}</span></button>`;
    }).join('');
  }

  bind() {
    $('rpal').addEventListener('click', e => {
      const b = e.target.closest('[data-cmd]'); if (!b) return;
      this.add(JSON.parse(b.dataset.cmd));
    });
    $('prog').addEventListener('click', e => {
      if (this.busy()) return;
      const t = e.target;
      const no = t.closest('.lno'), del = t.closest('.ldel'), tile = t.closest('.ptile'), loop = t.closest('.ploop');
      const p = this.prog;
      if (no) { const i = +no.dataset.i; p[i].n = p[i].n >= LOOP_MAX ? LOOP_MIN : p[i].n + 1; this.target = i; this.sound.tap(); return this.changed(); }
      if (del) { const i = +del.dataset.i; p.splice(i, 1); this.fixTarget(i); this.sound.tap(); return this.changed(); }
      if (tile) {
        const i = +tile.dataset.i, j = tile.dataset.j;
        if (j !== undefined) p[i].body.splice(+j, 1); else { p.splice(i, 1); this.fixTarget(i); }
        this.sound.tap(); return this.changed();
      }
      if (loop) { const i = +loop.dataset.i; this.target = this.target === i ? null : i; this.sound.tap(); return this.render(); }
      this.target = null; this.render();
    });
    $('rPlay').onclick = () => {
      if (this.runner.state === 'run') this.runner.pause();
      else { if (!this.prog.length && this.runner.state === 'idle') return this.toast('めいれいを いれてね'); this.target = null; this.render(); this.runner.play(this.prog); }
    };
    $('rStep').onclick = () => {
      if (!this.prog.length && this.runner.state === 'idle') return this.toast('めいれいを いれてね');
      this.target = null; if (this.runner.state === 'idle') this.render(); this.runner.step(this.prog);
    };
    $('rStop').onclick = () => this.runner.stop();
    $('rSpeed').onclick = () => { this.runner.speed = (this.runner.speed + 1) % SPEEDS.length; this.sound.tap(); this.updateControls(); this.onEdit(); };
    $('rBack').onclick = () => {
      if (this.busy()) return;
      const p = this.prog, t = this.target;
      if (t !== null && p[t] && p[t].body.length) p[t].body.pop();
      else if (p.length) { p.pop(); this.fixTarget(p.length); }
      else return;
      this.sound.tap(); this.changed();
    };
    $('rClear').onclick = () => { if (!this.busy() && this.prog.length) $('clrDlg').hidden = false; };
    $('clrNo').onclick = () => { $('clrDlg').hidden = true; };
    $('clrYes').onclick = () => { $('clrDlg').hidden = true; this.setProg([]); this.target = null; this.changed(); };
  }

  fixTarget(i) { if (this.target === i) this.target = null; else if (this.target !== null && this.target > i) this.target--; }

  add(c) {
    if (this.busy()) return;
    const p = this.prog;
    if (count(p) >= MAX_CMDS) { this.sound.ng(); return this.toast('これいじょう いれられないよ'); }
    if (c.t === 'loop') { p.push({ t: 'loop', n: 2, body: [] }); this.target = p.length - 1; }
    else if (this.target !== null && p[this.target]) p[this.target].body.push(c);
    else p.push(c);
    this.sound.tap(); this.changed();
    const el = $('prog'); el.scrollTop = el.scrollHeight; el.scrollLeft = el.scrollWidth;
  }
  changed() { this.render(); this.onEdit(); }

  render() {
    const p = this.prog;
    const tile = (c, i, j) => `<button class="ptile ${kindCls(c)}" id="c${i}${j !== undefined ? '_' + j : ''}" data-i="${i}"${j !== undefined ? ` data-j="${j}"` : ''}>${face(c)}</button>`;
    $('prog').innerHTML = !p.length
      ? `<span class="empty">したの めいれいを タップして いれてね</span>`
      : p.map((c, i) => c.t !== 'loop' ? tile(c, i) :
        `<div class="ploop ${this.target === i ? 'target' : ''}" id="c${i}" data-i="${i}">
          <div class="lh"><button class="lno" data-i="${i}">${svg('loop')}<b>${c.n}</b><small>かい</small></button><button class="ldel" data-i="${i}" aria-label="くりかえしを けす">×</button></div>
          <div class="lb">${c.body.length ? c.body.map((d, j) => tile(d, i, j)).join('') : '<span class="empty">ここに いれる</span>'}</div>
        </div>`).join('');
    $('rCount').textContent = `${count(p)} / ${MAX_CMDS}`;
    $('prog').classList.toggle('target', this.target === null && p.length > 0);
    this.updateControls();
  }

  updateControls() {
    const st = this.runner.state;
    $('rPlay').innerHTML = st === 'run' ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';
    $('rPlay').setAttribute('aria-label', st === 'run' ? 'いちじていし' : 'じっこう');
    $('rPlay').classList.toggle('pause', st === 'run');
    $('rStop').disabled = st === 'idle';
    $('rStep').disabled = st === 'run';
    $('rSpeed').querySelector('span').textContent = SPEEDS[this.runner.speed].name;
    $('rSpeed').dataset.s = this.runner.speed;
    for (const id of ['rBack', 'rClear']) $(id).disabled = st !== 'idle';
    $('rpal').classList.toggle('off', st !== 'idle');
    document.body.classList.toggle('running', st !== 'idle');
  }

  // じっこう ちゅうの めいれいを ひからせる
  mark(s, bad) {
    for (const e of document.querySelectorAll('#prog .run, #prog .err')) e.classList.remove('run', 'err');
    if (!s) return;
    const el = document.getElementById(s.id);
    if (el) { el.classList.add(bad ? 'err' : 'run'); el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    if (s.box) { const b = document.getElementById(s.box); if (b) b.classList.add('run'); }
  }

  // カメラの むき → やじるしの え の むき
  setArrows(az) {
    const st = document.documentElement.style;
    for (const k in DIRS) {
      const { dx, dz } = DIRS[k];
      const sx = dx * Math.cos(az) - dz * Math.sin(az), sy = -dx * Math.sin(az) - dz * Math.cos(az);
      st.setProperty('--r' + k, (Math.atan2(sx, sy) * 180 / Math.PI).toFixed(1) + 'deg');
    }
  }
}

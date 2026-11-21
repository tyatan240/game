// そうさ：キーボード（やじるし・WASD・Space/Enter・Esc）と タッチ（ほうこうパッド・アクションボタン）
const keyDir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
const held = [];   // おしている じゅん（あとから おした ほうを ゆうせん）
let padDir = null;
const listeners = { action: [], menu: [], any: [] };
export const on = (ev, fn) => listeners[ev].push(fn);
const emit = ev => listeners[ev].forEach(f => f());

export function currentDir() { return padDir || held[held.length - 1] || null; }
export function clearDirs() { held.length = 0; padDir = null; }

window.addEventListener('keydown', e => {
  emit('any');
  const d = keyDir[e.key];
  if (d) { if (!held.includes(d)) held.push(d); e.preventDefault(); return; }
  if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) emit('action'); e.preventDefault(); }
  if (e.key === 'Escape') emit('menu');
});
window.addEventListener('keyup', e => { const d = keyDir[e.key]; if (d) { const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); } });
window.addEventListener('blur', clearDirs);

// ほうこうパッド：まるい エリアの なかで ゆびの いちから 4ほうこうを きめる（ゆびを すべらせても OK）
export function bindPad(el) {
  let id = null;
  const set = e => {
    const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * 0.12) { padDir = null; }
    else padDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    el.dataset.dir = padDir || '';
  };
  el.addEventListener('pointerdown', e => { emit('any'); id = e.pointerId; el.setPointerCapture(id); set(e); e.preventDefault(); });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) set(e); });
  const end = e => { if (e.pointerId === id) { id = null; padDir = null; el.dataset.dir = ''; } };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}
export function bindButton(el, ev) {
  el.addEventListener('pointerdown', e => { emit('any'); e.preventDefault(); emit(ev); });
}

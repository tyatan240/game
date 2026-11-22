// おと：えいごの こえ（おんせいごうせい／ろくおん）・こうかおん・BGM
// こうかおん と BGM は オリジナル（WebAudio で その ばで つくる）
let ac = null, settings = { bgm: true, se: true, voice: true }, voice = null, bgmTimer = null, bgmOn = false;

export function setAudioSettings(s) {
  settings = s;
  if (!s.bgm) stopBgm(); else if (ac) startBgm();
}

// さいしょの タップで おとを つかえるように する（iPhone・iPad は これが ひつよう）
export function unlockAudio() {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { /* おとが でない たんまつ */ }
  if (settings.bgm) startBgm();
}

/* ---------- えいごの こえ ---------- */
const PREFER = /(Samantha|Ava|Allison|Google US English|Aria|Jenny|Zira|Susan|Karen)/i;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  const en = vs.filter(v => /^en[-_]US/i.test(v.lang));
  voice = en.find(v => PREFER.test(v.name) && v.localService) || en.find(v => PREFER.test(v.name)) || en[0]
    || vs.find(v => /^en/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
export const canSpeak = () => 'speechSynthesis' in window;

// おおもじ 1つ だけ（'A' など）は iPad で「Capital A」と よまれるので、もじの なまえの つづりに かえる
const NAME = { A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'gee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el', M: 'em',
  N: 'en', O: 'oh', P: 'pee', Q: 'queue', R: 'are', S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee' };
export const speakable = text => (typeof text === 'string' && /^[A-Za-z]$/.test(text.trim()) ? NAME[text.trim().toUpperCase()] : text);

export function speak(text, rate = 0.75) {
  if (!settings.voice || !canSpeak()) return;
  text = speakable(text);
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (voice) u.voice = voice;
    u.rate = rate; u.pitch = 1.05; u.volume = 1;
    speechSynthesis.speak(u);
  } catch (e) { /* なにもしない */ }
}

// もじ（や たんご）を よむ。ろくおん ファイルが あれば そちらを つかう
export function sayLetter(L) {
  if (!settings.voice) return;
  if (L.audio) { try { new Audio(L.audio).play(); return; } catch (e) { /* ごうせいに きりかえ */ } }
  speak(L.speak);
}

/* ---------- こうかおん ---------- */
function tone(f, d = 0.12, type = 'triangle', v = 0.15, when = 0) {
  if (!ac) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
}
const seq = (notes, step = 0.09, d = 0.16, type = 'triangle', v = 0.14) => notes.forEach((f, i) => tone(f, d, type, v, i * step));
export const sfx = {
  talk: () => settings.se && tone(880, 0.04, 'square', 0.03),
  tap: () => settings.se && tone(660, 0.05, 'triangle', 0.08),
  correct: () => settings.se && seq([784, 988, 1319], 0.08, 0.2),
  wrong: () => settings.se && seq([392, 330], 0.12, 0.18, 'sine', 0.1),
  star: () => settings.se && seq([1047, 1319, 1568, 2093], 0.06, 0.18, 'sine', 0.1),
  chest: () => settings.se && (seq([523, 659, 784, 1047, 1319], 0.07, 0.22), tone(2093, 0.4, 'sine', 0.06, 0.4)),
  unlock: () => settings.se && (seq([523, 523, 784, 1047], 0.14, 0.25, 'square', 0.06), seq([659, 784, 1047, 1319], 0.14, 0.3, 'triangle', 0.1)),
  bump: () => settings.se && tone(140, 0.08, 'sine', 0.06),
};

/* ---------- BGM（オリジナルの みじかい ループ）---------- */
const N = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, G5: 784, A3: 220, G3: 196, F3: 175, C3: 131 };
const MEL = [['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 1], ['C4', 2], ['D4', 1], ['E4', 1], ['G4', 1], ['E4', 1], ['D4', 3], [null, 1],
  ['E4', 1], ['G4', 1], ['A4', 1], ['C5', 1], ['D5', 1], ['C5', 1], ['A4', 2], ['G4', 1], ['E4', 1], ['D4', 1], ['E4', 1], ['C4', 3], [null, 1]];
const BASS = ['C3', 'G3', 'A3', 'F3', 'C3', 'G3', 'F3', 'C3'];
const BEAT = 0.3;
function playLoop() {
  if (!ac || !bgmOn) return;
  let t = 0;
  for (const [n, b] of MEL) { if (n) tone(N[n], b * BEAT * 0.9, 'triangle', 0.035, t); t += b * BEAT; }
  BASS.forEach((n, i) => tone(N[n], 4 * BEAT * 0.9, 'sine', 0.04, i * 4 * BEAT));
  return t;
}
export function startBgm() {
  if (!ac || bgmOn || !settings.bgm) return;
  bgmOn = true;
  const len = playLoop() * 1000;
  bgmTimer = setInterval(() => playLoop(), len);
}
export function stopBgm() { bgmOn = false; clearInterval(bgmTimer); bgmTimer = null; }

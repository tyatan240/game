// まちの モブじゅうにん（4にん）：おべんきょうの「しゅくだい」を たのんでくる
// キャラの え は core.js の CH に たす（おへやの ITEMS には いれない＝かえない・もちものに ならない）
// しゅくだいは かなえてから 1じかん たつと また でる（HW_COOLDOWN）
import { LETTER } from '../../../abc/js/data/letters.js';
import { WORD } from '../../../abc/js/data/words.js';

export const HW_COOLDOWN = 60 * 60 * 1000;
export const HW_REWARD = 10; // おれいの ⭐
export const PROG_STAGES = 30; // プログラミングの ステージの かず（program/index.html の LEVELS）

export const MOBS = [
  { id: 'mob_pig', name: 'こぶたの ブブ', subj: 'sansu', sname: 'さんすう', page: '../sansu/index.html' },
  { id: 'mob_tanuki', name: 'たぬきの ポン', subj: 'kokugo', sname: 'こくご', page: '../kokugo/index.html' },
  { id: 'mob_chick', name: 'ひよこの ピヨ', subj: 'eigo', sname: 'えいご', page: '../eigo/index.html' },
  { id: 'mob_frog', name: 'かえるの ケロ', subj: 'prog', sname: 'プログラミング', page: '../program/index.html' },
];
export const MOB = Object.fromEntries(MOBS.map(m => [m.id, m]));

// え（charSVG の からだに かさねる。core.js の CH と おなじ かたち）
Object.assign(CH, {
  mob_pig: {
    body: '#ffc9d6', line: '#e895ab',
    back: `<g fill="#ffc9d6" stroke="#e895ab" stroke-width="3" stroke-linejoin="round"><path d="M56 72 L52 40 L82 56 Z"/><path d="M144 72 L148 40 L118 56 Z"/></g><path d="M150 206 q14 -4 10 -14 q-6 -6 -10 2" fill="none" stroke="#e895ab" stroke-width="3" stroke-linecap="round"/>`,
    belly: `<ellipse cx="100" cy="196" rx="24" ry="22" fill="#ffe0e8"/>`,
    front: `<ellipse cx="100" cy="128" rx="17" ry="12" fill="#ffadc2" stroke="#e895ab" stroke-width="2.5"/><ellipse cx="94" cy="128" rx="3" ry="4" fill="#d9708c"/><ellipse cx="106" cy="128" rx="3" ry="4" fill="#d9708c"/>`,
    blush: '#ff9fb8', cheek: 9, mouthW: true,
  },
  mob_tanuki: {
    body: '#b9906a', line: '#80603f',
    back: `<g fill="#b9906a" stroke="#80603f" stroke-width="3"><circle cx="62" cy="62" r="15"/><circle cx="138" cy="62" r="15"/></g><g fill="#5f4630"><circle cx="62" cy="62" r="7"/><circle cx="138" cy="62" r="7"/></g>
      <path d="M134 210 Q180 214 170 176" fill="none" stroke="#80603f" stroke-width="20" stroke-linecap="round"/><path d="M134 210 Q180 214 170 176" fill="none" stroke="#b9906a" stroke-width="14" stroke-linecap="round"/><path d="M168 190 l8 -4 M164 200 l9 -1" stroke="#5f4630" stroke-width="5" stroke-linecap="round"/>`,
    belly: `<ellipse cx="100" cy="196" rx="25" ry="23" fill="#f3e2c8"/>`,
    front: `<g fill="#5f4630"><ellipse cx="78" cy="112" rx="17" ry="13" transform="rotate(-12 78 112)"/><ellipse cx="122" cy="112" rx="17" ry="13" transform="rotate(12 122 112)"/></g><ellipse cx="100" cy="132" rx="20" ry="13" fill="#f3e2c8"/>
      <path d="M86 70 l28 0" stroke="#4fae4a" stroke-width="6" stroke-linecap="round"/><path d="M100 70 q-6 -12 0 -18 q6 6 0 18" fill="#5fbf55"/>`,
    eyeRing: true, nose: '#4a3626', blush: '#ffb3a8',
  },
  mob_chick: {
    body: '#ffe27a', line: '#e5b83a', feet: '#ffa94d', footLine: '#e08a2c',
    back: `<g fill="#ffe27a" stroke="#e5b83a" stroke-width="3"><path d="M96 52 q-4 -16 6 -20 q-2 10 4 18 z"/><path d="M104 52 q6 -14 16 -12 q-8 6 -10 14 z"/></g>`,
    belly: `<ellipse cx="100" cy="196" rx="26" ry="24" fill="#fff4c2"/>`,
    front: `<g fill="#ffe27a" stroke="#e5b83a" stroke-width="3"><ellipse cx="54" cy="176" rx="10" ry="20" transform="rotate(30 54 176)"/></g>`,
    beak: true, blush: '#ffb36b', bigEyes: true,
  },
  mob_frog: {
    body: '#8fd46d', line: '#5aa04a',
    back: `<g fill="#8fd46d" stroke="#5aa04a" stroke-width="3"><circle cx="72" cy="62" r="20"/><circle cx="128" cy="62" r="20"/></g><g fill="#fff"><circle cx="72" cy="60" r="12"/><circle cx="128" cy="60" r="12"/></g><g fill="#3a4a2e"><circle cx="74" cy="60" r="6"/><circle cx="126" cy="60" r="6"/></g>`,
    belly: `<ellipse cx="100" cy="196" rx="26" ry="23" fill="#d8f3c4"/>`,
    front: `<path d="M74 126 Q100 142 126 126" fill="none" stroke="#3a4a2e" stroke-width="3.5" stroke-linecap="round"/>`,
    blush: '#ff9fb0', cheek: 11, mouthW: true,
  },
});
export const mobEquip = id => ({ char: id, outfit: 'o_none', hat: 'h_none', acc: 'a_none' });

// えいごの しゅくだいが できるか（ABCぼうけんで 3つ いじょう おぼえた しゅるい）
function abcSave() { try { return JSON.parse(localStorage.getItem('abc-adventure-v1') || 'null') || {}; } catch { return {}; } }
function eigoTypes() {
  const a = abcSave(), letters = (a.learned || []).filter(id => LETTER[id]).length, words = Object.keys(a.words || {}).filter(id => WORD[id] && !WORD[id].future).length;
  return ETYPES.filter(t => S.settings.etypes[t.id].on && (t.need === 'letters' ? letters : t.need === 'words' ? words : 0) >= 3); // ワールド3・はじめの おとは しゅくだいに しない
}
function progUnlocked() {
  let best = {}; try { best = (JSON.parse(localStorage.getItem('piko-prog-v1') || 'null') || {}).best || {}; } catch { }
  const out = []; for (let i = 0; i < PROG_STAGES; i++) { if (i === 0 || (best[i - 1] || 0) > 0) out.push(i); else break; }
  return out;
}
const pick = a => a[(Math.random() * a.length) | 0];

// あたらしい しゅくだいを えらぶ（レベル・もんだいは ランダム）→ { key, label } / null（まだ できない）
export function newHomework(subj) {
  const lv = 1 + ((Math.random() * 3) | 0);
  if (subj === 'sansu') { const ts = TYPES.filter(t => S.settings.types[t.id].on); if (!ts.length) return null; const t = pick(ts); return { key: t.id + '-' + lv, label: `${t.name}（${TLV[lv - 1].name}）の れんしゅう` }; }
  if (subj === 'kokugo') { const ts = KTYPES.filter(t => S.settings.ktypes[t.id].on); if (!ts.length) return null; const t = pick(ts); return { key: t.id + '-' + lv, label: `${t.name}（${TLV[lv - 1].name}）の れんしゅう` }; }
  if (subj === 'eigo') { const ts = eigoTypes(); if (!ts.length) return null; const t = pick(ts); return { key: t.id + '-' + lv, label: `${t.name}（${TLV[lv - 1].name}）の れんしゅう` }; }
  if (subj === 'prog') { const st = pick(progUnlocked()); return { key: String(st), label: `ステージ ${st + 1} を クリア` }; }
  return null;
}
export const NOT_YET = { eigo: 'ABCぼうけんで もじを 3つ おぼえたら てつだってね！', sansu: 'いまは もんだいが えらばれて いないみたい', kokugo: 'いまは もんだいが えらばれて いないみたい' };

// クイズの もんだいを つくる（ひょうじとは べつ）
import { LETTER } from '../data/letters.js';
import { WORD, WORDS } from '../data/words.js';

const shuffle = (a, rand = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// kind：
//   'find'   … 「ビーを さがしてね！」（もじ＋おと）
//   'listen' … おとだけ きいて えらぶ
export function letterQuestion(target, pool, kind, nChoices, rand = Math.random) {
  const L = LETTER[target];
  const others = shuffle(pool.filter(id => id !== target), rand);
  // えらべる もじが たりない ときは ほかの もじ（F〜）で おぎなう
  const extra = shuffle(Object.keys(LETTER).filter(id => id !== target && !pool.includes(id)), rand);
  const choices = shuffle([target, ...[...others, ...extra].slice(0, nChoices - 1)], rand);
  return {
    kind, target, choices, answer: target,
    prompt: kind === 'listen' ? 'きこえた もじは どれかな？' : `「${L.name}」を さがしてね！`,
    say: L.speak, voice: L, render: 'letter', label: id => `${LETTER[id].upper}（${LETTER[id].name}）`,
  };
}

// たんごの もんだい
//   'listenPic' … おとを きいて えを えらぶ（はじめて おぼえる とき）
//   'picWord'   … えを みて えいごを えらぶ
//   'wordPic'   … えいごを よんで（きいて）えを えらぶ
export function wordQuestion(target, kind, nChoices = 3, rand = Math.random) {
  const W = WORD[target];
  const others = shuffle(WORDS.filter(w => w.id !== target).map(w => w.id), rand).slice(0, nChoices - 1);
  const choices = shuffle([target, ...others], rand);
  return {
    kind, target, choices, answer: target, voice: W,
    prompt: kind === 'picWord' ? 'この えは えいごで なに？' : kind === 'wordPic' ? `「${W.word}」は どれかな？` : 'きこえた ことばは どれかな？',
    picture: kind === 'picWord' ? W.art : null,
    render: kind === 'picWord' ? 'word' : 'pic',
    label: id => `${WORD[id].word}（${WORD[id].ja}）`,
  };
}
export { shuffle };

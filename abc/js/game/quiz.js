// クイズの もんだいを つくる（ひょうじとは べつ）
import { LETTER } from '../data/letters.js';

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
    say: L.speak,
  };
}
export { shuffle };

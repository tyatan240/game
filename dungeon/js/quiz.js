// たからさがし：かくし部屋の とびらの クイズ（DOM を つかわない。もんだいを つくる だけ）
//   word … えを みて えいごを えらぶ ／ letter … たりない もじ（_at）／ order … もじを ならべかえ ／ riddle … えいごの なぞなぞ
import { CARDS, CARD } from './cards.js';

// その かいで でる クイズの しゅるい（ふかいほど むずかしい）
export function quizKind(floor, rand = Math.random) {
  const pool = floor <= 5 ? ['word', 'letter'] : floor <= 10 ? ['word', 'letter', 'order'] : ['letter', 'order', 'riddle'];
  return pool[Math.floor(rand() * pool.length)];
}
export const QUIZ_NAME = { word: 'ことばの とびら', letter: 'もじの とびら', order: 'ならべかえの とびら', riddle: 'なぞなぞの とびら', collect: 'もじあつめの とびら' };

// なぞなぞ（えいごを よみあげる → えを えらぶ）
export const RIDDLES = [
  { id: 'A1', en: 'It is red. It is round. It is a fruit.', ja: 'あかくて まるい くだもの。' },
  { id: 'C2', en: 'It says meow. It likes fish.', ja: '「ニャー」と なく。さかなが すき。' },
  { id: 'D1', en: 'It says woof. It likes bones.', ja: '「ワン」と なく。ほねが すき。' },
  { id: 'F1', en: 'It swims in the water.', ja: 'みずの なかを およぐ。' },
  { id: 'M3', en: 'It is in the sky at night.', ja: 'よるの そらに ある。' },
  { id: 'E1', en: 'A baby bird comes out of it.', ja: 'なかから ひなが でて くる。' },
  { id: 'S2', en: 'It sails on the sea.', ja: 'うみの うえを すすむ。' },
  { id: 'M1', en: 'It is white. You drink it.', ja: 'しろくて、のむ もの。' },
  { id: 'O2', en: 'It says hoo hoo at night.', ja: 'よるに「ホーホー」と なく。' },
  { id: 'L3', en: 'It is the king of animals.', ja: 'どうぶつの おうさま。' },
  { id: 'W2', en: 'It is very big. It lives in the sea.', ja: 'とても おおきくて、うみに すむ。' },
  { id: 'U1', en: 'You use it in the rain.', ja: 'あめの ときに つかう。' },
  { id: 'T2', en: 'It runs on rails.', ja: 'せんろの うえを はしる。' },
  { id: 'H1', en: 'You wear it on your head.', ja: 'あたまに かぶる。' },
  { id: 'S1', en: 'You wear it on your foot.', ja: 'あしに はく。' },
  { id: 'K1', en: 'It opens a door.', ja: 'ドアを あける もの。' },
  { id: 'P2', en: 'It is pink. It says oink.', ja: 'ピンクで「ブーブー」と なく。' },
  { id: 'L1', en: 'It is yellow. It is sour.', ja: 'きいろくて すっぱい。' },
  { id: 'B3', en: 'It has pretty wings. It flies to flowers.', ja: 'きれいな はねで はなへ とぶ。' },
  { id: 'R3', en: 'It has seven colors. You see it after rain.', ja: '7つの いろ。あめの あとに みえる。' },
];

const simple = c => /^[a-z]{3,6}$/.test(c.en) && c.rare <= 2; // みじかい ことば（ならべかえ・もじ）
const shuffle = (a, rand) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, rand) => a[Math.floor(rand() * a.length)];

// クイズを つくる → { kind, card(こたえの カード), ask, choices, answer, ... }
export function makeQuiz(kind, rand = Math.random, cardId = null) {
  if (kind === 'collect' && CARD[cardId]) { const card = CARD[cardId]; let tiles = shuffle(card.en.split(''), rand); for (let k = 0; k < 5 && tiles.join('') === card.en; k++) tiles = shuffle(tiles, rand); return { kind, card, tiles, answer: card.en }; } // あつめた もじを ならべる
  if (kind === 'riddle') {
    const r = pick(RIDDLES, rand), card = CARD[r.id];
    const others = shuffle(CARDS.filter(c => c.id !== r.id && c.art !== card.art && c.rare <= 2), rand).slice(0, 2);
    const choices = shuffle([card, ...others], rand);
    return { kind, card, en: r.en, ja: r.ja, choices: choices.map(c => c.id), answer: choices.indexOf(card) };
  }
  if (kind === 'order') {
    const card = pick(CARDS.filter(c => simple(c) && c.en.length <= 5), rand);
    let tiles = shuffle(card.en.split(''), rand);
    for (let k = 0; k < 5 && tiles.join('') === card.en; k++) tiles = shuffle(tiles, rand);
    return { kind, card, tiles, answer: card.en };
  }
  if (kind === 'letter') {
    const card = pick(CARDS.filter(simple), rand), L = card.en[0];
    const others = shuffle('abcdefghijklmnoprstuwy'.split('').filter(x => x !== L), rand).slice(0, 2);
    const choices = shuffle([L, ...others], rand);
    return { kind, card, shown: '_' + card.en.slice(1), choices, answer: choices.indexOf(L) };
  }
  // word：えを みて えいごを えらぶ
  const card = pick(CARDS.filter(c => c.rare <= 2), rand);
  const others = shuffle(CARDS.filter(c => c.id !== card.id && c.letter !== card.letter && c.rare <= 2), rand).slice(0, 2);
  const choices = shuffle([card, ...others], rand);
  return { kind: 'word', card, choices: choices.map(c => c.id), answer: choices.indexOf(card) };
}

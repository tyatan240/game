// ワールド4「おとの しま」：もじの おと（フォニックス）。ついかは ここに かくだけ
//   id：こもじ  kana：おとの めやす（がめんに だす）  key：その おとで はじまる ことば（words.js の id。え と こえ に つかう）
//   area：おしえて もらう エリア  audio：ろくおん ファイル（あれば ゆうせん。いまは なし → key の ことばを よみあげる）
// ※ iPad の よみあげは もじ 1つの おと（/s/ など）を うまく だせない ので、「その おとで はじまる ことば」を いっしょに きかせる（docs/abc-world4-spec.md 5.）
export const SOUNDS = [
  // ① おとの はまべ
  { id: 's', kana: 'ス', key: 'sun', area: 'w4beach' },
  { id: 'a', kana: 'ア', key: 'apple', area: 'w4beach' },
  { id: 't', kana: 'トゥ', key: 'ten', area: 'w4beach' },
  { id: 'p', kana: 'プ', key: 'pig', area: 'w4beach' },
  { id: 'i', kana: 'イ', key: 'igloo', area: 'w4beach' },
  { id: 'n', kana: 'ンヌ', key: 'nine', area: 'w4beach' },
  // ② ひびきの ほらあな
  { id: 'c', kana: 'ク', key: 'cat', area: 'w4cave' },
  { id: 'e', kana: 'エ', key: 'egg', area: 'w4cave' },
  { id: 'h', kana: 'ハ', key: 'hat', area: 'w4cave' },
  { id: 'r', kana: 'ル', key: 'red', area: 'w4cave' },
  { id: 'm', kana: 'ム', key: 'milk', area: 'w4cave' },
  { id: 'd', kana: 'ドゥ', key: 'dog', area: 'w4cave' },
].map(s => ({ audio: null, ...s }));
export const SOUND = Object.fromEntries(SOUNDS.map(s => [s.id, s]));
// おとの クイズに つかう ことば（え が ある もの）。どの もじで はじまり／おわるかは word から きめる
// おわりの おとを きく もんだいに つかう ことば（さいごの もじが そのまま おとに なる もの。nine・fish などは つかわない）
export const PHON_LAST = ['sun', 'cat', 'ten', 'pen', 'red', 'hat', 'nest', 'pig', 'dog', 'egg'];
export const PHON_WORDS = ['sun', 'apple', 'ten', 'pig', 'igloo', 'nine', 'cat', 'egg', 'hat', 'red', 'milk', 'dog', 'pen', 'honey', 'fish', 'tree', 'bee', 'bird', 'six', 'nest'];

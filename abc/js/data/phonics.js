// ワールド4「おとの しま」：もじの おと（フォニックス）。ついかは ここに かくだけ
//   id：こもじ  kana：おとの めやす（がめんに だす）  key：その おとで はじまる ことば（words.js の id。え と こえ に つかう）
//   pos：その おとを ことばの どこで きくか（なし＝はじめ、'mid'＝まんなか、'last'＝おわり）
//   area：おしえて もらう エリア  audio：ろくおん ファイル（あれば ゆうせん。いまは なし → key の ことばを よみあげる）
// ※ iPad の よみあげは もじ 1つの おと（/s/ など）を うまく だせない ので、「その おとで はじまる ことば」を いっしょに きかせる（docs/abc-world4-spec.md 5.）
export const SOUNDS = [
  // ① おとの はまべ
  { id: 's', kana: 'ス', key: 'sun', area: 'w4beach' },
  { id: 'a', kana: 'ア', key: 'apple', area: 'w4beach' },
  { id: 't', kana: 'トゥ', key: 'ten', area: 'w4beach' },
  { id: 'p', kana: 'プ', key: 'pig', area: 'w4beach' },
  { id: 'i', kana: 'イ', key: 'six', area: 'w4beach', pos: 'mid' }, // igloo は なじみが ないので、しっている six の まんなかの おと
  { id: 'n', kana: 'ンヌ', key: 'nine', area: 'w4beach' },
  // ② ひびきの ほらあな
  { id: 'c', kana: 'ク', key: 'cat', area: 'w4cave' },
  { id: 'e', kana: 'エ', key: 'egg', area: 'w4cave' },
  { id: 'h', kana: 'ハ', key: 'hat', area: 'w4cave' },
  { id: 'r', kana: 'ル', key: 'red', area: 'w4cave' },
  { id: 'm', kana: 'ム', key: 'milk', area: 'w4cave' },
  { id: 'd', kana: 'ドゥ', key: 'dog', area: 'w4cave' },
  // ③ つなげの たにま
  { id: 'g', kana: 'グ', key: 'goat', area: 'w4valley' },
  { id: 'o', kana: 'オ', key: 'octopus', area: 'w4valley' },
  { id: 'u', kana: 'ア（ウ）', key: 'umbrella', area: 'w4valley' },
  { id: 'l', kana: 'ル', key: 'lion', area: 'w4valley' },
  { id: 'f', kana: 'フ', key: 'fish', area: 'w4valley' },
  { id: 'b', kana: 'ブ', key: 'bee', area: 'w4valley' },
  // ④ なかまの むら（x は ことばの おわりで きく。qu は 2もじで ひとつの おと）
  { id: 'j', kana: 'ジュ', key: 'jet', area: 'w4village' },
  { id: 'z', kana: 'ズ', key: 'zebra', area: 'w4village' },
  { id: 'w', kana: 'ウ', key: 'web', area: 'w4village' },
  { id: 'v', kana: 'ヴ', key: 'van', area: 'w4village' },
  { id: 'y', kana: 'ィ', key: 'yoyo', area: 'w4village' },
  { id: 'x', kana: 'クス', key: 'fox', area: 'w4village', pos: 'last' },
  { id: 'q', label: 'qu', kana: 'クw', key: 'queen', area: 'w4village' },
  { id: 'k', kana: 'ク（c と おなじ）', key: 'key', area: 'w4village' },
].map(s => ({ audio: null, ...s }));
export const SOUND = Object.fromEntries(SOUNDS.map(s => [s.id, s]));
// おとの クイズに つかう ことば（え が ある もの）。どの もじで はじまり／おわるかは word から きめる
// おわりの おとを きく もんだいに つかう ことば（さいごの もじが そのまま おとに なる もの。nine・fish などは つかわない）
export const PHON_LAST = ['sun', 'cat', 'ten', 'pen', 'red', 'hat', 'nest', 'pig', 'dog', 'egg', 'bat', 'fan', 'map', 'cap', 'net', 'jet', 'bed', 'wig', 'log', 'box', 'fox', 'bun', 'bug', 'mug', 'cup', 'bus', 'top', 'web', 'van', 'hen', 'six'];
// つなげて よむ ことば（3もじ・え が ある。なかまごとに ならべる）
export const CVC = ['cat', 'hat', 'bat', 'rat', 'fan', 'van', 'map', 'cap', 'pen', 'ten', 'hen', 'net', 'jet', 'bed', 'red', 'pig', 'wig', 'six', 'dog', 'log', 'box', 'fox', 'top', 'sun', 'bun', 'run', 'bug', 'mug', 'cup', 'pup', 'bus', 'web'];
// なかま（おしりが おなじ）
export const FAM = w => w.slice(1);
export const PHON_WORDS = ['sun', 'apple', 'ten', 'pig', 'nine', 'cat', 'egg', 'hat', 'red', 'milk', 'dog', 'pen', 'honey', 'fish', 'tree', 'bee', 'bird', 'six', 'nest',
  'goat', 'octopus', 'umbrella', 'lion', 'bat', 'fan', 'van', 'map', 'cap', 'net', 'jet', 'bed', 'wig', 'log', 'box', 'fox', 'bun', 'bug', 'mug', 'cup', 'bus', 'top', 'web', 'zebra', 'yoyo', 'queen', 'hen', 'rat', 'pup'];

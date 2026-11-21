// えいたんご（ことばの まほう）のデータ。ついかは ここに かくだけ
//   word：えいたんご  ja：にほんごの いみ  art：え（art.js の WORD_ART）  speak：おんせいごうせいの ことば
//   audio：ろくおん ファイル（あれば ゆうせん）  learnAt：おぼえられる ばしょ（OBJECTS / SIGNS の id）
//   place：ヒントで つかう ばしょの なまえ  magic：まほうの せつめい  future：まだ つかわない
export const WORDS = [
  { id: 'apple', word: 'APPLE', ja: 'りんご', art: 'apple', speak: 'apple', audio: null, learnAt: 'appleTree', place: 'りんごの き', magic: 'りんごを とる まほう' },
  { id: 'water', word: 'WATER', ja: 'みず', art: 'water', speak: 'water', audio: null, learnAt: 'well', place: 'いど', magic: 'おみずを だす まほう' },
  { id: 'flower', word: 'FLOWER', ja: 'はな', art: 'flower', speak: 'flower', audio: null, learnAt: 'flowerSign', place: 'おはなの かんばん', magic: 'おはなの まほう' },
  { id: 'bee', word: 'BEE', ja: 'ハチ', art: 'bee', speak: 'bee', audio: null, learnAt: 'hive', place: 'はちの すばこ', magic: 'ハチさんを よぶ まほう' },
  { id: 'honey', word: 'HONEY', ja: 'はちみつ', art: 'honey', speak: 'honey', audio: null, learnAt: null, place: null, magic: 'はちみつの まほう', future: true },
];
export const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));

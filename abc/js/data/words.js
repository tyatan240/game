// えいたんご（ことばの まほう）のデータ。ついかは ここに かくだけ
//   word：えいたんご  ja：にほんごの いみ  art：え（art.js の WORD_ART）  speak：おんせいごうせいの ことば
//   audio：ろくおん ファイル（あれば ゆうせん）  learnAt：おぼえられる ばしょ（OBJECTS / SIGNS の id）
//   place：ヒントで つかう ばしょの なまえ  magic：まほうの せつめい  future：まだ つかわない
export const WORDS = [
  { id: 'apple', word: 'APPLE', ja: 'りんご', art: 'apple', speak: 'apple', audio: null, learnAt: 'appleTree', place: 'りんごの き', magic: 'りんごを とる まほう' },
  { id: 'water', word: 'WATER', ja: 'みず', art: 'water', speak: 'water', audio: null, learnAt: 'well', place: 'いど', magic: 'おみずを だす まほう' },
  { id: 'flower', word: 'FLOWER', ja: 'はな', art: 'flower', speak: 'flower', audio: null, learnAt: 'flowerSign', place: 'おはなの かんばん', magic: 'おはなの まほう' },
  { id: 'bee', word: 'BEE', ja: 'ハチ', art: 'bee', speak: 'bee', audio: null, learnAt: 'hive', place: 'はちの すばこ', magic: 'ハチさんを よぶ まほう' },
  { id: 'honey', word: 'HONEY', ja: 'はちみつ', art: 'honey', speak: 'honey', audio: null, learnAt: 'hive', place: 'はちの すばこ', magic: 'はちみつの まほう' },
  // もりの こみち
  { id: 'sun', word: 'SUN', ja: 'たいよう', art: 'sun', speak: 'sun', audio: null, learnAt: 'sunstone', place: 'もりの ひだまりの いし', magic: 'おひさまの まほう' },
  { id: 'dog', word: 'DOG', ja: 'いぬ', art: 'dog', speak: 'dog', audio: null, learnAt: 'puppy', place: 'もりの こいぬの ポチ', magic: 'いぬと なかよく なる まほう' },
  { id: 'bone', word: 'BONE', ja: 'ほね', art: 'bone', speak: 'bone', audio: null, learnAt: 'bonemound', place: 'もりの つちの やま', magic: 'ほねの まほう' },
  // どうぶつ むら
  { id: 'key', word: 'KEY', ja: 'かぎ', art: 'key', speak: 'key', audio: null, learnAt: 'keyboard', place: 'むらの かぎかけ', magic: 'かぎの まほう' },
  { id: 'door', word: 'DOOR', ja: 'とびら', art: 'door', speak: 'door', audio: null, learnAt: 'shed', place: 'むらの こや', magic: 'とびらの まほう' },
  { id: 'basket', word: 'BASKET', ja: 'かご', art: 'basket', speak: 'basket', audio: null, learnAt: 'basketstand', place: 'むらの かごの たな', magic: 'かごに いれる まほう' },
  { id: 'cat', word: 'CAT', ja: 'ねこ', art: 'cat', speak: 'cat', audio: null, learnAt: 'kitten', place: 'むらの こねこの ミケ', magic: 'ねこと なかよく なる まほう' },
  { id: 'milk', word: 'MILK', ja: 'ミルク', art: 'milk', speak: 'milk', audio: null, learnAt: 'cow', place: 'むらの うしさん', magic: 'ミルクの まほう' },
  // みずうみ
  { id: 'fish', word: 'FISH', ja: 'さかな', art: 'fish', speak: 'fish', audio: null, learnAt: 'fishsign', place: 'みずうみの おさかなの かんばん', magic: 'おさかなの まほう' },
  { id: 'bird', word: 'BIRD', ja: 'とり', art: 'bird', speak: 'bird', audio: null, learnAt: 'bird', place: 'みずうみの ことりの ピピ', magic: 'ことりの まほう' },
  { id: 'tree', word: 'TREE', ja: 'き', art: 'tree', speak: 'tree', audio: null, learnAt: 'bigtree', place: 'みずうみの おおきな き', magic: 'きの まほう' },
  // いろの にわ
  { id: 'red', word: 'RED', ja: 'あか', art: 'red', speak: 'red', audio: null, learnAt: 'redpaint', place: 'にわの あかい えのぐ', magic: 'あかい いろの まほう' },
  { id: 'blue', word: 'BLUE', ja: 'あお', art: 'blue', speak: 'blue', audio: null, learnAt: 'bluepaint', place: 'にわの あおい えのぐ', magic: 'あおい いろの まほう' },
];
export const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));

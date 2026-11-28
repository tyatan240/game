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
  // ===== ワールド3「ことばの まち」（world:3。word は ふつうの かきかた。kind で なかまわけ）=====
  // あいさつの ひろば
  ...[
    ['hello', 'Hello', 'こんにちは', 'w3Parrot', 'あう ときの あいさつ'],
    ['goodbye', 'Goodbye', 'さようなら', 'w3Parrot', 'わかれる ときの あいさつ'],
    ['thankyou', 'Thank you', 'ありがとう', 'w3Parrot', 'おれいの ことば'],
    ['sorry', 'Sorry', 'ごめんなさい', 'w3Parrot', 'あやまる ことば'],
    ['goodmorning', 'Good morning', 'おはよう', 'w3Sheep', 'あさの あいさつ'],
    ['goodnight', 'Good night', 'おやすみ', 'w3Sheep', 'ねる まえの あいさつ'],
    ['howareyou', 'How are you?', 'げんき？', 'w3Pig', 'げんきか きく ことば'],
  ].map(([id, word, ja, at, magic]) => ({ id, word, ja, art: id, speak: word, audio: null, learnAt: at, place: 'あいさつの ひろば', magic, world: 3, kind: 'greet' })),
  ...[['happy', 'うれしい'], ['sleepy', 'ねむい'], ['hungry', 'おなかが すいた']].map(([id, ja]) => ({ id, word: id, ja, art: id, speak: id, audio: null, learnAt: 'w3Pig', place: 'あいさつの ひろば', magic: 'きもちを いう ことば', world: 3, kind: 'feel' })),
  // かずの いちば
  ...['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].map((id, i) => ({ id, word: id, ja: String(i + 1), n: i + 1, art: 'n' + (i + 1), speak: id, audio: null, learnAt: i < 5 ? 'w3Bear' : 'w3Deer', place: 'かずの いちば', magic: 'かずを いう ことば', world: 3, kind: 'number' })),
  ...[['apples', 'apple', 'りんご'], ['bananas', 'banana', 'バナナ'], ['eggs', 'egg', 'たまご']].map(([id, one, ja]) => ({ id, word: id, one, ja, art: id, speak: id, audio: null, learnAt: 'w3Grocer', place: 'かずの いちば', magic: 'おみせで たのむ ことば', world: 3, kind: 'thing' })),
  // いろと かたちの こうぼう（id は ワールド1の RED・BLUE と かぶらない ように c を つける）
  ...[['cred', 'red', 'あか', 'あかい'], ['cblue', 'blue', 'あお', 'あおい'], ['cyellow', 'yellow', 'きいろ', 'きいろい'], ['cgreen', 'green', 'みどり', 'みどりの'], ['cpink', 'pink', 'ピンク', 'ピンクの'], ['cwhite', 'white', 'しろ', 'しろい']]
    .map(([id, word, ja, jaAdj]) => ({ id, word, ja, jaAdj, art: id, speak: word, audio: null, learnAt: 'w3Painter', place: 'いろと かたちの こうぼう', magic: 'いろを いう ことば', world: 3, kind: 'color' })),
  ...[['circle', 'まる'], ['square', 'しかく'], ['triangle', 'さんかく'], ['star', 'ほし'], ['heart', 'ハート']]
    .map(([id, ja]) => ({ id, word: id, ja, art: 's_' + id, speak: id, audio: null, learnAt: 'w3Shaper', place: 'いろと かたちの こうぼう', magic: 'かたちを いう ことば', world: 3, kind: 'shape' })),
  // すきなものの がっこう
  ...[['swim', 'およぐ', 'およげる'], ['run', 'はしる', 'はしれる'], ['jump', 'ジャンプ', 'ジャンプできる'], ['sing', 'うたう', 'うたえる'], ['dance', 'おどる', 'おどれる']]
    .map(([id, ja, jaCan]) => ({ id, word: id, ja, jaCan, art: 'a_' + id, speak: id, audio: null, learnAt: 'w3Frog', place: 'すきなものの がっこう', magic: 'できる ことを いう ことば', world: 3, kind: 'action' })),
  ...[['dogs', 'dog', 'いぬ'], ['cats', 'cat', 'ねこ']].map(([id, one, ja]) => ({ id, word: id, one, ja, art: id, speak: id, audio: null, learnAt: 'w3Elephant', place: 'すきなものの がっこう', magic: 'すきな ものを いう ことば', world: 3, kind: 'thing' })),
  // ===== ワールド4「おとの しま」（world:4。word は こもじ。おとの クイズに つかう ことば）=====
  ...[['pig', 'ぶた'], ['igloo', 'かまくら（イグルー）'], ['egg', 'たまご', 'eggs'], ['hat', 'ぼうし'], ['pen', 'ペン'], ['nest', 'すばこ（とりの す）'],
    ['goat', 'やぎ'], ['octopus', 'たこ'], ['umbrella', 'かさ'], ['lion', 'ライオン'], ['bat', 'バット'], ['rat', 'ねずみ'], ['fan', 'せんぷうき'], ['van', 'ワゴンしゃ'], ['map', 'ちず'], ['cap', 'ぼうし（キャップ）'],
    ['hen', 'めんどり'], ['net', 'あみ'], ['jet', 'ジェットき'], ['bed', 'ベッド'], ['wig', 'かつら'], ['log', 'まるた'], ['box', 'はこ'], ['fox', 'きつね'], ['bun', 'まるい パン'], ['bug', 'むし'],
    ['mug', 'マグカップ'], ['cup', 'カップ'], ['pup', 'こいぬ'], ['bus', 'バス'], ['top', 'こま'], ['web', 'くもの す'], ['zebra', 'しまうま'], ['yoyo', 'ヨーヨー'], ['queen', 'じょおうさま（かんむり）']]
    .map(([id, ja, art]) => ({ id, word: id, ja, art: art || 'p_' + id, speak: id, audio: null, place: 'おとの しま', world: 4, kind: 'phon' })),
];
export const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));

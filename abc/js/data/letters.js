// アルファベットの データ（ついか・へんしゅう しやすい ように ここに まとめる）
//   name   … にほんごの よみかた（もじの なまえ）
//   speak  … おんせいごうせいに よませる ことば（もじの なまえとして ただしく よまれる つづり）
//   audio  … ろくおん ファイルを つかう ときは ここに パスを かく（あれば こちらを ゆうせん）
//   phonics… フォニックスの おと（あとの ワールドで つかう。もじの なまえとは べつ）
export const LETTERS = [
  { id: 'A', upper: 'A', lower: 'a', name: 'エイ', speak: 'A', phonics: '/æ/', audio: null },
  { id: 'B', upper: 'B', lower: 'b', name: 'ビー', speak: 'B', phonics: '/b/', audio: null },
  { id: 'C', upper: 'C', lower: 'c', name: 'シー', speak: 'C', phonics: '/k/', audio: null },
  { id: 'D', upper: 'D', lower: 'd', name: 'ディー', speak: 'D', phonics: '/d/', audio: null },
  { id: 'E', upper: 'E', lower: 'e', name: 'イー', speak: 'E', phonics: '/e/', audio: null },
  { id: 'F', upper: 'F', lower: 'f', name: 'エフ', speak: 'F', phonics: '/f/', audio: null },
  { id: 'G', upper: 'G', lower: 'g', name: 'ジー', speak: 'G', phonics: '/g/', audio: null },
  { id: 'H', upper: 'H', lower: 'h', name: 'エイチ', speak: 'H', phonics: '/h/', audio: null },
  { id: 'I', upper: 'I', lower: 'i', name: 'アイ', speak: 'I', phonics: '/ɪ/', audio: null },
  { id: 'J', upper: 'J', lower: 'j', name: 'ジェイ', speak: 'J', phonics: '/dʒ/', audio: null },
  { id: 'K', upper: 'K', lower: 'k', name: 'ケイ', speak: 'K', phonics: '/k/', audio: null },
  { id: 'L', upper: 'L', lower: 'l', name: 'エル', speak: 'L', phonics: '/l/', audio: null },
  { id: 'M', upper: 'M', lower: 'm', name: 'エム', speak: 'M', phonics: '/m/', audio: null },
  { id: 'N', upper: 'N', lower: 'n', name: 'エヌ', speak: 'N', phonics: '/n/', audio: null },
  { id: 'O', upper: 'O', lower: 'o', name: 'オウ', speak: 'O', phonics: '/ɒ/', audio: null },
  { id: 'P', upper: 'P', lower: 'p', name: 'ピー', speak: 'P', phonics: '/p/', audio: null },
  { id: 'Q', upper: 'Q', lower: 'q', name: 'キュー', speak: 'Q', phonics: '/kw/', audio: null },
  { id: 'R', upper: 'R', lower: 'r', name: 'アール', speak: 'R', phonics: '/r/', audio: null },
  { id: 'S', upper: 'S', lower: 's', name: 'エス', speak: 'S', phonics: '/s/', audio: null },
  { id: 'T', upper: 'T', lower: 't', name: 'ティー', speak: 'T', phonics: '/t/', audio: null },
  { id: 'U', upper: 'U', lower: 'u', name: 'ユー', speak: 'U', phonics: '/ʌ/', audio: null },
  { id: 'V', upper: 'V', lower: 'v', name: 'ヴィー', speak: 'V', phonics: '/v/', audio: null },
  { id: 'W', upper: 'W', lower: 'w', name: 'ダブリュー', speak: 'W', phonics: '/w/', audio: null },
  { id: 'X', upper: 'X', lower: 'x', name: 'エックス', speak: 'X', phonics: '/ks/', audio: null },
  { id: 'Y', upper: 'Y', lower: 'y', name: 'ワイ', speak: 'Y', phonics: '/j/', audio: null },
  { id: 'Z', upper: 'Z', lower: 'z', name: 'ズィー', speak: 'Z', phonics: '/z/', audio: null },
];
export const LETTER = Object.fromEntries(LETTERS.map(l => [l.id, l]));
// ワールド1 MVP で つかう もじ
export const WORLD1_LETTERS = ['A', 'B', 'C', 'D', 'E'];

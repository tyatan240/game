// アルファベットの データ（ついか・へんしゅう しやすい ように ここに まとめる）
//   name   … にほんごの よみかた（もじの なまえ）
//   speak  … おんせいごうせいに よませる ことば。もじ ひとつ だけ（例 'H'）だと へんな よみかたを する
//            たんまつが あるので、もじの なまえの つづり（'aitch'・'jay' など）に している
//            iPad（Safari）は おおもじ 1つ（'A'）を「Capital A」と よむので、おおもじ 1つは つかわない
//   audio  … ろくおん ファイルを つかう ときは ここに パスを かく（あれば こちらを ゆうせん）
//   phonics… フォニックスの おと（あとの ワールドで つかう。もじの なまえとは べつ）
export const LETTERS = [
  { id: 'A', upper: 'A', lower: 'a', name: 'エイ', speak: 'eigh', phonics: '/æ/', audio: null },
  { id: 'B', upper: 'B', lower: 'b', name: 'ビー', speak: 'bee', phonics: '/b/', audio: null },
  { id: 'C', upper: 'C', lower: 'c', name: 'シー', speak: 'see', phonics: '/k/', audio: null },
  { id: 'D', upper: 'D', lower: 'd', name: 'ディー', speak: 'dee', phonics: '/d/', audio: null },
  { id: 'E', upper: 'E', lower: 'e', name: 'イー', speak: 'ee', phonics: '/e/', audio: null },
  { id: 'F', upper: 'F', lower: 'f', name: 'エフ', speak: 'eff', phonics: '/f/', audio: null },
  { id: 'G', upper: 'G', lower: 'g', name: 'ジー', speak: 'gee', phonics: '/g/', audio: null },
  { id: 'H', upper: 'H', lower: 'h', name: 'エイチ', speak: 'aitch', phonics: '/h/', audio: null },
  { id: 'I', upper: 'I', lower: 'i', name: 'アイ', speak: 'eye', phonics: '/ɪ/', audio: null },
  { id: 'J', upper: 'J', lower: 'j', name: 'ジェイ', speak: 'jay', phonics: '/dʒ/', audio: null },
  { id: 'K', upper: 'K', lower: 'k', name: 'ケイ', speak: 'kay', phonics: '/k/', audio: null },
  { id: 'L', upper: 'L', lower: 'l', name: 'エル', speak: 'el', phonics: '/l/', audio: null },
  { id: 'M', upper: 'M', lower: 'm', name: 'エム', speak: 'em', phonics: '/m/', audio: null },
  { id: 'N', upper: 'N', lower: 'n', name: 'エヌ', speak: 'en', phonics: '/n/', audio: null },
  { id: 'O', upper: 'O', lower: 'o', name: 'オウ', speak: 'oh', phonics: '/ɒ/', audio: null },
  { id: 'P', upper: 'P', lower: 'p', name: 'ピー', speak: 'pee', phonics: '/p/', audio: null },
  { id: 'Q', upper: 'Q', lower: 'q', name: 'キュー', speak: 'queue', phonics: '/kw/', audio: null },
  { id: 'R', upper: 'R', lower: 'r', name: 'アール', speak: 'are', phonics: '/r/', audio: null },
  { id: 'S', upper: 'S', lower: 's', name: 'エス', speak: 'ess', phonics: '/s/', audio: null },
  { id: 'T', upper: 'T', lower: 't', name: 'ティー', speak: 'tee', phonics: '/t/', audio: null },
  { id: 'U', upper: 'U', lower: 'u', name: 'ユー', speak: 'you', phonics: '/ʌ/', audio: null },
  { id: 'V', upper: 'V', lower: 'v', name: 'ヴィー', speak: 'vee', phonics: '/v/', audio: null },
  { id: 'W', upper: 'W', lower: 'w', name: 'ダブリュー', speak: 'double you', phonics: '/w/', audio: null },
  { id: 'X', upper: 'X', lower: 'x', name: 'エックス', speak: 'ex', phonics: '/ks/', audio: null },
  { id: 'Y', upper: 'Y', lower: 'y', name: 'ワイ', speak: 'why', phonics: '/j/', audio: null },
  { id: 'Z', upper: 'Z', lower: 'z', name: 'ズィー', speak: 'zee', phonics: '/z/', audio: null },
];
export const LETTER = Object.fromEntries(LETTERS.map(l => [l.id, l]));
// ワールド1 MVP で つかう もじ
export const WORLD1_LETTERS = ['A', 'B', 'C', 'D', 'E'];

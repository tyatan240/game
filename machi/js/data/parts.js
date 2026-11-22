// まちの パーツ（まちの おみせ せんようの カタログ。おへやの おみせの ITEMS とは べつ）
// id は ほぞんデータに のこるので かえない・けさない。ここに 1ぎょう たせば パーツが ふえる。
//   cat   … おみせ・つくる の カテゴリ
//   layer … 'ground'（じめんを ぬる 1マス）/ 'object'（おく もの。size マス ぶん）
//   price … ひつような ⭐（0 は さいしょから つかえる）。かうと なんこでも おける
//   size  … [よこ, たて] マス     rotate … まわせる      home … すめる おうち（さいだい 2にん）
//   walk  … うえを あるける（はな・くさ・はし）    water … みず（あるけない）   onWater … みずの うえに だけ おける
//   kind  … 'look' の とき：やね・かべ・ドア・まどの いろ／かたち（おうちの みための へんこうに つかう）
//   fav   … すきな ばしょ グループ（キャラの このみ）
export const CATS = [
  { id: 'house', name: 'おうち', icon: '🏠' },
  { id: 'look', name: 'やね・かべ', icon: '🎨' },
  { id: 'road', name: 'みち', icon: '🛤️' },
  { id: 'nature', name: 'しぜん', icon: '🌳' },
  { id: 'garden', name: 'おにわ', icon: '🌷' },
  { id: 'park', name: 'こうえん', icon: '⛲' },
  { id: 'special', name: 'とくべつ', icon: '✨' },
];

export const PARTS = [
  // じめん
  { id: 'grass', cat: 'road', name: 'くさ（みちを けす）', layer: 'ground', price: 0 },
  { id: 'road_dirt', cat: 'road', name: 'つちの みち', layer: 'ground', price: 0, road: true },
  { id: 'road_stone', cat: 'road', name: 'いしだたみ', layer: 'ground', price: 20, road: true },
  { id: 'road_brick', cat: 'road', name: 'レンガの みち', layer: 'ground', price: 30, road: true },
  { id: 'road_pink', cat: 'road', name: 'ピンクの みち', layer: 'ground', price: 40, road: true },
  { id: 'water', cat: 'nature', name: 'いけ・かわ', layer: 'ground', price: 0, water: true },
  { id: 'plaza', cat: 'special', name: 'ひろば', layer: 'ground', price: 40, road: true, fav: 'park' },
  // おうち
  { id: 'house_basic', cat: 'house', name: 'ちいさな おうち', size: [2, 2], price: 0, home: true, look: { roof: 'red', wall: 'cream', door: 'basic', window: 'square' } },
  { id: 'house_wood', cat: 'house', name: 'きの おうち', size: [2, 2], price: 50, home: true, look: { roof: 'green', wall: 'wood', door: 'basic', window: 'square' } },
  { id: 'house_brick', cat: 'house', name: 'レンガの おうち', size: [3, 2], price: 80, home: true, look: { roof: 'blue', wall: 'brick', door: 'round', window: 'square' } },
  { id: 'house_cake', cat: 'house', name: 'ケーキの おうち', size: [2, 2], price: 100, home: true, look: { roof: 'pink', wall: 'cream', door: 'round', window: 'heart' } },
  { id: 'house_castle', cat: 'house', name: 'おしろの おうち', size: [3, 3], price: 150, home: true, look: { roof: 'purple', wall: 'white', door: 'round', window: 'round' } },
  // やね・かべ（おうちの みため）
  { id: 'roof_red', cat: 'look', kind: 'roof', name: 'あかい やね', price: 0, color: '#e8605a' },
  { id: 'roof_blue', cat: 'look', kind: 'roof', name: 'あおい やね', price: 0, color: '#5a8fe0' },
  { id: 'roof_green', cat: 'look', kind: 'roof', name: 'みどりの やね', price: 30, color: '#5bb36a' },
  { id: 'roof_pink', cat: 'look', kind: 'roof', name: 'ピンクの やね', price: 30, color: '#f383b4' },
  { id: 'roof_purple', cat: 'look', kind: 'roof', name: 'むらさきの やね', price: 30, color: '#9b7be0' },
  { id: 'roof_yellow', cat: 'look', kind: 'roof', name: 'きいろの やね', price: 30, color: '#f2c14e' },
  { id: 'wall_cream', cat: 'look', kind: 'wall', name: 'クリームの かべ', price: 0, color: '#fff3d9' },
  { id: 'wall_white', cat: 'look', kind: 'wall', name: 'しろい かべ', price: 0, color: '#ffffff' },
  { id: 'wall_wood', cat: 'look', kind: 'wall', name: 'きの かべ', price: 30, color: '#d9a066' },
  { id: 'wall_brick', cat: 'look', kind: 'wall', name: 'レンガの かべ', price: 30, color: '#d9775f' },
  { id: 'wall_mint', cat: 'look', kind: 'wall', name: 'ミントの かべ', price: 30, color: '#bfeedd' },
  { id: 'wall_lavender', cat: 'look', kind: 'wall', name: 'ラベンダーの かべ', price: 30, color: '#e4d8ff' },
  { id: 'door_basic', cat: 'look', kind: 'door', name: 'しかくい ドア', price: 0 },
  { id: 'door_round', cat: 'look', kind: 'door', name: 'まるい ドア', price: 30 },
  { id: 'door_heart', cat: 'look', kind: 'door', name: 'ハートの ドア', price: 50 },
  { id: 'window_square', cat: 'look', kind: 'window', name: 'しかくい まど', price: 0 },
  { id: 'window_round', cat: 'look', kind: 'window', name: 'まるい まど', price: 30 },
  { id: 'window_heart', cat: 'look', kind: 'window', name: 'ハートの まど', price: 50 },
  // しぜん
  { id: 'tree_basic', cat: 'nature', name: 'き', size: [1, 1], price: 0, fav: 'forest' },
  { id: 'tree_round', cat: 'nature', name: 'まあるい き', size: [1, 1], price: 10, fav: 'forest' },
  { id: 'tree_pine', cat: 'nature', name: 'もみの き', size: [1, 1], price: 15, fav: 'forest' },
  { id: 'tree_sakura', cat: 'nature', name: 'さくらの き', size: [1, 1], price: 30, fav: 'forest' },
  { id: 'tree_apple', cat: 'nature', name: 'りんごの き', size: [1, 1], price: 30, fav: 'forest' },
  { id: 'bush', cat: 'nature', name: 'ていぼく', size: [1, 1], price: 10 },
  { id: 'tuft', cat: 'nature', name: 'くさむら', size: [1, 1], price: 0, walk: true },
  { id: 'flower_red', cat: 'nature', name: 'あかい はな', size: [1, 1], price: 0, walk: true, fav: 'flower' },
  { id: 'flower_yellow', cat: 'nature', name: 'きいろい はな', size: [1, 1], price: 0, walk: true, fav: 'flower' },
  { id: 'flower_pink', cat: 'nature', name: 'ピンクの はな', size: [1, 1], price: 10, walk: true, fav: 'flower' },
  { id: 'flower_tulip', cat: 'nature', name: 'チューリップ', size: [1, 1], price: 15, walk: true, fav: 'flower' },
  { id: 'flower_sun', cat: 'nature', name: 'ひまわり', size: [1, 1], price: 20, walk: true, fav: 'flower' },
  { id: 'bridge', cat: 'nature', name: 'はし', size: [1, 1], price: 0, walk: true, onWater: true, rotate: true },
  { id: 'rock', cat: 'nature', name: 'いわ', size: [1, 1], price: 10 },
  // おにわ
  { id: 'fence', cat: 'garden', name: 'さく', size: [1, 1], price: 0, rotate: true },
  { id: 'flowerbed', cat: 'garden', name: 'かだん', size: [2, 1], price: 20, fav: 'flower' },
  { id: 'bench', cat: 'garden', name: 'ベンチ', size: [2, 1], price: 20, fav: 'bench' },
  { id: 'mailbox', cat: 'garden', name: 'ポスト', size: [1, 1], price: 10 },
  { id: 'pot', cat: 'garden', name: 'うえきばち', size: [1, 1], price: 10, fav: 'flower' },
  // こうえん
  { id: 'lamp', cat: 'park', name: 'がいとう', size: [1, 1], price: 20 },
  { id: 'sandbox', cat: 'park', name: 'すなば', size: [2, 2], price: 60, fav: 'park' },
  { id: 'swing', cat: 'park', name: 'ブランコ', size: [2, 1], price: 100, fav: 'park' },
  { id: 'slide', cat: 'park', name: 'すべりだい', size: [2, 2], price: 120, fav: 'park' },
  { id: 'fountain', cat: 'park', name: 'ふんすい', size: [2, 2], price: 150, fav: 'park' },
  // とくべつ
  { id: 'school', cat: 'special', name: 'がっこう', size: [3, 3], price: 150 },
  { id: 'cafe', cat: 'special', name: 'ケーキやさん', size: [2, 2], price: 120, fav: 'bench' },
  { id: 'rainbow', cat: 'special', name: 'にじの アーチ', size: [2, 1], price: 100, walk: true, fav: 'park' },
  // まちに さいしょから ある もの（おみせでは うらない・けせない）
  { id: 'moko_house', cat: 'fixed', name: 'モコの おうち', size: [3, 2], price: 0, fixed: true, look: { roof: 'pink', wall: 'white', door: 'heart', window: 'heart' } },
  { id: 'town_shop', cat: 'fixed', name: 'まちの おみせ', size: [3, 2], price: 0, fixed: true },
];
export const PART = Object.fromEntries(PARTS.map(p => [p.id, p]));
export const LOOK = kind => PARTS.filter(p => p.cat === 'look' && p.kind === kind);
export const lookColor = (kind, id) => (PART[kind + '_' + id] || {}).color;
// うる もの（fixed いがい）
export const SHOP_PARTS = PARTS.filter(p => !p.fixed);
export const FREE = PARTS.filter(p => !p.fixed && !p.price).map(p => p.id);

// キャラの すきな ばしょ（よく いく）。しらない キャラは 'park'
export const FAV = {
  c_moko: 'flower', c_hamster: 'flower', c_penguin: 'park', c_cat: 'bench', c_princess: 'flower', c_unicorn: 'park',
  c_panda: 'forest', c_sheep: 'flower', c_poodle: 'park', c_lily: 'flower', c_starfox: 'forest', c_angelbear: 'forest',
};
export const FAV_NAME = { flower: 'おはな', forest: 'もり', bench: 'ベンチ', park: 'こうえん' };

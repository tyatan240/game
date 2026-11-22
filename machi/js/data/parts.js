// まちの パーツ（まちの おみせ せんようの カタログ。おへやの おみせの ITEMS とは べつ）
// id は ほぞんデータに のこるので かえない・けさない。ここに 1ぎょう たせば パーツが ふえる。
//   cat   … おみせ・つくる の カテゴリ
//   layer … 'ground'（じめんを ぬる 1マス）/ 'object'（おく もの。size マス ぶん）
//   price … ひつような ⭐（0 は さいしょから つかえる）。かうと なんこでも おける（2026-11 に ぜんぶ 3ばいに した）
//   size  … [よこ, たて] マス     rotate … まわせる      home … すめる おうち（さいだい 2にん）
//   walk  … うえを あるける（はな・くさ・はし）    water … みず（あるけない）   onWater … みずの うえに だけ おける
//   kind  … 'look' の とき：やね・かべ・ドア・まどの いろ／かたち（おうちの みための へんこうに つかう）
//   fav   … すきな ばしょ グループ（キャラの このみ）
//   quest … おねがいの ごほうび（おみせでは うらない）  custom … おおきさを かえられる おうち  tall … 2かいだて
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
  { id: 'road_stone', cat: 'road', name: 'いしだたみ', layer: 'ground', price: 60, road: true },
  { id: 'road_brick', cat: 'road', name: 'レンガの みち', layer: 'ground', price: 90, road: true },
  { id: 'road_pink', cat: 'road', name: 'ピンクの みち', layer: 'ground', price: 120, road: true },
  { id: 'water', cat: 'nature', name: 'いけ・かわ', layer: 'ground', price: 0, water: true },
  { id: 'sand', cat: 'nature', name: 'すなはま', layer: 'ground', price: 60 },
  { id: 'plaza', cat: 'special', name: 'ひろば', layer: 'ground', price: 120, road: true, fav: 'park' },
  // おうち
  { id: 'house_basic', cat: 'house', name: 'ちいさな おうち', size: [2, 2], price: 0, home: true, look: { roof: 'red', wall: 'cream', door: 'basic', window: 'square' } },
  { id: 'house_wood', cat: 'house', name: 'きの おうち', size: [2, 2], price: 150, home: true, look: { roof: 'green', wall: 'wood', door: 'basic', window: 'square', deco: ['chimney'] } },
  { id: 'house_brick', cat: 'house', name: 'レンガの おうち', size: [3, 2], price: 240, home: true, look: { roof: 'blue', wall: 'brick', door: 'round', window: 'square', deco: ['chimney'] } },
  { id: 'house_tall', cat: 'house', name: '2かいだての おうち', size: [2, 2], price: 240, home: true, tall: 1, look: { roof: 'blue', wall: 'white', door: 'basic', window: 'round', deco: ['flowerbox'] } },
  { id: 'house_mushroom', cat: 'house', name: 'きのこの おうち', size: [2, 2], price: 270, home: true, look: { roof: 'red', wall: 'cream', door: 'round', window: 'round', shape: 'mushroom' } },
  { id: 'house_custom', cat: 'house', name: 'じぶんで つくる おうち', size: [2, 2], price: 300, home: true, custom: true, look: { roof: 'pink', wall: 'cream', door: 'basic', window: 'square', shape: 'gable', deco: [] } },
  { id: 'house_cake', cat: 'house', name: 'ケーキの おうち', size: [2, 2], price: 300, home: true, look: { roof: 'pink', wall: 'cream', door: 'round', window: 'heart' } },
  { id: 'house_castle', cat: 'house', name: 'おしろの おうち', size: [3, 3], price: 450, home: true, look: { roof: 'purple', wall: 'white', door: 'round', window: 'round' } },
  // やね・かべ（おうちの みため）
  { id: 'roof_red', cat: 'look', kind: 'roof', name: 'あかい やね', price: 0, color: '#e8605a' },
  { id: 'roof_blue', cat: 'look', kind: 'roof', name: 'あおい やね', price: 0, color: '#5a8fe0' },
  { id: 'roof_green', cat: 'look', kind: 'roof', name: 'みどりの やね', price: 90, color: '#5bb36a' },
  { id: 'roof_pink', cat: 'look', kind: 'roof', name: 'ピンクの やね', price: 90, color: '#f383b4' },
  { id: 'roof_purple', cat: 'look', kind: 'roof', name: 'むらさきの やね', price: 90, color: '#9b7be0' },
  { id: 'roof_yellow', cat: 'look', kind: 'roof', name: 'きいろの やね', price: 90, color: '#f2c14e' },
  { id: 'wall_cream', cat: 'look', kind: 'wall', name: 'クリームの かべ', price: 0, color: '#fff3d9' },
  { id: 'wall_white', cat: 'look', kind: 'wall', name: 'しろい かべ', price: 0, color: '#ffffff' },
  { id: 'wall_wood', cat: 'look', kind: 'wall', name: 'きの かべ', price: 90, color: '#d9a066' },
  { id: 'wall_brick', cat: 'look', kind: 'wall', name: 'レンガの かべ', price: 90, color: '#d9775f' },
  { id: 'wall_mint', cat: 'look', kind: 'wall', name: 'ミントの かべ', price: 90, color: '#bfeedd' },
  { id: 'wall_lavender', cat: 'look', kind: 'wall', name: 'ラベンダーの かべ', price: 90, color: '#e4d8ff' },
  { id: 'door_basic', cat: 'look', kind: 'door', name: 'しかくい ドア', price: 0 },
  { id: 'door_round', cat: 'look', kind: 'door', name: 'まるい ドア', price: 90 },
  { id: 'door_heart', cat: 'look', kind: 'door', name: 'ハートの ドア', price: 150 },
  { id: 'window_square', cat: 'look', kind: 'window', name: 'しかくい まど', price: 0 },
  { id: 'window_round', cat: 'look', kind: 'window', name: 'まるい まど', price: 90 },
  { id: 'window_heart', cat: 'look', kind: 'window', name: 'ハートの まど', price: 150 },
  // やねの かたち（shape）・かざり（deco：いくつでも）
  { id: 'shape_gable', cat: 'look', kind: 'shape', name: 'さんかくの やね', price: 0 },
  { id: 'shape_round', cat: 'look', kind: 'shape', name: 'まるい やね', price: 90 },
  { id: 'shape_flat', cat: 'look', kind: 'shape', name: 'たいらな やね', price: 90 },
  { id: 'shape_pointy', cat: 'look', kind: 'shape', name: 'とんがり やね', price: 90 },
  { id: 'shape_mushroom', cat: 'look', kind: 'shape', name: 'きのこの やね', price: 150 },
  { id: 'deco_chimney', cat: 'look', kind: 'deco', name: 'えんとつ', price: 0 },
  { id: 'deco_flowerbox', cat: 'look', kind: 'deco', name: 'まどべの はな', price: 60 },
  { id: 'deco_awning', cat: 'look', kind: 'deco', name: 'しましまの ひさし', price: 90 },
  { id: 'deco_heart', cat: 'look', kind: 'deco', name: 'ハートの かざり', price: 90 },
  { id: 'deco_star', cat: 'look', kind: 'deco', name: 'ほしの かざり', price: 90 },
  { id: 'deco_lantern', cat: 'look', kind: 'deco', name: 'げんかんの あかり', price: 60 },
  { id: 'deco_ribbon', cat: 'look', kind: 'deco', name: 'おおきな リボン', price: 120 },
  // しぜん
  { id: 'tree_basic', cat: 'nature', name: 'き', size: [1, 1], price: 0, fav: 'forest' },
  { id: 'tree_round', cat: 'nature', name: 'まあるい き', size: [1, 1], price: 30, fav: 'forest' },
  { id: 'tree_pine', cat: 'nature', name: 'もみの き', size: [1, 1], price: 45, fav: 'forest' },
  { id: 'tree_sakura', cat: 'nature', name: 'さくらの き', size: [1, 1], price: 90, fav: 'forest' },
  { id: 'tree_apple', cat: 'nature', name: 'りんごの き', size: [1, 1], price: 90, fav: 'forest' },
  { id: 'bush', cat: 'nature', name: 'ていぼく', size: [1, 1], price: 30 },
  { id: 'tuft', cat: 'nature', name: 'くさむら', size: [1, 1], price: 0, walk: true },
  { id: 'flower_red', cat: 'nature', name: 'あかい はな', size: [1, 1], price: 0, walk: true, fav: 'flower' },
  { id: 'flower_yellow', cat: 'nature', name: 'きいろい はな', size: [1, 1], price: 0, walk: true, fav: 'flower' },
  { id: 'flower_pink', cat: 'nature', name: 'ピンクの はな', size: [1, 1], price: 30, walk: true, fav: 'flower' },
  { id: 'flower_tulip', cat: 'nature', name: 'チューリップ', size: [1, 1], price: 45, walk: true, fav: 'flower' },
  { id: 'flower_sun', cat: 'nature', name: 'ひまわり', size: [1, 1], price: 60, walk: true, fav: 'flower' },
  { id: 'bridge', cat: 'nature', name: 'はし', size: [1, 1], price: 0, walk: true, onWater: true, rotate: true },
  { id: 'rock', cat: 'nature', name: 'いわ', size: [1, 1], price: 30 },
  // おにわ
  { id: 'fence', cat: 'garden', name: 'さく', size: [1, 1], price: 0, rotate: true },
  { id: 'flowerbed', cat: 'garden', name: 'かだん', size: [2, 1], price: 60, fav: 'flower' },
  { id: 'bench', cat: 'garden', name: 'ベンチ', size: [2, 1], price: 60, fav: 'bench' },
  { id: 'mailbox', cat: 'garden', name: 'ポスト', size: [1, 1], price: 30 },
  { id: 'pot', cat: 'garden', name: 'うえきばち', size: [1, 1], price: 30, fav: 'flower' },
  // こうえん
  { id: 'lamp', cat: 'park', name: 'がいとう', size: [1, 1], price: 60 },
  { id: 'sandbox', cat: 'park', name: 'すなば', size: [2, 2], price: 180, fav: 'park' },
  { id: 'swing', cat: 'park', name: 'ブランコ', size: [2, 1], price: 300, fav: 'park' },
  { id: 'slide', cat: 'park', name: 'すべりだい', size: [2, 2], price: 360, fav: 'park' },
  { id: 'fountain', cat: 'park', name: 'ふんすい', size: [2, 2], price: 450, fav: 'park' },
  // とくべつ
  { id: 'school', cat: 'special', name: 'がっこう', size: [3, 3], price: 450 },
  { id: 'cafe', cat: 'special', name: 'ケーキやさん', size: [2, 2], price: 360, fav: 'bench' },
  { id: 'rainbow', cat: 'special', name: 'にじの アーチ', size: [2, 1], price: 300, walk: true, fav: 'park' },
  // 🎁 おねがいの ごほうび（おみせでは うらない。quest＝その おねがいで もらえる）
  { id: 'flower_rainbow', cat: 'nature', name: 'にじいろの はな', size: [1, 1], price: 0, quest: 'flowers', walk: true, fav: 'flower' },
  { id: 'well', cat: 'garden', name: 'いど', size: [1, 1], price: 0, quest: 'house2' },
  { id: 'statue', cat: 'park', name: 'モコの どうぞう', size: [1, 1], price: 0, quest: 'park', fav: 'park' },
  { id: 'windmill', cat: 'special', name: 'ふうしゃ', size: [2, 2], price: 0, quest: 'road' },
  { id: 'lamp_star', cat: 'park', name: 'ほしの がいとう', size: [1, 1], price: 0, quest: 'bench' },
  { id: 'carousel', cat: 'park', name: 'メリーゴーランド', size: [3, 3], price: 0, quest: 'friends3', fav: 'park' },
  { id: 'tree_star', cat: 'nature', name: 'ほしの き', size: [1, 1], price: 0, quest: 'forest', fav: 'forest' },
  // まちに さいしょから ある もの（おみせでは うらない・けせない）
  { id: 'moko_house', cat: 'fixed', name: 'モコの おうち', size: [3, 2], price: 0, fixed: true, look: { roof: 'pink', wall: 'white', door: 'heart', window: 'heart', deco: ['chimney'] } },
  { id: 'town_shop', cat: 'fixed', name: 'まちの おみせ', size: [3, 2], price: 0, fixed: true },
];
export const PART = Object.fromEntries(PARTS.map(p => [p.id, p]));
export const LOOK = kind => PARTS.filter(p => p.cat === 'look' && p.kind === kind);
export const lookColor = (kind, id) => (PART[kind + '_' + id] || {}).color;
// うる もの（fixed いがい）
export const SHOP_PARTS = PARTS.filter(p => !p.fixed && !p.quest);
export const FREE = PARTS.filter(p => !p.fixed && !p.quest && !p.price).map(p => p.id);

// キャラの すきな ばしょ（よく いく）。しらない キャラは 'park'
export const FAV = {
  c_moko: 'flower', c_hamster: 'flower', c_penguin: 'park', c_cat: 'bench', c_princess: 'flower', c_unicorn: 'park',
  c_panda: 'forest', c_sheep: 'flower', c_poodle: 'park', c_lily: 'flower', c_starfox: 'forest', c_angelbear: 'forest',
};
export const FAV_NAME = { flower: 'おはな', forest: 'もり', bench: 'ベンチ', park: 'こうえん' };

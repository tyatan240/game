// たからさがしダンジョン：A〜Z の カード（1もじ 3まい、ぜんぶで 78まい）
// id は「もじ＋レア」（A1〜Z3）で こてい。ほぞん（treasure.cards）に のこるので かえない。ことばは さしかえて よい
//   rare 1 ★ ふつう ／ 2 ★★ レア ／ 3 ★★★ キラ
//   a … れいぶんの かんし（'a'・'an'・''）。art … え（art.js / cardart.js / ABCぼうけんの WORD_ART）
const LIST = [
  ['A', ['apple', 'りんご', 'apple', 'an'], ['ant', 'あり', 'c_ant', 'an'], ['angel', 'てんし', 'c_angel', 'an']],
  ['B', ['ball', 'ボール', 'c_ball', 'a'], ['bell', 'ベル', 'c_bell', 'a'], ['butterfly', 'ちょうちょ', 'c_butterfly', 'a']],
  ['C', ['cup', 'コップ', 'c_cup', 'a'], ['cat', 'ねこ', 'cat', 'a'], ['crown', 'かんむり', 'c_crown', 'a']],
  ['D', ['dog', 'いぬ', 'dog', 'a'], ['drum', 'たいこ', 'c_drum', 'a'], ['diamond', 'ダイヤモンド', 'c_diamond', 'a']],
  ['E', ['egg', 'たまご', 'c_egg', 'an'], ['elephant', 'ぞう', 'c_elephant', 'an'], ['eagle', 'わし', 'c_eagle', 'an']],
  ['F', ['fish', 'さかな', 'fish', 'a'], ['flower', 'はな', 'flower', 'a'], ['fairy', 'ようせい', 'c_fairy', 'a']],
  ['G', ['gift', 'プレゼント', 'c_gift', 'a'], ['guitar', 'ギター', 'c_guitar', 'a'], ['gold', 'きん', 'c_gold', '']],
  ['H', ['hat', 'ぼうし', 'c_hat', 'a'], ['horse', 'うま', 'c_horse', 'a'], ['heart', 'ハート', 'c_heart', 'a']],
  ['I', ['ice cream', 'アイスクリーム', 'c_icecream', 'an'], ['igloo', 'かまくら', 'c_igloo', 'an'], ['island', 'しま', 'c_island', 'an']],
  ['J', ['jam', 'ジャム', 'c_jam', ''], ['jet', 'ジェットき', 'c_jet', 'a'], ['jewel', 'ほうせき', 'c_jewel', 'a']],
  ['K', ['key', 'かぎ', 'key', 'a'], ['kite', 'たこ', 'c_kite', 'a'], ['king', 'おうさま', 'c_king', 'a']],
  ['L', ['lemon', 'レモン', 'c_lemon', 'a'], ['lamp', 'ランプ', 'c_lamp', 'a'], ['lion', 'ライオン', 'c_lion', 'a']],
  ['M', ['milk', 'ぎゅうにゅう', 'milk', ''], ['map', 'ちず', 'c_map', 'a'], ['moon', 'つき', 'c_moon', 'the']],
  ['N', ['nut', 'きのみ', 'c_nut', 'a'], ['nest', 'とりの す', 'c_nest', 'a'], ['necklace', 'ネックレス', 'c_necklace', 'a']],
  ['O', ['orange', 'オレンジ', 'c_orange', 'an'], ['owl', 'ふくろう', 'c_owl', 'an'], ['octopus', 'たこ', 'c_octopus', 'an']],
  ['P', ['pen', 'ペン', 'c_pen', 'a'], ['pig', 'ぶた', 'c_pig', 'a'], ['pearl', 'しんじゅ', 'c_pearl', 'a']],
  ['Q', ['quilt', 'キルト', 'c_quilt', 'a'], ['quiz', 'クイズ', 'c_quiz', 'a'], ['queen', 'じょおうさま', 'c_queen', 'a']],
  ['R', ['rock', 'いし', 'c_rock', 'a'], ['robot', 'ロボット', 'c_robot', 'a'], ['rainbow', 'にじ', 'c_rainbow', 'a']],
  ['S', ['sock', 'くつした', 'c_sock', 'a'], ['ship', 'ふね', 'c_ship', 'a'], ['star', 'ほし', 'c_star', 'a']],
  ['T', ['toy', 'おもちゃ', 'c_toy', 'a'], ['train', 'でんしゃ', 'c_train', 'a'], ['treasure', 'たからもの', 'c_treasure', '']],
  ['U', ['umbrella', 'かさ', 'c_umbrella', 'an'], ['uniform', 'せいふく', 'c_uniform', 'a'], ['unicorn', 'ユニコーン', 'c_unicorn', 'a']],
  ['V', ['vase', 'かびん', 'c_vase', 'a'], ['violin', 'バイオリン', 'c_violin', 'a'], ['volcano', 'かざん', 'c_volcano', 'a']],
  ['W', ['watch', 'うでどけい', 'c_watch', 'a'], ['whale', 'くじら', 'c_whale', 'a'], ['wand', 'まほうの つえ', 'c_wand', 'a']],
  ['X', ['x-ray', 'レントゲン', 'c_xray', 'an'], ['xylophone', 'もっきん', 'c_xylophone', 'a'], ['Xmas tree', 'クリスマスツリー', 'c_xmastree', 'a']],
  ['Y', ['yo-yo', 'ヨーヨー', 'c_yoyo', 'a'], ['yarn', 'けいと', 'c_yarn', ''], ['yacht', 'ヨット', 'c_yacht', 'a']],
  ['Z', ['zero', 'ゼロ', 'c_zero', ''], ['zipper', 'ファスナー', 'c_zipper', 'a'], ['zebra', 'シマウマ', 'c_zebra', 'a']],
];
export const CARDS = [];
LIST.forEach(([letter, ...three], li) => three.forEach(([en, ja, art, a], i) => {
  CARDS.push({ id: letter + (i + 1), letter, rare: i + 1, no: li * 3 + i + 1, en, ja, art, ex: `This is ${a ? a + ' ' : ''}${en}.` });
}));
export const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
export const LETTERS = LIST.map(l => l[0]);
export const CARD_TOTAL = CARDS.length; // 78

// ふかさと レア（めやす）。かくし部屋は 1だん ふかい かいの わりあい（だい2だんかいで つかう）
export const RARE_BY_DEPTH = [
  { to: 5, p: [85, 14, 1] },
  { to: 10, p: [70, 25, 5] },
  { to: 15, p: [55, 33, 12] },
  { to: 20, p: [40, 40, 20] },
];
export const SHARDS = { 1: 1, 2: 3, 3: 10 };     // ダブった ときの きらきらの かけら
export const CARD_STARS = { 1: 1, 2: 3, 3: 10, badge: 5, clear: 10, firstClear: 30, complete: 100 };

// モコのイングリッシュダンジョン：ことば（ダンジョン せんよう ずかん）・てき・アイテム・まほう のデータ
// ついか・へんこうは ここだけ。id は セーブ（ずかん）に のこるので かえない・けさない。
//   en … えいご（がめんに だす なまえ・はつおん）  ja … にほんごの いみ  art … え（art.js / ABCぼうけんの WORD_ART）
//   cat … monster / item / magic / equip   desc … せつめい（ひらがな ちゅうしん）
export const MAX_FLOOR = 5;   // いま あそべる さいごの かい（だい1かい：5かいまで。のちに 20）
export const BOSS_FLOORS = [5];

export const CATS = [
  { id: 'monster', en: 'Monsters', ja: 'モンスター' },
  { id: 'item', en: 'Items', ja: 'アイテム' },
  { id: 'magic', en: 'Magic', ja: 'まほう' },
  { id: 'equip', en: 'Equipment', ja: 'そうび' },
];

export const WORDS = [
  // ===== モンスター（move：slow ゆっくり／chase おいかける／erratic ふらふら。minFloor から でる）=====
  { id: 'slime', en: 'slime', ja: 'スライム', cat: 'monster', art: 'dg_slime', hp: 5, atk: 1, exp: 2, move: 'slow', minFloor: 1, desc: 'ぷるぷる。ゆっくり うごく。' },
  { id: 'rat', en: 'rat', ja: 'ねずみ', cat: 'monster', art: 'dg_rat', hp: 6, atk: 2, exp: 3, move: 'chase', minFloor: 1, desc: 'ちかくに くると おいかけて くる。' },
  { id: 'bat', en: 'bat', ja: 'コウモリ', cat: 'monster', art: 'dg_bat', hp: 5, atk: 3, exp: 3, move: 'erratic', minFloor: 1, desc: 'ふらふら とぶ。どこへ いくか わからない。' },
  { id: 'snake', en: 'snake', ja: 'へび', cat: 'monster', art: 'dg_snake', hp: 9, atk: 3, exp: 5, move: 'chase', minFloor: 2, desc: 'ちかづいて かみつく。' },
  { id: 'angrypig', en: 'angry pig', ja: 'おこった ブタ', cat: 'monster', art: 'dg_angrypig', hp: 12, atk: 3, exp: 8, move: 'chase', sight: 12, minFloor: 4, desc: 'とおくからでも おいかけて くる。' },
  { id: 'kingslime', en: 'king slime', ja: 'スライムの おう', cat: 'monster', art: 'dg_kingslime', hp: 32, atk: 4, exp: 30, move: 'chase', boss: true, desc: '5かいの ボス。とても つよい。たおすと かいだんが あらわれる。' },
  // ===== アイテム（use：heal かいふく／potion ぜんぶ かいふく／key たからばこ／book まほう／feather ふっかつ）=====
  { id: 'apple', en: 'apple', ja: 'りんご', cat: 'item', art: 'apple', use: 'heal', val: 10, verb: 'たべる', w: 26, desc: 'たべると HPが 10 かいふく する。' },
  { id: 'bread', en: 'bread', ja: 'パン', cat: 'item', art: 'dg_bread', use: 'heal', val: 20, verb: 'たべる', w: 14, desc: 'たべると HPが 20 かいふく する。' },
  { id: 'meat', en: 'meat', ja: 'おにく', cat: 'item', art: 'dg_meat', use: 'heal', val: 30, verb: 'たべる', w: 8, minFloor: 2, desc: 'たべると HPが 30 かいふく する。' },
  { id: 'potion', en: 'potion', ja: 'くすり', cat: 'item', art: 'dg_potion', use: 'potion', verb: 'のむ', w: 5, desc: 'のむと HPと MPが ぜんぶ かいふく する。' },
  { id: 'key', en: 'key', ja: 'かぎ', cat: 'item', art: 'key', use: 'key', verb: 'つかう', w: 0, desc: 'treasure box（たからばこ）の まえで つかうと あけられる。' },
  { id: 'magicbook', en: 'magic book', ja: 'まほうの ほん', cat: 'item', art: 'dg_book', use: 'book', verb: 'よむ', w: 9, desc: 'よむと あたらしい まほうを おぼえる。' },
  { id: 'angelfeather', en: 'angel feather', ja: 'てんしの はね', cat: 'item', art: 'dg_feather', use: 'feather', verb: '', w: 2, minFloor: 3, desc: 'もっていると、たおれても 1かい だけ ふっかつ できる。' },
  { id: 'treasurebox', en: 'treasure box', ja: 'たからばこ', cat: 'item', art: 'dg_box', obj: true, desc: 'key（かぎ）で あけると、なかに アイテムが はいっている。' },
  { id: 'stairs', en: 'stairs', ja: 'かいだん', cat: 'item', art: 'dg_stairs', obj: true, desc: 'のぼると つぎの かいへ すすめる。' },
  // ===== そうび（slot：weapon／shield）=====
  { id: 'sword', en: 'sword', ja: 'けん', cat: 'equip', art: 'dg_sword', slot: 'weapon', atk: 3, w: 6, desc: 'そうびすると つよさが 3 あがる。' },
  { id: 'shield', en: 'shield', ja: 'たて', cat: 'equip', art: 'dg_shield', slot: 'shield', def: 2, w: 6, desc: 'そうびすると まもりが 2 あがる。' },
  // ===== まほう（kind：near いちばん ちかい てき／line むいている ほうこうに まっすぐ／self じぶん）=====
  { id: 'fire', en: 'fire', ja: 'ほのお', cat: 'magic', art: 'dg_fire', mp: 3, dmg: 9, kind: 'near', desc: 'いちばん ちかくの てきに ほのおで こうげき（MP 3）。' },
  { id: 'water', en: 'water', ja: 'みず', cat: 'magic', art: 'water', mp: 2, dmg: 6, kind: 'line', desc: 'むいている ほうこうに みずを とばす。まっすぐ とおくの てきにも あたる（MP 2）。' },
  { id: 'heal', en: 'heal', ja: 'かいふく', cat: 'magic', art: 'dg_heal', mp: 4, val: 20, kind: 'self', desc: 'じぶんの HPを 20 かいふく する（MP 4）。' },
];
export const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));
export const SPELLS = WORDS.filter(w => w.cat === 'magic').map(w => w.id);

// モコ（しゅじんこう）
export const HERO0 = { hp: 24, mp: 6, atk: 3, def: 0 };
export const LV_EXP = [0, 0, 5, 14, 28, 46, 70, 100, 140, 190, 250]; // その レベルに なる ための けいけんち（ごうけい）
export const INV_MAX = 10;

// ⭐（moko-math-v1 の points に たす）
export const STARS = { floor: 1, boss: 10, dex10: 5 };

// モコのイングリッシュダンジョン：ことば（ダンジョン せんよう ずかん）・てき・アイテム・まほう のデータ
// ついか・へんこうは ここだけ。id は セーブ（ずかん）に のこるので かえない・けさない。
//   en … えいご（がめんに だす なまえ・はつおん）  ja … にほんごの いみ  art … え（art.js / ABCぼうけんの WORD_ART）
//   cat … monster / item / magic / equip   desc … せつめい（ひらがな ちゅうしん）
export const MAX_FLOOR = 20;  // さいごの かい
export const BOSS_FLOORS = [5, 10, 15, 20];
export const BOSS_OF = { 5: 'kingslime', 10: 'queenbee', 15: 'ghostking', 20: 'bigdragon' };
export const MINION_OF = { kingslime: 'slime', queenbee: 'bee', ghostking: 'ghost', bigdragon: 'wolf' };
// 5かいごとの どうくつ（ゆかと かべの いろ・なまえ）
export const ZONES = [
  { name: 'つちの どうくつ', floor: ['#f4e6cc', '#e2d2b4'], wall: ['#6a5a7a', '#7c6c8e'] },
  { name: 'はなの どうくつ', floor: ['#e6f4d4', '#d4e8c0'], wall: ['#5a7a5e', '#6c8e70'] },
  { name: 'こおりの どうくつ', floor: ['#e0eefa', '#cadff2'], wall: ['#5a6a8e', '#6c7ca2'] },
  { name: 'ほのおの どうくつ', floor: ['#f8dcc8', '#ecc8b0'], wall: ['#7a4a4a', '#8e5a5a'] },
];
export const zoneOf = floor => ZONES[Math.min(3, Math.max(0, Math.floor((Math.max(1, floor) - 1) / 5)))];

export const CATS = [
  { id: 'monster', en: 'Monsters', ja: 'モンスター' },
  { id: 'item', en: 'Items', ja: 'アイテム' },
  { id: 'magic', en: 'Magic', ja: 'まほう' },
  { id: 'equip', en: 'Equipment', ja: 'そうび' },
];

export const WORDS = [
  // ===== モンスター（move：slow ゆっくり／chase おいかける／erratic ふらふら。minFloor から でる）=====
  { id: 'slime', en: 'slime', ja: 'スライム', cat: 'monster', art: 'dg_slime', hp: 5, atk: 1, exp: 2, move: 'slow', minFloor: 1, maxFloor: 8, desc: 'ぷるぷる。ゆっくり うごく。' },
  { id: 'rat', en: 'rat', ja: 'ねずみ', cat: 'monster', art: 'dg_rat', hp: 6, atk: 2, exp: 3, move: 'chase', minFloor: 1, maxFloor: 10, desc: 'ちかくに くると おいかけて くる。' },
  { id: 'bat', en: 'bat', ja: 'コウモリ', cat: 'monster', art: 'dg_bat', hp: 5, atk: 3, exp: 3, move: 'erratic', minFloor: 1, maxFloor: 12, desc: 'ふらふら とぶ。どこへ いくか わからない。' },
  { id: 'snake', en: 'snake', ja: 'へび', cat: 'monster', art: 'dg_snake', hp: 9, atk: 3, exp: 5, move: 'chase', minFloor: 2, maxFloor: 14, desc: 'ちかづいて かみつく。' },
  { id: 'angrypig', en: 'angry pig', ja: 'おこった ブタ', cat: 'monster', art: 'dg_angrypig', hp: 12, atk: 3, exp: 8, move: 'chase', sight: 12, minFloor: 4, desc: 'とおくからでも おいかけて くる。' },
  { id: 'frog', en: 'frog', ja: 'カエル', cat: 'monster', art: 'dg_frog', hp: 8, atk: 3, exp: 5, move: 'chase', minFloor: 3, maxFloor: 12, desc: 'ぴょんと とんで おいかけて くる。' },
  { id: 'spider', en: 'spider', ja: 'クモ', cat: 'monster', art: 'dg_spider', hp: 10, atk: 4, exp: 7, move: 'chase', web: true, minFloor: 6, desc: 'いとを だす。あたると つぎの ターン うごけない。' },
  { id: 'bee', en: 'bee', ja: 'ハチ', cat: 'monster', art: 'bee', hp: 8, atk: 4, exp: 7, move: 'erratic', minFloor: 7, desc: 'ぶんぶん とぶ。さされると いたい。' },
  // hard … ふつうの こうげきは 1 しか きかない（まほうで たおす）。こうげきの まほうを おぼえてから でる
  { id: 'turtle', en: 'turtle', ja: 'カメ', cat: 'monster', art: 'dg_turtle', hp: 10, atk: 3, exp: 10, move: 'slow', hard: 'こうらが かたい（まほうで たおそう）', minFloor: 4, maxFloor: 12, desc: 'こうらが かたくて、ふつうの こうげきは 1 しか きかない。まほうで たおそう。' },
  { id: 'crab', en: 'crab', ja: 'カニ', cat: 'monster', art: 'dg_crab', hp: 12, atk: 4, exp: 12, move: 'slow', hard: 'こうらが かたい（まほうで たおそう）', minFloor: 9, desc: 'こうらが かたくて、ふつうの こうげきは 1 しか きかない。まほうで たおそう。' },
  { id: 'snowman', en: 'snowman', ja: 'ゆきだるま', cat: 'monster', art: 'dg_snowman', hp: 16, atk: 6, exp: 16, move: 'slow', hard: 'からだが かたい（まほうで たおそう）', minFloor: 11, maxFloor: 17, desc: 'かたい ゆきで できていて、ふつうの こうげきは 1 しか きかない。まほうで たおそう。' },
  { id: 'ghost', en: 'ghost', ja: 'おばけ', cat: 'monster', art: 'dg_ghost', hp: 12, atk: 5, exp: 10, move: 'chase', wall: true, minFloor: 11, desc: 'かべを すりぬけて くる。' },
  { id: 'wolf', en: 'wolf', ja: 'オオカミ', cat: 'monster', art: 'dg_wolf', hp: 18, atk: 6, exp: 13, move: 'chase', sight: 12, minFloor: 13, desc: 'とおくからでも はしって くる。' },
  { id: 'dragon', en: 'dragon', ja: 'ドラゴン', cat: 'monster', art: 'dg_dragon', hp: 24, atk: 7, exp: 20, move: 'chase', breath: true, minFloor: 16, desc: 'まっすぐ ならぶと、とおくから ほのおを はく。' },
  // ===== かくしボス（たからさがし 11かいから。きんの かぎで なぞの とびらを あけると でる。weak の まほうが 2ばい きく）=====
  { id: 'treasuredragon', en: 'treasure dragon', ja: 'たからの ドラゴン', cat: 'monster', art: 'dg_treasuredragon', hp: 140, atk: 11, exp: 80, move: 'chase', breath: true, hboss: true, weak: 'ice', minFloor: 11, desc: 'かくしボス。たからを まもる ドラゴン。　weak: ice' },
  { id: 'crystalgolem', en: 'crystal golem', ja: 'すいしょうの ゴーレム', cat: 'monster', art: 'dg_crystalgolem', hp: 170, atk: 10, exp: 80, move: 'slow', hboss: true, weak: 'thunder', minFloor: 11, desc: 'かくしボス。すいしょうで できた おおきな ゴーレム。　weak: thunder' },
  { id: 'shadowking', en: 'shadow king', ja: 'かげの おう', cat: 'monster', art: 'dg_shadowking', hp: 130, atk: 12, exp: 80, move: 'chase', wall: true, hboss: true, weak: 'fire', minFloor: 11, desc: 'かくしボス。かべを すりぬける かげの おう。　weak: fire' },
  { id: 'kingslime', en: 'king slime', ja: 'スライムの おう', cat: 'monster', art: 'dg_kingslime', hp: 58, atk: 5, exp: 30, move: 'chase', boss: true, desc: '5かいの ボス。とても つよい。たおすと かいだんが あらわれる。' },
  { id: 'queenbee', en: 'queen bee', ja: 'ハチの じょおう', cat: 'monster', art: 'dg_queenbee', hp: 60, atk: 6, exp: 60, move: 'chase', boss: true, desc: '10かいの ボス。bee（ハチ）を よぶ。' },
  { id: 'ghostking', en: 'ghost king', ja: 'おばけの おう', cat: 'monster', art: 'dg_ghostking', hp: 90, atk: 8, exp: 90, move: 'chase', wall: true, boss: true, desc: '15かいの ボス。かべを すりぬける。' },
  { id: 'bigdragon', en: 'big dragon', ja: 'おおきな ドラゴン', cat: 'monster', art: 'dg_bigdragon', hp: 130, atk: 10, exp: 0, move: 'chase', breath: true, boss: true, desc: '20かいの ボス。さいごの てき。ほのおを はく。' },
  // ===== アイテム（use：heal かいふく／potion ぜんぶ かいふく／key たからばこ／book まほう／feather ふっかつ）=====
  { id: 'apple', en: 'apple', ja: 'りんご', cat: 'item', art: 'apple', use: 'heal', val: 10, verb: 'たべる', w: 13, desc: 'たべると HPが 10 かいふく する。' },
  { id: 'bread', en: 'bread', ja: 'パン', cat: 'item', art: 'dg_bread', use: 'heal', val: 20, verb: 'たべる', w: 7, desc: 'たべると HPが 20 かいふく する。' },
  { id: 'banana', en: 'banana', ja: 'バナナ', cat: 'item', art: 'dg_banana', use: 'heal', val: 15, verb: 'たべる', w: 6, minFloor: 2, desc: 'たべると HPが 15 かいふく する。' },
  { id: 'meat', en: 'meat', ja: 'おにく', cat: 'item', art: 'dg_meat', use: 'heal', val: 30, verb: 'たべる', w: 4, minFloor: 2, desc: 'たべると HPが 30 かいふく する。' },
  { id: 'candy', en: 'candy', ja: 'あめ', cat: 'item', art: 'dg_candy', use: 'mp', val: 5, verb: 'たべる', w: 14, desc: 'たべると MPが 5 かいふく する。' },
  { id: 'juice', en: 'juice', ja: 'ジュース', cat: 'item', art: 'dg_juice', use: 'mp', val: 12, verb: 'のむ', w: 9, minFloor: 3, desc: 'のむと MPが 12 かいふく する。' },
  { id: 'bluepotion', en: 'blue potion', ja: 'あおい くすり', cat: 'item', art: 'dg_bluepotion', use: 'mp', val: 99, verb: 'のむ', w: 4, minFloor: 7, desc: 'blue ＝ あお。のむと MPが ぜんぶ かいふく する。' },
  { id: 'potion', en: 'potion', ja: 'くすり', cat: 'item', art: 'dg_potion', use: 'potion', verb: 'のむ', w: 5, desc: 'のむと HPと MPが ぜんぶ かいふく する。' },
  { id: 'key', en: 'key', ja: 'かぎ', cat: 'item', art: 'key', use: 'key', verb: 'つかう', w: 0, desc: 'treasure box（たからばこ）の まえで つかうと あけられる。' },
  { id: 'magicbook', en: 'magic book', ja: 'まほうの ほん', cat: 'item', art: 'dg_book', use: 'book', verb: 'よむ', w: 9, desc: 'よむと あたらしい まほうを おぼえる。' },
  { id: 'angelfeather', en: 'angel feather', ja: 'てんしの はね', cat: 'item', art: 'dg_feather', use: 'feather', verb: '', w: 2, minFloor: 3, desc: 'もっていると、たおれても 1かい だけ ふっかつ できる。' },
  { id: 'torch', en: 'torch', ja: 'たいまつ', cat: 'item', art: 'dg_torch', use: 'torch', verb: 'つかう', w: 5, minFloor: 4, desc: 'つかうと この かいの ちずが ぜんぶ みえる。' },
  { id: 'rope', en: 'rope', ja: 'ロープ', cat: 'item', art: 'dg_rope', use: 'rope', verb: 'つかう', w: 3, minFloor: 6, desc: 'つかうと つぎの かいへ のぼれる（ボスの かいでは つかえない）。' },
  { id: 'treasurebox', en: 'treasure box', ja: 'たからばこ', cat: 'item', art: 'dg_box', obj: true, desc: 'key（かぎ）で あけると、なかに アイテムが はいっている。' },
  { id: 'goldkey', en: 'gold key', ja: 'きんの かぎ', cat: 'item', art: 'dg_goldkey', use: 'goldkey', verb: '', desc: 'gold ＝ きん。きんいろの なぞの とびらを あける かぎ。' },
  { id: 'ltile', en: 'letter', ja: 'もじの タイル', cat: 'item', art: 'dg_ltile', obj: true, desc: 'もじあつめの タイル。ぜんぶ ひろって とびらで ならべよう。' },
  { id: 'sign', en: 'sign', ja: 'かんばん', cat: 'item', art: 'dg_sign', obj: true, desc: 'えいごで ヒントが かいてある。' },
  { id: 'tcard', en: 'card', ja: 'カード', cat: 'item', art: 'dg_tcard', obj: true, desc: 'たからさがしの カード。ふむと ひろえる。' },
  { id: 'stairs', en: 'stairs', ja: 'かいだん', cat: 'item', art: 'dg_stairs', obj: true, desc: 'のぼると つぎの かいへ すすめる。' },
  // ===== そうび（slot：weapon／shield）=====
  //   ふかい かいほど つよい そうびが でる（big・strong・silver・gold は かんたんな えいごの ことば）
  { id: 'sword', en: 'sword', ja: 'けん', cat: 'equip', art: 'dg_sword', slot: 'weapon', atk: 3, w: 6, maxFloor: 10, desc: 'そうびすると つよさが 3 あがる。' },
  { id: 'bigsword', en: 'big sword', ja: 'おおきな けん', cat: 'equip', art: 'dg_bigsword', slot: 'weapon', atk: 5, w: 4, minFloor: 3, maxFloor: 14, desc: 'big ＝ おおきい。つよさが 5 あがる。' },
  { id: 'strongsword', en: 'strong sword', ja: 'つよい けん', cat: 'equip', art: 'dg_strongsword', slot: 'weapon', atk: 7, w: 3, minFloor: 7, desc: 'strong ＝ つよい。つよさが 7 あがる。' },
  { id: 'silversword', en: 'silver sword', ja: 'ぎんの けん', cat: 'equip', art: 'dg_silversword', slot: 'weapon', atk: 10, w: 2, minFloor: 11, desc: 'silver ＝ ぎん。つよさが 10 あがる。' },
  { id: 'goldsword', en: 'gold sword', ja: 'きんの けん', cat: 'equip', art: 'dg_goldsword', slot: 'weapon', atk: 13, w: 1, minFloor: 15, desc: 'gold ＝ きん。つよさが 13 あがる。いちばん つよい けん！' },
  { id: 'shield', en: 'shield', ja: 'たて', cat: 'equip', art: 'dg_shield', slot: 'shield', def: 2, w: 6, maxFloor: 10, desc: 'そうびすると まもりが 2 あがる。' },
  { id: 'bigshield', en: 'big shield', ja: 'おおきな たて', cat: 'equip', art: 'dg_bigshield', slot: 'shield', def: 3, w: 4, minFloor: 4, maxFloor: 14, desc: 'big ＝ おおきい。まもりが 3 あがる。' },
  { id: 'strongshield', en: 'strong shield', ja: 'つよい たて', cat: 'equip', art: 'dg_strongshield', slot: 'shield', def: 5, w: 3, minFloor: 9, desc: 'strong ＝ つよい。まもりが 5 あがる。' },
  { id: 'silvershield', en: 'silver shield', ja: 'ぎんの たて', cat: 'equip', art: 'dg_silvershield', slot: 'shield', def: 7, w: 2, minFloor: 14, desc: 'silver ＝ ぎん。まもりが 7 あがる。' },
  { id: 'armor', en: 'armor', ja: 'よろい', cat: 'equip', art: 'dg_armor', slot: 'armor', def: 3, w: 4, minFloor: 6, maxFloor: 14, desc: 'そうびすると まもりが 3 あがる。' },
  { id: 'strongarmor', en: 'strong armor', ja: 'つよい よろい', cat: 'equip', art: 'dg_strongarmor', slot: 'armor', def: 5, w: 3, minFloor: 10, desc: 'strong ＝ つよい。まもりが 5 あがる。' },
  { id: 'silverarmor', en: 'silver armor', ja: 'ぎんの よろい', cat: 'equip', art: 'dg_silverarmor', slot: 'armor', def: 7, w: 2, minFloor: 15, desc: 'silver ＝ ぎん。まもりが 7 あがる。' },
  // ===== まほう（kind：near いちばん ちかい てき／line むいている ほうこうに まっすぐ／self じぶん／all みえる てき ぜんぶ／push ふきとばす／map ちず）
  //   fam … なかま（おなじ fam を ならべて ひょうじ）  tier … 1〜3（たかいほど つよくて はでな えんしゅつ）=====
  { id: 'fire', en: 'fire', ja: 'ほのお', cat: 'magic', art: 'dg_fire', fam: 'fire', tier: 1, mp: 3, dmg: 9, kind: 'near', desc: 'いちばん ちかくの てきに ほのおで こうげき（MP 3）。' },
  { id: 'water', en: 'water', ja: 'みず', cat: 'magic', art: 'water', fam: 'water', tier: 1, mp: 2, dmg: 6, kind: 'line', desc: 'むいている ほうこうに みずを とばす。まっすぐ とおくの てきにも あたる（MP 2）。' },
  { id: 'heal', en: 'heal', ja: 'かいふく', cat: 'magic', art: 'dg_heal', fam: 'heal', tier: 1, mp: 4, val: 20, kind: 'self', desc: 'じぶんの HPを 20 かいふく する（MP 4）。' },
  { id: 'ice', en: 'ice', ja: 'こおり', cat: 'magic', art: 'dg_ice', fam: 'ice', tier: 1, mp: 3, dmg: 6, kind: 'near', freeze: 3, minFloor: 6, desc: 'いちばん ちかくの てきを こおらせる。3ターン うごけない（MP 3）。' },
  { id: 'thunder', en: 'thunder', ja: 'かみなり', cat: 'magic', art: 'dg_thunder', fam: 'thunder', tier: 1, mp: 5, dmg: 8, kind: 'all', minFloor: 8, desc: 'みえる てき ぜんぶに かみなりを おとす（MP 5）。' },
  { id: 'wind', en: 'wind', ja: 'かぜ', cat: 'magic', art: 'dg_wind', fam: 'wind', tier: 1, mp: 2, kind: 'push', minFloor: 6, desc: 'となりの てきを かぜで とおくへ ふきとばす（MP 2）。' },
  { id: 'light', en: 'light', ja: 'ひかり', cat: 'magic', art: 'dg_light', fam: 'light', tier: 1, mp: 3, kind: 'map', minFloor: 6, desc: 'この かいの ちずと かいだんが ぜんぶ みえる（MP 3）。' },
  { id: 'bigfire', en: 'big fire', ja: 'おおきな ほのお', cat: 'magic', art: 'dg_bigfire', fam: 'fire', tier: 2, mp: 5, dmg: 18, kind: 'near', minFloor: 5, desc: 'big ＝ おおきい。おおきな ほのおで いちばん ちかくの てきを こうげき（MP 5）。' },
  { id: 'widefire', en: 'wide fire', ja: 'ひろがる ほのお', cat: 'magic', art: 'dg_widefire', fam: 'fire', tier: 3, mp: 8, dmg: 16, kind: 'all', minFloor: 10, desc: 'wide ＝ ひろい。みえる てき ぜんぶを ほのおで つつむ（MP 8）。' },
  { id: 'bigwater', en: 'big water', ja: 'おおきな みず', cat: 'magic', art: 'dg_bigwater', fam: 'water', tier: 2, mp: 4, dmg: 13, kind: 'line', minFloor: 7, desc: 'big ＝ おおきい。ふとい みずで まっすぐ こうげき（MP 4）。' },
  { id: 'bigice', en: 'big ice', ja: 'おおきな こおり', cat: 'magic', art: 'dg_bigice', fam: 'ice', tier: 2, mp: 5, dmg: 14, kind: 'near', freeze: 4, minFloor: 10, desc: 'big ＝ おおきい。てきを こおらせて 4ターン うごけなく する（MP 5）。' },
  { id: 'wideice', en: 'wide ice', ja: 'ひろがる こおり', cat: 'magic', art: 'dg_wideice', fam: 'ice', tier: 3, mp: 8, dmg: 10, kind: 'all', freeze: 2, minFloor: 14, desc: 'wide ＝ ひろい。みえる てき ぜんぶを こおらせる（MP 8）。' },
  { id: 'bigthunder', en: 'big thunder', ja: 'おおきな かみなり', cat: 'magic', art: 'dg_bigthunder', fam: 'thunder', tier: 2, mp: 8, dmg: 17, kind: 'all', minFloor: 13, desc: 'big ＝ おおきい。みえる てき ぜんぶに おおきな かみなり（MP 8）。' },
  { id: 'bigheal', en: 'big heal', ja: 'おおきな かいふく', cat: 'magic', art: 'dg_bigheal', fam: 'heal', tier: 2, mp: 7, val: 50, kind: 'self', minFloor: 9, desc: 'big ＝ おおきい。HPを 50 かいふく する（MP 7）。' },
  { id: 'bigwind', en: 'big wind', ja: 'おおきな かぜ', cat: 'magic', art: 'dg_bigwind', fam: 'wind', tier: 2, mp: 4, dmg: 6, kind: 'push', wide: true, minFloor: 9, desc: 'big ＝ おおきい。みえる てき ぜんぶを ふきとばして ダメージ（MP 4）。' },
];
export const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));
export const SPELLS = WORDS.filter(w => w.cat === 'magic').map(w => w.id);
export const FAMS = [...new Set(WORDS.filter(w => w.cat === 'magic').map(w => w.fam))]; // まほうの なかま（ならべる じゅん）
// もちものの ふくろ：そうび／たべもの／まほうの ほん・どうぐ（ふくろ ごとに いれられる かず）
//   そうびは ぶき・たて・よろい で べつの ふくろ（group：もちもの がめんの うえの タブ）
export const BAGS = [
  { id: 'weapon', name: 'ぶき', max: 5, group: 'equip' },
  { id: 'shield', name: 'たて', max: 5, group: 'equip' },
  { id: 'armor', name: 'よろい', max: 5, group: 'equip' },
  { id: 'food', name: 'たべもの', max: 10, group: 'food' },
  { id: 'tool', name: 'ほん・どうぐ', max: 8, group: 'tool' },
];
export const GROUPS = [{ id: 'equip', name: 'そうび' }, { id: 'food', name: 'たべもの' }, { id: 'tool', name: 'ほん・どうぐ' }];
export const bagOf = id => { const w = WORD[id]; return w.cat === 'equip' ? w.slot : (w.use === 'heal' || w.use === 'potion' || w.use === 'mp') ? 'food' : 'tool'; };
export const BAG_MAX = Object.fromEntries(BAGS.map(b => [b.id, b.max]));

// モコ（しゅじんこう）
export const HERO0 = { hp: 24, mp: 6, atk: 3, def: 0 };
export const LV_EXP = [0, 0, 5, 14, 28, 46, 70, 100, 140, 190, 250, 320, 400, 490, 590, 700, 820, 950, 1090, 1240, 1400]; // その レベルに なる ための けいけんち（ごうけい）
export const INV_MAX = 24; // ぜんぶの ふくろの ごうけい（ふくろ ごとの かずは BAGS）

// ⭐（moko-math-v1 の points に たす）
export const STARS = { floor: 1, boss: 10, dex10: 5, testMax: 5, clear: 30 };
export const TEST_FLOORS = [5, 10, 15, 20]; // ボスの あとに ふくしゅう テスト（5もん）

// ワールド1：アルファベットの島（A〜E ＋ ことばの まほう）
// ちず：1もじ = 1マス
//   .くさ  ,おはな  :みち  ~みず  =おおきな はし  pちいさな はし  Tき  bくさむら  rいわ  Fさく  hいえ
//   g はしの もん（かぎで ひらく）  v いばら（はなばたけが げんきに なると きえる）  f はなばたけ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T.........................~~TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T.........TT...hhh.,,,,,,.~~TTT.T.............T.TTTTTTTT',
  'T..~~~~........hhh.,,,,,,.~~TTT...TT........T...TTTTTTTT',
  'T..~~~~............,,,,,,.~~TTT.......r........TTTTTTTTT',
  'T..~~~~.....::::::.,,:,,,.~~TTT.....b......,....TTTTTTTT',
  'T........TT.:......,,:,,,.~~TTT:............,...TTTTTTTT',
  'T......b.T..:......,,:,,,.~~TTT:................TTTTTTTT',
  'T.T...r.....:.TT.....:....~~TTT:.,...fffffff....TT.....T',
  'T....,......:...b.b.....T.~~TTT:.....fffffff..b.TT.,r..T',
  'T...........:...,....:....~~TTT:.....fffffff.....v.....T',
  'T..:::::::::::::::::::::::==g:::.....fffffff...::v::::::',
  'T.,.....:....,.....:......~~TTT:...,.fffffff...:.v.....T',
  'T...,...:,......T..:..TT..~~TTT:.,...fffffff..,:TT..,..T',
  'T....b..:..T.....r.:..T...~~TTT:...............:TT.....T',
  'T..TT...:.....,....:....r.~~TTT:::::::::::::::::TTTTTTTT',
  'T..T....:..........:......~~TTT.............r...TTTTTTTT',
  'T.......:...~~~~~~~p~~~~~~~~TTT...~~.....,......TTTTTTTT',
  'T.......:.,........:......~~TTT...~~......b.....TTTTTTTT',
  'T.......:..b...b...:.,....~~TTT......,.TT....T..TTTTTTTT',
  'T.r.....:....TT..,.:...T..~~TTT..T..............TTTTTTTT',
  'T..FFFFF...............,..~~TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T.........................~~TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const START = { x: 4, y: 12, dir: 'down' };
export const entries = { start: START, east: { x: 54, y: 11, dir: 'left' } };
// ハチの クエストの あと、みぎはしから もりの こみちへ
export const exits = [{ x: 55, y: 11, to: 'forest', entry: 'west', needs: { quest: 'bee' } }];

// キャラクター（at：じょうたいで ばしょが かわる ときの ルール）
export const NPCS = [
  { id: 'rabbit', kind: 'rabbit', x: 6, y: 12, name: 'ラビ', after: { flag: 'bossCleared', x: 22, y: 12 } },
  { id: 'ant', kind: 'ant', x: 5, y: 7, name: 'ありさん', letter: 'A' },
  { id: 'bear', kind: 'bear', x: 16, y: 4, name: 'くまさん', letter: 'B', talk: [['くまさん', 'はちみつ、あまくて おいしかった！ ありがとう！']], talkWhen: { quest: 'honey' } },
  { id: 'cat', kind: 'cat', x: 22, y: 4, name: 'ねこさん', letter: 'C' },
  { id: 'dog', kind: 'dog', x: 5, y: 19, name: 'いぬさん', letter: 'D' },
  { id: 'elephant', kind: 'elephant', x: 21, y: 20, name: 'ぞうさん', letter: 'E' },
  { id: 'boss', kind: 'dragon', x: 25, y: 11, name: 'ドラコ', boss: true, after: { flag: 'bossCleared', x: 25, y: 10 } },
  { id: 'mouse', kind: 'mouse', x: 36, y: 13, name: 'チュチュ' },
];

// しらべられる もの（w,h が ある ものは ひろい ばしょ）
//   desc：ふつうに しらべた ときの ことば（world の じょうたいで かわる ものは state ごとに）
export const OBJECTS = [
  { id: 'appleTree', kind: 'appletree', x: 10, y: 15, name: 'りんごの き', desc: [['', 'あかい りんごが なっている。']] },
  { id: 'gate', kind: 'gate', x: 28, y: 11, name: 'はしの もん', desc: [['', 'もんに かぎが かかっている。']] },
  { id: 'well', kind: 'well', x: 31, y: 5, name: 'いど', desc: [['', 'ふかい いど。つめたい おみずが はいっているよ。']] },
  { id: 'flowerbed', kind: 'flowerbed', x: 37, y: 8, w: 7, h: 6, name: 'はなばたけ',
    desc: { dead: [['', 'おはなが かれて、しょんぼり している……']], bloom: [['', 'いろとりどりの おはなが さいている！']] }, state: w => w.flowerbed || 'dead' },
  { id: 'hive', kind: 'hive', x: 45, y: 7, name: 'はちの すばこ', desc: { empty: [['', 'からっぽの すばこ。']], bees: [['', 'ハチさんが すんでいる すばこ。ぶんぶん！']] }, state: w => w.bees ? 'bees' : 'empty' },
];

export const SIGNS = [
  { id: 'welcome', x: 3, y: 10, label: 'ABC', text: ['ABCワールドへ ようこそ！', 'どうぶつたちに あいに いこう。'] },
  { id: 'abc', x: 10, y: 10, label: 'ABCDE', letters: ['A', 'B', 'C', 'D', 'E'], text: ['もじの かんばん。', 'タップすると よみかたが きこえるよ。'] },
  { id: 'bridge', x: 24, y: 12, label: 'はし', text: ['このさき おおきな はし。', 'もじを 5つ おぼえると わたれるよ。'] },
  { id: 'pond', x: 7, y: 4, label: 'いけ', text: ['いけ には おさかなが いるよ。'] },
  { id: 'flowerSign', x: 40, y: 14, label: 'おはな', text: ['おはなの かんばん。', 'ここは はなばたけ だよ。'] },
];

export const CHESTS = [
  { id: 'chest1', x: 24, y: 2, item: 'scarf', questions: 3 },
  { id: 'chest2', x: 24, y: 22, item: 'hat', questions: 3 },
];

// もりの いりぐち（ハチの クエストの あとで ここに つくと ワールド1 クリア）
export const GOAL = { x: 53, y: 11 };

// きがえ（たからばこ）
export const ITEMS = {
  scarf: { name: 'あかい スカーフ' },
  hat: { name: 'ほしの ぼうし' },
};
// クエストで つかう もちもの
export const INV = {
  apple: { name: 'りんご', art: 'apple' },
  bridgeKey: { name: 'はしの かぎ', art: 'key' },
  honey: { name: 'はちみつ', art: 'honey' },
  applebasket: { name: 'りんごの かご', art: 'basket' },
};

export const STORY = {
  intro: [
    ['', '……ん？ ここは どこだろう？'],
    ['ラビ', 'あっ、きがついた？ ようこそ ABCワールドへ！ ぼくは うさぎの ラビ。'],
    ['ラビ', 'たいへんなんだ。アルファベットの ちからが なくなって、おおきな はしが こわれちゃった。'],
    ['ラビ', 'のはらの どうぶつたちが、A・B・C・D・E の もじを しっているよ。'],
    ['ラビ', 'もじを おぼえて ほしを 5こ あつめよう！ うえの「つぎは」を みると、どこへ いけば いいか わかるよ。'],
    ['', 'ひだりしたの ボタン（または やじるしキー）で あるけるよ。どうぶつの まえで みぎしたの ボタンを おしてね。'],
  ],
  rabbitAgain: (left) => left > 0
    ? [['ラビ', `あと ${left}つ の もじを おぼえよう！ どうぶつたちを さがしてね。`]]
    : [['ラビ', 'もじを ぜんぶ おぼえたね！ はしの まえの ドラコに はなしかけてみて！']],
  rabbitFree: [['ラビ', 'ことばの まほう、すごいね！ いろんな ところで ためしてみて！']],
  teacherHello: (npc) => [[npc.name, 'こんにちは！ あたらしい もじを おしえて あげる！']],
  teacherDone: (npc, letter) => [[npc.name, `${letter} を おぼえたね！ また おさらい しに きてね。`]],
  teacherReview: (npc) => [[npc.name, 'おさらい クイズ！ いっしょに やってみよう。']],
  bossLocked: (missing) => [
    ['ドラコ', 'ぼくは はしの まもりの ドラコ。'],
    ['ドラコ', `もじを ぜんぶ おぼえたら また きてね。あと ${missing.join('・')} だよ！`],
  ],
  bossStart: [
    ['ドラコ', 'ぼくは はしの まもりの ドラコ。もじを 5つ おぼえたんだね！'],
    ['ドラコ', 'さいごの おさらい クイズだよ。5もん こたえたら はしを なおして あげる！'],
  ],
  bossClear: [
    ['ドラコ', 'すごい すごい！ アルファベットの ちからが もどってきた！'],
    ['ドラコ', 'はしを なおすね。でも むこうの もんには かぎが かかってるんだ。ラビに きいてみて！'],
  ],
  bossAfter: [['ドラコ', 'もんの かぎは ラビが しってるよ。']],
  chestLocked: [['', 'たからばこ だ。でも まだ あかない みたい……'], ['', 'もじを 2つ おぼえてから きてね。']],
  chestStart: [['', 'たからばこ だ！ もじの クイズに 3もん こたえると あくよ。']],
  chestOpened: [['', 'たからばこは からっぽ。']],
  ending: { title: 'アルファベット ぜんぶ クリア！', text: 'A から Z まで ぜんぶの もじを おぼえて、ことばの まほうで みんなを たすけたね！ つぎは「こもじの もり」の ぼうけん！ つづきは またこんど！' },
};

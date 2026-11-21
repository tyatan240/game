// ワールド1：アルファベットの島（MVP：A〜E）
// ちず：1もじ = 1マス
//   .くさ  ,おはな  :みち  ~みず  =おおきな はし（しまっている）  pちいさな はし
//   Tき  bくさむら  rいわ  Fさく  hいえ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T.........................~~TTTTTTTT',
  'T.........TT...hhh.,,,,,,.~~TTTTTTTT',
  'T..~~~~........hhh.,,,,,,.~~TTTTTTTT',
  'T..~~~~............,,,,,,.~~TTTTTTTT',
  'T..~~~~.....::::::.,,:,,,.~~TTTTTTTT',
  'T........TT.:......,,:,,,.~~TTTTTTTT',
  'T......b.T..:......,,:,,,.~~TTTTTTTT',
  'T.T...r.....:.TT.....:....~~TTTTTTTT',
  'T....,......:...b.b.....T.~~.....TTT',
  'T...........:...,....:....~~..,..TTT',
  'T..:::::::::::::::::::::::==::::::::',
  'T.,.....:....,.....:......~~...,.TTT',
  'T...,...:,......T..:..TT..~~.....TTT',
  'T....b..:..T.....r.:..T...~~TTTTTTTT',
  'T..TT...:.....,....:....r.~~TTTTTTTT',
  'T..T....:..........:......~~TTTTTTTT',
  'T.......:...~~~~~~~p~~~~~~~~TTTTTTTT',
  'T.......:.,........:......~~TTTTTTTT',
  'T.......:..b...b...:.,....~~TTTTTTTT',
  'T.r.....:....TT..,.:...T..~~TTTTTTTT',
  'T..FFFFF...............,..~~TTTTTTTT',
  'T.........................~~TTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const START = { x: 4, y: 12, dir: 'down' };

// キャラクターの せりふ（ひらがな ちゅうしん）
export const NPCS = [
  { id: 'rabbit', kind: 'rabbit', x: 6, y: 12, name: 'ラビ' },
  { id: 'ant', kind: 'ant', x: 5, y: 7, name: 'ありさん', letter: 'A' },
  { id: 'bear', kind: 'bear', x: 16, y: 4, name: 'くまさん', letter: 'B' },
  { id: 'cat', kind: 'cat', x: 22, y: 4, name: 'ねこさん', letter: 'C' },
  { id: 'dog', kind: 'dog', x: 5, y: 19, name: 'いぬさん', letter: 'D' },
  { id: 'elephant', kind: 'elephant', x: 21, y: 20, name: 'ぞうさん', letter: 'E' },
  { id: 'boss', kind: 'dragon', x: 25, y: 11, name: 'ドラコ', boss: true },
];

export const SIGNS = [
  { id: 'welcome', x: 3, y: 10, text: ['ABCワールドへ ようこそ！', 'どうぶつたちに あいに いこう。'] },
  { id: 'abc', x: 10, y: 10, letters: ['A', 'B', 'C', 'D', 'E'], text: ['もじの かんばん。', 'タップすると よみかたが きこえるよ。'] },
  { id: 'bridge', x: 24, y: 12, text: ['このさき おおきな はし。', 'もじを 5つ おぼえると わたれるよ。'] },
  { id: 'pond', x: 7, y: 4, text: ['いけ には おさかなが いるよ。'] },
];

export const CHESTS = [
  { id: 'chest1', x: 24, y: 2, item: 'scarf', questions: 3 },
  { id: 'chest2', x: 24, y: 22, item: 'hat', questions: 3 },
];

// もりの いりぐち（ここに つくと おしまい）
export const GOAL = { x: 33, y: 11 };

export const ITEMS = {
  scarf: { name: 'あかい スカーフ' },
  hat: { name: 'ほしの ぼうし' },
};

export const STORY = {
  intro: [
    ['', '……ん？ ここは どこだろう？'],
    ['ラビ', 'あっ、きがついた？ ようこそ ABCワールドへ！ ぼくは うさぎの ラビ。'],
    ['ラビ', 'たいへんなんだ。アルファベットの ちからが なくなって、おおきな はしが こわれちゃった。'],
    ['ラビ', 'のはらの どうぶつたちが、A・B・C・D・E の もじを しっているよ。'],
    ['ラビ', 'もじを おぼえて ほしを 5こ あつめよう！ はしの まえで まってるね。'],
    ['', 'ひだりしたの ボタン（または やじるしキー）で あるけるよ。どうぶつの まえで みぎしたの ボタンを おしてね。'],
  ],
  rabbitAgain: (left) => left > 0
    ? [['ラビ', `あと ${left}つ の もじを おぼえよう！ どうぶつたちを さがしてね。`]]
    : [['ラビ', 'もじを ぜんぶ おぼえたね！ はしの まえの ドラコに はなしかけてみて！']],
  teacherHello: (npc, letterName) => [
    [npc.name, 'こんにちは！ あたらしい もじを おしえて あげる！'],
  ],
  teacherDone: (npc, letter) => [
    [npc.name, `${letter} を おぼえたね！ また おさらい しに きてね。`],
  ],
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
    ['ドラコ', 'はしを なおすね。むこうの もりへ いってごらん！'],
  ],
  bossAfter: [['ドラコ', 'もりの むこうにも もじが まってるよ。いってらっしゃい！']],
  chestLocked: [['', 'たからばこ だ。でも まだ あかない みたい……'], ['', 'もじを 2つ おぼえてから きてね。']],
  chestStart: [['', 'たからばこ だ！ もじの クイズに 3もん こたえると あくよ。']],
  chestOpened: [['', 'たからばこは からっぽ。']],
  ending: { title: 'つづきは またこんど！', text: 'はしを わたって もりに ついたよ。つぎは こもじの もりの ぼうけん！' },
};

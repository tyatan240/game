// ワールド4「おとの しま」③ つなげの たにま（g・o・u・l・f・b）。おとを つなげて ことばを よむ
// ちず：.くさ ,おはな :みち ~かわ pいたの はし Tき bくさむら
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T................~~...............TTTTTT',
  'T.b..............~~............b..TTTTTT',
  'T.....,..........~~...............TTTTTT',
  'T................~~...............TTTTTT',
  'T................~~.....,.........TTTTTT',
  'T................~~...............TTTTTT',
  'T................~~...............TTTTTT',
  'T................~~.....................',
  ':::::::::::::::::pp:::::::::::::::::::::',
  'T................~~.....................',
  'T................~~...............TTTTTT',
  'T...,............~~...............TTTTTT',
  'T................~~...............TTTTTT',
  'T.b..............~~...............TTTTTT',
  'T................~~...............TTTTTT',
  'T................~~...............TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'w4cave', entry: 'east' }, { x: 39, y: 10, to: 'w4village', entry: 'west' }];

export const NPCS = [
  { id: 'w4Frog', kind: 'frog', x: 6, y: 6, name: 'かえるの せんせい', sounds: ['g', 'o'] },
  { id: 'w4Squirrel', kind: 'squirrel', x: 10, y: 14, name: 'りすの せんせい', sounds: ['u', 'l'] },
  { id: 'w4Bear', kind: 'bear', x: 26, y: 6, name: 'くまの せんせい', sounds: ['f', 'b'] },
  // クエスト「はしの いし」
  { id: 'w4Cow', kind: 'cow', x: 24, y: 13, name: 'うしの モーモ' },
];
export const OBJECTS = [
  { id: 'w4gate3', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'たにまの もん', area: 'w4valley' },
];
export const SIGNS = [
  { id: 'w4ValleySign', x: 2, y: 9, label: 'c-a-t', text: ['ここは「つなげの たにま」。', 'もじの おとを じゅんばんに つなげると、ことばが よめるよ。', 'c・a・t → ク・ア・トゥ → cat！'] },
];
export const CHESTS = [];

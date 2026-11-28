// ワールド4「おとの しま」① おとの はまべ（s・a・t・p・i・n）。こもじの もりの みなみの ふなつきばから ふねで くる
// ちず：.くさ ,おはな :みち（すなはま） ~うみ Tき bくさむら
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTT:TTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT:TTTTTTTTTTTTTTTTTTT',
  'T...................:.............TTTTTT',
  'T.b.................:..........b..TTTTTT',
  'T....,..............:.............TTTTTT',
  'T...................:.....,.......TTTTTT',
  'T...................:.............TTTTTT',
  'T........,..........:.............TTTTTT',
  'T...................:.............TTTTTT',
  'T...................:...................',
  'T...::::::::::::::::::::::::::::::::::::',
  'T.......................................',
  'T.....,...........................TTTTTT',
  'T:::::::::::::::::::::::::::::::::TTTTTT',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { north: { x: 20, y: 2, dir: 'down' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 20, y: 0, to: 'lower', entry: 'south' }, { x: 39, y: 10, to: 'w4cave', entry: 'west' }];

// sounds … その せんせいが おしえる もじの おと（data/phonics.js の id）
export const NPCS = [
  { id: 'w4Turtle', kind: 'turtle', x: 8, y: 6, name: 'うみがめの せんせい', sounds: ['s', 'a'] },
  { id: 'w4Penguin', kind: 'penguin', x: 26, y: 6, name: 'ペンギンの せんせい', sounds: ['t', 'p'] },
  { id: 'w4Duck', kind: 'duck', x: 10, y: 12, name: 'アヒルの せんせい', sounds: ['i', 'n'] },
  // クエスト「かばさんの おとしもの」
  { id: 'w4Hippo', kind: 'hippo', x: 30, y: 4, name: 'かばの カバオ' },
];
export const OBJECTS = [
  { id: 'w4gate1', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'はまべの もん', area: 'w4beach' },
];
export const SIGNS = [
  { id: 'w4BeachSign', x: 22, y: 3, label: 'おと', text: ['ここは「おとの しま」の はまべ。', 'しまの みんなは ことばの「おと」が ばらばらに なって こまっているよ。', 'もじには なまえ（エス）と おと（ス）が あるんだ。せんせいに もじの おとを ならおう！'] },
];
export const CHESTS = [];

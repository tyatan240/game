// ワールド4「おとの しま」② ひびきの ほらあな（c・e・h・r・m・d）。こだまが ことばの おとを まねっこ する
// ちず：.くさ ,おはな :みち Tき rいわ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T.r.........................r..TTTTTTTTT',
  'T........r.....................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T....,..........r..............TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T....................................TTT',
  ':::::::::::::::::::::::::::::::::::::TTT',
  'T....................................TTT',
  'T............r.................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T.....,........................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T.r............................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' } };
export const exits = [{ x: 0, y: 10, to: 'w4beach', entry: 'east' }];

export const NPCS = [
  { id: 'w4Owl', kind: 'owl', x: 6, y: 5, name: 'ふくろうの せんせい', sounds: ['c', 'e'] },
  { id: 'w4Wolf', kind: 'wolf', x: 16, y: 13, name: 'おおかみの せんせい', sounds: ['h', 'r'] },
  { id: 'w4Hedgehog', kind: 'hedgehog', x: 24, y: 4, name: 'はりねずみの せんせい', sounds: ['m', 'd'] },
  // クエスト「こだまの まねっこ」
  { id: 'w4Echo', kind: 'mouse', x: 12, y: 8, name: 'こだまの チュー' },
];
export const OBJECTS = [
  { id: 'w4gate2', kind: 'lettergate', x: 33, y: 9, h: 3, name: 'ほらあなの もん', area: 'w4cave' },
];
export const SIGNS = [
  { id: 'w4CaveSign', x: 2, y: 9, label: 'エコー', text: ['ここは「ひびきの ほらあな」。こえが こだまするよ。', 'ことばの おわりの おとや まんなかの おとも きいて みよう！'] },
];
export const CHESTS = [];

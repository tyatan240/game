// ワールド3「ことばの まち」③ いろと かたちの こうぼう
// ちず：.くさ ,おはな :みち Tき bくさむら hいえ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..hhh........hhh.................TTTTTT',
  'T..hhh........hhh..............b..TTTTTT',
  'T.........:::::::::::::::::.......TTTTTT',
  'T.........:...............:.......TTTTTT',
  'T.b...,...:...............:...,...TTTTTT',
  'T.........:.....,.........:.......TTTTTT',
  'T.........:...............:.......TTTTTT',
  'T.........:...............:............T',
  '::::::::::::::::::::::::::::::::::::::::',
  'T.........:...............:............T',
  'T.........:...............:.......TTTTTT',
  'T......,..:...........,...:.......TTTTTT',
  'T.........:...............:..,....TTTTTT',
  'T..hhh....:.........hhh...:.......TTTTTT',
  'T..hhh....::::::::::hhh::::.......TTTTTT',
  'T.................................TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'w3market', entry: 'east' }, { x: 39, y: 10, to: 'w3school', entry: 'west' }];

export const NPCS = [
  { id: 'w3Painter', kind: 'rabbit', x: 6, y: 8, name: 'うさぎの せんせい', teach: ['cred', 'cblue', 'cyellow', 'cgreen', 'cpink', 'cwhite'] },
  { id: 'w3Shaper', kind: 'owl', x: 13, y: 6, name: 'ふくろうの せんせい', teach: ['circle', 'square', 'triangle', 'star', 'heart'], frame: 'a' },
  { id: 'w3SignMaker', kind: 'goat', x: 22, y: 7, name: 'かんばんやさん' },
  { id: 'w3ColorKid', kind: 'chick', x: 30, y: 12, name: 'ひよこの ピッピ' },
];
export const OBJECTS = [
  { id: 'w3Board', kind: 'board', x: 18, y: 12, w: 2, name: 'かんばん', desc: [['', 'まっしろな かんばんだ。'], ['', 'かんばんやさんの ちゅうもんを まっているよ。']] },
  { id: 'w3gate3', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'いろの もん', area: 'w3studio' },
];
export const SIGNS = [
  { id: 'w3StudioSign', x: 2, y: 11, label: 'ABC', text: ['ここは「いろと かたちの こうぼう」。', 'いろと かたちの えいごを おぼえて、かんばんを つくろう！'] },
];
export const CHESTS = [];

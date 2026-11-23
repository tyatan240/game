// ワールド3「ことばの まち」⑤ ことばの とう（さいごの エリア）
// ちず：.くさ ,おはな :みち Tき bくさむら
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T.b.........................b..TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'T....,....:::::::::::::::::....TTTTTTTTT',
  'T.........:.......:.......:....TTTTTTTTT',
  'T.........:...,...:...,...:..........TTT',
  'T.........:.......:.......:..........TTT',
  ':::::::::::::::::::::::::::::::::::::TTT',
  'T.........:.......:.......:..........TTT',
  'T.........:...,...:...,...:..........TTT',
  'T.........:.......:.......:....TTTTTTTTT',
  'T....,....:.......:.......:....TTTTTTTTT',
  'T.........:::::::::::::::::....TTTTTTTTT',
  'T.b............................TTTTTTTTT',
  'T..............................TTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' } };
export const exits = [{ x: 0, y: 10, to: 'w3school', entry: 'east' }];

export const NPCS = [
  { id: 'w3Owl3', kind: 'owl', x: 18, y: 4, name: 'とうの ふくろう', teach: [], frame: 'this' },
  { id: 'w3Guard1', kind: 'sheep', x: 14, y: 7, name: 'ひつじの もんばん' },
  { id: 'w3Guard2', kind: 'goat', x: 22, y: 13, name: 'やぎの もんばん' },
  { id: 'w3Guard3', kind: 'deer', x: 5, y: 12, name: 'しかの もんばん' },
];
export const OBJECTS = [
  { id: 'w3TowerBody', kind: 'tower', x: 33, y: 7, w: 3, h: 5, name: 'ことばの とう', desc: [['', 'たかい とうだ。3つの かねが ついている。']] },
  { id: 'w3gate5', kind: 'lettergate', x: 31, y: 9, h: 3, name: 'ことばの とうの もん', area: 'w3tower' },
];
export const SIGNS = [
  { id: 'w3TowerSign', x: 2, y: 9, label: 'This', text: ['ここは「ことばの とう」。', '3にんの もんばんに えいごで こたえて、かねを ならそう！', 'さいごに とうの もんで おさらいを すると……？'] },
];
export const CHESTS = [];

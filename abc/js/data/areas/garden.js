// いろの にわ（U〜Z）
// ちず：.くさ ,おはな :みち ~みず Tき bくさむら rいわ Fさく hいえ v しげみ（クエストで ひらく）
//   u ひまわりばたけ  s こや  y ひあがった いけ  w しろい はなだん
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T....................................TTTTTTT',
  'T..TT.........................T......TTTTTTT',
  'T.....,...:::::::::::::::::..........TTTTTTT',
  'T.........:........,......:..........TTTTTTT',
  'T.........:..wwwww........:....b.....TTTTTTT',
  'T......b..:...............:..........TTTTTTT',
  'T.........:...............:..,.......TTTTTTT',
  'T....,....:...,.....T.....:................T',
  '::::::::::::::::::::::::::::::::::::::.....T',
  'T.........:..........T....:................T',
  'T.........:............,..:......,...T......',
  'T.......,.:...............:..........TTTTTTT',
  'T.........:..wwwww........:..........TTTTTTT',
  'T.........:...........b...:......TT..TTTTTTT',
  'T..T......:::::::::::::::::...,......TTTTTTT',
  'T....................................TTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' }, east2: { x: 42, y: 12, dir: 'left' } };
// みぎしたの でぐち（おしろの した）は アルファベット クリアで ひらく → こもじの もり（ワールド2）
export const exits = [{ x: 0, y: 10, to: 'lake', entry: 'east' }, { x: 43, y: 12, to: 'lower', entry: 'west', needs: { flag: 'alphabetClear' } }];

export const NPCS = [
  { id: 'zebra', kind: 'zebra', x: 4, y: 6, name: 'しまうまさん', letter: 'U' },
  { id: 'deer', kind: 'deer', x: 23, y: 8, name: 'しかさん', letter: 'V' },
  { id: 'wolf', kind: 'wolf', x: 31, y: 13, name: 'おおかみさん', letter: 'W' },
  { id: 'hedgehog', kind: 'hedgehog', x: 5, y: 15, name: 'はりねずみさん', letter: 'X' },
  { id: 'piglet', kind: 'pig', x: 29, y: 5, name: 'こぶたさん', letter: 'Y' },
  { id: 'polar', kind: 'polar', x: 33, y: 9, name: 'しろくまさん', letter: 'Z' },
  { id: 'merry', kind: 'sheep', x: 8, y: 9, name: 'にわしの メリー', talk: [['にわしの メリー', 'あかと あおの おはな、すてき！']] },
];
export const OBJECTS = [
  { id: 'redbed', kind: 'colorbed', x: 13, y: 6, w: 5, h: 1, name: 'しろい はなだん', color: 'red', desc: { white: [['', 'しろい おはなの はなだん。']], red: [['', 'あかい おはなが さいている！']] }, state: w => w.redbed || 'white' },
  { id: 'bluebed', kind: 'colorbed', x: 13, y: 14, w: 5, h: 1, name: 'しろい はなだん', color: 'blue', desc: { white: [['', 'しろい おはなの はなだん。']], blue: [['', 'あおい おはなが さいている！']] }, state: w => w.bluebed || 'white' },
  { id: 'redpaint', kind: 'paint', x: 19, y: 6, name: 'あかい えのぐ', color: 'red', desc: [['', 'あかい えのぐの バケツ。']] },
  { id: 'bluepaint', kind: 'paint', x: 19, y: 14, name: 'あおい えのぐ', color: 'blue', desc: [['', 'あおい えのぐの バケツ。']] },
  { id: 'castle', kind: 'castlegate', x: 40, y: 9, w: 3, h: 3, name: 'おしろの もん', area: 'garden', final: true },
];
export const SIGNS = [
  { id: 'gardenSign', x: 2, y: 9, label: 'にわ', text: ['ここは いろの にわ。', 'U・V・W・X・Y・Z の もじが まっているよ。', 'おくに ことばの おしろが あるよ。'] },
];
export const CHESTS = [];

// ワールド3「ことばの まち」② かずの いちば
// ちず：.くさ ,おはな :みち Tき bくさむら hいえ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T.hhh...............hhh...........TTTTTT',
  'T.hhh.......,.......hhh........b..TTTTTT',
  'T.................................TTTTTT',
  'T.....:::::::::::::::::::::::.....TTTTTT',
  'T.....:..........:..........:.....TTTTTT',
  'T...,.:..........:.......,..:.....TTTTTT',
  'T.....:..........:..........:.....TTTTTT',
  'T.....:..........:..........:..........T',
  '::::::::::::::::::::::::::::::::::::::::',
  'T.....:..........:..........:..........T',
  'T.....:...,......:.....,....:.....TTTTTT',
  'T.....:..........:..........:..,..TTTTTT',
  'T.....:..........:..........:.....TTTTTT',
  'T.....:::::::::::::::::::::::.....TTTTTT',
  'T.hhh.............................TTTTTT',
  'T.hhh....b.....................b..TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'w3plaza', entry: 'east' }];

export const NPCS = [
  { id: 'w3Bear', kind: 'bear', x: 3, y: 8, name: 'くまの せんせい', teach: ['one', 'two', 'three', 'four', 'five'] },
  { id: 'w3Deer', kind: 'deer', x: 24, y: 12, name: 'しかの せんせい', teach: ['six', 'seven', 'eight', 'nine', 'ten'] },
  { id: 'w3Grocer', kind: 'hedgehog', x: 14, y: 7, name: 'はりねずみの せんせい', teach: ['apples', 'bananas', 'eggs'], frame: 'please' },
  { id: 'w3FruitKeeper', kind: 'monkey', x: 11, y: 8, name: 'くだものやさん' },
  { id: 'w3EggKeeper', kind: 'chick', x: 22, y: 8, name: 'たまごやさん' },
  { id: 'w3Baker', kind: 'cat', x: 23, y: 4, name: 'パンやさん' },
  { id: 'w3Clown', kind: 'tiger', x: 12, y: 13, name: 'ふうせんやさん' },
];
export const OBJECTS = [
  { id: 'w3FruitStall', kind: 'stall', x: 9, y: 7, w: 2, goods: 'apples', color: '#ff7a8a', name: 'くだものやさん', desc: [['', 'りんごや バナナが ならんでいる。'], ['', 'おみせの ひとに たのんでみよう！']] },
  { id: 'w3EggStall', kind: 'stall', x: 20, y: 7, w: 2, goods: 'eggs', color: '#ffc94a', name: 'たまごやさん', desc: [['', 'たまごが いっぱい！'], ['', 'おみせの ひとに たのんでみよう！']] },
  { id: 'w3gate2', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'かずの もん', area: 'w3market' },
];
export const SIGNS = [
  { id: 'w3MarketSign', x: 2, y: 11, label: '123', text: ['ここは「かずの いちば」。', 'えいごで かずを いえると、おかいものが できるよ。'] },
];
export const CHESTS = [];

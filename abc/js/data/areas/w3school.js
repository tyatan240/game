// ワールド3「ことばの まち」④ すきなものの がっこう
// ちず：.くさ ,おはな :みち ~プール Tき bくさむら hいえ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T............hhh......hhh.........TTTTTT',
  'T.b..........hhh......hhh.........TTTTTT',
  'T.................................TTTTTT',
  'T.......:::::::::::::::::::::.....TTTTTT',
  'T....,..:...................:.,...TTTTTT',
  'T.......:...................:.....TTTTTT',
  'T.......:.....~~............:.....TTTTTT',
  'T.......:.....~~............:..........T',
  '::::::::::::.............:::::::::::::::',
  'T.......:...................:..........T',
  'T...,...:..........,........:.....TTTTTT',
  'T.......:...................:..,..TTTTTT',
  'T.......:...................:.....TTTTTT',
  'T..hhh..:::::::::::::::::::::.....TTTTTT',
  'T..hhh............................TTTTTT',
  'T..............................b..TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'w3studio', entry: 'east' }, { x: 39, y: 10, to: 'w3tower', entry: 'west' }];

export const NPCS = [
  { id: 'w3Frog', kind: 'frog', x: 16, y: 9, name: 'かえるの せんせい', teach: ['swim', 'run', 'jump', 'sing', 'dance'], frame: 'can' },
  { id: 'w3Elephant', kind: 'elephant', x: 4, y: 8, name: 'ぞうの せんせい', teach: ['dogs', 'cats'], frame: 'like' },
  { id: 'w3NewKid', kind: 'polar', x: 20, y: 12, name: 'しろくまの ポーラ' },
  { id: 'w3Coach', kind: 'zebra', x: 24, y: 8, name: 'しまうまの コーチ' },
];
export const OBJECTS = [
  { id: 'w3gate4', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'がっこうの もん', area: 'w3school' },
];
export const SIGNS = [
  { id: 'w3SchoolSign', x: 2, y: 11, label: 'like', text: ['ここは「すきなものの がっこう」。', 'すきな もの・できる ことを えいごで いえると ともだちが ふえるよ！'] },
];
export const CHESTS = [];

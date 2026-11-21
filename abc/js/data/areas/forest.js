// もりの こみち（F〜J）
// ちず：.くさ ,おはな :みち ~みず Tき bくさむら rいわ Fさく hいえ v しげみ（クエストで ひらく）
//   u ひまわりばたけ  s こや  y ひあがった いけ  w しろい はなだん
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..............T..~~~.....T..........TTTTTTT',
  'T.................~~~................TTTTTTT',
  'T...TT..:::::::::::::::::::::::....T.TTTTTTT',
  'T.......:..r.............T....:......TTTTTTT',
  'T..,....:.....................:......TTTTTTT',
  'T.....b.:....TT.........uuuu..:......TTTTTTT',
  'T.......:........T......uuuu..:..b...TTTTTTT',
  'T.......:...,.................:.......v....T',
  '::::::::::::::::::::::::::::::::::::::v:::::',
  'T...................:.............,...v....T',
  'T....,..........b...:..TT....,.......TTTTTTT',
  'T........T..........:......r.........TTTTTTT',
  'T................,..:............TT..TTTTTTT',
  'T..T......::::::::::::b::::::::......TTTTTTT',
  'T...T..........................,.....TTTTTTT',
  'T...........T...............T........TTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'island', entry: 'east' }, { x: 43, y: 10, to: 'village', entry: 'west' }];

export const NPCS = [
  { id: 'frog', kind: 'frog', x: 5, y: 8, name: 'かえるさん', letter: 'F' },
  { id: 'goat', kind: 'goat', x: 14, y: 13, name: 'やぎさん', letter: 'G' },
  { id: 'hippo', kind: 'hippo', x: 21, y: 3, name: 'かばさん', letter: 'H', talk: [['かばさん', 'ひまわり、げんきに なると いいなあ。']] },
  { id: 'squirrel', kind: 'squirrel', x: 27, y: 16, name: 'りすさん', letter: 'I' },
  { id: 'chick', kind: 'chick', x: 33, y: 6, name: 'ひよこさん', letter: 'J' },
  { id: 'puppy', kind: 'dog', x: 12, y: 12, name: 'こいぬの ポチ', small: true, talk: [['こいぬの ポチ', 'わん！ ほねを みつけて くれて ありがとう！']] },
];
export const OBJECTS = [
  { id: 'sunbed', kind: 'sunbed', x: 24, y: 7, w: 4, h: 2, name: 'ひまわりばたけ', desc: { dark: [['', 'ひまわりが うつむいて、しょんぼり している……']], sunny: [['', 'ひまわりが おひさまの ほうを むいて にこにこ！']] }, state: w => w.sunbed || 'dark' },
  { id: 'sunstone', kind: 'sunstone', x: 31, y: 13, name: 'ひだまりの いし', desc: [['', 'ぽかぽか あたたかい いし。']] },
  { id: 'bonemound', kind: 'mound', x: 35, y: 12, name: 'つちの やま', desc: { mound: [['', 'つちが もりあがっている。なにか うまっている みたい。']], dug: [['', 'ポチが ほった あなだ。']] }, state: w => w.mound || 'mound' },
  { id: 'forestGate', kind: 'lettergate', x: 40, y: 9, h: 3, name: 'もじの もん', area: 'forest' },
];
export const SIGNS = [
  { id: 'forestSign', x: 2, y: 9, label: 'もり', text: ['ここは もりの こみち。', 'F・G・H・I・J の もじが まっているよ。'] },
];
export const CHESTS = [];

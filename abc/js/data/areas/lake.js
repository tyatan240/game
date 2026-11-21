// みずうみ（P〜T）
// ちず：.くさ ,おはな :みち ~みず Tき bくさむら rいわ Fさく hいえ v しげみ（クエストで ひらく）
//   u ひまわりばたけ  s こや  y ひあがった いけ  w しろい はなだん
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T....................................TTTTTTT',
  'T.TT........::::::::::::::::::....b..TTTTTTT',
  'T...........:..~~~~~~~~~~~~..:.....,.TTTTTTT',
  'T........,..:.~~~~~~~~~~~~~~.:.......TTTTTTT',
  'T...........:.~~~~~~~~~~~~~~.:..TT...TTTTTTT',
  'T...........:.~~~~~~~~~~~~~~.:.......TTTTTTT',
  'T...,.......:.~~~~~~~~~~~~~~.:.r.....TTTTTTT',
  'T........T..:.~~~~~~~~~~~~~~.:.............T',
  '::::::::::::::~~~~~~~~~~~~~~.:::::::::::::::',
  'T...........:.~~~~~~~~~~~~~~.:.............T',
  'T....b......:.~~~~~~~~~~~~~~.:.......TTTTTTT',
  'T...........:.~~~~~~~~~~~~~~.:.T.....TTTTTTT',
  'T.....,...r.:..~~~~~~~~~~~~..:....yyyTTTTTTT',
  'T...........:................:....yyyTTTTTTT',
  'T.......T...::::::::::::::::::.......TTTTTTT',
  'T...........:.......,...b.....,....T.TTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'village', entry: 'east' }, { x: 43, y: 10, to: 'garden', entry: 'west' }];

export const NPCS = [
  { id: 'penguin', kind: 'penguin', x: 7, y: 13, name: 'ペンギンさん', letter: 'P' },
  { id: 'duck', kind: 'duck', x: 21, y: 17, name: 'あひるさん', letter: 'Q' },
  { id: 'raccoon', kind: 'raccoon', x: 33, y: 4, name: 'たぬきさん', letter: 'R' },
  { id: 'turtle', kind: 'turtle', x: 31, y: 12, name: 'かめさん', letter: 'S', talk: [['かめさん', 'いけに おさかなが もどって うれしいよ。']] },
  { id: 'tiger', kind: 'tiger', x: 4, y: 3, name: 'とらさん', letter: 'T' },
  { id: 'bird', kind: 'bird', x: 8, y: 6, name: 'ことりの ピピ', hideWhen: { nest: 'yes' } },
];
export const OBJECTS = [
  { id: 'bigtree', kind: 'bigtree', x: 5, y: 5, w: 2, h: 2, name: 'おおきな き', desc: { bare: [['', 'おおきな き。えだが たくさん ある。']], yes: [['', 'ピピの すが ある。ぴぴぴ！']] }, state: w => w.nest || 'bare' },
  { id: 'drypond', kind: 'pond', x: 34, y: 14, w: 3, h: 2, name: 'ちいさな いけ', desc: { dry: [['', 'いけの みずが なくなって、からから……']], full: [['', 'おさかなが すいすい およいでいる！']] }, state: w => w.pond || 'dry' },
  { id: 'lakeGate', kind: 'lettergate', x: 40, y: 9, h: 3, name: 'もじの もん', area: 'lake' },
];
export const SIGNS = [
  { id: 'lakeSign', x: 2, y: 9, label: 'みずうみ', text: ['ここは みずうみ。', 'P・Q・R・S・T の もじが まっているよ。'] },
  { id: 'fishsign', x: 33, y: 14, label: 'さかな', text: ['おさかなの かんばん。'] },
];
export const CHESTS = [];

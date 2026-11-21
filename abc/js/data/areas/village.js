// どうぶつ むら（K〜O）
// ちず：.くさ ,おはな :みち ~みず Tき bくさむら rいわ Fさく hいえ v しげみ（クエストで ひらく）
//   u ひまわりばたけ  s こや  y ひあがった いけ  w しろい はなだん
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T....hhh.....hhh............hhh......TTTTTTT',
  'T....hhh.....hhh.....ss.....hhh......TTTTTTT',
  'T....................ss..............TTTTTTT',
  'T........:............:............T.TTTTTTT',
  'T..T.....:........T...:.b............TTTTTTT',
  'T........:............:........r.....TTTTTTT',
  'T...,....:.,..........:....,.........TTTTTTT',
  'T........:............:....................T',
  '::::::::::::::::::::::::::::::::::::::::::::',
  'T.....:..........................:.........T',
  'T..FFFF............,.........FFFF:...TTTTTTT',
  'T.....:....b.............TT......:.,.TTTTTTT',
  'T.....:..........................:...TTTTTTT',
  'T.T...::::::::::::::::::::::::::::...TTTTTTT',
  'T..T....................,............TTTTTTT',
  'T...............TT...........b.......TTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'forest', entry: 'east' }, { x: 43, y: 10, to: 'lake', entry: 'west' }];

export const NPCS = [
  { id: 'koala', kind: 'koala', x: 3, y: 8, name: 'コアラさん', letter: 'K' },
  { id: 'lion', kind: 'lion', x: 12, y: 13, name: 'ライオンさん', letter: 'L' },
  { id: 'monkey', kind: 'monkey', x: 19, y: 16, name: 'おさるさん', letter: 'M' },
  { id: 'sheep', kind: 'sheep', x: 28, y: 13, name: 'ひつじさん', letter: 'N' },
  { id: 'owl', kind: 'owl', x: 35, y: 6, name: 'ふくろうさん', letter: 'O' },
  { id: 'pig', kind: 'pig', x: 11, y: 8, name: 'ぶたの ブーコ', talk: [['ぶたの ブーコ', 'りんごの パイ、とっても おいしく やけたよ！']] },
  { id: 'cow', kind: 'cow', x: 36, y: 14, name: 'うしさん', talk: [['うしさん', 'もー。まいにち おいしい ミルクを だしているよ。']] },
  { id: 'kitten', kind: 'cat', x: 24, y: 16, name: 'こねこの ミケ', small: true, hideWhen: { kitten: 'follow' } },
];
export const OBJECTS = [
  { id: 'shed', kind: 'shed', x: 21, y: 3, w: 2, h: 2, name: 'こや', desc: { closed: [['', 'こやの とびら。かぎが かかっている。']], open: [['', 'こやの とびらが あいている。']] }, state: w => w.shed || 'closed' },
  { id: 'keyboard', kind: 'keyboard', x: 19, y: 4, name: 'かぎかけ', desc: [['', 'かぎが かかっている いた。']] },
  { id: 'basketstand', kind: 'basketstand', x: 20, y: 5, name: 'かごの たな', desc: [['', 'かごが ならんでいる たな。']], showWhen: { shed: 'open' } },
  { id: 'orchard', kind: 'appletree', x: 3, y: 14, name: 'りんごの き', desc: [['', 'りんごが たくさん なっている。']] },
  { id: 'catbowl', kind: 'bowl', x: 25, y: 16, name: 'おさら', desc: { empty: [['', 'からっぽの おさら。']], full: [['', 'ミルクが はいった おさら。']] }, state: w => w.bowl || 'empty' },
  { id: 'villageGate', kind: 'lettergate', x: 40, y: 9, h: 3, name: 'もじの もん', area: 'village' },
];
export const SIGNS = [
  { id: 'villageSign', x: 2, y: 9, label: 'むら', text: ['ここは どうぶつ むら。', 'K・L・M・N・O の もじが まっているよ。'] },
];
export const CHESTS = [];

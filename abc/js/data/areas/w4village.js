// ワールド4「おとの しま」④ なかまの むら（j・z・w・v・y・x・qu）。おしりが おなじ なかま・きいた ことばを もじで つくる
// ちず：.くさ ,おはな :みち ~みず Tき bくさむら hいえ
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..........hhh...........hhh......TTTTTT',
  'T..hhh.....hhh...........hhh......TTTTTT',
  'T..hhh..:::::::::::::::::::::::...TTTTTT',
  'T.......:.....................:...TTTTTT',
  'T.b.....:....,.........,......:..bTTTTTT',
  'T....,..:.................,...:...TTTTTT',
  'T.......:.......:::::::.......:...TTTTTT',
  'T.......:.......::...::.......:.........',
  '::::::::::::::::::::::::::::::::::::::::',
  'T.......:.......::...::.......:.........',
  'T.....,.:.......:::::::....,..:...TTTTTT',
  'T.......:...,.................:...TTTTTT',
  'T..hhh..:......,.....,..hhh...:..bTTTTTT',
  'T..hhh..:...............hhh...:...TTTTTT',
  'T.b.....:::::::::::::::::::::::...TTTTTT',
  'T.................................TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' } };
export const exits = [{ x: 0, y: 10, to: 'w4valley', entry: 'east' }];

export const NPCS = [
  { id: 'w4Elephant', kind: 'elephant', x: 6, y: 8, name: 'ぞうの せんせい', sounds: ['j', 'z'] },
  { id: 'w4Monkey', kind: 'monkey', x: 12, y: 12, name: 'おさるの せんせい', sounds: ['w', 'v'] },
  { id: 'w4Koala', kind: 'koala', x: 24, y: 8, name: 'コアラの せんせい', sounds: ['y', 'x', 'q', 'k'] },
  // クエスト「やたいの なかま」「ゆうびんやさんの おてつだい」
  { id: 'w4Tiger', kind: 'tiger', x: 14, y: 6, name: 'やたいの トラ' },
  { id: 'w4Lion', kind: 'lion', x: 27, y: 5, name: 'ゆうびんやの ライオン' },
];
export const OBJECTS = [
  { id: 'w4gate4', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'むらの もん', area: 'w4village' },
];
export const SIGNS = [
  { id: 'w4VillageSign', x: 2, y: 9, label: '-at', text: ['ここは「なかまの むら」。', 'cat・hat・bat……おしりが おなじ ことばは なかまだよ。', 'きいた ことばを もじで つくる れんしゅうも しよう！'] },
];
export const CHESTS = [];

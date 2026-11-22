// ワールド3「ことばの まち」① あいさつの ひろば。こもじの もりの もんを ぬけると これる
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
  'T.......:.......::.~.::.......:........T',
  '::::::::::::::::::::::::::::::::::::::::',
  'T.......:.......::...::.......:........T',
  'T.....,.:.......:::::::....,..:...TTTTTT',
  'T.......:...,.................:...TTTTTT',
  'T..hhh..:......,.....,..hhh...:..bTTTTTT',
  'T..hhh..:...............hhh...:...TTTTTT',
  'T.b.....:::::::::::::::::::::::...TTTTTT',
  'T.................................TTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 38, y: 10, dir: 'left' } };
export const exits = [{ x: 0, y: 10, to: 'lower', entry: 'east' }, { x: 39, y: 10, to: 'w3market', entry: 'west' }];

// teach … おしえて くれる ことば（words.js の id）  frame … おしえて くれる ぶんの かた（sentences.js）
export const NPCS = [
  { id: 'w3Parrot', kind: 'bird', x: 6, y: 8, name: 'インコの せんせい', teach: ['hello', 'goodbye', 'thankyou', 'sorry'] },
  { id: 'w3Sheep', kind: 'sheep', x: 12, y: 12, name: 'ひつじの せんせい', teach: ['goodmorning', 'goodnight'] },
  { id: 'w3Pig', kind: 'pig', x: 24, y: 8, name: 'ぶたの せんせい', teach: ['howareyou', 'happy', 'sleepy', 'hungry'], frame: 'im' },
  // こえを なくした まちの ひと（クエスト「こえを とりもどそう」）
  { id: 'w3Duck', kind: 'duck', x: 14, y: 6, name: 'アヒルさん' },
  { id: 'w3Cow', kind: 'cow', x: 27, y: 5, name: 'うしさん' },
  { id: 'w3Penguin', kind: 'penguin', x: 11, y: 14, name: 'ペンギンさん' },
  // げんきが ない ひと（クエスト「げんき かな？」）
  { id: 'w3Koala', kind: 'koala', x: 5, y: 12, name: 'コアラさん' },
  { id: 'w3Monkey', kind: 'monkey', x: 32, y: 7, name: 'おさるさん' },
  { id: 'w3Lion', kind: 'lion', x: 20, y: 13, name: 'ライオンさん' },
];
export const OBJECTS = [
  { id: 'w3gate1', kind: 'lettergate', x: 35, y: 9, h: 3, name: 'あいさつの もん', area: 'w3plaza' },
];
export const SIGNS = [
  { id: 'w3PlazaSign', x: 2, y: 9, label: 'Hi!', text: ['ここは ことばの まち の「あいさつの ひろば」。', 'まちの みんなが えいごの こえを なくして こまっているよ。', 'せんせいに ことばを ならって、みんなを たすけよう！'] },
];
export const CHESTS = [];

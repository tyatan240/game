// こもじの もり（ワールド2：a〜z の こもじ）。アルファベットの しま を クリアすると、いろの にわ の おしろの したの みちから これる
// ちず：.くさ ,おはな :みち Tき bくさむら
export const MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T....................................TTTTTTT',
  'T.....b.........,.......,..TT........TTTTTTT',
  'T...,,...:::::::::::::::::::T....T...TTTTTTT',
  'T.,......:...T..T..,..,.,..:b........TTTTTTT',
  'T........:.................:.........TTTTTTT',
  'T........:...b...........T.:..,......TTTTTTT',
  'T.......,:....T.......b....:.........TTTTTTT',
  'T........:..........T......:..,............T',
  ':::::::::::::::::::::::::::::::::::::.:.....',
  'T...TT.,.:...........T.....:...............T',
  'T....,Tb,:..........T....,.:...,.,T..TTTTTTT',
  'T........:..............,..:.........TTTTTTT',
  'T........:T..T.....,...,...:.........TTTTTTT',
  'T........:.................:.b.......TTTTTTT',
  'T....,T..:::::::::::::::::::...,.....TTTTTTT',
  'T....................................TTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const entries = { west: { x: 1, y: 10, dir: 'right' }, east: { x: 42, y: 10, dir: 'left' } };
// ひがしは ワールド3「ことばの まち」（こもじの もんを ひらくと とおれる）
export const exits = [{ x: 0, y: 10, to: 'garden', entry: 'east2' }, { x: 43, y: 10, to: 'w3plaza', entry: 'west', needs: { flag: 'lowerClear' } }];

// lower … その せんせいが おしえる こもじ
export const NPCS = [
  { id: 'lowOwl', kind: 'owl', x: 4, y: 6, name: 'ふくろう せんせい', lower: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'lowSquirrel', kind: 'squirrel', x: 15, y: 7, name: 'りすの せんせい', lower: ['f', 'g', 'h', 'i', 'j'] },
  { id: 'lowFox', kind: 'fox', x: 21, y: 13, name: 'きつねの せんせい', lower: ['k', 'l', 'm', 'n', 'o'] },
  { id: 'lowRaccoon', kind: 'raccoon', x: 31, y: 6, name: 'たぬきの せんせい', lower: ['p', 'q', 'r', 's', 't'] },
  { id: 'lowTurtle', kind: 'turtle', x: 33, y: 14, name: 'かめの せんせい', lower: ['u', 'v', 'w', 'x', 'y', 'z'] },
];
export const OBJECTS = [
  { id: 'lowerGate', kind: 'lettergate', x: 40, y: 9, h: 3, name: 'こもじの もん', area: 'lower' },
];
export const SIGNS = [
  { id: 'lowerSign', x: 2, y: 9, label: 'もり', text: ['ここは こもじの もり。', 'おおきな もじ（A）には ちいさな もじ（a）の なかまが いるよ。', 'もりの せんせいたちに こもじを おしえて もらおう！'] },
];
export const CHESTS = [];

// エリア（マップ）の いちらんと、すすむ じゅんばん（チャプター）
import * as island from './world1.js';
import * as forest from './areas/forest.js';
import * as village from './areas/village.js';
import * as lake from './areas/lake.js';
import * as garden from './areas/garden.js';
import * as lower from './areas/lower.js';
import * as w3plaza from './areas/w3plaza.js';
import * as w3market from './areas/w3market.js';
import * as w3studio from './areas/w3studio.js';
import * as w3school from './areas/w3school.js';
import * as w3tower from './areas/w3tower.js';
import * as w4beach from './areas/w4beach.js';
import * as w4cave from './areas/w4cave.js';

const mk = (id, name, m) => ({ id, name, MAP: m.MAP, NPCS: m.NPCS, OBJECTS: m.OBJECTS || [], SIGNS: m.SIGNS || [], CHESTS: m.CHESTS || [], entries: m.entries, exits: m.exits || [] });
export const AREAS = {
  island: mk('island', 'アルファベットの しま', island),
  forest: mk('forest', 'もりの こみち', forest),
  village: mk('village', 'どうぶつ むら', village),
  lake: mk('lake', 'みずうみ', lake),
  garden: mk('garden', 'いろの にわ', garden),
  lower: mk('lower', 'こもじの もり', lower),
  w3plaza: mk('w3plaza', 'あいさつの ひろば', w3plaza),
  w3market: mk('w3market', 'かずの いちば', w3market),
  w3studio: mk('w3studio', 'いろと かたちの こうぼう', w3studio),
  w3school: mk('w3school', 'すきなものの がっこう', w3school),
  w3tower: mk('w3tower', 'ことばの とう', w3tower),
  w4beach: mk('w4beach', 'おとの はまべ', w4beach),
  w4cave: mk('w4cave', 'ひびきの ほらあな', w4cave),
};
export const ORDER = ['island', 'forest', 'village', 'lake', 'garden', 'lower', 'w3plaza', 'w3market', 'w3studio', 'w3school', 'w3tower', 'w4beach', 'w4cave'];

// チャプター：もじを おぼえる → クエスト → もじの もん（おさらい）→ つぎの エリア
export const CHAPTERS = [
  { area: 'island', letters: ['A', 'B', 'C', 'D', 'E'], boss: 'boss', quests: ['apple', 'flowers', 'bee'], next: 'forest' },
  { area: 'forest', letters: ['F', 'G', 'H', 'I', 'J'], quests: ['sun', 'dog'], gate: 'forestGate', next: 'village' },
  { area: 'village', letters: ['K', 'L', 'M', 'N', 'O'], quests: ['pie', 'cat'], gate: 'villageGate', next: 'lake' },
  { area: 'lake', letters: ['P', 'Q', 'R', 'S', 'T'], quests: ['fish', 'bird'], gate: 'lakeGate', next: 'garden' },
  { area: 'garden', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'], quests: ['colors'], gate: 'castle', final: true, next: 'lower' },
  // ワールド2：こもじ（S.lower に おぼえた こもじ）
  { area: 'lower', letters: [], lower: 'abcdefghijklmnopqrstuvwxyz'.split(''), quests: [], gate: 'lowerGate', next: 'w3plaza' },
  // ワールド3「ことばの まち」：せんせいに ことば（words）と ぶんの かた（frames）を ならう → クエスト → もん（おさらい）
  { area: 'w3plaza', w3: true, letters: [], words: ['hello', 'goodbye', 'thankyou', 'sorry', 'goodmorning', 'goodnight', 'howareyou', 'happy', 'sleepy', 'hungry'], frames: ['im'], quests: ['w3hello', 'w3feel'], gate: 'w3gate1', gateLabel: ['Hi!'], next: 'w3market' },
  { area: 'w3market', w3: true, letters: [], words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'apples', 'bananas', 'eggs'], frames: ['please'], quests: ['w3pie', 'w3balloon'], gate: 'w3gate2', gateLabel: ['123'], next: 'w3studio' },
  { area: 'w3studio', w3: true, letters: [], words: ['cred', 'cblue', 'cyellow', 'cgreen', 'cpink', 'cwhite', 'circle', 'square', 'triangle', 'star', 'heart'], frames: ['a'], quests: ['w3sign', 'w3color'], gate: 'w3gate3', gateLabel: ['RGB'], next: 'w3school' },
  { area: 'w3school', w3: true, letters: [], words: ['swim', 'run', 'jump', 'sing', 'dance', 'dogs', 'cats'], frames: ['like', 'can'], quests: ['w3friend', 'w3pe'], gate: 'w3gate4', gateLabel: ['like'], next: 'w3tower' },
  { area: 'w3tower', w3: true, letters: [], words: [], frames: ['this'], quests: ['w3tower'], gate: 'w3gate5', gateLabel: ['End'], final: true },
  // ワールド4「おとの しま」：せんせいに もじの おと（sounds）を ならう → クエスト → もん（おとの おさらい）
  { area: 'w4beach', w4: true, letters: [], sounds: ['s', 'a', 't', 'p', 'i', 'n'], quests: ['w4hippo'], gate: 'w4gate1', gateLabel: ['s', 'a', 't'], next: 'w4cave' },
  { area: 'w4cave', w4: true, letters: [], sounds: ['c', 'e', 'h', 'r', 'm', 'd'], quests: ['w4echo'], gate: 'w4gate2', gateLabel: ['c', 'a', 't'] },
];
export const CHAPTER = Object.fromEntries(CHAPTERS.map(c => [c.area, c]));

// id → その id が いる エリア（id は ぜんたいで かぶらない こと）
export const WHERE = {};
for (const a of Object.values(AREAS)) for (const x of [...a.NPCS, ...a.OBJECTS, ...a.SIGNS, ...a.CHESTS]) {
  if (WHERE[x.id]) console.warn('id が かぶっています:', x.id);
  WHERE[x.id] = a.id;
}

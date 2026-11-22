// ブロックの しゅるい（データだけ。ここに 1行 たせば ブロックが ふえる）
// id は セーブデータに のこるので かえない・けさない（しらない id は よみこんでも えがかれないだけで のこる）
// shape: cube（ふつうの はこ）/ glass（すける はこ）/ roof（ななめ やね。まわせる）/ door（うすい とびら。まわせる）/ flower（はな）
// top / side / bottom: めんの いろ。pattern: めんの もよう（render/textures.js）
// solid:false … うえに ブロックを つめない（はな）。rotate:true … 「まわす」で むきを かえられる
export const BLOCKS = [
  { id: 'grass',  name: 'くさ',   shape: 'cube',   top: '#7ccf5b', side: '#a5764a', bottom: '#8f6440', pattern: { top: 'speck', side: 'grassSide', bottom: 'speck' } },
  { id: 'dirt',   name: 'つち',   shape: 'cube',   top: '#a5764a', side: '#a5764a', bottom: '#8f6440', pattern: { top: 'speck', side: 'speck', bottom: 'speck' } },
  { id: 'wood',   name: 'き',     shape: 'cube',   top: '#d9a35f', side: '#c98f4d', bottom: '#b47c3f', pattern: { top: 'plank', side: 'plank', bottom: 'plank' } },
  { id: 'stone',  name: 'いし',   shape: 'cube',   top: '#a9adb5', side: '#959aa3', bottom: '#80858e', pattern: { top: 'stone', side: 'stone', bottom: 'stone' } },
  { id: 'brick',  name: 'レンガ', shape: 'cube',   top: '#d9675a', side: '#c9574b', bottom: '#a8483e', pattern: { top: 'brick', side: 'brick', bottom: 'brick' } },
  { id: 'glass',  name: 'ガラス', shape: 'glass',  top: '#bfe9ff', side: '#bfe9ff', bottom: '#bfe9ff', pattern: { top: 'glass', side: 'glass', bottom: 'glass' } },
  { id: 'roof',   name: 'やね',   shape: 'roof',   top: '#e0524f', side: '#b8433f', bottom: '#9c3533', rotate: true, pattern: { top: 'tile', side: 'speck', bottom: 'speck' } },
  { id: 'door',   name: 'ドア',   shape: 'door',   top: '#9a6234', side: '#b0743f', bottom: '#9a6234', rotate: true, pattern: { side: 'door' } },
  { id: 'flower', name: 'はな',   shape: 'flower', top: '#ff7eb6', side: '#4fae4a', bottom: '#4fae4a', center: '#ffd84a', solid: false },
];

export const BLOCK = Object.fromEntries(BLOCKS.map(b => [b.id, b]));

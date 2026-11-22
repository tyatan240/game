// ワールド3：ぶんの かた（ぶんカード）。ことばカードを スロットに はめて ぶんを つくる。ついかは ここに かくだけ
//   slots … スロットに はめられる ことばの kind（words.js）
//   make  … えらんだ ことば（WORD）から ぶんを つくる（おんせいと ひょうじ）
//   tpl   … がめんに だす かた（＿ が スロット）
//   example … おしえる ときの れい   teacher … おしえて くれる キャラ
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
export const FRAMES = [
  { id: 'im', ja: 'きもちを いう', tpl: ["I'm", '＿', '.'], slots: ['feel'], make: w => `I'm ${w[0].word}.`, example: ['happy'], teacher: 'w3Pig' },
  { id: 'please', ja: 'おみせで たのむ', tpl: ['＿', '＿', ', please.'], slots: ['number', 'thing'], make: w => `${cap(w[0].word)} ${w[0].n === 1 ? w[1].one : w[1].word}, please.`, example: ['two', 'bananas'], teacher: 'w3Grocer' },
];
export const FRAME = Object.fromEntries(FRAMES.map(f => [f.id, f]));
export const sentenceKey = (frameId, ids) => frameId + ':' + ids.join('+');

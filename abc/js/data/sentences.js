// ワールド3：ぶんの かた（ぶんカード）。ことばカードを スロットに はめて ぶんを つくる。ついかは ここに かくだけ
//   slots   … スロットに はめられる ことばの kind（words.js）
//   slotJa  … スロットの いみ（スロットの したに だす）
//   make    … えらんだ ことば（WORD）から えいごの ぶんを つくる（おんせいと ひょうじ）
//   ja      … その ぶんの にほんごの いみ（「〜と いって みよう」に つかう）
//   tpl     … がめんに だす かた（＿ が スロット）
//   lesson  … せんせいが おしえる じゅんばん（1まいずつ）
//             { big, say, text } … ことばの いみ ／ { frame, text } … かたと スロット ／ { examples:[[id…]…], text } … れい
//   example … おしえた あとに つくって みる ぶんの こうほ   teacher … おしえて くれる キャラ
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
export const FRAMES = [
  { id: 'im', ja: w => `わたしは ${w[0].ja}`, title: 'きもちを いう ぶん', tpl: ["I'm", '＿', '.'], slots: ['feel'], slotJa: ['きもち・ようす'],
    make: w => `I'm ${w[0].word}.`, example: ['happy', 'sleepy', 'hungry'], teacher: 'w3Pig',
    lesson: [
      { big: "I'm", say: "I'm", text: "「I'm（アイム）」は「わたしは」「ぼくは」という いみ。じぶんの ことを いう ときに つかうよ。" },
      { frame: true, text: "I'm の あとに、いまの きもちや ようすの ことばを いれると、ぶんが できるよ。" },
      { examples: [['happy'], ['sleepy'], ['hungry']], text: 'れいを タップして きいて みよう！' },
    ] },
  { id: 'please', ja: w => `${w[1].ja}を ${w[0].n}こ ください`, title: 'おみせで たのむ ぶん', tpl: ['＿', '＿', ', please.'], slots: ['number', 'thing'], slotJa: ['いくつ', 'なにを'],
    make: w => `${cap(w[0].word)} ${w[0].n === 1 ? w[1].one : w[1].word}, please.`, example: ['two', 'bananas'], teacher: 'w3Grocer',
    lesson: [
      { big: 'please', say: 'please', text: '「please（プリーズ）」は「ください」「おねがいします」という いみ。たのむ ときに つかうよ。' },
      { frame: true, text: 'please の まえに「いくつ」と「なにを」の ことばを いれると、おみせで たのむ ぶんに なるよ。' },
      { examples: [['two', 'bananas'], ['three', 'apples']], text: 'れいを タップして きいて みよう！' },
    ] },
];
export const FRAME = Object.fromEntries(FRAMES.map(f => [f.id, f]));
export const sentenceKey = (frameId, ids) => frameId + ':' + ids.join('+');

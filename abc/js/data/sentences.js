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
  { id: 'a', ja: w => `${w[0].jaAdj} ${w[1].ja}`, title: 'いろと かたちの ことば', tpl: ['a', '＿', '＿'], slots: ['color', 'shape'], slotJa: ['いろ', 'かたち'],
    make: w => `a ${w[0].word} ${w[1].word}`, example: ['cred', 'star'], teacher: 'w3Shaper',
    lesson: [
      { big: 'a red star', say: 'a red star', text: '「いろ」の ことばを「かたち」の まえに おくと「あかい ほし」の ように なるよ。a（ア）は「ひとつの」という いみ。' },
      { frame: true, text: 'a の あとに「いろ」→「かたち」の じゅんばんで いれよう。' },
      { examples: [['cred', 'star'], ['cblue', 'heart'], ['cyellow', 'circle']], text: 'れいを タップして きいて みよう！' },
    ] },
  { id: 'like', ja: w => `わたしは ${w[0].ja}が すき`, title: 'すきな ものを いう ぶん', tpl: ['I like', '＿', '.'], slots: ['thing'], slotJa: ['すきな もの'],
    make: w => `I like ${w[0].word}.`, example: ['dogs'], teacher: 'w3Elephant',
    lesson: [
      { big: 'like', say: 'like', text: '「like（ライク）」は「すき」という いみ。「I like 〜.」で「わたしは 〜が すき」に なるよ。' },
      { frame: true, text: 'I like の あとに、すきな ものの ことばを いれよう。' },
      { examples: [['dogs'], ['cats'], ['apples']], text: 'れいを タップして きいて みよう！' },
    ] },
  { id: 'can', ja: w => `わたしは ${w[0].jaCan}`, title: 'できる ことを いう ぶん', tpl: ['I can', '＿', '.'], slots: ['action'], slotJa: ['できる こと'],
    make: w => `I can ${w[0].word}.`, example: ['swim'], teacher: 'w3Frog',
    lesson: [
      { big: 'can', say: 'can', text: '「can（キャン）」は「できる」という いみ。「I can 〜.」で「わたしは 〜できる」に なるよ。' },
      { frame: true, text: 'I can の あとに、できる ことの ことばを いれよう。' },
      { examples: [['swim'], ['run'], ['dance']], text: 'れいを タップして きいて みよう！' },
    ] },
  { id: 'this', ja: w => `これは ${w[0].ja}です`, title: 'これは なにかを いう ぶん', tpl: ['This is', '＿', '.'], slots: ['thing'], slotJa: ['もの'],
    card: w => `${/^[aeiou]/.test(w.one) ? 'an' : 'a'} ${w.one}`, // ひとつの ものを いうので a dog・an apple
    make: w => `This is ${/^[aeiou]/.test(w[0].one) ? 'an' : 'a'} ${w[0].one}.`, example: ['dogs'], teacher: 'w3Owl3',
    lesson: [
      { big: 'This is', say: 'This is', text: '「This is（ディス イズ）」は「これは 〜です」という いみ。ちかくの ものを しょうかい する ときに つかうよ。' },
      { frame: true, text: 'This is の あとに「a いぬ」の ように もの を いれよう。ひとつ だから a（りんごや たまごは an）が つくよ。' },
      { examples: [['dogs'], ['apples'], ['cats']], text: 'れいを タップして きいて みよう！' },
    ] },
];
export const FRAME = Object.fromEntries(FRAMES.map(f => [f.id, f]));
export const sentenceKey = (frameId, ids) => frameId + ':' + ids.join('+');

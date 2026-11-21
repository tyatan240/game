// ことばの まほう（1まい）と くみあわせ（2まい）。ついかは ここに かくだけ
//   words：つかう たんご（じゅんばんは かんけい ない）  target：つかう ばしょ（OBJECTS の id）
//   when：はつどう じょうけん（quest/step：クエストの だんかい、world：マップの じょうたい）
//   effect：おこること（set:[キー,あたい] マップの へんか／give・take：もちもの／star：ほし／area：ばしょの かいほう）
//   fx：えんしゅつ  text：おきた ことの せつめい  hint：ちがう ことばを えらんだ ときの ヒント
export const SPELLS = [
  { id: 'apple', words: ['apple'], target: 'appleTree', when: { quest: 'apple', step: 'harvest' },
    effect: [{ give: 'apple' }], fx: 'harvest', text: 'APPLEの まほう！ りんごが ころん と おちてきた！',
    hint: 'りんごの ことばを えらんでね', doneText: 'りんごは もう もっているよ。' },
  { id: 'flower+water', words: ['water', 'flower'], target: 'flowerbed', when: { quest: 'flowers', step: 'combine' },
    effect: [{ set: ['flowerbed', 'bloom'] }, { set: ['vines', 'open'] }, { area: 'forest' }], fx: 'rain-bloom',
    text: 'WATER ＋ FLOWER！ おみずが ふって、おはなが げんきに さいた！',
    hint: 'おみずと おはなの まほうが いるみたい', doneText: 'おはなは もう げんきだよ。' },
  { id: 'bee+flower', words: ['flower', 'bee'], target: 'flowerbed', when: { quest: 'bee', step: 'combine' },
    effect: [{ set: ['bees', true] }], fx: 'bees',
    text: 'FLOWER ＋ BEE！ おはなの においで ハチさんが とんできた！',
    hint: 'おはなと ハチの まほうで よべるかも', doneText: 'ハチさんは もう きているよ。' },
  // ↓ つぎの クエスト よう（まだ つかわない）
  { id: 'bee+honey', words: ['bee', 'honey'], target: 'hive', when: { quest: 'honey', step: 'combine' },
    effect: [{ give: 'honey' }], fx: 'sparkle', text: 'BEE ＋ HONEY！ はちみつが とれた！',
    hint: 'ハチと はちみつの まほうが いるみたい', future: true },
];

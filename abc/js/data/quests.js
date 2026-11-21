// クエスト。じゅんばんに すすむ。ついかは ここに かくだけ
//   requires：はじまる じょうけん（flag：フラグ、quest：まえの クエストが おわっている）
//   steps の on：
//     talk    … target に はなしかけると すすむ（lines を ひょうじ）
//     learn   … target を しらべると word の がくしゅう イベント → クイズに せいかいで すすむ
//     spell   … target で spell の まほう／くみあわせを つかうと すすむ
//     deliver … item を もって target に はなしかけると すすむ（take で わたす）
//     use     … item を もって target を しらべると すすむ（take で つかう）
//   goal：がめん うえに だす「つぎは」  reward：{ star, item }  effect：combos.js と おなじ かきかた
export const QUESTS = [
  { id: 'apple', title: 'りんごを とどけよう！', requires: { flag: 'bossCleared' }, steps: [
    { id: 'ask', on: 'talk', target: 'rabbit', goal: 'ラビに はなしかけよう！', lines: [
      ['ラビ', 'はしが なおったね！ でも むこうの もんに かぎが かかってるんだ。'],
      ['ラビ', 'かぎは ぼくが もってるよ。でも おなかが ぺこぺこ……。'],
      ['ラビ', 'りんごを ひとつ もってきてくれる？ りんごの きは のはらの したの ほうに あるよ。']] },
    { id: 'learn', on: 'learn', word: 'apple', target: 'appleTree', goal: 'りんごの きを さがそう！', pre: [
      ['', 'りんごの きだ！ でも たかくて とどかない……'], ['', 'この ことばを おぼえたら、まほうで とれるかも！']] },
    { id: 'harvest', on: 'spell', spell: 'apple', target: 'appleTree', goal: 'APPLEの まほうで りんごを とろう！', prompt: 'まほうを つかおう！' },
    { id: 'deliver', on: 'deliver', item: 'apple', take: true, target: 'rabbit', goal: 'ラビに りんごを とどけよう！', lines: [
      ['ラビ', 'わあ、りんご！ ありがとう！ APPLE の まほう、すごいね！'],
      ['ラビ', 'おれいに「はしの かぎ」を あげる！ はしの むこうの もんを あけてみて！']],
      reward: { star: 2, item: 'bridgeKey' } },
    { id: 'gate', on: 'use', item: 'bridgeKey', take: true, target: 'gate', goal: 'かぎで はしの もんを あけよう！', lines: [
      ['', 'かぎを つかった！ がちゃっ……もんが ひらいたよ！']],
      effect: [{ set: ['gate', 'open'] }, { area: 'hill' }], fx: 'gate' },
  ] },
  { id: 'flowers', title: 'かれた はなばたけ', requires: { quest: 'apple' }, steps: [
    { id: 'find', on: 'talk', target: 'mouse', goal: 'はなばたけの ねずみさんに はなしかけよう！', lines: [
      ['チュチュ', 'あっ、こんにちは。ぼくは ねずみの チュチュ。'],
      ['チュチュ', 'おはなが かれちゃった。たすけて！'],
      ['チュチュ', 'おみずと おはなの ことばの まほうが あれば、げんきに なるかも……。'],
      ['チュチュ', 'まずは いどを しらべてみて！']] },
    { id: 'water', on: 'learn', word: 'water', target: 'well', goal: 'いどを さがそう！', pre: [
      ['', 'ふかい いどだ。つめたい おみずが いっぱい！'], ['', 'おみずの ことばを おぼえよう！']] },
    { id: 'flower', on: 'learn', word: 'flower', target: 'flowerSign', goal: 'おはなの かんばんを さがそう！', pre: [
      ['', 'おはなの かんばんだ。'], ['', 'おはなの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'flower+water', target: 'flowerbed', goal: 'はなばたけで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'report', on: 'talk', target: 'mouse', goal: 'チュチュに ほうこくしよう！', lines: [
      ['チュチュ', 'わあ！ おはなが さいた！ きみの ことばの まほう、すごい！'],
      ['チュチュ', 'おれいに ほしを あげる！ はなばたけの さきの いばらも なくなったよ。']],
      reward: { star: 3 } },
  ] },
  { id: 'bee', title: 'ハチさんを よぼう', requires: { quest: 'flowers' }, steps: [
    { id: 'ask', on: 'talk', target: 'mouse', goal: 'チュチュに はなしかけよう！', lines: [
      ['チュチュ', 'おはなは さいたけど、ハチさんが いないの。'],
      ['チュチュ', 'ハチさんを よんでくれる？ はなばたけの そばの すばこを しらべてみて！']] },
    { id: 'learn', on: 'learn', word: 'bee', target: 'hive', goal: 'はちの すばこを しらべよう！', pre: [
      ['', 'からっぽの すばこだ。'], ['', 'ハチの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'bee+flower', target: 'flowerbed', goal: 'はなばたけで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'report', on: 'talk', target: 'mouse', goal: 'チュチュに ほうこくしよう！', lines: [
      ['チュチュ', 'ハチさんが きてくれた！ ぶんぶん、たのしそう！ ありがとう！'],
      ['チュチュ', 'みぎの もりの いりぐちへ いってごらん。つぎの ぼうけんが まってるよ！']],
      reward: { star: 3 } },
  ] },
  // ↓ つぎの クエスト（まだ あそべない。データの いれものだけ）
  { id: 'honey', title: 'はちみつを あつめよう', requires: { quest: 'bee' }, future: true, steps: [
    { id: 'ask', on: 'talk', target: 'mouse', goal: 'チュチュに はなしかけよう！', lines: [] },
    { id: 'learn', on: 'learn', word: 'honey', target: 'hive', goal: 'はちの すばこを しらべよう！' },
    { id: 'combine', on: 'spell', spell: 'bee+honey', target: 'hive', goal: 'すばこで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
  ] },
];

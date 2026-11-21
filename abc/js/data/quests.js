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
  // しまの よりみち（ハチの あと）
  { id: 'honey', title: 'はちみつを あつめよう', requires: { quest: 'bee' }, side: true, steps: [
    { id: 'ask', on: 'talk', target: 'bear', goal: 'くまさんに はなしかけよう！', lines: [
      ['くまさん', 'ハチさんが きたって ほんと？ はちみつ、たべたいなあ……'],
      ['くまさん', 'はなばたけの すばこで、はちみつの ことばを おぼえてみて！']] },
    { id: 'learn', on: 'learn', word: 'honey', target: 'hive', goal: 'すばこで はちみつの ことばを おぼえよう！', pre: [
      ['', 'すばこから あまい においが する。'], ['', 'はちみつの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'bee+honey', target: 'hive', goal: 'すばこで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'deliver', on: 'deliver', item: 'honey', take: true, target: 'bear', goal: 'くまさんに はちみつを とどけよう！', lines: [
      ['くまさん', 'わあ、はちみつ！ ぺろり……あまーい！ ありがとう！']], reward: { star: 3 } },
  ] },
  // もりの こみち
  { id: 'sun', title: 'ひまわりを げんきに', requires: { letters: 'forest' }, steps: [
    { id: 'ask', on: 'talk', target: 'hippo', goal: 'かばさんに はなしかけよう！', lines: [
      ['かばさん', 'もりが くらくて、ひまわりが うつむいちゃったの。'],
      ['かばさん', 'おひさまの ことばを ひだまりの いしで おぼえて、ひまわりに つかってみて！']] },
    { id: 'learn', on: 'learn', word: 'sun', target: 'sunstone', goal: 'ひだまりの いしを さがそう！', pre: [
      ['', 'ぽかぽかの いしだ。'], ['', 'おひさまの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'flower+sun', target: 'sunbed', goal: 'ひまわりばたけで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'report', on: 'talk', target: 'hippo', goal: 'かばさんに ほうこくしよう！', lines: [
      ['かばさん', 'ひまわりが にこにこ！ もりも あかるく なった！ ありがとう！']], reward: { star: 3 } },
  ] },
  { id: 'dog', title: 'こいぬの ほね', requires: { letters: 'forest' }, steps: [
    { id: 'ask', on: 'talk', target: 'puppy', goal: 'こいぬの ポチに はなしかけよう！', lines: [
      ['こいぬの ポチ', 'くーん……だいじな ほねを うめたのに、どこだか わすれちゃった。'],
      ['こいぬの ポチ', 'いぬと ほねの ことばの まほうで さがして くれる？']] },
    { id: 'learndog', on: 'learn', word: 'dog', target: 'puppy', goal: 'ポチと いぬの ことばを おぼえよう！', pre: [
      ['こいぬの ポチ', 'ぼくは いぬ！ えいごで なんて いうか おしえて あげる！']] },
    { id: 'learnbone', on: 'learn', word: 'bone', target: 'bonemound', goal: 'つちの やまを しらべよう！', pre: [
      ['', 'つちが もりあがっている。ほねの においが する！'], ['', 'ほねの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'bone+dog', target: 'bonemound', goal: 'つちの やまで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'report', on: 'talk', target: 'puppy', goal: 'ポチに ほうこくしよう！', lines: [
      ['こいぬの ポチ', 'わんわん！ ほねが みつかった！ ありがとう！']], reward: { star: 3 } },
  ] },
  // どうぶつ むら
  { id: 'pie', title: 'りんごの パイ', requires: { letters: 'village' }, steps: [
    { id: 'ask', on: 'talk', target: 'pig', goal: 'ぶたの ブーコに はなしかけよう！', lines: [
      ['ぶたの ブーコ', 'りんごの パイを つくりたいの。でも かごが こやに しまってあって……'],
      ['ぶたの ブーコ', 'こやの とびらには かぎが かかってるの。かぎかけと とびらを しらべてみて！']] },
    { id: 'key', on: 'learn', word: 'key', target: 'keyboard', goal: 'かぎかけを しらべよう！', pre: [['', 'かぎが かかっている いただ。'], ['', 'かぎの ことばを おぼえよう！']] },
    { id: 'learndoor', on: 'learn', word: 'door', target: 'shed', goal: 'こやの とびらを しらべよう！', pre: [['', 'こやの とびらだ。'], ['', 'とびらの ことばを おぼえよう！']] },
    { id: 'door', on: 'spell', spell: 'door+key', target: 'shed', goal: 'こやで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'learnbasket', on: 'learn', word: 'basket', target: 'basketstand', goal: 'こやの なかの かごの たなを しらべよう！', pre: [['', 'かごが ならんでいる！'], ['', 'かごの ことばを おぼえよう！']] },
    { id: 'basket', on: 'spell', spell: 'apple+basket', target: 'orchard', goal: 'りんごの きで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'deliver', on: 'deliver', item: 'applebasket', take: true, target: 'pig', goal: 'ブーコに りんごを とどけよう！', lines: [
      ['ぶたの ブーコ', 'わあ、りんごが いっぱい！ これで パイが やけるね！ ありがとう！']], reward: { star: 3 } },
  ] },
  { id: 'cat', title: 'おなかの すいた こねこ', requires: { letters: 'village' }, steps: [
    { id: 'ask', on: 'talk', target: 'kitten', goal: 'こねこの ミケに はなしかけよう！', lines: [
      ['こねこの ミケ', 'にゃあ……おなか ぺこぺこ。ミルクが のみたいにゃ。'],
      ['こねこの ミケ', 'ねこと ミルクの ことばの まほうで、おさらに ミルクを いれて くれる？']] },
    { id: 'learncat', on: 'learn', word: 'cat', target: 'kitten', goal: 'ミケと ねこの ことばを おぼえよう！', pre: [['こねこの ミケ', 'わたしは ねこ！ えいごで なんて いうか おしえて あげるにゃ。']] },
    { id: 'learnmilk', on: 'learn', word: 'milk', target: 'cow', goal: 'うしさんに はなしかけよう！', pre: [['うしさん', 'もー。ミルクの ことばを おしえて あげよう。']] },
    { id: 'combine', on: 'spell', spell: 'cat+milk', target: 'catbowl', goal: 'おさらで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！', reward: { star: 3 } },
  ] },
  // みずうみ
  { id: 'fish', title: 'いけに おさかなを', requires: { letters: 'lake' }, steps: [
    { id: 'ask', on: 'talk', target: 'turtle', goal: 'かめさんに はなしかけよう！', lines: [
      ['かめさん', 'ちいさな いけの みずが なくなって、おさかなが いなく なっちゃった。'],
      ['かめさん', 'おさかなの かんばんで ことばを おぼえて、いけで まほうを つかってみて！']] },
    { id: 'learn', on: 'learn', word: 'fish', target: 'fishsign', goal: 'おさかなの かんばんを しらべよう！', pre: [['', 'おさかなの かんばんだ。'], ['', 'おさかなの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'fish+water', target: 'drypond', goal: 'ちいさな いけで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'report', on: 'talk', target: 'turtle', goal: 'かめさんに ほうこくしよう！', lines: [['かめさん', 'おさかなが もどってきた！ ありがとう！']], reward: { star: 3 } },
  ] },
  { id: 'bird', title: 'ことりの おうち', requires: { letters: 'lake' }, steps: [
    { id: 'ask', on: 'talk', target: 'bird', goal: 'ことりの ピピに はなしかけよう！', lines: [
      ['ことりの ピピ', 'ぴぴっ。おうちが なくて こまってるの。'],
      ['ことりの ピピ', 'とりと きの ことばの まほうで、おおきな きに おうちを つくって くれる？']] },
    { id: 'learnbird', on: 'learn', word: 'bird', target: 'bird', goal: 'ピピと とりの ことばを おぼえよう！', pre: [['ことりの ピピ', 'わたしは とり！ えいごで なんて いうか おしえて あげる！']] },
    { id: 'learntree', on: 'learn', word: 'tree', target: 'bigtree', goal: 'おおきな きを しらべよう！', pre: [['', 'おおきな きだ。'], ['', 'きの ことばを おぼえよう！']] },
    { id: 'combine', on: 'spell', spell: 'bird+tree', target: 'bigtree', goal: 'おおきな きで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！', reward: { star: 3 } },
  ] },
  // いろの にわ
  { id: 'colors', title: 'いろの はなだん', requires: { letters: 'garden' }, steps: [
    { id: 'ask', on: 'talk', target: 'merry', goal: 'にわしの メリーに はなしかけよう！', lines: [
      ['にわしの メリー', 'おしろの おまつりに、あかと あおの おはなを かざりたいの。'],
      ['にわしの メリー', 'えのぐの ところで いろの ことばを おぼえて、しろい はなだんに まほうを かけてみて！']] },
    { id: 'learnred', on: 'learn', word: 'red', target: 'redpaint', goal: 'あかい えのぐを しらべよう！', pre: [['', 'あかい えのぐだ！'], ['', 'あかの ことばを おぼえよう！']] },
    { id: 'redcombine', on: 'spell', spell: 'flower+red', target: 'redbed', goal: 'うえの はなだんで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'learnblue', on: 'learn', word: 'blue', target: 'bluepaint', goal: 'あおい えのぐを しらべよう！', pre: [['', 'あおい えのぐだ！'], ['', 'あおの ことばを おぼえよう！']] },
    { id: 'bluecombine', on: 'spell', spell: 'blue+flower', target: 'bluebed', goal: 'したの はなだんで ことばを くみあわせよう！', prompt: 'ことばを くみあわせよう！' },
    { id: 'report', on: 'talk', target: 'merry', goal: 'メリーに ほうこくしよう！', lines: [
      ['にわしの メリー', 'あかと あおの おはな、すてき！ これで おまつりが できるわ！'],
      ['にわしの メリー', 'さいごは おくの おしろの もんで、ぜんぶの もじの おさらいよ！']], reward: { star: 4 } },
  ] },
];

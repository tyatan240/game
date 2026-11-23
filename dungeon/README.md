# モコの イングリッシュダンジョン（`dungeon/`）

えいごの なまえの てき・アイテム・まほう・そうびで あそぶ ターンせいの ダンジョン（ローグライク）。仕様：`docs/dungeon-spec.md`。
入口：おうちの「おべんきょう」の カード。`../index.html` で おうちへ。

## いま（だい1かい「きほん」）
- チュートリアル「れんしゅうの へや」（はじめては かならず。2かいめからは「みる／とばす」。タイトルの「あそびかた」からも）
  - 10だんかい：うごく → しらべる → ひろう → たべる（もちもの）→ こうげき → たからばこ（key）→ まほうの ほん → まほう（MP）→ そうび → かいだん。だんかいごとに「せつめい カード」（ボタンの え つき。`main.js` の `TUT`）、ガイドの「？ せつめい」で もういちど
- 1〜5かい（5かいは ボス king slime。たおすと かいだん）。`data.js` の `MAX_FLOOR`・`BOSS_FLOORS`
- てき 5（slime・rat・bat・snake・angry pig）、アイテム 9（apple・bread・meat・potion・key・magic book・angel feather・sword・shield）＋ treasure box・stairs、まほう 3（fire・water・heal）
- せんとうは 1ぎょうずつ ゆっくり（モコの こうげき → ダメージ → HPの けいさんしき → てきの こうげき …）。その あいだは そうさ しない
- タップで しょうさい カード（えいご・え・いみ・はつおん・こうか・ボタン）。いみを みずに つかうと「よめた」
- ずかん（ダンジョン せんよう。Monsters / Items / Magic / Equipment）
- ちゅうだん・つづきから（1ターン ごとに ほぞん）、さいこう とうたつ かい、たおれたら 1かいから（ずかんは のこる）
- ⭐（おうちの points）：はじめて ついた かい ⭐1・ボス はじめて ⭐10・ずかん 10ごと ⭐5

## こうせい
```
index.html / style.css
js/data.js   ことば・てき・アイテム・まほう・そうび（ここに たすと ふえる）、MAX_FLOOR・BOSS_FLOORS・⭐
js/gen.js    マップ（へやと つうろ）・チュートリアルの マップ
js/game.js   きまり（ターン・こうげき・てきの うごき・アイテム・まほう・かいだん）。DOM を つかわない
js/art.js    え（ABCぼうけんの WORD_ART に dg_ の え を たす）・タイル
js/save.js   ほぞん（moko-dungeon-v1：localStorage ＋ IndexedDB moko-dungeon/kv）
js/main.js   がめん・そうさ・カード・もちもの・まほう・ずかん・チュートリアル・⭐
```
- core.js（S・save・charSVG・showPop・ACT）と ABCぼうけんの おと（`abc/js/engine/audio.js`）・え を つかう。
- しゅじんこうは おうちの キャラ（いまの きせかえ）を charSVG から えに して かく。

## ほぞん（`moko-dungeon-v1`）
`{ v, t, best, clears, runs, tutorialDone, dex:{id:{seen,used,read,looked,first}}, rewarded:{floor,boss:[],dex}, settings, run }`
`run` は ちゅうだん ちゅうの ぼうけん（`game.js` の じょうたい そのまま）。こうもくは ついかのみ。

## つぎ（だい2かい・3かい）
6〜20かい・のこりの てき／まほう／そうび・ボス4たい・5かいごとの テスト（学習履歴へ）・2ごの なまえ（angry pig・magic sword）・えいごだけの ヒント。

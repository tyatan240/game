# モコの イングリッシュダンジョン（`dungeon/`）

えいごの なまえの てき・アイテム・まほう・そうびで あそぶ ターンせいの ダンジョン（ローグライク）。仕様：`docs/dungeon-spec.md`。
入口：おうちの「おべんきょう」の カード。`../index.html` で おうちへ。

## いま（だい1かい「きほん」＋ だい2かい「ひろげる」）
- チュートリアル「れんしゅうの へや」（はじめては かならず。2かいめからは「みる／とばす」。タイトルの「あそびかた」からも）
  - 14だんかい（うごく・しらべる・ひろう・たべる・こうげき（ボタン）・ぶつかって こうげき・key・たからばこ・まほうの ほん・よむ・fire・sword・そうび・かいだん）。せつめいは 1ぎょう、つぎに する ことは マップの やじるし と ひかる ボタン。それ いがいの そうさは できない。せんとうの ひょうじが おわるまで つぎの だんかいに しない（`main.js` の `TUT`・`tutInfo`・`tutAllows`）
- 1〜20かい。5かい ごとに ボス（king slime・queen bee・ghost king・big dragon）と どうくつの いろ（`data.js` の `MAX_FLOOR`・`BOSS_FLOORS`・`BOSS_OF`・`ZONES`）
- てき 14（slime・rat・bat・snake・angry pig・frog・turtle・spider・bee・crab・ghost・snowman・wolf・dragon。`hard`：ふつうの こうげきは 1だけ・まほうを おぼえてから でる。`minFloor`〜`maxFloor` の かいに でる。とくべつな うごき：`web` いと・`wall` かべを とおる・`breath` とおくから ほのお・`def` まもり）
- アイテム 13（apple・banana・bread・meat・candy・juice・blue potion・potion・key・magic book・angel feather・torch・rope）＋ treasure box・stairs、そうび 12（sword〜gold sword・shield〜silver shield・armor〜silver armor）、まほう 15（7つの なかま `fam` × ★ `tier`。`kind` で こうか が きまる）
- もちものの ふくろは ぶき・たて・よろい（5こずつ）・たべもの（10こ）・ほん/どうぐ（8こ）。がめんの タブは `GROUPS`（`data.js` の `BAGS`・`bagOf`）。そうびしても もちもの がめんは とじない。HPは あるいても もどらない（たべもので かいふく）
- いまの そうびは うえの `#gear`。マップの モコにも かさねて かく（`main.js` の `drawGear`）。そうびがめんは もちもの の「そうび」タブ（`gearView`）
- まほうは えらぶと まず あたる ところを みせる（`main.js` の `startAim`・`drawAim`、`game.js` の `spellTargets`）。「つかう」で つかうと、えんしゅつ（`spell` イベント・`drawSpell`）→ ダメージ の じゅん
- ボスの あとは ふくしゅう テスト 5もん（`main.js` の `startTest`。であった ことば・にがてを さきに。⭐と「ことばの ちから」＝ `run.power`。学習履歴 eigo / dungeon）
- HP・MP と メッセージは したの らん（`#dock`。よこがめんは やじるしと ボタンの あいだ、たては ボタンの うえ）。キャラの うえに みじかい ふきだし（こうげき！・fire！）
- せんとうは 1ぎょうずつ ゆっくり（モコの こうげき → ダメージ → HPの けいさんしき → てきの こうげき …）。その あいだは そうさ しない
- カメラは マップを うごかさない（モコが はしに ちかい ときだけ ずらす）。たおした てきは「たおした！」の ときに きえ、えいごで「You beat the 〇〇!」と よむ
- もちものが いっぱいで たからばこを あけると、はいらない ぶんは となりの ゆかに おく（`game.js` の `freeNear`）
- タップで しょうさい カード（えいご・え・いみ・はつおん・こうか・ボタン）。いみを みずに つかうと「よめた」
- ずかん（ダンジョン せんよう。Monsters / Items / Magic / Equipment）
- ちゅうだん・つづきから（1ターン ごとに ほぞん）、さいこう とうたつ かい、たおれたら 1かいから（ずかんは のこる）
- ⭐（おうちの points）：はじめて ついた かい ⭐1・ボス はじめて ⭐10・ずかん 10ごと ⭐5・テスト せいかいの かず（まいかい）・20かい はじめて クリア ⭐30

## こうせい
```
index.html / style.css
js/data.js   ことば・てき・アイテム・まほう・そうび（ここに たすと ふえる）、MAX_FLOOR・BOSS_FLOORS・⭐
js/gen.js    マップ（へやと つうろ）・チュートリアルの マップ
js/game.js   きまり（ターン・こうげき・てきの うごき・アイテム・まほう・かいだん）。DOM を つかわない
js/art.js    え（ABCぼうけんの WORD_ART に dg_ の え を たす）・タイル
js/save.js   ほぞん（moko-dungeon-v1：localStorage ＋ IndexedDB moko-dungeon/kv）
js/main.js   がめん・そうさ・カード・もちもの・まほう・ずかん・チュートリアル・ふくしゅう テスト・⭐
```
- core.js（S・save・charSVG・showPop・ACT）・learning-history.js（テストの きろく）と ABCぼうけんの おと（`abc/js/engine/audio.js`）・え を つかう。
- しゅじんこうは おうちの キャラ（いまの きせかえ）を charSVG から えに して かく。

## ほぞん（`moko-dungeon-v1`）
`{ v, t, best, clears, runs, tutorialDone, dex:{id:{seen,used,read,looked,first,tq,tok}}, rewarded:{floor,boss:[],dex,clear}, settings, run }`（tq・tok：テストの もんだい かず・せいかい）
`run` は ちゅうだん ちゅうの ぼうけん（`game.js` の じょうたい そのまま）。こうもくは ついかのみ。

## つぎ（だい3かい「しあげ」）
2ごの なまえ（magic sword・blue shield など）・えいごだけの ヒントの しかけ・20かい クリアの きねんの きせかえ。

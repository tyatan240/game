# ABCぼうけん（ワールド1：アルファベットの しま A〜Z）

> 「ことばの まほう」「ことばの くみあわせ」の仕様と決定事項：`docs/abc-kotoba-mahou-spec.md`

小学1年生むけの、あそびながら アルファベットを おぼえる 2D 見下ろし型 アドベンチャー。
おべんきょうハウスとは **独立したモジュール**（`abc/` フォルダだけで動く）で、既存のファイル・保存データには触れていない。

- URL：`https://tyatan240.github.io/game/abc/index.html`
- 操作：PC は矢印キー／WASD で移動、Space／Enter で話す・調べる、Esc でメニュー。スマホ・iPad は左下の方向パッドと右下の「はなす」ボタン
- 1回 5〜15分。間違えてもゲームオーバーなし（もう一度選べる）

## MVP のながれ
1. 草原で目をさます → うさぎの ラビが「はしが こわれた。もじを 5つ おぼえよう」と教える
2. 動物（ありさん A・くまさん B・ねこさん C・いぬさん D・ぞうさん E）に話しかける
   → もじカード（大きな文字＋英語の音声）→ 3択クイズ → ほし ＋1
3. たからばこ（2こ）：もじを2つ覚えると挑戦できる。3問正解で開き、きがえ（スカーフ・ぼうし）と ほし ＋1
4. 5文字そろったら、はしの前の ドラコ（かわいいドラゴン）の おさらいクイズ（5問・4択・音だけの問題もあり）
5. はしが直る（ほし ＋3）。でも向こうの門には かぎ
6. **りんごを とどけよう**：ラビの依頼 → りんごの木で APPLE を覚える → APPLE のまほうで収穫 → ラビに届けて「はしの かぎ」（ほし ＋2）→ 門を開ける
7. **かれた はなばたけ**：ねずみの チュチュの依頼 → 井戸で WATER、おはなの かんばんで FLOWER を覚える → 花畑で WATER＋FLOWER → 雨が降って花が咲き、いばらが消える（ほし ＋3）
8. **ハチさんを よぼう**：巣箱で BEE を覚える → 花畑で FLOWER＋BEE → ハチが飛んでくる（ほし ＋3）
9. しまの右はしから次のエリアへ。各エリアは「その文字を教える動物 → ことばの まほうの クエスト → もじの もん（おさらい）」の順
   | エリア | 文字 | クエスト（組み合わせ） |
   |---|---|---|
   | もりの こみち | F〜J | ひまわりを げんきに（SUN＋FLOWER）・こいぬの ほね（DOG＋BONE） |
   | どうぶつ むら | K〜O | りんごの パイ（KEY＋DOOR → APPLE＋BASKET）・おなかの すいた こねこ（CAT＋MILK、ミケが なかまに） |
   | みずうみ | P〜T | いけに おさかなを（FISH＋WATER）・ことりの おうち（BIRD＋TREE） |
   | いろの にわ | U〜Z | いろの はなだん（RED＋FLOWER・BLUE＋FLOWER） |
10. おしろの もんで A〜Z の さいごの おさらい（6問）→「アルファベット ぜんぶ クリア！」（つぎは こもじの もり）
- 寄り道：しまの くまさんの「はちみつを あつめよう」（BEE＋HONEY）
- **何回でも遊べる**：クリア後は エンディングの「もういちど さいしょから」か タイトルの「もういちど ぼうけん」で最初から。ぼうけんの進み（覚えた文字・単語・クエスト・マップの変化・場所）は戻るが、学習記録・★・きがえ・設定・クリア回数（`clears`）は残る（`state.js` の `replayState`）。★はまた集めるたびに おうちに届く。学習記録が残るので、覚えた文字は4択になり おさらいになる
- 画面左上に「つぎは」（今の目的）、目的地に ▼、画面外なら端に矢印
- 覚えた動物に もう一度話すと、苦手な文字を優先した おさらいクイズ

## 構成（ロジックと表示を分けている）
```
abc/
├─ index.html / style.css
└─ js/
   ├─ main.js            … ゲームの進行（ループ・描画・イベント・タイトル）
   ├─ data/              … ★ 追加・編集はここ
   │   ├─ letters.js     … A〜Z（日本語のよみ・音声合成用のつづり・録音ファイル・フォニックス）
   │   ├─ words.js       … 英単語（意味・絵・音声・覚えられる場所）
   │   ├─ combos.js      … まほう（1枚）と組み合わせ（2枚）：場所・条件・効果・演出・ヒント
   │   ├─ quests.js      … クエスト（段階ごとに 目的の文・行き先・やること・ごほうび）
   │   ├─ world1.js      … しまの マップ・キャラ・しらべる物・かんばん・たからばこ・持ち物・せりふ
   │   ├─ areas/*.js     … もり・むら・みずうみ・にわ の マップ・キャラ・物・入口と出口
   │   └─ areas.js       … エリア一覧（AREAS）・進む順番（ORDER）・チャプター（CHAPTERS：文字→クエスト→もん）
   ├─ game/              … 表示に関係しないロジック
   │   ├─ learning.js    … 学習記録・習熟度・苦手優先の出題・選択肢の数
   │   ├─ quiz.js        … 問題の生成（文字・単語）
   │   ├─ quests.js      … クエストの進行・「つぎは」
   │   ├─ magic.js       … まほう／組み合わせの判定・ヒント・効果
   │   ├─ world.js       … 当たり判定・移動・調べる相手
   │   └─ state.js       … セーブデータ
   ├─ engine/            … 描画・音・入力
   │   ├─ art.js         … タイル・キャラ（どうぶつ 30種）などの絵（すべてコードで描くオリジナル）
   │   ├─ art2.js        … F〜Z の エリアの物・単語の絵
   │   ├─ audio.js       … 英語音声・効果音・BGM
   │   └─ input.js       … キーボード・タッチ
   └─ ui/ui.js           … 会話・もじカード・クイズ・メニューなどの画面部品
```
- ゲームエンジン（Phaser 等）は使わず Canvas 2D で実装。外部ライブラリ・ビルド不要で、GitHub Pages にそのまま置ける
- 絵文字は素材に使っていない（タイル・キャラ・アイコンはすべてコードで描画）

## 英語の音声
- 標準はブラウザ内蔵の音声合成（Web Speech API、`en-US` の声を自動で選ぶ。無料・外部API不要）
- 文字の「名前」（A＝エイ）と「フォニックスの音」（apple の a＝/æ/）は `letters.js` で別の項目として持っている。MVP は名前だけを使う
- **録音素材に差し替える**：`letters.js` の `audio` に音声ファイルのパス（例：`audio/a.mp3`）を書くと、そちらが優先される
- 端末に英語の声が入っていない場合は音が出ないことがある（メニュー →「せってい」→「こえの テスト」で確認）

## 学習記録
文字ごとに 出題回数・正解回数・連続正解・最終出題日・最終正解日・習熟度・復習予定日 を保存。
- 習熟度：はじめて（正解0）／れんしゅう中／おぼえた（正解3回以上・連続2回以上・正解率70%以上）
- 復習予定日：連続正解に応じて 1・3・7・14日後
- 出題：はじめて・れんしゅう中・復習日が来たもの・正解率が低いものを優先
- 選択肢：はじめて／れんしゅう中は3択、おぼえたは4択（ボスは4択）
- やり直しで正解しても、正解回数には数えない

## 保存データ
- `localStorage` の `abc-adventure-v1`（おべんきょうハウスの `moko-math-v1` とは別）
- **おうちとの つなぎ**：入口は おうちの「おべんきょう」、出口は タイトルの「おうちへ もどる」とメニューの「おうちへ」。ABC で集めた★は `js/game/house.js` が おうちの ⭐（`points`）に届ける（`stars − starsSent` 分 × おうちの⚙️設定 `abcPts`、既定10）
- エリア：`hero.area`（今いるエリア）。`areas` に行ったことのあるエリア、`world` に `gate_forest` などの もんの状態
- `ever`：これまでに覚えたもの `{ learned, lower, words, sentences }`（id の配列）。「はじめから」でも消えない（`KEEP_ON_REPLAY`）。保存のたびに `knownOf()`（いまの進み＋`slots`＋`ever`＋`records`）で作り直す。えいごの へや・保護者レポートの「覚えた」は `knownOf()` を使う。
- ことばの まほうで追加した項目：`words`（覚えた単語）・`combos`（見つけた組み合わせ）・`quests`（クエスト進行）・`inv`（持ち物）・`world`（マップの変化）・`areas`（行ける場所）。単語の学習記録は `records['w:apple']`
- 項目を増やすときは `state.js` の `defaultState()` に初期値を足す（`load()` が古いデータを補う）。名前の変更・削除はしない

## 単語・組み合わせ・クエストを足すには（ロジックの変更は不要）
1. 単語：`words.js` に1行（`learnAt` に覚えられる場所の id）。絵は `art.js` の `WORD_ART` に描く
2. 場所：`world1.js` の `OBJECTS`（または `SIGNS`）に追加し、`MAP` に置き場所を空ける
3. まほう／組み合わせ：`combos.js` に1行（`words` は順不同、`when` でクエストの段階を指定）
4. クエスト：`quests.js` に段階を並べる（`talk`・`learn`・`spell`・`deliver`・`use`）
5. 新しい種類の効果（`effect`）や演出（`fx`）だけは `magic.js`／`main.js` に追加する

## エリアを足すには
1. `js/data/areas/xxx.js` を作る（`MAP`・`entries`・`exits`・`NPCS`・`OBJECTS`・`SIGNS`）。id はゲーム全体で重ならないこと
2. `areas.js` の `AREAS`・`ORDER`・`CHAPTERS` に足す（文字・クエスト・もんの id）
3. 新しい種類の物は `art2.js` に絵を描き、`main.js` の `draw()` に1行足す

## 問題・ステージを足すには
- 文字：`letters.js` の `WORLD1_LETTERS` を増やす／新しいワールド用の配列を作る
- マップ：`world1.js` の `MAP`（1文字＝1マス）を書き換え、`NPCS`・`SIGNS`・`CHESTS` に座標を足す
- 動物の種類：`art.js` の `KIND` に色・耳の形を足す

## ワールド2「こもじの もり」（a〜z）
- 入口：いろの にわ の おしろの下の みち（右下）。`exits` の `needs:{flag:'alphabetClear'}` で、アルファベットを クリアするまでは通れない。
- `data/areas/lower.js`：せんせい5にん（ふくろう a〜e・りす f〜j・きつね k〜o・たぬき p〜t・かめ u〜z。NPC の `lower`）と「こもじの もん」（`lowerGate`）。
- せんせい：おおもじ と こもじ の ペアのカード（`ui.teachLower`）→ クイズ（「A の こもじは どれ？」／音を聞いて こもじ）→ その こもじを `S.lower` に（★＋2）。2回目からは おさらい（「a の おおもじは？」も）。
- もん：26こ おぼえると さいごの おさらい6問 → `S.world.gate_lower='open'`・`S.flags.lowerClear`（★＋5）。
- **ワールドを えらぶ**：いちど A〜Z を クリアすると（`clears`>0 か `flags.alphabetClear`）、タイトルに「ワールド1（ABC）から」「ワールド2（abc）から」。ワールド2 は `state.js` の `world2State()` で ワールド1 を ぜんぶ おえた じょうたい（クエスト・まほう・もん・ことば・もじ）を データから つくり、こもじの もりの 入口から はじめる（きろく・ほし・きがえ・クリア回数は のこる。こもじの すすみは はじめから）。
- 学習記録は `S.records['l:A']`（こもじ）。出題は `quiz.js` の `lowerQuestion(target, pool, 'match'|'listen'|'upper', 選択肢の数)`。
- 保存：`abc-adventure-v1` に `lower:[]` を追加（`state.js` で補う）。

## ワールド3「ことばの まち」（5エリア・実装済み）
仕様・決定事項：`docs/abc-world3-spec.md`。こもじの もりの ひがし（`exits` の `needs:{flag:'lowerClear'}`）から入る。
- **エリア**：`data/areas/w3plaza.js`（あいさつの ひろば）・`w3market.js`（かずの いちば）・`w3studio.js`（いろと かたちの こうぼう）・`w3school.js`（すきなものの がっこう）・`w3tower.js`（ことばの とう）。チャプターは `areas.js` の `w3:true`（`words`・`frames`・`quests`・`gate`・`gateLabel`）。
- **ことば**：`data/words.js` の `world:3`（`word` は ふつうの かきかた、`kind`：greet / feel / number / thing）。せんせい（NPC の `teach`）が まとめて おしえる（`ui.teachWords` → よむ／きく クイズ）→ `S.words` に とうろく。
- **ぶんカード**：`data/sentences.js`（`FRAMES`：`tpl`・`slots`・`make`）。せんせい（NPC の `frame`）が おしえる（`ui.teachFrame` → `ui.sentence` で つくって みる）→ `S.sentences[id] = {at, made:['please:three+apples']}`。
- **ぶんカードの かた**：I'm ＿. / ＿ ＿, please. / a ＿ ＿（いろ・かたち）/ I like ＿. / I can ＿. / This is ＿.（`card` で a dog・an apple と ひょうじ）。
- **さいご**：ことばの とうの 3つの かね → とうの もんで ワールド3 ぜんぶから 6もん → `flags.w3Clear`・`w3clears`・きがえ「ことばの マント」（`items` の `cape`、`drawCritter` の `opts.cape`）。
- **クエストの あたらしい ステップ**（`data/quests.js`）：`convo`（へんじを えらぶ）・`ask`（How are you? → へんじを よんで あう ものを わたす。`GIFTS` は `world1.js`）・`sentence`（ぶんカード。`want` と ちがうと `wrong` の ヒント）・`count`（ふうせんを かぞえて かずの えいご）・`quiz`（えを みて えいごで こたえる。`rounds:[{art, ask, answer, choices}]`）。`sentence` は `task`（いう ことの せつめい）・`picture` も つかえる。
- **もん**：`kind:'lettergate'` を つかい、`CHAPTER[area].w3` なら `w3Gate()`（ことばの おさらい 5もん）。
- 絵は `engine/art3.js`（かお・て・かず・くだもの・ふうせん・やたい）。えいごの部屋（`eigo/`）も art3 を よむ。
- 保存：`abc-adventure-v1` に `sentences:{}` を追加（`state.js` で補う）。
- タイトル：こもじの もんを クリアすると「ワールド3（ことば）から」（`world3State()`）。おうちの ⚙️設定の **管理者モード** が オンなら、クリア まえでも ワールド2・3 を えらべる（`game/house.js` の `houseAdmin()`）。

## ワールド4「おとの しま」（フォニックス・作成中：エリア1〜4）
仕様：`docs/abc-world4-spec.md`。こもじの もりの みなみの ふなつきば（`exits` の `needs:{flag:'lowerClear'}`）か、タイトルの「ワールド4」から入る（`world4State()`：ワールド1・2を おえた じょうたい。ワールド3は いらない）。
- **おと**：`data/phonics.js` の `SOUNDS`（`id`＝こもじ・`kana`＝おとの めやす・`key`＝その おとで はじまる ことば・`area`・`audio`）。iPad の よみあげは もじ1つの おとが にがてなので、**key の ことばを よみあげる**（`ui.sayPhon`）。ろくおんを `audio` に いれれば そちらを つかう。
- **エリア**：`data/areas/w4beach.js`（おとの はまべ：s a t p i n）・`w4cave.js`（ひびきの ほらあな：c e h r m d）。チャプターは `areas.js` の `w4:true`（`sounds`・`quests`・`gate`）。
- **せんせい**（NPC の `sounds`）：おとカード（`ui.teachSounds`：もじ・なまえ・おと・ことばの え）→ はじめの おとの クイズ → `S.sounds` に とうろく（★＋2）。2かいめからは おさらい。
- **クイズ**：`quiz.js` の `soundQuestion(word, 'first'|'last'|'mid', pool)`（ことばを きいて、その ばしょの おとの もじ）。クエストの `on:'phon'`（`rounds`：`{t:'pick', sound, answer, choices}`＝その おとで はじまる えを えらぶ／`{t:'first'|'last'|'mid', word}`）。
- **もん**（`w4Gate`）：その エリアの おとで はじまる ことば 3もん＋おわりの おと 2もん（`PHON_LAST`）。
- **え**：`engine/art4.js`（ぶた・イグルー・ぼうし・ペン・とりの す）。ことばは `words.js` の `world:4`（`kind:'phon'`）。
- 保存：`abc-adventure-v1` に `sounds:[]`・`w4clears` を追加（`state.js` で補う）。きろくは `records['snd:a']`。`knownOf()` に `sounds`（はじめから でも へらない）。ワールドの つづきは `S.slots[4]`。
- 「つぎは」（`objective()`）は いる ばしょの ワールドで わける（おとの しまでは ワールド4の チャプターだけ）。
- **第2回**：`w4valley.js`（つなげの たにま：g o u l f b）・`w4village.js`（なかまの むら：j z w v y x qu k。x は おわりの おと＝`pos:'last'`、qu は `label`）。ほらあなの ひがしに でぐち。
  - **つなげて よむ**（`blendQuestion`）：もじタイルに おとの めやす（ク・ア・トゥ）を つけて じゅんに ひからせる（`ui.blendTiles`）→ えを えらぶ。まちがえたら ことばを きかせる（`hintVoice`）。きろく `rd:cat`。
  - **なかまさがし**（`oddQuestion`）：おしりが ちがう ことばを えらぶ（ぜんぶ よみあげる）。きろく `fam:at`。
  - **おとで つくる**（`ui.spell`）：ことばを きいて もじタイルを じゅんに えらぶ（ことばの もじ＋ほかの もじ 2つ）。きろく `sp:jet`。
  - クエスト `on:'phon'` の rounds に `{t:'blend', word}`・`{t:'odd', words, answer}`・`{t:'spell', word}`。もんの もんだいは チャプターの `gateQ`。
  - よむ ことば：`phonics.js` の `CVC`（3もじ・え つき 32こ）。え は `art4.js`。

## ワールドごとの つづき（タイトル）
- ワールド2・3が えらべるように なると（クリア または 管理者モード）、タイトルに ワールドごとの「つづきから」「はじめから」。うえの おおきな「つづきから」は さいごに あそんだ ワールド。
- いま あそんでいる ワールドの すすみは いままでどおり S の うえ（`hero`・`flags`・`quests` など）。ほかの ワールドの すすみは `S.slots[1|2|3]` に しまう（`state.js` の `snapshot()`／`restore()`。しまう こうもくは `KEEP_ON_REPLAY` いがい）。どの ワールドかは `hero.area` で きめる（`worldOf()`）。
- がくしゅう きろく・★・きがえ・クリア回数（`clears`・`w2clears`）は ワールドを またいで ひとつ。つづきが ある ワールドを「はじめから」に すると かくにんが でる。

## えいごの へや（`eigo/`）との つながり
- れんしゅう・🏆テストの しゅるい（`core.js` の `ETYPES`）：もじを きいて／もじの よみかた／ことばを きいて／えを みて えいご（ワールド1）、**あいさつ・きもち／かず・いろ・かたち／えいごの ぶん**（ワールド3）、**はじめの おと**（フォニックス：ことばを きいて さいしょの もじを えらぶ）。`eigo/index.html` の `makeQ`・`makeQ3`。
- きろくは ABCぼうけんの `records` に かく（ことば `w:id`・ぶん `s:かた`・はじめの おと `ph:id`）。
- **きょうの ふくしゅう**：`records` から ふくしゅうびが きた もの・にがてな もの を 3もん（`reviewItems()`）。1日1かい ⭐＋5（`moko-math-v1` の `daily.eigoRev`）。
- 保護者レポート（`parent/report.js` の `english()`）：大文字・小文字・単語・ことば・文の形の かず、クリア回数、苦手な項目。

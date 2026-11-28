# 構成と仕組み

## 全体
- 1つのホーム画面アプリ（`manifest.json` の scope は `/game/`）。トップ＝おうち、各部屋はフォルダ。
- `index.html`・`sansu/`・`kokugo/` は `common/core.js`（classic script、グローバル定義）と `common/style.css` を読み込む。
- `program/` は core.js を読まない独自コード（グローバル名 `S`・`$`・`save` などが core.js と衝突するため）。共通ポイントだけ `moko-math-v1` を直接読み書きする。
- `abc/` は ES Modules の独立モジュール。core.js は使わず、★だけ `abc/js/game/house.js` が `moko-math-v1` の `points` に届ける（詳細は `abc/README.md`）。入口は おうちの「おべんきょう」、出口は ABC のタイトルとメニューの「おうちへ」。

## common/core.js の主な定義
| 種類 | 名前 |
|---|---|
| 問題の種類 | `TYPES`/`TYPE`（さんすう：add1, add21, add22, sub1, sub21, sub22, mul1, mul2（九九）, clock1, clock2（時計）。`gen()` で出題、答えは `ansOf(p)`、表示は `probHTML(p,入力)`。時計は `[時,'⏰',分,'h'|'m']`、`def:true` は最初からオン）、`KTYPES`/`KTYPE`（こくご：k1yomi, k1kaki, k2yomi, k2kaki, kotoba, yomi, kata（かたかな）, bun（ぶんの しくみ）） |
| アイテム | `ITEMS`/`ITEM`、`CATS`（おみせのタブ）、`GACHA_SR`/`GACHA_N` |
| 保存 | `defState()`、`merge(d)`、`S`（現在の状態）、`save()`、`ready`（IndexedDB 読込完了の Promise）、`resync()` |
| 絵 | `charSVG(equip,mood,cls)`、`roomSVG(state)`、`thumb(item)`。パーツ：`CH`（キャラ）`OUTFIT` `HAT` `ACC` `ACC_BACK` `WALLX`/`wallSVG` `FLOORX`/`floorSVG` `FURN` |
| テスト | `TLV`（テスト1〜3：10/15/20問、合格 9/14/20問）、`TBASE`（種類ごとの1問あたり秒数）、`testLimit` `testItem` `parseKey` `testUnlocked` `passRule` |
| UI | `$`、`showPop(html)`、`closePop()`、`ACT`（`data-act` のクリック処理表。各ページで `Object.assign(ACT,{...})`）、`tabs()` |
| 音 | `beep` `sTap` `sOk` `sNg` `sBuy`（WebAudio） |

ボタンは `<button data-act="名前" data-arg="引数">` で書き、`ACT[名前](引数)` が呼ばれる。

## 各ゲーム
### おうち（`index.html`）
- 画面：`home`（部屋）/`study`（各部屋への入口）/`gacha`/`shop`/`dress`/`settings`。`go(view)` で切替、`#shop` などのハッシュで直接開ける（`#dress-room` も可）。
- ログインボーナス（`dailyCheck`、`ready` の後に実行）、⚙️設定（かけ算に答えると開く）、データ引き継ぎ（Base64 の JSON コード）。

### さんすう（`sansu/`）・こくご（`kokugo/`）
- 練習：`perRound` 問。1回目正解で満点、2回目は半分。全問正解ボーナス `perfect`。
- 🏆テスト：種類×3段階。制限時間＝問題数×`TBASE[種類]`×段階倍率×`testScale`。間違えるとやり直しなし。合格で限定アイテム（`ITEMS` の `test:'種類-段階'`）。前の段階に合格すると次が開く。練習モードはポイント×`practiceMul`、合格ライン到達で `practiceBonus`。2回目からの合格は ⭐`retestPts`（既定10。全問正解なら＋`perfect`）。
- こくごの問題データは `kokugo/index.html` 内の `K1`・`K2`（漢字語 [漢字,よみ]）、`KOTOBA`（[問題,正解,誤答…]）、`STORIES`（よみとり）、`KATA_W`（[ひらがな,カタカナ]。誤答は `KATA_MIX` のまぎらわしい字で作る）、`BUN`（いつ・だれが・どこで・どうする の部品）。`makeQ(種類)` が4択を作る。

### えいご（`eigo/`）
- 最初の画面で「ぼうけんに いく」（`abc/`）か「べんきょう する」を選ぶ。べんきょうは さんすう・こくごと同じ（練習＋🏆テスト、限定アイテム）。
- 問題の種類は core.js の `ETYPES`（もじを きいて えらぶ／もじの よみかた／ことばを きいて えらぶ／えを みて えいご）。問題は ABCぼうけんで覚えた文字・単語（`abc-adventure-v1` の `learned`・`words`）から、苦手優先で出す。3つ以上覚えた種類だけ遊べる。
- ページの処理は `<script type="module">`（abc の `letters.js`・`words.js`・`art.js`・`audio.js`・`learning.js` を import）。core.js のグローバル（`S`・`ACT` など）もそのまま使う。
- 結果は ABCぼうけんの学習記録（`records`）にも書く（records 以外は触らない）。テスト用の入口は `window.__eigo`。

### プログラミング（`program/`）
- 51ステージ（`LEVELS`：`#`壁 `S`スタート `G`ゴール `*`星。`loop:true` で「くりかえし」ブロック解禁）。13〜30 は `set:2`（「もっと ならべて」「もっと くりかえし」）。
- ステージは**うしろに足すだけ**（`piko-prog-v1` の `best` はステージ番号で記録しているので、途中に入れたり並べ替えたりしない）。前のステージをクリアすると次が開く。
- ⭐3 の基準 `par`：loop なしは自動計算。loop ありは手で書く（最小ブロック数。`tests/program-solutions.json` に解き方があり、スモークテストで全ステージ⭐3 クリアを確認）。
- 31〜51 は `set:3` の あたらしい しゅるい（`kind`）。`need:5` の ステージは ➡️ ステージ6 クリアで開く（`unlocked()` は `need` が あれば そこを見る）。
  - `kind:'bug'` むしとり：`bug`（`'RR3(RD)'` 形式。`parseProg()`）の まちがいを1つ なおす。ブロックを タップ → やじるしで おきかえ、🔁 の かずも かえられる。⭐3＝1かい、2かい＝⭐2（`changes()`）。
  - `kind:'paint'` いろぬり：`p`（`P` は スタート兼）を 🖌 ぬる（ブロック `{t:'P'}`）で ぬる。おてほんと ぴったり同じで クリア（よけいに ぬると しっぱい）。`color`・`name`。
  - `kind:'key'` かぎと とびら：`k` かぎ・`D` とびら（かぎ1つで1つ あく）・`o` スイッチ・`=` はし（スイッチで かかる）・`~` みず。
  - うごきは `simulate()`（`move1()`）で 先に ぜんぶ けいさんし、`run()` が じゅんに みせる。`shortest()` は これらも ふくめて loop なしの par を 自動計算。
- iPad 横向き（横長で幅700px以上）は 2列：左に ばめん、右に プログラム・やじるし・じっこう。
- クリアの★（1〜3）は `piko-prog-v1` の `best`。初めて取った★1つにつき `settings.progPts`（既定3）の共通ポイント。

### ロボモコの ブロックタウン（`program/build/`）
- 3D のブロック置き（Three.js r160.1 を `js/vendor/` に同梱、ES Modules）。core.js は使わない。まだどこからもリンクしていない。
- 世界のデータ（`js/world/world.js`）と描画（`js/render/`）を分けている。将来のロボット命令は `World` の `place`/`remove`/`batch` を使う。
- 「つくる」（手で置く）と「ロボット」（命令を並べてロボモコが建てる）の2モードで同じ世界を使う。ロボットの命令は `program/` と同じ形（`{t:'R'}`、`{t:'loop',n,body}`）＋ `put`/`break`/`wait`。
- 保存は `robomoko-build-v1`。共通ポイントはまだ出さない。詳細は `program/build/README.md`。テスト用の入口は `window.__build`。

### モコの まち（`machi/`）
- 2Dの見下ろしの まちづくり（Canvas 2D、ES Modules）。core.js を読み、⭐（`S.points`）・キャラ（`S.owned`）・着せかえ（`S.equip`・`S.looks`）を共通で使う。
- 入口は おへやの ドア（`index.html` の `.todoor`）、出口は まちの モコの おうち／「おへや」ボタン。
- まちの おみせ は まち専用のカタログ（`machi/js/data/parts.js`）。おへやの `ITEMS` には入れない。買うと `moko-town-v1` の `unlockedParts` に入り、⭐ は `S.points` から引く。
- 家にキャラを住ませると まちを歩く。詳細は `machi/README.md`。テスト用の入口は `window.__town`。

## 星（共通ポイント）
- `S.points`。さんすう・こくごの正解、ボーナス、テスト練習、プログラミングの★、ABCぼうけんの★（×`abcPts`）、ログインボーナスで増える。
- 使い道：おみせ（`price`）、ガチャ、まちの おみせ（`machi/`）。⚙️設定で各ポイント量を調整可能。

## おみせ・きせかえ
- `ITEMS` の `cat`：`char` `outfit` `hat` `acc` `wall` `floor` `furn`。
  - `price>0`：おみせで買える（`special:true` は高額のスペシャル）
  - `test:'…'`：テスト合格でもらえる（買えない）
  - `gacha:'sr'|'n'`：ガチャ限定（買えない）
  - `dream:true`：🌈 ゆめの ごほうび（⭐1000以上の高額品。おみせの ✨スペシャルの いちばん上に価格順）
  - `secret:N`：🔒 ひみつの なかま（買えない）。🏆テストの合格数（`passCount()`＝`S.tests` の `pass` の数。練習は含まない）が N 以上になると、おうちに戻ったとき `secretCheck()` が持ち物に入れて紹介する（1つずつ、きょうの もくひょう より先）。おみせでは まだのものをシルエットで表示
- キャラ・服などの絵はオリジナル（既存の作品のキャラクターをまねしない）
- 持ち物は `S.owned`、装備は `S.equip[cat]`、部屋に置いた家具は `S.furn`。家具の位置は種類ごとに固定（`roomSVG` の描画順で重なりを決める。家具を足したら `roomSVG` にも追加）。
- キャラは体の形が共通なので、どのキャラにも服・帽子・小物が付く。

## きょうの もくひょう
- おうちの「おへや」に表示（`goalsCard()`）。目標は core.js の `goals()`：さんすう🏆テスト2回・こくご🏆テスト2回・えいご（ABCぼうけん未クリアなら ぼうけんで★2こ、クリア後は えいご🏆テスト2回）・プログラミング1ステージクリア。
- 数え方：各部屋の `finishTest`（テスト形式の練習は ⚙️設定の `pracGoal` がオンのときだけ数える。既定オフ）で `dailyOf(S).sansu++` など。プログラミングは `houseDaily()`、ABC は `house.js` の `sendStars()` が おうちのデータの `daily` を直接増やす。
- ごほうび：おうちに戻ったとき `goalsCheck()` が達成済み・未受け取りの目標に ⭐`goalPts`（既定10）、全部達成で さらに ⭐`goalAll`（既定50）。`daily.got`・`daily.all` で1回だけ。

## きょうの おすすめ・がんばり カレンダー（`index.html`）
- `learnLoad()`：学習記録（`LH`）を読み、この30日で10問以上・初回正答率70%未満の単元から1つを「🌟 おすすめ」に（`S.daily.rec`。決まったらその日は同じ）。今日その単元で解いた問題数（出題数）が5で ⭐`goalPts`（`daily.got.rec`）。リンクは `#start=種類` で練習が始まる。
- 連続日数は学習記録の日付から数える。3日 ⭐20／7日「がんばりの はなかんむり」／14日 ⭐50／30日「がんばりの おおきな トロフィー」（`S.streakGot` に もらった日数。1回だけ）。

## ガチャ
- `S.settings.gachaCost`（既定100）で1回。10% で ちょうレア（`GACHA_SR` 12種）、それ以外は ふつう（`GACHA_N` 20種）から等確率。
- 持っているものが出たら ⭐10 返却。`gachaDaily`（0＝無制限）で1日の回数制限、`gachaOn` でオン/オフ。回数は `S.gacha`（`day`,`count`,`pulls`）。

## Service Worker（`sw.js`）
- HTML/JS/CSS/JSON はネット優先（オンラインなら常に最新）→ 失敗時は自分のキャッシュ。画像・フォントはキャッシュ優先。
- 取得は `cache:'no-cache'` でブラウザの一時保存を使わない。`activate` で自分以外のキャッシュを削除。

## 管理者モード（⚙️設定）
- オンで ぜんぶ アンロック：`S.owned` を ITEMS 全部にし、元の持ち物を `S.adminBackup` に保存。`testUnlocked` は全レベル true。
- プログラミング：`program/index.html` の `unlocked()` が `moko-math-v1` の `settings.admin` を見る。まち：`town.js` の `usable`・`hasPart` が `ADMIN()` を見る（まちの保存データは変えない）。
- オンの間に もらう ごほうびは `grantItem(id)` で渡す（`adminBackup` にも入るので、オフにしても残る）。新しく ごほうびを渡すコードを書くときも `grantItem` を使う。
- オフ：`owned` を `adminBackup`＋初期の持ち物に戻し、持っていない きせかえ・かぐ・looks を外す。⭐ は変えない。

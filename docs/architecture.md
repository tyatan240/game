# 構成と仕組み

## 全体
- 1つのホーム画面アプリ（`manifest.json` の scope は `/game/`）。トップ＝おうち、各部屋はフォルダ。
- `index.html`・`sansu/`・`kokugo/` は `common/core.js`（classic script、グローバル定義）と `common/style.css` を読み込む。
- `program/` は core.js を読まない独自コード（グローバル名 `S`・`$`・`save` などが core.js と衝突するため）。共通ポイントだけ `moko-math-v1` を直接読み書きする。
- `abc/` は ES Modules の独立モジュール。core.js は使わず、★だけ `abc/js/game/house.js` が `moko-math-v1` の `points` に届ける（詳細は `abc/README.md`）。入口は おうちの「おべんきょう」、出口は ABC のタイトルとメニューの「おうちへ」。

## common/core.js の主な定義
| 種類 | 名前 |
|---|---|
| 問題の種類 | `TYPES`/`TYPE`（さんすう：add1, add21, add22, sub1, sub21, sub22。`gen()` で出題）、`KTYPES`/`KTYPE`（こくご：k1yomi, k1kaki, k2yomi, k2kaki, kotoba, yomi） |
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
- 🏆テスト：種類×3段階。制限時間＝問題数×`TBASE[種類]`×段階倍率×`testScale`。間違えるとやり直しなし。合格で限定アイテム（`ITEMS` の `test:'種類-段階'`）。前の段階に合格すると次が開く。練習モードはポイント×`practiceMul`、合格ライン到達で `practiceBonus`。
- こくごの問題データは `kokugo/index.html` 内の `K1`・`K2`（漢字語 [漢字,よみ]）、`KOTOBA`（[問題,正解,誤答…]）、`STORIES`（よみとり）。`makeQ(種類)` が4択を作る。

### えいご（`eigo/`）
- 最初の画面で「ぼうけんに いく」（`abc/`）か「べんきょう する」を選ぶ。べんきょうは さんすう・こくごと同じ（練習＋🏆テスト、限定アイテム）。
- 問題の種類は core.js の `ETYPES`（もじを きいて えらぶ／もじの よみかた／ことばを きいて えらぶ／えを みて えいご）。問題は ABCぼうけんで覚えた文字・単語（`abc-adventure-v1` の `learned`・`words`）から、苦手優先で出す。3つ以上覚えた種類だけ遊べる。
- ページの処理は `<script type="module">`（abc の `letters.js`・`words.js`・`art.js`・`audio.js`・`learning.js` を import）。core.js のグローバル（`S`・`ACT` など）もそのまま使う。
- 結果は ABCぼうけんの学習記録（`records`）にも書く（records 以外は触らない）。テスト用の入口は `window.__eigo`。

### プログラミング（`program/`）
- 12ステージ（`LEVELS`：`#`壁 `S`スタート `G`ゴール `*`星。`loop:true` で「くりかえし」ブロック解禁）。
- クリアの★（1〜3）は `piko-prog-v1` の `best`。初めて取った★1つにつき `settings.progPts`（既定3）の共通ポイント。

## 星（共通ポイント）
- `S.points`。さんすう・こくごの正解、ボーナス、テスト練習、プログラミングの★、ABCぼうけんの★（×`abcPts`）、ログインボーナスで増える。
- 使い道：おみせ（`price`）、ガチャ。⚙️設定で各ポイント量を調整可能。

## おみせ・きせかえ
- `ITEMS` の `cat`：`char` `outfit` `hat` `acc` `wall` `floor` `furn`。
  - `price>0`：おみせで買える（`special:true` は高額のスペシャル）
  - `test:'…'`：テスト合格でもらえる（買えない）
  - `gacha:'sr'|'n'`：ガチャ限定（買えない）
- 持ち物は `S.owned`、装備は `S.equip[cat]`、部屋に置いた家具は `S.furn`。家具の位置は種類ごとに固定（`roomSVG` の描画順で重なりを決める。家具を足したら `roomSVG` にも追加）。
- キャラは体の形が共通なので、どのキャラにも服・帽子・小物が付く。

## ガチャ
- `S.settings.gachaCost`（既定100）で1回。10% で ちょうレア（`GACHA_SR` 12種）、それ以外は ふつう（`GACHA_N` 20種）から等確率。
- 持っているものが出たら ⭐10 返却。`gachaDaily`（0＝無制限）で1日の回数制限、`gachaOn` でオン/オフ。回数は `S.gacha`（`day`,`count`,`pulls`）。

## Service Worker（`sw.js`）
- HTML/JS/CSS/JSON はネット優先（オンラインなら常に最新）→ 失敗時は自分のキャッシュ。画像・フォントはキャッシュ優先。
- 取得は `cache:'no-cache'` でブラウザの一時保存を使わない。`activate` で自分以外のキャッシュを削除。

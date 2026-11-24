# CLAUDE.md

小学1〜2年生向け学習アプリ「モコの おべんきょうハウス」。ビルドなしの静的サイト（HTML/CSS/JS のみ、外部ライブラリなし。例外：`program/build/` だけ Three.js を同梱）。
公開URL：`https://tyatan240.github.io/game/`（iPad の Safari で「ホーム画面に追加」して使われている）。

**まずこのファイルと `docs/` を読む。必要がなければリポジトリ全体を再調査しない。**

## ディレクトリ
```
index.html      おうち（トップ）：おへや（🎯きょうの もくひょう、ドア→まち）・おべんきょう入口・ガチャ・おみせ・きせかえ・⚙️設定
sansu/          さんすう：たし算・ひき算・九九・時計の問題＋🏆テスト
kokugo/         こくご：漢字よみかき・ことば・よみとり・かたかな・ぶんの しくみ＋🏆テスト
program/        プログラミング：ブロックでロボットを動かすパズル（ならべる・くりかえし・むしとり・いろぬり・かぎと とびら。独自コード）
program/build/  ロボモコの ブロックタウン：3Dでブロックを置く町づくり（ES Modules＋Three.js。プログラミングの部屋から入る。program/build/README.md）
machi/          モコの まち：2Dの まちづくり（ES Modules＋core.js。まちの おみせ は おへやの おみせと別。machi/README.md）
eigo/           えいご：「ぼうけん（abc/）」か「べんきょう（練習＋🏆テスト・きょうの ふくしゅう）」を選ぶ部屋。ワールド3・はじめの おと の問題も。core.js ＋ abc のデータ・絵・音声を module で使う
dungeon/        モコの イングリッシュダンジョン：英語の名前の ターン制ダンジョン（ES Modules＋core.js。おべんきょうの カードから入る。dungeon/README.md）
abc/            ABCぼうけん：英語の2Dアドベンチャー（独立モジュール、ES Modules。eigo/ の「ぼうけん」から入る）
parent/         保護者向け 学習レポート（かけ算の確認 → ダッシュボード。docs/learning-report.md）
common/learning-history.js 学習履歴の記録API（IndexedDB moko-learning-history）
common/core.js  共通：保存・ポイント・アイテム定義・キャラ/部屋のSVG・音・ポップアップ
common/hanamaru.js はなまるスタンプ（パパ・ママから おてがみ・はなまるノート。index.html で使う。docs/daily-fun-spec.md）
common/pet.js   モコの ペット（たまご → そだてる。index.html で使う。docs/daily-fun-spec.md）
common/book.js  まいにち 1ページの えほん（もくひょう 1つで 1ページ・ほんだな・よみあげ。index.html で使う）
common/style.css 共通の見た目
sw.js           Service Worker（全部屋のオフライン用）。sansu/sw.js・program/sw.js は旧版の片付け専用
manifest.json   ホーム画面アプリ設定（1つだけ）
tests/smoke.js  自動の動作確認
docs/           詳細仕様（下記）
```

## 詳細ドキュメント
- `docs/architecture.md` … 各ゲームの構成、core.js の主な関数、星・ガチャ・きせかえの仕組み
- `docs/save-data.md` … セーブデータの形式と互換ルール
- `docs/dev-guide.md` … 実行・テスト・公開・新しいゲームの追加手順
- `abc/README.md` … ABCぼうけんの構成・学習記録・データの足し方
- `machi/README.md` … モコの まち：構成・保存・まちの おみせ・じゅうにん
- `program/build/README.md` … ブロックタウンの構成・データ・保存・フェーズ2（ロボット）への準備
- `docs/learning-report.md` … 保護者向け学習レポート：学習履歴の形式・指標の計算・保護者確認・バックアップ
- `docs/abc-world3-spec.md` … ABCぼうけん ワールド3「ことばの まち」の仕様・決定事項（実装済み）
- `docs/dungeon-spec.md` … モコのイングリッシュダンジョン（英語ローグライク）の仕様 v0.8（第1〜3回 実装済み）
- `docs/treasure-dungeon-spec.md` … モコの たからさがしダンジョン（英語ダンジョン20階クリア後のカード集め）の仕様 v0.5（第1〜3段階 実装済み）
- `docs/daily-fun-spec.md` … まいにち あそびたくなる しくみ（ペット・パパママの はなまるスタンプ・まいにち えほん）の仕様 v0.5（①ペット・②はなまるスタンプ・③えほん 実装済み）
- `docs/abc-kotoba-mahou-spec.md` … ABCぼうけん「ことばの まほう」＋「くみあわせ」の仕様・決定事項・実装メモ（実装済み）

## 実行・テスト
- ローカル実行：`python3 -m http.server 8000` → `http://localhost:8000/`（`file://` では部屋間のリンクが動かない）
- 自動テスト：`node tests/smoke.js`（Playwright/Chromium。全ページ表示・ポイント共通化・ガチャ・旧データ読込・ABC）。**変更したら必ず実行**
- 実機確認（マージ前）：`https://raw.githack.com/tyatan240/game/<コミットSHA>/index.html`

## 公開
`main` にマージすると GitHub Pages（main / root）が数分で反映。作業はブランチ → PR → ユーザーがマージ。

## ⚠️ 守ること（子どものデータを壊さない）
1. 保存キーを変えない：`moko-math-v1`（localStorage と IndexedDB `moko-house`/`kv` の両方）、`piko-prog-v1`、`abc-adventure-v1`、`robomoko-build-v1`（localStorage と IndexedDB `robomoko-build`/`kv`）、`moko-town-v1`（localStorage と IndexedDB `moko-town`/`kv`）、`moko-dungeon-v1`（localStorage と IndexedDB `moko-dungeon`/`kv`）、IndexedDB `moko-learning-history`（学習履歴）
2. データの形は追加のみ。新項目は `defState()` に初期値＋`merge()` で補う。項目名の変更・削除をしない
3. `ITEMS` の `id` を変えない・消さない（未知の id は持ち物から外れる）
4. 公開URL・リポジトリ名・Pages 設定を変えない。データを消す処理を足さない（リセットは ⚙️設定のみ）
5. 保存は必ず `save()` 経由（localStorage と IndexedDB に二重保存）
6. ページ/JS/CSS を変えたら `sw.js` の `CACHE` の数字を上げる
7. 部屋間リンクは `xxx/index.html` まで書く。どの部屋も `../index.html` でおうちに戻れるようにする
8. 画面の文字はひらがな中心（子ども向け）。漢字は保護者向けの部分だけ
9. 絵は SVG/Canvas でコードに描く（絵文字や外部素材を素材にしない）

## 新しいゲームを足すとき（概要）
新フォルダに独立して作り、既存ファイルの変更は「入口リンク」「sw.js の ASSETS と CACHE」だけにする。
星を共通化する場合は `moko-math-v1` の `points` に加算するだけ（形は変えない）。詳細は `docs/dev-guide.md`。

## 未対応・メモ
- ABCぼうけん：おうちと接続済み（入口・「おうちへ」・★→おうちの ⭐。`abc/js/game/house.js`、⚙️設定の `abcPts`）。manifest の向きは `any`。ABC のファイルを増やしたら `sw.js` の ASSETS にも足す
- ABCぼうけん：ワールド1 は A〜Z（5エリア・クエスト11・組み合わせ11）、ワールド2「こもじの もり」は a〜z（せんせい5にん・こもじの もん）まで実装済み。ワールド3「ことばの まち」は5エリア（あいさつ・かず・いろと かたち・すきなもの・ことばの とう）まで実装済み（docs/abc-world3-spec.md）。単語・組み合わせ・クエスト・エリアはデータ追加で増やせる（`abc/README.md`）
- ブロックタウン（`program/build/`）：フェーズ1〜3（手で作る・ロボットに おねがい・おだい5ステージ）。プログラミングの部屋のカードから入る。おだいの ⭐ は `moko-math-v1` の points に足す
- モコの まち（`machi/`）：設計書のフェーズ1〜5（まちづくり・まちの おみせ・じゅうにん・まちレベル・とち（⭐で かう）・おねがい・家の みため／じぶんで つくる おうち／おきにいり）と おうちの なか（おへやの かぐ）、1マスずつ つくる（かべ・ゆか・ベッド）まで
- まちの パーツは `machi/js/data/parts.js`（おへやの `ITEMS` に入れない）
- 学習レポート：問題を足したら、正誤が決まったところで `LH.recordAttempt()`（各ページの `lhRec`）を呼ぶ。記録の失敗で勉強を止めない
- イングリッシュダンジョン（`dungeon/`）：第2回まで（チュートリアル・1〜20階・ボス4体・敵14（かたい敵は魔法で）・魔法15（なかま×★）・装備12・持ち物の ふくろ（ぶき・たて・よろい・たべもの・ほん/どうぐ）・魔法は ねらいを見せてから使う・5階ごとの復習テスト→学習履歴 eigo/dungeon・2語の名前の敵・英語だけのヒント（じゅうたんの色と かんばん・weak:）・20階クリアで きせかえ `a_dcape`）。dungeon/README.md
- たからさがしダンジョン（`dungeon/` の たからさがしモード）：第3段階まで（カード78まい・宝箱/床/ボス/かくし部屋/かくしボスから カード・めくる演出・アルバム・もじバッジ・かけらの カードガチャ・「しらべる」→ とびらのクイズ／えいごだけのヒント／もじあつめ→学習履歴 eigo/treasure・わな・コンプリートで きせかえ `h_treasure`）。保存は `moko-dungeon-v1` の `treasure`（docs/treasure-dungeon-spec.md）
- 管理者モード（⚙️設定）：オンで ぜんぶ アンロック（`ADMIN()`、元の持ち物は `adminBackup`）。ごほうびを渡すときは `grantItem(id)` を使う（docs/architecture.md）
- iPad でホーム画面アプリが別スコープになる問題があったため、アイコンは必ずトップ（`/game/`）から追加してもらう

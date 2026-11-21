# CLAUDE.md

小学1〜2年生向け学習アプリ「モコの おべんきょうハウス」。ビルドなしの静的サイト（HTML/CSS/JS のみ、外部ライブラリなし）。
公開URL：`https://tyatan240.github.io/game/`（iPad の Safari で「ホーム画面に追加」して使われている）。

**まずこのファイルと `docs/` を読む。必要がなければリポジトリ全体を再調査しない。**

## ディレクトリ
```
index.html      おうち（トップ）：おへや・おべんきょう入口・ガチャ・おみせ・きせかえ・⚙️設定
sansu/          さんすう：たし算ひき算の問題＋🏆テスト
kokugo/         こくご：漢字よみかき・ことば・よみとり＋🏆テスト
program/        プログラミング：ブロックでロボットを動かすパズル（独自コード）
abc/            ABCぼうけん：英語の2Dアドベンチャー（独立モジュール、ES Modules）
common/core.js  共通：保存・ポイント・アイテム定義・キャラ/部屋のSVG・音・ポップアップ
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
- `docs/abc-kotoba-mahou-spec.md` … ABCぼうけん「ことばの まほう」＋「くみあわせ」の仕様・決定事項・実装メモ（実装済み）

## 実行・テスト
- ローカル実行：`python3 -m http.server 8000` → `http://localhost:8000/`（`file://` では部屋間のリンクが動かない）
- 自動テスト：`node tests/smoke.js`（Playwright/Chromium。全ページ表示・ポイント共通化・ガチャ・旧データ読込・ABC）。**変更したら必ず実行**
- 実機確認（マージ前）：`https://raw.githack.com/tyatan240/game/<コミットSHA>/index.html`

## 公開
`main` にマージすると GitHub Pages（main / root）が数分で反映。作業はブランチ → PR → ユーザーがマージ。

## ⚠️ 守ること（子どものデータを壊さない）
1. 保存キーを変えない：`moko-math-v1`（localStorage と IndexedDB `moko-house`/`kv` の両方）、`piko-prog-v1`、`abc-adventure-v1`
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
- ABCぼうけん：おうちからの入口・星の共通化（最終的に おべんきょうハウスへ移す方針、今は繋げない）・manifest の向き（今は portrait 固定）・`sw.js` の ASSETS 追加と SW 登録は未実装
- ABCぼうけん：単語・組み合わせ・クエストはデータ追加だけで増やせる（`abc/README.md`）。HONEY クエストはデータの入れ物のみ
- iPad でホーム画面アプリが別スコープになる問題があったため、アイコンは必ずトップ（`/game/`）から追加してもらう

# CLAUDE.md

子ども（小学1〜2年）向けの学習アプリ「モコの おべんきょうハウス」。ビルドなしの静的サイトで、GitHub Pages（`https://tyatan240.github.io/game/`）で公開している。iPad の Safari でホーム画面に追加して使われている。

## 構成
- `index.html`：おうち（おへや・おべんきょう・ガチャ・おみせ・きせかえ・⚙️設定）
- `sansu/`・`kokugo/`・`program/`：各部屋。`common/core.js` と `common/style.css` を共有（`program/` だけは独自コードで、ポイントの読み書きのみ共有データを使う）
- `common/core.js`：保存データ（`defState`/`merge`/`save`）、アイテム（`ITEMS`）、キャラ・部屋の SVG、音、ポップアップ
- `sw.js`：ルートの Service Worker（全部屋ぶん）。`sansu/sw.js`・`program/sw.js` は古い版を片付けるためだけのファイルなので消さない
- 画面の文字はひらがな中心（子ども向け）。漢字を使うのは保護者向けの部分だけ

## ⚠️ 保存データを壊さないこと（最重要）
子どもがためたポイント・持ち物が更新で消えると、取り返しがつかない。次を必ず守る。

1. 保存場所の名前を変えない：`localStorage` の `moko-math-v1`、IndexedDB `moko-house`/`kv`（キー `moko-math-v1`）、`piko-prog-v1`
2. データの形は追加のみ。既存の項目名を変えない・消さない。新しい項目は `defState()` に初期値を足し、`merge()` で古いデータにも補う
3. `ITEMS` の `id` を変えない・消さない（`merge()` は知らない id を持ち物から外す）
4. 公開URL（リポジトリ名・Pages 設定）を変えない
5. データを消す処理を追加しない（消すのは ⚙️設定の「データを リセット」だけ）
6. 保存は `save()` を通す（localStorage と IndexedDB の両方に書く。開いたときは新しいほうを使う）
7. ページやスクリプトを変えたら `sw.js` の `CACHE` の数字を上げる
8. 部屋どうしのリンクは `xxx/index.html` まで書く（フォルダの一覧ページがないサーバーでも動くように）

変更後は、古いデータ（`defState()` より項目が少ないもの）を `localStorage` に入れて開き、ポイントと持ち物が残ることを確かめる。

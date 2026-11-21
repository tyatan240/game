# 開発ガイド

## 実行
```bash
python3 -m http.server 8000
```
`http://localhost:8000/` を開く。`file://` で直接開くと、部屋間のリンクや ES Modules（abc）が動かない。

## テスト
```bash
node tests/smoke.js
```
- Playwright（Chromium）で自動確認：全ページがエラーなく開く／さんすう・こくご・プログラミングで共通ポイントが増え、おうちの表示と一致／ガチャ／旧形式セーブデータの読込／ABCぼうけんの移動とクイズ。
- Playwright がない環境：`npm i -D playwright && npx playwright install chromium`。
- 手で確認するとき：iPad の横・縦、スマホ（約 390×844 と 844×390）。ポップアップで画面がふさがらないか、ボタンが押せるか。
- テスト用の入口：おうち・さんすう・こくごはグローバル（`S`、`go()`、`quiz`、`test` など）を `page.evaluate` で操作できる。ABC は `window.__abc`（`S`、`hero`、`tp(x,y,dir)`）と、出題中の `window.__abcQ`。
- 英語の音声（音声合成）はヘッドレスでは確認できない。実機で確認する。

## 公開（GitHub Pages）
- Settings → Pages：Branch `main` / `/(root)`。`main` にマージすると数分で `https://tyatan240.github.io/game/` に反映。
- マージ前の実機確認：`https://raw.githack.com/tyatan240/game/<コミットSHA>/index.html`（URLが本番と別なのでデータも別）。
- 反映されないとき：GitHub Pages のキャッシュで最大10分程度。iPad のホーム画面アプリは上スワイプで終了してから開き直す。

## 作業の流れ
1. 指定の作業ブランチで変更 → コミット → push → PR 作成（ユーザーが GitHub でマージ）。
2. ページ/JS/CSS を変えたら `sw.js` の `CACHE` を上げる。
3. `node tests/smoke.js` が通ることを確認。
4. 見た目を変えたら Playwright でスクリーンショットを撮って確認（スマホ縦横・iPad）。

## 新しいゲーム（部屋）を足す手順
1. 新フォルダ（例 `eigo/`）に独立して作る。既存のファイルは原則変更しない。
   - おうちと同じ見た目・ポイントを使うなら `kokugo/index.html` をひな形にし、`../common/core.js`・`../common/style.css` を読み込む。
   - 独自のゲーム（Canvas など）なら core.js を読まず、グローバル名の衝突を避ける（ES Modules 推奨。`abc/` が見本）。
2. ページの `<head>` に `../manifest.json`・`../icon-180.png` を指定し、`navigator.serviceWorker.register('../sw.js')` を使う（部屋ごとの manifest/sw は作らない：ホーム画面アプリのスコープが分かれて保存データが別になるため）。
3. おうちに戻るリンク `../index.html` を必ず置く。
4. 保存は独自キー（例 `eigo-v1`）。共通ポイントに足す場合は `docs/save-data.md` の方法で `points` だけを加算。
5. 入口：`index.html` の `study()` にカードを追加。
6. オフライン：`sw.js` の `ASSETS` に新しいファイルを追加し、`CACHE` を上げる。
7. `tests/smoke.js` に新ページを追加して実行。
8. 問題データは別ファイル（または1か所の配列）にまとめ、追加・編集しやすくする。

## よくある落とし穴
- 部屋ごとに manifest を置く → iPad でその部屋だけが「アプリ」になり、おうちが Safari 側で開いてデータが別になる（過去に発生）。
- `merge()` を通さずに `S` を差し替える → 項目が欠けたデータが保存される。
- 家具を `ITEMS` に足して `roomSVG` の描画順に足し忘れる → 部屋に表示されない。
- `manifest.json` の `orientation` は `portrait`。横向き前提のゲームを入口から開く場合は `any` への変更を検討（ユーザーに確認）。

# ロボモコの ブロックタウン（`program/build/`）

ブロックを置いて町や家を作る 3D ゲーム。いまは **フェーズ1（自分の手で作る）**。
フェーズ2 で「ロボモコにプログラムで作らせる」をつなげる予定。おうち・プログラミングの部屋からはまだリンクしていない（直接 `program/build/index.html` を開く）。

## 構成
```
index.html / style.css        画面（パレット・ボタン・ダイアログ）
js/main.js                    操作（タップ・ドラッグ・ピンチ・ボタン・キー）、保存のタイミング、テスト用 window.__build
js/data/blocks.js             ブロックの種類（データのみ。1行足すと増える）
js/world/world.js             世界のデータ（描画とは別）。整数座標・置く/消す・もどす/やりなおす・batch
js/world/storage.js           保存（localStorage ＋ IndexedDB）
js/render/scene.js            Three.js の描画（斜め上からの正投影カメラ、InstancedMesh、レイキャスト、プレビュー）
js/render/textures.js         ブロックの面の模様（Canvas に描く）
js/render/icons.js            パレットの絵（Canvas 2D）
js/vendor/three.module.min.js Three.js r160.1（MIT。LICENSE-three.txt）。CDN を使わずリポジトリに同梱（オフライン用）
```

## 世界のデータ
- 大きさ 16×12×16（x, y, z。y が上）。セルは `"x,y,z"` → `{ id, r }`（`r` は向き 0〜3、やね・ドアで使う）。
- `canPlace(x,y,z,id)` → `{ok, reason}`。reason：`out`（範囲外）/`full`（もうある）/`top`（はなの上）/`id`（知らないブロック）。
- `place` / `remove` は 1回ずつ「もどす」に記録（最大200回）。`batch(fn)` の中の操作は 1回の「もどす」にまとまる（ロボットのプログラム1回分などに使う）。
- 「はじめから」も batch なので、すぐ後なら「もどす」で戻せる。

## 保存（`robomoko-build-v1`）
localStorage と IndexedDB（DB `robomoko-build`、ストア `kv`）に二重保存し、`t` が新しいほうを読む。
```js
{ v:1, t:最終保存時刻, world:{ size:[16,12,16], blocks:[[x,y,z,id], [x,y,z,id,r], …] },
  cam:{az,el,zoom}, sel:'えらんだブロック', rot:向き, seenHelp:true }
```
- 項目は追加のみ。ブロックの `id` は変えない・消さない（知らない id は読み込んでも描かれないだけで、データには残る）。
- 他のゲームのデータ（`moko-math-v1` など）には触らない。

## ブロックを増やす
`js/data/blocks.js` に1行足す。`shape` は `cube`・`glass`・`roof`・`door`・`flower`。面の色 `top`/`side`/`bottom` と模様 `pattern`（`speck` `grassSide` `plank` `stone` `brick` `glass` `tile` `door`）。
新しい形が要るときは `render/scene.js` の `makeParts()` と `render/icons.js` に足す。ファイルを増やしたら `sw.js` の `ASSETS` に追加して `CACHE` を上げる。

## 操作
- タッチ：ブロックを選ぶ → 場所をタップ（半透明の影。置けない所は赤）→ 同じ所をもう一度タップか「ここに おく」。
- マウス：動かすと影、クリックで置く。右ドラッグで移動、ホイールでズーム。
- 1本指ドラッグ：回す（上下で角度）。2本指：ピンチでズーム・移動。右のボタン：90°回転・ズーム・カメラを戻す。
- 「けす」モード：消すブロックが赤くなる。もう一度タップか「ここを けす」。
- キー：1〜9 選ぶ、R 向き、X おく/けす、Q/E 回転、+/- ズーム、Ctrl+Z / Ctrl+Y。

## フェーズ2 に向けて（ロボット）
- 命令（おく・こわす・えらぶ・うえにおく・まつ・くりかえし）は `World` の `place`/`remove`/`canPlace` をそのまま使えばよい。プログラム1回の実行は `world.batch()` で囲むと「もどす」1回で戻せる。
- 1手ずつ見せる場合は batch を使わずに少しずつ `place` し、描画は `world.onChange` で自動更新される。
- プログラミングの部屋（`program/index.html`）のブロック形式（`{t:'R'}`、`{t:'loop',n,body:[]}`）を参考にする。

## おうちにつなぐとき
1. 入口：`program/index.html`（またはおうちの `study()`）に `build/index.html` へのリンクを足す。
2. 「もどる」は今 `../index.html`（プログラミングの部屋）。
3. 星を出すなら `docs/save-data.md` の方法で `moko-math-v1` の `points` だけ加算する。

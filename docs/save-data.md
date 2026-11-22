# セーブデータ

すべて端末内（ブラウザ）に保存。サーバーはない。データは「サイトのURL（オリジン）ごと」「iPad ではホーム画面アプリと Safari タブで別」。

## 保存場所
| キー | 場所 | 中身 | 書く場所 |
|---|---|---|---|
| `moko-math-v1` | localStorage ＋ IndexedDB（DB `moko-house`、ストア `kv`、キー `moko-math-v1`） | おうち共通の状態（下記） | `common/core.js` の `save()`、`program/` の `houseAdd()` |
| `piko-prog-v1` | localStorage | プログラミングの進み具合 `{best:{ステージ番号:★数}}` | `program/` |
| `robomoko-build-v1` | localStorage ＋ IndexedDB（DB `robomoko-build`、ストア `kv`） | ブロックタウンの世界・カメラ・選んだブロック・ロボットとプログラム（`program/build/README.md`） | `program/build/` |
| `moko-town-v1` | localStorage ＋ IndexedDB（DB `moko-town`、ストア `kv`） | モコの まち：たてもの・じめん・買ったパーツ・すむひと・カメラ（`machi/README.md`） | `machi/` |
| `moko-learning-history` | IndexedDB（ストア `attempts`・`sessions`・`metadata`） | 保護者向け学習レポートの回答履歴（`docs/learning-report.md`）。ゲームのデータとは別。「データの ひきつぎ」コードには含まれない | `common/learning-history.js` |
| `abc-adventure-v1` | localStorage | ABCぼうけんの進行・学習記録（`abc/js/game/state.js`）。`stars`＝ABCで集めた★の合計、`starsSent`＝おうちに届け終わった★ | `abc/` |

## `moko-math-v1` の形
```js
{
  v:1, t:最終保存時刻(ms),
  points: 星（共通ポイント）,
  owned: [持っているアイテムid…], equip:{char,outfit,hat,acc,wall,floor}, furn:[置いている家具id…],
  settings:{
    types:{add1:{on,pts},…}, ktypes:{k1yomi:{on,pts},…}, etypes:{ealisten:{on,pts},…},
    perRound, perfect, daily, sound, testScale, practiceMul, practiceBonus,
    progPts, gachaOn, gachaCost, gachaDaily, abcPts, goalPts, goalAll
  },
  lastDay:'YYYY-M-D'（ログインボーナス）,
  stats:{q,ok}（さんすう）, kstats:{q,ok}（こくご）, estats:{q,ok}（えいご）,
  tests:{'add1-1':{pass,best}, 'k1yomi-2':{…}, …},
  gacha:{day,count,pulls},
  daily:{day,sansu,kokugo,eigo,abc,prog,got:{sansu,kokugo,eigo,prog},all}（きょうの もくひょう。day が変わるとリセット）,
  streakGot:[3,7,…]（がんばり カレンダーで もらった れんぞく日数）, daily.rec:{s:教科,t:単元}（きょうの おすすめ）,
  hw:{mob_pig:じこく,…}（まちの モブじゅうにんの しゅくだいを おえた じこく。core.js の hwDone()、program/ の houseWrite）,
  looks:{キャラid:{outfit,hat,acc}}（キャラごとに おぼえている きせかえ。core.js の equipItem() で更新。キャラを変えると前のキャラの服を保存し、次のキャラの服に着がえる）
}
```

## 読み込みと保存のしくみ
- 読込：`merge(defState(), 保存データ)`。足りない項目は初期値で補い、知らないアイテム id は捨てる。
- IndexedDB との二重化：起動時に両方を見て `t` が新しいほうを採用（localStorage が空なら IndexedDB を採用）。`pagehide`・`visibilitychange` でも保存。iOS Safari で localStorage の書き込みが遅れて消える対策。
- 他の部屋で増えたポイントは、ページ読込時と `pageshow`（戻る）・`storage` イベントで取り込む（`resync()`、`t` が新しい場合のみ）。
- バックアップ：⚙️設定 →「データの ひきつぎ」。`S` を JSON → Base64 にしたコード。読込は `merge()` を通す。
- まるごと バックアップ：⚙️設定 →「まるごと バックアップ（ファイル）」。`{format:'moko-house-backup', version:1, savedAt, data:{moko-math-v1, piko-prog-v1, abc-adventure-v1, robomoko-build-v1, moko-town-v1}, history:学習記録}` の JSON ファイル。
  復元は 中身を確認してから、ファイルにある部屋のデータを それぞれの保存キーに書き戻す（おうちは `merge()`＋`save()`、ほかは `t` を今にして localStorage と IndexedDB へ）。学習記録は今の記録に足す（同じIDは足さない）。

## 互換ルール（変更時に必ず守る）
1. キー名・DB名を変えない。
2. 項目は追加のみ。新項目は `defState()` に初期値を入れ、`merge()` で古いデータにも補う。名前変更・削除・意味の変更はしない。
3. `ITEMS` の id を変えない・消さない。
4. 変更後は旧形式データで確認する（`node tests/smoke.js` の「ふるい セーブデータ」テスト）。

## 他のゲームから星を足す方法
core.js を読める部屋は `S.points += n; save();`。
読めない部屋（program・abc）は、localStorage と IndexedDB のうち `t` が新しいほうを読み、`points` を足して `t=Date.now()` にし、両方に書く（見本：`program/index.html` の `houseWrite()`、`abc/js/game/house.js` の `sendStars()`）。データの他の項目には触れない。
- **IndexedDB の返事を待ってから書かない**（iPad のホーム画面アプリでは返事が来ないことがあり、★が届かないまま「おうちへ」でページが変わる。過去に発生）。IndexedDB はページを開いたときに先に読んでおき、加算は localStorage に**すぐ**書き、IndexedDB へはあとから書く（待つ時間に上限）。おうちは `t` が新しいほうを使うので、localStorage だけ書けていれば反映される。
- 同じデータを書く処理を同時に2つ走らせない（片方の加算が消える）。

## ABCぼうけんの ★ → おうちの ⭐
- ABC の `stars` − `starsSent` の差（まだ届けていない★）× おうちの `settings.abcPts`（既定10）を `points` に加算し、`starsSent` を進める。ABC の保存のたびに実行。
- 旧版の ABC データ（`starsSent` なし）は、新版を最初に開いたときに それまでの★がまとめて届く（1回だけ）。

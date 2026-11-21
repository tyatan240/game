# セーブデータ

すべて端末内（ブラウザ）に保存。サーバーはない。データは「サイトのURL（オリジン）ごと」「iPad ではホーム画面アプリと Safari タブで別」。

## 保存場所
| キー | 場所 | 中身 | 書く場所 |
|---|---|---|---|
| `moko-math-v1` | localStorage ＋ IndexedDB（DB `moko-house`、ストア `kv`、キー `moko-math-v1`） | おうち共通の状態（下記） | `common/core.js` の `save()`、`program/` の `houseAdd()` |
| `piko-prog-v1` | localStorage | プログラミングの進み具合 `{best:{ステージ番号:★数}}` | `program/` |
| `abc-adventure-v1` | localStorage | ABCぼうけんの進行・学習記録（`abc/js/game/state.js`） | `abc/` |

## `moko-math-v1` の形
```js
{
  v:1, t:最終保存時刻(ms),
  points: 星（共通ポイント）,
  owned: [持っているアイテムid…], equip:{char,outfit,hat,acc,wall,floor}, furn:[置いている家具id…],
  settings:{
    types:{add1:{on,pts},…}, ktypes:{k1yomi:{on,pts},…},
    perRound, perfect, daily, sound, testScale, practiceMul, practiceBonus,
    progPts, gachaOn, gachaCost, gachaDaily
  },
  lastDay:'YYYY-M-D'（ログインボーナス）,
  stats:{q,ok}（さんすう）, kstats:{q,ok}（こくご）,
  tests:{'add1-1':{pass,best}, 'k1yomi-2':{…}, …},
  gacha:{day,count,pulls}
}
```

## 読み込みと保存のしくみ
- 読込：`merge(defState(), 保存データ)`。足りない項目は初期値で補い、知らないアイテム id は捨てる。
- IndexedDB との二重化：起動時に両方を見て `t` が新しいほうを採用（localStorage が空なら IndexedDB を採用）。`pagehide`・`visibilitychange` でも保存。iOS Safari で localStorage の書き込みが遅れて消える対策。
- 他の部屋で増えたポイントは、ページ読込時と `pageshow`（戻る）・`storage` イベントで取り込む（`resync()`、`t` が新しい場合のみ）。
- バックアップ：⚙️設定 →「データの ひきつぎ」。`S` を JSON → Base64 にしたコード。読込は `merge()` を通す。

## 互換ルール（変更時に必ず守る）
1. キー名・DB名を変えない。
2. 項目は追加のみ。新項目は `defState()` に初期値を入れ、`merge()` で古いデータにも補う。名前変更・削除・意味の変更はしない。
3. `ITEMS` の id を変えない・消さない。
4. 変更後は旧形式データで確認する（`node tests/smoke.js` の「ふるい セーブデータ」テスト）。

## 他のゲームから星を足す方法
core.js を読める部屋は `S.points += n; save();`。
読めない部屋（program・abc など）は、localStorage と IndexedDB のうち `t` が新しいほうを読み、`points` を足して `t=Date.now()` にし、両方に書く（`program/index.html` の `houseAdd()` が見本）。データの他の項目には触れない。

# 保護者向け 学習レポート

「保護者向け学習レポート 実装設計書 v2.0」の実装メモ。端末内だけに保存し、外部には送らない。

## ファイル
| ファイル | 役割 |
|---|---|
| `common/learning-history.js` | 記録API（グローバル `LearningHistory`＝`LH`）。core.js に依存しない |
| `parent/index.html`・`report.js`・`report.css` | 保護者画面（保護者確認 → ダッシュボード・成長・復習提案・まちがえた問題・バックアップ） |
| `sansu/`・`kokugo/`・`eigo/`・`program/` | 既存の正誤判定のあとに `lhRec()`／`lhRun()` で記録するだけ（判定・⭐・保存は変更なし） |

## 保存（IndexedDB `moko-learning-history`、v1）
- `attempts`（keyPath `id`。index：`ts`・`subject`・`questionKey`・`topic`・`instance`）
  ```js
  { id, ts, timestamp:'2026-11-22T10:30:00+09:00', day:'2026-11-22', sessionId,
    questionInstanceId, questionKey:'sansu:add21:7+5', subject:'sansu'|'kokugo'|'eigo'|'prog', topic, skill, difficulty, mode:'practice'|'test'|'testprac'|'stage',
    questionText, correctAnswer, userAnswer, isCorrect, attemptNumber, hintUsed, responseTimeMs, activeMs, idleCut, earnedStars, params }
  ```
- `sessions`（keyPath `id`）：`{id, subject, mode, start, end, activeMs, attempts, correctFirst}`
- `metadata`：`{k:'schema', v:1}`
- `moko-math-v1` などの既存セーブデータには書かない。保存できなかった記録は localStorage `moko-learning-pending` に一時退避して次回再試行。

## 問題IDの考え方
- `questionKey`：同じ内容の問題（さんすう `sansu:種類:a+b`、こくご `kokugo:種類:ことばのキー`、えいご `eigo:種類:文字/単語id`、プログラミング `prog:stage-N`）
- `questionInstanceId`：出題1回ごと（表示するたびに新しい。別の日に同じ問題が出ても別の出題）
- `attemptNumber`：同じ出題への回答回数（さんすう・こくご・えいご の「れんしゅう」は2回まで、テストは1回、プログラミングは実行回数）

## 指標
- 学習時間：問題を表示してから答えるまでの「画面が表示されていた時間」。1問あたり上限 60秒（よみとり・プログラミングは180秒）を超えた分は含めない（`activeMs`。生の時間は `responseTimeMs`）
- 初回正答率：出題ごとの1回目だけ。解き直しで正解しても変わらない
- 解き直し成功：初回不正解のうち、同じ出題で後から正解。表示では「解き直したが不正解」「未再挑戦」「解き直しのない形式（テスト）」を分ける
- 後日の定着：別の日に同じ `questionKey` で初回正解 → 「後日 同じ問題に正解」。同じ単元の別の問題での正解は「（参考）」として区別
- 回答が5問未満の単元は灰色（断定しない）。復習提案は30日間で10問以上の単元だけ
- プログラミング：ステージ挑戦（出題）・実行回数・クリア・1回目でクリア（正答率には含めない）

## 保護者確認
- 既存のかけ算（⚙️設定）を通ると `sessionStorage` に `moko-parent-ok`（10分・1回で使い切り）。設定の「📊 学習レポート」からはそのまま開く
- 直接URL・戻る（bfcache）・トークン切れは、レポート画面でかけ算を出す。画面を離れると表示を消す
- 子ども向けの簡易な操作制限で、強固な認証ではない

## バックアップ
- 「学習データを保存」：JSON（`{format:'moko-learning-history', version:1, attempts, sessions}`）、「表として保存」：CSV（Excel 用に BOM つき）
- 復元：形式・バージョンを確認、不正な記録は拒否、同じ ID は追加しない、確認ダイアログのあと追加（今ある記録は消さない）
- ⚙️設定の「データの ひきつぎ」コード（`moko-math-v1`）には学習履歴は含まれない（設定画面に注記）

## テスト
`node tests/smoke.js` の「15. 学習レポート」で受け入れテスト17項目を確認。大量データ（約17,000回答）で 開く 0.4秒・期間切替 0.1秒程度（Chromium）。

## 英語の習得状況（ABCぼうけん）
`report.js` の `english()`。`abc-adventure-v1` を読み、ABC のデータ（words・sentences・learning）は dynamic import。大文字・小文字・単語（ワールド1）・ことば（ワールド3）・文の形の数（いまの進み＋`slots` の合計）、「覚えた」数（`levelOf`）、クリア回数、復習時期が来た件数、苦手な項目（2回以上・正答率70%未満）。

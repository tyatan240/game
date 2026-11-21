// かんたんな どうさ かくにん（スモークテスト）
//   node tests/smoke.js
// リポジトリを その場で ローカル サーバーに して、Playwright（Chromium）で おもな ながれを ためす。
// Playwright が ない かんきょうでは  npm i -D playwright && npx playwright install chromium
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

let failed = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) failed++; };

(async () => {
  await new Promise(r => server.listen(0, r));
  const B = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch();
  const page = async (vp = { width: 390, height: 844 }) => {
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = [];
    p.on('pageerror', e => p.errs.push(e.message));
    return p;
  };
  const pts = p => p.evaluate(() => JSON.parse(localStorage.getItem('moko-math-v1') || '{}').points || 0);

  console.log('1. どの ページも エラーなく ひらく');
  for (const u of ['index.html', 'sansu/index.html', 'kokugo/index.html', 'program/index.html', 'abc/index.html']) {
    const p = await page(); await p.goto(B + u); await p.waitForTimeout(500);
    ok(p.errs.length === 0, `${u} ${p.errs.join(' / ')}`); await p.context().close();
  }

  console.log('2. ポイントが へやを こえて きょうつう');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(400); await p.evaluate(() => closePop());
    const p0 = await pts(p);
    await p.goto(B + 'sansu/index.html'); await p.click('[data-act=start] >> nth=0');
    for (let i = 0; i < 5; i++) {
      await p.waitForFunction(() => quiz && !quiz.lock && view === 'quiz');
      const a = await p.evaluate(() => quiz.cur.ans);
      for (const ch of String(a)) await p.click(`.pad [data-act=key][data-arg="${ch}"]`);
      await p.click('.pad [data-act=answer]');
    }
    await p.waitForFunction(() => view === 'result');
    const p1 = await pts(p); ok(p1 > p0, `さんすう ${p0} → ${p1}`);
    await p.goto(B + 'kokugo/index.html'); await p.click('[data-act=start] >> nth=0');
    for (let i = 0; i < 5; i++) {
      await p.waitForFunction(() => quiz && !quiz.lock && view === 'quiz');
      await p.click(`[data-act=pick][data-arg="${await p.evaluate(() => quiz.cur.choices.indexOf(quiz.cur.ans))}"]`);
    }
    await p.waitForFunction(() => view === 'result');
    const p2 = await pts(p); ok(p2 > p1, `こくご ${p1} → ${p2}`);
    await p.goto(B + 'program/index.html');
    await p.evaluate(() => { openLv(0); prog = [{ t: 'R' }, { t: 'R' }, { t: 'R' }, { t: 'R' }]; render(); run(); });
    await p.waitForSelector('#pop', { timeout: 10000 }); await p.waitForTimeout(300);
    const p3 = await pts(p); ok(p3 > p2, `プログラミング ${p2} → ${p3}`);
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    ok(Number(await p.textContent('#pts')) === p3, 'おうちの ひょうじと いっち');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('3. ガチャ・おみせ');
  {
    const p = await page(); await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 500; save(); go('gacha'); });
    const before = await p.evaluate(() => S.owned.length);
    await p.click('[data-act=spin]'); await p.waitForSelector('#ov .pop', { timeout: 5000 });
    const after = await p.evaluate(() => [S.owned.length, S.points]);
    ok(after[0] === before + 1 || after[1] === 410, `1かい まわすと アイテム＋1 か ⭐10 もどる（${JSON.stringify(after)}）`);
    ok(await p.evaluate(() => !ITEMS.filter(i => i.gacha).some(i => i.price > 0)), 'ガチャの アイテムは おみせで うらない');
    await p.context().close();
  }

  console.log('4. ふるい セーブデータを よみこめる');
  {
    const p = await page(); await p.goto(B + 'manifest.json');
    await p.evaluate(() => localStorage.setItem('moko-math-v1', JSON.stringify({ v: 1, t: 1, points: 123, owned: ['o_pink', 'u_bed'], equip: { outfit: 'o_pink' }, furn: ['u_bed'], settings: { perRound: 7 }, tests: { 'add1-1': { pass: true, best: 10 } } })));
    await p.goto(B + 'index.html'); await p.waitForTimeout(500);
    const s = await p.evaluate(() => [S.points, S.owned.includes('o_pink'), S.equip.outfit, S.settings.perRound, !!S.tests['add1-1']]);
    ok(s[0] >= 123 && s[1] && s[2] === 'o_pink' && s[3] === 7 && s[4], 'ポイント・もちもの・せってい・テスト きろくが のこる ' + JSON.stringify(s));
    await p.context().close();
  }

  console.log('5. ABCぼうけん');
  {
    const p = await page({ width: 844, height: 390 }); await p.goto(B + 'abc/index.html'); await p.waitForTimeout(400);
    await p.click('#start'); await p.waitForTimeout(500);
    for (let k = 0; k < 30 && await p.$('.dlg'); k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(50); }
    await p.keyboard.down('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.up('ArrowUp');
    ok(await p.evaluate(() => __abc.hero.dir === 'up'), 'キーボードで あるける');
    await p.evaluate(() => __abc.tp(5, 8, 'up')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    for (let k = 0; k < 10 && await p.$('.dlg'); k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(80); }
    await p.click('.teach .go'); await p.waitForTimeout(300);
    await p.click(`.ch:text-is("${await p.evaluate(() => __abcQ.answer)}")`);
    await p.waitForFunction(() => __abc.S.stars === 1, null, { timeout: 5000 }).catch(() => {});
    ok(await p.evaluate(() => __abc.S.stars === 1 && __abc.S.learned.includes('A')), 'ありさんの クイズで ほし＋1・A を おぼえる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('6. ABCぼうけん：まえの ばんの セーブ（MVP クリアずみ）から つづきを あそべる');
  {
    const p = await page({ width: 844, height: 390 }); await p.goto(B + 'abc/index.html');
    await p.evaluate(() => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, hero: { x: 33.5, y: 11.8, dir: 'right' }, stars: 9, learned: ['A', 'B', 'C', 'D', 'E'], flags: { intro: true, bossCleared: true, bridgeOpen: true, ending: true }, chests: { chest1: true }, items: ['scarf'], wear: { scarf: true, hat: false }, records: { A: { asked: 3, correct: 3, streak: 3, level: 2, due: 0 } }, settings: { bgm: false, se: true, voice: true } })));
    await p.reload(); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({ stars: __abc.S.stars, x: Math.floor(__abc.hero.x / 32), goal: __abc.objective().text, rec: __abc.S.records.A.correct, scarf: __abc.S.wear.scarf, bgm: __abc.S.settings.bgm }));
    ok(r.stars === 9 && r.rec === 3 && r.scarf && r.bgm === false, 'ほし・きろく・きがえ・せっていが のこる ' + JSON.stringify(r));
    ok(r.x < 28 && r.goal.includes('ラビ'), 'もんの てまえに もどり、つぎの もくてきが でる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  await browser.close(); server.close();
  console.log(failed ? `\n${failed}こ しっぱい` : '\nぜんぶ OK');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });

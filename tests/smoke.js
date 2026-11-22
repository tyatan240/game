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
  for (const u of ['index.html', 'sansu/index.html', 'kokugo/index.html', 'program/index.html', 'eigo/index.html', 'abc/index.html', 'machi/index.html']) {
    const p = await page(); await p.goto(B + u); await p.waitForTimeout(500);
    ok(p.errs.length === 0, `${u} ${p.errs.join(' / ')}`); await p.context().close();
  }

  console.log('2. ポイントが へやを こえて きょうつう');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(400); await p.evaluate(() => { closePop(); S.settings.goalPts = 0; S.settings.goalAll = 0; save(); }); // もくひょうの ごほうびは べつの テストで
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

  console.log('7. ABCぼうけん：つぎの エリアへ いける（F〜Z）');
  {
    const p = await page({ width: 844, height: 390 }); await p.goto(B + 'abc/index.html');
    await p.evaluate(() => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, hero: { x: 53.5, y: 11.8, dir: 'right', area: 'island' }, stars: 20, learned: ['A', 'B', 'C', 'D', 'E'], flags: { intro: true, bossCleared: true, bridgeOpen: true }, quests: { apple: 'done', flowers: 'done', bee: 'done' }, world: { gate: 'open', flowerbed: 'bloom', vines: 'open', bees: true }, words: { apple: { at: 1 }, water: { at: 1 }, flower: { at: 1 }, bee: { at: 1 } } })));
    await p.reload(); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(500);
    await p.keyboard.down('ArrowRight'); for (let i = 0; i < 20 && await p.evaluate(() => __abc.area()) === 'island'; i++) await p.waitForTimeout(100); await p.keyboard.up('ArrowRight');
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ area: __abc.area(), goal: __abc.objective().text, areas: __abc.S.areas }));
    ok(r.area === 'forest' && r.goal.includes('もじ'), 'しまの みぎはしから もりの こみちへ ' + JSON.stringify(r));
    await p.evaluate(() => __abc.approach('frog')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    for (let k = 0; k < 10 && await p.$('.dlg'); k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(60); }
    ok(!!await p.$('.teach'), 'かえるさんが F を おしえてくれる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('8. おうち ⇄ ABCぼうけん（いりぐち・でぐち・ほしの うけとり）');
  {
    const p = await page({ width: 844, height: 390 });
    const housePts = () => p.evaluate(() => JSON.parse(localStorage.getItem('moko-math-v1') || '{}').points || 0);
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 100; S.settings.goalPts = 0; S.settings.goalAll = 0; save(); go('study'); });
    ok(!!await p.$('a.study[href="eigo/index.html"]'), 'おうちの おべんきょうに えいごの いりぐち');
    await p.click('a.study[href="eigo/index.html"]'); await p.waitForLoadState(); await p.waitForTimeout(400);
    ok(!!await p.$('a.bigchoice.adv') && !!await p.$('button.bigchoice.study'), 'えいごの へやで「ぼうけん」か「べんきょう」を えらべる');
    await p.click('a.bigchoice.adv'); await p.waitForLoadState(); await p.waitForTimeout(400);
    ok(p.url().endsWith('abc/index.html') && await p.isVisible('#title'), 'いりぐちから ABCぼうけんの タイトルへ');
    ok(await p.textContent('#housePts') === '100', 'タイトルに おうちの ⭐が でる');
    // まえの ばんの ABC データ（★20、まだ とどけていない）
    await p.evaluate(() => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, hero: { x: 8.5, y: 12.8, dir: 'down', area: 'island' }, stars: 20, learned: ['A'], flags: { intro: true } })));
    await p.reload(); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(800);
    ok(await housePts() === 300, `たまっていた ★20 が ⭐200 に なって おうちに とどく（${await housePts()}）`);
    await p.reload(); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(800);
    ok(await housePts() === 300, 'もういちど ひらいても 2かい とどかない');
    // ★を 1こ ふやす（ありさん）
    await p.evaluate(() => __abc.approach('bear')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    for (let k = 0; k < 10 && await p.$('.dlg'); k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(60); }
    await p.click('.teach .go'); await p.waitForTimeout(300); await p.click(`.ch[data-v="${await p.evaluate(() => __abcQ.answer)}"]`);
    await p.waitForFunction(() => __abc.S.stars === 21, null, { timeout: 5000 }).catch(() => {});
    for (let k = 0; k < 20 && await p.$('.dlg, .notice, .flystar'); k++) { if (await p.$('.dlg')) await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
    await p.waitForTimeout(500);
    ok(await housePts() === 310, `あたらしい ★1 も ⭐10 で とどく（${await housePts()}）`);
    const idb = await p.evaluate(() => new Promise(ok => { const q = indexedDB.open('moko-house', 1); q.onsuccess = () => { const r = q.result.transaction('kv').objectStore('kv').get('moko-math-v1'); r.onsuccess = () => ok(r.result && r.result.points); }; }));
    ok(idb === 310, 'IndexedDB にも かいている');
    // メニューの「おうちへ」
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.click('.menu [data-a=home]'); await p.waitForLoadState(); await p.waitForTimeout(500);
    ok(p.url().endsWith('/index.html') && !p.url().includes('abc'), 'メニューの「おうちへ」で おうちに もどる');
    ok(await p.evaluate(() => S.points) === 310, 'おうちの ⭐に はんえい されている');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('9. ABCぼうけん：クリアしたら もういちど さいしょから あそべる');
  {
    const p = await page({ width: 844, height: 390 }); await p.goto(B + 'abc/index.html');
    const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // おしろの もんの まえ（さいごの おさらい まえ）
    await p.evaluate(ALL => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, hero: { x: 38.5, y: 10.8, dir: 'right', area: 'garden' }, stars: 70, starsSent: 70, learned: ALL, items: ['scarf'], wear: { scarf: true, hat: false },
      flags: { intro: true, bossCleared: true, bridgeOpen: true }, records: { A: { asked: 5, correct: 5, streak: 5, level: 2, due: 0 } }, words: { apple: { at: 1 } },
      quests: { apple: 'done', flowers: 'done', bee: 'done', sun: 'done', dog: 'done', pie: 'done', cat: 'done', fish: 'done', bird: 'done', colors: 'done' },
      world: { gate: 'open', gate_forest: 'open', gate_village: 'open', gate_lake: 'open' }, areas: ['island', 'forest', 'village', 'lake', 'garden'] })), ALL);
    await p.reload(); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(600);
    await p.evaluate(() => __abc.approach('castle')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    for (let k = 0; k < 200 && !await p.$('.ending'); k++) {
      if (await p.$('.dlg')) await p.keyboard.press('Enter');
      else if (await p.$('.quiz') && !await p.$('.ch.ok')) await p.click(`.ch[data-v="${await p.evaluate(() => __abcQ.answer)}"]`, { timeout: 1000 }).catch(() => {});
      await p.waitForTimeout(120);
    }
    ok(!!await p.$('.ending') && await p.evaluate(() => __abc.S.clears === 1), 'さいごの おさらいで クリア（1かいめ）');
    await p.click('.ending [data-a=replay]'); await p.waitForTimeout(900);
    for (let k = 0; k < 20 && await p.$('.dlg'); k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(60); }
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const S = __abc.S; return { area: __abc.area(), learned: S.learned.length, quests: Object.keys(S.quests).length, gate: S.world.gate, stars: S.stars, sent: S.starsSent, rec: S.records.A && S.records.A.correct, items: S.items, clears: S.clears, goal: __abc.objective().text }; });
    ok(r.area === 'island' && r.learned === 0 && r.quests === 0 && !r.gate, 'すすみは さいしょに もどる ' + JSON.stringify(r));
    ok(r.stars === 73 && r.sent === 73 && r.rec >= 5 && r.items.includes('scarf') && r.clears === 1, 'ほし・がくしゅう きろく・きがえ・クリア かいすうは のこる');
    ok(r.goal.includes('もじ'), 'もういちど もじを おぼえる ところから');
    await p.keyboard.press('Escape'); await p.click('.menu [data-a=title]'); await p.waitForTimeout(300);
    ok(await p.textContent('#start') === 'もういちど ぼうけん' && (await p.textContent('#clears')).includes('1'), 'タイトルに クリア かいすう');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('10. えいごの べんきょう（れんしゅう・テスト）');
  {
    const p = await page();
    await p.goto(B + 'eigo/index.html');
    await p.evaluate(() => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, learned: ['A', 'B'], words: { apple: { at: 1 }, water: { at: 1 }, flower: { at: 1 } }, records: {} })));
    await p.reload(); await p.waitForTimeout(400); await p.click('button.bigchoice.study'); await p.waitForTimeout(300);
    ok(!!await p.$('[data-act=start][data-arg=ewpic]') && !await p.$('[data-act=start][data-arg=ealisten]'), 'おぼえた かずが たりない もんだいは まだ えらべない');
    await p.click('[data-act=start][data-arg=ewpic]'); const p0 = await p.evaluate(() => S.points);
    for (let i = 0; i < 5; i++) { await p.waitForFunction(() => __eigo.quiz && !__eigo.quiz.lock && __eigo.view === 'quiz'); await p.click(`[data-act=pick][data-arg="${await p.evaluate(() => __eigo.quiz.cur.choicesId.indexOf(__eigo.quiz.cur.ans))}"]`); }
    await p.waitForFunction(() => __eigo.view === 'result');
    ok(await p.evaluate(() => S.points) > p0, 'せいかいで おうちの ⭐が ふえる');
    const rec = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('abc-adventure-v1')).records));
    ok(rec.some(k => k.startsWith('w:')), 'けっかが ABCぼうけんの がくしゅう きろくに はいる ' + rec.join(','));
    await p.evaluate(() => __eigo.go('tests')); ok(!!await p.$('[data-act=tready][data-arg="ewpic-1"]'), 'えいごの 🏆テストが ある');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('11. きょうの もくひょう');
  {
    const p = await page();
    const daily = () => p.evaluate(() => (JSON.parse(localStorage.getItem('moko-math-v1') || '{}').daily) || {});
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 0; save(); });
    ok(!!await p.$('.goals') && (await p.$$('.goal')).length === 4, 'おうちに きょうの もくひょう（4つ）');
    await p.evaluate(() => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, learned: ['A', 'B', 'C'], words: { apple: { at: 1 }, water: { at: 1 }, flower: { at: 1 } }, stars: 0, starsSent: 0 })));
    // さんすう・こくご・えいごの 🏆テストを 2かいずつ（じかんぎれで おわらせる）
    for (const [room, key, g] of [['sansu', 'add1-1', 0], ['kokugo', 'k1yomi-1', 0], ['eigo', 'ealisten-1', 1]]) {
      await p.goto(B + room + '/index.html#tests'); await p.waitForTimeout(400);
      for (let i = 0; i < 2; i++) {
        await p.click(`[data-act=tready][data-arg="${key}"]`); await p.click('#ov [data-act=tstart]');
        await p.waitForFunction(g => { const t = g ? __eigo.test : test; return t && t.phase === 'run'; }, g, { timeout: 8000 });
        await p.evaluate(g => { const t = g ? __eigo.test : test; t.t0 = performance.now() - t.limit; }, g);
        await p.waitForSelector('#ov .pop'); await p.click('#ov [data-act=close] >> nth=0');
      }
    }
    // れんしゅうは かぞえない
    await p.click('[data-act=tready][data-arg="ealisten-1|p"]'); await p.click('#ov [data-act=tstart]');
    await p.waitForFunction(() => __eigo.test && __eigo.test.phase === 'run', null, { timeout: 8000 });
    await p.evaluate(() => { __eigo.test.t0 = performance.now() - __eigo.test.limit; }); await p.waitForSelector('#ov .pop');
    let d = await daily(); ok(d.sansu === 2 && d.kokugo === 2 && d.eigo === 2, 'テストの かいすう（れんしゅうは のぞく）' + JSON.stringify(d));
    // プログラミング
    await p.goto(B + 'program/index.html'); await p.evaluate(() => { openLv(0); prog = [{ t: 'R' }, { t: 'R' }, { t: 'R' }, { t: 'R' }]; render(); run(); });
    await p.waitForSelector('#pop', { timeout: 10000 }); await p.waitForTimeout(600);
    // ABCぼうけん（クリア まえ → ★2こ で たっせい）
    await p.evaluate(() => { const a = JSON.parse(localStorage.getItem('abc-adventure-v1')); a.stars = 2; a.hero = { x: 8.5, y: 12.8, area: 'island' }; a.flags = { intro: true }; localStorage.setItem('abc-adventure-v1', JSON.stringify(a)); });
    await p.goto(B + 'abc/index.html'); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(900);
    d = await daily(); ok(d.prog === 1 && d.abc === 2, 'プログラミング・ぼうけんも かぞえる ' + JSON.stringify(d));
    // おうちに もどると ごほうび
    await p.goto(B + 'index.html'); await p.waitForTimeout(800);
    for (let k = 0; k < 5 && await p.$('#ov .pop'); k++) { await p.click('#ov [data-act=close] >> nth=0'); await p.waitForTimeout(400); }
    const r = await p.evaluate(() => ({ pts: S.points, got: S.daily.got, all: S.daily.all }));
    ok(r.all && Object.keys(r.got).length === 4, 'ぜんぶ たっせいで ごほうび ' + JSON.stringify(r));
    await p.reload(); await p.waitForTimeout(800);
    ok(await p.evaluate(() => S.points) === r.pts && !await p.$('#ov .pop'), 'ごほうびは 1かいだけ');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('8b. IndexedDB が へんじしない ときも ABC の ★が おうちに とどく（iPad たいさく）');
  {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 50; S.settings.goalPts = 0; S.settings.goalAll = 0; save(); });
    await p.evaluate(() => localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 1, started: true, hero: { x: 8.5, y: 12.8, dir: 'down', area: 'island' }, stars: 3, starsSent: 3, learned: ['A'], flags: { intro: true } })));
    // ABC の ページだけ IndexedDB を こたえない ように する
    await p.addInitScript(() => { if (location.pathname.includes('/abc/')) indexedDB.open = () => ({}); });
    await p.goto(B + 'abc/index.html'); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(600);
    // ★を もらって すぐ「おうちへ」
    await p.evaluate(() => { __abc.S.stars += 2; });
    await p.keyboard.press('Escape'); await p.waitForTimeout(150); await p.click('.menu [data-a=home]'); await p.waitForLoadState(); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ pts: S.points, abc: S.daily.abc }));
    ok(r.pts === 70 && r.abc === 2, 'おうちの ⭐と きょうの もくひょうに はいる ' + JSON.stringify(r));
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / '));
    await ctx.close();
  }

  console.log('8c. IndexedDB が へんじしない ときも プログラミングの ⭐と もくひょうが とどく');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 50; S.settings.goalPts = 0; S.settings.goalAll = 0; save(); });
    await p.addInitScript(() => { if (location.pathname.includes('/program/')) indexedDB.open = () => ({}); });
    await p.goto(B + 'program/index.html');
    await p.evaluate(() => { openLv(0); prog = [{ t: 'R' }, { t: 'R' }, { t: 'R' }, { t: 'R' }]; render(); run(); });
    await p.waitForSelector('#pop', { timeout: 10000 });
    await p.goto(B + 'index.html'); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ pts: S.points, prog: S.daily.prog }));
    ok(r.pts > 50 && r.prog === 1, '⭐も「プログラミング 1ステージ」も はいる ' + JSON.stringify(r));
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / '));
    await ctx.close();
  }

  console.log('8d. ゆめの ごほうび・ひみつの なかま');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => { closePop(); S.points = 3500; S.settings.goalPts = 0; S.settings.goalAll = 0; S.tests = {}; save(); });
    ok(await p.evaluate(() => ITEMS.filter(i => i.dream).every(i => i.price >= 1000) && ITEMS.filter(i => i.dream).length >= 10 && SECRETS.length === 5), 'ゆめの ごほうび（⭐1000〜）と ひみつの なかま 5つ');
    ok(await p.evaluate(() => ITEMS.filter(i => i.dream || i.secret).every(i => thumb(i).includes('<svg'))), 'ぜんぶ え が ある');
    await p.evaluate(() => { shopCat = 'special'; go('shop'); });
    ok(await p.isVisible('h2.dreamh') && await p.locator('.item.secret.lock').count() === 5, 'おみせに ゆめの ごほうび・ひみつ（？？？）');
    await p.click('[data-act=buy][data-arg=c_lily]'); await p.click('#ov [data-act=dobuy]');
    ok(await p.evaluate(() => S.owned.includes('c_lily') && S.points === 500 && S.equip.char === 'c_lily'), '⭐3000 の おひめさまを かえる');
    await p.click('#ov [data-act=close] >> nth=0').catch(() => {});
    await p.click('[data-act=sinfo][data-arg=c_starfox]');
    ok(/あと 10かい/.test(await p.textContent('#ov')), 'ひみつは あと なんかいで あえるか わかる');
    await p.evaluate(() => { closePop(); ['add1-1', 'add1-2', 'add21-1', 'k1yomi-1', 'sub1-1', 'sub1-2', 'ealisten-1', 'k1kaki-1', 'k2yomi-1', 'add22-1'].forEach(k => S.tests[k] = { pass: true, best: 10 }); S.tests['yomi-1'] = { pass: false, best: 3 }; save(); });
    await p.reload(); await p.waitForTimeout(900);
    ok(await p.evaluate(() => S.owned.includes('o_idol')) && /ひみつ/.test(await p.textContent('#ov')), 'ごうかく 5かいで ひみつの アイテム');
    await p.click('#ov [data-act=close] >> nth=0'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => S.owned.includes('c_starfox')) && /ほしぎつね/.test(await p.textContent('#ov')), 'つづけて 10かいの ひみつの なかま');
    await p.click('#ov [data-act=close] >> nth=0'); await p.waitForTimeout(400);
    ok(!await p.evaluate(() => S.owned.includes('h_startiara')) && await p.evaluate(() => passCount()) === 10, 'まだの ものは でない（ふごうかくは かぞえない）');
    await p.reload(); await p.waitForTimeout(900);
    ok(await p.evaluate(() => S.owned.includes('o_idol') && S.owned.includes('c_starfox')) && !/ひみつ/.test(await p.textContent('#ov').catch(() => '')), 'もらったものは のこる・2かい でない');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('8e. キャラごとに ふくを おぼえる');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => { closePop(); S.settings.goalPts = 0; S.settings.goalAll = 0; S.owned.push('c_lily', 'c_sheep', 'o_heartdress', 'h_heartbow', 'o_moondress', 'a_wand'); save(); go('dress'); });
    const wear = id => p.click(`[data-act=wear][data-arg=${id}]`);
    await wear('o_heartdress'); await wear('h_heartbow');           // モコ：ハートの ドレス＋リボン
    await wear('c_lily'); await wear('o_moondress'); await wear('a_wand'); // リリィ：おつきさまの ドレス＋ステッキ
    await wear('c_sheep');                                           // はじめての ひつじ：いまの ふくの まま
    const e1 = await p.evaluate(() => ({ ...S.equip }));
    await wear('c_moko'); const e2 = await p.evaluate(() => ({ ...S.equip }));
    await wear('c_lily'); const e3 = await p.evaluate(() => ({ ...S.equip }));
    ok(e1.outfit === 'o_moondress' && e2.outfit === 'o_heartdress' && e2.hat === 'h_heartbow' && e2.acc === 'a_none' && e3.outfit === 'o_moondress' && e3.acc === 'a_wand', 'キャラを かえると その キャラの ふくに きがえる');
    await p.reload(); await p.waitForTimeout(600);
    await p.evaluate(() => { closePop(); go('dress'); }); await wear('c_moko');
    ok(await p.evaluate(() => S.equip.outfit === 'o_heartdress' && S.looks.c_lily.outfit === 'o_moondress'), 'とじても おぼえている');
    ok(await p.evaluate(() => thumb(ITEM.c_lily).includes(charSVG({ ...S.equip, ...S.looks.c_lily, char: 'c_lily' }, 'happy').slice(30, 200))), 'きせかえの キャラの えも その キャラの ふく');
    // ふるい データ（looks なし）でも だいじょうぶ
    await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('moko-math-v1')); delete d.looks; d.t = Date.now() + 5000; localStorage.setItem('moko-math-v1', JSON.stringify(d)); });
    await p.reload(); await p.waitForTimeout(600);
    ok(await p.evaluate(() => typeof S.looks === 'object' && S.equip.outfit === 'o_heartdress'), 'ふるい データ（looks なし）も よめる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('8f. おみせの タブを えらんでも よこスクロールが もどらない');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => { closePop(); go('shop'); });
    await p.evaluate(() => { document.querySelector('#view .tabs').scrollLeft = 9999; });
    const x0 = await p.evaluate(() => document.querySelector('#view .tabs').scrollLeft);
    await p.click('#view .tabs [data-arg=furn]');
    const x1 = await p.evaluate(() => document.querySelector('#view .tabs').scrollLeft);
    ok(x0 > 50 && Math.abs(x1 - x0) < 10 && await p.evaluate(() => shopCat === 'furn'), `みぎの タブを えらんでも そのまま（${x0}→${x1}）`);
    await p.context().close();
  }

  console.log('8g. プログラミングの もっと ステージ（ぜんぶ クリアできて ⭐3 が とれる）');
  {
    const sols = JSON.parse(fs.readFileSync(path.join(__dirname, 'program-solutions.json'), 'utf8'));
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, t, ...a) => st(f, Math.min(t || 0, 10), ...a); });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'program/index.html'); await p.waitForTimeout(300);
    const first = await p.evaluate(() => LEVELS.findIndex(l => l.set === 2));
    ok(first === 12 && await p.evaluate(() => LEVELS.length) === 30, `ステージ 13〜30 を うしろに ついか（${first}〜）`);
    const res = [];
    for (let k = 0; k < sols.length; k++) {
      const i = first + k;
      await p.evaluate(([i, prg]) => { closePop(); openLv(i); prog = prg; render(); run(); }, [i, sols[k].prog]);
      await p.waitForSelector('#pop', { timeout: 15000 });
      res.push(await p.evaluate(([i, par]) => ({ i: i + 1, best: S.best[i] || 0, par: LEVELS[i].par === par, max: LEVELS[i].max > LEVELS[i].par }), [i, sols[k].par]));
    }
    const bad = res.filter(r => r.best !== 3 || !r.par || !r.max);
    ok(bad.length === 0, 'ぜんぶの ステージが ⭐3 で クリアできる ' + JSON.stringify(bad));
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / '));
    // iPad よこ：やじるしと じっこうボタンが スクロール しなくても みえる
    await p.evaluate(() => { closePop(); openLv(28); });
    const vis = await p.evaluate(() => [...document.querySelectorAll('.pbtn, .big')].every(b => { const r = b.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; }));
    ok(vis, 'iPad よこで やじるし・じっこうが がめんに おさまる');
    await ctx.close();
  }

  console.log('14. モコの まち（machi/）');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => { closePop(); S.points = 150; S.settings.goalPts = 0; S.settings.goalAll = 0; S.owned.push('c_hamster', 'c_cat', 'u_bed', 'w_dots'); save(); render(); });
    const owned0 = await p.evaluate(() => [...S.owned].sort().join());
    ok(await p.isVisible('.room .todoor'), 'おへやに「まちへ」の ドア');
    await p.click('.room .todoor'); await p.waitForSelector('body[data-ready="1"]', { timeout: 10000 });
    ok(p.url().endsWith('machi/index.html') && await p.evaluate(() => ['moko_house', 'town_shop'].every(t => __town.town.objects.some(o => o.type === t))), 'ドアから まちへ（モコの おうち・まちの おみせ が ある）');
    const T = (f, a) => p.evaluate(f, a);
    // おく・うごかす・けす・もどす
    await T(() => { __town.setMode('build'); __town.chooseTool({ kind: 'part', id: 'house_basic', r: 0 }); __town.tapBuild(10.5, 10.5); __town.tapBuild(10.5, 10.5); });
    ok(await T(() => __town.town.objects.some(o => o.type === 'house_basic' && o.x === 10 && o.y === 9)), 'おうちを おく（タップ 2かい）');
    await T(() => { __town.chooseTool({ kind: 'part', id: 'tree_basic', r: 0 }); __town.tapBuild(10.5, 9.5); });
    ok(await T(() => __town.ui.pending && !__town.ui.pending.ok), 'かさなる ところは おけない（あかい プレビュー）');
    await T(() => { __town.chooseTool({ kind: 'part', id: 'road_dirt' }); __town.cam.x = 15; __town.cam.y = 12; __town.cam.zoom = 1; });
    const s1 = await T(() => __town.toScreen(13.5, 12.5)), s2 = await T(() => __town.toScreen(16.5, 12.5));
    await p.mouse.move(s1[0], s1[1]); await p.mouse.down(); await p.mouse.move(s2[0], s2[1], { steps: 8 }); await p.mouse.up();
    ok(await T(() => [13, 14, 15, 16].every(x => __town.town.ground[x + ',12'] === 'road_dirt')), 'みちを なぞって ぬる');
    await T(() => { __town.chooseTool({ kind: 'select' }); __town.tapBuild(10.5, 10.5); });
    await p.click('#act [data-a=move]'); await T(() => { __town.tapBuild(12.5, 13.5); __town.tapBuild(12.5, 13.5); });
    ok(await T(() => __town.town.objects.some(o => o.type === 'house_basic' && o.x === 12 && o.y === 12)), 'うごかす');
    await T(() => { __town.chooseTool({ kind: 'select' }); __town.tapBuild(12.5, 13.5); }); await p.click('#act [data-a=del]');
    ok(await T(() => !__town.town.objects.some(o => o.type === 'house_basic')), 'けす');
    await p.click('#tUndo');
    ok(await T(() => __town.town.objects.some(o => o.type === 'house_basic' && o.x === 12)), 'もどす');
    // まちの おみせ（⭐は おうちと きょうつう）
    await T(() => __town.setMode('view')); await p.click('#bShop');
    ok(/まちの おみせ/.test(await p.textContent('#ov')), 'まちの おみせが ひらく');
    await p.click('[data-act=tpart] >> nth=0'); await p.click('#ov [data-act=tshop]');
    ok(/まちの おみせ/.test(await p.textContent('#ov')), '「もどる」で おみせの いちらんに もどる');
    await p.click('#ov [data-act=close]');
    ok(await p.evaluate(() => document.getElementById('ov').classList.contains('hide')), '「とじる」で とじる');
    await p.evaluate(() => __town.tapView(19.5, 17.5)); await p.click('#ov [data-act=close]');
    ok(await p.evaluate(() => document.getElementById('ov').classList.contains('hide')), 'モコの おうちの「まちに いる」で とじる');
    await p.evaluate(() => { const h = __town.town.objects.find(o => o.type === 'moko_house'); ACT.tlooks(h.id); }); await p.click('#ov [data-act=close]');
    ok(await p.evaluate(() => document.getElementById('ov').classList.contains('hide')), 'みための「おわり」で とじる');
    await p.click('#bShop');
    await p.click('[data-act=tshopcat][data-arg=park]'); await p.click('[data-act=tpart][data-arg=lamp]'); await p.click('[data-act=tbuy]');
    ok(await T(() => S.points === 90 && JSON.parse(localStorage.getItem('moko-math-v1')).points === 90 && __town.town.unlockedParts.includes('lamp')), 'かうと ⭐が へって つかえる ように なる');
    await T(() => __town.buy('lamp')); ok(await T(() => S.points === 90), 'おなじ ものは 2かい かえない');
    await T(() => __town.buy('fountain')); ok(await T(() => S.points === 90 && !__town.town.unlockedParts.includes('fountain')), '⭐が たりないと かえない');
    await T(() => { closePop(); __town.setMode('build'); __town.chooseTool({ kind: 'part', id: 'lamp', r: 0 }); __town.tapBuild(24.5, 26.5); __town.tapBuild(24.5, 26.5); __town.setMode('view'); });
    ok(await T(() => __town.town.objects.some(o => o.type === 'lamp')), 'かった パーツを おける');
    // じゅうにん
    await T(() => { const h = __town.town.objects.find(o => o.type === 'house_basic'); __town.toggleResident(h.id, 'c_hamster'); __town.toggleResident(h.id, 'c_unicorn'); closePop(); });
    ok(await T(() => JSON.stringify(__town.town.objects.find(o => o.type === 'house_basic').residents)) === '["c_hamster"]', 'もっている キャラだけ すめる');
    await T(() => __town.people.list.forEach(q => { q.wait = 0; })); await p.waitForTimeout(2500);
    ok(await T(() => __town.people.list.some(q => q.id === 'c_hamster' && q.state !== 'home')), 'じゅうにんが まちを あるく');
    // まちレベル・あたらしい とち
    ok(await T(() => __town.town.townLevel === 1 && !__town.town.unlockedAreas.includes('forest')), 'さいしょは Lv1・まんなかだけ');
    await T(() => { __town.setMode('build'); __town.chooseTool({ kind: 'part', id: 'tree_basic', r: 0 }); __town.tapBuild(15.5, 3.5); });
    ok(await T(() => __town.ui.pending && __town.ui.pending.reason === 'lock'), 'ひらいて いない とちには おけない');
    await T(() => { const add = (type, x, y) => __town.town.objects.push({ id: 'z' + x + y, type, x, y, r: 0, residents: [] }); add('house_basic', 9, 26); add('house_basic', 12, 26); add('flowerbed', 9, 29); add('swing', 12, 29); add('tree_pine', 15, 29); add('mailbox', 16, 29); add('rock', 17, 29); __town.changed(); });
    ok(await T(() => __town.town.townLevel >= 2 && __town.town.unlockedAreas.includes('forest') && __town.town.objects.some(o => o.y <= 7 && /tree/.test(o.type))), 'レベルが あがると もりの エリアが ひらく ' + await T(() => JSON.stringify(__town.levelInfo())));
    ok(/レベル アップ/.test(await p.textContent('#ov')), 'レベル アップの おしらせ');
    await T(() => { closePop(); __town.setMode('view'); });
    // おうちの なか（おへやで もっている かぐ）
    await T(() => { const h = __town.town.objects.find(o => o.type === 'house_basic' && o.residents && o.residents.includes('c_hamster')); __town.setInside(h.id, 'u_bed'); __town.setInside(h.id, 'w_dots'); __town.setInside(h.id, 'u_castle'); __town.openInside(h); });
    ok(await T(() => { const h = __town.town.objects.find(o => o.residents && o.residents.includes('c_hamster')); return JSON.stringify(h.room); }) === '{"wall":"w_dots","floor":"f_wood","furn":["u_bed"]}', 'おうちの なかに もっている かぐ・かべを おける（もっていない ものは おけない）');
    ok(/ハムスター/.test(await p.textContent('#ov')) && await p.locator('#ov .inroom svg').count() === 1, 'おうちの なかに すんでいる キャラ');
    await T(() => closePop());
    // じゅうにんの おねがい（フェーズ4）
    await T(() => { const add = (type, x, y) => __town.town.objects.push({ id: 'f' + x + y, type, x, y, r: 0 }); for (let i = 0; i < 5; i++) add('flower_red', 9 + i, 31); __town.changed(); });
    const q0 = await T(() => __town.activeQuests().find(a => a.q.id === 'flowers'));
    ok(q0 && q0.ok && await T(() => !document.getElementById('qbadge').hidden), 'おはなを 5こ うえると おねがい たっせい（バッジ）');
    ok(await T(() => !__town.town.unlockedParts.includes('flower_rainbow')) && !/にじいろの はな/.test(await T(() => { ACT.tshopcat('nature'); const t = document.getElementById('ov').textContent; closePop(); return t; })), 'ごほうびの パーツは おみせに ない');
    await p.click('#bQuest'); await p.click('[data-act=tclaim][data-arg=flowers]');
    ok(await T(() => __town.town.quests.done.includes('flowers') && __town.town.unlockedParts.includes('flower_rainbow')), 'うけとると ごほうびの パーツが つかえる');
    await T(() => closePop());
    // ほんかくてきな いえづくり（フェーズ5）
    await T(() => { __town.town.unlockedParts.push('house_custom', 'shape_round', 'deco_heart'); __town.setMode('build'); __town.chooseTool({ kind: 'part', id: 'house_custom', r: 0 }); __town.tapBuild(25.5, 29.5); __town.tapBuild(25.5, 29.5); __town.setMode('view'); });
    await T(() => { const h = __town.town.objects.find(o => o.type === 'house_custom'); __town.openLooks(h); });
    await p.click('[data-act=tlook][data-arg$="size|3x2"]'); await p.click('[data-act=tlook][data-arg$="shape|round"]'); await p.click('[data-act=tlook][data-arg$="deco|heart"]');
    ok(await T(() => { const h = __town.town.objects.find(o => o.type === 'house_custom'); return h.size.join() === '3,2' && h.look.shape === 'round' && h.look.deco.includes('heart'); }), 'じぶんで つくる おうち：おおきさ・やねの かたち・かざり');
    await p.click('[data-act=ttpl]'); await T(() => closePop());
    await T(() => { __town.setMode('build'); __town.ui.cat = 'house'; __town.chooseTool({ kind: 'select' }); });
    await p.click('#bparts [data-tpl]'); await T(() => { __town.tapBuild(18.5, 26.5); __town.tapBuild(18.5, 26.5); __town.setMode('view'); });
    ok(await T(() => __town.town.objects.filter(o => o.type === 'house_custom' && o.look.shape === 'round' && o.size.join() === '3,2').length === 2), 'おきにいりから おなじ おうちを たてる');
    // 1マスずつ つくる（かべ・ゆか・ドア・ベッド）
    await T(() => { __town.setMode('build'); __town.chooseTool({ kind: 'part', id: 'wall_wood' }); __town.cam.x = 20; __town.cam.y = 22; __town.cam.zoom = 1; });
    const w1 = await T(() => __town.toScreen(18.5, 22.5)), w2 = await T(() => __town.toScreen(22.5, 22.5));
    await p.mouse.move(w1[0], w1[1]); await p.mouse.down(); await p.mouse.move(w2[0], w2[1], { steps: 10 }); await p.mouse.up();
    ok(await T(() => [18, 19, 20, 21, 22].every(x => __town.town.objects.some(o => o.type === 'wall_wood' && o.x === x && o.y === 22))), 'かべを なぞって 1マスずつ おく');
    await T(() => { __town.chooseTool({ kind: 'part', id: 'floor_wood' }); });
    const f1 = await T(() => __town.toScreen(19.5, 23.5)), f2 = await T(() => __town.toScreen(21.5, 23.5));
    await p.mouse.move(f1[0], f1[1]); await p.mouse.down(); await p.mouse.move(f2[0], f2[1], { steps: 8 }); await p.mouse.up();
    ok(await T(() => [19, 20, 21].every(x => __town.town.ground[x + ',23'] === 'floor_wood')), 'ゆかを ぬる');
    await T(() => { __town.town.unlockedParts.push('bed'); __town.chooseTool({ kind: 'part', id: 'bed', r: 0 }); __town.tapBuild(20.5, 24.5); __town.tapBuild(20.5, 24.5); __town.chooseTool({ kind: 'part', id: 'door1', r: 0 }); __town.tapBuild(23.5, 23.5); __town.tapBuild(23.5, 23.5); __town.setMode('view'); });
    ok(await T(() => { const b = __town.town.objects.find(o => o.type === 'bed'); return !!b && Array.isArray(b.residents) && __town.town.objects.some(o => o.type === 'door1'); }), 'ベッドに すめる・ドアを おける');
    // ほぞん・もどる
    await T(() => __town.saveNow()); await p.reload(); await p.waitForSelector('body[data-ready="1"]');
    ok(await T(() => __town.town.objects.some(o => o.type === 'lamp') && __town.town.templates.length === 1 && __town.town.quests.done.includes('flowers') && __town.town.unlockedAreas.includes('forest') && __town.town.objects.find(o => o.room).room.furn[0] === 'u_bed' && __town.town.ground['14,12'] === 'road_dirt' && __town.town.objects.find(o => o.type === 'house_basic').residents[0] === 'c_hamster'), 'とじても のこる（たてもの・みち・すむひと）');
    await p.click('#toRoom'); await p.waitForLoadState(); await p.waitForTimeout(500);
    ok(!p.url().includes('machi') && await T(() => S.points) === 90, 'おへやに もどる（⭐が いっしょ）');
    await T(() => { closePop(); go('shop'); });
    ok(await T(() => !/がいとう|ふんすい|いしだたみ|まちの/.test(document.getElementById('view').textContent) && !ITEMS.some(i => ['lamp', 'fountain', 'house_basic', 'road_stone', 'tree_sakura'].includes(i.id))), 'おへやの おみせに まちの しょうひんは ない');
    ok(await T(() => [...S.owned].sort().join()) === owned0, 'おへやの もちものは かわらない');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / '));
    await ctx.close();
  }

  console.log('14c. IndexedDB が へんじしない ときも まちが ひらく（iPad たいさく）');
  {
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { indexedDB.open = () => ({}); });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(300);
    await p.click('.room .todoor');
    const t0 = Date.now(); const okTown = await p.waitForSelector('body[data-ready="1"]', { timeout: 6000 }).then(() => true).catch(() => false);
    ok(okTown && Date.now() - t0 < 4000, `まちが ひらく（${Date.now() - t0}ms）`);
    if (okTown) { await p.click('#bShop'); ok(/まちの おみせ/.test(await p.textContent('#ov')), 'ボタンも うごく'); }
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await ctx.close();
  }

  console.log('14b. まちの モブじゅうにん：しゅくだいの おてつだい');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, t, ...a) => st(f, Math.min(t || 0, 30), ...a); });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 100; S.settings.goalPts = 0; S.settings.goalAll = 0; save(); localStorage.setItem('piko-prog-v1', JSON.stringify({ best: { 0: 3, 1: 2 } })); localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, started: true, learned: ['A', 'B', 'C', 'D'], words: {} })); });
    await p.goto(B + 'machi/index.html'); await p.waitForSelector('body[data-ready="1"]');
    const T = f => p.evaluate(f);
    ok(await T(() => ['mob_pig', 'mob_tanuki', 'mob_chick', 'mob_frog'].every(id => __town.people.list.some(q => q.id === id && q.mob))), 'モブじゅうにん 4にんが まちに いる');
    const hw = await T(() => Object.fromEntries(['mob_pig', 'mob_tanuki', 'mob_chick', 'mob_frog'].map(id => [id, __town.hwState({ id, subj: { mob_pig: 'sansu', mob_tanuki: 'kokugo', mob_chick: 'eigo', mob_frog: 'prog' }[id] }).active])));
    ok(/^(add|sub|mul|clock)/.test(hw.mob_pig.key) && /^(k|kotoba|yomi|kata|bun)/.test(hw.mob_tanuki.key) && /^ea/.test(hw.mob_chick.key) && +hw.mob_frog.key <= 2, 'しゅくだいは それぞれの きょうかの テスト・ステージ ' + JSON.stringify([hw.mob_pig.key, hw.mob_tanuki.key, hw.mob_chick.key, hw.mob_frog.key]));
    await T(() => __town.openHomework({ id: 'mob_pig', name: 'こぶたの ブブ', subj: 'sansu', sname: 'さんすう', page: '../sansu/index.html' }));
    await p.click('#ov a.big'); await p.waitForLoadState(); await p.waitForTimeout(500);
    ok(/sansu\/index.html#hw=mob_pig\|/.test(p.url()) && /れんしゅう/.test(await p.textContent('#ov')), 'てつだう → さんすうの テストれんしゅう が ひらく');
    await p.click('#ov [data-act=tstart]'); await p.waitForFunction(() => test && test.phase === 'run', null, { timeout: 8000 });
    await T(() => { test.t0 = performance.now() - test.limit; }); await p.waitForSelector('#ov .hwdone', { timeout: 8000 });
    ok(await T(() => S.hw.mob_pig > 0), 'れんしゅうが おわると しゅくだい できた');
    await p.click('#ov .hwdone a'); await p.waitForSelector('body[data-ready="1"]'); await p.waitForTimeout(800);
    ok(/ありがとう/.test(await p.textContent('#ov')) && await T(() => __town.town.mobs.mob_pig.doneAt > 0), 'まちに もどると おれい');
    const pts = await T(() => S.points);
    await T(() => closePop()); await p.reload(); await p.waitForSelector('body[data-ready="1"]'); await p.waitForTimeout(600);
    ok(await T(() => S.points) === pts && await T(() => !__town.hwState({ id: 'mob_pig', subj: 'sansu' }).active), 'おれいは 1かいだけ・すぐには でない');
    await T(() => { __town.town.mobs.mob_pig.doneAt -= 60 * 60 * 1000 + 1000; });
    ok(await T(() => !!__town.hwState({ id: 'mob_pig', subj: 'sansu' }).active), '1じかん たつと また しゅくだい');
    // プログラミング：ステージを クリア
    const st = await T(() => __town.town.mobs.mob_frog.key);
    await p.goto(B + 'program/index.html#hw=mob_frog|0'); await p.waitForTimeout(400);
    await T(() => { __town; }).catch(() => {});
    await p.evaluate(() => { prog = [{ t: 'R' }, { t: 'R' }, { t: 'R' }, { t: 'R' }]; render(); run(); }); await p.waitForSelector('#pop', { timeout: 10000 });
    ok(await T(() => !!document.querySelector('#pop a[href="../machi/index.html"]') && JSON.parse(localStorage.getItem('moko-math-v1')).hw.mob_frog > 0), 'プログラミング：その ステージを クリアで しゅくだい できた（stage ' + st + '）');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await ctx.close();
  }

  console.log('15. 学習レポート（学習履歴の記録・保護者画面）');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    await ctx.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, t, ...a) => st(f, Math.min(t || 0, 40), ...a); });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    const tap = async v => { for (const ch of String(v)) await p.click(`.pad [data-act=key][data-arg="${ch}"]`); await p.click('.pad [data-act=answer]'); };
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { closePop(); S.points = 0; S.settings.goalPts = 0; S.settings.goalAll = 0; save(); });
    const save0 = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('moko-math-v1')); return JSON.stringify({ owned: d.owned, equip: d.equip, tests: d.tests }); });
    await p.goto(B + 'sansu/index.html'); await p.waitForTimeout(300);
    await p.click('[data-act=start] >> nth=0');
    const a1 = await p.evaluate(() => quiz.cur.ans), k1 = await p.evaluate(() => quiz.cur.p.join(''));
    await tap(a1); await p.waitForTimeout(200);
    let n = await p.evaluate(async () => { await LH.flushed(); return (await LH.getAttempts()).length; });
    ok(n === 1, '1. 問題を解くと 履歴が 1件');
    const a2 = await p.evaluate(() => quiz.cur.ans); await tap((a2 + 1) % 10 || 1); await tap(a2); await p.waitForTimeout(200);
    const r = await p.evaluate(async () => { await LH.flushed(); const a = await LH.getAttempts(); return { n: a.length, s: LH.summarize(a), last: a.slice(-2).map(x => [x.attemptNumber, x.isCorrect, x.questionInstanceId]) }; });
    ok(r.n === 3 && r.last[0][2] === r.last[1][2] && r.last[0][0] === 1 && r.last[1][0] === 2, '2. 解き直すと 回答が 追加（同じ出題・2回目）');
    ok(r.s.questions === 2 && r.s.firstOk === 1 && r.s.retryOk === 1, '3. 解き直しても 初回正答率は 変わらない（1/2）・解き直し成功 1');
    ok(await p.evaluate(async () => (await LH.getAttempts()).every(a => a.activeMs >= 0 && a.activeMs <= 60000 && a.responseTimeMs >= 0)), '5. 学習時間（表示中のみ・上限つき）');
    // 4. べつの ひに おなじ もんだい → べつの しゅつだい
    const inst = await p.evaluate(async () => { const a = await LH.getAttempts(); return new Set(a.map(x => x.questionInstanceId)).size; });
    await p.click('[data-act=go][data-arg=select]').catch(() => { }); await p.goto(B + 'sansu/index.html'); await p.waitForTimeout(300); await p.click('[data-act=start] >> nth=0');
    await tap(await p.evaluate(() => quiz.cur.ans)); await p.waitForTimeout(200);
    ok(await p.evaluate(async () => { await LH.flushed(); const a = await LH.getAttempts(); return new Set(a.map(x => x.questionInstanceId)).size; }) === inst + 1, '4. 新しく出題されると 新しい出題として記録（同じ問題でも 別の出題ID）');
    // こくご・テスト
    await p.goto(B + 'kokugo/index.html'); await p.waitForTimeout(300); await p.click('[data-act=start] >> nth=0');
    await p.click(`[data-act=pick][data-arg="${await p.evaluate(() => (quiz.cur.choices.indexOf(quiz.cur.ans) + 1) % quiz.cur.choices.length)}"]`);
    await p.waitForTimeout(100); await p.evaluate(async () => LH.flushed());
    // 17. ほぞんに しっぱいしても べんきょうは とまらない
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await ctx2.addInitScript(() => { indexedDB.open = () => { throw new Error('blocked'); }; });
    const p2 = await ctx2.newPage(); const e2 = []; p2.on('pageerror', e => e2.push(e.message));
    await p2.goto(B + 'sansu/index.html'); await p2.waitForTimeout(300); await p2.click('[data-act=start] >> nth=0');
    const pa = await p2.evaluate(() => S.points); const ans2 = await p2.evaluate(() => quiz.cur.ans);
    for (const ch of String(ans2)) await p2.click(`.pad [data-act=key][data-arg="${ch}"]`); await p2.click('.pad [data-act=answer]');
    ok(await p2.evaluate(() => S.points) > pa && e2.length === 0, '17. 履歴の保存に失敗しても 問題・星は ふつうに うごく');
    await ctx2.close();
    // 保護者画面
    await p.goto(B + 'parent/index.html'); await p.waitForTimeout(400);
    ok(await p.isVisible('#gate') && !await p.isVisible('#report') && !/初回正答率/.test(await p.textContent('body')), '16. 直接URLで ひらいても 保護者確認なしでは 見られない');
    const gate = async () => { const [x, y] = (await p.textContent('#gq')).match(/\d+/g).map(Number); await p.fill('#gin', String(x * y)); await p.click('#gok'); await p.waitForSelector('#report:not([hidden]) .kpis'); };
    await p.fill('#gin', '1'); await p.click('#gok'); ok(/ちがいます/.test(await p.textContent('#gmsg')), 'まちがえると ひらかない');
    await gate();
    const kp = await p.textContent('.kpis');
    ok(/50%/.test(kp) && /4問/.test(kp) && /2 \/ 4問/.test(kp), '概要：問題数 4・初回正答率 50%（解き直しは 含めない） ' + kp.replace(/\s+/g, ' ').slice(0, 80));
    for (const k of ['today', '30', 'all', '7']) await p.click(`#ptabs [data-p="${k}"]`);
    ok(await p.isVisible('.kpis'), '6. 期間を 切り替えられる');
    const topic = await p.evaluate(() => [...document.querySelectorAll('.subj')].map(x => x.textContent.replace(/\s+/g, ' ')).join(' | '));
    ok(/算数/.test(topic) && /国語/.test(topic) && /0%（1問/.test(topic), '7. 教科別・単元別の 正答率 ' + topic.slice(0, 120));
    ok(await p.locator('#mist .item').count() === 2 && /正解：/.test(await p.textContent('#mist')), '8. まちがえた問題の 内容（問題・こたえ・正解）');
    // 11・12 バックアップ
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#exj')]);
    const file = path.join(require('os').tmpdir(), 'moko-lh-test.json'); await dl.saveAs(file);
    const js = JSON.parse(fs.readFileSync(file, 'utf8'));
    ok(js.format === 'moko-learning-history' && js.attempts.length === 5, '11. JSON に 保存できる（' + js.attempts.length + '件）');
    await p.evaluate(async () => { await LH.clearAll(); });
    await p.setInputFiles('#imf', file); await p.click('.dlg [data-x="1"]'); await p.waitForTimeout(500);
    ok(await p.evaluate(async () => (await LH.getAttempts()).length) === 5, '12. バックアップから 復元できる');
    await p.setInputFiles('#imf', file); ok(/すでにある（同じID）5件/.test(await p.textContent('.dlg')), '同じIDは 重複して 入れない'); await p.click('.dlg [data-x="0"]');
    fs.writeFileSync(file, JSON.stringify({ hello: 1 })); await p.setInputFiles('#imf', file); await p.waitForTimeout(200);
    ok(/ではありません/.test(await p.textContent('#bkmsg')), '不正な ファイルは 拒否');
    // 9. さいきどう・10. オフライン
    await p.reload(); await gate();
    ok(/4問/.test(await p.textContent('.kpis')), '9. 再読み込みしても 履歴が 残る');
    ok(await p.evaluate(() => sessionStorage.getItem('moko-parent-ok')) === null, '画面を 離れると 閲覧状態を 終える');
    await p.goto(B + 'index.html'); await p.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready); await p.waitForTimeout(2500);
    await ctx.setOffline(true); await p.goto(B + 'parent/index.html').catch(() => { }); await p.waitForTimeout(500);
    let offOk = false; try { await gate(); offOk = /4問/.test(await p.textContent('.kpis')); } catch (e) { }
    ok(offOk, '10. オフラインでも 履歴を 見られる'); await ctx.setOffline(false);
    // 13・15 きぞんの データ
    await p.goto(B + 'index.html'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('moko-math-v1')); return JSON.stringify({ owned: d.owned, equip: d.equip, tests: d.tests }); }) === save0, '13・15. 星いがいの セーブデータ（持ち物・着せかえ・テスト）は そのまま');
    // 設定画面の 入口
    await p.evaluate(() => { closePop(); gate(); }); const [g1, g2] = (await p.textContent('#ov')).match(/(\d) × (\d)/).slice(1).map(Number);
    await p.fill('#gatein', String(g1 * g2)); await p.click('#ov [data-act=gateok]');
    await p.click('a[href="parent/index.html"]'); await p.waitForSelector('#report:not([hidden]) .kpis', { timeout: 5000 }).catch(() => { });
    ok(await p.isVisible('.kpis'), '⚙️設定の「📊 学習レポート」から ひらける（かけ算を 通ったあと）');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await ctx.close();
  }

  console.log('16. さんすう：くく・とけい');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(300);
    await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('moko-math-v1')); delete d.settings.types.mul1; delete d.settings.types.clock1; d.t = Date.now() + 9e9; localStorage.setItem('moko-math-v1', JSON.stringify(d)); });
    await p.goto(B + 'sansu/index.html'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => ['mul1', 'mul2', 'clock1', 'clock2'].every(id => S.settings.types[id] && S.settings.types[id].on) && ['mul1-3', 'mul2-3', 'clock1-3', 'clock2-3'].every(k => testItem(k))), 'ふるい データでも くく・とけいが オン、テストの ごほうびが ある');
    const tap = async v => { for (const ch of String(v)) await p.click(`.pad [data-act=key][data-arg="${ch}"]`); await p.click('.pad [data-act=answer]'); };
    for (const tid of ['mul2', 'clock1', 'clock2']) {
      await p.goto(B + 'sansu/index.html'); await p.waitForTimeout(300); await p.click(`[data-act=start][data-arg=${tid}]`);
      const c = await p.evaluate(() => quiz.cur); await tap(c.ans); await p.waitForTimeout(100);
      const okc = await p.evaluate(() => quiz.ok === 1), want = c.p[1] === '×' ? c.p[0] * c.p[2] : c.p[3] === 'h' ? c.p[0] : c.p[2];
      ok(okc && c.ans === want && (c.p[1] !== '⏰' || await p.locator('.clockq svg').count() === 1), `${tid}：こたえ ${c.ans}（${c.p.join(' ')}）`);
    }
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('17. まるごと バックアップ（ファイル）');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(async () => { closePop(); S.points = 777; S.owned.push('h_crown'); save();
      localStorage.setItem('piko-prog-v1', JSON.stringify({ best: { 0: 3, 1: 2 } }));
      localStorage.setItem('abc-adventure-v1', JSON.stringify({ v: 1, t: 5, started: true, stars: 12, learned: ['A', 'B'] }));
      localStorage.setItem('moko-town-v1', JSON.stringify({ version: 1, t: 5, townName: 'テストの まち', objects: [], ground: { '10,10': 'road_dirt' } }));
      localStorage.setItem('robomoko-build-v1', JSON.stringify({ v: 1, t: 5, world: { size: [16, 12, 16], blocks: [[1, 1, 1, 'wood']] } }));
      await LH.importData({ format: 'moko-learning-history', version: 1, attempts: [{ id: 'x1', ts: Date.now(), questionInstanceId: 'q1', subject: 'sansu', topic: 'add1', isCorrect: true, attemptNumber: 1 }], sessions: [] }); });
    const gate = async () => { await p.evaluate(() => gate()); const [x, y] = (await p.textContent('#ov')).match(/(\d) × (\d)/).slice(1).map(Number); await p.fill('#gatein', String(x * y)); await p.click('#ov [data-act=gateok]'); };
    await gate();
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=fullsave]')]);
    const file = path.join(require('os').tmpdir(), 'moko-full-test.json'); await dl.saveAs(file);
    const js = JSON.parse(fs.readFileSync(file, 'utf8'));
    ok(js.format === 'moko-house-backup' && Object.keys(js.data).length === 5 && js.data['moko-math-v1'].points === 777 && js.history.attempts.length === 1, 'ぜんぶの へや＋学習記録を 1つの ファイルに 保存');
    // こわして から ふくげん
    await p.evaluate(async () => { S.points = 1; S.owned = S.owned.filter(i => i !== 'h_crown'); save(); ['piko-prog-v1', 'abc-adventure-v1', 'moko-town-v1', 'robomoko-build-v1'].forEach(k => localStorage.removeItem(k)); await LH.clearAll(); });
    await p.setInputFiles('#fullin', file); await p.waitForSelector('#ov [data-act=fullyes]');
    ok(/⭐ 777/.test(await p.textContent('#ov')), '復元の まえに 中身を 確認');
    await p.click('#ov [data-act=fullyes]'); await p.waitForTimeout(600);
    const r = await p.evaluate(async () => ({ pts: S.points, crown: S.owned.includes('h_crown'), prog: JSON.parse(localStorage.getItem('piko-prog-v1')).best[1], abc: JSON.parse(localStorage.getItem('abc-adventure-v1')).stars, town: JSON.parse(localStorage.getItem('moko-town-v1')).townName, build: JSON.parse(localStorage.getItem('robomoko-build-v1')).world.blocks.length, lh: (await LH.getAttempts()).length }));
    ok(r.pts === 777 && r.crown && r.prog === 2 && r.abc === 12 && r.town === 'テストの まち' && r.build === 1 && r.lh === 1, 'ファイルから ぜんぶ 復元 ' + JSON.stringify(r));
    await p.goto(B + 'machi/index.html'); await p.waitForSelector('body[data-ready="1"]');
    ok(await p.evaluate(() => __town.town.townName === 'テストの まち' && S.points === 777), '復元した まち・⭐が つかわれる');
    await p.goto(B + 'index.html'); await p.waitForTimeout(300); await gate();
    fs.writeFileSync(file, JSON.stringify({ format: 'other' })); await p.setInputFiles('#fullin', file); await p.waitForTimeout(200);
    ok(/ありません/.test(await p.textContent('#fullmsg')) && await p.evaluate(() => S.points) === 777, 'ちがう ファイルは 読まない');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await ctx.close();
  }

  console.log('18. ブロックタウン：おだい 5ステージ・プログラミングの へやから はいる');
  {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'index.html'); await p.waitForTimeout(300); await p.evaluate(() => { closePop(); S.points = 0; S.settings.goalPts = 0; S.settings.goalAll = 0; save(); });
    await p.goto(B + 'program/index.html'); await p.waitForTimeout(300);
    await p.click('a.buildcard'); await p.waitForSelector('body[data-ready="1"]'); await p.click('#helpOk');
    ok(p.url().endsWith('program/build/index.html') && /おだい1/.test(await p.textContent('#qbar')), 'プログラミングの へやから はいれる・おだい1 が でる');
    const done = () => p.evaluate(() => { __build.questNow(); return __build.ui.quest.done.join(); });
    const closeDlg = () => p.evaluate(() => { document.getElementById('questDlg').hidden = true; });
    await p.evaluate(() => { const w = __build.world; for (let x = 2; x < 6; x++) w.place(x, 1, 2, 'wood'); });
    ok(await done() === '1', 'おだい1：きを よこに 4こ'); await closeDlg();
    await p.evaluate(() => { const w = __build.world; for (let x = 2; x < 10; x++) w.place(x, 1, 4, 'stone'); });
    ok(await done() === '1', 'おだい2：くりかえしを つかわないと まだ');
    // ロボットで くりかえし
    await p.click('#tabRobot'); await p.evaluate(() => { __build.robot.moveTo(2, 7); __build.prog = [{ t: 'loop', n: 8, body: [{ t: 'put', b: 'brick' }, { t: 'R' }] }]; __build.runner.speed = 2; });
    await p.click('#rPlay'); await p.waitForFunction(() => __build.runner.state === 'idle', null, { timeout: 15000 }); await p.waitForTimeout(400);
    ok(await done() === '1,2', 'おだい2：ロボットの くりかえしで ながい かべ'); await closeDlg(); await p.click('#tabFree');
    // へや（4×4 の しかく）
    await p.evaluate(() => { const w = __build.world; for (let i = 0; i < 4; i++) { w.place(10 + i, 1, 10, 'wood'); w.place(10 + i, 1, 13, 'wood'); w.place(10, 1, 10 + i, 'wood'); w.place(13, 1, 10 + i, 'wood'); } });
    ok(await done() === '1,2,3', 'おだい3：かこんだ へや'); await closeDlg();
    // おうち（ドア・まど・やね）
    await p.evaluate(() => { const w = __build.world; w.remove(11, 1, 13); w.place(11, 1, 13, 'door'); w.remove(13, 1, 11); w.place(13, 1, 11, 'glass'); for (let x = 10; x < 14; x++) w.place(x, 2, 11, 'roof'); });
    ok(await done() === '1,2,3,4', 'おだい4：ドア・まど・やねで おうち'); await closeDlg();
    await p.evaluate(() => { const w = __build.world; for (const [ox, oz] of [[1, 10], [5, 12]]) { for (let i = 0; i < 3; i++) { w.place(ox + i, 1, oz, 'brick'); w.place(ox + i, 1, oz + 2, 'brick'); w.place(ox, 1, oz + i, 'brick'); w.place(ox + 2, 1, oz + i, 'brick'); } w.remove(ox + 1, 1, oz + 2); w.place(ox + 1, 1, oz + 2, 'door'); w.remove(ox, 1, oz + 1); w.place(ox, 1, oz + 1, 'glass'); for (let x = ox; x < ox + 3; x++) w.place(x, 2, oz + 1, 'roof'); } });
    ok(await done() === '1,2,3,4,5' && /むらびと/.test(await p.textContent('#questCard')), 'おだい5：おうち 3けんで むら');
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('moko-math-v1')).points) === 220, 'ごほうびの ⭐が おうちに とどく（20+30+40+50+80）');
    await p.reload(); await p.waitForSelector('body[data-ready="1"]');
    ok(await p.evaluate(() => __build.ui.quest.done.length === 5) && /ぜんぶ クリア/.test(await p.textContent('#qbar')), 'クリアは のこる・たてものも のこる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await ctx.close();
  }

  console.log('19. きょうの おすすめ・がんばり カレンダー');
  {
    const p = await page();
    await p.goto(B + 'index.html'); await p.waitForTimeout(400);
    await p.evaluate(async () => { closePop(); const out = [], now = Date.now(); let k = 0;
      for (let d = 1; d < 8; d++) { const ts = now - d * 864e5; for (let i = 0; i < 3; i++) out.push({ id: 's' + (k++), ts, day: LH.dayKey(ts), questionInstanceId: 'q' + k, questionKey: 'sansu:sub21:' + i, subject: 'sansu', topic: 'sub21', isCorrect: i === 0, attemptNumber: 1, mode: 'practice', activeMs: 5000 }); }
      await LH.importData({ format: 'moko-learning-history', version: 1, attempts: out, sessions: [] }); S.settings.types.sub21.on = true; S.points = 0; S.settings.goalAll = 0; save(); });
    await p.reload(); await p.waitForTimeout(1200);
    const pops = []; for (let i = 0; i < 4 && await p.$('#ov:not(.hide) .pop'); i++) { pops.push((await p.textContent('#ov')).replace(/\s+/g, '')); await p.click('#ov [data-act=close] >> nth=0'); await p.waitForTimeout(400); }
    ok(pops.some(t => /3にちれんぞく/.test(t)) && pops.some(t => /7にちれんぞく/.test(t)) && await p.evaluate(() => S.owned.includes('h_gambaricrown') && S.points === 20), 'れんぞく 3にち・7にちの ごほうび（⭐20・はなかんむり）');
    ok(/れんぞく.*7.*にち/.test((await p.textContent('.streak')).replace(/\s+/g, '')), 'がんばり カレンダーに れんぞく にちすう');
    ok(await p.isVisible('a.goal.osu[href="sansu/index.html#start=sub21"]'), 'にがてな たんげんが「おすすめ」に でる（れんしゅうへの リンク）');
    // おすすめを 5もん
    await p.click('a.goal.osu'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => view === 'quiz' && quiz.sel === 'sub21'), 'おすすめから その れんしゅうが はじまる');
    for (let i = 0; i < 5; i++) { await p.waitForFunction(() => quiz && !quiz.lock && view === 'quiz'); const a = await p.evaluate(() => quiz.cur.ans); for (const ch of String(a)) await p.click(`.pad [data-act=key][data-arg="${ch}"]`); await p.click('.pad [data-act=answer]'); await p.waitForTimeout(1300); }
    await p.evaluate(() => LH.flushed()); await p.goto(B + 'index.html'); await p.waitForTimeout(1500);
    ok(/おすすめ/.test(await p.textContent('#ov').catch(() => '')) && await p.evaluate(() => S.daily.got.rec === true), 'おすすめを 5もん で ごほうび');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('20. ABCぼうけん ワールド2「こもじの もり」');
  {
    const p = await page({ width: 844, height: 390 });
    await p.goto(B + 'abc/index.html'); await p.waitForTimeout(300);
    const save = clear => ({ v: 1, t: 1, started: true, stars: 30, starsSent: 30, learned: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), lower: clear ? 'abcdefghijklmnopqrstuvwxy'.split('') : [], flags: { intro: true, alphabetClear: clear, bossCleared: true, bridgeOpen: true }, quests: Object.fromEntries(['apple', 'flowers', 'bee', 'sun', 'dog', 'pie', 'cat', 'fish', 'bird', 'colors'].map(q => [q, 'done'])), world: { gate: 'open', gate_forest: 'open', gate_village: 'open', gate_lake: 'open', gate_garden: clear ? 'open' : '' }, areas: ['island', 'forest', 'village', 'lake', 'garden'], hero: { x: 41.5, y: 12.8, dir: 'right', area: 'garden' } });
    // クリア まえは とおれない
    await p.evaluate(s => localStorage.setItem('abc-adventure-v1', JSON.stringify(s)), save(false)); await p.reload(); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(800);
    await p.keyboard.down('ArrowRight'); await p.waitForTimeout(900); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => __abc.area()) === 'garden', 'アルファベットを クリアする まえは こもじの もりに いけない');
    await p.goto(B + 'index.html'); await p.evaluate(s => localStorage.setItem('abc-adventure-v1', JSON.stringify(s)), save(true)); await p.goto(B + 'abc/index.html'); await p.waitForTimeout(400); await p.click('#cont'); await p.waitForTimeout(800);
    ok(/こもじ/.test(await p.evaluate(() => __abc.objective().text)), 'クリアすると「つぎは」が こもじの もりへ');
    await p.keyboard.down('ArrowRight'); await p.waitForTimeout(900); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(900);
    ok(await p.evaluate(() => __abc.area()) === 'lower', 'おしろの したの みちから こもじの もりへ');
    const talkTo = async id => { await p.evaluate(id => __abc.approach(id), id); await p.keyboard.press('Enter'); await p.waitForTimeout(300); for (let k = 0; k < 12 && await p.$('.dlg'); k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(80); } };
    const answerAll = async n => { for (let i = 0; i < n; i++) { await p.waitForSelector('.quiz .ch', { timeout: 5000 }); await p.click(`.ch[data-v="${await p.evaluate(() => __abcQ.answer)}"]`); await p.waitForTimeout(1500); } };
    await talkTo('lowTurtle'); await p.waitForSelector('.teach .pairs'); ok(/Zz/.test((await p.textContent('.teach .pairs')).replace(/\s/g, '')), 'せんせいが おおもじ と こもじの ペアを おしえる'); await p.click('.teach .go');
    await answerAll(6); for (let k = 0; k < 20 && await p.$('.dlg, .notice, .flystar'); k++) { if (await p.$('.dlg')) await p.keyboard.press('Enter'); else if (await p.$('.notice button')) await p.click('.notice button'); await p.waitForTimeout(150); }
    ok(await p.evaluate(() => __abc.S.lower.length === 26 && __abc.S.records['l:Z'] && __abc.S.records['l:Z'].asked >= 1), 'こもじを おぼえて きろく（l:Z）');
    const settle = async () => { for (let k = 0; k < 60; k++) { if (await p.$('.dlg')) await p.keyboard.press('Enter'); else if (await p.$('.notice .go')) await p.click('.notice .go'); else if (await p.evaluate(() => __abc.mode === 'play')) return; await p.waitForTimeout(150); } };
    await settle();
    await talkTo('lowerGate'); await answerAll(6); await p.waitForTimeout(800);
    await settle();
    ok(await p.evaluate(() => __abc.S.flags.lowerClear === true && __abc.S.world.gate_lower === 'open' && __abc.S.stars >= 30 + 2 + 5), 'こもじの もんで さいごの おさらい → クリア（★）');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / ')); await p.context().close();
  }

  console.log('12a. えいごの こえ（iPad で「Capital A」と よまれない）');
  {
    const p = await page(); await p.goto(B + 'abc/index.html'); await p.waitForTimeout(300);
    const r = await p.evaluate(async () => {
      const { LETTERS } = await import('./js/data/letters.js'), { speakable } = await import('./js/engine/audio.js');
      return { bad: LETTERS.filter(L => /^[A-Z]$/.test(L.speak)).map(L => L.id), A: speakable('A'), e: speakable('e'), word: speakable('apple') };
    });
    ok(r.bad.length === 0 && r.A === 'ay' && r.e === 'ee' && r.word === 'apple', 'もじの よみは おおもじ 1つに しない ' + JSON.stringify(r));
    await p.context().close();
  }

  console.log('12. ブロックタウン（program/build/）');
  {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'program/build/index.html');
    await p.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
    ok(await p.evaluate(() => __build.world.count()) === 256 && await p.isVisible('#help'), 'ひらく（くさの じめん 16×16・あそびかた）');
    await p.click('#helpOk'); await p.evaluate(() => { __build.ui.quest.done = [1, 2, 3, 4, 5]; }); // おだいの クリア画面が でない ように
    const W = () => p.evaluate(() => __build.world.toJSON().blocks.filter(b => b[1] > 0).map(b => b.join(':')).sort().join(' '));
    // タッチ：1かいめ プレビュー → 2かいめ おく
    const tapTop = async (x, y, z) => { const s = await p.evaluate(a => __build.toScreen(...a), [x + .5, y + 1, z + .5]); await p.touchscreen.tap(s.x, s.y); await p.waitForTimeout(60); };
    await p.click('.blk[data-id=stone]');
    await tapTop(8, 0, 8);
    ok(await p.evaluate(() => { const t = __build.ui.pending; return t && t.ok && t.x === 8 && t.y === 1 && t.z === 8 && __build.world.count() === 256; }) && await p.isVisible('#ok'), 'タップで プレビュー（まだ おかない）');
    await tapTop(8, 0, 8);
    ok(await W() === '8:1:8:stone', 'もういちど タップで おく');
    await p.click('.blk[data-id=wood]'); await tapTop(8, 1, 8); await p.click('#ok');
    await tapTop(8, 2, 8); await tapTop(8, 2, 8);
    ok(await W() === '8:1:8:stone 8:2:8:wood 8:3:8:wood', 'つみあげる（「ここに おく」ボタンも）');
    // おけない ところ：はなの うえ
    await p.evaluate(() => __build.world.place(3, 1, 3, 'flower'));
    const fl = await p.evaluate(() => __build.toScreen(3.5, 1.72, 3.5));
    await p.touchscreen.tap(fl.x, fl.y);
    ok(await p.evaluate(() => __build.ui.pending && !__build.ui.pending.ok && __build.ui.pending.reason === 'top') && !await p.isVisible('#ok'), 'おけない ところは あかい プレビュー ' + await p.evaluate(() => JSON.stringify(__build.ui.pending)));
    await p.touchscreen.tap(fl.x, fl.y);
    ok(!/3:2:3/.test(await W()), 'おけない ところには おかない');
    // けす
    await p.click('#mErase'); await tapTop(8, 2, 8); await tapTop(8, 2, 8);
    ok(await W() === '3:1:3:flower 8:1:8:stone 8:2:8:wood', 'けす ' + await W());
    await p.click('#undo');
    ok(/8:3:8:wood/.test(await W()), 'もどす');
    await p.click('#redo');
    ok(!/8:3:8:wood/.test(await W()), 'やりなおす');
    // やね（まわす）
    await p.click('.blk[data-id=roof]'); ok(await p.isVisible('#rot'), 'やねは まわせる');
    await p.click('#rot'); await tapTop(10, 0, 10); await tapTop(10, 0, 10);
    ok(/10:1:10:roof:1/.test(await W()), 'むきも ほぞん');
    // カメラ
    const c0 = await p.evaluate(() => __build.scene.camState());
    await p.click('#turnR'); await p.waitForTimeout(500);
    const c1 = await p.evaluate(() => __build.scene.camState());
    await p.click('#zIn');
    const c2 = await p.evaluate(() => __build.scene.camState());
    ok(Math.abs(c1.az - c0.az - Math.PI / 2) < .01 && c2.zoom > c1.zoom, 'カメラ：90ど かいてん・ズーム');
    // まわしたあとも タップの ばしょが あう
    await p.click('.blk[data-id=brick]'); await tapTop(2, 0, 12); await tapTop(2, 0, 12);
    ok(/2:1:12:brick/.test(await W()), 'まわしたあとも おける');
    await p.click('#camReset'); await p.waitForTimeout(600);
    const c3 = await p.evaluate(() => __build.scene.camState());
    ok(Math.abs(c3.az - Math.PI / 4) < .01 && c3.zoom === 1, 'カメラを もとに もどす');
    // ドラッグで まわす（ブロックは おかない）
    const before = await W();
    await p.mouse.move(400, 200); await p.mouse.down(); await p.mouse.move(480, 200, { steps: 5 }); await p.mouse.up();
    ok(await W() === before && Math.abs((await p.evaluate(() => __build.scene.camState())).az - c3.az) > .1, 'ドラッグは かいてんだけ');
    // とじて また ひらいても のこる
    const saved = await W();
    await p.waitForTimeout(500); await p.reload(); await p.waitForSelector('body[data-ready="1"]');
    ok(await W() === saved && !await p.isVisible('#help'), 'とじても のこる（' + saved.split(' ').length + 'こ）');
    // IndexedDB だけ のこっていても よめる
    await p.evaluate(() => localStorage.removeItem('robomoko-build-v1')); await p.reload(); await p.waitForSelector('body[data-ready="1"]');
    ok(await W() === saved, 'IndexedDB からも よめる');
    // はじめから（かくにん つき）
    await p.click('#menu'); await p.click('#askNew'); await p.click('#newNo');
    ok(await W() === saved, '「やめる」なら そのまま');
    await p.click('#menu'); await p.click('#askNew'); await p.click('#newYes');
    ok(await W() === '' && await p.evaluate(() => __build.world.count()) === 256, 'はじめから');
    await p.click('#undo'); ok(await W() === saved, 'はじめからも もどせる');
    // ロボット用：batch は 1かいの もどすで まとめて もどる
    await p.evaluate(() => __build.world.batch(w => { for (let i = 0; i < 3; i++) w.place(0, 1 + i, 0, 'stone'); }));
    await p.click('#undo'); ok(!/0:1:0/.test(await W()), 'batch は まとめて もどる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / '));
    // ほかの セーブには さわらない
    ok(await p.evaluate(() => !localStorage.getItem('moko-math-v1') && !localStorage.getItem('piko-prog-v1')), 'ほかの ゲームの データに さわらない');
    await ctx.close();
  }

  console.log('13. ブロックタウン：ロボットに おねがい');
  {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + 'program/build/index.html');
    await p.waitForSelector('body[data-ready="1"]', { timeout: 15000 }); await p.click('#helpOk'); await p.evaluate(() => { __build.ui.quest.done = [1, 2, 3, 4, 5]; }); // おだいの クリア画面が でない ように
    const W = () => p.evaluate(() => __build.world.toJSON().blocks.filter(b => b[1] > 0).map(b => b.join(':')).sort().join(' '));
    const add = c => p.evaluate(c => document.querySelector(`#rpal [data-cmd='${JSON.stringify(c)}']`).click(), c);
    const idle = () => p.waitForFunction(() => __build.runner.state === 'idle', null, { timeout: 15000 });
    await p.click('#tabRobot'); await p.waitForFunction(() => Math.abs(Math.sin(__build.scene.az * 2)) < .01, null, { timeout: 5000 }).catch(() => {});
    ok(await p.isVisible('#rpanel') && !await p.isVisible('#palette') && await p.evaluate(() => Math.abs(Math.sin(__build.scene.az * 2)) < .01), 'ロボットモード（やじるしが まっすぐに なる むき）');
    await p.evaluate(() => __build.robot.moveTo(2, 10));
    // 4かい くりかえす：きを おく → みぎに すすむ
    await add({ t: 'loop' }); await p.click('#prog .lno'); await p.click('#prog .lno');
    await add({ t: 'put', b: 'wood' }); await add({ t: 'R' });
    ok(await p.evaluate(() => JSON.stringify(__build.prog)) === '[{"t":"loop","n":4,"body":[{"t":"put","b":"wood"},{"t":"R"}]}]', 'めいれいを ならべる（プログラミングと おなじ かたち）');
    await p.click('#rSpeed'); await p.click('#rPlay'); await idle();
    ok(await W() === '2:1:10:wood 3:1:10:wood 4:1:10:wood 5:1:10:wood' && await p.evaluate(() => __build.robot.x === 6), 'じっこうで きの かべが できる');
    await p.click('#undo'); ok(await W() === '', 'じっこう 1かい分を まとめて もどせる');
    await p.click('#redo');
    // うえに つむ（おく を つづけると たかく なる）・こわす
    await p.evaluate(() => { __build.robot.moveTo(8, 4); __build.prog = [{ t: 'put', b: 'stone' }, { t: 'put', b: 'stone' }, { t: 'put', b: 'brick' }, { t: 'break' }, { t: 'wait' }]; });
    await p.click('#rPlay'); await idle();
    ok(/8:1:4:stone 8:2:4:stone/.test(await W()) && !/8:3:4/.test(await W()) && await p.evaluate(() => __build.robot.y === 3), 'つみあげる・こわす・まつ');
    // 1ステップ・いちじていし・ていし
    await p.evaluate(() => { __build.robot.moveTo(12, 12); __build.prog = [{ t: 'put', b: 'brick' }, { t: 'U' }, { t: 'put', b: 'brick' }, { t: 'U' }]; });
    await p.click('#rStep');
    ok(await p.evaluate(() => __build.runner.state === 'pause') && /12:1:12:brick/.test(await W()) && !/12:1:11/.test(await W()) && await p.isVisible('#c0.run'), '1ステップ じっこう（いまの めいれいが ひかる）');
    await p.click('#rStep'); await p.click('#rStep');
    ok(/12:1:11:brick/.test(await W()), 'もう1ステップ');
    await p.click('#rStop'); await idle();
    ok(await p.evaluate(() => __build.runner.state === 'idle' && __build.robot.z === 11), 'ていし（つくった ものは のこる）');
    await p.evaluate(() => { __build.runner.speed = 0; }); await p.click('#rPlay'); await p.waitForTimeout(100); await p.click('#rPlay');
    ok(await p.evaluate(() => __build.runner.state === 'pause'), 'いちじていし');
    await p.click('#rStop'); await idle();
    // まちがい：そとに でる
    await p.evaluate(() => { __build.runner.speed = 2; __build.robot.moveTo(15, 0); __build.prog = [{ t: 'R' }]; });
    await p.click('#rPlay'); await idle();
    ok(await p.isVisible('#c0.err') && /そと/.test(await p.textContent('#toast')), 'そとに でようと すると とまって おしえる');
    // ながすぎる プログラムは いれられない
    await p.evaluate(() => { __build.prog = []; }); for (let i = 0; i < 41; i++) await add({ t: 'wait' });
    ok(await p.evaluate(() => __build.prog.length) === 40, 'めいれいは 40こ まで');
    await p.evaluate(() => { __build.prog = Array.from({ length: 5 }, () => ({ t: 'loop', n: 9, body: Array(7).fill({ t: 'wait' }) })); });
    ok(await p.evaluate(async () => (await import('./js/robot/program.js')).steps(__build.prog).length) <= 600, 'じっこうの かずにも じょうげん');
    // めいれいを タップで けす
    await p.evaluate(() => { __build.prog = [{ t: 'R' }, { t: 'U' }]; });
    await p.click('#c0'); ok(await p.evaluate(() => JSON.stringify(__build.prog)) === '[{"t":"U"}]', 'めいれいを タップで けす');
    // せかいを タップで ロボを うごかす
    const s = await p.evaluate(() => __build.toScreen(7.5, 1, 13.5)); await p.touchscreen.tap(s.x, s.y); await p.waitForTimeout(500);
    ok(await p.evaluate(() => __build.robot.x === 7 && __build.robot.z === 13), 'タップした ところへ ロボが いく');
    // とじても のこる
    await p.waitForTimeout(500); const w0 = await W(); await p.reload(); await p.waitForSelector('body[data-ready="1"]');
    ok(await W() === w0 && await p.evaluate(() => __build.ui.app === 'robot' && __build.robot.x === 7 && JSON.stringify(__build.prog) === '[{"t":"U"}]'), 'プログラム・ロボの ばしょも のこる');
    // つくる モードに もどって てで なおせる
    await p.click('#tabFree'); await p.click('#mErase');
    const t = await p.evaluate(() => __build.toScreen(2.5, 2, 10.5)); await p.touchscreen.tap(t.x, t.y); await p.touchscreen.tap(t.x, t.y);
    ok(!/2:1:10:wood/.test(await W()) && await p.isVisible('#palette'), 'ロボの たてものを てで なおせる');
    ok(p.errs.length === 0, 'エラーなし ' + p.errs.join(' / '));
    await ctx.close();
  }

  await browser.close(); server.close();
  console.log(failed ? `\n${failed}こ しっぱい` : '\nぜんぶ OK');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });

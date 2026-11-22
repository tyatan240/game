// オフラインで あそべるように ファイルを キャッシュする（ぜんぶの へや きょうつう）
const CACHE='moko-house-v27';
const ASSETS=['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png',
  './common/core.js','./common/learning-history.js','./parent/','./parent/index.html','./parent/report.js','./parent/report.css','./common/style.css','./common/piko-192.png',
  './sansu/','./sansu/index.html','./kokugo/','./kokugo/index.html','./program/','./program/index.html','./eigo/','./eigo/index.html',
  './abc/','./abc/index.html','./abc/js/data/areas.js','./abc/js/data/areas/forest.js','./abc/js/data/areas/garden.js','./abc/js/data/areas/lake.js','./abc/js/data/areas/village.js','./abc/js/data/combos.js','./abc/js/data/letters.js','./abc/js/data/quests.js','./abc/js/data/words.js','./abc/js/data/world1.js','./abc/js/engine/art.js','./abc/js/engine/art2.js','./abc/js/engine/audio.js','./abc/js/engine/input.js','./abc/js/game/house.js','./abc/js/game/learning.js','./abc/js/game/magic.js','./abc/js/game/quests.js','./abc/js/game/quiz.js','./abc/js/game/state.js','./abc/js/game/world.js','./abc/js/main.js','./abc/js/ui/ui.js','./abc/style.css',
  './machi/','./machi/index.html','./machi/style.css','./machi/js/main.js','./machi/js/data/parts.js','./machi/js/data/areas.js','./machi/js/data/quests.js','./machi/js/data/mobs.js','./machi/js/town/town.js','./machi/js/town/people.js','./machi/js/render/art.js',
  './program/build/','./program/build/index.html','./program/build/style.css','./program/build/js/main.js','./program/build/js/data/blocks.js','./program/build/js/world/world.js','./program/build/js/world/storage.js','./program/build/js/render/scene.js','./program/build/js/render/textures.js','./program/build/js/render/icons.js','./program/build/js/render/robotModel.js','./program/build/js/robot/program.js','./program/build/js/robot/robot.js','./program/build/js/ui/robotPanel.js','./program/build/js/quest/quests.js','./program/build/js/quest/house.js','./program/build/js/vendor/three.module.min.js'];
// ブラウザの キャッシュを つかわず、かならず サーバーに たしかめて とってくる
const net=req=>fetch(typeof req==='string'||req.mode==='navigate'?(req.url||req):req,{cache:'no-cache'});
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>net(u).then(res=>{if(!res.ok)throw new Error(u);return c.put(u,res)})))));self.skipWaiting()});
// ふるい キャッシュ（まえの ばんや、へやごとに あった キャッシュ）を けす
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// じぶんの キャッシュだけを みる（ふるい キャッシュの ページを ださない）
const mine=req=>caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const put=res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res};
  const url=new URL(e.request.url);
  // ページと きょうつうファイル：ネット優先（更新を すぐ はんえい）→ だめなら キャッシュ
  if(e.request.mode==='navigate'||(url.origin===location.origin&&/\.(html|js|css|json)$/.test(url.pathname))){
    e.respondWith(net(e.request).then(put).catch(()=>mine(e.request).then(r=>r||mine('./index.html'))));return}
  e.respondWith(mine(e.request).then(r=>r||fetch(e.request).then(put))); // その他：キャッシュ優先（フォント・がぞう）
});

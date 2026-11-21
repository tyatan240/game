// オフラインで あそべるように ファイルを キャッシュする（ぜんぶの へや きょうつう）
const CACHE='moko-house-v3';
const ASSETS=['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png',
  './common/core.js','./common/style.css','./common/piko-192.png',
  './sansu/','./sansu/index.html','./kokugo/','./kokugo/index.html','./program/','./program/index.html'];
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

// オフラインで あそべるように ファイルを キャッシュする
const CACHE='piko-prog-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const put=res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res};
  if(e.request.mode==='navigate'){ // ページ本体：ネット優先（更新を反映）→ だめならキャッシュ
    e.respondWith(fetch(e.request).then(put).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(put))); // その他：キャッシュ優先（フォントなど）
});

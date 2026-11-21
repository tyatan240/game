// むかし ルートに あった さんすうハウスの Service Worker を かたづける ためのファイル。
// ふるい ばんを つかっていた たんまつで、ふるい キャッシュを けして じぶんを とりけす。
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil(
  caches.delete('moko-math-v1').then(()=>self.registration.unregister())
)});

// この フォルダに あった ふるい Service Worker を かたづける ためのファイル（いまは ルートの sw.js が ぜんぶを あつかう）。
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>{e.waitUntil(caches.delete("piko-prog-v1").then(()=>self.registration.unregister()))});

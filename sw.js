const C='outloud-v19',IMG='outloud-img-v1',MAXIMG=600;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon-192.png','./apple-touch-icon.png?v=2'])))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==IMG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// copertine e foto: dalla memoria del telefono (istantanee), scaricate una sola volta
const IMGHOST=/(coverartarchive\.org|archive\.org|dzcdn\.net|deezer\.com|wikimedia\.org|scdn\.co|mzstatic\.com)$/;
let trimming=false;
async function trim(){if(trimming)return;trimming=true;try{const c=await caches.open(IMG);const k=await c.keys();for(let i=0;i<k.length-MAXIMG;i++)await c.delete(k[i])}finally{trimming=false}}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
if(u.origin!==location.origin){if(r.destination==='image'&&IMGHOST.test(u.hostname)){e.respondWith(caches.open(IMG).then(async c=>{const hit=await c.match(r.url);if(hit)return hit;
let res;try{res=await fetch(r.url,{mode:'cors',credentials:'omit'})}catch(_){return fetch(r)}if(res.ok){c.put(r.url,res.clone());trim()}return res}).catch(()=>fetch(r)))}return}
e.respondWith(fetch(r,{cache:'no-cache'}).then(x=>{const cp=x.clone();caches.open(C).then(c=>c.put(r,cp));return x}).catch(()=>caches.match(r)))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){d={title:'OutLoud!',body:e.data?e.data.text():''}}e.waitUntil(self.registration.showNotification(d.title||'OutLoud!',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag,data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'./';e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const w of cs){if('navigate'in w){w.focus();return w.navigate(u).catch(()=>{})}}return self.clients.openWindow(u)}))});

/* HOT INFORMATION service worker (Phase 17d): the site opens on a weak connection or offline.
   Rules, in plain words:
   - Pages, scripts, styles, app-data.json: the NETWORK first (so a new upload shows at once), the saved copy only if the network is slow (4 s) or down.
   - Pictures, fonts and the CDN libraries: the saved copy first, refreshed quietly in the background.
   - Never saved: admin.html, Supabase (login, database, files, payments), anything that is not a GET.
   To force every visitor to drop old copies, change VERSION below. */
const VERSION='khip-sw-v1';
const SHELL=['./','index.html','offline.html','styles.css','lang.js','tailwind-config.js','theme.js','brand.js','contact.js','motion.js','menu.js','banner.js','footer.js','auth.js','rich.js','app-data.json'];
const CDN=['cdn.jsdelivr.net','cdnjs.cloudflare.com','cdn.tailwindcss.com','fonts.googleapis.com','fonts.gstatic.com'];
const MAX=160;

self.addEventListener('install',e=>{
  // one missing file must not stop the install
  e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('khip-sw-')&&x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});

const trim=async c=>{const k=await c.keys();if(k.length>MAX)await Promise.all(k.slice(0,k.length-MAX).map(x=>c.delete(x)))};
const keep=async(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const c=await caches.open(VERSION);await c.put(req,res.clone());trim(c)}return res};

const networkFirst=(req,ms)=>new Promise(async ok=>{
  let done=false;const fin=r=>{if(!done&&r){done=true;ok(r)}};
  const timer=setTimeout(async()=>{const m=await caches.match(req,{ignoreSearch:false});fin(m)},ms);
  try{const res=await fetch(req);clearTimeout(timer);keep(req,res.clone()).catch(()=>{});fin(res)}
  catch(_){clearTimeout(timer);const m=await caches.match(req);if(m)fin(m);else if(!done){done=true;ok(Response.error())}}
});
const fromCache=async req=>{
  const m=await caches.match(req);
  const net=fetch(req).then(r=>keep(req,r.clone()).then(()=>r)).catch(()=>null);
  return m||(await net)||Response.error();
};

self.addEventListener('fetch',e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=='GET')return;
  const same=u.origin===location.origin;
  if(!same&&!CDN.includes(u.hostname))return;                    // Supabase and everything else: untouched
  if(same&&/\/(admin\.html|sw\.js)$/.test(u.pathname))return;     // the admin panel is never saved
  if(req.headers.has('range'))return;                              // video / partial files

  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      const r=await networkFirst(req,4000);
      if(r&&r.type!=='error'&&(r.ok||r.type==='opaque'||r.type==='opaqueredirect'||(r.status>=300&&r.status<400)))return r;   // redirects pass through
      return (await caches.match('offline.html'))||r||Response.error();
    })());
    return;
  }
  const img=req.destination==='image'||req.destination==='font'||!same;
  e.respondWith(img?fromCache(req):networkFirst(req,4000));
});

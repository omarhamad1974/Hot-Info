/* Fills a service page (patents.html, trademarks.html, translation.html) from app-data.json.
   The service whose "page" field equals this file name supplies "pageContent":
   text before the first "## " line is the introduction; every "## Heading" becomes a card.
   If the field is empty, or the data can't load, the text already written in the HTML stays. */
(function(){
  const file=location.pathname.split('/').pop()||'',CACHE='khip-data-v3';
  const FALL=['ph-shield-check','ph-users-three','ph-flask','ph-compass','ph-lock-key','ph-magnifying-glass'];
  const E=s=>window.KRich.esc(s);
  function apply(D){
    const sv=(D.services||[]).find(s=>s.page===file);
    if(!sv||!String(sv.pageContent||'').trim())return;
    const intro=[],secs=[];let cur=null;
    for(const l of String(sv.pageContent).replace(/\r/g,'').split('\n')){
      const h=l.match(/^\s*##\s+(.*)$/);
      if(h){cur={t:h[1].trim(),b:[]};secs.push(cur)}else(cur?cur.b:intro).push(l);
    }
    const ii=document.getElementById('pc-intro'),it=intro.join('\n').trim();
    if(ii&&it)ii.innerHTML=window.KRich.rich(it);
    const g=document.getElementById('pc-sections');
    if(g&&secs.length){
      if(!g.dataset.icons)g.dataset.icons=JSON.stringify([...g.querySelectorAll('.card')].map(c=>([...(c.querySelector('i')||{classList:[]}).classList].find(x=>x!=='ph-light'&&/^ph-/.test(x))||'')));
      const ic=JSON.parse(g.dataset.icons);
      g.innerHTML=secs.map((s,i)=>`<div class="fu in"><div class="card h-full p-7"><div class="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><i class="ph-light ${E(ic[i]||FALL[i%FALL.length])} text-2xl"></i></div><h3 class="font-display text-2xl font-semibold text-title mt-4">${E(s.t)}</h3><div class="text-sm md:text-[15px] leading-relaxed mt-2 [&>p]:mt-0">${window.KRich.rich(s.b.join('\n').trim())}</div></div></div>`).join('');
      document.querySelectorAll('[data-pc-static]').forEach(e=>e.remove());
    }
  }
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CACHE))}catch{}
  if(cached)apply(cached);
  fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
    if(JSON.stringify(d)!==JSON.stringify(cached)){try{localStorage.setItem(CACHE,JSON.stringify(d))}catch{}apply(d)}
  }).catch(()=>{});
})();

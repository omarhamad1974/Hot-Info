/* Fills a service page (patents.html, trademarks.html, translation.html) from app-data.json.
   The service whose "page" field equals this file name supplies "pageContent":
   text before the first "## " line is the introduction; every "## Heading" becomes a card.
   If the field is empty, or the data can't load, the text already written in the HTML stays.
   Arabic (right-to-left): the same fields come from app-data.ar.json. Whatever the admin has not
   written in Arabic shows the placeholder "المحتوى العربي" (never English). Short blocks marked
   data-t="..." in the page take their Arabic from Arabic > Page text in the admin. */
(function(){
  const file=location.pathname.split('/').pop()||'',CACHE='khip-data-v3';
  const FALL=['ph-shield-check','ph-users-three','ph-flask','ph-compass','ph-lock-key','ph-magnifying-glass'];
  const E=s=>window.KRich.esc(s);
  const K=window.KLang,rtl=!!(K&&K.rtl);
  function parse(text){
    const intro=[],secs=[];let cur=null;
    for(const l of String(text).replace(/\r/g,'').split('\n')){
      const h=l.match(/^\s*##\s+(.*)$/);
      if(h){cur={t:h[1].trim(),b:[]};secs.push(cur)}else(cur?cur.b:intro).push(l);
    }
    return {intro,secs};
  }
  // What to show for this service: English text, or in Arabic the admin's Arabic text / the placeholder
  function content(sv,en){
    const text=String(sv.pageContent||'');
    if(!rtl)return String(text).trim()?parse(text):null;
    const ar=K.arOr('services',sv.id,'pageContent');
    if(ar!==K.PH)return parse(ar);
    const n=Math.max(1,parse(String((en&&en.pageContent)||'')).secs.length);
    return {intro:[K.PH],secs:Array.from({length:n},()=>({t:K.PH,b:[K.PH]}))};
  }
  function apply(D){
    const sv=(D.services||[]).find(s=>s.page===file);
    if(!sv)return;
    const en=rtl&&K.EN?(K.EN.services||[]).find(s=>s.page===file):sv;
    const c=content(sv,en);
    if(!c)return;
    const ii=document.getElementById('pc-intro'),it=c.intro.join('\n').trim();
    if(ii&&it)ii.innerHTML=window.KRich.rich(it);
    const g=document.getElementById('pc-sections');
    if(g&&c.secs.length){
      if(!g.dataset.icons)g.dataset.icons=JSON.stringify([...g.querySelectorAll('.card')].map(x=>([...(x.querySelector('i')||{classList:[]}).classList].find(y=>y!=='ph-light'&&/^ph-/.test(y))||'')));
      const ic=JSON.parse(g.dataset.icons);
      g.innerHTML=c.secs.map((s,i)=>`<div class="fu in"><div class="card h-full p-7"><div class="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><i class="ph-light ${E(ic[i]||FALL[i%FALL.length])} text-2xl"></i></div><h3 class="font-display text-2xl font-semibold text-title mt-4">${E(s.t)}</h3><div class="text-sm md:text-[15px] leading-relaxed mt-2 [&>p]:mt-0">${window.KRich.rich(s.b.join('\n').trim())}</div></div></div>`).join('');
      document.querySelectorAll('[data-pc-static]').forEach(e=>e.remove());
    }
  }
  if(rtl){
    // Arabic: wait for the data (no cached English flash), then fill everything
    K.data('./app-data.json').then(d=>{if(!K.rtl){location.reload();return}apply(d)}).catch(()=>{}).finally(()=>{K.dom();K.fill()});
    return;
  }
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CACHE))}catch{}
  if(cached)apply(cached);
  const getJson=()=>K?K.data('./app-data.json'):fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject());
  getJson().then(d=>{
    if(K&&K.rtl){location.reload();return}   // the admin switched the site to Arabic only: reload once in Arabic
    if(JSON.stringify(d)!==JSON.stringify(cached)){try{localStorage.setItem(CACHE,JSON.stringify(d))}catch{}apply(d)}
  }).catch(()=>{});
})();

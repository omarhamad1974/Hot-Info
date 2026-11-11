/* blocks.js: shows FAQ, Cards and Gallery blocks on the pages.
   The admin (Website content > Page blocks) decides which group is shown, on which page, and in which order.
   A page only needs <div data-blocks="home"></div> (names: home, about, patents, trademarks, translation).
   Needs lang.js (KLang) and rich.js (KRich). Nothing is drawn when there is nothing to show. Window.KBlocks.render(data, el) is used by the tests. */
(function(root){
  'use strict';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const same=(a,b)=>String(a==null||String(a).trim()===''?'general':a).trim().toLowerCase()===String(b==null||String(b).trim()===''?'general':b).trim().toLowerCase();
  const txt=v=>typeof v==='string'&&v.trim()!=='';
  /* a bare file name lives in ./assets/ (same rule as the rest of the site) */
  const img=u=>esc((typeof window!=='undefined'&&window.kv||(x=>x))(/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u));
  /* links: only web, mail, phone, page and #anchor links are kept */
  const href=u=>{u=String(u||'').trim();return /^(https?:\/\/|mailto:|tel:|#|\.\/|\/|[\w-]+\.html)/i.test(u)?esc(u):''};
  const ext=u=>/^https?:\/\//i.test(String(u||''));
  const rich=t=>root.KRich?root.KRich.rich(t):'<p>'+esc(t).replace(/\n+/g,'<br>')+'</p>';
  const card=t=>root.KRich?root.KRich.card(t):esc(t).replace(/\n/g,'<br>');
  const rtl=()=>document.documentElement.dir==='rtl';
  const L=(k,d)=>{try{const v=root.KLang&&root.KLang.t(k);return v&&v!==k?v:d}catch(_){return d}};

  function faq(rows,uid){
    return '<div class="max-w-3xl space-y-3">'+rows.map((x,i)=>
      '<details class="card group overflow-hidden"><summary class="flex items-center gap-3 p-4 md:p-5 cursor-pointer list-none">'
      +'<span class="flex-1 min-w-0 font-display text-lg md:text-xl font-semibold text-title" dir="auto">'+esc(x.question)+'</span>'
      +'<i class="ph-light ph-caret-down text-xl text-brand-600 flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true"></i></summary>'
      +'<div class="px-4 md:px-5 pb-5 -mt-1 leading-relaxed" dir="auto">'+rich(x.answer)+'</div></details>').join('')+'</div>';
  }

  function cards(rows){
    return '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">'+rows.map(x=>{
      const link=href(x.link),cta=href(x.ctaLink||x.link),ctaText=txt(x.ctaText)?x.ctaText:'';
      const rel=ext(x.ctaLink||x.link)?' target="_blank" rel="noopener"':'';
      const icon=/^ph-/.test(x.icon||'')?esc(String(x.icon).replace(/^ph-light\s*/,'')):'';
      const inner=(txt(x.image)?'<img src="'+img(x.image)+'" alt="'+esc(txt(x.alt)?x.alt:'')+'" loading="lazy" class="w-full h-40 object-cover">':'')
        +'<div class="p-5 md:p-6 flex flex-col gap-3 flex-1">'
        +(icon||txt(x.badge)?'<div class="flex items-center gap-3">'+(icon?'<span class="w-11 h-11 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><i class="ph-light '+icon+' text-2xl" aria-hidden="true"></i></span>':'')+(txt(x.badge)?'<span class="cat-tag">'+esc(x.badge)+'</span>':'')+'</div>':'')
        +'<h3 class="font-display text-xl md:text-2xl font-semibold text-title leading-tight" dir="auto">'+esc(x.title)+'</h3>'
        +(txt(x.description)?'<div class="leading-relaxed" dir="auto">'+card(x.description)+'</div>':'')
        +(txt(x.price)?'<p class="font-display text-2xl font-semibold text-title mt-auto" dir="auto">'+esc(x.price)+'</p>':'')
        +(ctaText&&cta?'<a href="'+cta+'"'+rel+' class="inline-flex self-start items-center gap-2 text-sm font-medium text-brand-700 underline underline-offset-4">'+esc(ctaText)+'</a>':'')
        +'</div>';
      /* whole card is a link only when there is a link and no separate button */
      return link&&!(ctaText&&cta)
        ?'<a href="'+link+'"'+(ext(x.link)?' target="_blank" rel="noopener"':'')+' class="card flex flex-col h-full overflow-hidden">'+inner+'</a>'
        :'<div class="card flex flex-col h-full overflow-hidden">'+inner+'</div>';
    }).join('')+'</div>';
  }

  function gallery(rows,uid){
    return '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" data-kgal="'+uid+'">'+rows.map((x,i)=>
      '<figure class="m-0"><button type="button" data-kgi="'+i+'" class="block w-full overflow-hidden rounded-2xl bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600" aria-label="'+esc(txt(x.caption)?x.caption:(txt(x.alt)?x.alt:L('blk_open','Open picture')))+'">'
      +'<img src="'+img(x.image)+'" alt="'+esc(txt(x.alt)?x.alt:(x.caption||''))+'" loading="lazy" class="w-full aspect-[4/3] object-cover transition-transform duration-500 hover:scale-105"></button>'
      +(txt(x.caption)?'<figcaption class="mt-2 text-sm leading-snug" dir="auto">'+esc(x.caption)+'</figcaption>':'')+'</figure>').join('')+'</div>';
  }

  /* ---- lightbox (one shared, created on first use) ---- */
  let LB=null,LBrows=[],LBi=0,LBfocus=null;
  function lbOpen(rows,i,from){
    LBrows=rows;LBi=i;LBfocus=from||document.activeElement;
    if(!LB){
      LB=document.createElement('div');LB.id='kblocks-lb';LB.setAttribute('role','dialog');LB.setAttribute('aria-modal','true');
      LB.style.cssText='position:fixed;inset:0;z-index:70;background:rgba(10,14,20,.92);display:none;align-items:center;justify-content:center;padding:1rem';
      LB.innerHTML='<figure style="margin:0;max-width:min(92vw,1100px);max-height:92vh;display:flex;flex-direction:column;align-items:center;gap:.75rem"><img id="kb-img" alt="" style="max-width:100%;max-height:78vh;object-fit:contain;border-radius:.75rem"><figcaption id="kb-cap" style="color:#fff;text-align:center;font-size:.95rem"></figcaption></figure>'
        +'<button type="button" id="kb-x" style="position:absolute;top:.75rem;inset-inline-end:.75rem;width:2.75rem;height:2.75rem;border-radius:9999px;background:rgba(255,255,255,.15);color:#fff;font-size:1.4rem" aria-label="'+esc(L('close','Close'))+'">&times;</button>'
        +'<button type="button" id="kb-p" style="position:absolute;inset-inline-start:.5rem;top:50%;transform:translateY(-50%);width:2.75rem;height:2.75rem;border-radius:9999px;background:rgba(255,255,255,.15);color:#fff;font-size:1.4rem" aria-label="'+esc(L('blk_prev','Previous'))+'"></button>'
        +'<button type="button" id="kb-n" style="position:absolute;inset-inline-end:.5rem;top:50%;transform:translateY(-50%);width:2.75rem;height:2.75rem;border-radius:9999px;background:rgba(255,255,255,.15);color:#fff;font-size:1.4rem" aria-label="'+esc(L('blk_next','Next'))+'"></button>';
      document.body.appendChild(LB);
      LB.addEventListener('click',e=>{const id=e.target.id;if(id==='kb-x'||e.target===LB)lbClose();else if(id==='kb-p')lbGo(-1);else if(id==='kb-n')lbGo(1)});
      document.addEventListener('keydown',e=>{if(!LB||LB.style.display==='none')return;
        if(e.key==='Escape')lbClose();else if(e.key==='ArrowLeft')lbGo(rtl()?1:-1);else if(e.key==='ArrowRight')lbGo(rtl()?-1:1);
        else if(e.key==='Tab'){const f=[...LB.querySelectorAll('button')].filter(b=>b.style.display!=='none'),a=document.activeElement;if(!f.length)return;
          if(e.shiftKey&&a===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&a===f[f.length-1]){e.preventDefault();f[0].focus()}}});
    }
    LB.querySelector('#kb-p').textContent=rtl()?'\u203A':'\u2039';LB.querySelector('#kb-n').textContent=rtl()?'\u2039':'\u203A';
    LB.style.display='flex';document.body.style.overflow='hidden';lbShow();LB.querySelector('#kb-x').focus();
  }
  function lbShow(){
    const x=LBrows[LBi]||{};const im=LB.querySelector('#kb-img');im.src=img(x.image).replace(/&amp;/g,'&');im.alt=txt(x.alt)?x.alt:(x.caption||'');
    LB.querySelector('#kb-cap').textContent=x.caption||'';
    const many=LBrows.length>1;LB.querySelector('#kb-p').style.display=many?'':'none';LB.querySelector('#kb-n').style.display=many?'':'none';
  }
  function lbGo(d){LBi=(LBi+d+LBrows.length)%LBrows.length;lbShow()}
  function lbClose(){LB.style.display='none';document.body.style.overflow='';if(LBfocus&&LBfocus.focus)LBfocus.focus()}

  const TYPES={faq:{key:'faq',draw:faq},cards:{key:'cards',draw:cards},gallery:{key:'gallery',draw:gallery}};

  /* html for the blocks of one page */
  function html(D,page){
    const list=(D&&D.blocks)||[];let n=0,out='';
    list.forEach(b=>{
      if(!b||String(b.show)==='0'||String(b.page||'home')!==page)return;
      const T=TYPES[b.type];if(!T)return;
      const rows=((D&&D[T.key])||[]).filter(x=>same(x.group,b.group));
      if(!rows.length)return;
      const uid='b'+String(b.id).replace(/\W/g,'');
      out+='<section id="block-'+esc(b.id)+'" class="band'+(n%2?' bg-surface':'')+'" data-block="'+esc(b.id)+'"><div class="wrap">'
        +(txt(b.title)?'<div><h2 class="h2" dir="auto">'+esc(b.title)+'</h2><span class="rule"></span></div>':'')
        +(txt(b.subtitle)?'<p class="max-w-3xl leading-relaxed mb-6 -mt-3" dir="auto">'+esc(b.subtitle)+'</p>':'')
        +T.draw(rows,uid)+'</div></section>';
      n++;
    });
    return out;
  }

  function render(D,el){
    const page=el.getAttribute('data-blocks')||'home';
    el.innerHTML=html(D,page);
    el.querySelectorAll('[data-kgal]').forEach(g=>{
      const blockId=g.closest('[data-block]').getAttribute('data-block');
      const b=((D&&D.blocks)||[]).find(x=>String(x.id)===blockId)||{};
      const rows=((D&&D.gallery)||[]).filter(x=>same(x.group,b.group));
      g.addEventListener('click',e=>{const t=e.target.closest('[data-kgi]');if(t)lbOpen(rows,+t.getAttribute('data-kgi'),t)});
    });
    const f=location.hash;if(/^#block-/.test(f)){const t=document.getElementById(f.slice(1));if(t)t.scrollIntoView()}
  }

  async function init(){
    const els=[...document.querySelectorAll('[data-blocks]')];if(!els.length||!root.KLang)return;
    try{const D=await root.KLang.data('./app-data.json');els.forEach(e=>render(D,e))}catch(_){/* the page works without blocks */}
  }
  const api={html:html,render:render,init:init,esc:esc};
  root.KBlocks=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof window!=='undefined'?window:globalThis);

/* Page banner: a dark band at the top of each inner page with the breadcrumb trail ("Home > Tenders") and the page title,
   so a visitor always knows where they are. Loaded right after </main> on every page except the home page.
   - The page's own <h1> is moved into the banner (so its translation and text stay as they are).
   - Pages with a changing location call KBanner.set([{t:'My files',fn:()=>...},{t:'Roads'}]) : items with fn or href are links, the last one is the current place.
   - KBanner.last('Entry name') sets only the current place (used by the directory entry page). */
(function(){
  const K=window.KLang,T=(k,d)=>K?K.t(k):d;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  const P={home:['bar_home','Home','index.html'],svc:['bar_services','IP Services','index.html#services'],dir:['nav_directory','Directory','directory.html']};
  const CFG={
    about:{p:['home']},
    patents:{p:['home','svc']},trademarks:{p:['home','svc']},translation:{p:['home','svc']},
    directory:{p:['home']},
    'directory-entry':{p:['home','dir'],title:['dir_title','Directory']},
    'submit-directory':{p:['home','dir']},
    subscribe:{p:['home']},tenders:{p:['home']},'my-stuff':{p:['home']}
  };
  const C=CFG[file],main=document.querySelector('main');
  if(!C||!main)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const banner=document.createElement('div');banner.className='pg-banner';
  banner.innerHTML='<div class="wrap"><nav class="pg-nav" aria-label="Breadcrumb"><ol class="pg-bc"></ol></nav></div>';
  const wrap=banner.firstChild,ol=wrap.querySelector('ol');
  wrap.querySelector('nav').setAttribute('aria-label',T('bc_label','Breadcrumb'));
  let h=null;
  if(C.title){ // the page keeps its own heading further down (it shows the item name), so the banner shows the section title
    const p=document.createElement('p');p.className='pg-title h1 font-display';p.setAttribute('data-i18n',C.title[0]);p.textContent=T(C.title[0],C.title[1]);wrap.appendChild(p);
  }else{
    h=main.querySelector('h1');
    if(h){const nx=h.nextElementSibling;if(nx&&nx.classList.contains('rule'))nx.style.display='none';wrap.appendChild(h)}
  }
  main.insertBefore(banner,main.firstChild);
  document.body.classList.add('pg-has-banner');
  let dyn=null,lastText='';
  const sep='<li aria-hidden="true"><i class="ph-light ph-caret-right flip"></i></li>';
  function render(){
    let html='';
    C.p.forEach(k=>{const [key,def,href]=P[k];html+=`<li><a href="${href}" data-i18n="${key}">${esc(T(key,def))}</a></li>${sep}`});
    const items=dyn||[{t:lastText||(h?h.textContent.trim():'')||(C.title?'\u2026':document.title.split('|')[0].trim())}];
    items.forEach((it,i)=>{
      const last=i===items.length-1;
      if(last)html+=`<li><span class="pg-cur" aria-current="page">${esc(it.t)}</span></li>`;
      else html+=`<li>${it.href?`<a href="${esc(it.href)}">${esc(it.t)}</a>`:`<button type="button" data-bc="${i}">${esc(it.t)}</button>`}</li>${sep}`;
    });
    ol.innerHTML=html;
  }
  ol.addEventListener('click',e=>{const b=e.target.closest('[data-bc]');if(b&&dyn&&dyn[+b.dataset.bc]&&dyn[+b.dataset.bc].fn)dyn[+b.dataset.bc].fn()});
  window.KBanner={
    set(items){dyn=Array.isArray(items)&&items.length?items:null;render()},
    last(t){lastText=String(t||'');dyn=null;render()},
    refresh:render
  };
  render();
  // The heading may be filled in later (translation, data loading): keep the last crumb in step with it
  if(h&&window.MutationObserver)new MutationObserver(()=>{if(!dyn)render()}).observe(h,{childList:true,characterData:true,subtree:true});
})();

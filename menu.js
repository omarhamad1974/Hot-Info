/* KHIP main menu (header menu on big screens + the bottom bar), English and Arabic.
   The items come from app-data.json > menu.items (edit them in admin.html, tab Menu):
     { id, en, ar, link, icon, header: true/false, bar: true/false, hidden: true/false }
   With no "menu" setting the pages keep their built-in menus. Once saved from the admin page, every page shows
   the same menu. window.KMENU.items('header' | 'bar') gives the visible items for one place (null = built-in menu),
   window.KMENU.go(link) opens a link, scrolling when it is on the same page. */
(function(){
  const KEY='khip-menu-v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  const get=u=>fetch(u,{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject());
  const rtl=()=>!!(window.KLang&&window.KLang.rtl);
  let cfg=null,subs=[];
  try{const c=JSON.parse(localStorage.getItem(KEY));if(c&&Array.isArray(c.items))cfg=c}catch{}
  const label=it=>String((rtl()?(it.ar||it.en):(it.en||it.ar))||'').trim();
  const pathOf=u=>u.pathname.replace(/index\.html$/,'').replace(/\/+$/,'')||'/';
  const here=link=>{try{const u=new URL(link,location.href);return u.origin===location.origin&&pathOf(u)===pathOf(location)?u:null}catch{return null}};
  function items(zone){
    if(!cfg)return null;
    return cfg.items.filter(it=>it&&!it.hidden&&it[zone]!==false&&it[zone]!==undefined&&it[zone]!==''&&label(it));
  }
  function go(link){
    const u=here(link),page=document.getElementById('khip-page');
    if(u){
      if(!u.hash||u.hash==='#top'){(page||window).scrollTo({top:0,behavior:'smooth'});return}
      const el=document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if(el&&el.offsetParent!==null){el.scrollIntoView({behavior:'smooth'});return}
    }
    location.href=link;
  }
  function renderHeader(){
    const list=items('header');if(!list)return;
    document.querySelectorAll('header nav[aria-label="Main"]').forEach(nav=>{
      nav.innerHTML=list.map(it=>{
        const u=here(it.link),cur=!!u&&!u.hash;
        const href=u&&u.hash?u.hash:it.link;
        return `<a href="${esc(href)}" class="${cur?'text-brand-700 font-normal':'hover:text-brand-600'} transition"${cur?' aria-current="page"':''}>${esc(label(it))}</a>`;
      }).join('');
      nav.querySelectorAll('a').forEach(a=>{                  // a link to a hidden section is hidden too
        const h=a.getAttribute('href');if(h&&h[0]==='#'){const el=document.getElementById(h.slice(1));if(el&&el.hasAttribute('data-off'))a.setAttribute('data-off','')}
      });
    });
  }
  /* Side (hamburger) menu: settings in menu.side = {enabled, position:'start'|'end', only}; items tick "side".
     A button in the header opens a drawer that slides in from the side; "only" hides the normal top menu links. */
  const BURGER='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/></svg>';
  let drawer=null,veil=null,btn=null,lastFocus=null;
  function closeSide(){if(!drawer)return;drawer.classList.remove('open');veil.classList.remove('open');drawer.setAttribute('aria-hidden','true');if(btn)btn.setAttribute('aria-expanded','false');if(lastFocus&&lastFocus.focus)lastFocus.focus()}
  function openSide(){if(!drawer)return;lastFocus=document.activeElement;drawer.classList.add('open');veil.classList.add('open');drawer.setAttribute('aria-hidden','false');if(btn)btn.setAttribute('aria-expanded','true');const f=drawer.querySelector('a,button');if(f)f.focus()}
  function renderSide(){
    const S=cfg&&cfg.side,list=S&&S.enabled?items('side'):null,root=document.documentElement;
    document.querySelectorAll('.k-burger').forEach(b=>b.remove());
    if(drawer){drawer.remove();veil.remove();drawer=veil=btn=null}
    root.removeAttribute('data-side-only');
    if(!list||!list.length)return;
    const wrap=document.querySelector('header .wrap');if(!wrap)return;
    const end=S.position==='end';
    btn=document.createElement('button');btn.type='button';btn.className='k-burger';btn.setAttribute('aria-haspopup','true');btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label',rtl()?'القائمة':'Menu');btn.innerHTML=BURGER;
    if(end){const last=wrap.lastElementChild;if(last&&/^(DIV|SPAN)$/.test(last.tagName)&&!last.matches('nav')){last.appendChild(btn)}else wrap.appendChild(btn)}
    else{const g=document.createElement('span');g.className='k-burger-grp';const first=wrap.firstElementChild;wrap.insertBefore(g,first);g.appendChild(btn);if(first)g.appendChild(first)}
    veil=document.createElement('div');veil.className='k-veil';
    drawer=document.createElement('aside');drawer.className='k-drawer '+(end?'s-end':'s-start');drawer.setAttribute('aria-hidden','true');drawer.setAttribute('aria-label',rtl()?'القائمة':'Menu');
    drawer.innerHTML=`<div class="k-dh"><span>${rtl()?'القائمة':'Menu'}</span><button type="button" class="k-x" aria-label="${rtl()?'إغلاق':'Close'}"><i class="ph-light ph-x"></i></button></div><nav>`+list.map(it=>{
      const u=here(it.link),cur=!!u&&!u.hash;
      return `<a href="${esc(it.link)}" data-side-go="${esc(it.link)}"${cur?' aria-current="page"':''}><i class="ph-light ${esc(it.icon||'ph-circle')}"></i><span>${esc(label(it))}</span></a>`}).join('')+'</nav>';
    document.body.appendChild(veil);document.body.appendChild(drawer);
    if(S.only)root.setAttribute('data-side-only','1');
    btn.onclick=()=>drawer.classList.contains('open')?closeSide():openSide();
    veil.onclick=closeSide;drawer.querySelector('.k-x').onclick=closeSide;
    drawer.addEventListener('click',e=>{const a=e.target.closest('[data-side-go]');if(!a)return;e.preventDefault();closeSide();go(a.dataset.sideGo)});
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer&&drawer.classList.contains('open'))closeSide()});
  window.KMENU={items,go,label,onChange:fn=>{subs.push(fn)},ICONS:null};
  const apply=()=>{renderHeader();renderSide();subs.forEach(f=>{try{f()}catch{}})};
  ready(()=>{
    apply();
    get('./app-data.json').then(async d=>{
      const K=window.KLang;
      if(K&&K.data){try{await K.data('./app-data.json')}catch{}}
      const m=d.menu&&Array.isArray(d.menu.items)?d.menu:null;
      try{m?localStorage.setItem(KEY,JSON.stringify(m)):localStorage.removeItem(KEY)}catch{}
      if(JSON.stringify(m)!==JSON.stringify(cfg)||rtl()){cfg=m;apply()}
    }).catch(()=>{});
  });
})();

/* Offline support (Phase 17d): registers sw.js. Needs https (Cloudflare gives that) or localhost; otherwise it does nothing. */
(function(){
  if(!('serviceWorker' in navigator)||!(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))return;
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(e=>console.warn('Offline mode not available',e))});
})();

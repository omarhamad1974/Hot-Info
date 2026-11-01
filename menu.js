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
  window.KMENU={items,go,label,onChange:fn=>{subs.push(fn)},ICONS:null};
  const apply=()=>{renderHeader();subs.forEach(f=>{try{f()}catch{}})};
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

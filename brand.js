/* KHIP brand: the logo and the header text come from app-data.json > brand (edit them in admin.html, tab General).
     brand.image    logo file name in assets/ (or a full https address)
     brand.tagline  text next to the logo in the header (empty = the built-in text)
   Arabic text comes from app-data.ar.json > brand.tagline.
   Any <img data-brand-logo> gets the logo. Any element with data-brand-tag gets the header text.
   With nothing set, the pages look exactly as before. Loaded on every public page, after theme.js. */
(function(){
  const KEY='khip-brand-v1',DEF='assets/khip-logo.jpg';
  const url=u=>/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  const get=u=>fetch(u,{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject());
  function apply(b){
    b=b||{};
    const src=b.image&&String(b.image).trim()?url(String(b.image).trim()):DEF;
    document.querySelectorAll('[data-brand-logo]').forEach(im=>{
      if(im.dataset.brandSrc===src)return;
      im.dataset.brandSrc=src;im.style.display='';im.src=src;
      const n=im.parentNode&&im.parentNode.querySelector('[data-brand-name]');if(n)n.hidden=true;
    });
    const rtl=!!(window.KLang&&window.KLang.rtl),t=String((rtl?b.taglineAr:b.tagline)||'').trim();
    document.querySelectorAll('[data-brand-tag]').forEach(el=>{
      if(el.dataset.def===undefined){el.dataset.def=el.textContent;el.dataset.i18n0=el.getAttribute('data-i18n')||''}
      if(t){el.removeAttribute('data-i18n');el.textContent=t;el.dataset.custom='1'}
      else if(el.dataset.custom){                      // the admin cleared it: go back to the built-in text
        delete el.dataset.custom;
        if(el.dataset.i18n0)el.setAttribute('data-i18n',el.dataset.i18n0);
        const K=window.KLang;el.textContent=(K&&K.t&&el.dataset.i18n0)?K.t(el.dataset.i18n0):el.dataset.def;
      }
    });
  }
  // A logo that fails to load falls back to the built-in logo; if that fails too, the header shows the text KHIP.
  document.addEventListener('error',e=>{
    const im=e.target;if(!im||!im.matches||!im.matches('[data-brand-logo]'))return;
    if(!/khip-logo\.jpg$/.test(im.getAttribute('src')||'')){im.dataset.brandSrc=DEF;im.src=DEF;return}
    im.style.display='none';const n=im.parentNode&&im.parentNode.querySelector('[data-brand-name]');if(n)n.hidden=false;
  },true);
  let cached=null;try{cached=JSON.parse(localStorage.getItem(KEY))}catch{}
  ready(()=>{
    if(cached)apply(cached);
    get('./app-data.json').then(async en=>{
      const b=Object.assign({},en.brand||{}),K=window.KLang;
      if(K&&K.data){try{await K.data('./app-data.json')}catch{}}      // lets the language follow the site settings first
      if(K&&K.rtl){try{b.taglineAr=(((K.AR)||await get('./app-data.ar.json')).brand||{}).tagline||''}catch{}}
      try{localStorage.setItem(KEY,JSON.stringify(b))}catch{}
      apply(b);
    }).catch(()=>{});
  });
})();

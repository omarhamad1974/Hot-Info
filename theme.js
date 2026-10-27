/* KHIP theme: site colours, section backgrounds and section width.
   Loaded in <head> on every public page. The values come from "theme" in app-data.json
   (edit them in admin.html, tabs Colors and Backgrounds). With no "theme" block the defaults
   below apply, and they are the colours the site always used. */
(function(){
  const CACHE='khip-data-v3';
  // Default palette = the colours the site used before the palette existed.
  const DEFAULTS={title:'#173a7a',ink:'#1b2433',gold:'#a8844f',accent:'#1d4ed8',accentDark:'#1e40af',accentSoft:'#eff6ff',sand:'#d9c8a4',page:'#f7f6f3',surface:'#ffffff',text:'#3a4051'};
  // [key, name, where it is used]
  const ROLES=[
    ['title','Titles','All headings, subtitles and card titles'],
    ['ink','Dark','Buttons, the bottom bar and dark panels'],
    ['gold','Gold','Thin lines and quote marks'],
    ['accent','Accent blue','Icons, links, hover colour and the map'],
    ['accentDark','Accent blue, dark','Map hover and active links'],
    ['accentSoft','Accent blue, soft','Round icon backgrounds'],
    ['sand','Sand','WhatsApp and inquiry buttons'],
    ['page','Page background','Main page colour'],
    ['surface','Section background','Alternating white sections'],
    ['text','Body text','Paragraph text']
  ];
  // Sections that can get their own background. [key, label]
  const SECTIONS=[
    ['home-about','Home page: logo and About text'],
    ['home-jurisdictions','Home page: Jurisdictions'],
    ['home-services','Home page: IP Services'],
    ['home-news','Home page: Latest news'],
    ['home-testimonials','Home page: Client endorsements'],
    ['about-intro','About page: About KHIP'],
    ['about-map','About page: Our Regional Coverage'],
    ['about-value','About page: KHIP Value'],
    ['about-quote','About page: Quote'],
    ['about-advantages','About page: KHIP advantages'],
    ['about-team','About page: Our team'],
    ['about-contact','About page: Contact'],
    ['patents-intro','Patents page: Introduction'],
    ['patents-details','Patents page: Details'],
    ['patents-contact','Patents page: Contact'],
    ['trademarks-intro','Trademarks page: Introduction'],
    ['trademarks-details','Trademarks page: Details'],
    ['trademarks-contact','Trademarks page: Contact'],
    ['translation-intro','Translation page: Introduction'],
    ['translation-details','Translation page: Details'],
    ['translation-contact','Translation page: Contact']
  ];
  const HEX=/^#[0-9a-f]{6}$/i;
  const VAR={title:'title0',accentDark:'accent-dark',accentSoft:'accent-soft'};
  const vname=k=>'--c-'+(VAR[k]||k)+'-rgb';
  const parts=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const lum=h=>{const [r,g,b]=parts(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
  const palette=T=>{const o={};for(const [k] of ROLES)o[k]=HEX.test(((T||{}).colors||{})[k]||'')?T.colors[k]:DEFAULTS[k];return o};
  // A colour reference is "role:ink", "custom:<id>" or a plain #rrggbb value
  function resolve(ref,T){
    ref=String(ref||'');
    if(HEX.test(ref))return ref;
    const c=palette(T);
    if(ref.indexOf('role:')===0)return c[ref.slice(5)]||null;
    if(ref.indexOf('custom:')===0){const x=((T||{}).custom||[]).find(y=>String(y.id)===ref.slice(7));return x&&HEX.test(x.hex||'')?x.hex:null}
    return null;
  }
  const imgUrl=u=>/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u;
  function vars(T){
    const c=palette(T),r=document.documentElement.style;
    for(const k in c)r.setProperty(vname(k),parts(c[k]).join(' '));
    const w=Math.min(100,Math.max(40,parseFloat((T||{}).sectionWidth)||66.667));
    r.setProperty('--sec-wn',(w/100).toFixed(4));
  }
  function paint(T){
    const S=(T||{}).sections||{},ink=palette(T).ink;
    document.querySelectorAll('[data-sec]').forEach(el=>{
      ['background-color','background-image','background-size','background-position','background-repeat'].forEach(p=>el.style.removeProperty(p));
      el.classList.remove('sec-light');
      const s=S[el.dataset.sec];
      if(!s||(s.mode!=='color'&&s.mode!=='image'))return;
      const tone=s.tone||'auto';let light=false;
      if(s.mode==='color'){
        const c=resolve(s.color,T);if(!c)return;
        el.style.backgroundColor=c;light=tone==='light'||(tone==='auto'&&lum(c)<.4);
      }else{
        if(!s.image)return;
        const ov=Math.min(85,Math.max(0,parseFloat(s.overlay)||0))/100,layers=[];
        if(ov>0){const [r,g,b]=parts(ink);layers.push(`linear-gradient(rgba(${r},${g},${b},${ov}),rgba(${r},${g},${b},${ov}))`)}
        layers.push(`url("${imgUrl(String(s.image)).replace(/"/g,'%22')}")`);
        el.style.backgroundImage=layers.join(',');el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat';
        light=tone==='light'||(tone==='auto'&&ov>=.4);
        if(light)el.style.backgroundColor=ink;
      }
      el.classList.toggle('sec-light',light);
    });
  }
  function apply(D){const T=(D&&D.theme)||{};vars(T);paint(T)}
  window.KTHEME={DEFAULTS,ROLES,SECTIONS,HEX,resolve,lum,palette,apply};
  // The admin page uses the definitions only; it must not recolour itself.
  if(/admin\.html$/.test(location.pathname))return;
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CACHE))}catch{}
  if(cached&&cached.theme)vars(cached.theme);               // colours before first paint: no flash
  const go=D=>{apply(D)};
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{if(cached)go(cached)});
  fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{ready(()=>go(d))}).catch(()=>{});
})();

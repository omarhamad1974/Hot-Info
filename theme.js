/* KHIP theme: site colours, section backgrounds and section width.
   Loaded in <head> on every public page. The values come from "theme" in app-data.json
   (edit them in admin.html, tabs Colors and Backgrounds). With no "theme" block the defaults
   below apply, and they are the colours the site always used. */
(function(){
  const CACHE='khip-data-v3';
  // Default palette = the colours the site used before the palette existed.
  const DEFAULTS={title:'#173a7a',ink:'#1b2433',gold:'#a8844f',accent:'#1d4ed8',accentDark:'#1e40af',accentSoft:'#eff6ff',sand:'#d9c8a4',page:'#f7f6f3',surface:'#ffffff',text:'#3a4051'};
  // Brand palette: 7 named colours. They can be picked anywhere a colour is chosen ("brand:1" ... "brand:7").
  const BRAND_DEFAULTS=[['Primary','#173a7a'],['Secondary','#1d4ed8'],['Accent','#a8844f'],['Dark','#1b2433'],['Highlight','#d9c8a4'],['Light','#f7f6f3'],['Neutral','#3a4051']].map(([name,hex])=>({name,hex}));
  const brandPal=T=>BRAND_DEFAULTS.map((d,i)=>{const b=((T||{}).brand||[])[i]||{};return {name:String(b.name||d.name),hex:/^#[0-9a-f]{6}$/i.test(b.hex||'')?b.hex:d.hex}});
  // Fonts that can be chosen. [name, kind (g = Google Fonts, s = on every device), generic family, supports Arabic]
  const FONTS=[
    ['Jost','g','sans-serif',0],['Inter','g','sans-serif',0],['Poppins','g','sans-serif',0],['Montserrat','g','sans-serif',0],['Raleway','g','sans-serif',0],
    ['Nunito','g','sans-serif',0],['DM Sans','g','sans-serif',0],['Open Sans','g','sans-serif',0],['Roboto','g','sans-serif',0],
    ['Cormorant Garamond','g','serif',0],['Playfair Display','g','serif',0],['Lora','g','serif',0],['Merriweather','g','serif',0],['Libre Baskerville','g','serif',0],
    ['Cairo','g','sans-serif',1],['Tajawal','g','sans-serif',1],['Almarai','g','sans-serif',1],['IBM Plex Sans Arabic','g','sans-serif',1],['Noto Kufi Arabic','g','sans-serif',1],
    ['Noto Naskh Arabic','g','serif',1],['Amiri','g','serif',1],
    ['Arial','s','sans-serif',1],['Verdana','s','sans-serif',1],['Tahoma','s','sans-serif',1],['Trebuchet MS','s','sans-serif',0],['Georgia','s','serif',0],['Times New Roman','s','serif',1]
  ];
  const FONT_KEYS=[['h1','Heading 1 (H1)','h1,.h1'],['h2','Heading 2 (H2)','h2,.h2'],['h3','Heading 3 (H3)','h3,.h3'],['body','Body text','body,.font-sans']];
  const cssName=n=>String(n||'').replace(/[^\w \-\u0600-\u06FF]/g,'').trim();
  const fmt={woff2:'woff2',woff:'woff',ttf:'truetype',otf:'opentype'};
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
    ['home-carousel','Home page: Picture carousel'],
    ['home-about','Home page: logo and About text'],
    ['home-jurisdictions','Home page: HOT News'],
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
    if(ref.indexOf('brand:')===0){const b=brandPal(T)[+ref.slice(6)-1];return b?b.hex:null}
    if(ref.indexOf('custom:')===0){const x=((T||{}).custom||[]).find(y=>String(y.id)===ref.slice(7));return x&&HEX.test(x.hex||'')?x.hex:null}
    return null;
  }
  const imgUrl=u=>/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u;
  function vars(T){
    const c=palette(T),r=document.documentElement.style;
    for(const k in c)r.setProperty(vname(k),parts(c[k]).join(' '));
    const w=Math.min(100,Math.max(40,parseFloat((T||{}).sectionWidth)||66.667));
    const wt=T&&T.sectionWidthTablet!=null&&T.sectionWidthTablet!==''?Math.min(100,Math.max(40,parseFloat(T.sectionWidthTablet)||w)):w;
    r.setProperty('--sec-wn',(w/100).toFixed(4));r.setProperty('--sec-wd',(w/100).toFixed(4));r.setProperty('--sec-wt',(wt/100).toFixed(4));
  }
  function paint(T){
    const S=(T||{}).sections||{},ink=palette(T).ink;
    document.querySelectorAll('[data-sec]').forEach(el=>{
      ['background-color','background-image','background-size','background-position','background-repeat'].forEach(p=>el.style.removeProperty(p));
      el.classList.remove('sec-light');
      const s0=S[el.dataset.sec]||{},pw=v=>{v=parseFloat(v);return isFinite(v)?Math.min(100,Math.max(40,v))/100:null};
      el.toggleAttribute('data-off',s0.hidden===true);                       // hidden from the admin page
      if(el.id)document.querySelectorAll('a[href="#'+el.id+'"],[data-go="'+el.id+'"]').forEach(a=>{a.toggleAttribute('data-off',s0.hidden===true)});
      const wt=pw(s0.widthTablet),wd=pw(s0.widthDesktop);
      wt!==null?el.style.setProperty('--sec-wt',wt.toFixed(4)):el.style.removeProperty('--sec-wt');
      wd!==null?el.style.setProperty('--sec-wd',wd.toFixed(4)):el.style.removeProperty('--sec-wd');
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
  // Fonts: only written when the admin chose something, so with no "fonts" block the site looks exactly as before.
  function fontRules(T){
    const F=(T||{}).fonts||{},custom=Array.isArray((T||{}).customFonts)?T.customFonts:[],google=[],faces=[],rules=[];
    const find=n=>{const c=custom.find(x=>x&&x.name===n&&x.file);if(c)return {c,generic:'sans-serif',ar:!!c.ar};const f=FONTS.find(x=>x[0]===n);return f?{g:f[1]==='g',generic:f[2],ar:!!f[3],n:f[0]}:null};
    for(const [k,,sel] of FONT_KEYS){
      const o=F[k]||{},fo=o.family?find(o.family):null,list=sel.split(',');
      if(fo){
        const nm=cssName(o.family);
        if(fo.c){if(!faces.some(x=>x.n===nm)){const ext=String(fo.c.file).split('.').pop().toLowerCase();faces.push({n:nm,css:`@font-face{font-family:"${nm}";src:url("${imgUrl(fo.c.file)}") format("${fmt[ext]||'woff2'}");font-display:swap;font-weight:100 900}`})}}
        else if(fo.g&&!google.includes(fo.n))google.push(fo.n);
        const decl=`font-family:"${nm}",${fo.generic}!important`;
        rules.push(list.map(x=>`html:not([dir=rtl]) ${x}`).join(',')+`{${decl}}`);
        if(fo.ar)rules.push(list.map(x=>`html[dir=rtl] ${x}`).join(',')+`{${decl}}`);
      }
      const col=o.color&&k!=='body'?resolve(o.color,T):null;
      if(col)rules.push(list.map(x=>`html ${x}:not(.sec-light *)`).join(',')+`{color:${col}!important}`);
    }
    return {css:faces.map(x=>x.css).concat(rules).join('\n'),google};
  }
  function fonts(T){
    const R=fontRules(T);let st=document.getElementById('khip-fonts'),l=document.getElementById('khip-gf');
    if(!R.css){if(st)st.remove();if(l)l.remove();return}
    if(!st){st=document.createElement('style');st.id='khip-fonts';document.head.appendChild(st)}
    st.textContent=R.css;
    if(R.google.length){
      const href='https://fonts.googleapis.com/css2?'+R.google.map(n=>'family='+n.replace(/ /g,'+')+':wght@400;700').join('&')+'&display=swap';
      if(!l){l=document.createElement('link');l.id='khip-gf';l.rel='stylesheet';document.head.appendChild(l)}
      if(l.getAttribute('href')!==href)l.href=href;
    }else if(l)l.remove();
  }
  function apply(D){const T=(D&&D.theme)||{};vars(T);paint(T);fonts(T)}
  const NOWIDTH=['patents-contact','trademarks-contact','translation-contact'];     // blocks inside another section: no width of their own
  window.KTHEME={DEFAULTS,ROLES,SECTIONS,HEX,resolve,lum,palette,apply,BRAND_DEFAULTS,brandPal,FONTS,FONT_KEYS,cssName,NOWIDTH};
  // The admin page uses the definitions only; it must not recolour itself.
  if(/admin\.html$/.test(location.pathname))return;
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CACHE))}catch{}
  if(cached&&cached.theme){vars(cached.theme);fonts(cached.theme)}   // colours and fonts before first paint: no flash
  const go=D=>{apply(D)};
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{if(cached)go(cached)});
  fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{ready(()=>go(d))}).catch(()=>{});
})();

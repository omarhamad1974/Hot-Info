/* KHIP theme: site colours, section backgrounds and section width.
   Loaded in <head> on every public page. The values come from "theme" in app-data.json
   (edit them in admin.html, tabs Colors and Backgrounds). With no "theme" block the defaults
   below apply, and they are the colours the site always used.
   It also holds KFX, the image effects (colour overlay and SVG mask) used by every page that shows a photo. */
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
  /* ---------- Image effects: colour overlay + SVG mask ----------
     Saved beside any image as "<field>Fx" (a section background: "imageFx"):
       {ov:{type:'matt'|'gradient', color, opacity, color2, opacity2, dir}, mask:{shape, fit, invert}}
     colours are brand:N / role:x / custom:id / #hex; opacity is 0 to 100;
     shape is one of MASKS below, or "file:<name>.svg" (an SVG uploaded to assets/).
     Nothing is changed for an image that has no effect: it keeps its original markup. */
  // [key, label, default fit, svg shapes, viewBox]. Only the shape's opaque area shows the photo.
  const MASKS=[
    ['circle','Circle','contain','<circle cx="50" cy="50" r="50"/>'],
    ['squircle','Soft square','contain','<path d="M50 0C88 0 100 12 100 50S88 100 50 100 0 88 0 50 12 0 50 0Z"/>'],
    ['hexagon','Hexagon','contain','<path d="M25 4h50l25 46-25 46H25L0 50z"/>'],
    ['blob1','Blob 1','contain','<path d="M91.5 47.4C92.3 56.3 88 72.8 80.9 79.1C73.8 85.3 58.8 83.8 48.9 84.9C39.1 86 27.7 91.3 21.7 85.9C15.6 80.4 12.2 63.4 12.8 52.2C13.3 40.9 18.2 25.2 24.9 18.1C31.7 11 44.7 8.3 53.3 9.5C61.9 10.7 70 19 76.4 25.3C82.7 31.7 90.8 38.4 91.5 47.4Z"/>'],
    ['blob2','Blob 2','contain','<path d="M91.8 49.5C91.8 58.6 82.6 74.3 75.6 81.4C68.6 88.5 58.7 92.3 49.9 92.2C41.2 92.2 30.7 88.5 23.2 81.2C15.7 74 5.4 57.8 4.9 48.6C4.5 39.3 13.7 33 20.5 25.7C27.2 18.4 36.4 4.7 45.6 4.9C54.7 5 67.9 19.3 75.6 26.7C83.3 34.1 91.8 40.4 91.8 49.5Z"/>'],
    ['blob3','Blob 3','contain','<path d="M93.8 51.6C93.4 60.4 79.5 71.4 73 78.7C66.5 86 63 95.3 54.7 95.3C46.5 95.3 30.3 86.8 23.4 78.8C16.5 70.8 13.4 57.3 13.5 47.2C13.6 37.2 18.8 25.7 24.1 18.4C29.3 11.1 36.7 2.2 45.2 3.4C53.7 4.6 67.2 17.6 75.3 25.6C83.4 33.6 94.2 42.7 93.8 51.6Z"/>'],
    ['arch','Arch','stretch','<path d="M0 100V50C0 22 22 0 50 0S100 22 100 50V100Z"/>'],
    ['leaf','Leaf','stretch','<path d="M0 0H62C84 0 100 16 100 38V100H38C16 100 0 84 0 62Z"/>'],
    ['cut','Cut corners','stretch','<path d="M10 0H90L100 14V86L90 100H10L0 86V14Z"/>'],
    ['wave-b','Wave (bottom)','stretch','<path d="M0 0H100V86C88 96 76 96 64 88S40 78 28 86S8 96 0 90Z"/>'],
    ['wave-t','Wave (top)','stretch','<path transform="translate(0 100) scale(1 -1)" d="M0 0H100V86C88 96 76 96 64 88S40 78 28 86S8 96 0 90Z"/>'],
    ['curve-out','Curve out (bottom)','stretch','<path d="M0 0H100V78Q50 108 0 78Z"/>'],
    ['curve-in','Curve in (bottom)','stretch','<path d="M0 0H100V100Q50 70 0 100Z"/>'],
    ['diag-b','Diagonal (bottom)','stretch','<path d="M0 0H100V84L0 100Z"/>'],
    ['diag-t','Diagonal (top)','stretch','<path d="M0 16L100 0V100H0Z"/>'],
    ['slant','Slanted sides','stretch','<path d="M10 0H100L90 100H0Z"/>']
  ];
  const MASK_BY={};MASKS.forEach(m=>{MASK_BY[m[0]]=m});
  const DIRS=[['to bottom','Top to bottom'],['to top','Bottom to top'],['to right','Left to right'],['to left','Right to left'],['to bottom right','Top-left to bottom-right'],['to bottom left','Top-right to bottom-left'],['to top right','Bottom-left to top-right'],['to top left','Bottom-right to top-left'],['radial','Center to edges']];
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),num=(v,d)=>{v=parseFloat(v);return isFinite(v)?v:d};
  const rgba=(h,a)=>{const [r,g,b]=parts(h);return `rgba(${r},${g},${b},${+a.toFixed(3)})`};
  const encSvg=t=>'data:image/svg+xml,'+encodeURIComponent(t).replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g,'%29');
  // one mask SVG. o = {size:%, rotate:deg, feather:0-100}: size and rotation turn the shape around the centre of its box,
  // feather blurs its edge (the picture fades out softly). With no options the markup is exactly the old one.
  function buildSvg(vb,inner,o){
    o=o||{};const q=String(vb).trim().split(/[\s,]+/).map(Number),x=q[0]||0,y=q[1]||0,w=q[2]||100,h=q[3]||100,cx=x+w/2,cy=y+h/2;
    const s=clamp(num(o.size,100),10,300)/100,r=clamp(num(o.rotate,0),-180,180),f=clamp(num(o.feather,0),0,100)*0.12*(w/100);
    const g=(s!==1||r!==0)?`<g transform="translate(${+cx.toFixed(3)} ${+cy.toFixed(3)}) rotate(${r}) scale(${+s.toFixed(3)}) translate(${+(-cx).toFixed(3)} ${+(-cy).toFixed(3)})">${inner}</g>`:inner;
    const body=f>0?`<defs><filter id="kfxf" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${+f.toFixed(3)}"/></filter></defs><g filter="url(#kfxf)">${g}</g>`:g;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="none">${body}</svg>`;
  }
  const svgOf=(m,o)=>buildSvg(m[4]||'0 0 100 100',m[3],o);
  // uploaded SVG shapes: the file text is fetched once (same site) so it can be turned and softened too
  const fileText={},filePend={};
  function fileSvg(t,o){
    try{const d=new DOMParser().parseFromString(t,'image/svg+xml'),r=d.documentElement;
      if(!r||String(r.nodeName).toLowerCase()!=='svg'||d.getElementsByTagName('parsererror').length)return null;
      let vb=r.getAttribute('viewBox');if(!vb)vb=`0 0 ${parseFloat(r.getAttribute('width'))||100} ${parseFloat(r.getAttribute('height'))||100}`;
      const ser=new XMLSerializer();let inner='';for(const c of Array.from(r.childNodes))inner+=ser.serializeToString(c);
      return buildSvg(vb,inner,o)}catch(_){return null}
  }
  function fileFetch(n){
    if(filePend[n]||typeof fetch!=='function')return;
    filePend[n]=fetch(fileUrl(n)).then(r=>r.ok?r.text():'').then(t=>{if(!t)return;fileText[n]=t;
      document.querySelectorAll('[style*="--kfx-p:'+n+'|"]').forEach(el=>{
        const a=(el.style.getPropertyValue('--kfx-p')||'').trim().split('|');
        const css=maskCss({shape:'file:'+a[0],size:a[1],rotate:a[2],feather:a[3],fit:a[4]||undefined,invert:a[5]==='1'});
        css.split(';').forEach(dc=>{const i=dc.indexOf(':');if(i>0)el.style.setProperty(dc.slice(0,i).trim(),dc.slice(i+1).trim())})})}).catch(()=>{});
  }
  let fileUrl=n=>'./assets/'+n;                      // the admin page replaces this to preview files not yet published
  // overlay -> {css (a background value), a (average opacity 0 to 1), c (main colour)} or null when there is no overlay
  function ovInfo(ov,T){
    if(!ov||(ov.type!=='matt'&&ov.type!=='gradient'))return null;
    const c1=resolve(ov.color,T)||palette(T).ink,a1=clamp(num(ov.opacity,40),0,100)/100;
    if(ov.type==='matt')return a1>0?{css:`linear-gradient(${rgba(c1,a1)},${rgba(c1,a1)})`,a:a1,c:c1}:null;
    const c2=resolve(ov.color2,T)||c1,a2=clamp(num(ov.opacity2,0),0,100)/100;
    if(a1<=0&&a2<=0)return null;
    const d=DIRS.some(x=>x[0]===ov.dir)?ov.dir:'to bottom',g=rgba(c1,a1)+','+rgba(c2,a2);
    return {css:d==='radial'?`radial-gradient(circle at center,${g})`:`linear-gradient(${d},${g})`,a:(a1+a2)/2,c:a1>=a2?c1:c2};
  }
  // mask -> CSS declarations (empty when there is no mask)
  function maskCss(m){
    if(!m||!m.shape)return '';
    const sh=String(m.shape),p=MASK_BY[sh],o={size:m.size,rotate:m.rotate,feather:m.feather},custom=num(m.size,100)!==100||num(m.rotate,0)!==0||num(m.feather,0)>0;let u='',pend='';
    if(p)u=encSvg(custom?svgOf(p,o):svgOf(p));
    else if(sh.indexOf('file:')===0){const n=sh.slice(5);if(!/^[\w.\-]+\.svg$/i.test(n))return '';
      const made=custom&&fileText[n]?fileSvg(fileText[n],o):null;
      if(made)u=encSvg(made);else{u=String(fileUrl(n)).replace(/'/g,'%27');if(custom){fileFetch(n);pend=`--kfx-p:${n}|${num(m.size,100)}|${num(m.rotate,0)}|${num(m.feather,0)}|${m.fit||''}|${m.invert?1:0};`}}}
    else return '';
    const fit={contain:'contain',cover:'cover',stretch:'100% 100%'}[m.fit]||{contain:'contain',cover:'cover',stretch:'100% 100%'}[p?p[2]:'contain'];
    let im=`url('${u}')`,sz=fit,ps='center',rp='no-repeat';
    if(m.invert){im+=',linear-gradient(#000,#000)';sz+=',100% 100%';ps+=',center';rp+=',no-repeat'}   // the shape is cut out instead
    return `-webkit-mask-image:${im};mask-image:${im};-webkit-mask-size:${sz};mask-size:${sz};-webkit-mask-position:${ps};mask-position:${ps};-webkit-mask-repeat:${rp};mask-repeat:${rp};`+(m.invert?'-webkit-mask-composite:xor;mask-composite:exclude;':'')+pend;
  }
  // One <img>. cls = the classes the plain image had (size, margins, rounding, object-fit, opacity).
  // With no effect the result is exactly the old <img>; with an effect it is a wrapper that holds the image and the overlay.
  function fxImg(o){
    const fx=o.fx||{},oi=ovInfo(fx.ov,o.T),mk=maskCss(fx.mask),cls=String(o.cls||''),at=o.attrs||'';
    if(!oi&&!mk)return `<img src="${o.src}" ${at} class="${cls}">`;
    const tk=cls.split(/\s+/).filter(Boolean),onImg=/^(?:[\w-]+:)*(?:opacity-|object-)/,round=/^(?:[\w-]+:)*rounded/;
    const wrap=tk.filter(x=>!onImg.test(x)&&!(mk&&round.test(x))).join(' '),inner=tk.filter(x=>onImg.test(x)).join(' ');
    return `<span class="kfx ${wrap}"${mk?` style="${mk}"`:''}><img src="${o.src}" ${at} class="${inner}">${oi?`<span class="kfx-ov" style="background:${oi.css}"></span>`:''}</span>`;
  }
  (function(){
    if(document.getElementById('kfx-css'))return;
    const st=document.createElement('style');st.id='kfx-css';
    st.textContent='.kfx{position:relative;display:block;overflow:hidden}.kfx>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none}.kfx-ov{position:absolute;inset:0;display:block;pointer-events:none}.kfx-sec{position:relative;isolation:isolate}.kfx-bg{position:absolute;inset:0;z-index:-1;pointer-events:none}[data-sec].ov-on{position:relative;margin-bottom:calc(var(--ov-m,0) * -1px)}[data-sec].ov-next{position:relative}@media(min-width:768px){[data-sec].ov-on{margin-bottom:calc(var(--ov-t,0) * -1px)}}@media(min-width:1024px){[data-sec].ov-on{margin-bottom:calc(var(--ov-d,0) * -1px)}}';
    (document.head||document.documentElement).appendChild(st);
  })();
  /* Header colours (theme.header: bg, opacity, text, active, border; each a colour reference). Nothing saved = the header looks as before. */
  function hdr(T){
    const H=(T||{}).header||{},id='khip-header';let st=document.getElementById(id);
    const bg=resolve(H.bg,T),tx=resolve(H.text,T),ac=resolve(H.active,T),bd=resolve(H.border,T),root=document.documentElement;
    if(!bg&&!tx&&!ac&&!bd){if(st)st.remove();root.removeAttribute('data-hdr');return}
    const h='header.sticky.top-0',op=clamp(num(H.opacity,90),0,100)/100,css=[];
    if(bg)css.push(`${h}{background-color:${rgba(bg,op)}!important}`);
    if(bd)css.push(`${h}{border-color:${bd}!important}${h} [data-social] a{border-color:${bd}!important}`);
    if(tx)css.push(`${h} nav a:not([aria-current]),${h} .brand-ink,${h} [data-social] a,${h} .lang-btn{color:${tx}!important}${h} .lang-btn{background:transparent!important;border-color:${tx}!important}`);
    if(tx)css.push(`${h} .k-burger{color:${tx}!important;border-color:${tx}!important}`);
    if(ac)css.push(`${h} nav a[aria-current],${h} nav a:hover,${h} [data-social] a:hover{color:${ac}!important}`);
    if(!st){st=document.createElement('style');st.id=id;document.head.appendChild(st)}
    st.textContent=css.join('\n');root.setAttribute('data-hdr','1');
  }
  function vars(T){
    hdr(T);
    const c=palette(T),r=document.documentElement.style;
    for(const k in c)r.setProperty(vname(k),parts(c[k]).join(' '));
    const w=Math.min(100,Math.max(40,parseFloat((T||{}).sectionWidth)||66.667));
    const wt=T&&T.sectionWidthTablet!=null&&T.sectionWidthTablet!==''?Math.min(100,Math.max(40,parseFloat(T.sectionWidthTablet)||w)):w;
    {const bw=v=>{v=parseFloat(v);return isFinite(v)&&v>0?Math.min(100,Math.max(40,v)):null},bt=bw((T||{}).barWidthTablet),bd=bw((T||{}).barWidthDesktop);   // bottom bar (WhatsApp box + buttons)
      bt?r.setProperty('--bar-wt',bt+'%'):r.removeProperty('--bar-wt');bd?r.setProperty('--bar-wd',bd+'%'):r.removeProperty('--bar-wd')}
    r.setProperty('--sec-wn',(w/100).toFixed(4));r.setProperty('--sec-wd',(w/100).toFixed(4));r.setProperty('--sec-wt',(wt/100).toFixed(4));
  }
  function paint(T){
    const S=(T||{}).sections||{},ink=palette(T).ink;
    document.querySelectorAll('[data-sec]').forEach(el=>{
      ['background-color','background-image','background-size','background-position','background-repeat'].forEach(p=>el.style.removeProperty(p));
      el.classList.remove('sec-light','kfx-sec','ov-on','ov-next');['--ov-m','--ov-t','--ov-d','z-index'].forEach(p=>el.style.removeProperty(p));
      const oldLayer=el.querySelector(':scope>.kfx-bg');if(oldLayer)oldLayer.remove();
      const s0=S[el.dataset.sec]||{},pw=v=>{v=parseFloat(v);return isFinite(v)?Math.min(100,Math.max(40,v))/100:null};
      el.toggleAttribute('data-off',s0.hidden===true);                       // hidden from the admin page
      el.toggleAttribute('data-full',s0.fullWidth===true);                   // picture carousel: edge to edge
      {const hv=v=>{v=parseFloat(v);return isFinite(v)&&v>0?Math.min(1400,Math.max(120,v)):null},hm=hv(s0.heightMobile),ht=hv(s0.heightTablet),hd=hv(s0.heightDesktop);   // carousel height in px per screen size
        ['--hh-m','--hh-t','--hh-d'].forEach(p=>el.style.removeProperty(p));
        if(s0.heroScreen===true)el.setAttribute('data-hh','screen');
        else if(hm||ht||hd){el.setAttribute('data-hh','custom');if(hm)el.style.setProperty('--hh-m',hm+'px');if(ht)el.style.setProperty('--hh-t',ht+'px');if(hd)el.style.setProperty('--hh-d',hd+'px')}
        else el.removeAttribute('data-hh')}
      if(el.id)document.querySelectorAll('a[href="#'+el.id+'"],[data-go="'+el.id+'"]').forEach(a=>{a.toggleAttribute('data-off',s0.hidden===true)});
      const wt=pw(s0.widthTablet),wd=pw(s0.widthDesktop);
      wt!==null?el.style.setProperty('--sec-wt',wt.toFixed(4)):el.style.removeProperty('--sec-wt');
      wd!==null?el.style.setProperty('--sec-wd',wd.toFixed(4)):el.style.removeProperty('--sec-wd');
      {const pv=v=>{if(v===undefined||v===null||v==='')return null;v=parseFloat(v);return isFinite(v)?Math.min(600,Math.max(0,v)):null},om=pv(s0.overlapMobile),ot=pv(s0.overlapTablet),od=pv(s0.overlapDesktop),m=om??0,t=ot??m,d=od??t;
        if(m||t||d){el.classList.add('ov-on');el.style.setProperty('--ov-m',m);el.style.setProperty('--ov-t',t);el.style.setProperty('--ov-d',d)}}   // overlap with the next section (px per screen size)
      const s=S[el.dataset.sec];
      if(!s||(s.mode!=='color'&&s.mode!=='image'))return;
      const tone=s.tone||'auto';let light=false;
      if(s.mode==='color'){
        const c=resolve(s.color,T);if(!c)return;
        el.style.backgroundColor=c;light=tone==='light'||(tone==='auto'&&lum(c)<.4);
      }else{
        if(!s.image)return;
        const fx=s.imageFx||{},oi=ovInfo(fx.ov,T),mk=maskCss(fx.mask),lg=fx.ov?0:Math.min(85,Math.max(0,parseFloat(s.overlay)||0))/100,layers=[];
        if(oi)layers.push(oi.css);                                            // the overlay chosen in the admin (matt or gradient)
        else if(lg>0){const [r,g,b]=parts(ink);layers.push(`linear-gradient(rgba(${r},${g},${b},${lg}),rgba(${r},${g},${b},${lg}))`)}   // older "darken" slider
        layers.push(`url("${imgUrl(String(s.image)).replace(/"/g,'%22')}")`);
        const bg=layers.join(',');
        if(mk){                                                               // a mask must not hide the text: the picture goes on its own layer behind the content
          const L=document.createElement('div');L.className='kfx-bg';L.setAttribute('aria-hidden','true');
          L.style.cssText=`background-image:${bg};background-size:cover;background-position:center;background-repeat:no-repeat;${mk}`;
          el.insertBefore(L,el.firstChild);el.classList.add('kfx-sec');
        }else{el.style.backgroundImage=bg;el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat'}
        light=tone==='light'||(tone==='auto'&&(oi?oi.a>=.4&&lum(oi.c)<.45:lg>=.4));
        if(light)el.style.backgroundColor=ink;
      }
      el.classList.toggle('sec-light',light);
    });
    // stacking order of overlapping sections: "above" = this section paints over the next one, "behind" = under it
    const all=[...document.querySelectorAll('[data-sec]')],vis=all.filter(e=>!e.hasAttribute('data-off'));
    vis.forEach((el,i)=>{if(!el.classList.contains('ov-on'))return;const nx=vis[i+1];if(nx)nx.classList.add('ov-next');
      if(((S[el.dataset.sec]||{}).overlapOrder)!=='behind')el.style.zIndex=String(10+vis.length-i)});
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
  window.KFX={MASKS,DIRS,img:fxImg,ovInfo,maskCss,svgOf,buildSvg,encSvg,setFileUrl:f=>{fileUrl=f}};
  // The admin page uses the definitions only; it must not recolour itself.
  if(/admin\.html$/.test(location.pathname))return;
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CACHE))}catch{}
  if(cached&&cached.theme){vars(cached.theme);fonts(cached.theme)}   // colours and fonts before first paint: no flash
  const go=D=>{apply(D)};
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{if(cached)go(cached)});
  fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{ready(()=>go(d))}).catch(()=>{});
})();

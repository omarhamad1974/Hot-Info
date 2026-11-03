// Validates app-data.json. Run from the project root: node scripts/validate.js
const fs=require('fs'),path=require('path');
const d=JSON.parse(fs.readFileSync('app-data.json','utf8')),errs=[];
const need={carousel:['id','title'],jurisdictions:['id','country'],news:['id','title','excerpt'],services:['id','title','description'],products:['id','title'],testimonials:['id','name','text'],employees:['id','name','position']};
// Same rule as the site: a bare file name lives in ./assets/
const resolve=u=>/^(https?:|data:)/.test(u)?null:(/^(\.\/|\/)/.test(u)?u.replace(/^\//,'./'):'./assets/'+u);
// Image effects (colour overlay + SVG mask), saved as "imageFx" next to a photo. See theme.js > KFX.
const FXMASKS=new Set(fs.readFileSync('theme.js','utf8').split("const MASKS=[")[1].split("];")[0].match(/\['([\w-]+)','/g).map(x=>x.slice(2,-3)));
const FXROLES=new Set(['title','ink','gold','accent','accentDark','accentSoft','sand','page','surface','text']);
const FXDIRS=['to bottom','to top','to right','to left','to bottom right','to bottom left','to top right','to top left','radial'];
const customIds=new Set((((d.theme||{}).custom)||[]).map(c=>String(c.id)));
const fxColor=c=>/^#[0-9a-f]{6}$/i.test(c||'')||/^brand:[1-7]$/.test(c||'')||(/^role:\w+$/.test(c||'')&&FXROLES.has(String(c).slice(5)))||(/^custom:/.test(c||'')&&customIds.has(String(c).slice(7)));
function checkFx(where,fx){
  if(fx===undefined)return;
  if(!fx||typeof fx!=='object'||Array.isArray(fx)){errs.push(`${where}: must be an object`);return}
  const pct=v=>typeof v==='number'&&v>=0&&v<=100;
  if(fx.ov!==undefined){
    const o=fx.ov||{};
    if(!['matt','gradient'].includes(o.type))errs.push(`${where}.ov.type: must be matt or gradient`);
    if(!fxColor(o.color))errs.push(`${where}.ov.color: not a brand, site, own or #rrggbb color`);
    if(!pct(o.opacity))errs.push(`${where}.ov.opacity: must be a number from 0 to 100`);
    if(o.type==='gradient'){
      if(!fxColor(o.color2))errs.push(`${where}.ov.color2: not a brand, site, own or #rrggbb color`);
      if(!pct(o.opacity2))errs.push(`${where}.ov.opacity2: must be a number from 0 to 100`);
      if(!FXDIRS.includes(o.dir))errs.push(`${where}.ov.dir: unknown direction`);
    }
  }
  if(fx.mask!==undefined){
    const m=fx.mask||{},sh=String(m.shape||'');
    if(sh.startsWith('file:')){const n=sh.slice(5);if(!/^[\w.\-]+\.svg$/i.test(n))errs.push(`${where}.mask.shape: bad file name`);else if(!fs.existsSync(path.join('assets',n)))errs.push(`${where}.mask.shape: SVG not found in assets (${n})`)}
    else if(!FXMASKS.has(sh))errs.push(`${where}.mask.shape: unknown shape "${sh}"`);
    if(m.fit!==undefined&&!['contain','cover','stretch'].includes(m.fit))errs.push(`${where}.mask.fit: must be contain, cover or stretch`);
    if(m.invert!==undefined&&typeof m.invert!=='boolean')errs.push(`${where}.mask.invert: must be true or false`);
  }
}
for(const [k,fields] of Object.entries(need)){
  const arr=d[k];if(!Array.isArray(arr)){errs.push(`${k}: must be an array`);continue}
  const ids=new Set();
  arr.forEach((x,i)=>{
    fields.forEach(f=>{if(!String(x[f]??'').trim())errs.push(`${k}[${i}]: missing "${f}"`)});
    if(ids.has(x.id))errs.push(`${k}[${i}]: duplicate id "${x.id}"`);ids.add(x.id);
    checkFx(`${k}[${i}].imageFx`,x.imageFx);
    if(typeof x.image==='string'&&x.image){const f=resolve(x.image);if(f&&!fs.existsSync(path.join('.',f)))errs.push(`${k}[${i}]: image not found ${x.image}`)}
    if(k==='jurisdictions'&&x.code&&!/^[a-z]{2}$/i.test(x.code))errs.push(`${k}[${i}]: code must be 2 letters`);
    if(k==='services'&&x.page&&!/^[\w-]+\.html$/.test(x.page))errs.push(`${k}[${i}]: page must look like patents.html`);
  });
}
if(!d.about&&!d.aboutMainText)errs.push('missing about text');
if(d.chatPrompts!==undefined&&!(Array.isArray(d.chatPrompts)&&d.chatPrompts.every(x=>typeof x==='string')))errs.push('chatPrompts must be a list of text lines');
if(d.theme!==undefined){
  const hex=/^#[0-9a-f]{6}$/i,t=d.theme||{};
  for(const [k,v] of Object.entries(t.colors||{}))if(!hex.test(v))errs.push(`theme.colors.${k}: must look like #1b2433`);
  const cids=new Set();(t.custom||[]).forEach((c,i)=>{if(!hex.test(c.hex||''))errs.push(`theme.custom[${i}]: hex must look like #1b2433`);cids.add(String(c.id))});
  for(const [k,s] of Object.entries(t.sections||{})){
    if(!['default','color','image'].includes(s.mode||'default'))errs.push(`theme.sections.${k}: mode must be default, color or image`);
    if(s.mode==='color'&&!(hex.test(s.color||'')||/^role:\w+$/.test(s.color||'')||(/^custom:/.test(s.color||'')&&cids.has(String(s.color).slice(7)))))errs.push(`theme.sections.${k}: color not found`);
    if(s.mode==='image'){const f=s.image?resolve(s.image):null;if(!s.image)errs.push(`theme.sections.${k}: image missing`);else if(f&&!fs.existsSync(path.join('.',f)))errs.push(`theme.sections.${k}: image not found ${s.image}`)}
  }
}

// app-data.ar.json (Arabic content): must be valid JSON; every item id must exist in the English file;
// every pageText key must match a data-t block in its page.
if(fs.existsSync('app-data.ar.json')){
  let a=null;try{a=JSON.parse(fs.readFileSync('app-data.ar.json','utf8'))}catch(e){errs.push('app-data.ar.json: not valid JSON')}
  if(a){
    for(const k of ['carousel','jurisdictions','news','services','testimonials','employees','products']){
      if(a[k]===undefined)continue;
      if(!Array.isArray(a[k])){errs.push(`app-data.ar.json ${k}: must be an array`);continue}
      const have=new Set((d[k]||[]).map(x=>String(x.id)));
      a[k].forEach((x,i)=>{if(x&&x.id!=null&&!have.has(String(x.id)))errs.push(`app-data.ar.json ${k}[${i}]: id "${x.id}" is not in app-data.json`)});
    }
    for(const [stem,keys] of Object.entries(a.pageText||{})){
      const f=stem+'.html';
      if(!fs.existsSync(f)){errs.push(`app-data.ar.json pageText: no page ${f}`);continue}
      const html=fs.readFileSync(f,'utf8');
      for(const key of Object.keys(keys||{}))if(key!=='_title'&&!html.includes(`data-t="${key}"`))errs.push(`app-data.ar.json pageText.${stem}.${key}: no such text block in ${f}`);
    }
  }
}
if(d.theme&&d.theme.brand!==undefined){
  const hex=/^#[0-9a-f]{6}$/i,b=d.theme.brand;
  if(!Array.isArray(b)||b.length!==7)errs.push('theme.brand: must be a list of exactly 7 colors');
  else b.forEach((c,i)=>{if(!hex.test((c||{}).hex||''))errs.push(`theme.brand[${i}].hex: must look like #1b2433`)});
}
if(d.theme&&d.theme.fonts){
  for(const [k,f] of Object.entries(d.theme.fonts)){
    if(!['h1','h2','h3','body'].includes(k))errs.push(`theme.fonts.${k}: must be h1, h2, h3 or body`);
    if(f&&f.family&&!/^[\w \-\u0600-\u06FF]+$/.test(f.family))errs.push(`theme.fonts.${k}.family: unusual characters`);
  }
}
for(const [i,c] of ((d.theme&&d.theme.customFonts)||[]).entries()){
  if(!c.name)errs.push(`theme.customFonts[${i}]: name missing`);
  const f=String(c.file||'').replace(/^\.\//,'');
  if(!/\.(woff2?|ttf|otf)$/i.test(f))errs.push(`theme.customFonts[${i}]: file must be .woff2, .woff, .ttf or .otf`);
  else if(!fs.existsSync(path.join('.',f)))errs.push(`theme.customFonts[${i}]: ${f} does not exist`);
}
if(d.contact!==undefined){
  const c=d.contact||{};
  if(c.whatsapp&&!/^\d{8,15}$/.test(String(c.whatsapp)))errs.push('contact.whatsapp: digits only with the country code, 8 to 15 digits (example 201006552255)');
  if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))errs.push('contact.email: not a valid email address');
  if(!Array.isArray(c.phones||[]))errs.push('contact.phones: must be a list');
  else (c.phones||[]).forEach((p,i)=>{if(!/^\+?[\d\s().-]{5,}$/.test((p||{}).number||''))errs.push(`contact.phones[${i}].number: not a phone number`)});
  for(const k of ['mapLat','mapLng'])if(c[k]!==undefined&&c[k]!==''&&!isFinite(parseFloat(c[k])))errs.push(`contact.${k}: must be a number`);
}
if(d.theme&&d.theme.sections){
  for(const [k,s] of Object.entries(d.theme.sections)){
    checkFx(`theme.sections.${k}.imageFx`,s.imageFx);
    if(s.hidden!==undefined&&typeof s.hidden!=='boolean')errs.push(`theme.sections.${k}.hidden: must be true or false`);
    for(const w of ['widthTablet','widthDesktop'])if(s[w]!==undefined&&s[w]!==''&&!(parseFloat(s[w])>=40&&parseFloat(s[w])<=100))errs.push(`theme.sections.${k}.${w}: must be between 40 and 100`);
  }
}
if(d.theme&&d.theme.motion){
  const m=d.theme.motion,T=['none','fade','fade-up','fade-down','slide-left','slide-right','zoom-in','zoom-out','blur-in','flip-up','rotate-in','reveal-up'],H=['none','lift','grow','glow','border','img-zoom'],E=['smooth','soft','inout','snappy','bounce','linear'];
  const chk=(o,where)=>{
    for(const k of ['type','cardType'])if(o[k]&&!T.includes(o[k]))errs.push(`${where}.${k}: unknown animation "${o[k]}"`);
    if(o.hover&&!H.includes(o.hover))errs.push(`${where}.hover: unknown hover effect "${o.hover}"`);
    if(o.ease&&!E.includes(o.ease))errs.push(`${where}.ease: unknown movement style "${o.ease}"`);
    for(const [k,lo,hi] of [['duration',0,10],['delay',0,10],['distance',0,400],['stagger',0,2]])if(o[k]!==undefined&&o[k]!==''&&!(parseFloat(o[k])>=lo&&parseFloat(o[k])<=hi))errs.push(`${where}.${k}: must be between ${lo} and ${hi}`);
  };
  chk(m.site||{},'theme.motion.site');
  for(const [k,s] of Object.entries(m.sections||{}))chk(s||{},`theme.motion.sections.${k}`);
}
if(d.menu!==undefined){
  if(!d.menu||!Array.isArray(d.menu.items))errs.push('menu.items: must be a list');
  else d.menu.items.forEach((it,i)=>{
    const w=`menu.items[${i}]`;
    if(!(it.en||it.ar))errs.push(`${w}: needs a name in English or Arabic`);
    if(!/^(https?:\/\/|[\w\-./]+\.html(#[\w\-]+)?$|#[\w\-]+$)/.test(it.link||''))errs.push(`${w}.link: must be a page of the site (like about.html#team) or an https:// address`);
    if(it.icon&&!/^ph-[a-z0-9-]+$/.test(it.icon))errs.push(`${w}.icon: unusual icon name`);
  });
}
if(d.hot&&d.hot.perSector!==undefined&&d.hot.perSector!==''&&!(parseInt(d.hot.perSector)>=1&&parseInt(d.hot.perSector)<=12))errs.push('hot.perSector: must be a number from 1 to 12');
if(d.brand&&d.brand.image&&!/^(https?:|data:|\.?\/)/.test(d.brand.image)&&!fs.existsSync(path.join('assets',d.brand.image)))errs.push(`brand.image: assets/${d.brand.image} does not exist`);
for(const [k,v] of Object.entries(d.social||{}))if(v&&!/^https:\/\//.test(v))errs.push(`social.${k}: must start with https://`);

// Directory (phase 14): the pages exist, and every text key they use is written in English AND Arabic in lang.js.
{
  const pages=['directory.html','directory-entry.html','submit-directory.html'];
  const missing=pages.filter(f=>!fs.existsSync(f));
  missing.forEach(f=>errs.push(`directory: ${f} is missing`));
  if(!missing.length&&fs.existsSync('lang.js')){
    const L=fs.readFileSync('lang.js','utf8'),iEn=L.search(/\ben:\{/),iAr=L.search(/\bar:\{/);
    if(iEn<0||iAr<0)errs.push('lang.js: could not find the en:{ and ar:{ blocks');
    else{
      const [lo,hi]=iEn<iAr?[[iEn,iAr],[iAr,L.length]]:[[iAr,iEn],[iEn,L.length]];
      const en=iEn<iAr?L.slice(lo[0],lo[1]):L.slice(hi[0],hi[1]),ar=iEn<iAr?L.slice(hi[0],hi[1]):L.slice(lo[0],lo[1]);
      const has=(blk,k)=>new RegExp(`\\b${k}\\s*:`).test(blk);
      for(const f of pages){
        const html=fs.readFileSync(f,'utf8'),keys=new Set();
        for(const m of html.matchAll(/data-i18n(?:-attr)?="(?:[a-z]+:)?(dir_\w+)"/g))keys.add(m[1]);
        for(const m of html.matchAll(/\bT\('(dir_\w+)'/g))keys.add(m[1]);
        for(const m of html.matchAll(/\bT\('(dir_)'\s*\+/g))['company','institution','freelancer'].forEach(t=>keys.add('dir_'+t));
        if(/typeLabel\(/.test(html))['companies','institutions','freelancers'].forEach(t=>keys.add('dir_'+t));
        for(const k of keys){
          if(!has(en,k))errs.push(`${f}: text "${k}" is missing in English (lang.js)`);
          if(!has(ar,k))errs.push(`${f}: text "${k}" is missing in Arabic (lang.js)`);
        }
      }
    }
  }
  for(const q of ['supabase-step14-directory.sql','supabase-step14f-submissions.sql'])if(!fs.existsSync(q))errs.push(`directory: ${q} is missing`);
}
// Tenders redesign (phases T2 to T4): helper file and SQL exist; the front-page preview texts exist in English AND Arabic.
{
  for(const q of ['tender-dict.js','supabase-step15-tenders-table.sql','supabase-step16-tender-words.sql','supabase-step17-hot-news-more.sql'])if(!fs.existsSync(q))errs.push(`tenders: ${q} is missing`);
  if(fs.existsSync('admin.html')&&!/src="tender-dict\.js"/.test(fs.readFileSync('admin.html','utf8')))errs.push('admin.html: tender-dict.js is not loaded');
  if(fs.existsSync('index.html')&&fs.existsSync('lang.js')){
    const html=fs.readFileSync('index.html','utf8'),L=fs.readFileSync('lang.js','utf8'),keys=new Set();
    for(const m of html.matchAll(/KLang\.t\('(hot_\w+)'/g))keys.add(m[1]);
    for(const k of keys){const n=(L.match(new RegExp(`\\b${k}\\s*:`,'g'))||[]).length;if(n<2)errs.push(`index.html: text "${k}" must be written in English and Arabic in lang.js (found ${n})`)}
  }
}
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json OK');

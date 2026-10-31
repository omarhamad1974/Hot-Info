// Validates app-data.json. Run from the project root: node scripts/validate.js
const fs=require('fs'),path=require('path');
const d=JSON.parse(fs.readFileSync('app-data.json','utf8')),errs=[];
const need={carousel:['id','title'],jurisdictions:['id','country'],news:['id','title','excerpt'],services:['id','title','description'],products:['id','title'],testimonials:['id','name','text'],employees:['id','name','position']};
// Same rule as the site: a bare file name lives in ./assets/
const resolve=u=>/^(https?:|data:)/.test(u)?null:(/^(\.\/|\/)/.test(u)?u.replace(/^\//,'./'):'./assets/'+u);
for(const [k,fields] of Object.entries(need)){
  const arr=d[k];if(!Array.isArray(arr)){errs.push(`${k}: must be an array`);continue}
  const ids=new Set();
  arr.forEach((x,i)=>{
    fields.forEach(f=>{if(!String(x[f]??'').trim())errs.push(`${k}[${i}]: missing "${f}"`)});
    if(ids.has(x.id))errs.push(`${k}[${i}]: duplicate id "${x.id}"`);ids.add(x.id);
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
    if(s.hidden!==undefined&&typeof s.hidden!=='boolean')errs.push(`theme.sections.${k}.hidden: must be true or false`);
    for(const w of ['widthTablet','widthDesktop'])if(s[w]!==undefined&&s[w]!==''&&!(parseFloat(s[w])>=40&&parseFloat(s[w])<=100))errs.push(`theme.sections.${k}.${w}: must be between 40 and 100`);
  }
}
if(d.brand&&d.brand.image&&!/^(https?:|data:|\.?\/)/.test(d.brand.image)&&!fs.existsSync(path.join('assets',d.brand.image)))errs.push(`brand.image: assets/${d.brand.image} does not exist`);
for(const [k,v] of Object.entries(d.social||{}))if(v&&!/^https:\/\//.test(v))errs.push(`social.${k}: must start with https://`);
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json OK');

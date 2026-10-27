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
for(const [k,v] of Object.entries(d.social||{}))if(v&&!/^https:\/\//.test(v))errs.push(`social.${k}: must start with https://`);
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json OK');

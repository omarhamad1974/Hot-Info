// Validates app-data.json. Run: node scripts/validate.js
const fs=require('fs'),path=require('path');
const d=JSON.parse(fs.readFileSync('app-data.json','utf8')),errs=[];
const need={carousel:['id','title'],jurisdictions:['id','country'],news:['id','title','excerpt'],services:['id','title','description'],products:['id','title'],testimonials:['id','name','text'],employees:['id','name','position']};
for(const [k,fields] of Object.entries(need)){
  const arr=d[k];if(!Array.isArray(arr)){errs.push(`${k}: must be an array`);continue}
  const ids=new Set();
  arr.forEach((x,i)=>{
    fields.forEach(f=>{if(!x[f])errs.push(`${k}[${i}]: missing "${f}"`)});
    if(ids.has(x.id))errs.push(`${k}[${i}]: duplicate id "${x.id}"`);ids.add(x.id);
    if(typeof x.image==='string'&&x.image.startsWith('./')&&!fs.existsSync(path.join('.',x.image)))errs.push(`${k}[${i}]: image not found ${x.image}`);
  });
}
if(!d.about&&!d.aboutMainText)errs.push('missing about text');
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

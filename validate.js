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
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json OK');

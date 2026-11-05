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
// Payments (phases P1 to P3): files exist, the page texts exist in English AND Arabic, admin and database pieces are in place.
{
  for(const q of ['subscribe.html','supabase-step18-payments.sql','PAYMENTS-PLAN.md'])if(!fs.existsSync(q))errs.push(`payments: ${q} is missing`);
  if(fs.existsSync('supabase-step18-payments.sql')){
    const q=fs.readFileSync('supabase-step18-payments.sql','utf8');
    for(const f of ['request_subscription','cancel_subscription_request','approve_subscription_request','reject_subscription_request'])if(!q.includes(f))errs.push(`supabase-step18-payments.sql: function ${f} is missing`);
  }
  if(fs.existsSync('admin.html')){
    const a=fs.readFileSync('admin.html','utf8');
    if(!/data-pane="payments"/.test(a))errs.push('admin.html: the Payments tab button is missing');
    for(const f of ['approve_subscription_request','reject_subscription_request','payment_packages','payment_methods'])if(!a.includes(f))errs.push(`admin.html: Payments tab does not use ${f}`);
    if(!/\['6 months','6 months'\]/.test(a))errs.push('admin.html: the manual Subscribe dialog needs the 6 months duration');
  }
  if(fs.existsSync('subscribe.html')&&fs.existsSync('lang.js')){
    const html=fs.readFileSync('subscribe.html','utf8'),L=fs.readFileSync('lang.js','utf8'),keys=new Set();
    for(const m of html.matchAll(/['"](pay_\w+)['"]/g))keys.add(m[1]);
    if(!keys.size)errs.push('subscribe.html: no pay_ texts found');
    for(const k of keys){const n=(L.match(new RegExp(`\\b${k}\\s*:`,'g'))||[]).length;if(n<2)errs.push(`subscribe.html: text "${k}" must be written in English and Arabic in lang.js (found ${n})`)}
    for(const f of ['request_subscription','cancel_subscription_request'])if(!html.includes(f))errs.push(`subscribe.html: does not call ${f}`);
  }
}
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json OK');

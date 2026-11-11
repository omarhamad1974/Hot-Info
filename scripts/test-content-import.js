// Run from the project root: node scripts/test-content-import.js
const K=require('../content-import.js');let fail=0;
const t=(n,c)=>{console.log((c?'PASS ':'FAIL ')+n);if(!c)fail++};
const en={about:'tag',aboutMainText:'old',news:[{id:'1',title:'Old News',image:'',excerpt:'e',text:'t',category:'General'}],services:[],testimonials:[],employees:[],jurisdictions:[]};
const ar={};
const md=`---
type: blog
title: Old News
excerpt: New summary
date: 10-11-2026
category: General
image: ./assets/a.jpg
lang: en
---
# ignored heading
Body **bold** text.

## Part
- one
- two
===
---
type: blog
title: خبر جديد
lang: ar
category: مناقصات
---
نص الخبر العربي.
===
---
type: service
title: Whitening
short: Brief
lang: en
---
Details here.
===
---
type: team
name: Ali
role: Dentist
image: ali.jpg
---
bio ignored
===
---
type: testimonial
name: Sara
role: CEO
---
Great.
===
---
type: country
country: UAE
code: AE
---
Overview.

## Filing details
Step one.
===
---
type: about
tagline: Hello
---
About body.
===
---
type: faq
group: x
---
## Q
A
===
---
type: nope
---
x`;
const r=K.parseContent(md,{defaultLang:'ar',knownImages:new Set(['a.jpg']),categories:['General','مناقصات']});
t('items parsed (faq entry now counts)',r.items.length===8);
t('errors reported',!r.ok&&r.issues.some(i=>/Unknown type/.test(i.message)));
t('faq imported',r.items.some(i=>i.kind==='faq'&&i.fields.question==='Q'));
t('missing image warned',r.issues.some(i=>/ali\.jpg/.test(i.message)));
const n1=r.items[0];t('date normalised',n1.fields.date==='2026-11-10');t('image prefix stripped',n1.fields.image==='a.jpg');
t('body converted, title line dropped as body',/\*\*bold\*\*/.test(n1.fields.text)&&/## Part/.test(n1.fields.text));
t('excerpt derived for ar',r.items[1].fields.excerpt==='نص الخبر العربي.');
t('country split',r.items.find(i=>i.kind==='jurisdictions').fields.details==='Step one.');
const rep=K.applyContent(r.items,en,ar,{categories:['General']});
t('update existing news',en.news.length===2&&en.news[0].excerpt==='New summary'&&en.news[0].image==='a.jpg');
t('arabic-only item added to both',en.news[1].title==='خبر جديد'&&ar.news[0].id===en.news[1].id&&ar.news[0].title==='خبر جديد');
t('service added',en.services[0].description==='Brief'&&en.services[0].details==='Details here.');
t('team/testimonial/country',en.employees[0].position==='Dentist'&&en.testimonials[0].text==='Great.'&&en.jurisdictions[0].code==='ae');
t('about (default lang ar)',ar.about==='Hello'&&ar.aboutMainText==='About body.');
// re-import is an update, not a duplicate
const r2=K.parseContent(md,{defaultLang:'ar'});K.applyContent(r2.items,en,ar,{});
t('re-import does not duplicate',en.news.length===2&&en.services.length===1&&en.employees.length===1&&ar.news.length===1);
// Arabic translation of an existing English item by id
const r3=K.parseContent('---\ntype: service\nid: 1\ntitle: تبييض\nshort: وصف\nlang: ar\n---\nتفاصيل',{});K.applyContent(r3.items,en,ar,{});
t('ar translation matched by id',en.services.length===1&&ar.services[0].title==='تبييض'&&en.services[0].title==='Whitening');
t('BOM + CRLF',K.parseContent('﻿'+md.replace(/\n/g,'\r\n'),{}).items.length===8);
const rc=K.parseContent('---\ntype: carousel\ntitle: Slide A\nsubtitle: Sub\ntag: Featured\nimage: s.jpg\nlang: en\n---\n===\n---\ntype: slide\ntitle: سلايد\nlang: ar\n---\nنص',{});
const en2={carousel:[]},ar2={};K.applyContent(rc.items,en2,ar2,{});
t('carousel',en2.carousel.length===2&&en2.carousel[0].tag==='Featured'&&en2.carousel[1].subtitle==='نص'&&ar2.carousel[0].title==='سلايد');
// export -> import round trip changes nothing
{const E=JSON.parse(JSON.stringify(en)),A=JSON.parse(JSON.stringify(ar));
 for(const L of ['en','ar']){const x=K.exportContent(E,A,{lang:L});const p=K.parseContent(x.md,{});
  t('export '+L+' parses without errors',p.ok&&p.items.length===x.items.length&&x.items.length>0);
  const before=JSON.stringify([E,A]);const rep=K.applyContent(p.items,E,A,{});
  t('round trip '+L+' is stable (only updates, nothing changed)',rep.every(r=>r.action==='update')&&JSON.stringify([E,A])===before);}
 t('word html',/<h2>Part<\/h2>/.test(K.exportWordHtml(K.exportContent(E,A,{lang:'en'}).items)));}
{const md2='---\ntype: pagetext\npage: about\nlang: ar\n---\n## _title\nمن نحن\n\n## hero\n<!-- EN: Hello -->\nأهلا\nسطر ثان\n\n## nokey\n\n===\n---\ntype: pagetext\npage: nope\nlang: ar\n---\n## a\nb\n===\n---\ntype: pagetext\npage: about\nlang: en\n---\n## hero\nHi';
 const pr=K.parseContent(md2,{pageKeys:{about:['_title','hero','x']}});const A3={};
 t('pagetext parsed',pr.items.length===1&&pr.items[0].fields.entries.hero==='أهلا\nسطر ثان'&&!pr.items[0].fields.entries.nokey);
 t('pagetext errors',pr.issues.some(i=>/unknown page/.test(i.message))&&pr.issues.some(i=>/only translated into Arabic/.test(i.message)));
 K.applyContent(pr.items,{},A3,{});t('pagetext applied',A3.pageText.about._title==='من نحن');
 const ex=K.exportContent({},A3,{lang:'ar',sections:['pagetext'],pageTexts:{about:[['_title','About'],['hero','Hello']]}});const pr2=K.parseContent(ex.md,{});
 t('pagetext export round trip',pr2.ok&&pr2.items[0].fields.entries.hero==='أهلا\nسطر ثان'&&/EN: Hello/.test(ex.md));}
// Phase 17A: faq, items (cards) and gallery
{const f1='---\ntype: faq\ngroup: General\nlang: en\n---\n## How long?\nAbout 45 minutes.\n\n## Insurance?\nYes.\n\n### Note\nMost providers.\n===\n---\ntype: items\ngroup: why-us\nlang: en\n---\n## Experienced\n15 years.\nicon: star\nimage: doctors.jpg\nprice: 100\n\n## Modern\nLatest tech.\n===\n---\ntype: gallery\ngroup: clinic\nlang: en\n---\nc1.jpg | Reception\nc2.jpg | Room | Modern room\n===\n---\ntype: section\nlang: en\n---\nx';
 const pf=K.parseContent(f1,{});const E={},A={};
 t('faq/items/gallery parsed, section skipped',pf.ok&&pf.items.length===6&&pf.issues.some(i=>/not used by this site/.test(i.message)));
 K.applyContent(pf.items,E,A,{});
 t('faq entries',E.faq.length===2&&E.faq[0].question==='How long?'&&E.faq[0].group==='General'&&/## Note/.test(E.faq[1].answer));
 t('cards entries',E.cards.length===2&&E.cards[0].icon==='star'&&E.cards[0].image==='doctors.jpg'&&E.cards[0].price==='100'&&E.cards[0].description==='15 years.'&&E.cards[1].icon==='');
 t('gallery entries',E.gallery.length===2&&E.gallery[1].alt==='Modern room'&&E.gallery[0].caption==='Reception');
 K.applyContent(K.parseContent(f1,{}).items,E,A,{});
 t('faq/cards/gallery re-import does not duplicate',E.faq.length===2&&E.cards.length===2&&E.gallery.length===2);
 // same title in another group is a different entry
 K.applyContent(K.parseContent(f1.replace('group: General','group: Other'),{}).items,E,A,{});
 t('same question in another group is added',E.faq.length===4);
 // Arabic translation by id and by picture name
 const ar1='---\ntype: faq\ngroup: General\nlang: ar\n---\n## كم المدة؟\nنحو 45 دقيقة.\nid: '+E.faq[0].id+'\n===\n---\ntype: gallery\ngroup: clinic\nlang: ar\n---\nc1.jpg | الاستقبال';
 K.applyContent(K.parseContent(ar1,{}).items,E,A,{});
 t('faq arabic by id',A.faq.length===1&&A.faq[0].question==='كم المدة؟'&&E.faq[0].question==='How long?'&&E.faq.length===4);
 t('gallery arabic by picture',A.gallery.length===1&&A.gallery[0].caption==='الاستقبال'&&E.gallery.length===2);
 for(const L of ['en','ar']){const E2=JSON.parse(JSON.stringify(E)),A2=JSON.parse(JSON.stringify(A));
  const x=K.exportContent(E2,A2,{lang:L,sections:['faq','cards','gallery']});const p=K.parseContent(x.md,{});
  t('export '+L+' faq/cards/gallery parses',p.ok&&x.items.length>0);
  const before=JSON.stringify([E2,A2]);const rep=K.applyContent(p.items,E2,A2,{});
  t('round trip '+L+' faq/cards/gallery stable',rep.every(r=>r.action==='update')&&JSON.stringify([E2,A2])===before);}
 t('multi-line answer with sub heading survives export',/### Note/.test(K.exportContent(E,A,{lang:'en',sections:['faq']}).md));
 t('gallery needs lines',!K.parseContent('---\ntype: gallery\ngroup: g\n---\n',{}).ok);
 t('faq without headings is an error',!K.parseContent('---\ntype: faq\n---\njust text',{}).ok);}
// Phase 17B: Word files of type faq / items / gallery
{const W=require('../word-import.js');
 const fq=W.normalize('# كم المدة؟\n\nنحو 45 دقيقة.\n\n## هل يوجد تأمين؟\n\nنعم.',{defaultType:'faq',group:'عام'});
 const pf=K.parseContent(fq,{defaultLang:'ar'});
 t('word faq: one group, each heading a question',pf.ok&&pf.items.length===2&&pf.items[0].fields.group==='عام'&&pf.items[1].fields.question==='هل يوجد تأمين؟');
 const gl=W.normalize('c1.jpg | Reception\n\nc2.jpg | Room | Modern room',{defaultType:'gallery'});
 const pg=K.parseContent(gl,{defaultLang:'en'});
 t('word gallery lines',pg.ok&&pg.items.length===2&&pg.items[1].fields.alt==='Modern room'&&pg.items[0].fields.group==='general');
 const it=W.normalize('type: items\ngroup: why-us\nlang: en\n\n# Fast\n\nQuick work.\n\nicon: bolt',{defaultType:'blog'});
 const pi=K.parseContent(it,{});
 t('word items with lines at the top',pi.ok&&pi.items.length===1&&pi.items[0].fields.icon==='bolt'&&pi.items[0].fields.group==='why-us');
 t('word blog still one item per Heading 1',K.parseContent(W.normalize('# A\n\ntext a\n\n# B\n\ntext b',{defaultType:'blog'}),{}).items.length===2);}
console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);

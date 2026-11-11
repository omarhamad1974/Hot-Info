// Run from the project root: node scripts/test-admin-sections.js  (checks the Arabic mirror/compact of FAQ, Cards, Gallery in admin.html)
const fs=require('fs');const h=fs.readFileSync(__dirname+'/../admin.html','utf8');
const grab=(re)=>{const m=h.match(re);if(!m)throw new Error('missing '+re);return m[0]};
const code=[grab(/const PH='[^']*';/),grab(/const TRF=\{[^\n]*\};/),grab(/function mirror\(en,ar\)\{[\s\S]*?\n\}\nfunction compact/).replace(/function compact$/,''),grab(/function compact\(ar\)\{[\s\S]*?\n\}\nfunction syncLang/).replace(/function syncLang$/,'')].join('\n');
const f=new Function('PAGES',code+';return {mirror,compact,TRF}')([]);
const K=require(__dirname+'/../content-import.js');
const en={},ar={};
K.applyContent(K.parseContent('---\ntype: faq\ngroup: G\nlang: en\n---\n## Q1\nA1\n===\n---\ntype: gallery\ngroup: G\nlang: en\n---\nx.jpg | cap\n===\n---\ntype: items\ngroup: W\nlang: en\n---\n## C\ntxt\nbadge: new',{}).items,en,ar,{});
K.applyContent(K.parseContent('---\ntype: faq\ngroup: G\nlang: ar\n---\n## س1\nج1\nid: '+en.faq[0].id+'\n===\n---\ntype: gallery\ngroup: G\nlang: ar\n---\nx.jpg | تعليق',{}).items,en,ar,{});
const mir=f.mirror(en,ar),cmp=f.compact(mir);
const ok=en.faq.length===1&&mir.faq[0].question==='س1'&&mir.gallery[0].caption==='تعليق'&&cmp.faq[0].answer==='ج1'&&cmp.gallery[0].caption==='تعليق'&&!cmp.cards&&en.cards[0].badge==='new';
console.log(ok?'PASS admin mirror/compact keep faq/gallery Arabic':'FAIL '+JSON.stringify(cmp));

// Run from the project root: node scripts/test-blocks.js  (checks the public blocks renderer)
globalThis.KRich={rich:t=>'<p>'+String(t).replace(/</g,'&lt;')+'</p>',card:t=>String(t)};
const B=require('../blocks.js');let fail=0;const t=(n,c)=>{console.log((c?'PASS ':'FAIL ')+n);if(!c)fail++};
const D={
 blocks:[{id:'1',page:'home',type:'faq',group:'General',title:'Questions <b>',subtitle:'Intro'},{id:'2',page:'home',type:'gallery',group:'clinic',title:'Photos'},{id:'3',page:'home',type:'cards',group:'why',title:'Why us'},{id:'4',page:'about',type:'faq',group:'general',title:'Other page'},{id:'5',page:'home',type:'faq',group:'empty',title:'Nothing'},{id:'6',page:'home',type:'faq',group:'general',title:'Hidden',show:'0'}],
 faq:[{id:'1',group:'general',question:'How long?',answer:'45 min <script>'},{id:'2',group:'other',question:'x',answer:'y'}],
 gallery:[{id:'1',group:'clinic',image:'a.jpg',caption:'Reception',alt:'A room'},{id:'2',group:'clinic',image:'https://x.com/b.jpg',caption:'',alt:''}],
 cards:[{id:'1',group:'why',title:'Fast',description:'Quick',icon:'ph-star',image:'c.jpg',badge:'New',price:'100',link:'javascript:alert(1)',ctaText:'Go',ctaLink:'https://e.com'},{id:'2',group:'why',title:'Whole link',description:'',link:'patents.html'}]};
const h=B.html(D,'home');
t('home shows faq, gallery and cards in block order',h.indexOf('block-1')<h.indexOf('block-2')&&h.indexOf('block-2')<h.indexOf('block-3'));
t('empty group and hidden block are not drawn',!/block-5/.test(h)&&!/block-6/.test(h));
t('other page blocks are not on home',!/Other page/.test(h)&&/Other page/.test(B.html(D,'about')));
t('group match ignores case; only that group',/How long\?/.test(h)&&!/>x</.test(h));
t('title is escaped',/Questions &lt;b&gt;/.test(h)&&!/Questions <b>/.test(h));
t('answer goes through the formatter (escaped)',/45 min &lt;script>/.test(h)&&!/<script>/.test(h));
t('gallery: bare file in assets, full url kept, alt falls back to caption',/\.\/assets\/a\.jpg/.test(h)&&/https:\/\/x\.com\/b\.jpg/.test(h)&&/alt="A room"/.test(h));
t('cards: unsafe link removed, button link kept with rel',!/javascript:/.test(h)&&/href="https:\/\/e\.com"[^>]*rel="noopener"/.test(h));
t('cards: card with only a link is a link; icon and badge shown',/<a href="patents\.html"/.test(h)&&/ph-star/.test(h)&&/New/.test(h));
t('alternating background',/block-1" class="band"/.test(h)&&/block-2" class="band bg-surface"/.test(h));
t('no blocks, no output',B.html({},'home')==='');
console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);

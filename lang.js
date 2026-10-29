/* KHIP language layer: English (LTR) and Arabic (RTL).
   - The admin chooses which languages the site offers: English only, Arabic only, or both
     ("languages" in app-data.json). With both, visitors switch with the button in the header.
   - Arabic content lives in app-data.ar.json, which mirrors app-data.json. Any field left empty
     there falls back to the English text, so the site is never blank.
   - Short interface words (menu, buttons) come from the table below; the admin can edit the Arabic
     ones under Arabic > Interface text.
   Load this file in <head> (it sets lang/dir before the page paints). */
window.KLang=(function(){
  const LS='khip-lang',CS='khip-langs',AR_FILE='./app-data.ar.json';
  const DICT={
    en:{
      brand:'Intellectual Properties',nav_about:'About',nav_jur:'Jurisdictions',nav_services:'IP Services',nav_news:'News',nav_files:'My files',
      bar_home:'Home',bar_services:'IP Services',bar_news:'News',bar_jur:'Jurisdiction',bar_about:'About',bar_files:'My files',
      more:'More',jur_title:'Jurisdictions',svc_title:'IP Services',news_title:'Latest news',testi_title:'Client endorsements',
      load_err:"We couldn't load the latest content.",try_again:'Try again',close:'Close',
      no_country:'No matching country. Message us and we will check for you.',ip_guidelines:'IP guidelines available upon inquiry.',
      view_req:'View Filing Requirements',pct:'PCT Filing Guidelines',copy_link:'Copy link',link_copied:'Link copied',related:'Related news',
      more_info:'More information',inquire_about:'Inquire about {x}',wa_service:'Hello KHIP! I would like to inquire about {x}.',
      wa_jur:'IP filings and legal procedures in {x}',general:'General',msg_wa:'Message KHIP on WhatsApp',send:'Send',
      switch_to:'العربية',flag_aria:'{x} flag',testimonial_n:'Testimonial {x}',news_n:'News {x}',
      nav_scope:'Our Regional Scope',nav_value:'Value',nav_adv:'Advantages',nav_team:'Team',nav_contact:'Contact',
      follow_li:'Follow us on LinkedIn',phone:'Phone',email:'Email',open_maps:'Open in Google Maps',filing_guidelines:'Filing guidelines',
      wa_us:'WhatsApp us',team_prev:'Previous team members',team_next:'Next team members',
      prompts:["Hello KHIP, I'd like to register a trademark in Egypt","How long does a patent filing take in the UAE?","Can you translate my patent into Arabic?","What documents do I need for a PCT national phase entry?"]
    },
    ar:{
      brand:'للملكية الفكرية',nav_about:'من نحن',nav_jur:'الاختصاصات القضائية',nav_services:'خدمات الملكية الفكرية',nav_news:'الأخبار',nav_files:'ملفاتي',
      bar_home:'الرئيسية',bar_services:'الخدمات',bar_news:'الأخبار',bar_jur:'الدول',bar_about:'من نحن',bar_files:'ملفاتي',
      more:'المزيد',jur_title:'الاختصاصات القضائية',svc_title:'خدمات الملكية الفكرية',news_title:'آخر الأخبار',testi_title:'آراء العملاء',
      load_err:'تعذر تحميل أحدث المحتوى.',try_again:'حاول مرة أخرى',close:'إغلاق',
      no_country:'لا توجد دولة مطابقة. راسلنا وسنتحقق لك.',ip_guidelines:'إرشادات الملكية الفكرية متاحة عند الاستفسار.',
      view_req:'عرض متطلبات التسجيل',pct:'إرشادات تقديم طلبات معاهدة التعاون بشأن البراءات (PCT)',copy_link:'نسخ الرابط',link_copied:'تم نسخ الرابط',related:'أخبار ذات صلة',
      more_info:'مزيد من المعلومات',inquire_about:'استفسر عن {x}',wa_service:'مرحباً KHIP! أود الاستفسار عن {x}.',
      wa_jur:'إجراءات تسجيل الملكية الفكرية والإجراءات القانونية في {x}',general:'عام',msg_wa:'راسل KHIP عبر واتساب',send:'إرسال',
      switch_to:'English',flag_aria:'علم {x}',testimonial_n:'الرأي {x}',news_n:'الخبر {x}',
      nav_scope:'نطاقنا الإقليمي',nav_value:'القيمة',nav_adv:'المزايا',nav_team:'الفريق',nav_contact:'اتصل بنا',
      follow_li:'تابعنا على لينكدإن',phone:'الهاتف',email:'البريد الإلكتروني',open_maps:'افتح في خرائط جوجل',filing_guidelines:'إرشادات التسجيل',
      wa_us:'راسلنا عبر واتساب',team_prev:'أعضاء الفريق السابقون',team_next:'أعضاء الفريق التاليون',
      prompts:['مرحباً KHIP، أود تسجيل علامة تجارية في مصر','كم يستغرق تقديم طلب براءة اختراع في الإمارات؟','هل يمكنكم ترجمة براءة الاختراع الخاصة بي إلى العربية؟','ما المستندات المطلوبة لدخول المرحلة الوطنية لمعاهدة PCT؟']
    }
  };
  if(document.currentScript&&document.currentScript.hasAttribute('data-passive'))return {DICT}; // admin page: word lists only, no language switching
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  let langs=['en','ar','both'].includes(get(CS))?get(CS):'en',ui={};
  function pick(){
    if(langs==='ar')return 'ar';
    if(langs==='en')return 'en';
    const q=new URLSearchParams(location.search).get('lang');
    if(q==='ar'||q==='en'){put(LS,q);return q}
    return get(LS)==='ar'?'ar':'en';
  }
  const PH='المحتوى العربي'; // placeholder shown wherever the admin has not entered Arabic yet (About, service pages, team, testimonials)
  const K={DICT,AR_FILE,PH,lang:pick(),rtl:false,EN:null,AR:null};
  function fonts(){
    if(document.getElementById('khip-ar-fonts'))return;
    const l=document.createElement('link');l.id='khip-ar-fonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@500;600&display=swap';
    document.head.appendChild(l);
  }
  function apply(){
    K.rtl=K.lang==='ar';
    const h=document.documentElement;h.lang=K.lang;h.dir=K.rtl?'rtl':'ltr';
    if(K.rtl)fonts();
  }
  apply();
  K.t=(key,vars)=>{
    let v=(K.rtl&&ui[key]!=null&&String(ui[key]).trim()!==''?ui[key]:null)??DICT[K.lang][key]??DICT.en[key]??key;
    if(typeof v==='string'&&vars)for(const n in vars)v=v.split('{'+n+'}').join(vars[n]);
    return v;
  };
  K.dom=(root=document)=>{
    root.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=K.t(e.dataset.i18n)});
    root.querySelectorAll('[data-i18n-attr]').forEach(e=>e.dataset.i18nAttr.split(';').forEach(p=>{const [a,k]=p.split(':');if(a&&k)e.setAttribute(a.trim(),K.t(k.trim()))}));
  };
  // The admin's language choice. Returns true when the language shown has just changed.
  K.settings=v=>{
    const n=['en','ar','both'].includes(v)?v:'en';
    langs=n;put(CS,n);const old=K.lang;K.lang=pick();apply();K.mount();
    return old!==K.lang;
  };
  K.langs=()=>langs;
  K.set=l=>{put(LS,l);const u=new URL(location.href);u.searchParams.delete('lang');location.href=u.pathname+u.search+u.hash;location.reload()};
  // The EN | AR button: any element with id="lang-switch" (only filled when both languages are on)
  K.mount=()=>{
    document.querySelectorAll('#lang-switch').forEach(e=>{
      if(langs!=='both'){e.innerHTML='';return}
      e.innerHTML=`<button type="button" class="lang-btn" lang="${K.rtl?'en':'ar'}" aria-label="${K.rtl?'Switch to English':'التبديل إلى العربية'}">${DICT[K.lang].switch_to}</button>`;
      e.firstChild.onclick=()=>K.set(K.rtl?'en':'ar');
    });
  };
  const JSON_GET=async u=>{const r=await fetch(u,{cache:'no-cache'});if(!r.ok)throw new Error(r.status);return r.json()};
  const txt=v=>typeof v==='string'&&v.trim()!=='';
  const PHF={testimonials:['name','role','text'],employees:['name','position']};
  const NEUTRAL=new Set(['id','image','icon','page','code','flag','date','category']);
  // Arabic over English, field by field; empty Arabic fields keep the English text.
  K.merge=(en,ar)=>{
    ui=(ar&&ar.ui)||{};
    if(!K.rtl)return en;
    const o=JSON.parse(JSON.stringify(en));
    (o.jurisdictions||[]).forEach(j=>{j.enCountry=j.country});
    o.chatPrompts=ar&&Array.isArray(ar.chatPrompts)&&ar.chatPrompts.some(txt)?ar.chatPrompts.filter(txt):DICT.ar.prompts;
    (o.services||[]).forEach(s=>{s.enTitle=s.title});
    ar=ar||{};
    for(const k of ['aboutMainText','about'])if(txt(ar[k]))o[k]=ar[k];
    const enC=en.newsCategories||[],arC=ar.newsCategories||[],cm={};
    enC.forEach((c,i)=>{if(txt(arC[i]))cm[c]=arC[i]});
    o.newsCategories=enC.map(c=>cm[c]||c);
    for(const sec of ['carousel','jurisdictions','news','services','testimonials','employees','products']){
      const a=ar[sec];if(!Array.isArray(a)||!Array.isArray(o[sec]))continue;
      const by=new Map(a.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
      o[sec].forEach((it,i)=>{const x=by.get(String(it.id))||(it.id==null?a[i]:null);if(!x)return;
        for(const [k,v] of Object.entries(x))if(!NEUTRAL.has(k)&&txt(v))it[k]=v});
    }
    // Team and testimonials: Arabic only. Anything the admin has not written shows the placeholder, never English.
    for(const [sec,fs] of Object.entries(PHF)){
      const a=Array.isArray(ar[sec])?ar[sec]:[],by=new Map(a.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
      (o[sec]||[]).forEach((it,i)=>{const x=by.get(String(it.id))||(it.id==null?a[i]:null)||{};fs.forEach(f=>{it[f]=txt(x[f])?x[f]:PH})});
    }
    (o.news||[]).forEach(n=>{if(cm[n.category])n.category=cm[n.category]});
    return o;
  };
  // ---- Phase 2 helpers: About page, service pages ----
  // Arabic field of one item (by id), or the placeholder when the admin has not written it.
  K.arOr=(sec,id,field)=>{const a=((K.AR&&K.AR[sec])||[]).find(x=>x&&String(x.id)===String(id));return a&&txt(a[field])?a[field]:PH};
  // Text blocks marked data-t="key" take their Arabic from app-data.ar.json > pageText > <page> > key.
  // (the page's file name without .html, eg "about"). The admin writes them under Arabic > Page text. Service names marked data-svc-page="patents.html" follow the service's Arabic title.
  K.fill=(root=document)=>{
    if(!K.rtl)return;
    const file=(location.pathname.split('/').pop()||'index').replace(/\.html$/,''),pt=((K.AR&&K.AR.pageText)||{})[file]||{};
    root.querySelectorAll('[data-t]').forEach(e=>{const v=pt[e.dataset.t];e.textContent=txt(v)?v:PH});
    root.querySelectorAll('[data-svc-page]').forEach(e=>{
      const sv=((K.EN&&K.EN.services)||[]).find(x=>x.page===e.dataset.svcPage);
      e.textContent=sv?K.arOr('services',sv.id,'title'):PH;
    });
    if(pt._title&&txt(pt._title))document.title=pt._title;
    document.documentElement.setAttribute('data-ar-ready','1');
  };
  // Loads app-data.json (always: it holds the settings), then the Arabic file when Arabic is showing.
  K.data=async(url='./app-data.json')=>{
    const en=await JSON_GET(url);
    K.settings(en.languages);
    let ar=null;
    if(K.rtl){try{ar=await JSON_GET(AR_FILE)}catch{}}
    K.EN=en;K.AR=ar;
    return K.merge(en,ar);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',K.mount);else K.mount();
  return K;
})();

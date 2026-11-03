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
      brand:'Intellectual Properties',nav_about:'About',nav_jur:'HOT News',nav_services:'IP Services',nav_news:'News',nav_files:'My files',
      bar_home:'Home',bar_services:'IP Services',bar_news:'News',bar_jur:'HOT News',bar_about:'About',bar_files:'My files',bar_tenders:'Tenders',tn_new:'{x} new tenders in your sectors',tn_new1:'1 new tender in your sectors',tn_view:'View tenders',
      more:'More',jur_title:'HOT News',svc_title:'IP Services',news_title:'Latest news',testi_title:'Client endorsements',
      load_err:"We couldn't load the latest content.",try_again:'Try again',close:'Close',
      no_country:'No matching country. Message us and we will check for you.',ip_guidelines:'IP guidelines available upon inquiry.',
      view_req:'View Filing Requirements',pct:'PCT Filing Guidelines',copy_link:'Copy link',link_copied:'Link copied',related:'Related news',
      more_info:'More information',inquire_about:'Inquire about {x}',wa_service:'Hello KHIP! I would like to inquire about {x}.',
      wa_jur:'IP filings and legal procedures in {x}',general:'General',msg_wa:'Message KHIP on WhatsApp',send:'Send',
      switch_to:'العربية',flag_aria:'{x} flag',testimonial_n:'Testimonial {x}',news_n:'News {x}',
      nav_scope:'Our Regional Scope',nav_value:'Value',nav_adv:'Advantages',nav_team:'Team',nav_contact:'Contact',
      follow_li:'Follow us on LinkedIn',address:'Address',hot_more:'More',hot_less:'Close',hot_pub:'Published',hot_entity:'Publishing entity',hot_gov:'Governorate',hot_session:'Session date',hot_gone:'This tender is no longer available.',hot_sub_only:'Booklet price, bid bond and documents are available to subscribers.',hot_n:'{x} active tenders',hot_n1:'1 active tender',hot_cta:'See all tenders',hot_note:'Full details are available to subscribers.',phone:'Phone',email:'Email',open_maps:'Open in Google Maps',filing_guidelines:'Filing guidelines',
      wa_us:'WhatsApp us',team_prev:'Previous team members',team_next:'Next team members',
      nav_directory:'Directory',bar_directory:'Directory',dir_title:'Directory',dir_sub:'Companies, institutions and freelancers. Search, filter and contact them directly on WhatsApp.',
      dir_search:'Search',dir_search_ph:'Name, city or phone',dir_sector:'Sector',dir_all_sectors:'All sectors',dir_all:'All',dir_company:'Company',dir_companies:'Companies',dir_institution:'Institution',dir_institutions:'Institutions',dir_freelancer:'Freelancer',dir_freelancers:'Freelancers',
      dir_offers_only:'Special offers only',dir_count:'{x} results',dir_count1:'1 result',dir_clear:'Clear filters',dir_none:'No matches. Try another word or clear the filters.',dir_empty:'The directory is being prepared. Please check back soon.',
      dir_wa:'WhatsApp',dir_website:'Website',dir_social:'Social media',dir_more:'Show more',dir_err:"We couldn't load the directory.",dir_wa_msg:'Hello, I found you in the HOT Info directory.',
      dir_details:'Details',dir_share:'Share',dir_copied:'Link copied',dir_submit:'Add your business',dir_s_title:'Add your business to the directory',dir_s_sub:'Fill in the form. Our team reviews every submission before it appears. Fields marked * are required.',dir_s_name:'Name',dir_s_name_ar:'Name in Arabic',dir_s_type:'Type',dir_s_sector:'Business sector',dir_s_pick:'Choose a sector',dir_s_city:'City',dir_s_address:'Address',dir_s_phones:'Phone numbers (one per line)',dir_s_wa:'WhatsApp number (with country code)',dir_s_email:'Email',dir_s_web:'Website',dir_s_social:'Social media page',dir_s_desc:'About you (what you do, services)',dir_s_offer:'Special offer for HOT Info visitors (optional)',dir_s_otitle:'Short title',dir_s_otext:'Offer details',dir_s_oends:'Valid until (empty = no end date)',dir_s_contact:'Your contact details (private: only our team sees them)',dir_s_cname:'Your name',dir_s_cphone:'Your phone',dir_s_cemail:'Your email',dir_s_contact_hint:'Give a phone or an email so we can reach you.',dir_s_send:'Send for review',dir_s_sending:'Sending...',dir_s_ok_title:'Thank you!',dir_s_ok_text:'We received your details. Our team will review them and publish your entry after approval.',dir_s_again:'Add another',dir_s_err:'We could not send the form. Please try again.',dir_s_req:'Please fill in the required fields.',dir_s_bad_wa:'The WhatsApp number does not look right.',dir_s_bad_mail:'An email address does not look right.',dir_s_bad_url:'A website or social link does not look right.',dir_s_bad_contact:'Please give a phone or an email so we can reach you.',dir_s_limit:'Too many submissions right now. Please try again later.',dir_s_exists:'This business is already in the directory or waiting for review.',dir_back:'Back to the directory',dir_about:'About',dir_offer:'Special offer',dir_valid_until:'Valid until {x}',dir_contact:'Contact',dir_call:'Call',dir_email:'Email',dir_address:'Address',dir_map:'Open in Google Maps',dir_notfound:'This entry is not available',dir_notfound_sub:'It may have been removed or is not published yet.',dir_no_info:'More information will be added soon.',
      prompts:["Hello KHIP, I'd like to register a trademark in Egypt","How long does a patent filing take in the UAE?","Can you translate my patent into Arabic?","What documents do I need for a PCT national phase entry?"]
    },
    ar:{
      brand:'للملكية الفكرية',nav_about:'من نحن',nav_jur:'أخبار HOT',nav_services:'خدمات الملكية الفكرية',nav_news:'الأخبار',nav_files:'ملفاتي',
      bar_home:'الرئيسية',bar_services:'الخدمات',bar_news:'الأخبار',bar_jur:'أخبار HOT',bar_about:'من نحن',bar_files:'ملفاتي',bar_tenders:'المناقصات',tn_new:'{x} مناقصات جديدة في قطاعاتك',tn_new1:'مناقصة جديدة في قطاعاتك',tn_view:'عرض المناقصات',
      more:'المزيد',jur_title:'أخبار HOT',svc_title:'خدمات الملكية الفكرية',news_title:'آخر الأخبار',testi_title:'آراء العملاء',
      load_err:'تعذر تحميل أحدث المحتوى.',try_again:'حاول مرة أخرى',close:'إغلاق',
      no_country:'لا توجد دولة مطابقة. راسلنا وسنتحقق لك.',ip_guidelines:'إرشادات الملكية الفكرية متاحة عند الاستفسار.',
      view_req:'عرض متطلبات التسجيل',pct:'إرشادات تقديم طلبات معاهدة التعاون بشأن البراءات (PCT)',copy_link:'نسخ الرابط',link_copied:'تم نسخ الرابط',related:'أخبار ذات صلة',
      more_info:'مزيد من المعلومات',inquire_about:'استفسر عن {x}',wa_service:'مرحباً KHIP! أود الاستفسار عن {x}.',
      wa_jur:'إجراءات تسجيل الملكية الفكرية والإجراءات القانونية في {x}',general:'عام',msg_wa:'راسل KHIP عبر واتساب',send:'إرسال',
      switch_to:'English',flag_aria:'علم {x}',testimonial_n:'الرأي {x}',news_n:'الخبر {x}',
      nav_scope:'نطاقنا الإقليمي',nav_value:'القيمة',nav_adv:'المزايا',nav_team:'الفريق',nav_contact:'اتصل بنا',
      follow_li:'تابعنا على لينكدإن',address:'العنوان',hot_more:'المزيد',hot_less:'إغلاق',hot_pub:'تاريخ النشر',hot_entity:'الجهة المعلنة',hot_gov:'المحافظة',hot_session:'موعد الجلسة',hot_gone:'هذه المناقصة لم تعد متاحة.',hot_sub_only:'ثمن الكراسة والتأمين والمستندات متاحة للمشتركين.',hot_n:'{x} مناقصات سارية',hot_n1:'مناقصة سارية واحدة',hot_cta:'عرض كل المناقصات',hot_note:'التفاصيل الكاملة متاحة للمشتركين.',phone:'الهاتف',email:'البريد الإلكتروني',open_maps:'افتح في خرائط جوجل',filing_guidelines:'إرشادات التسجيل',
      wa_us:'راسلنا عبر واتساب',team_prev:'أعضاء الفريق السابقون',team_next:'أعضاء الفريق التاليون',
      nav_directory:'الدليل',bar_directory:'الدليل',dir_title:'الدليل',dir_sub:'شركات وجهات ومستقلون. ابحث وصفِّ وتواصل معهم مباشرة عبر واتساب.',
      dir_search:'بحث',dir_search_ph:'الاسم أو المدينة أو الهاتف',dir_sector:'القطاع',dir_all_sectors:'كل القطاعات',dir_all:'الكل',dir_company:'شركة',dir_companies:'شركات',dir_institution:'جهة',dir_institutions:'جهات',dir_freelancer:'مستقل',dir_freelancers:'مستقلون',
      dir_offers_only:'العروض الخاصة فقط',dir_count:'{x} نتيجة',dir_count1:'نتيجة واحدة',dir_clear:'مسح التصفية',dir_none:'لا توجد نتائج. جرّب كلمة أخرى أو امسح التصفية.',dir_empty:'الدليل قيد الإعداد. يرجى العودة قريباً.',
      dir_wa:'واتساب',dir_website:'الموقع الإلكتروني',dir_social:'وسائل التواصل',dir_more:'عرض المزيد',dir_err:'تعذر تحميل الدليل.',dir_wa_msg:'مرحباً، وجدتكم في دليل HOT Info.',
      dir_details:'التفاصيل',dir_share:'مشاركة',dir_copied:'تم نسخ الرابط',dir_submit:'أضف نشاطك',dir_s_title:'أضف نشاطك إلى الدليل',dir_s_sub:'املأ النموذج. يراجع فريقنا كل طلب قبل ظهوره. الحقول المعلّمة بـ * مطلوبة.',dir_s_name:'الاسم',dir_s_name_ar:'الاسم بالعربية',dir_s_type:'النوع',dir_s_sector:'قطاع النشاط',dir_s_pick:'اختر القطاع',dir_s_city:'المدينة',dir_s_address:'العنوان',dir_s_phones:'أرقام الهاتف (رقم في كل سطر)',dir_s_wa:'رقم واتساب (مع كود الدولة)',dir_s_email:'البريد الإلكتروني',dir_s_web:'الموقع الإلكتروني',dir_s_social:'صفحة التواصل الاجتماعي',dir_s_desc:'نبذة عنكم (النشاط والخدمات)',dir_s_offer:'عرض خاص لزوار HOT Info (اختياري)',dir_s_otitle:'عنوان قصير',dir_s_otext:'تفاصيل العرض',dir_s_oends:'ساري حتى (فارغ = بدون تاريخ انتهاء)',dir_s_contact:'بيانات التواصل معك (خاصة: يراها فريقنا فقط)',dir_s_cname:'اسمك',dir_s_cphone:'هاتفك',dir_s_cemail:'بريدك الإلكتروني',dir_s_contact_hint:'اكتب رقم هاتف أو بريداً إلكترونياً لنتمكن من التواصل معك.',dir_s_send:'إرسال للمراجعة',dir_s_sending:'جارٍ الإرسال...',dir_s_ok_title:'شكراً لك!',dir_s_ok_text:'استلمنا بياناتك. سيراجعها فريقنا وينشر نشاطك بعد الموافقة.',dir_s_again:'إضافة نشاط آخر',dir_s_err:'تعذر إرسال النموذج. حاول مرة أخرى.',dir_s_req:'من فضلك املأ الحقول المطلوبة.',dir_s_bad_wa:'رقم واتساب غير صحيح.',dir_s_bad_mail:'عنوان بريد إلكتروني غير صحيح.',dir_s_bad_url:'رابط موقع أو صفحة تواصل غير صحيح.',dir_s_bad_contact:'من فضلك اكتب رقم هاتف أو بريداً إلكترونياً للتواصل معك.',dir_s_limit:'عدد الطلبات كبير الآن. حاول مرة أخرى لاحقاً.',dir_s_exists:'هذا النشاط موجود بالفعل في الدليل أو بانتظار المراجعة.',dir_back:'العودة إلى الدليل',dir_about:'نبذة',dir_offer:'عرض خاص',dir_valid_until:'ساري حتى {x}',dir_contact:'التواصل',dir_call:'اتصال',dir_email:'البريد الإلكتروني',dir_address:'العنوان',dir_map:'افتح في خرائط جوجل',dir_notfound:'هذه الصفحة غير متاحة',dir_notfound_sub:'ربما تمت إزالتها أو لم يتم نشرها بعد.',dir_no_info:'ستتم إضافة المزيد من المعلومات قريباً.',
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

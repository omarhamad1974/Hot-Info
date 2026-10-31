/* KHIP contact details, WhatsApp number and social links.
   The values come from app-data.json: "contact" {whatsapp, phones[], email, address, mapLat, mapLng} and "social" {linkedin, ...}
   (edit them in admin.html > Contact). Arabic address: app-data.ar.json > contact.address.
   What it fills on a page:
     [data-social]          the social icons (header)
     [data-contact-tiles]   phone, email and address tiles (About page)
     [data-contact-email]   an email link;  [data-contact-phone]  the first phone number
     [data-contact-map]     the map block, hidden when no map position is set (with [data-map-embed] and [data-map-link])
     [data-follow]          the "Follow us on LinkedIn" button
   window.KCONTACT.whatsapp is read by footer.js. With no "contact" block the pages keep the text written in the HTML. */
(function(){
  const KEY='khip-contact-v1',DEF_WA='201006552255';
  const SOC=[['linkedin','ph-linkedin-logo','LinkedIn'],['youtube','ph-youtube-logo','YouTube'],['facebook','ph-facebook-logo','Facebook'],['instagram','ph-instagram-logo','Instagram'],['x','ph-x-logo','X'],['tiktok','ph-tiktok-logo','TikTok'],['telegram','ph-telegram-logo','Telegram']];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const digits=s=>String(s||'').replace(/\D/g,'');
  const tel=n=>(String(n||'').trim().startsWith('+')?'+':'')+digits(n);
  const ok=u=>/^https?:\/\//i.test(u||'');
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  const get=u=>fetch(u,{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject());
  const T=(k,d)=>{try{const v=window.KLang&&KLang.t(k);return v&&v!==k?v:d}catch{return d}};
  let cached=null;try{cached=JSON.parse(localStorage.getItem(KEY))}catch{}
  const setWa=c=>{window.KCONTACT=Object.assign(window.KCONTACT||{},{whatsapp:digits((c.contact||{}).whatsapp)||DEF_WA})};
  setWa(cached||{});
  function apply(c){
    setWa(c);
    const ct=c.contact,so=c.social||{};
    document.querySelectorAll('[data-social]').forEach(box=>{
      box.innerHTML=SOC.filter(([k])=>ok(so[k])).map(([k,ic,nm])=>`<a href="${esc(so[k])}" target="_blank" rel="noopener noreferrer" aria-label="${nm}" class="w-10 h-10 rounded-full border border-stone-200 text-stone-600 hover:text-brand-600 hover:border-brand-600 flex items-center justify-center transition"><i class="ph-light ${ic} text-xl"></i></a>`).join('');
    });
    document.querySelectorAll('[data-follow]').forEach(a=>{if(ok(so.linkedin)){a.href=so.linkedin;a.hidden=false}else a.hidden=true});
    if(!ct)return;                                   // no contact block yet: keep the text written in the page
    const phones=(Array.isArray(ct.phones)?ct.phones:[]).filter(p=>p&&String(p.number||'').trim());
    const tile=(href,icon,label,i18n,val)=>`<a href="${esc(href)}" class="ct-tile"><span class="ct-ico"><i class="ph-light ${icon}"></i></span><span><span class="block text-xs uppercase tracking-widest text-stone-500"${i18n?` data-i18n="${i18n}"`:''}>${esc(label)}</span><span class="block text-base text-ink">${esc(val)}</span></span></a>`;
    document.querySelectorAll('[data-contact-tiles]').forEach(box=>{
      const adr=String((c.addressAr&&window.KLang&&KLang.rtl?c.addressAr:ct.address)||'').trim();
      box.innerHTML=phones.map(p=>tile('tel:'+tel(p.number),'ph-phone',p.label||T('phone','Phone'),p.label?'':'phone',p.number)).join('')
        +(String(ct.email||'').trim()?tile('mailto:'+ct.email.trim(),'ph-envelope-simple',T('email','Email'),'email',ct.email.trim()):'')
        +(adr?`<div class="ct-tile"><span class="ct-ico"><i class="ph-light ph-map-pin"></i></span><span><span class="block text-xs uppercase tracking-widest text-stone-500" data-i18n="address">${esc(T('address','Address'))}</span><span class="block text-base text-ink">${esc(adr)}</span></span></div>`:'');
    });
    document.querySelectorAll('[data-contact-email]').forEach(a=>{
      const e=String(ct.email||'').trim();if(!e){a.hidden=true;return}
      a.hidden=false;a.href='mailto:'+e+(a.dataset.subject?'?subject='+encodeURIComponent(a.dataset.subject):'');a.textContent=e;
    });
    document.querySelectorAll('[data-contact-phone]').forEach(a=>{
      const p=phones[0];if(!p){a.hidden=true;return}
      a.hidden=false;a.href='tel:'+tel(p.number);a.textContent=p.number;
    });
    document.querySelectorAll('[data-contact-map]').forEach(box=>{
      const la=parseFloat(ct.mapLat),lo=parseFloat(ct.mapLng);
      if(!isFinite(la)||!isFinite(lo)){box.hidden=true;return}
      box.hidden=false;const q=`${la},${lo}`;
      const f=box.querySelector('[data-map-embed]'),l=box.querySelector('[data-map-link]');
      const src=`https://www.google.com/maps?q=${q}&z=17&hl=${window.KLang&&KLang.rtl?'ar':'en'}&output=embed`;
      if(f&&f.getAttribute('src')!==src)f.src=src;
      if(l)l.href=`https://www.google.com/maps?q=${q}&z=17`;
    });
  }
  ready(()=>{
    if(cached)apply(cached);
    get('./app-data.json').then(async en=>{
      const c={contact:en.contact,social:en.social||{}},K=window.KLang;
      if(K&&K.data){try{await K.data('./app-data.json')}catch{}}
      if(K&&K.rtl){try{c.addressAr=(((K.AR)||await get('./app-data.ar.json')).contact||{}).address||''}catch{}}
      try{localStorage.setItem(KEY,JSON.stringify(c))}catch{}
      apply(c);
    }).catch(()=>{});
  });
})();

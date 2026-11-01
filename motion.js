/* KHIP animations. The settings come from app-data.json > theme.motion (edit them in admin.html, tab Animation).
     theme.motion = { off, site:{type,duration,delay,distance,ease,repeat,hover},
                      sections:{ "<section key>": {type,duration,delay,distance,ease,repeat,cardType,stagger,hover} } }
   Every field left empty means "same as the whole site". With no "motion" settings this file changes nothing:
   the pages animate exactly as before (fade up on scroll, lift on card hover).
   It works on the items the pages already mark with class "fu" (they fade in when scrolled into view) and on cards (.card). */
(function(){
  const KEY='khip-motion-v1';
  const EASE={smooth:'cubic-bezier(.16,1,.3,1)',soft:'ease-out',inout:'ease-in-out',linear:'linear',snappy:'cubic-bezier(.2,.8,.2,1)',bounce:'cubic-bezier(.34,1.56,.64,1)'};
  const EASES=[['smooth','Smooth (default)'],['soft','Soft ending'],['inout','Slow start and end'],['snappy','Snappy'],['bounce','Little bounce'],['linear','Even speed']];
  const TYPES=[['none','No animation','Standard'],['fade','Fade in','Standard'],['fade-up','Fade up','Standard'],['fade-down','Fade down','Standard'],
    ['slide-left','Slide in from the left','Standard'],['slide-right','Slide in from the right','Standard'],['zoom-in','Zoom in','Standard'],['zoom-out','Zoom out','Standard'],
    ['blur-in','Blur to sharp','Advanced'],['flip-up','Flip up (3D)','Advanced'],['rotate-in','Rotate in','Advanced'],['reveal-up','Wipe up from the bottom','Advanced']];
  const HOVERS=[['none','No hover movement'],['lift','Lift with a bigger shadow'],['grow','Grow slightly'],['glow','Colored glow'],['border','Accent border'],['img-zoom','Zoom the picture inside the card']];
  const HV={
    none:{'--h-tf':'none','--h-sh':'0 1px 2px rgba(0,0,0,.05)'},
    lift:{'--h-tf':'translateY(-.5rem)','--h-sh':'0 28px 34px -8px rgba(0,0,0,.16),0 10px 12px -6px rgba(0,0,0,.1)'},
    grow:{'--h-tf':'scale(1.035)','--h-sh':'0 20px 25px -5px rgba(0,0,0,.12)'},
    glow:{'--h-tf':'translateY(-.25rem)','--h-sh':'0 0 0 3px rgb(var(--c-accent-rgb) / .22),0 18px 30px -8px rgb(var(--c-accent-rgb) / .35)'},
    border:{'--h-tf':'translateY(-2px)','--h-bc':'rgb(var(--c-accent-rgb))','--h-sh':'0 12px 20px -8px rgba(0,0,0,.12)'},
    'img-zoom':{'--h-tf':'none','--h-sh':'0 14px 22px -8px rgba(0,0,0,.14)'}
  };
  const num=(v,d)=>{v=parseFloat(v);return isFinite(v)?v:d};
  // The starting look of a type; the end look is always "normal".
  function from(type,dist){
    const d=num(dist,28),t={opacity:0,transform:'none',filter:'none',clip:''};
    switch(type){
      case 'fade-up':t.transform=`translateY(${d}px)`;break;
      case 'fade-down':t.transform=`translateY(${-d}px)`;break;
      case 'slide-left':t.transform=`translateX(${-d*2}px)`;break;
      case 'slide-right':t.transform=`translateX(${d*2}px)`;break;
      case 'zoom-in':t.transform='scale(.86)';break;
      case 'zoom-out':t.transform='scale(1.14)';break;
      case 'blur-in':t.filter='blur(10px)';break;
      case 'flip-up':t.transform=`perspective(900px) rotateX(28deg) translateY(${d*.7}px)`;break;
      case 'rotate-in':t.transform='rotate(-6deg) scale(.94)';break;
      case 'reveal-up':t.opacity=.15;t.clip='inset(100% -40px -40px -40px)';break;
    }
    return t;
  }
  // The settings that apply to one block or card of one section (empty field = the site's setting)
  function eff(M,key,isCard){
    M=M||{};const site=M.site||{},s=(M.sections||{})[key]||{};
    const has=v=>v!==undefined&&v!==null&&v!=='';
    const pick=k=>has(s[k])?s[k]:site[k];
    const c={type:pick('type')||'fade-up',duration:pick('duration'),delay:pick('delay'),distance:pick('distance'),ease:pick('ease'),repeat:pick('repeat')===true};
    if(isCard&&has(s.cardType))c.type=s.cardType;
    return c;
  }
  function preview(el,c){
    if(!el||!el.animate||c.type==='none')return;
    const f=from(c.type,c.distance);
    el.animate([{opacity:f.opacity,transform:f.transform,filter:f.filter,clipPath:f.clip||'none'},{opacity:1,transform:'none',filter:'none',clipPath:f.clip?'inset(-40px)':'none'}],
      {duration:num(c.duration,.9)*1000,delay:num(c.delay,0)*1000,easing:EASE[c.ease]||EASE.smooth,fill:'backwards'});
  }
  window.KMOTION={TYPES,HOVERS,EASES,EASE,from,eff,preview};
  if(/admin\.html$/.test(location.pathname))return;       // the admin page only uses the tables above

  const CARD='.card,.ncard,.tcard,.ct-tile';
  const isCard=el=>el.matches(CARD)||!!el.querySelector(CARD);
  let M=null;
  const rio=new IntersectionObserver(es=>es.forEach(x=>x.target.classList.toggle('in',x.isIntersecting)),{threshold:.08});
  function clear(el){
    const st=el.style;['--a-tf','--a-fl','--a-clip','--a-clip-to','--a-opacity','--a-dur','--a-ez','--a-ez2'].forEach(p=>st.removeProperty(p));
    if(el.dataset.d0!==undefined){el.dataset.d0?st.setProperty('--d',el.dataset.d0):st.removeProperty('--d');delete el.dataset.d0}
    el.removeAttribute('data-anim');rio.unobserve(el);
  }
  function configure(el){
    clear(el);
    if(!M)return;
    const sec=el.closest('[data-sec]'),key=sec?sec.dataset.sec:'',card=isCard(el),c=eff(M,key,card),st=el.style;
    el.dataset.d0=st.getPropertyValue('--d')||'';
    if(c.type==='none'){el.dataset.anim='none';return}
    const f=from(c.type,c.distance);
    st.setProperty('--a-tf',f.transform);st.setProperty('--a-fl',f.filter);
    if(f.clip){st.setProperty('--a-clip',f.clip);st.setProperty('--a-clip-to','inset(-40px)')}
    st.setProperty('--a-opacity',String(f.opacity));
    if(c.duration!==undefined&&c.duration!=='')st.setProperty('--a-dur',num(c.duration,.9)+'s');
    if(EASE[c.ease]){st.setProperty('--a-ez',EASE[c.ease]);st.setProperty('--a-ez2',EASE[c.ease])}
    let d=c.delay!==undefined&&c.delay!==''?num(c.delay,0):null;
    const s=((M.sections||{})[key])||{},sg=num(s.stagger,0);
    if(card&&sg>0&&sec){
      const cards=[...sec.querySelectorAll('.fu')].filter(isCard);
      d=(d||0)+Math.max(0,cards.indexOf(el))*sg;
    }
    if(d!==null)st.setProperty('--d',d.toFixed(2)+'s');
    if(c.repeat)rio.observe(el);
  }
  function hover(node,h){
    Object.keys(HV).forEach(k=>Object.keys(HV[k]).forEach(p=>node.style.removeProperty(p)));
    if(h&&HV[h])Object.entries(HV[h]).forEach(([p,v])=>node.style.setProperty(p,v));
    node.toggleAttribute('data-himg',h==='img-zoom');
  }
  function applyAll(){
    document.documentElement.toggleAttribute('data-motion-off',!!(M&&M.off));
    hover(document.documentElement,M&&M.site&&M.site.hover);
    document.querySelectorAll('[data-sec]').forEach(sec=>hover(sec,M&&((M.sections||{})[sec.dataset.sec]||{}).hover));
    document.querySelectorAll('.fu').forEach(configure);
  }
  const hasAny=m=>!!m&&(m.off||(m.site&&Object.keys(m.site).length)||(m.sections&&Object.keys(m.sections).length));
  const norm=m=>hasAny(m)?m:null;
  let pend=false;
  const mo=new MutationObserver(ms=>{
    if(!M||pend)return;pend=true;
    requestAnimationFrame(()=>{pend=false;
      document.querySelectorAll('.fu:not([data-d0]):not([data-anim])').forEach(configure);
      document.querySelectorAll('[data-sec]:not([data-hv])').forEach(sec=>{sec.dataset.hv='1';hover(sec,((M.sections||{})[sec.dataset.sec]||{}).hover)});
    });
  });
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  let cached=null;try{cached=JSON.parse(localStorage.getItem(KEY))}catch{}
  ready(()=>{
    M=norm(cached);applyAll();mo.observe(document.body,{childList:true,subtree:true});
    fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
      const fresh=norm((d.theme||{}).motion);
      try{localStorage.setItem(KEY,JSON.stringify(fresh))}catch{}
      if(JSON.stringify(fresh)!==JSON.stringify(M)){M=fresh;applyAll()}
    }).catch(()=>{});
  });
})();

/* KHIP sign-in with Supabase. Add <script src="auth.js"></script> before </body> on every page. */
(function(){
  const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  const invite=/type=(invite|recovery|signup)/.test(location.hash);
  const base=location.origin+location.pathname.replace(/[^/]*$/,'');
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Could not load '+src));document.head.appendChild(s)});
  const css=(k,h)=>{if(!document.querySelector(`link[href*="${k}"]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l)}};
  css('styles.css','styles.css');css('phosphor','https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/light/style.css');
  let sb=null,user=null,C=null,shown=false;const subs=[];
  // "Keep me signed in": checked = session kept in localStorage (survives closing the browser); unchecked = sessionStorage (ends when the tab closes)
  const FLAG='khip-remember',remember=()=>{try{return localStorage.getItem(FLAG)!=='0'}catch(e){return true}};
  const store={
    getItem:k=>{try{return sessionStorage.getItem(k)??localStorage.getItem(k)}catch(e){return null}},
    setItem:(k,v)=>{try{const on=remember();(on?localStorage:sessionStorage).setItem(k,v);(on?sessionStorage:localStorage).removeItem(k)}catch(e){}},
    removeItem:k=>{try{sessionStorage.removeItem(k);localStorage.removeItem(k)}catch(e){}}
  };

  // Header buttons: Login, or My files + sign out
  const box=document.createElement('div');box.className='auth-box';
  const wrap=document.querySelector('header .wrap');
  if(wrap&&wrap.lastElementChild){const last=wrap.lastElementChild,w=document.createElement('div');w.className='flex items-center gap-2 md:gap-3';wrap.replaceChild(w,last);w.append(box,last)}
  // Sign-in lives behind the "My files" button in the bottom bar; the header only offers sign-out once signed in.
  const paint=()=>{box.innerHTML=user?'<button class="auth-ico" data-a="pw" aria-label="Change password" title="Change password"><i class="ph-light ph-key"></i></button><button class="auth-ico" data-a="out" aria-label="Sign out" title="Sign out"><i class="ph-light ph-sign-out"></i></button>':''};
  box.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;
    if(b.dataset.a==='login')open('login');
    else if(b.dataset.a==='pw')open('newpw');
    else{await sb.auth.signOut();if(/my-stuff/.test(location.pathname))location.href='index.html'}});

  // Sign-in dialog
  const back=document.createElement('div');back.className='auth-back';
  back.innerHTML='<div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-t"><button class="auth-x" aria-label="Close"><i class="ph-light ph-x"></i></button><div id="auth-body"></div></div>';
  document.body.appendChild(back);
  const close=()=>back.classList.remove('open');
  back.addEventListener('click',e=>{if(e.target===back||e.target.closest('.auth-x'))close()});
  addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  function open(mode){
    const T={login:['Sign in','Access your files.'],reset:['Reset password','We will email you a reset link.'],newpw:['Set your password','Choose a password with at least 8 characters.'],signup:['Create account','Use your email address.']}[mode];
    const body=back.querySelector('#auth-body'),em=mode!=='newpw',pw=mode!=='reset';
    body.innerHTML=`<h2 id="auth-t" class="auth-h">${T[0]}</h2><p class="auth-p">${T[1]}</p>
      <form novalidate>${em?'<input class="auth-in" name="email" type="email" placeholder="Email" autocomplete="email" required>':''}${pw?`<input class="auth-in" name="password" type="password" placeholder="Password" autocomplete="${mode==='login'?'current-password':'new-password'}" required>`:''}${mode==='login'?`<label class="auth-p" style="display:flex;align-items:center;gap:.5rem;margin:.25rem 0 .5rem;cursor:pointer"><input type="checkbox" name="remember" ${remember()?'checked':''}> Keep me signed in on this device</label>`:''}
      <p class="auth-msg" role="alert"></p><button class="auth-go">${T[0]}</button></form>
      <div class="auth-links">${mode==='login'?'<a href="#" data-m="reset">Forgot password?</a>'+(C&&C.allowSignUp?'<a href="#" data-m="signup">Create account</a>':''):mode==='newpw'?'':'<a href="#" data-m="login">Back to sign in</a>'}</div>`;
    const form=body.querySelector('form'),msg=(t,ok)=>{const m=form.querySelector('.auth-msg');m.textContent=t;m.className='auth-msg'+(ok?' ok':'')};
    body.querySelectorAll('[data-m]').forEach(a=>a.onclick=e=>{e.preventDefault();open(a.dataset.m)});
    form.onsubmit=async ev=>{ev.preventDefault();const f=new FormData(form),email=String(f.get('email')||'').trim().toLowerCase(),p=String(f.get('password')||''),btn=form.querySelector('.auth-go');
      msg('');btn.disabled=true;
      try{
        if(!sb)throw new Error('Sign-in is not set up yet.');
        if(mode==='login'){try{localStorage.setItem(FLAG,f.get('remember')?'1':'0')}catch(e){}const {error}=await sb.auth.signInWithPassword({email,password:p});if(error)throw new Error('Incorrect email or password.');close();if(!/my-stuff/.test(location.pathname))location.href='my-stuff.html'}
        else if(mode==='reset'){await sb.auth.resetPasswordForEmail(email,{redirectTo:base+'my-stuff.html'});msg('If this email is registered, a reset link is on its way.',1)}
        else if(mode==='signup'){const {error}=await sb.auth.signUp({email,password:p,options:{emailRedirectTo:base+'my-stuff.html'}});if(error)throw error;msg('Check your email to confirm your account.',1)}
        else{if(p.length<8)throw new Error('Use at least 8 characters.');const {error}=await sb.auth.updateUser({password:p});if(error)throw error;close();location.href='my-stuff.html'}
      }catch(e){msg(e.message)}finally{btn.disabled=false}};
    back.classList.add('open');setTimeout(()=>{const i=form.querySelector('input');i&&i.focus({preventScroll:true})},50);
  }

  // Tender notification: a "Tenders" item in the bottom bar for signed-in people, and a small bell card
  // ("N new tenders in your sectors") when the admin has sent an update. The page tenders.html shows it itself.
  const TL=(k,v,d)=>window.KLang?KLang.t(k,v):d;
  const onTenders=/tenders\.html/.test(location.pathname)||/admin\.html/.test(location.pathname);
  let tnEl=null,tnN=0;
  const tnClear=()=>{if(tnEl){tnEl.remove();tnEl=null}tnN=0;tnBar()};
  function tnBar(){
    const nav=document.querySelector('#khip-bar nav');if(!nav)return;
    let b=nav.querySelector('[data-go="tenders"]');
    if(user&&!b){b=document.createElement('button');b.type='button';b.dataset.go='tenders';b.innerHTML='<i class="ph-light ph-gavel"></i>'+TL('bar_tenders',null,'Tenders');nav.appendChild(b)}
    else if(!user&&b)b.remove();
    if(b){const d=b.querySelector('.tn-dot');if(d)d.remove();if(tnN>0){const s=document.createElement('span');s.className='tn-dot';s.textContent=tnN>99?'99+':tnN;b.appendChild(s)}}
  }
  async function tenderNotice(){
    tnClear();tnBar();
    if(!user||!sb||onTenders)return;
    try{
      const {data,error}=await sb.rpc('tender_notice');
      if(error||!data||!(data.count>0))return;
      tnN=data.count;tnBar();
      tnEl=document.createElement('div');tnEl.className='tn-toast';tnEl.setAttribute('role','status');
      tnEl.innerHTML='<i class="ph-light ph-bell-ringing"></i><p></p><a href="tenders.html"></a><button type="button" aria-label="Close"><i class="ph-light ph-x"></i></button>';
      tnEl.querySelector('p').textContent=data.count===1?TL('tn_new1',null,'1 new tender in your sectors'):TL('tn_new',{x:data.count},data.count+' new tenders in your sectors');
      tnEl.querySelector('a').textContent=TL('tn_view',null,'View tenders');
      // Closing the card counts as "seen": the next update counts from now
      tnEl.querySelector('button').onclick=()=>{sb.rpc('tender_mark_seen').then(()=>{},()=>{});tnClear()};
      document.body.appendChild(tnEl);
    }catch(e){/* tenders are not set up yet: stay silent */}
  }

  const ready=(async()=>{
    paint();
    try{
      await Promise.all([window.supabase?0:load(LIB),window.KHIP_SUPABASE?0:load('supabase-config.js')]);
      C=window.KHIP_SUPABASE;
      if(!C||/YOUR-/.test(C.url||'')){console.warn('KHIP: add your Supabase URL and anon key to supabase-config.js');return}
      sb=window.supabase.createClient(C.url,C.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'khip-auth',storage:store}});
      const {data}=await sb.auth.getSession();user=data.session?data.session.user:null;paint();tenderNotice();
      let lastUid=user&&user.id;sb.auth.onAuthStateChange((ev,s)=>{user=s?s.user:null;paint();subs.forEach(f=>f(user));if((user&&user.id)!==lastUid){lastUid=user&&user.id;tenderNotice()}
        if(ev==='PASSWORD_RECOVERY'||(ev==='SIGNED_IN'&&invite&&!shown)){shown=true;open('newpw')}});
    }catch(e){console.warn('KHIP auth:',e)}
  })();
  window.KHIPTenderNotice={clear:tnClear};
  window.KHIPAuth={ready,open:()=>open('login'),user:()=>user,client:()=>sb,config:()=>C,onChange:f=>subs.push(f)};
})();

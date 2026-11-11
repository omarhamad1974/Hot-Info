/* Image version: every image address gets ?v=N so browsers and the CDN fetch the newest file instead of an old cached copy.
   To force fresh images again after replacing pictures on GitHub, change KIMG_V here AND in admin.html (const KIMG_V, used by the admin previews). */
window.KIMG_V='2';
window.kv=function(u){u=String(u==null?'':u);
  if(!u||/^(data:|blob:)/i.test(u)||/[?&](v=|token=|X-Amz|Signature)/i.test(u))return u;
  const h=u.indexOf('#'),a=h<0?u:u.slice(0,h),f=h<0?'':u.slice(h);
  return a+(a.indexOf('?')<0?'?':'&')+'v='+window.KIMG_V+f};
/* Tailwind theme for the KHIP site. Load after the Tailwind CDN script.
   Colours come from CSS variables (see styles.css and theme.js), so the palette set in admin.html applies everywhere. */
const v=n=>`rgb(var(--c-${n}-rgb) / <alpha-value>)`;
tailwind.config={theme:{extend:{
  fontFamily:{display:['"Cormorant Garamond"','Georgia','serif'],sans:['Jost','system-ui','sans-serif']},
  colors:{ink:v('ink'),gold:v('gold'),title:v('title'),sand:v('sand'),surface:v('surface'),brand:{50:v('accent-soft'),100:'#dbeafe',600:v('accent'),700:v('accent-dark')}}
}}}

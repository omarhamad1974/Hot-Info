/* Tailwind theme for the KHIP site. Load after the Tailwind CDN script.
   Colours come from CSS variables (see styles.css and theme.js), so the palette set in admin.html applies everywhere. */
const v=n=>`rgb(var(--c-${n}-rgb) / <alpha-value>)`;
tailwind.config={theme:{extend:{
  fontFamily:{display:['"Cormorant Garamond"','Georgia','serif'],sans:['Jost','system-ui','sans-serif']},
  colors:{ink:v('ink'),gold:v('gold'),title:v('title'),sand:v('sand'),surface:v('surface'),brand:{50:v('accent-soft'),100:'#dbeafe',600:v('accent'),700:v('accent-dark')}}
}}}

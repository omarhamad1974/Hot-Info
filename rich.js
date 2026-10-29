/* Tiny text formatter for content written in the admin page.
   **bold**   ## Subtitle   - bullet (also * or a dot at the start of a line)   */
window.KRich=(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const inl=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong class="font-medium text-ink">$1</strong>');
  const BUL=/^\s*(?:[-*\u2022]\s+)(.*)$/,HEAD=/^\s*##\s+(.*)$/;
  // full formatting, for popups
  function rich(t){
    let out='',open=false;
    for(const l of String(t??'').split('\n')){
      const b=l.match(BUL);
      if(b){if(!open){out+='<ul class="list-disc ps-5 space-y-1 my-2">';open=true}out+='<li>'+inl(b[1])+'</li>';continue}
      if(open){out+='</ul>';open=false}
      const h=l.match(HEAD);
      if(h)out+='<h4 class="font-display text-xl font-semibold text-title mt-4 mb-1">'+inl(h[1])+'</h4>';
      else if(!l.trim())out+='<div class="h-3"></div>';
      else out+='<p>'+inl(l)+'</p>';
    }
    return out+(open?'</ul>':'');
  }
  // for clamped cards: keeps bold and line breaks, shows bullets as dots
  const card=t=>String(t??'').split('\n').map(l=>inl(l.replace(HEAD,'$1').replace(BUL,'\u2022 $1'))).join('<br>');
  // one flowing line of plain text (no markers), for short summaries
  const plain=t=>esc(String(t??'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/^\s*##\s+/gm,'').replace(/^\s*[-*\u2022]\s+/gm,'\u2022 ').replace(/\n+/g,' '));
  return {esc,rich,card,plain};
})();

// Injects a small runtime into generated HTML so it behaves correctly
// inside an iframe (especially srcdoc): smooth-scroll anchors instead of
// reloading, and open external links in a new tab.

const RUNTIME = `
<script>(function(){
  function scrollToHash(hash){
    if(!hash || hash === '#') return;
    try {
      var id = decodeURIComponent(hash.slice(1));
      var el = document.getElementById(id) || document.querySelector(hash) || document.querySelector('[name="'+id+'"]');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
    } catch(e){}
    return false;
  }
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if(!a) return;
    var href = a.getAttribute('href') || '';
    // Internal hash links → smooth scroll, never reload iframe
    if (href.startsWith('#')) {
      e.preventDefault();
      if (scrollToHash(href)) {
        try { history.replaceState(null,'',href); } catch(_){}
      }
      return;
    }
    // External / absolute links → open in top window new tab to escape iframe
    if (/^(https?:|mailto:|tel:)/i.test(href)) {
      if (!a.target) a.target = '_blank';
      if (!a.rel) a.rel = 'noopener noreferrer';
    }
  }, true);
  // Initial hash
  if (location.hash) setTimeout(function(){ scrollToHash(location.hash); }, 50);
})();</script>
`;

export function injectRuntime(html: string): string {
  if (!html) return html;
  if (html.includes("data-kinjani-runtime")) return html;
  const tagged = RUNTIME.replace("<script>", '<script data-kinjani-runtime="1">');
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${tagged}</body>`);
  return html + tagged;
}

// Injects a small runtime into generated HTML so it behaves correctly
// inside an iframe (especially srcdoc):
//   - smooth-scroll for #anchor links (never reload the iframe)
//   - open external links in a new tab
//   - simulate multi-page navigation via [data-route="/path"] sections
//     when the AI generates a multi-page site (links like href="/sobre")

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

  function routes(){ return document.querySelectorAll('[data-route]'); }
  function hasRoutes(){ return routes().length > 1; }
  function normalize(p){
    if(!p) return '/';
    try { p = decodeURIComponent(p); } catch(_){}
    if (p.indexOf('#') >= 0) p = p.split('#')[0];
    if (p.indexOf('?') >= 0) p = p.split('?')[0];
    if (!p) return '/';
    if (p.charAt(0) !== '/') p = '/' + p;
    if (p.length > 1 && p.charAt(p.length-1) === '/') p = p.slice(0,-1);
    return p.toLowerCase();
  }
  function showRoute(path){
    if(!hasRoutes()) return false;
    path = normalize(path);
    var found = false, first = null;
    routes().forEach(function(el){
      var r = normalize(el.getAttribute('data-route'));
      if (!first) first = el;
      if (r === path) { el.style.display = ''; found = true; }
      else { el.style.display = 'none'; }
    });
    if (!found && first) { first.style.display = ''; }
    // Highlight active nav link
    document.querySelectorAll('a[data-nav]').forEach(function(a){
      a.removeAttribute('aria-current');
      var h = normalize(a.getAttribute('href')||'');
      if (h === path) a.setAttribute('aria-current','page');
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    return true;
  }

  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if (!href) return;

    // Hash → smooth scroll
    if (href.charAt(0) === '#') {
      e.preventDefault();
      if (scrollToHash(href)) { try { history.replaceState(null,'',href); } catch(_){} }
      return;
    }

    // Internal route (multi-page mode)
    if (href.charAt(0) === '/' && hasRoutes()) {
      e.preventDefault();
      showRoute(href);
      try { history.pushState({route: href}, '', href); } catch(_){}
      return;
    }

    // External
    if (/^(https?:|mailto:|tel:|whatsapp:)/i.test(href)) {
      if (!a.target) a.target = '_blank';
      if (!a.rel) a.rel = 'noopener noreferrer';
    }
  }, true);

  window.addEventListener('popstate', function(){
    if (hasRoutes()) showRoute(location.pathname || '/');
  });

  // Initial state
  if (hasRoutes()) {
    showRoute(location.pathname || '/');
  } else if (location.hash) {
    setTimeout(function(){ scrollToHash(location.hash); }, 50);
  }
})();</script>
`;

export function injectRuntime(html: string): string {
  if (!html) return html;
  if (html.includes("data-kinjani-runtime")) return html;
  const tagged = RUNTIME.replace("<script>", '<script data-kinjani-runtime="1">');
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${tagged}</body>`);
  return html + tagged;
}

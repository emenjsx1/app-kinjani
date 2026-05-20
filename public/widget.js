(function () {
  try {
    var currentScript = document.currentScript || (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    var agentId = currentScript && (currentScript.dataset.agentId || currentScript.getAttribute('data-agent-id'));
    var position = (currentScript && currentScript.dataset.position) || 'bottom-right';
    var primaryColor = (currentScript && currentScript.dataset.primaryColor) || '#00DF81';

    if (!agentId) {
      console.warn('[Kinjani AI Widget] Missing data-agent-id attribute.');
      return;
    }

    // Derive base URL from this script's src so the iframe loads from the same host
    var baseUrl = '';
    try {
      baseUrl = new URL(currentScript.src).origin;
    } catch (e) {
      baseUrl = 'https://bloom-design-foundry.lovable.app';
    }

    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/embed/' + encodeURIComponent(agentId) +
      '?position=' + encodeURIComponent(position) +
      '&color=' + encodeURIComponent(primaryColor);
    iframe.title = 'Kinjani AI Chat';
    iframe.allow = 'clipboard-write';
    iframe.setAttribute('aria-label', 'Kinjani AI Chat Widget');

    var isRight = position.indexOf('right') !== -1;
    iframe.style.cssText = [
      'position: fixed',
      'bottom: 0',
      isRight ? 'right: 0' : 'left: 0',
      'width: 420px',
      'height: 600px',
      'max-width: 100vw',
      'max-height: 100vh',
      'border: 0',
      'background: transparent',
      'z-index: 2147483647',
      'color-scheme: normal'
    ].join(';');

    // Allow the iframe page to request size changes (open / closed)
    window.addEventListener('message', function (event) {
      if (!event.data || event.data.source !== 'kinjani-widget') return;
      if (event.data.type === 'resize') {
        iframe.style.width = event.data.open ? '420px' : '80px';
        iframe.style.height = event.data.open ? '600px' : '80px';
      }
    });

    function mount() {
      if (document.body) {
        document.body.appendChild(iframe);
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          document.body.appendChild(iframe);
        });
      }
    }
    mount();
  } catch (err) {
    console.error('[Kinjani AI Widget] Failed to initialise:', err);
  }
})();

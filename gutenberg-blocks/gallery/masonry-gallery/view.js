/* global Fancybox, Masonry, imagesLoaded */
(function(){
  function loadStyle(href){ return new Promise(function(res, rej){ var l=document.createElement('link'); l.rel='stylesheet'; l.href=href; l.onload=res; l.onerror=rej; document.head.appendChild(l); }); }
  function loadScript(src){ return new Promise(function(res, rej){ var s=document.createElement('script'); s.src=src; s.async=true; s.defer=true; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }

  var CDN = {
    fancyboxCSS: (window.FBMP_ENDPOINTS && FBMP_ENDPOINTS.fancyboxCSS) || 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox/fancybox.css',
    fancyboxJS:  (window.FBMP_ENDPOINTS && FBMP_ENDPOINTS.fancyboxJS)  || 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox/fancybox.umd.js',
    masonryJS:   (window.FBMP_ENDPOINTS && FBMP_ENDPOINTS.masonryJS)   || 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js',
    imagesJS:    (window.FBMP_ENDPOINTS && FBMP_ENDPOINTS.imagesJS)    || 'https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js'
  };

  function isRTL(el) {
    var closest = el && el.closest && el.closest('[dir]');
    if (closest && closest.getAttribute('dir')) return closest.getAttribute('dir').toLowerCase() === 'rtl';
    var htmlDir = document.documentElement.getAttribute('dir');
    return (htmlDir && htmlDir.toLowerCase() === 'rtl') || false;
  }
  function isDesktop(){ return window.matchMedia('(min-width: 1024px)').matches; }

  function resolveHref(a){
    var href = a.getAttribute('href') || '';
    var dh   = a.getAttribute('data-href') || a.dataset.href;
    if (!href || href === '#' || href.indexOf('attachment') !== -1 || href.indexOf('javascript:') === 0) {
      if (dh) return dh;
      var img = a.querySelector('img');
      if (img && img.currentSrc) return img.currentSrc;
      if (img && img.src) return img.src;
    }
    return href;
  }

  function initOne(root){
    if (!root || root.dataset.fbmpv32Inited) return;
    var grid = root.querySelector('.tg-fbmp__grid');
    if (!grid) return;

    // responsive columns
    var tablet = parseInt(root.getAttribute('data-cols-tablet') || '2', 10);
    var mobile = parseInt(root.getAttribute('data-cols-mobile') || '1', 10);
    function applyCols() {
      var w = window.innerWidth || document.documentElement.clientWidth;
      var cols = parseInt(getComputedStyle(root).getPropertyValue('--fbmp-columns') || '3', 10);
      if (w <= 480) cols = mobile;
      else if (w <= 960) cols = tablet;
      grid.style.setProperty('--fbmp-columns', cols);
    }
    applyCols(); window.addEventListener('resize', applyCols);

    var anchors = Array.from(root.querySelectorAll('.tg-fbmp__item'));
    if (!anchors.length) return;

    // Fancybox items
    var items = anchors.map(function(a){
      return { src: resolveHref(a), type: 'image', caption: a.getAttribute('data-caption') || '' };
    });

    function ensureFancyboxThenOpen(idx){
      function open(){
        console.log('Opening Fancybox at index:', idx);
        console.log('Items:', items);

        try {
          // Fancybox 5 API: use Fancybox.show with array of items
          if (window.Fancybox) {
            new window.Fancybox(items, {
              startIndex: idx || 0,
              Thumbs: {
                type: 'classic'
              },
              Toolbar: {
                display: {
                  left: [],
                  middle: [],
                  right: ['close']
                }
              },
              Carousel: {
                Navigation: true,
                rtl: isRTL(root)
              },
              on: {
                done: function(fancybox, slide) {
                  console.log('Fancybox slide loaded:', slide);
                }
              }
            });
          } else {
            console.error('Fancybox is not available!');
          }
        } catch(err) {
          console.error('Error opening Fancybox:', err);
        }
      }

      if (!window.Fancybox) {
        console.log('Loading Fancybox from CDN...');
        Promise.all([ loadStyle(CDN.fancyboxCSS), loadScript(CDN.fancyboxJS) ])
          .then(function() {
            console.log('Fancybox loaded successfully');
            open();
          })
          .catch(function(err){
            console.error('Failed to load Fancybox:', err);
          });
      } else {
        open();
      }
    }

    anchors.forEach(function(a, idx){
      a.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        ensureFancyboxThenOpen(idx);
      }, { passive:false });
    });

    // Masonry (optional) — skip if crop is enabled
    var useMasonry = root.getAttribute('data-use-masonry') === '1';
    var perfDesktopOnly = root.getAttribute('data-perf-desktop') === '1';
    var perfMinItems = parseInt(root.getAttribute('data-perf-minitems') || '0', 10);
    var cropEnabled = root.classList.contains('tg-fbmp--crop');
    var shouldInitMasonry = useMasonry && !cropEnabled && (!perfDesktopOnly || isDesktop()) && (anchors.length > perfMinItems);

    if (shouldInitMasonry) {
      grid.classList.add('is-masonry');
      var gutter = parseInt(root.getAttribute('data-msnry-gutter') || '0', 10);
      grid.style.setProperty('--fbmp-gutter', (gutter || 0) + 'px');

      function initMasonry(){
        var fitWidth = root.getAttribute('data-msnry-fit') === '1';
        var hOrder   = root.getAttribute('data-msnry-horder') === '1';
        var percent  = root.getAttribute('data-msnry-percent') !== '0';
        var transition = root.getAttribute('data-msnry-transition') || '0.2s';

        var msnry;
        function layout(){
          if (msnry) { msnry.layout(); return; }
          msnry = new Masonry(grid, {
            itemSelector: '.tg-fbmp__itemwrap',
            gutter: gutter || 0,
            fitWidth: !!fitWidth,
            horizontalOrder: !!hOrder,
            percentPosition: !!percent,
            transitionDuration: transition || '0.2s'
          });
        }

        imagesLoaded(grid, function(){ layout(); });
        window.addEventListener('resize', function(){ if (msnry) msnry.layout(); });
      }

      function ensure(){
        if (!window.Masonry || !window.imagesLoaded) {
          Promise.all([ loadScript(CDN.imagesJS), loadScript(CDN.masonryJS) ]).then(initMasonry).catch(function(){});
        } else { initMasonry(); }
      }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(ent){ if (ent[0] && ent[0].isIntersecting) { io.disconnect(); ensure(); } }, { rootMargin: '200px' });
        io.observe(grid);
      } else {
        ensure();
      }
    }

    root.dataset.fbmpv32Inited = '1';
  }

  function initAll(){
    document.querySelectorAll('.tg-fbmp').forEach(initOne);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

  var mo = new MutationObserver(function(muts){
    muts.forEach(function(m){
      (m.addedNodes||[]).forEach(function(n){
        if (!n || n.nodeType !== 1) return;
        if (n.matches && n.matches('.tg-fbmp')) initOne(n);
        else if (n.querySelectorAll) n.querySelectorAll('.tg-fbmp').forEach(initOne);
      });
    });
  });
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();
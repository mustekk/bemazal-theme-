/* global Swiper, Fancybox, TG_THUMBS_GALLERY */
/**
 * Front‑end initializer for the Swiper Thumbs Gallery block.
 *
 * This script sets up two Swiper instances (main slider and thumbnail
 * navigator), wires up autoplay, loop and pause‑on‑hover behaviour based on
 * data attributes written by the PHP render callback, and lazily loads
 * Fancybox when the user attempts to zoom. It also injects overlay
 * controls (Play/Pause and Zoom) into the main slide area and synchronises
 * their state with the Swiper instance. If Swiper or Fancybox are not
 * available on the page they are loaded from either the local vendor
 * folder or a CDN as configured by TG_THUMBS_GALLERY.
 */
(function(){
  'use strict';

  // Use configuration localised from PHP (see tg-thumbs-gallery.php). Fallback
  // to sane defaults if TG_THUMBS_GALLERY is missing.
  var CFG = (typeof window !== 'undefined' && window.TG_THUMBS_GALLERY) ? window.TG_THUMBS_GALLERY : { baseUrl:'', useLocal:true, cdn:{} };

  /**
   * Execute a function once the DOM is ready. Handles cases where the script
   * runs after DOMContentLoaded has already fired.
   * @param {Function} fn
   */
  function ready(fn){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function once(){
        document.removeEventListener('DOMContentLoaded', once);
        fn();
      });
    } else {
      fn();
    }
  }

  /**
   * Retrieve the numeric gap (in pixels) from CSS custom properties on the
   * block. If unavailable or invalid, fall back to 8px.
   * @param {Element} root
   * @returns {number}
   */
  function getGap(root){
    var g = root.style.getPropertyValue('--tg-gap');
    if(!g){
      var cs = getComputedStyle(root);
      g = cs.getPropertyValue('--tg-gap');
    }
    var n = parseInt(g, 10);
    return isNaN(n) ? 8 : n;
  }

  /**
   * Ensure Fancybox is present on the page. If Fancybox is already loaded
   * (window.Fancybox.show exists) then callback is invoked immediately.
   * Otherwise the CSS and JS are appended to the document head and the
   * callback is invoked once the JS has loaded.
   * @param {Function} cb
   */
  function ensureFancybox(cb){
    if(window.Fancybox && typeof window.Fancybox.show === 'function'){
      cb(window.Fancybox);
      return;
    }
    var cssHref = CFG.useLocal && CFG.baseUrl ? CFG.baseUrl + '/fancybox/fancybox.css' : (CFG.cdn && CFG.cdn.fancyboxCss) || 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox.css';
    var jsSrc  = CFG.useLocal && CFG.baseUrl ? CFG.baseUrl + '/fancybox/fancybox.umd.js' : (CFG.cdn && CFG.cdn.fancyboxJs) || 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox.umd.js';
    var head = document.head || document.getElementsByTagName('head')[0];
    // Append CSS once
    if(!document.querySelector('link[data-tg-fancybox]')){
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = cssHref;
      l.setAttribute('data-tg-fancybox','1');
      head.appendChild(l);
    }
    // Append JS once and hook the onload
    var existing = document.querySelector('script[data-tg-fancybox]');
    if(existing){
      existing.addEventListener('load', function(){ cb(window.Fancybox); });
    } else {
      var s = document.createElement('script');
      s.src = jsSrc;
      s.async = true;
      s.setAttribute('data-tg-fancybox','1');
      s.onload = function(){ cb(window.Fancybox); };
      head.appendChild(s);
    }
  }

  /**
   * Build overlay controls and attach them to the main slide wrapper. The
   * controls consist of a Play/Pause button and a Zoom button. The Play
   * button toggles Swiper's autoplay; the Zoom button opens Fancybox.
   * @param {Element} root The gallery root
   * @param {Swiper} swiper The main Swiper instance
   */
  function addOverlay(root, swiper){
    var wrap = root.querySelector('.tg-thumbs-gallery__main');
    if(!wrap || !swiper) return;
    // Avoid adding the overlay twice
    if(wrap.querySelector('.tg-thumbs-gallery__controls')) return;
    var controls = document.createElement('div');
    controls.className = 'tg-thumbs-gallery__controls';
    controls.innerHTML =
      '<button type="button" class="tg-ctrl tg-ctrl--autoplay" aria-label="Toggle autoplay">\
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
          <rect x="6" y="4" width="4" height="16"></rect>\
          <rect x="14" y="4" width="4" height="16"></rect>\
        </svg>\
      </button>\
      <button type="button" class="tg-ctrl tg-ctrl--zoom" aria-label="Zoom">\
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
          <circle cx="11" cy="11" r="8"></circle>\
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>\
          <line x1="11" y1="8" x2="11" y2="14"></line>\
          <line x1="8" y1="11" x2="14" y2="11"></line>\
        </svg>\
      </button>';
    wrap.appendChild(controls);
    var btnAuto = controls.querySelector('.tg-ctrl--autoplay');
    var btnZoom = controls.querySelector('.tg-ctrl--zoom');
    // Update the autoplay button icon based on the current state
    function updateIcon(){
      if(swiper && swiper.autoplay && swiper.autoplay.running){
        // Pause icon (bars)
        btnAuto.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
          <rect x="6" y="4" width="4" height="16"></rect>\
          <rect x="14" y="4" width="4" height="16"></rect>\
        </svg>';
      } else {
        // Play icon (triangle)
        btnAuto.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
          <polygon points="5 3 19 12 5 21 5 3"></polygon>\
        </svg>';
      }
    }
    // Toggle autoplay when clicked
    btnAuto.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if(swiper.autoplay){
        if(swiper.autoplay.running){ swiper.autoplay.stop(); } else { swiper.autoplay.start(); }
        updateIcon();
      }
    });
    // Open Fancybox at the current slide when clicked
    btnZoom.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var idx = swiper.activeIndex || 0;
      openFancybox(root, idx);
    });
    // Initial icon state
    updateIcon();
  }

  /**
   * Open Fancybox with all gallery items, starting at a given index.
   * @param {Element} root The gallery root
   * @param {number} startIndex The slide index to open
   */
  function openFancybox(root, startIndex){
    var links = root.querySelectorAll('.tg-thumbs-gallery__link');
    var items = [];
    links.forEach(function(a){
      var img = a.querySelector('img');
      var caption = a.getAttribute('data-caption') || (img ? img.getAttribute('alt') : '') || '';
      items.push({ src: a.getAttribute('href') || '', type:'image', caption: caption });
    });
    ensureFancybox(function(Fancybox){
      Fancybox.show(items, { startIndex: startIndex || 0 });
    });
  }

  /**
   * Initialise a single gallery instance. Reads attributes for autoplay,
   * loop and pause behaviour from the root element and constructs two
   * Swiper instances (main and thumbnails). Also attaches overlay
   * controls and click handlers for Fancybox.
   * @param {Element} root
   */
  function initOne(root){
    if(!root || root.__swiperInited) return;
    var main = root.querySelector('.tg-thumbs-gallery__main .swiper');
    var thumbs = root.querySelector('.tg-thumbs-gallery__thumbs .swiper');
    if(!main || !thumbs) return;
    var gap = getGap(root);
    // Read behaviour flags from data attributes. If autoplay is disabled we
    // still initialise autoplay on the Swiper (so the API is available) but
    // immediately stop it after initialisation. This allows the overlay
    // controls to toggle autoplay on/off regardless of the initial state.
    var autoplay    = root.getAttribute('data-autoplay') !== '0';
    var delay       = parseInt(root.getAttribute('data-autoplay-delay') || '3000', 10) || 3000;
    var loop        = root.getAttribute('data-loop') !== '0';
    var pauseHover  = root.getAttribute('data-pause-hover') !== '0';
    // Initialise thumbs swiper (horizontal). We use slidesPerView:auto to fit as many thumbnails as possible.
    var thSwiper = new Swiper(thumbs, {
      // Always treat as LTR regardless of site direction
      rtlTranslate: false,
      direction: 'horizontal',
      slidesPerView: 'auto',
      freeMode: true,
      watchSlidesProgress: true,
      spaceBetween: gap,
    });
    // Initialise main swiper
    var mainSwiper = new Swiper(main, {
      // Always treat as LTR regardless of site direction
      rtlTranslate: false,
      slidesPerView: 1,
      initialSlide: 0,
      // Remove inter-slide gap on the main slider; thumbnails have their own gap
      spaceBetween: 0,
      loop: loop,
      // Always configure autoplay on the instance; it can be stopped immediately
      autoplay: { delay: delay, disableOnInteraction: false },
      thumbs: { swiper: thSwiper },
      navigation: {
        nextEl: root.querySelector('.tg-thumbs-gallery__btn--next'),
        prevEl: root.querySelector('.tg-thumbs-gallery__btn--prev'),
      },
      on: {
        init: function(){
          // Stop/play autoplay on hover only when autoplay is enabled via attribute
          if(autoplay && pauseHover && this.autoplay){
            var el = root.querySelector('.tg-thumbs-gallery__main');
            if(el){
              el.addEventListener('mouseenter', function(){ if(mainSwiper.autoplay) mainSwiper.autoplay.stop(); });
              el.addEventListener('mouseleave', function(){ if(mainSwiper.autoplay) mainSwiper.autoplay.start(); });
            }
          }
        },
      },
    });

    // Inject overlay controls (Play/Pause and Zoom)

    // If autoplay was disabled via data-attribute, stop it now. We set
    // autoplay on the instance above so that the API exists; calling stop()
    // here prevents unintended animation and keeps the overlay play button
    // functional.
    if(!autoplay && mainSwiper.autoplay){
      mainSwiper.autoplay.stop();
    }
    // Add overlay controls
    addOverlay(root, mainSwiper);
    // Bind click on main slides to Fancybox
    var links = root.querySelectorAll('.tg-thumbs-gallery__link');
    links.forEach(function(a, idx){
      a.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        openFancybox(root, idx);
      });
    });
    root.__swiperInited = true;
  }

  /**
   * Lazy‑initialise all galleries on the page. Uses IntersectionObserver when
   * available to avoid initialising sliders that are off‑screen. Falls back to
   * immediate initialisation if observers are not supported.
   */
  function initAll(){
    var nodes = document.querySelectorAll('.tg-thumbs-gallery');
    nodes.forEach(function(root){
      if(root.__swiperObserved) return;
      root.__swiperObserved = true;
      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              initOne(entry.target);
              io.unobserve(entry.target);
            }
          });
        }, { rootMargin:'100px' });
        io.observe(root);
      } else {
        initOne(root);
      }
    });
  }

  // Entry point: ensure Swiper is present, then initialise galleries
  ready(function(){
    function start(){ initAll(); }
    if(window.Swiper){ start(); return; }
    // If Swiper isn't loaded yet, dynamically load it from local or CDN
    var cssHref = CFG.useLocal && CFG.baseUrl ? CFG.baseUrl + '/swiper/swiper-bundle.min.css' : (CFG.cdn && CFG.cdn.swiperCss) || 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css';
    var jsSrc  = CFG.useLocal && CFG.baseUrl ? CFG.baseUrl + '/swiper/swiper-bundle.min.js' : (CFG.cdn && CFG.cdn.swiperJs) || 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js';
    var head = document.head || document.getElementsByTagName('head')[0];
    if(!document.querySelector('link[data-tg-swiper]')){
      var ln = document.createElement('link');
      ln.rel='stylesheet';
      ln.href=cssHref;
      ln.setAttribute('data-tg-swiper','1');
      head.appendChild(ln);
    }
    if(!document.querySelector('script[data-tg-swiper]')){
      var sc = document.createElement('script');
      sc.src = jsSrc;
      sc.async = true;
      sc.setAttribute('data-tg-swiper','1');
      sc.onload = start;
      head.appendChild(sc);
    } else {
      // Already in loading; attach onload
      document.querySelector('script[data-tg-swiper]').addEventListener('load', start);
    }
  });
})();
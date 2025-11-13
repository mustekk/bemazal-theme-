
/* global Swiper */
(function(){
  'use strict';
  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function num(v, def){ v = (typeof v==='number') ? v : parseFloat(v||0); return isFinite(v) ? v : def; }

  ready(function(){
    $all('.scb-swiper-carousel').forEach(function(root){
      var confAttr = root.getAttribute('data-config');
      var conf = {};
      try{ conf = confAttr ? JSON.parse(confAttr) : {}; }catch(e){ conf = {}; }

      var swiperEl = root.querySelector('.swiper');
      if (!swiperEl || !window.Swiper) return;

      var bp = {
        0   : { slidesPerView: num(conf.slidesMobile, 1) },
        640 : { slidesPerView: num(conf.slidesTablet, 2) },
        1024: { slidesPerView: num(conf.slidesDesktop, 3) }
      };

      var opt = {
        speed: num(conf.speed, 500),
        loop: !!conf.loop,
        centeredSlides: !!conf.centered,
        spaceBetween: num(conf.spaceBetween, 0),
        slidesPerView: num(conf.slidesMobile, 1),
        breakpoints: bp
      };
      if (conf.pagination){
        opt.pagination = { el: root.querySelector('.swiper-pagination'), clickable: true };
      }
      if (conf.navigation){
        opt.navigation = {
          nextEl: root.querySelector('.swiper-button-next'),
          prevEl: root.querySelector('.swiper-button-prev')
        };
      }
      if (conf.autoplay){
        opt.autoplay = { delay: num(conf.autoplayDelay, 3000), disableOnInteraction: false };
      }

      var instance = new Swiper(swiperEl, opt);

      /*
       * Only attach hover handlers when autoplay is explicitly enabled for this slider.
       * Without this guard, moving the mouse over the slider could trigger Swiper's
       * autoplay subsystem even when the block's settings have autoplay disabled.
       */
      if (conf.autoplay){
        // Capture the autoplay API once to avoid repeatedly resolving it inside the handlers.
        var autoplay = instance.autoplay;
        if (autoplay && typeof autoplay.stop === 'function' && typeof autoplay.start === 'function'){
          root.addEventListener('mouseenter', function(){ autoplay.stop(); });
          root.addEventListener('mouseleave', function(){ autoplay.start(); });
        }
      }
    });
  });
})();

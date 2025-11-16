/**
 * Image Hero Block - Frontend Script
 *
 * Handles:
 * - Swiper initialization for multiple slides
 * - Responsive image source switching (desktop/mobile)
 * - Smooth transitions between slides
 */

( function() {
  'use strict';

  /**
   * Detect if device is mobile
   * @returns {boolean}
   */
  function isMobileDevice() {
    return window.innerWidth <= 768;
  }

  /**
   * Switch image source based on device type
   * @param {HTMLImageElement} img - Image element
   */
  function setImageSource( img ) {
    if ( ! img ) return;

    const isMobile = isMobileDevice();
    const desktopImage = img.getAttribute( 'data-desktop-image' );
    const mobileImage = img.getAttribute( 'data-mobile-image' );

    // Determine which image to use
    const imageSource = ( isMobile && mobileImage ) ? mobileImage : desktopImage;

    // Set src attribute
    if ( imageSource && img.src !== imageSource ) {
      img.src = imageSource;
    }
  }

  /**
   * Initialize image for a slide
   * @param {HTMLElement} slide - Slide element
   */
  function initSlideImage( slide ) {
    const img = slide.querySelector( '.image-hero-image' );
    if ( ! img ) return;

    // Set initial source
    setImageSource( img );
  }

  /**
   * Initialize all image hero blocks
   */
  function initImageHeroBlocks() {
    // Check if Swiper is available
    if ( typeof window.Swiper === 'undefined' ) {
      console.warn( 'Image Hero: Swiper library not loaded yet' );
      return;
    }

    const blocks = document.querySelectorAll( '.image-hero-block' );

    blocks.forEach( function( block ) {
      const config = block.getAttribute( 'data-config' );
      if ( ! config ) return;

      let settings;
      try {
        settings = JSON.parse( config );
      } catch ( e ) {
        console.error( 'Image Hero: Invalid config', e );
        return;
      }

      const swiperContainer = block.querySelector( '.image-hero-swiper' );
      const singleContainer = block.querySelector( '.image-hero-single' );

      // If single image (no swiper)
      if ( singleContainer ) {
        const slide = singleContainer.querySelector( '.image-hero-slide' );
        if ( slide ) {
          initSlideImage( slide );
        }
        return;
      }

      // If multiple slides with swiper
      if ( swiperContainer ) {
        // Initialize all images first
        const slides = swiperContainer.querySelectorAll( '.swiper-slide' );
        slides.forEach( initSlideImage );

        // Initialize Swiper
        const swiperConfig = {
          modules: [ window.Swiper.Navigation, window.Swiper.Pagination, window.Swiper.Autoplay ],
          loop: settings.loop !== false,
          speed: settings.speed || 1000,
          autoplay: settings.autoplay ? {
            delay: settings.autoplayDelay || 5000,
            disableOnInteraction: false
          } : false,
          pagination: settings.pagination ? {
            el: block.querySelector( '.swiper-pagination' ),
            clickable: true
          } : false,
          navigation: settings.navigation ? {
            nextEl: block.querySelector( '.swiper-button-next' ),
            prevEl: block.querySelector( '.swiper-button-prev' )
          } : false
        };

        new window.Swiper( swiperContainer, swiperConfig );
      }
    } );
  }

  /**
   * Handle window resize - switch image sources if needed
   */
  let resizeTimeout;
  function handleResize() {
    clearTimeout( resizeTimeout );
    resizeTimeout = setTimeout( function() {
      const images = document.querySelectorAll( '.image-hero-image' );
      images.forEach( function( img ) {
        setImageSource( img );
      } );
    }, 300 );
  }

  /**
   * Initialize scroll down buttons
   */
  function initScrollButtons() {
    const scrollButtons = document.querySelectorAll( '.image-hero-scroll-button' );

    scrollButtons.forEach( function( button ) {
      button.addEventListener( 'click', function() {
        const block = button.closest( '.image-hero-block' );
        if ( ! block ) return;

        // Calculate scroll target (next section after the image hero)
        const blockRect = block.getBoundingClientRect();
        const scrollTarget = window.scrollY + blockRect.bottom;

        // Smooth scroll to target
        window.scrollTo( {
          top: scrollTarget,
          behavior: 'smooth'
        } );
      } );
    } );
  }

  /**
   * Initialize with retry mechanism for Swiper
   */
  function initWithRetry( attempt = 0 ) {
    console.log( 'Image Hero: Initialization attempt', attempt + 1, 'Swiper available:', !! window.Swiper );

    if ( typeof window.Swiper !== 'undefined' ) {
      // Swiper is loaded, initialize everything
      initImageHeroBlocks();
      initScrollButtons();
    } else if ( attempt < 10 ) {
      // Retry after a short delay (max 10 attempts = 1 second)
      console.log( 'Image Hero: Swiper not ready, retrying...' );
      setTimeout( function() {
        initWithRetry( attempt + 1 );
      }, 100 );
    } else {
      console.error( 'Image Hero: Swiper failed to load after 10 attempts' );
    }
  }

  // Initialize on DOM ready
  if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', initWithRetry );
  } else {
    initWithRetry();
  }

  // Handle resize events
  window.addEventListener( 'resize', handleResize );

} )();

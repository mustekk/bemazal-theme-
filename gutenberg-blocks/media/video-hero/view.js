/**
 * Video Hero Block - Frontend Script
 *
 * Handles:
 * - Swiper initialization for multiple slides
 * - Responsive video source switching (desktop/mobile)
 * - Video autoplay and loop control
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
   * Switch poster image based on device type
   * @param {HTMLVideoElement} video - Video element
   */
  function setPosterSource( video ) {
    if ( ! video ) return;

    const isMobile = isMobileDevice();
    const desktopPoster = video.getAttribute( 'data-desktop-poster' );
    const mobilePoster = video.getAttribute( 'data-mobile-poster' );

    // Determine which poster to use
    const posterSource = ( isMobile && mobilePoster ) ? mobilePoster : desktopPoster;

    // Set poster attribute
    if ( posterSource ) {
      video.setAttribute( 'poster', posterSource );
    }
  }

  /**
   * Attempt to play video with retry mechanism
   * @param {HTMLVideoElement} video - Video element
   * @param {number} attempt - Current attempt number
   */
  function attemptPlay( video, attempt = 0 ) {
    if ( ! video || attempt > 5 ) return;

    const playPromise = video.play();
    if ( playPromise !== undefined ) {
      playPromise.then( function() {
        console.log( 'Video Hero: Video playing successfully' );
      } ).catch( function( error ) {
        console.log( 'Video Hero: Autoplay prevented (attempt ' + ( attempt + 1 ) + ')', error.message );
        // Retry after a short delay
        if ( attempt < 5 ) {
          setTimeout( function() {
            attemptPlay( video, attempt + 1 );
          }, 500 );
        }
      } );
    }
  }

  /**
   * Switch video source based on device type
   * @param {HTMLVideoElement} video - Video element
   */
  function setVideoSource( video ) {
    if ( ! video ) return;

    const isMobile = isMobileDevice();
    const desktopMp4 = video.getAttribute( 'data-desktop-mp4' );
    const desktopWebm = video.getAttribute( 'data-desktop-webm' );
    const mobileMp4 = video.getAttribute( 'data-mobile-mp4' );
    const mobileWebm = video.getAttribute( 'data-mobile-webm' );

    // Determine which sources to use
    const mp4Source = ( isMobile && mobileMp4 ) ? mobileMp4 : desktopMp4;
    const webmSource = ( isMobile && mobileWebm ) ? mobileWebm : desktopWebm;

    console.log( 'Video Hero: Setting video source - Mobile:', isMobile, 'MP4:', mp4Source, 'WebM:', webmSource );

    // Clear existing sources
    video.innerHTML = '';

    // Add WebM source first (better compression)
    if ( webmSource ) {
      const sourceWebm = document.createElement( 'source' );
      sourceWebm.src = webmSource;
      sourceWebm.type = 'video/webm';
      video.appendChild( sourceWebm );
    }

    // Add MP4 source as fallback
    if ( mp4Source ) {
      const sourceMp4 = document.createElement( 'source' );
      sourceMp4.src = mp4Source;
      sourceMp4.type = 'video/mp4';
      video.appendChild( sourceMp4 );
    }

    // Set poster image
    setPosterSource( video );

    // Reload video with new sources
    video.load();

    // Wait for video to be ready before attempting to play
    video.addEventListener( 'loadeddata', function onLoadedData() {
      console.log( 'Video Hero: Video loaded, attempting to play...' );
      video.removeEventListener( 'loadeddata', onLoadedData );
      attemptPlay( video );
    }, { once: true } );

    // Also try to play immediately (in case video is already cached)
    if ( video.readyState >= 3 ) {
      console.log( 'Video Hero: Video already cached, playing immediately' );
      attemptPlay( video );
    }
  }

  /**
   * Initialize video for a slide
   * @param {HTMLElement} slide - Slide element
   */
  function initSlideVideo( slide ) {
    const video = slide.querySelector( '.video-hero-video' );
    if ( ! video ) return;

    // Set initial source
    setVideoSource( video );

    // Handle video errors gracefully
    video.addEventListener( 'error', function() {
      console.warn( 'Video Hero: Video failed to load' );
    } );
  }

  /**
   * Initialize all video hero blocks
   */
  function initVideoHeroBlocks() {
    // Check if Swiper is available
    if ( typeof window.Swiper === 'undefined' ) {
      console.warn( 'Video Hero: Swiper library not loaded yet' );
      return;
    }

    const blocks = document.querySelectorAll( '.video-hero-block' );

    blocks.forEach( function( block ) {
      const config = block.getAttribute( 'data-config' );
      if ( ! config ) return;

      let settings;
      try {
        settings = JSON.parse( config );
      } catch ( e ) {
        console.error( 'Video Hero: Invalid config', e );
        return;
      }

      const swiperContainer = block.querySelector( '.video-hero-swiper' );
      const singleContainer = block.querySelector( '.video-hero-single' );

      // If single video (no swiper)
      if ( singleContainer ) {
        const slide = singleContainer.querySelector( '.video-hero-slide' );
        if ( slide ) {
          initSlideVideo( slide );
        }
        return;
      }

      // If multiple slides with swiper
      if ( swiperContainer ) {
        // Initialize all videos first
        const slides = swiperContainer.querySelectorAll( '.swiper-slide' );
        slides.forEach( initSlideVideo );

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
          } : false,
          on: {
            slideChange: function() {
              // Pause videos on inactive slides
              const allVideos = swiperContainer.querySelectorAll( '.video-hero-video' );
              allVideos.forEach( function( video ) {
                video.pause();
              } );

              // Play video on active slide
              const activeSlide = this.slides[ this.activeIndex ];
              if ( activeSlide ) {
                const activeVideo = activeSlide.querySelector( '.video-hero-video' );
                if ( activeVideo ) {
                  activeVideo.play().catch( function() {
                    // Autoplay prevented
                  } );
                }
              }
            },
            init: function() {
              // Play video on first slide
              const activeSlide = this.slides[ this.activeIndex ];
              if ( activeSlide ) {
                const activeVideo = activeSlide.querySelector( '.video-hero-video' );
                if ( activeVideo ) {
                  activeVideo.play().catch( function() {
                    // Autoplay prevented
                  } );
                }
              }
            }
          }
        };

        new window.Swiper( swiperContainer, swiperConfig );
      }
    } );
  }

  /**
   * Handle window resize - switch video and poster sources if needed
   */
  let resizeTimeout;
  function handleResize() {
    clearTimeout( resizeTimeout );
    resizeTimeout = setTimeout( function() {
      const videos = document.querySelectorAll( '.video-hero-video' );
      videos.forEach( function( video ) {
        setPosterSource( video );
        setVideoSource( video );
      } );
    }, 300 );
  }

  /**
   * Initialize sound control buttons
   */
  function initSoundButtons() {
    const blocks = document.querySelectorAll( '.video-hero-block' );
    console.log( 'Video Hero: Found blocks:', blocks.length );

    blocks.forEach( function( block ) {
      const soundButton = block.querySelector( '.video-hero-sound-button' );
      console.log( 'Video Hero: Sound button found:', !! soundButton );

      if ( ! soundButton ) return;

      const videos = block.querySelectorAll( '.video-hero-video' );
      const iframes = block.querySelectorAll( '.video-hero-iframe' );

      console.log( 'Video Hero: Videos:', videos.length, 'Iframes:', iframes.length );

      // Set initial button state based on video muted state
      // Videos start muted by default, so add 'muted' class initially
      if ( videos.length > 0 && videos[0].muted ) {
        soundButton.classList.add( 'muted' );
        console.log( 'Video Hero: Initial state - muted' );
      }

      soundButton.addEventListener( 'click', function( e ) {
        console.log( 'Video Hero: Sound button clicked!' );
        e.preventDefault();
        e.stopPropagation();

        const isMuted = soundButton.classList.contains( 'muted' );
        console.log( 'Video Hero: Current muted state:', isMuted );

        // Toggle videos mute state
        videos.forEach( function( video ) {
          if ( isMuted ) {
            // Unmute video
            video.muted = false;
            console.log( 'Video Hero: Video unmuted' );
          } else {
            // Mute video
            video.muted = true;
            console.log( 'Video Hero: Video muted' );
          }
        } );

        // For iframes (YouTube/Vimeo) - reload with new mute parameter
        iframes.forEach( function( iframe ) {
          const src = iframe.src;
          if ( src.includes( 'youtube.com' ) ) {
            // Update YouTube iframe URL to toggle mute
            if ( isMuted ) {
              // Unmute
              iframe.src = src.replace( 'mute=1', 'mute=0' );
            } else {
              // Mute
              iframe.src = src.replace( 'mute=0', 'mute=1' );
            }
          } else if ( src.includes( 'vimeo.com' ) ) {
            // Update Vimeo iframe URL to toggle mute
            if ( isMuted ) {
              // Unmute
              iframe.src = src.replace( 'muted=1', 'muted=0' );
            } else {
              // Mute
              iframe.src = src.replace( 'muted=0', 'muted=1' );
            }
          }
        } );

        // Toggle button state
        soundButton.classList.toggle( 'muted' );
      } );
    } );
  }

  /**
   * Initialize scroll down buttons
   */
  function initScrollButtons() {
    const scrollButtons = document.querySelectorAll( '.video-hero-scroll-button' );

    scrollButtons.forEach( function( button ) {
      button.addEventListener( 'click', function() {
        const block = button.closest( '.video-hero-block' );
        if ( ! block ) return;

        // Calculate scroll target (next section after the video hero)
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
    console.log( 'Video Hero: Initialization attempt', attempt + 1, 'Swiper available:', !! window.Swiper );

    if ( typeof window.Swiper !== 'undefined' ) {
      // Swiper is loaded, initialize everything
      initVideoHeroBlocks();
      initSoundButtons();
      initScrollButtons();
    } else if ( attempt < 10 ) {
      // Retry after a short delay (max 10 attempts = 1 second)
      console.log( 'Video Hero: Swiper not ready, retrying...' );
      setTimeout( function() {
        initWithRetry( attempt + 1 );
      }, 100 );
    } else {
      console.error( 'Video Hero: Swiper failed to load after 10 attempts' );
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

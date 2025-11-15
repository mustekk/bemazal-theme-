/**
 * Libraries Index
 *
 * Central export point for all shared libraries.
 * This file can be imported in main.js or used as a separate entry point.
 */

// Export all libraries
export * from './swiper.js';
export * from './fancybox.js';
export * from './masonry.js';

// Initialize libraries on demand
export function initSwiper(element, options = {}) {
  const { Swiper, Navigation, Pagination, Autoplay, Thumbs } =
    await import('./swiper.js');

  return new Swiper(element, {
    modules: [Navigation, Pagination, Autoplay, Thumbs],
    ...options
  });
}

export async function initFancybox(selector = '[data-fancybox]', options = {}) {
  const { Fancybox } = await import('./fancybox.js');
  return Fancybox.bind(selector, options);
}

export async function initMasonry(element, options = {}) {
  const { Masonry, imagesLoaded } = await import('./masonry.js');

  return new Promise((resolve) => {
    imagesLoaded(element, () => {
      const instance = new Masonry(element, options);
      resolve(instance);
    });
  });
}

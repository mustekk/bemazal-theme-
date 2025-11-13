/**
 * Main entry point for Bemazal theme assets.
 *
 * This file imports the core SCSS, as well as third‑party libraries including Swiper for sliders,
 * Fancybox for lightboxes and Masonry for grid layouts.  These libraries are only initialised if
 * their target elements are present in the DOM, thereby preventing unnecessary JavaScript from
 * executing on pages where it is unused.
 */

// Import SCSS (compiled to CSS by Vite)
import '../scss/main.scss';

// Import Swiper and required modules
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Fancybox (ES module)
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

// Import Masonry
import Masonry from 'masonry-layout';

// Wait until DOM is loaded before initialising libraries
document.addEventListener('DOMContentLoaded', () => {
    // Initialise Swiper on elements with the class .swiper
    const swiperEls = document.querySelectorAll('.swiper');
    swiperEls.forEach((el) => {
        // Each slider can have its own options; provide some sensible defaults
        new Swiper(el, {
            modules: [Navigation, Pagination],
            loop: true,
            navigation: {
                nextEl: el.querySelector('.swiper-button-next'),
                prevEl: el.querySelector('.swiper-button-prev'),
            },
            pagination: {
                el: el.querySelector('.swiper-pagination'),
                clickable: true,
            },
        });
    });

    // Initialise Fancybox on any element with data-fancybox attribute
    Fancybox.bind('[data-fancybox]', {
        Thumbs: false,
        Toolbar: true,
    });

    // Initialise Masonry on elements with the .masonry-grid class
    const masonryEls = document.querySelectorAll('.masonry-grid');
    masonryEls.forEach((grid) => {
        new Masonry(grid, {
            itemSelector: '.masonry-item',
            columnWidth: '.masonry-sizer',
            percentPosition: true,
        });
    });
});
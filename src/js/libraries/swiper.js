/**
 * Centralized Swiper loader
 *
 * This file provides a single entry point for Swiper library across all blocks.
 * Exports Swiper core and commonly used modules.
 */

import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, Thumbs, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';

// Export for use in blocks
export { Swiper, Navigation, Pagination, Autoplay, Thumbs, EffectFade };

// Make globally available if needed
if (typeof window !== 'undefined') {
  window.Swiper = Swiper;
  window.Swiper.Navigation = Navigation;
  window.Swiper.Pagination = Pagination;
  window.Swiper.Autoplay = Autoplay;
  window.Swiper.Thumbs = Thumbs;
  window.Swiper.EffectFade = EffectFade;
  console.log('Swiper loaded globally:', !!window.Swiper);
}

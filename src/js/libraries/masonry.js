/**
 * Centralized Masonry loader
 *
 * This file provides a single entry point for Masonry and ImagesLoaded libraries.
 */

import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

// Export for use in blocks
export { Masonry, imagesLoaded };

// Make globally available if needed
if (typeof window !== 'undefined') {
  window.Masonry = Masonry;
  window.imagesLoaded = imagesLoaded;
}

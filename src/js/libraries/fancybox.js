/**
 * Centralized Fancybox loader
 *
 * This file provides a single entry point for Fancybox library across all blocks.
 */

import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

// Export for use in blocks
export { Fancybox };

// Make globally available if needed
if (typeof window !== 'undefined') {
  window.Fancybox = Fancybox;
}

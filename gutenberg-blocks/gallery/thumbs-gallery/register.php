<?php
/**
 * Swiper Thumbs Gallery Block - Assets Loader
 *
 * This block uses centralized Swiper and Fancybox libraries loaded via Vite.
 * Libraries are automatically enqueued by the centralized libraries-loader.php
 * based on block presence.
 *
 * Note: Block registration is handled by blocks-loader.php
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue block-specific view script and styles
 *
 * The centralized libraries (Swiper, Fancybox) are loaded automatically by
 * bemazal_auto_enqueue_block_libraries() in libraries-loader.php
 */
add_action( 'wp_enqueue_scripts', function () {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present on the page
    if ( ! has_block( 'tg/thumbs-gallery' ) ) {
        return;
    }

    $block_dir = get_stylesheet_directory() . '/gutenberg-blocks/gallery/thumbs-gallery';
    $block_url = get_stylesheet_directory_uri() . '/gutenberg-blocks/gallery/thumbs-gallery';

    // Enqueue block-specific styles
    // Block styles now bundled in main.css - HMR support enabled
    //     bemazal_enqueue_block_style( 'tg/thumbs-gallery', 'gallery/thumbs-gallery', 'tg-thumbs-gallery-style' );

    // Enqueue block-specific initialization script
    // Dependencies: centralized Swiper and Fancybox (loaded automatically)
    $view_js = $block_dir . '/view.js';
    if ( file_exists( $view_js ) ) {
        wp_enqueue_script(
            'tg-thumbs-gallery-view',
            $block_url . '/view.js',
            [ 'bemazal-swiper', 'bemazal-fancybox' ], // Depend on centralized libraries
            filemtime( $view_js ),
            true
        );
    }
}, 25 ); // Priority 25 - after libraries are enqueued at priority 20

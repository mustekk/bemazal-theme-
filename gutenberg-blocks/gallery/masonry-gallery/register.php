<?php
/**
 * Fancybox Masonry Gallery - Assets Loader
 *
 * This block uses centralized Fancybox and Masonry libraries loaded via Vite.
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
 * The centralized libraries (Fancybox, Masonry, ImagesLoaded) are loaded automatically by
 * bemazal_auto_enqueue_block_libraries() in libraries-loader.php
 */
add_action( 'wp_enqueue_scripts', function () {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present on the page
    if ( ! has_block( 'tg/fbmp-gallery' ) ) {
        return;
    }

    $block_dir = get_stylesheet_directory() . '/gutenberg-blocks/gallery/masonry-gallery';
    $block_url = get_stylesheet_directory_uri() . '/gutenberg-blocks/gallery/masonry-gallery';

    // Enqueue block-specific styles
    bemazal_enqueue_block_style( 'tg/fbmp-gallery', 'gallery/masonry-gallery', 'tg-fbmp-gallery-style' );

    // Enqueue block-specific initialization script
    // Dependencies: centralized Fancybox and Masonry (loaded automatically)
    $view_js = $block_dir . '/view.js';
    if ( file_exists( $view_js ) ) {
        wp_enqueue_script(
            'fbmpv32-view',
            $block_url . '/view.js',
            [ 'bemazal-fancybox', 'bemazal-masonry' ], // Depend on centralized libraries
            filemtime( $view_js ),
            true
        );

        // Add defer strategy if available
        if ( function_exists( 'wp_script_add_data' ) ) {
            wp_script_add_data( 'fbmpv32-view', 'strategy', 'defer' );
        }
    }
}, 25 ); // Priority 25 - after libraries are enqueued at priority 20

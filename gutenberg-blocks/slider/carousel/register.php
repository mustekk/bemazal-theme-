<?php
/**
 * SCB Swiper Carousel Block - Assets Loader
 *
 * This block uses centralized Swiper library loaded via Vite.
 * Library is automatically enqueued by the centralized libraries-loader.php
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
 * The centralized Swiper library is loaded automatically by
 * bemazal_auto_enqueue_block_libraries() in libraries-loader.php
 */
add_action( 'wp_enqueue_scripts', function () {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present on the page
    if ( ! has_block( 'scb/swiper-carousel' ) ) {
        return;
    }

    $block_dir = get_stylesheet_directory() . '/gutenberg-blocks/slider/carousel';
    $block_url = get_stylesheet_directory_uri() . '/gutenberg-blocks/slider/carousel';

    // Enqueue block-specific styles
    // Block styles now bundled in main.css - HMR support enabled
    //     bemazal_enqueue_block_style( 'scb/swiper-carousel', 'slider/carousel', 'scb-swiper-carousel-style' );

    // Enqueue block-specific initialization script
    // Dependencies: centralized Swiper (loaded automatically)
    $view_js = $block_dir . '/view.js';
    if ( file_exists( $view_js ) ) {
        wp_enqueue_script(
            'scb-swiper-carousel-view',
            $block_url . '/view.js',
            [ 'bemazal-swiper' ], // Depend on centralized Swiper
            filemtime( $view_js ),
            true
        );
    }
}, 25 ); // Priority 25 - after libraries are enqueued at priority 20

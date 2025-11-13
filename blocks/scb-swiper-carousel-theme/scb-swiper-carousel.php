<?php
/**
 * SCB Swiper Carousel Block (Theme version)
 *
 * Registers the Gutenberg block bundled with the theme and enqueues
 * all necessary assets. Uses local Swiper files if present in
 * `block/vendor/swiper`. Otherwise falls back to CDN unless
 * SCB_FORCE_LOCAL_ASSETS is defined as true in wp-config.php.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'init', function () {
    $dir = get_stylesheet_directory() . '/blocks/scb-swiper-carousel-theme/block';
    if ( file_exists( $dir . '/block.json' ) ) {
        register_block_type( $dir );
    }
} );

/**
 * Check if local Swiper assets exist.
 */
function scb_theme_has_local_swiper() {
    $base = get_stylesheet_directory() . '/blocks/scb-swiper-carousel-theme/block/vendor/swiper';
    $need = [ $base . '/swiper-bundle.min.css', $base . '/swiper-bundle.min.js' ];
    foreach ( $need as $file ) {
        if ( ! file_exists( $file ) ) return false;
    }
    return true;
}

/**
 * Enqueue Swiper (local or CDN) and the view initializer only when the block is rendered.
 */
add_action( 'enqueue_block_assets', function () {
    $has_block = is_admin() ? true : has_block( 'scb/swiper-carousel' );
    if ( ! $has_block ) return;

    $block_dir = get_stylesheet_directory() . '/blocks/scb-swiper-carousel-theme/block';
    $block_url = get_stylesheet_directory_uri() . '/blocks/scb-swiper-carousel-theme/block';

    $use_local = false;
    if ( defined('SCB_FORCE_LOCAL_ASSETS') && SCB_FORCE_LOCAL_ASSETS ) {
        $use_local = true;
    } elseif ( scb_theme_has_local_swiper() ) {
        $use_local = true;
    }

    if ( $use_local ) {
        $css = $block_dir . '/vendor/swiper/swiper-bundle.min.css';
        $js  = $block_dir . '/vendor/swiper/swiper-bundle.min.js';
        wp_enqueue_style( 'scb-swiper', $block_url . '/vendor/swiper/swiper-bundle.min.css', [], filemtime( $css ) );
        wp_enqueue_script( 'scb-swiper', $block_url . '/vendor/swiper/swiper-bundle.min.js', [], filemtime( $js ), true );
    } else {
        // CDN fallback for Swiper@11
        wp_enqueue_style( 'scb-swiper', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', [], '11.1.1' );
        wp_enqueue_script( 'scb-swiper', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', [], '11.1.1', true );
    }

    // Front-end initializer
    $view_js = $block_dir . '/view.js';
    wp_enqueue_script( 'scb-swiper-carousel-view', $block_url . '/view.js', [ 'scb-swiper' ], filemtime( $view_js ), true );
} );

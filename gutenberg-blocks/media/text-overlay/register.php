<?php
/**
 * Text Overlay Block - Assets Loader
 *
 * Block styles are bundled in main.css for HMR support.
 * This file handles view script loading for responsive image switching.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_enqueue_scripts', function () {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present on the page
    if ( ! has_block( 'bemazal/text-overlay' ) ) {
        return;
    }

    $block_dir = get_stylesheet_directory() . '/gutenberg-blocks/media/text-overlay';
    $block_url = get_stylesheet_directory_uri() . '/gutenberg-blocks/media/text-overlay';

    // Enqueue view script for responsive image handling
    $view_js = $block_dir . '/view.js';
    if ( file_exists( $view_js ) ) {
        wp_enqueue_script(
            'text-overlay-view',
            $block_url . '/view.js',
            [], // No dependencies
            filemtime( $view_js ),
            true
        );
    }
}, 25 );

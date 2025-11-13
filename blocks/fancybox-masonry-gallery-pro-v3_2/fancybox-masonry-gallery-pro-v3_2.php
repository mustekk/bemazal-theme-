<?php
/**
 * Fancybox Masonry Gallery (Pro) — v3.2
 * Path in theme: /blocks/fancybox-masonry-gallery-pro-v3_2/
 */
if ( ! defined('ABSPATH') ) { exit; }

add_action('init', function () {
    $dir = get_stylesheet_directory() . '/blocks/fancybox-masonry-gallery-pro-v3_2/block';
    register_block_type( $dir );
});

function fbmpv32_local_endpoints() {
    $base_dir = get_stylesheet_directory() . '/blocks/fancybox-masonry-gallery-pro-v3_2/block/vendor';
    $base_url = get_stylesheet_directory_uri() . '/blocks/fancybox-masonry-gallery-pro-v3_2/block/vendor';
    $out = array();
    if ( file_exists( $base_dir . '/fancybox/fancybox.css' ) ) $out['fancyboxCSS'] = $base_url . '/fancybox/fancybox.css';
    if ( file_exists( $base_dir . '/fancybox/fancybox.umd.js' ) ) $out['fancyboxJS']  = $base_url . '/fancybox/fancybox.umd.js';
    if ( file_exists( $base_dir . '/masonry/masonry.pkgd.min.js' ) ) $out['masonryJS']   = $base_url . '/masonry/masonry.pkgd.min.js';
    if ( file_exists( $base_dir . '/imagesloaded/imagesloaded.pkgd.min.js' ) ) $out['imagesJS']    = $base_url . '/imagesloaded/imagesloaded.pkgd.min.js';
    return $out;
}

add_action('wp_enqueue_scripts', function () {
    if ( is_admin() ) return;
    if ( ! has_block('tg/fbmp-gallery') ) return;

    $base_dir = get_stylesheet_directory() . '/blocks/fancybox-masonry-gallery-pro-v3_2/block';
    $base_url = get_stylesheet_directory_uri() . '/blocks/fancybox-masonry-gallery-pro-v3_2/block';

    wp_enqueue_script('fbmpv32-view',  $base_url . '/view.js',  [], filemtime( $base_dir . '/view.js' ), true );
    if ( function_exists('wp_script_add_data') ) {
        wp_script_add_data('fbmpv32-view', 'strategy', 'defer');
    }

    $endpoints = fbmpv32_local_endpoints();
    if ( ! empty($endpoints) ) {
        wp_add_inline_script('fbmpv32-view', 'window.FBMP_ENDPOINTS = ' . wp_json_encode($endpoints) . ';', 'before');
    }
});

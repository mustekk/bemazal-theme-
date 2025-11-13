<?php
/**
 * Swiper Thumbs Gallery Block (Theme version)
 *
 * This file registers a Gutenberg block bundled with the current theme and
 * enqueues all necessary assets. It supports both CDN and local loading of
 * Swiper and Fancybox libraries. If local files are present in
 * `block/vendor/swiper` and `block/vendor/fancybox`, those will be used. Otherwise
 * the block falls back to CDN. You can force local assets by defining
 * TG_FORCE_LOCAL_ASSETS in wp-config.php.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register the block using the block.json metadata. The metadata defines
 * the block name, attributes and editor script/style handles. Because the
 * block is bundled with the theme, we use the stylesheet directory to
 * locate the block folder.
 */
add_action( 'init', function () {
    $dir = get_stylesheet_directory() . '/blocks/swiper-thumbs-gallery-theme/block';
    if ( file_exists( $dir . '/block.json' ) ) {
        register_block_type( $dir );
    }
} );

/**
 * Determine if local versions of Swiper and Fancybox assets are available.
 *
 * @return bool True if all local files exist, false otherwise.
 */
function tg_theme_has_local_assets() {
    $base = get_stylesheet_directory() . '/blocks/swiper-thumbs-gallery-theme/block/vendor';
    $need = [
        $base . '/swiper/swiper-bundle.min.css',
        $base . '/swiper/swiper-bundle.min.js',
        $base . '/fancybox/fancybox.css',
        $base . '/fancybox/fancybox.umd.js',
    ];
    foreach ( $need as $file ) {
        if ( ! file_exists( $file ) ) {
            return false;
        }
    }
    return true;
}

/**
 * Enqueue Swiper, Fancybox and the front‑end view script only when the block
 * actually appears on the page. Local assets are used when available unless
 * the constant TG_FORCE_LOCAL_ASSETS is defined in wp-config.php. Otherwise
 * the CDN is used by default.
 */
/**
 * Enqueue front‑end assets (Swiper, Fancybox and our view script).
 *
 * This runs only on the front end and only if the current page contains
 * the thumbs gallery block. By isolating our assets to the front we avoid
 * interfering with the Block Editor and the media modal. Assets are
 * automatically enqueued from local files when available, or fall back
 * to the CDN otherwise. You can force the use of local assets by
 * defining TG_FORCE_LOCAL_ASSETS in wp‑config.php.
 */
add_action( 'wp_enqueue_scripts', function () {
    // Do not enqueue anything in the admin
    if ( is_admin() ) {
        return;
    }

    // Determine if the page contains our block. When viewing a singular post,
    // check the post content; on archives and other pages, fallback to
    // has_block() which inspects the current global $post.
    $should_enqueue = false;
    if ( is_singular() ) {
        $post = get_post();
        if ( $post ) {
            $should_enqueue = has_block( 'tg/thumbs-gallery', $post );
        }
    } else {
        $should_enqueue = has_block( 'tg/thumbs-gallery' );
    }

    // If the block is not present, no need to enqueue our front‑end assets
    if ( ! $should_enqueue ) {
        return;
    }

    $block_dir = get_stylesheet_directory() . '/blocks/swiper-thumbs-gallery-theme/block';
    $block_url = get_stylesheet_directory_uri() . '/blocks/swiper-thumbs-gallery-theme/block';

    // Determine whether to use local assets. If the constant is set, respect it.
    $use_local = false;
    if ( defined( 'TG_FORCE_LOCAL_ASSETS' ) && TG_FORCE_LOCAL_ASSETS ) {
        $use_local = true;
    } elseif ( tg_theme_has_local_assets() ) {
        $use_local = true;
    }

    if ( $use_local ) {
        // Enqueue local Swiper assets
        $sw_css = $block_dir . '/vendor/swiper/swiper-bundle.min.css';
        $sw_js  = $block_dir . '/vendor/swiper/swiper-bundle.min.js';
        wp_enqueue_style( 'tg-swiper', $block_url . '/vendor/swiper/swiper-bundle.min.css', [], filemtime( $sw_css ) );
        wp_enqueue_script( 'tg-swiper', $block_url . '/vendor/swiper/swiper-bundle.min.js', [], filemtime( $sw_js ), true );

        // Enqueue local Fancybox assets
        $fb_css = $block_dir . '/vendor/fancybox/fancybox.css';
        $fb_js  = $block_dir . '/vendor/fancybox/fancybox.umd.js';
        wp_enqueue_style( 'tg-fancybox', $block_url . '/vendor/fancybox/fancybox.css', [], filemtime( $fb_css ) );
        wp_enqueue_script( 'tg-fancybox', $block_url . '/vendor/fancybox/fancybox.umd.js', [], filemtime( $fb_js ), true );
    } else {
        // Fall back to the CDN versions (Swiper 12+, Fancybox 5)
        wp_enqueue_style( 'tg-swiper', 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css', [], '12.0.3' );
        wp_enqueue_script( 'tg-swiper', 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js', [], '12.0.3', true );
        wp_enqueue_style( 'tg-fancybox', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox.css', [], '5.0.0' );
        wp_enqueue_script( 'tg-fancybox', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox.umd.js', [], '5.0.0', true );
    }

    // Localize settings for Fancybox fallback path and base URL so the view
    // script can lazily load assets if necessary
    $config = [
        'baseUrl'  => $use_local ? $block_url . '/vendor' : '',
        'useLocal' => $use_local,
        'cdn'      => [
            'swiperCss'    => 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css',
            'swiperJs'     => 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js',
            'fancyboxCss'  => 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox.css',
            'fancyboxJs'   => 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5/dist/fancybox.umd.js',
        ],
    ];
    // Localize onto our view script so it's available when view.js runs. The
    // script will be enqueued below.
    wp_localize_script( 'tg-thumbs-gallery-view', 'TG_THUMBS_GALLERY', $config );

    // Enqueue the view script; depend on Swiper and Fancybox handles
    $view_js = $block_dir . '/view.js';
    wp_enqueue_script( 'tg-thumbs-gallery-view', $block_url . '/view.js', [ 'tg-swiper', 'tg-fancybox' ], filemtime( $view_js ), true );
} );
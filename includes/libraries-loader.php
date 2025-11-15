<?php
/**
 * Centralized Libraries Loader
 *
 * This file provides a centralized system for loading Swiper, Fancybox, and Masonry
 * libraries across all Gutenberg blocks. Libraries are loaded from Vite-compiled bundles
 * for optimal performance, caching, and minimal file size.
 *
 * Benefits:
 * - Single version of each library across the entire theme
 * - Automatic dependency management
 * - Conditional loading (only when blocks are present)
 * - Optimized with Vite (tree-shaking, minification, code-splitting)
 *
 * @package Bemazal
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Get library asset from manifest
 *
 * @param string $library_name Library entry name (e.g., 'libraries-swiper')
 * @return array|false Array with 'js' and 'css' keys, or false if not found
 */
function bemazal_get_library_asset( $library_name ) {
    static $manifest = null;

    // Load manifest once
    if ( $manifest === null ) {
        $manifest_path = get_template_directory() . '/dist/.vite/manifest.json';
        if ( file_exists( $manifest_path ) ) {
            $manifest = json_decode( file_get_contents( $manifest_path ), true );
        } else {
            $manifest = [];
        }
    }

    $entry_key = "src/js/libraries/{$library_name}.js";
    if ( ! isset( $manifest[ $entry_key ] ) ) {
        return false;
    }

    $entry = $manifest[ $entry_key ];
    $theme_uri = get_template_directory_uri();

    $result = [
        'js' => isset( $entry['file'] ) ? $theme_uri . '/dist/' . $entry['file'] : false,
        'css' => [],
    ];

    // Collect CSS files from entry and imports recursively
    $css_files = [];
    $collected_imports = [];

    // Function to recursively collect CSS from imports
    $collect_css = function( $chunk_key ) use ( &$manifest, &$css_files, &$collected_imports, &$collect_css ) {
        // Avoid infinite loops
        if ( in_array( $chunk_key, $collected_imports, true ) ) {
            return;
        }
        $collected_imports[] = $chunk_key;

        if ( ! isset( $manifest[ $chunk_key ] ) ) {
            return;
        }

        $chunk = $manifest[ $chunk_key ];

        // Collect CSS from this chunk
        if ( isset( $chunk['css'] ) && is_array( $chunk['css'] ) ) {
            foreach ( $chunk['css'] as $css ) {
                if ( ! in_array( $css, $css_files, true ) ) {
                    $css_files[] = $css;
                }
            }
        }

        // Recursively collect from imports
        if ( isset( $chunk['imports'] ) && is_array( $chunk['imports'] ) ) {
            foreach ( $chunk['imports'] as $import ) {
                $collect_css( $import );
            }
        }
    };

    // Start collecting from entry
    $collect_css( $entry_key );

    // Convert to full URLs
    foreach ( $css_files as $css_file ) {
        $result['css'][] = $theme_uri . '/dist/' . $css_file;
    }

    return $result;
}

/**
 * Enqueue Swiper library
 *
 * Loads the centralized Swiper bundle with all necessary modules.
 * Should be called from blocks that need Swiper functionality.
 *
 * @param bool $force Force enqueue even if already registered
 * @return bool True if enqueued successfully
 */
function bemazal_enqueue_swiper( $force = false ) {
    // Check if already enqueued
    if ( ! $force && wp_script_is( 'bemazal-swiper', 'enqueued' ) ) {
        return true;
    }

    if ( bemazal_is_dev() ) {
        // Development: load from Vite server
        $vite_server = bemazal_get_vite_server();
        wp_enqueue_script(
            'bemazal-swiper',
            $vite_server . '/src/js/libraries/swiper.js',
            [],
            null,
            true
        );
        return true;
    }

    // Production: load from manifest
    $asset = bemazal_get_library_asset( 'swiper' );
    if ( ! $asset || ! $asset['js'] ) {
        return false;
    }

    // Enqueue CSS
    if ( ! empty( $asset['css'] ) ) {
        foreach ( $asset['css'] as $index => $css_url ) {
            wp_enqueue_style(
                'bemazal-swiper-' . $index,
                $css_url,
                [],
                BEMAZAL_VERSION
            );
        }
    }

    // Enqueue JS
    wp_enqueue_script(
        'bemazal-swiper',
        $asset['js'],
        [],
        BEMAZAL_VERSION,
        true
    );

    return true;
}

/**
 * Enqueue Fancybox library
 *
 * Loads the centralized Fancybox bundle.
 * Should be called from blocks that need Fancybox functionality.
 *
 * @param bool $force Force enqueue even if already registered
 * @return bool True if enqueued successfully
 */
function bemazal_enqueue_fancybox( $force = false ) {
    // Check if already enqueued
    if ( ! $force && wp_script_is( 'bemazal-fancybox', 'enqueued' ) ) {
        return true;
    }

    if ( bemazal_is_dev() ) {
        // Development: load from Vite server
        $vite_server = bemazal_get_vite_server();
        wp_enqueue_script(
            'bemazal-fancybox',
            $vite_server . '/src/js/libraries/fancybox.js',
            [],
            null,
            true
        );
        return true;
    }

    // Production: load from manifest
    $asset = bemazal_get_library_asset( 'fancybox' );
    if ( ! $asset || ! $asset['js'] ) {
        return false;
    }

    // Enqueue CSS
    if ( ! empty( $asset['css'] ) ) {
        foreach ( $asset['css'] as $index => $css_url ) {
            wp_enqueue_style(
                'bemazal-fancybox-' . $index,
                $css_url,
                [],
                BEMAZAL_VERSION
            );
        }
    }

    // Enqueue JS
    wp_enqueue_script(
        'bemazal-fancybox',
        $asset['js'],
        [],
        BEMAZAL_VERSION,
        true
    );

    return true;
}

/**
 * Enqueue Masonry library
 *
 * Loads the centralized Masonry bundle (includes imagesLoaded).
 * Should be called from blocks that need Masonry functionality.
 *
 * @param bool $force Force enqueue even if already registered
 * @return bool True if enqueued successfully
 */
function bemazal_enqueue_masonry( $force = false ) {
    // Check if already enqueued
    if ( ! $force && wp_script_is( 'bemazal-masonry', 'enqueued' ) ) {
        return true;
    }

    if ( bemazal_is_dev() ) {
        // Development: load from Vite server
        $vite_server = bemazal_get_vite_server();
        wp_enqueue_script(
            'bemazal-masonry',
            $vite_server . '/src/js/libraries/masonry.js',
            [],
            null,
            true
        );
        return true;
    }

    // Production: load from manifest
    $asset = bemazal_get_library_asset( 'masonry' );
    if ( ! $asset || ! $asset['js'] ) {
        return false;
    }

    // Enqueue CSS (if any)
    if ( ! empty( $asset['css'] ) ) {
        foreach ( $asset['css'] as $index => $css_url ) {
            wp_enqueue_style(
                'bemazal-masonry-' . $index,
                $css_url,
                [],
                BEMAZAL_VERSION
            );
        }
    }

    // Enqueue JS
    wp_enqueue_script(
        'bemazal-masonry',
        $asset['js'],
        [],
        BEMAZAL_VERSION,
        true
    );

    return true;
}

/**
 * Get block style asset from manifest
 *
 * @param string $block_slug Block slug (e.g., 'thumbs-gallery', 'carousel')
 * @return string|false CSS URL or false if not found
 */
function bemazal_get_block_style_asset( $block_slug ) {
    static $manifest = null;

    // Load manifest once
    if ( $manifest === null ) {
        $manifest_path = get_template_directory() . '/dist/.vite/manifest.json';
        if ( file_exists( $manifest_path ) ) {
            $manifest = json_decode( file_get_contents( $manifest_path ), true );
        } else {
            $manifest = [];
        }
    }

    $entry_key = "src/scss/blocks/{$block_slug}.scss";
    if ( ! isset( $manifest[ $entry_key ] ) ) {
        return false;
    }

    $entry = $manifest[ $entry_key ];
    $theme_uri = get_template_directory_uri();

    // Return CSS file URL
    if ( isset( $entry['file'] ) ) {
        return $theme_uri . '/dist/' . $entry['file'];
    }

    return false;
}

/**
 * Enqueue block style conditionally
 *
 * @param string $block_name Block name (e.g., 'tg/thumbs-gallery')
 * @param string $block_slug Style slug (e.g., 'gallery/thumbs-gallery')
 * @param string $handle CSS handle
 */
function bemazal_enqueue_block_style( $block_name, $block_slug, $handle ) {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present
    if ( ! has_block( $block_name ) ) {
        return;
    }

    if ( bemazal_is_dev() ) {
        // Development: Load SCSS directly from Vite dev server
        $vite_server = bemazal_get_vite_server();
        $scss_path = "src/scss/blocks/{$block_slug}.scss";

        // Vite can compile SCSS on the fly in dev mode
        wp_enqueue_style(
            $handle,
            "{$vite_server}/{$scss_path}",
            [],
            null // No version - Vite handles HMR
        );
        return;
    }

    // Production: load from manifest
    $css_url = bemazal_get_block_style_asset( $block_slug );
    if ( $css_url ) {
        wp_enqueue_style( $handle, $css_url, [], BEMAZAL_VERSION );
    }
}

/**
 * Auto-detect and enqueue required libraries AND styles based on blocks on the page
 *
 * This function scans the post content for specific blocks and automatically
 * enqueues the required libraries and styles. Runs on wp_enqueue_scripts.
 */
function bemazal_auto_enqueue_block_libraries() {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Get current post
    $post = get_post();
    if ( ! $post ) {
        return;
    }

    $content = $post->post_content;

    // Map blocks to required libraries
    $block_library_map = [
        // Swiper blocks
        'tg/thumbs-gallery' => [ 'swiper', 'fancybox' ],
        'scb/swiper-carousel' => [ 'swiper' ],
        'bemazal/video-hero' => [ 'swiper' ],

        // Fancybox + Masonry blocks
        'tg/fbmp-gallery' => [ 'fancybox', 'masonry' ],
    ];

    // Check which libraries are needed
    $needed_libraries = [];
    foreach ( $block_library_map as $block_name => $libraries ) {
        if ( has_block( $block_name, $post ) ) {
            $needed_libraries = array_merge( $needed_libraries, $libraries );
        }
    }

    // Remove duplicates
    $needed_libraries = array_unique( $needed_libraries );

    // Enqueue needed libraries
    foreach ( $needed_libraries as $library ) {
        switch ( $library ) {
            case 'swiper':
                bemazal_enqueue_swiper();
                break;
            case 'fancybox':
                bemazal_enqueue_fancybox();
                break;
            case 'masonry':
                bemazal_enqueue_masonry();
                break;
        }
    }
}
add_action( 'wp_enqueue_scripts', 'bemazal_auto_enqueue_block_libraries', 20 );

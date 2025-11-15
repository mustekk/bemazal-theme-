<?php
/**
 * Blocks Auto-Loader
 *
 * Automatically registers all Gutenberg blocks from the gutenberg-blocks directory.
 * Each block should be in a category folder (gallery, slider, content, etc.)
 * and contain a block.json file for metadata.
 *
 * @package Bemazal
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Automatically register all blocks in the gutenberg-blocks directory
 *
 * This function scans the gutenberg-blocks directory for block.json files and
 * automatically registers them. It also includes register.php files
 * if they exist for custom enqueue logic.
 */
function bemazal_register_blocks() {
    $blocks_dir = get_stylesheet_directory() . '/gutenberg-blocks';

    // Get all category directories (gallery, slider, content, etc.)
    $categories = glob( $blocks_dir . '/*', GLOB_ONLYDIR );

    if ( empty( $categories ) ) {
        return;
    }

    foreach ( $categories as $category ) {
        // Get all block directories within this category
        $blocks = glob( $category . '/*', GLOB_ONLYDIR );

        if ( empty( $blocks ) ) {
            continue;
        }

        foreach ( $blocks as $block_path ) {
            $block_json = $block_path . '/block.json';
            $register_php = $block_path . '/register.php';

            // If block.json exists, register the block
            if ( file_exists( $block_json ) ) {
                // Include register.php for custom logic (enqueue, render callback, etc.)
                if ( file_exists( $register_php ) ) {
                    include_once $register_php;
                }

                // Get block name from block.json for render callback filter
                $block_data = json_decode( file_get_contents( $block_json ), true );
                $block_name = isset( $block_data['name'] ) ? $block_data['name'] : '';

                // Check if block has a custom render callback
                $render_callback = apply_filters( 'bemazal_block_render_callback_' . $block_name, null );

                // Register the block
                if ( $render_callback && function_exists( $render_callback ) ) {
                    register_block_type( $block_path, array(
                        'render_callback' => $render_callback,
                    ) );
                } else {
                    register_block_type( $block_path );
                }
            }
        }
    }
}

// Register blocks on init
add_action( 'init', 'bemazal_register_blocks', 5 );

/**
 * Register custom block category for Bemazal blocks
 */
function bemazal_block_categories( $categories ) {
    return array_merge(
        [
            [
                'slug'  => 'bemazal',
                'title' => __( 'Bemazal', 'bemazal' ),
                'icon'  => 'admin-customizer',
            ],
        ],
        $categories
    );
}
add_filter( 'block_categories_all', 'bemazal_block_categories' );

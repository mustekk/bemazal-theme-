<?php
/**
 * Timeline Block - Assets Loader
 *
 * Block styles are bundled in main.css for HMR support.
 * This file is intentionally minimal as Timeline block is purely presentational
 * and doesn't require any front-end JavaScript.
 *
 * @package Bemazal
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Timeline block is static and doesn't require view scripts.
// All styles are loaded via main.css through Vite.

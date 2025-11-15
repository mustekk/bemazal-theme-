<?php
/**
 * Header template
 *
 * Displays the <head> section and opening of the <body>.  This template calls wp_head() to ensure
 * WordPress and plugins can hook into the page head.  The HTML structure uses Bootstrap classes for
 * easy styling.  Modify as needed.
 *
 * @package Bemazal
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <!-- FOUC Prevention: Hide dropdowns and mobile menu until JS initializes -->
    <style id="fouc-prevention">
        /* Hide mobile menu wrapper completely */
        .mobile-menu-wrapper { display: none !important; }
        /* Hide mobile dropdown menus */
        .mobile-menu-nav .dropdown-menu { display: none !important; }
        /* Hide desktop dropdown menus */
        .desktop-nav .dropdown-menu { display: none !important; }
    </style>
</head>

<body <?php body_class(); ?>>
    <header class="site-header">
        <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div class="container">
                <a class="navbar-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
                    <?php bloginfo( 'name' ); ?>
                </a>

                <!-- Hamburger Button for Mobile (mmenu style) -->
                <button class="mobile-menu-toggle d-lg-none" type="button" aria-label="<?php esc_attr_e( 'Toggle mobile menu', 'bemazal' ); ?>" aria-expanded="false">
                    <span class="hamburger-box">
                        <span class="hamburger-inner"></span>
                    </span>
                </button>

                <!-- Desktop Navigation -->
                <div class="desktop-nav d-none d-lg-flex ms-auto">
                    <?php
                    if ( has_nav_menu( 'primary' ) ) {
                        wp_nav_menu( [
                            'theme_location'  => 'primary',
                            'container'       => false,
                            'menu_class'      => 'navbar-nav',
                            'fallback_cb'     => false,
                            'depth'           => 3,
                            'walker'          => new WP_Bootstrap_5_3_Navwalker(),
                        ] );
                    }
                    ?>
                </div>
            </div>
        </nav>

        <!-- Mobile Off-Canvas Menu (mmenu style) -->
        <div class="mobile-menu-wrapper d-lg-none">
            <div class="mobile-menu-overlay"></div>
            <div class="mobile-menu-panel">
                <div class="mobile-menu-header">
                    <a class="mobile-menu-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
                        <?php bloginfo( 'name' ); ?>
                    </a>
                    <button class="mobile-menu-close" type="button" aria-label="<?php esc_attr_e( 'Close menu', 'bemazal' ); ?>">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <nav class="mobile-menu-nav">
                    <?php
                    if ( has_nav_menu( 'primary' ) ) {
                        wp_nav_menu( [
                            'theme_location'  => 'primary',
                            'container'       => false,
                            'menu_class'      => 'mobile-menu-list',
                            'fallback_cb'     => false,
                            'depth'           => 3,
                            'walker'          => new WP_Bootstrap_5_3_Navwalker(),
                        ] );
                    }
                    ?>
                </nav>
            </div>
        </div>
    </header>

















































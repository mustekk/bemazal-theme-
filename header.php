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
</head>
<body <?php body_class(); ?>>
    <header class="site-header py-3 border-bottom mb-4">
        <div class="container d-flex justify-content-between align-items-center">
            <h1 class="site-title m-0"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
            <?php
            if ( has_nav_menu( 'primary' ) ) {
                wp_nav_menu( [
                    'theme_location' => 'primary',
                    'container'      => 'nav',
                    'container_class'=> 'primary-nav',
                    'menu_class'     => 'menu d-flex list-unstyled gap-3 m-0',
                    'fallback_cb'    => false,
                ] );
            }
            ?>
        </div>
    </header>

















































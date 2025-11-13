<?php
/**
 * Main template file
 *
 * This file is the default fallback used by WordPress to display a page when no other template matches.
 * It pulls in the header and footer and outputs the content inside a simple container.  Feel free to
 * customise the markup as required.
 *
 * @package Bemazal
 */

get_header();
?>

<main class="site-main container py-5">
    <?php
    if ( have_posts() ) {
        while ( have_posts() ) {
            the_post();
            echo '<article '; post_class( 'mb-4' ); echo '>';
            echo '<h2 class="entry-title">' . get_the_title() . '</h2>';
            echo '<div class="entry-content">';
            the_content();
            echo '</div>';
            echo '</article>';
        }
    } else {
        echo '<p>' . __( 'No posts found.', 'bemazal' ) . '</p>';
    }
    ?>
</main>
















<?php get_footer();
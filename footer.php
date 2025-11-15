<?php
/**
 * Footer template
 *
 * Outputs the closing of the <body> and includes wp_footer() which is essential for enqueuing
 * scripts via WordPress.  A simple footer element with site information is provided.  Modify as
 * desired.
 *
 * @package Bemazal
 */
?>
    <footer class="site-footer py-4 border-top mt-4">
        <div class="container text-center">
            <p class="mb-0">&copy; <?php echo date( 'Y' ); ?> <?php bloginfo( 'name' ); ?>. <?php _e( 'All rights reserved.', 'bemazal' ); ?></p>
        </div>
    </footer>
    <?php wp_footer(); ?>
</body>
</html>





















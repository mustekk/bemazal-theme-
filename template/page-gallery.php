<?php
/*
Template Name: Gallery Page Template
*/
get_header();
?>

<main id="primary" class="site-main container  py-5  mb-5">

    <?php
    // Если есть контент страницы — выводим
    if ( have_posts() ) :
        while ( have_posts() ) : the_post(); ?>

            <article id="post-<?php the_ID(); ?>" <?php post_class('custom-page'); ?>>

                <div class="page-content">
                    <?php the_content(); ?>
                </div>
            </article>

        <?php endwhile;
    else :
        echo '<p>Контент не найден.</p>';
    endif;
    ?>
</main>




<?php get_footer(); ?>

<?php
/**
 * Block: Bemazal – Image + Card
 * Path: /gutenberg-blocks/content/image-card
 *
 * Note: Block registration is handled by blocks-loader.php
 * This file only provides the render callback for server-side rendering.
 */

// Custom render callback is hooked via filter in blocks-loader.php
add_filter( 'bemazal_block_render_callback_bemazal/image-card', function() {
    return 'bemazal_image_card_render_block';
} );

/**
 * Enqueue block-specific styles
 */
add_action( 'wp_enqueue_scripts', function () {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present on the page
    if ( ! has_block( 'bemazal/image-card' ) ) {
        return;
    }

    // Enqueue block-specific styles
    bemazal_enqueue_block_style( 'bemazal/image-card', 'content/image-card', 'bemazal-image-card-style' );
}, 25 ); // Priority 25 - after libraries are enqueued at priority 20

/**
 * Серверный рендер: собираем правильный URL/alt/srcset по ID и выбранному размеру.
 */
function bemazal_image_card_render_block( $attributes, $content = '' ) {
    $media_id   = isset( $attributes['mediaID'] ) ? intval( $attributes['mediaID'] ) : 0;
    $media_alt  = isset( $attributes['mediaAlt'] ) ? sanitize_text_field( $attributes['mediaAlt'] ) : '';
    $media_size = ! empty( $attributes['mediaSize'] ) ? sanitize_key( $attributes['mediaSize'] ) : 'full';
    $img_width  = isset( $attributes['imgWidth'] )  ? trim( (string) $attributes['imgWidth'] )  : '';
    $img_height = isset( $attributes['imgHeight'] ) ? trim( (string) $attributes['imgHeight'] ) : '';
    $ratio      = isset( $attributes['aspectRatio'] ) ? sanitize_text_field( $attributes['aspectRatio'] ) : 'original';

    $title        = isset( $attributes['title'] )        ? wp_kses_post( $attributes['title'] )        : '';
    $text         = isset( $attributes['text'] )         ? wp_kses_post( $attributes['text'] )         : '';
    $btn_text     = isset( $attributes['buttonText'] )   ? sanitize_text_field( $attributes['buttonText'] )   : '';
    $btn_url      = isset( $attributes['buttonUrl'] )    ? esc_url_raw( $attributes['buttonUrl'] )    : '';
    $btn_target   = isset( $attributes['buttonTarget'] ) ? (bool) $attributes['buttonTarget']         : false;
    $text_align   = isset( $attributes['textAlign'] )    ? sanitize_text_field( $attributes['textAlign'] )    : 'right';
    $card_overlap = isset( $attributes['cardOverlap'] )  ? intval( $attributes['cardOverlap'] )       : 80;

    $src = $srcset = $sizes_attr = '';

    if ( $media_id ) {
        $image = wp_get_attachment_image_src( $media_id, $media_size );
        if ( $image ) {
            $src = $image[0];
        }
        $srcset     = wp_get_attachment_image_srcset( $media_id, $media_size );
        $sizes_attr = wp_get_attachment_image_sizes( $media_id, $media_size );
        if ( ! $media_alt ) {
            $stored_alt = get_post_meta( $media_id, '_wp_attachment_image_alt', true );
            $media_alt  = $stored_alt ? $stored_alt : get_the_title( $media_id );
        }
    } else {
        // Fallback: если зачем-то нет ID, используем сохранённый URL
        $src = isset( $attributes['mediaURL'] ) ? esc_url( $attributes['mediaURL'] ) : '';
    }

    // width/height + inline-style
    $img_attrs   = '';
    $inline      = array();
    if ( $img_width !== '' ) {
        $w = intval( $img_width ); $img_attrs .= ' width="' . $w . '"';
        $inline[] = 'width:' . $w . 'px';
    }
    if ( $img_height !== '' ) {
        $h = intval( $img_height ); $img_attrs .= ' height="' . $h . '"';
        $inline[] = 'height:' . $h . 'px';
    }
    $img_style = $inline ? ' style="' . esc_attr( implode( ';', $inline ) ) . '"' : '';

    // aspect-ratio зададим на контейнер .resp-img
    $wrap_style = '';
    if ( $ratio && $ratio !== 'original' ) {
        $clean_ratio = preg_replace( '#[^0-9/:]#', '', $ratio );
        $wrap_style  = ' style="aspect-ratio:' . esc_attr( str_replace(':','/', $clean_ratio) ) . ';"';
    }

    // Формируем inline-стили для блока
    $card_content_style = 'text-align:' . esc_attr( $text_align ) . ';';
    if ( $text_align === 'right' ) {
        $card_content_style .= 'direction:rtl;';
    } elseif ( $text_align === 'left' ) {
        $card_content_style .= 'direction:ltr;';
    }

    // Стиль для наложения карточки (margin-top)
    $card_wrapper_style = 'margin-top:-' . intval( $card_overlap ) . 'px;';

    ob_start();
    ?>
    <div class="bemazal-image-card">
        <div class="image-wrapper">
            <div class="image-container"<?php echo $wrap_style; ?>>
                <?php if ( $src ) : ?>
                    <img src="<?php echo esc_url( $src ); ?>"
                         <?php echo $srcset ? 'srcset="' . esc_attr( $srcset ) . '"' : ''; ?>
                         <?php echo $sizes_attr ? 'sizes="' . esc_attr( $sizes_attr ) . '"' : ''; ?>
                         alt="<?php echo esc_attr( $media_alt ); ?>"<?php echo $img_attrs . $img_style; ?> />
                <?php endif; ?>
            </div>
        </div>
        <div class="card-wrapper" style="<?php echo esc_attr( $card_wrapper_style ); ?>">
            <div class="card-content" style="<?php echo esc_attr( $card_content_style ); ?>">
                <?php if ( $title ) : ?>
                    <h3 class="card-title"><?php echo $title; ?></h3>
                <?php endif; ?>
                <?php if ( $text ) : ?>
                    <p class="card-text"><?php echo $text; ?></p>
                <?php endif; ?>
                <?php if ( $btn_text && $btn_url ) : ?>
                    <a class="card-button"
                       href="<?php echo esc_url( $btn_url ); ?>"
                       <?php echo $btn_target ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
                        <?php echo esc_html( $btn_text ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

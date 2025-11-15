<?php
/**
 * Block: Bemazal – 1v1 (Image + Card)
 * Path: /gutenberg-blocks/content/image-card
 *
 * Note: Block registration is handled by blocks-loader.php
 * This file only provides the render callback for server-side rendering.
 */

// Custom render callback is hooked via filter in blocks-loader.php
add_filter( 'bemazal_block_render_callback_bemazal/one-v-one', function() {
    return 'bemazal_1v1_render_block';
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
    if ( ! has_block( 'bemazal/one-v-one' ) ) {
        return;
    }

    // Enqueue block-specific styles
    bemazal_enqueue_block_style( 'bemazal/one-v-one', 'content/image-card', 'bemazal-image-card-style' );
}, 25 ); // Priority 25 - after libraries are enqueued at priority 20

/**
 * Серверный рендер: собираем правильный URL/alt/srcset по ID и выбранному размеру.
 */
function bemazal_1v1_render_block( $attributes, $content = '' ) {
    $media_id   = isset( $attributes['mediaID'] ) ? intval( $attributes['mediaID'] ) : 0;
    $media_alt  = isset( $attributes['mediaAlt'] ) ? sanitize_text_field( $attributes['mediaAlt'] ) : '';
    $media_size = ! empty( $attributes['mediaSize'] ) ? sanitize_key( $attributes['mediaSize'] ) : 'full';
    $img_width  = isset( $attributes['imgWidth'] )  ? trim( (string) $attributes['imgWidth'] )  : '';
    $img_height = isset( $attributes['imgHeight'] ) ? trim( (string) $attributes['imgHeight'] ) : '';
    $ratio      = isset( $attributes['aspectRatio'] ) ? sanitize_text_field( $attributes['aspectRatio'] ) : 'original';

    $title      = isset( $attributes['title'] )      ? wp_kses_post( $attributes['title'] )      : '';
    $text       = isset( $attributes['text'] )       ? wp_kses_post( $attributes['text'] )       : '';
    $btn_text   = isset( $attributes['buttonText'] ) ? sanitize_text_field( $attributes['buttonText'] ) : '';
    $btn_url    = isset( $attributes['buttonUrl'] )  ? esc_url_raw( $attributes['buttonUrl'] )  : '';

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

    ob_start();
    ?>
    <div class="bemazal-1v1 is-matrix rel no-padding">
        <div class="col-8 left-align">
            <div class="item resp-img"<?php echo $wrap_style; ?>>
                <?php if ( $src ) : ?>
                    <img src="<?php echo esc_url( $src ); ?>"
                         <?php echo $srcset ? 'srcset="' . esc_attr( $srcset ) . '"' : ''; ?>
                         <?php echo $sizes_attr ? 'sizes="' . esc_attr( $sizes_attr ) . '"' : ''; ?>
                         alt="<?php echo esc_attr( $media_alt ); ?>"<?php echo $img_attrs . $img_style; ?> />
                <?php endif; ?>
            </div>
        </div>
        <div class="col-6 right-align">
            <div class="hs-description bg-white has-shadow add-20">
                <?php if ( $title ) : ?>
                    <h3 class="weight-400"><?php echo $title; ?></h3>
                <?php endif; ?>
                <?php if ( $text ) : ?>
                    <p class="size-15"><?php echo $text; ?></p>
                <?php endif; ?>
                <?php if ( $btn_text && $btn_url ) : ?>
                    <br>
                    <a class="hs-button ghost-dark is-outlined weight-400" href="<?php echo esc_url( $btn_url ); ?>">
                        <?php echo esc_html( $btn_text ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

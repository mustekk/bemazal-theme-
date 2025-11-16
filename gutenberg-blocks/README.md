# Gutenberg Blocks Structure

This directory contains all Gutenberg blocks for the Bemazal theme, organized by category for easy management and scalability.

## Directory Structure

```
gutenberg-blocks/
├── gallery/              # Gallery blocks
│   ├── thumbs-gallery/   # Swiper gallery with thumbnails
│   └── masonry-gallery/  # Fancybox + Masonry gallery
├── slider/               # Slider and carousel blocks
│   └── carousel/         # Swiper carousel block
├── content/              # Content blocks
├── blocks-loader.php     # Auto-loader for all blocks
└── README.md            # This file
```

## Block Structure

Each block follows this standard structure:

```
block-name/
├── block.json           # Block metadata (required)
├── index.js            # Block editor JavaScript
├── style.css           # Front-end styles
├── editor.css          # Editor-only styles
├── view.js             # Front-end JavaScript (optional)
├── register.php        # Custom enqueue logic (optional)
└── vendor/             # Local libraries (optional)
```

## Automatic Registration

All blocks are automatically registered via `blocks-loader.php`, which:

1. Scans all category directories (gallery, slider, content, etc.)
2. Finds blocks with `block.json` files
3. Includes `register.php` for custom logic (if exists)
4. Registers the block with WordPress

**No manual registration needed!** Just create a block in the appropriate category folder and it will be automatically detected.

## Adding a New Block

### Step 1: Choose or Create a Category

Place your block in an existing category or create a new one:

```bash
mkdir -p gutenberg-blocks/your-category/your-block-name
```

**Category Examples:**
- `gallery/` - Image galleries, photo grids
- `slider/` - Carousels, sliders, swiper components
- `content/` - Content blocks, cards, layouts
- `forms/` - Form-related blocks
- `media/` - Video, audio blocks
- `widgets/` - Small utility blocks

### Step 2: Create block.json

Every block **must** have a `block.json` file:

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 2,
  "name": "bemazal/your-block-name",
  "title": "Your Block Title",
  "category": "bemazal",
  "icon": "admin-customizer",
  "description": "Block description",
  "keywords": ["keyword1", "keyword2"],
  "supports": {
    "align": ["wide", "full"],
    "anchor": true,
    "spacing": {
      "margin": true,
      "padding": true
    }
  },
  "attributes": {
    "yourAttribute": {
      "type": "string",
      "default": ""
    }
  },
  "editorScript": "file:./index.js",
  "style": "file:./style.css",
  "editorStyle": "file:./editor.css"
}
```

### Step 3: Create Block Files

**index.js** - Block editor code:
```javascript
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType('bemazal/your-block-name', {
    edit: (props) => {
        const blockProps = useBlockProps();
        return <div {...blockProps}>Editor view</div>;
    },
    save: (props) => {
        const blockProps = useBlockProps.save();
        return <div {...blockProps}>Frontend view</div>;
    }
});
```

**style.css** - Frontend styles:
```css
.wp-block-bemazal-your-block-name {
    /* Your styles */
}
```

**editor.css** - Editor-only styles:
```css
.wp-block-bemazal-your-block-name {
    /* Editor-specific styles */
}
```

### Step 4: Custom Assets (Optional)

If you need custom enqueue logic, create `register.php`:

```php
<?php
/**
 * Your Block Name - Assets Loader
 *
 * Note: Block registration is handled by blocks-loader.php
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_enqueue_scripts', function () {
    if ( is_admin() ) return;
    if ( ! has_block( 'bemazal/your-block-name' ) ) return;

    $block_dir = get_stylesheet_directory() . '/gutenberg-blocks/your-category/your-block-name';
    $block_url = get_stylesheet_directory_uri() . '/gutenberg-blocks/your-category/your-block-name';

    // Enqueue custom scripts/styles
    wp_enqueue_script(
        'your-block-script',
        $block_url . '/view.js',
        [],
        filemtime( $block_dir . '/view.js' ),
        true
    );
} );
```

### Step 5: Server-Side Rendering (Optional)

For dynamic blocks with server-side rendering:

**register.php:**
```php
<?php
add_filter( 'bemazal_block_render_callback_bemazal/your-block-name', function() {
    return 'your_block_render_callback';
} );

function your_block_render_callback( $attributes, $content ) {
    // Your render logic
    return '<div>' . esc_html( $attributes['yourAttribute'] ) . '</div>';
}
```

## Block Categories

The theme includes a custom "Bemazal" category for all theme-specific blocks. The category is registered automatically in `blocks-loader.php`.

## Existing Blocks

### Gallery Category

**thumbs-gallery** (`tg/thumbs-gallery`)
- Swiper gallery with thumbnails
- Fancybox lightbox support
- Local or CDN assets
- Autoplay and loop options

**masonry-gallery** (`tg/fbmp-gallery`)
- Fancybox 5 lightbox
- Optional Masonry layout
- Responsive columns
- Performance optimizations

### Slider Category

**carousel** (`scb/swiper-carousel`)
- Swiper carousel
- Responsive breakpoints
- Autoplay and navigation
- Custom aspect ratios

## Local vs CDN Assets

Blocks can use local vendor libraries or fall back to CDN:

```php
// Check for local assets
function your_block_has_local_assets() {
    $base = get_stylesheet_directory() . '/gutenberg-blocks/your-category/your-block/vendor';
    return file_exists( $base . '/library/library.min.js' );
}

// Conditionally load
if ( your_block_has_local_assets() ) {
    // Load local
    wp_enqueue_script( 'lib', $block_url . '/vendor/library/library.min.js', [], null, true );
} else {
    // Load from CDN
    wp_enqueue_script( 'lib', 'https://cdn.example.com/library.min.js', [], '1.0.0', true );
}
```

## Best Practices

1. **Naming Convention**: Use lowercase with hyphens (e.g., `my-awesome-block`)
2. **Namespace**: Prefix block names with theme namespace (e.g., `bemazal/block-name`)
3. **Categories**: Place blocks in logical categories
4. **Documentation**: Add comments in `register.php` explaining custom logic
5. **Performance**: Only enqueue assets when block is actually used (use `has_block()`)
6. **Assets**: Use `filemtime()` for cache busting in development
7. **Local Assets**: Place vendor libraries in `vendor/` directory

## Debugging

To check if blocks are registered correctly:

1. Visit WordPress admin → Appearance → Editor
2. Add a new block (+)
3. Search for your block name
4. Check browser console for JavaScript errors
5. Use `error_log()` in PHP for debugging

## File Permissions

Ensure proper permissions for block files:

```bash
find gutenberg-blocks/ -type f -exec chmod 644 {} \;
find gutenberg-blocks/ -type d -exec chmod 755 {} \;
```

## Git Integration

The theme includes `.gitignore` for blocks directory. Vendor libraries are committed for reliability, but you can exclude them if using CDN fallbacks.

## Support

For block-specific issues:
- Check `register.php` for custom enqueue logic
- Verify `block.json` metadata is correct
- Test with WordPress block editor debug mode
- Review browser console for JavaScript errors

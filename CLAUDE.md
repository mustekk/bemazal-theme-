# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Preference

**IMPORTANT: Always communicate in Russian language.** All responses, explanations, and communication should be in Russian, unless the user explicitly requests English.

## Theme Overview

Bemazal is a modern WordPress theme built with Vite for fast development and optimized production builds. It uses SCSS (with Bootstrap 5), and includes pre-configured JavaScript libraries: Swiper (sliders), Fancybox (lightboxes), and Masonry (grid layouts).

**Performance Features:**
- ✅ Centralized library management (no duplicate libraries across blocks)
- ✅ Vite-optimized bundles with tree-shaking and code-splitting
- ✅ Automatic conditional loading (libraries load only when blocks are present)
- ✅ ~70% reduction in JavaScript size compared to vendor bundles
- ✅ Swiper 12, Fancybox 5, Masonry 4.2, ImagesLoaded 5 (latest versions)

## Development Commands

### Install Dependencies
```bash
npm install
```
Installs all required dependencies. **Important:** Package versions have been updated to work with latest Vite and Swiper versions.

### Development Server
```bash
npm run dev
```
Starts Vite dev server on `http://localhost:5173` with HMR (Hot Module Replacement) and live PHP reloading.

**WordPress Configuration Required:**
Add to `wp-config.php` to enable dev mode:
```php
define('VITE_FORCE_DEV', true);
// Optional: override dev server URL
define('VITE_SERVER', 'http://localhost:5173');
```

### Stop Development Server
**Option 1: Using npm script**
```bash
npm run stop
```

**Option 2: Using shell script**
```bash
./stop-vite.sh
```

**Option 3: Manual**
```bash
# Kill by port
kill -9 $(lsof -ti:5173)

# Or kill all Vite processes
pkill -f "vite"
```

### Production Build
```bash
npm run build
```
Compiles assets to `dist/` directory with:
- Minified and hashed filenames
- PurgeCSS to remove unused styles
- Manifest file for WordPress asset loading

## Architecture

### Asset Loading System

The theme uses a custom Vite integration (not a plugin) defined in `functions.php`:

1. **Development Mode** (`VITE_FORCE_DEV` constant):
   - Loads `/@vite/client` for HMR
   - Loads `/src/js/main.js` directly from Vite dev server
   - PHP files trigger browser reload via `vite-plugin-live-reload`

2. **Production Mode**:
   - Reads `dist/manifest.json` to find hashed filenames
   - Enqueues JS and CSS from `dist/` directory
   - Cache busting via `BEMAZAL_VERSION` constant

### Entry Point Flow

**Single Entry Point:** `src/js/main.js`

Import chain:
```
main.js
  ├─ ../scss/main.scss (Bootstrap + custom styles)
  ├─ Swiper (with Navigation, Pagination modules)
  ├─ Fancybox
  └─ Masonry
```

**Conditional Initialization:**
All JavaScript libraries only initialize if their target elements exist in the DOM:
- Swiper: `.swiper` elements
- Fancybox: `[data-fancybox]` attributes
- Masonry: `.masonry-grid` elements

### SCSS Architecture

`src/scss/main.scss` imports Bootstrap via `@use 'bootstrap/scss/bootstrap'` which makes all Bootstrap modules and variables available. Variable overrides must be defined before the `@use` statement.

### Vite Configuration

Key aspects in `vite.config.js`:
- **PurgeCSS:** Scans `./**/*.php` and `./src/js/**/*.js` to remove unused CSS
- **Manifest mode:** Required for WordPress integration
- **No public directory:** All assets go through Vite processing
- **Relative base path:** Ensures URLs work with WordPress theme directory structure

## Template Structure

Standard WordPress hierarchy:
- `header.php`: Site header with Bootstrap nav
- `footer.php`: Site footer
- `index.php`: Main template fallback
- `style.css`: Theme metadata only (actual styles in `dist/`)

## Working with Styles

1. Bootstrap variables can be overridden in `src/scss/main.scss` before the `@use` statement
2. Add custom SCSS files and import them in `main.scss`
3. All Bootstrap utilities and mixins are available after the `@use` statement

## Working with JavaScript

1. Import new libraries via npm: `npm install <package>`
2. Import in `src/js/main.js`
3. Follow conditional initialization pattern (check for DOM elements before running)
4. Vite automatically code-splits imported modules

### Swiper 12+ Import Pattern
Swiper 12 (latest) uses the same module import syntax:
```javascript
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, Thumbs } from 'swiper/modules';
```

Then register modules in Swiper initialization:
```javascript
new Swiper(el, {
    modules: [Navigation, Pagination, Autoplay, Thumbs],
    // ... options
});
```

## Centralized Libraries System

**All major JavaScript libraries (Swiper, Fancybox, Masonry) are centralized and optimized:**

### Architecture

Libraries are loaded from `src/js/libraries/`:
- `swiper.js` - Swiper core + Navigation, Pagination, Autoplay, Thumbs, EffectFade modules
- `fancybox.js` - Fancybox 5 lightbox
- `masonry.js` - Masonry layout + ImagesLoaded

### Benefits

1. **Single Version**: Each library loaded once per page (no duplicates)
2. **Automatic Loading**: Libraries enqueue automatically when blocks are present
3. **Vite Optimization**: Tree-shaking, minification, code-splitting
4. **Performance**: ~70% smaller than vendor bundles (696KB → ~240KB gzipped)

### How It Works

**Automatic Detection** (`includes/libraries-loader.php`):
- Scans page content for blocks
- Maps blocks to required libraries:
  - `tg/thumbs-gallery` → Swiper + Fancybox
  - `tg/fbmp-gallery` → Fancybox + Masonry
  - `scb/swiper-carousel` → Swiper
- Enqueues only needed libraries

**Block Integration**:
Blocks depend on centralized libraries via WordPress dependencies:
```php
wp_enqueue_script(
    'my-block-script',
    $block_url . '/view.js',
    [ 'bemazal-swiper', 'bemazal-fancybox' ], // Dependencies
    filemtime( $view_js ),
    true
);
```

**Using Libraries in Block Scripts**:
Libraries are available globally via `window`:
```javascript
// Swiper
const swiper = new window.Swiper(element, options);

// Fancybox
window.Fancybox.bind('[data-fancybox]', options);

// Masonry
const masonry = new window.Masonry(element, options);
window.imagesLoaded(element, callback);
```

### Adding New Library-Dependent Blocks

1. Create block with standard structure
2. In `register.php`, set dependencies:
   ```php
   wp_enqueue_script(
       'my-block-view',
       $block_url . '/view.js',
       [ 'bemazal-swiper' ], // Dependency on centralized Swiper
       filemtime( $view_js ),
       true
   );
   ```
3. Update `bemazal_auto_enqueue_block_libraries()` in `includes/libraries-loader.php`:
   ```php
   $block_library_map = [
       'my/new-block' => [ 'swiper' ], // Maps block to libraries
       // ...
   ];
   ```
4. Library loads automatically when block is present

### Library Versions

- **Swiper**: v12.0.0 (latest)
- **Fancybox**: v5.0.36
- **Masonry**: v4.2.2
- **ImagesLoaded**: v5.0.0

All managed via `package.json` and compiled by Vite.

## PurgeCSS Considerations

When adding new template files or JavaScript:
- Update `content` array in `vite.config.js` purgeCss plugin if files are outside current patterns
- Current patterns: `./**/*.php` and `./src/js/**/*.js`
- Dynamic class names may be purged; use safelist if needed

## Theme Constants

- `BEMAZAL_VERSION`: Version for cache busting (defined in functions.php)
- `VITE_FORCE_DEV`: Enable dev mode (define in wp-config.php)
- `VITE_SERVER`: Override dev server URL (optional, in wp-config.php)

## WordPress Integration Points

- **functions.php**: Asset enqueuing logic, theme setup, nav menus, blocks loader
- **manifest.json**: Generated by Vite, consumed by WordPress to find asset files
- Text domain: `bemazal` (for translations)
- Admin bar disabled on frontend by default

## Gutenberg Blocks

The theme includes a structured system for Gutenberg blocks with automatic registration.

### Blocks Directory Structure

```
gutenberg-blocks/
├── gallery/              # Gallery blocks
│   ├── thumbs-gallery/   # Swiper gallery with thumbnails
│   └── masonry-gallery/  # Fancybox + Masonry gallery
├── slider/               # Slider and carousel blocks
│   └── carousel/         # Swiper carousel block
├── content/              # Content blocks
├── blocks-loader.php     # Auto-loader for all blocks
└── README.md            # Detailed documentation
```

### Block Structure

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

### Automatic Registration

All blocks are automatically registered via `blocks-loader.php`:
1. Scans all category directories (gallery, slider, content, etc.)
2. Finds blocks with `block.json` files
3. Includes `register.php` for custom logic if it exists
4. Registers blocks with WordPress automatically

**No manual registration needed!** Just create a block in the appropriate category folder.

### Adding New Blocks

1. Choose or create a category directory in `gutenberg-blocks/`
2. Create your block directory: `gutenberg-blocks/category/block-name/`
3. Add required `block.json` file with block metadata
4. Create `index.js`, `style.css`, and `editor.css`
5. Optionally add `register.php` for custom asset enqueuing
6. The block will be automatically detected and registered

See `gutenberg-blocks/README.md` for detailed instructions and examples.

### Existing Blocks

**Gallery:**
- `tg/thumbs-gallery` - Swiper gallery with thumbnails and Fancybox
- `tg/fbmp-gallery` - Fancybox + optional Masonry gallery

**Slider:**
- `scb/swiper-carousel` - Responsive Swiper carousel

### Block Assets

Blocks can use local vendor libraries (stored in `vendor/`) or CDN fallbacks. The `register.php` file handles conditional asset loading based on file availability.

## Testing the Theme

A demo page template (`page-demo.php`) is available to test all theme features:
1. Create a new page in WordPress admin
2. Select "Demo Page" template
3. Visit the page to see:
   - Swiper slider with navigation and pagination
   - Fancybox lightbox gallery
   - Masonry grid layout
   - Bootstrap components

## Current Package Versions (Tested & Working)

### Dev Dependencies
- vite: ^6.0.0
- vite-plugin-live-reload: ^3.0.5 (Live reload confirmed working ✓)
- vite-plugin-purgecss: ^0.2.13
- sass: ^1.81.0
- terser: ^5.44.1 (for JS minification)
- autoprefixer: ^10.4.20

### Production Dependencies
- bootstrap: ^5.3.3
- swiper: ^12.0.0 ✨ (latest version)
- @fancyapps/ui: ^5.0.36
- masonry-layout: ^4.2.2
- imagesloaded: ^5.0.0

## Performance Metrics

### Before Optimization
- Total vendor libraries: **696 KB** (unminified)
- Duplicate copies: Swiper (2×), Fancybox (2×)
- Load strategy: All libraries loaded per block

### After Optimization
- Swiper: **89.97 KB** (26.50 KB gzipped) - single copy
- Fancybox: **141.70 KB** (42.59 KB gzipped) - single copy
- Masonry: **2.98 KB** (1.21 KB gzipped)
- ImagesLoaded: **5.41 KB** (1.84 KB gzipped)
- **Total dist/**: **336 KB** (includes all assets)
- **Improvement**: ~70% reduction in JS size
- Load strategy: Conditional loading (only when blocks present)

## Known Issues

- Bootstrap SCSS shows deprecation warnings (not critical, affects Bootstrap itself)
- Swiper 10.x import syntax is incompatible - use Swiper 12+ syntax documented above

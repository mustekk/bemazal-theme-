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

## Creating New Gutenberg Blocks: Complete Guide

Это руководство объясняет **правильную архитектуру** создания блоков в теме Bemazal, включая двойную CSS-систему и интеграцию с HMR.

### ⚠️ ВАЖНО: Двойная CSS Архитектура

Тема использует **два места для хранения CSS** блоков:

#### 1. Локальные файлы в `gutenberg-blocks/`
```
gutenberg-blocks/category/block-name/
├── style.scss          # Исходник для фронтенда (НЕ используется в продакшене)
├── style.css           # Заглушка (реальные стили берутся из main.css)
├── editor.scss         # Исходник для редактора
└── editor.css          # Скомпилированные стили редактора (используется)
```

**Назначение:**
- `editor.scss/css` - Только для редактора WordPress (Gutenberg)
- `style.scss/css` - Заглушки для WordPress-совместимости
- Обеспечивают правильное распознавание WordPress

#### 2. Централизованные файлы в `src/scss/blocks/`
```
src/scss/blocks/
├── gallery/
│   ├── thumbs-gallery.scss      # Продакшн стили блока
│   └── masonry-gallery.scss
├── slider/
│   └── carousel.scss
├── media/
│   ├── image-hero.scss
│   └── video-hero.scss
└── _index.scss                  # КРИТИЧНО: импортирует все блоки
```

**Назначение:**
- Единственный источник продакшн-стилей
- Компилируются в `main.css` через Vite
- Обеспечивают HMR в dev режиме
- Оптимизируются PurgeCSS

### 🔥 HMR (Hot Module Replacement) Интеграция

**Критичное требование:** Все SCSS файлы блоков **ОБЯЗАТЕЛЬНО** должны быть импортированы в `src/scss/blocks/_index.scss`:

```scss
// src/scss/blocks/_index.scss

// Gallery blocks
@import 'gallery/thumbs-gallery';
@import 'gallery/masonry-gallery';

// Slider blocks
@import 'slider/carousel';

// Media blocks
@import 'media/image-hero';
@import 'media/video-hero';

// Content blocks
// @import 'content/your-new-block'; // Добавь здесь новый блок
```

**Почему это важно:**
- ✅ HMR работает мгновенно при правке SCSS
- ✅ Все стили собираются в один `main.css` (67KB → 11KB gzip)
- ✅ Меньше HTTP запросов (1 вместо 6+)
- ❌ Без импорта: HMR не работает, нужен ручной пересбор

### 📁 Полная Структура Блока

Пример правильной структуры блока:

```
gutenberg-blocks/category/block-name/
├── block.json          # Метаданные блока (обязательно)
├── index.js            # React компонент для редактора
├── register.php        # PHP хуки и загрузка ассетов
├── view.js             # JavaScript для фронтенда (опционально)
│
├── editor.scss         # Стили ТОЛЬКО для редактора (исходник)
├── editor.css          # Скомпилированные стили редактора
│
├── style.scss          # Заглушка (не используется)
└── style.css           # Заглушка (реальные стили в src/scss/blocks/)
```

**И параллельно:**
```
src/scss/blocks/category/
└── block-name.scss     # Реальные продакшн стили
```

### 🚀 Пошаговое Создание Нового Блока

#### Шаг 1: Создание директории блока
```bash
mkdir -p gutenberg-blocks/category/block-name
```

#### Шаг 2: Создание block.json
```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "namespace/block-name",
  "title": "Block Title",
  "category": "media",
  "icon": "smiley",
  "description": "Block description",
  "keywords": ["keyword1", "keyword2"],
  "textdomain": "bemazal",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css",
  "viewScript": "file:./view.js",
  "supports": {
    "html": false,
    "align": ["wide", "full"]
  },
  "attributes": {
    "exampleAttribute": {
      "type": "string",
      "default": "Default value"
    }
  }
}
```

#### Шаг 3: Создание register.php
```php
<?php
/**
 * Block Name - Assets Loader
 *
 * Block styles are bundled in main.css for HMR support.
 * This file handles block-specific view script loading.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_enqueue_scripts', function () {
    // Skip in admin
    if ( is_admin() ) {
        return;
    }

    // Check if block is present on the page
    if ( ! has_block( 'namespace/block-name' ) ) {
        return;
    }

    $block_dir = get_stylesheet_directory() . '/gutenberg-blocks/category/block-name';
    $block_url = get_stylesheet_directory_uri() . '/gutenberg-blocks/category/block-name';

    // Enqueue block-specific initialization script
    // Dependencies: centralized libraries if needed
    $view_js = $block_dir . '/view.js';
    if ( file_exists( $view_js ) ) {
        wp_enqueue_script(
            'block-name-view',
            $block_url . '/view.js',
            [ 'bemazal-swiper' ], // Зависимости от библиотек (опционально)
            filemtime( $view_js ),
            true
        );
    }
}, 25 ); // Priority 25 - после загрузки библиотек
```

**ВАЖНО:** НЕ используй условную загрузку стилей через `bemazal_enqueue_block_style()` - стили уже в main.css!

#### Шаг 4: Создание index.js
```javascript
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';

registerBlockType('namespace/block-name', {
    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps();

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Block Settings">
                        <TextControl
                            label="Example Attribute"
                            value={attributes.exampleAttribute}
                            onChange={(value) => setAttributes({ exampleAttribute: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                <div {...blockProps}>
                    <p>Block content: {attributes.exampleAttribute}</p>
                </div>
            </>
        );
    },
    save: ({ attributes }) => {
        const blockProps = useBlockProps.save();
        return (
            <div {...blockProps}>
                <p>{attributes.exampleAttribute}</p>
            </div>
        );
    }
});
```

#### Шаг 5: Создание editor.scss и editor.css
```scss
// gutenberg-blocks/category/block-name/editor.scss

.wp-block-namespace-block-name {
    // Стили только для редактора WordPress
    padding: 20px;
    border: 1px solid #e0e0e0;
}
```

Скомпилируй в CSS:
```bash
sass gutenberg-blocks/category/block-name/editor.scss gutenberg-blocks/category/block-name/editor.css
```

#### Шаг 6: Создание заглушек style.scss и style.css
```css
/* gutenberg-blocks/category/block-name/style.css */
/* Реальные стили блока находятся в src/scss/blocks/category/block-name.scss */
/* и компилируются в main.css для поддержки HMR */
```

#### Шаг 7: Создание централизованного SCSS
```scss
// src/scss/blocks/category/block-name.scss

.wp-block-namespace-block-name {
    // Продакшн стили блока для фронтенда
    padding: 30px;
    background: #f9f9f9;

    p {
        margin: 0;
    }
}
```

#### Шаг 8: ⚡ КРИТИЧНО - Добавление импорта в _index.scss
```scss
// src/scss/blocks/_index.scss

// ... существующие импорты ...

// Category blocks
@import 'category/block-name'; // ← ОБЯЗАТЕЛЬНО ДОБАВЬ!
```

**БЕЗ ЭТОГО HMR НЕ БУДЕТ РАБОТАТЬ!**

#### Шаг 9: Создание view.js (если нужен JavaScript)
```javascript
// gutenberg-blocks/category/block-name/view.js

document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.wp-block-namespace-block-name');

    blocks.forEach(block => {
        // Инициализация блока
        console.log('Block initialized:', block);

        // Пример использования Swiper (если добавлена зависимость)
        if (window.Swiper) {
            const swiper = new window.Swiper(block.querySelector('.swiper'), {
                // опции
            });
        }
    });
});
```

#### Шаг 10: (Опционально) Добавление в libraries-loader.php
Если блок использует централизованные библиотеки (Swiper, Fancybox, Masonry):

```php
// includes/libraries-loader.php

$block_library_map = [
    'namespace/block-name' => [ 'swiper' ], // или 'fancybox', 'masonry'
    // ... существующие блоки ...
];
```

#### Шаг 11: Пересборка темы
```bash
npm run build
```

Блок автоматически зарегистрируется через `blocks-loader.php`!

### ✅ Чеклист Создания Блока

- [ ] Создана директория `gutenberg-blocks/category/block-name/`
- [ ] Создан `block.json` с правильными метаданными
- [ ] Создан `register.php` с условной загрузкой view.js
- [ ] Создан `index.js` с React компонентом
- [ ] Создан `editor.scss` и скомпилирован в `editor.css`
- [ ] Созданы заглушки `style.scss` и `style.css`
- [ ] Создан `src/scss/blocks/category/block-name.scss` с продакшн стилями
- [ ] **КРИТИЧНО:** Добавлен импорт в `src/scss/blocks/_index.scss`
- [ ] (Опционально) Создан `view.js` для фронтенд JavaScript
- [ ] (Опционально) Добавлен маппинг в `includes/libraries-loader.php`
- [ ] Запущен `npm run build`
- [ ] Протестирован HMR: правка SCSS → мгновенное обновление в браузере

### 📊 Архитектурные Решения

#### Почему Двойная CSS Система?

**Старая архитектура (до HMR):**
- Отдельные entry points в vite.config.js для каждого блока
- Каждый блок → отдельный CSS файл (block-carousel.css, block-gallery.css, и т.д.)
- 6+ CSS файлов (6+ HTTP запросов)
- HMR не работал для SCSS блоков
- Условная загрузка через `bemazal_enqueue_block_style()`

**Новая архитектура (с HMR):**
- Все SCSS блоков импортируются в `src/scss/blocks/_index.scss`
- Компилируется в один `main.css` (67KB → 11KB gzip)
- 1 CSS файл (1 HTTP запрос)
- ✅ HMR работает мгновенно
- Локальные файлы остаются для WordPress-совместимости

**Результаты:**
- Размер CSS: уменьшен на 84% (с gzip)
- HTTP запросы: 6+ → 1
- Скорость разработки: HMR работает мгновенно
- Производительность: меньше файлов = быстрее загрузка

#### Почему НЕ удалять локальные style.css?

WordPress ожидает файлы, указанные в block.json. Если удалить `style.css`, могут быть:
- Предупреждения в консоли WordPress
- Проблемы с некоторыми плагинами
- Нарушение стандартов WordPress

Решение: оставляем заглушки для совместимости.

### 🔍 Отладка Проблем

#### HMR не работает для блока

**Проблема:** Правки SCSS не применяются мгновенно.

**Решение:**
1. Проверь импорт в `src/scss/blocks/_index.scss`:
   ```scss
   @import 'category/block-name'; // должен быть
   ```
2. Проверь консоль браузера - должно быть `[vite] css hot updated:`
3. Проверь, что dev сервер запущен: `npm run dev`

#### Стили не применяются на фронтенде

**Проблема:** Блок отображается без стилей.

**Решение:**
1. Проверь, что SCSS блока импортирован в `_index.scss`
2. Пересобери: `npm run build`
3. Проверь `dist/manifest.json` - должен быть `main.css`
4. Очисти кеш браузера (Ctrl+Shift+R)

#### Стили редактора не применяются

**Проблема:** В редакторе WordPress блок выглядит не так.

**Решение:**
1. Проверь, что `editor.css` скомпилирован из `editor.scss`
2. Проверь версионирование в register.php:
   ```php
   filemtime( $editor_css ) // должно обновляться
   ```
3. Очисти кеш WordPress и браузера
4. Проверь, что в block.json: `"editorStyle": "file:./editor.css"`

#### Библиотеки не загружаются

**Проблема:** Swiper/Fancybox не работают в блоке.

**Решение:**
1. Добавь зависимость в register.php:
   ```php
   [ 'bemazal-swiper', 'bemazal-fancybox' ]
   ```
2. Добавь маппинг в `includes/libraries-loader.php`:
   ```php
   'namespace/block-name' => [ 'swiper', 'fancybox' ]
   ```
3. Используй глобальные объекты:
   ```javascript
   window.Swiper, window.Fancybox, window.Masonry
   ```

### 📚 Примеры Существующих Блоков

**Простой блок (только Swiper):**
```
gutenberg-blocks/slider/carousel/
└── register.php → [ 'bemazal-swiper' ]
```

**Сложный блок (Swiper + Fancybox):**
```
gutenberg-blocks/gallery/thumbs-gallery/
└── register.php → [ 'bemazal-swiper', 'bemazal-fancybox' ]
```

**С Masonry:**
```
gutenberg-blocks/gallery/masonry-gallery/
└── register.php → [ 'bemazal-fancybox', 'bemazal-masonry' ]
```

Изучи эти блоки как референс!

### 🎯 Лучшие Практики

1. **ВСЕГДА импортируй SCSS в _index.scss** - без этого HMR не работает
2. **НЕ используй условную загрузку стилей** - они уже в main.css
3. **Используй централизованные библиотеки** - не дублируй Swiper/Fancybox
4. **Следуй naming conventions** - `namespace/block-name` в kebab-case
5. **Версионируй ассеты через filemtime()** - избегай проблем с кешем
6. **Проверяй has_block()** - загружай скрипты только когда блок есть на странице
7. **Компилируй editor.scss в editor.css** - не используй исходники напрямую
8. **Оставляй заглушки style.css** - для WordPress-совместимости
9. **Тестируй HMR** - правь SCSS и смотри мгновенное обновление
10. **Пересобирай перед коммитом** - `npm run build` для продакшена

## Known Issues

- Bootstrap SCSS shows deprecation warnings (not critical, affects Bootstrap itself)
- Swiper 10.x import syntax is incompatible - use Swiper 12+ syntax documented above

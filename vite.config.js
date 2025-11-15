import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import liveReload from 'vite-plugin-live-reload';
import purgeCss from 'vite-plugin-purgecss';

export default defineConfig(({ command, mode }) => {
    const isProduction = mode === 'production';

    const themeRoot = __dirname;
    const distPath = path.resolve(themeRoot, 'dist');

    return {
        // корень проекта — папка темы
        root: themeRoot,

        // base:
        // - при dev — реальный адрес dev-сервера
        // - при build — путь к dist в WordPress
        base: command === 'serve'
            ? 'https://bemazal.local:5173/'
            : '/wp-content/themes/bemazal-theme/dist/',

        publicDir: false,

        build: {
            manifest: true,
            outDir: distPath,
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: path.resolve(themeRoot, 'src/js/main.js'),
                    // Separate entry points for libraries (loaded on-demand by blocks)
                    'libraries-swiper': path.resolve(themeRoot, 'src/js/libraries/swiper.js'),
                    'libraries-fancybox': path.resolve(themeRoot, 'src/js/libraries/fancybox.js'),
                    'libraries-masonry': path.resolve(themeRoot, 'src/js/libraries/masonry.js'),
                    // Separate entry points for block styles (loaded on-demand)
                    'block-thumbs-gallery': path.resolve(themeRoot, 'src/scss/blocks/gallery/thumbs-gallery.scss'),
                    'block-masonry-gallery': path.resolve(themeRoot, 'src/scss/blocks/gallery/masonry-gallery.scss'),
                    'block-carousel': path.resolve(themeRoot, 'src/scss/blocks/slider/carousel.scss'),
                    'block-image-card': path.resolve(themeRoot, 'src/scss/blocks/content/image-card.scss'),
                    'block-video-hero': path.resolve(themeRoot, 'src/scss/blocks/media/video-hero.scss'),
                },
                output: {
                    // Optimize chunk splitting for better caching
                    manualChunks: (id) => {
                        // Vendor chunk for npm packages
                        if (id.includes('node_modules')) {
                            // Split large libraries into separate chunks
                            if (id.includes('swiper')) return 'vendor-swiper';
                            if (id.includes('@fancyapps')) return 'vendor-fancybox';
                            if (id.includes('masonry-layout')) return 'vendor-masonry';
                            if (id.includes('imagesloaded')) return 'vendor-imagesloaded';
                            if (id.includes('bootstrap')) return 'vendor-bootstrap';
                            // Other npm packages
                            return 'vendor';
                        }
                    },
                    // Clean filenames for better debugging
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    entryFileNames: '[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]',
                },
            },
            // Optimize build performance
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: isProduction, // Remove console.log in production
                    drop_debugger: isProduction,
                    pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
                },
            },
            // Increase chunk size warning limit (libraries are large)
            chunkSizeWarningLimit: 600,
        },

        plugins: [
            // live reload для PHP-шаблонов
            liveReload([
                '**/*.php',
                '../../../**/*.php', // следит за всеми PHP в WordPress
            ]),

            // PurgeCSS — чистим неиспользуемые стили
            purgeCss({
                content: [
                    path.resolve(themeRoot, '**/*.php'),
                    path.resolve(themeRoot, 'src/js/**/*.js'),
                    path.resolve(themeRoot, 'gutenberg-blocks/**/*.js'),
                ],
                safelist: [
                    // классы библиотек, которые не должны удаляться
                    /^swiper-/,
                    /^fancybox-/,
                    /^is-/,
                    /^wp-/,
                    /^masonry-/,
                    /^video-hero-/,
                    /^bemazal-/,
                    // WordPress alignment classes
                    /^align/,
                ],
            }),
        ],

        css: {
            preprocessorOptions: {
                scss: {
                    // Используем modern API для лучшей производительности
                    api: 'modern',
                    quietDeps: true, // Suppress deprecation warnings from dependencies (Bootstrap)
                    // Подавляем предупреждения об устаревших @import
                    // Эти предупреждения не критичны - @import всё еще работает
                    // и необходим для совместимости с Bootstrap
                    silenceDeprecations: ['import'],
                    // если нужно подключать общие переменные/миксины глобально:
                    // additionalData: `@import "abstracts/variables"; @import "abstracts/mixins";`,
                },
            },
        },

        server: {
            // Nginx proxy setup: Vite работает на HTTP локально
            // Nginx проксирует на https://bemazal.local/@vite/
            origin: 'https://bemazal.local',

            host: '127.0.0.1',
            port: 5173,
            strictPort: true,

            // CORS не нужен - всё через Nginx proxy
            cors: true,

            // Убрали HTTPS - работаем на обычном HTTP
            // SSL обрабатывает Nginx
            https: false,

            hmr: {
                // HMR через Nginx WebSocket proxy
                protocol: 'wss',
                host: 'bemazal.local',
                clientPort: 443,
                path: '/@vite/',
                overlay: true
            },

            // важно для WSL / Windows: включаем polling
            watch: {
                usePolling: true,
                interval: 100,
            },
        },
    };
});

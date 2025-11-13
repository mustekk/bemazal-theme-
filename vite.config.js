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
                },
            },
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
                ],
                safelist: [
                    // классы библиотек, которые не должны удаляться
                    /^swiper-/,
                    /^fancybox-/,
                    /^is-/,
                    /^wp-/,
                    /^masonry-/,
                ],
            }),
        ],

        css: {
            preprocessorOptions: {
                scss: {
                    // если нужно подключать общие переменные/миксины глобально:
                    // additionalData: `@import "abstracts/variables"; @import "abstracts/mixins";`,
                },
            },
        },

        server: {
            origin: 'https://bemazal.local:5173',

            host: '0.0.0.0',
            port: 5173,
            strictPort: true,

            // Enable CORS for WordPress domain
            cors: true,

            https: {
                key: fs.readFileSync(path.resolve(themeRoot, 'bemazal.local+3-key.pem')),
                cert: fs.readFileSync(path.resolve(themeRoot, 'bemazal.local+3.pem')),
            },

            hmr: {
                host: 'bemazal.local',
                protocol: 'wss',
            },

            // важно для WSL / Windows: включаем polling
            watch: {
                usePolling: true,
                interval: 100,
            },
        },
    };
});

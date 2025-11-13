# Bemazal WordPress Theme

Современная WordPress тема с Vite, SCSS (Bootstrap 5), и пре-настроенными JS библиотеками: Swiper, Fancybox, Masonry.

## Быстрый старт

### 1. Установка зависимостей

```bash
cd /home/amigo/sites/bemazal/wp-content/themes/bemazal-theme
npm install
```

### 2. Настройка wp-config.php

Добавьте в ваш `wp-config.php` для включения dev-режима:

```php
define('VITE_FORCE_DEV', true);
define('VITE_SERVER', 'https://bemazal.local:5173');
```

### 3. Запуск dev-сервера

```bash
npm run dev
```

Dev-сервер запустится на `https://bemazal.local:5173` с:
- ✅ HTTPS (SSL-сертификаты mkcert)
- ✅ HMR для SCSS/JS
- ✅ Live reload для PHP файлов
- ✅ Hot Module Replacement через WSS (WebSocket Secure)

### 4. Production сборка

```bash
npm run build
```

Для production режима:
1. Уберите или закомментируйте `VITE_FORCE_DEV` в `wp-config.php`
2. Запустите `npm run build`
3. Файлы будут собраны в папку `dist/`

### Остановка dev-сервера

```bash
npm run stop
```

## Структура SCSS (7-1 Architecture)

```
src/scss/
├── main.scss                   # Точка входа
├── abstracts/                  # Переменные, миксины
│   ├── _variables.scss         # Bootstrap overrides + кастомные переменные
│   └── _mixins.scss            # Переиспользуемые миксины
├── base/                       # Базовые стили
│   ├── _reset.scss             # CSS reset
│   └── _typography.scss        # Типографика
├── components/                 # Компоненты
│   ├── _buttons.scss           # Кнопки
│   ├── _cards.scss             # Карточки
│   └── _libraries.scss         # Стили для Swiper, Masonry
└── layout/                     # Лейауты
    ├── _header.scss            # Хедер
    └── _footer.scss            # Футер
```

## Особенности

### HTTPS Dev-сервер
- Сертификаты: `bemazal.local+3.pem` и `bemazal.local+3-key.pem`
- HMR работает через WSS (WebSocket Secure)
- Совместим с bemazal.local домено

### PurgeCSS Safelist
Защищены от удаления:
- Bootstrap: modal, dropdown, collapse, offcanvas, toast, carousel, accordion
- Swiper: все классы swiper-*
- Fancybox: все классы fancybox-* и f-*
- Masonry: все классы masonry-*

## Переопределение Bootstrap

В `src/scss/abstracts/_variables.scss`:

```scss
$primary: #5b9bd5;
$font-family-sans-serif: 'Inter', system-ui, sans-serif;
```

## Dev vs Production

### Dev (`VITE_FORCE_DEV = true`)
- Загрузка с `https://bemazal.local:5173`
- `@vite/client` для HMR
- Source maps
- Мгновенные изменения

### Production (`VITE_FORCE_DEV = false`)
- Загрузка из `dist/`
- Минификация JS/CSS
- PurgeCSS оптимизация
- Хешированные файлы

## NPM скрипты

- `npm run dev` - запуск dev-сервера
- `npm run build` - production сборка
- `npm run stop` - остановить Vite

## Stack

- **Vite 6** - сборка и HMR
- **Bootstrap 5.3** - CSS фреймворк
- **Swiper 11** - слайдеры
- **Fancybox 5** - лайтбоксы
- **Masonry 4** - сетка

## Документация

Полная документация: [CLAUDE.md](CLAUDE.md)

## Тестирование

1. Создайте страницу в WordPress
2. Выберите шаблон "Demo Page"
3. Протестируйте Swiper, Fancybox, Masonry, Bootstrap

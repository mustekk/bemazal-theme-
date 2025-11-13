
# SCB Swiper Carousel (Theme Block)

Гутенберг‑блок «Карусель (Swiper)» с локальными файлами Swiper и компактным интерфейсом редактора (модальные окна для слайдов). 
Структура папок повторяет архив `swiper-thumbs-gallery-theme-fixed8.zip`.

## Установка
1. Скопируйте папку `scb-swiper-carousel-theme` в директорию вашей темы: `wp-content/themes/ВАША_ТЕМА/blocks/`.
2. Подключите php‑файл из `functions.php` темы (если загрузчик блоков не автоматический):
   ```php
   require_once get_stylesheet_directory() . '/blocks/scb-swiper-carousel-theme/scb-swiper-carousel.php';
   ```
3. Найдите блок **«Карусель (Swiper)»** в редакторе.

## Локальные assets
Блок использует локальные файлы из `block/vendor/swiper/`.
Если их удалить, будет применён CDN. Чтобы принудительно использовать локальные файлы, определите константу:
```php
define('SCB_FORCE_LOCAL_ASSETS', true);
```

## Особенности
- Размер изображений — `medium` (fallback: `medium_large` → `large` → `full`).
- Пер‑слайдовое затемнение, hover‑эффекты (*zoom / lift / none*).
- Ссылка «поверх» изображения, опциональный текст.
- Настройки: autoplay, delay, speed, loop, centered, pagination, navigation, spaceBetween, slidesPerView (mobile/tablet/desktop), max‑width, aspect‑ratio, открытие ссылок в новой вкладке.


## Admin panel integration updates
- Kept slide list UI from your reference archive.
- Removed per-slide darken and hover controls from modal; added global settings in Inspector.
- "Заголовок" now renders next to link on the front-end (bottom-left label).

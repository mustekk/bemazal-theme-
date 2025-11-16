/**
 * Text Overlay Block - Front-end JavaScript
 * Handles responsive image switching
 */

document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.wp-block-bemazal-text-overlay');

  blocks.forEach(block => {
    const image = block.querySelector('.text-overlay-image');

    if (!image) return;

    const desktopImage = image.getAttribute('data-desktop-image');
    const mobileImage = image.getAttribute('data-mobile-image');

    if (!mobileImage) return; // Если нет mobile изображения, ничего не делаем

    // Функция для проверки размера экрана и смены изображения
    const updateImage = () => {
      if (window.innerWidth <= 768 && mobileImage) {
        image.src = mobileImage;
      } else if (desktopImage) {
        image.src = desktopImage;
      }
    };

    // Первичная установка
    updateImage();

    // Обработчик изменения размера окна
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateImage, 150);
    });
  });
});

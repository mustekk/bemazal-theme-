/**
 * Navigation Enhancement Script - Desktop Only
 *
 * Добавляет плавное поведение для desktop меню:
 * - Hover-based dropdowns
 * - Плавные анимации
 * - Accessibility improvements
 *
 * Мобильное меню обрабатывается отдельно в mobile-menu.js
 */

document.addEventListener('DOMContentLoaded', function() {
  const desktopNav = document.querySelector('.desktop-nav');
  if (!desktopNav) return;

  const dropdowns = desktopNav.querySelectorAll('.dropdown, .dropdown-submenu');
  const isMobile = () => window.innerWidth < 992; // Bootstrap lg breakpoint

  // ============================================
  // Desktop: Hover-based Dropdowns
  // ============================================
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (!toggle || !menu) return;

    // Hover для открытия/закрытия
    dropdown.addEventListener('mouseenter', function() {
      dropdown.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('show');
    });

    dropdown.addEventListener('mouseleave', function() {
      dropdown.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('show');
    });

    // Клик для accessibility (keyboard users)
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('show');

      // Закрываем другие открытые меню на том же уровне
      const siblings = dropdown.parentElement.querySelectorAll(':scope > .dropdown.show, :scope > .dropdown-submenu.show');
      siblings.forEach(sibling => {
        if (sibling !== dropdown) {
          sibling.classList.remove('show');
          const siblingToggle = sibling.querySelector('.dropdown-toggle');
          const siblingMenu = sibling.querySelector('.dropdown-menu');
          if (siblingToggle) siblingToggle.setAttribute('aria-expanded', 'false');
          if (siblingMenu) siblingMenu.classList.remove('show');
        }
      });

      // Переключаем текущее меню
      dropdown.classList.toggle('show');
      toggle.setAttribute('aria-expanded', !isOpen);
      menu.classList.toggle('show');
    });
  });

  // ============================================
  // Закрытие меню при клике вне
  // ============================================
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.desktop-nav')) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        if (menu) menu.classList.remove('show');
      });
    }
  });

  // ============================================
  // Keyboard Navigation (Accessibility)
  // ============================================
  desktopNav.addEventListener('keydown', function(e) {
    const focusedElement = document.activeElement;
    const isDropdownToggle = focusedElement.classList.contains('dropdown-toggle');

    // Enter или Space на dropdown toggle
    if ((e.key === 'Enter' || e.key === ' ') && isDropdownToggle) {
      e.preventDefault();
      focusedElement.click();
    }

    // Escape закрывает открытые меню
    if (e.key === 'Escape') {
      const openDropdown = focusedElement.closest('.dropdown.show, .dropdown-submenu.show');
      if (openDropdown) {
        openDropdown.classList.remove('show');
        const toggle = openDropdown.querySelector('.dropdown-toggle');
        const menu = openDropdown.querySelector('.dropdown-menu');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
        if (menu) menu.classList.remove('show');
      }
    }
  });

  // ============================================
  // Плавная прокрутка для якорных ссылок
  // ============================================
  const anchorLinks = desktopNav.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Плавная прокрутка
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Обновляем URL без прокрутки
        history.pushState(null, null, targetId);
      }
    });
  });
});

// ============================================
// Sticky Header with Animation (только на главной странице)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Проверяем, что мы на главной странице
  const isHomePage = document.body.classList.contains('home') ||
                     document.body.classList.contains('front-page');

  if (!isHomePage) return; // Выходим, если не главная страница

  let lastScrollTop = 0;
  let ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Добавляем класс 'scrolled' когда прокрутили больше 100px
        if (scrollTop > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        // Скрываем header при скролле вниз, показываем при скролле вверх
        if (scrollTop > lastScrollTop && scrollTop > 150) {
          // Скролл вниз - скрываем header
          header.classList.add('header-hidden');
        } else if (scrollTop < lastScrollTop) {
          // Скролл вверх - показываем header
          header.classList.remove('header-hidden');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
      });

      ticking = true;
    }
  });
});

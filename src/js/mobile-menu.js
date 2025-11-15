/**
 * Mobile Menu - mmenu.js Style (Simplified)
 *
 * Простой подход:
 * - Используем существующие dropdown-menu из WordPress
 * - Показываем/скрываем через классы
 * - Плавная анимация slide
 */

class MobileMenu {
  constructor() {
    this.wrapper = document.querySelector('.mobile-menu-wrapper');
    this.panel = document.querySelector('.mobile-menu-panel');
    this.overlay = document.querySelector('.mobile-menu-overlay');
    this.toggleBtn = document.querySelector('.mobile-menu-toggle');
    this.closeBtn = document.querySelector('.mobile-menu-close');
    this.menuNav = document.querySelector('.mobile-menu-nav');

    if (!this.wrapper || !this.panel) return;

    this.isOpen = false;
    this.menuStack = []; // История открытых меню

    this.init();
  }

  init() {
    this.prepareMenus();
    this.bindEvents();

    // Добавляем класс после инициализации чтобы предотвратить FOUC
    this.menuNav.classList.add('mobile-menu-ready');
  }

  /**
   * Подготавливаем меню - добавляем кнопки "Назад" и стрелки для подменю
   */
  prepareMenus() {
    const dropdownMenus = this.menuNav.querySelectorAll('.dropdown-menu');

    dropdownMenus.forEach(menu => {
      // Получаем название родителя
      const parentLi = menu.closest('li');
      const parentLink = parentLi?.querySelector(':scope > a, :scope > .nav-link, :scope > .dropdown-item');
      const parentTitle = parentLink?.textContent.trim() || 'Назад';

      // Создаем кнопку "Назад"
      const backBtn = document.createElement('button');
      backBtn.className = 'mobile-menu-back';
      backBtn.innerHTML = `<span>←</span> ${parentTitle}`;
      backBtn.type = 'button';

      // Вставляем в начало меню
      menu.insertBefore(backBtn, menu.firstChild);

      // Обработчик кнопки "Назад"
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.goBack();
      });
    });

    // Добавляем стрелки для родительских элементов
    const parentItems = this.menuNav.querySelectorAll('.dropdown, .dropdown-submenu');

    parentItems.forEach(item => {
      const link = item.querySelector(':scope > a, :scope > .nav-link, :scope > .dropdown-item');
      const submenu = item.querySelector(':scope > .dropdown-menu');

      if (link && submenu) {
        // Создаем кнопку-стрелку
        const arrowBtn = document.createElement('button');
        arrowBtn.className = 'mobile-menu-arrow';
        arrowBtn.innerHTML = '›';
        arrowBtn.type = 'button';
        arrowBtn.setAttribute('aria-label', 'Открыть подменю');

        // Добавляем стрелку после ссылки
        link.parentNode.insertBefore(arrowBtn, link.nextSibling);

        // Обработчик клика по стрелке
        arrowBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openSubmenu(submenu);
        });
      }
    });
  }

  /**
   * Привязываем события
   */
  bindEvents() {
    // Открытие меню
    this.toggleBtn?.addEventListener('click', () => this.open());

    // Закрытие меню
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    // ESC закрывает
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        if (this.menuStack.length > 0) {
          this.goBack();
        } else {
          this.close();
        }
      }
    });
  }

  /**
   * Открывает мобильное меню
   */
  open() {
    this.isOpen = true;
    this.wrapper.classList.add('is-open');
    this.toggleBtn.classList.add('is-active');
    document.body.classList.add('mobile-menu-open');
    this.toggleBtn.setAttribute('aria-expanded', 'true');
  }

  /**
   * Закрывает мобильное меню
   */
  close() {
    this.isOpen = false;
    this.wrapper.classList.remove('is-open');
    this.toggleBtn.classList.remove('is-active');
    document.body.classList.remove('mobile-menu-open');
    this.toggleBtn.setAttribute('aria-expanded', 'false');

    // Закрываем все открытые подменю
    this.menuStack.forEach(menu => {
      menu.classList.remove('is-active');

      // Возвращаем обратно в оригинальное место
      if (menu.originalParent) {
        if (menu.originalNextSibling) {
          menu.originalParent.insertBefore(menu, menu.originalNextSibling);
        } else {
          menu.originalParent.appendChild(menu);
        }
      }
    });
    this.menuStack = [];

    // Убираем класс у nav
    this.menuNav.classList.remove('submenu-open');
  }

  /**
   * Открывает подменю
   */
  openSubmenu(submenu) {
    // Добавляем в стек
    this.menuStack.push(submenu);

    // ВАЖНО: Перемещаем dropdown в .mobile-menu-nav для правильного позиционирования
    // Сохраняем оригинальное местоположение для возврата
    if (!submenu.originalParent) {
      submenu.originalParent = submenu.parentElement;
      submenu.originalNextSibling = submenu.nextSibling;
    }

    // Убираем класс если был (для повторного открытия)
    submenu.classList.remove('is-active');

    // Перемещаем в .mobile-menu-nav
    this.menuNav.appendChild(submenu);

    // Двойной requestAnimationFrame для гарантированного триггера transition
    // Первый - ждём пересчёта layout после appendChild
    // Второй - добавляем класс для триггера transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        submenu.classList.add('is-active');
        this.menuNav.classList.add('submenu-open');
      });
    });
  }

  /**
   * Возврат назад
   */
  goBack() {
    if (this.menuStack.length === 0) return;

    const lastMenu = this.menuStack.pop();
    lastMenu.classList.remove('is-active');

    // Возвращаем dropdown обратно в оригинальное место после анимации
    setTimeout(() => {
      if (lastMenu.originalParent) {
        if (lastMenu.originalNextSibling) {
          lastMenu.originalParent.insertBefore(lastMenu, lastMenu.originalNextSibling);
        } else {
          lastMenu.originalParent.appendChild(lastMenu);
        }
      }
    }, 400); // Ждём окончания transition

    if (this.menuStack.length === 0) {
      this.menuNav.classList.remove('submenu-open');
    }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  window.mobileMenu = new MobileMenu();

  // Удаляем inline FOUC prevention стили после инициализации
  // Это нужно делать всегда, даже если mobile menu не найдено
  const foucStyle = document.getElementById('fouc-prevention');
  if (foucStyle) {
    foucStyle.remove();
  }
});

export default MobileMenu;

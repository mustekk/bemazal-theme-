<?php

/**
 * WP_Bootstrap_5_3_Navwalker
 * Совместим с Bootstrap 5.3 (navbar + dropdowns, 3+ уровней)
 */
if (!class_exists('WP_Bootstrap_5_3_Navwalker')) :

    class WP_Bootstrap_5_3_Navwalker extends Walker_Nav_Menu
    {

        /** Разрешённые классы выравнивания выпадающих меню */
        private array $dropdown_align_classes = [
            'dropdown-menu-start', 'dropdown-menu-end',
            'dropdown-menu-sm-start', 'dropdown-menu-sm-end',
            'dropdown-menu-md-start', 'dropdown-menu-md-end',
            'dropdown-menu-lg-start', 'dropdown-menu-lg-end',
            'dropdown-menu-xl-start', 'dropdown-menu-xl-end',
            'dropdown-menu-xxl-start', 'dropdown-menu-xxl-end',
        ];

        /** Помечается текущий элемент для проброса классов выравнивания в start_lvl */
        private $current_item_for_lvl = null;

        /** Добавляем <ul> для подменю */
        public function start_lvl(&$output, $depth = 0, $args = null)
        {
            $indent = str_repeat("\t", $depth);
            $classes = ['dropdown-menu', "depth_$depth"];

            // Пробрасываем возможные классы выравнивания с <li>
            if ($this->current_item_for_lvl && !empty($this->current_item_for_lvl->classes)) {
                foreach ((array)$this->current_item_for_lvl->classes as $class) {
                    if (in_array($class, $this->dropdown_align_classes, true)) {
                        $classes[] = $class;
                    }
                }
            }

            // Поддержка RTL: если html[dir="rtl"], можно повесить .dropstart на родителя в разметке.
            $output .= "\n$indent<ul class=\"" . esc_attr(implode(' ', $classes)) . "\" data-bs-popper=\"static\">\n";
        }

        /** Закрываем <ul> подменю */
        public function end_lvl(&$output, $depth = 0, $args = null)
        {
            $indent = str_repeat("\t", $depth);
            $output .= "$indent</ul>\n";
        }

        /** Элемент меню <li> + <a> */
        public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0)
        {
            $this->current_item_for_lvl = $item; // для start_lvl()

            $has_children = !empty($args->has_children);
            $indent = ($depth) ? str_repeat("\t", $depth) : '';

            // Классы <li>
            $classes = empty($item->classes) ? [] : (array)$item->classes;
            $classes[] = "menu-item-{$item->ID}";

            if ($depth === 0) {
                $classes[] = 'nav-item';
                if ($has_children) {
                    $classes[] = 'dropdown';
                }
            } else {
                if ($has_children) {
                    // свой класс маркера вложенного дропдауна (для CSS/JS)
                    $classes[] = 'dropdown-submenu';
                }
            }

            // Активность
            if (
                in_array('current-menu-item', $classes, true) ||
                in_array('current-menu-parent', $classes, true) ||
                in_array('current-menu-ancestor', $classes, true)
            ) {
                $classes[] = 'active';
            }

            $class_names = esc_attr(implode(' ', array_filter($classes)));
            $item_id = esc_attr('menu-item-' . $item->ID);

            $output .= $indent . '<li id="' . $item_id . '" class="' . $class_names . '">';

            // Атрибуты ссылки
            $atts = [];
            $atts['title'] = !empty($item->attr_title) ? $item->attr_title : '';
            $atts['target'] = !empty($item->target) ? $item->target : '';
            $atts['rel'] = !empty($item->xfn) ? $item->xfn : '';
            $atts['href'] = !empty($item->url) ? $item->url : '';

            // Классы ссылки
            if ($depth === 0) {
                $link_classes = ['nav-link'];
                if ($has_children) {
                    $link_classes[] = 'dropdown-toggle';
                    $atts['data-bs-toggle'] = 'dropdown';
                    $atts['role'] = 'button';
                    $atts['aria-expanded'] = 'false';
                    $atts['aria-haspopup'] = 'true';
                }
            } else {
                $link_classes = ['dropdown-item'];
                if ($has_children) {
                    $link_classes[] = 'dropdown-toggle';
                    $atts['data-bs-toggle'] = 'dropdown';
                    $atts['role'] = 'button';
                    $atts['aria-expanded'] = 'false';
                    $atts['aria-haspopup'] = 'true';
                }
            }

            if (in_array('active', $classes, true)) {
                $link_classes[] = 'active';
                $atts['aria-current'] = 'page';
            }

            $atts['class'] = implode(' ', $link_classes);

            // Сборка атрибутов
            $attributes = '';
            foreach ($atts as $attr => $value) {
                if ($value === '') continue;
                $value = ($attr === 'href') ? esc_url($value) : esc_attr($value);
                $attributes .= " $attr=\"$value\"";
            }

            $title = apply_filters('the_title', $item->title, $item->ID);

            // Dropdown-header / divider по классам WP
            $is_header = in_array('dropdown-header', $classes, true);
            $is_divider = in_array('dropdown-divider', $classes, true);

            $item_html = $args->before ?? '';

            if ($is_divider) {
                $item_html .= '<hr class="dropdown-divider">';
            } elseif ($is_header) {
                $item_html .= '<h6 class="dropdown-header">' . esc_html($title) . '</h6>';
            } else {
                $item_html .= '<a' . $attributes . '>';
                $item_html .= ($args->link_before ?? '') . $title . ($args->link_after ?? '');
                $item_html .= '</a>';
            }

            $item_html .= $args->after ?? '';

            // Для корректной работы start_lvl мы должны прокинуть текущий item в $args
            $args->item = $item;

            $output .= apply_filters('walker_nav_menu_start_el', $item_html, $item, $depth, $args);
        }

        /** Закрываем li */
        public function end_el(&$output, $item, $depth = 0, $args = null)
        {
            $output .= "</li>\n";
        }

        /**
         * Очень важно: переопределяем display_element, чтобы $args->has_children был корректен
         */
        public function display_element($element, &$children_elements, $max_depth, $depth, $args, &$output)
        {
            if (!$element) return;

            $id_field = $this->db_fields['id'];
            // Флаг наличия детей
            if (is_object($args[0])) {
                $args[0]->has_children = !empty($children_elements[$element->$id_field]);
            }

            parent::display_element($element, $children_elements, $max_depth, $depth, $args, $output);
        }
    }

endif;

<?php
/**
 * Clear WordPress Cache and Check Block Registration
 *
 * Usage: php clear-cache.php
 */

// Load WordPress
require_once('../../../wp-load.php');

echo "🔄 Очистка кеша WordPress...\n\n";

// 1. Очистка transients
global $wpdb;
$deleted = $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "✅ Удалено {$deleted} transients\n";

// 2. Очистка object cache
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
    echo "✅ Object cache очищен\n";
}

// 3. Перезагрузка rewrite rules
flush_rewrite_rules();
echo "✅ Rewrite rules обновлены\n";

// 4. Проверка регистрации блока
echo "\n📦 Проверка блока text-overlay:\n";

if (function_exists('get_dynamic_block_names')) {
    $blocks = get_dynamic_block_names();
    echo "   Найдено динамических блоков: " . count($blocks) . "\n";
}

// Проверка файла block.json
$block_json = get_template_directory() . '/gutenberg-blocks/media/text-overlay/block.json';
if (file_exists($block_json)) {
    echo "✅ block.json найден: {$block_json}\n";
    $data = json_decode(file_get_contents($block_json), true);
    if ($data) {
        echo "   Namespace: {$data['name']}\n";
        echo "   Title: {$data['title']}\n";
        echo "   Category: {$data['category']}\n";
    }
} else {
    echo "❌ block.json НЕ найден!\n";
}

// Проверка регистрации категории
$categories = get_block_categories(get_post(1));
$bemazal_category = array_filter($categories, function($cat) {
    return $cat['slug'] === 'bemazal';
});

if ($bemazal_category) {
    echo "✅ Категория 'bemazal' зарегистрирована\n";
} else {
    echo "❌ Категория 'bemazal' НЕ найдена!\n";
}

echo "\n🎯 Рекомендации:\n";
echo "1. Перезагрузи страницу редактора с Ctrl+Shift+R\n";
echo "2. Очисти кеш браузера\n";
echo "3. Открой редактор в приватном окне\n";
echo "4. Проверь консоль браузера на ошибки JavaScript\n";
echo "\n✨ Готово!\n";

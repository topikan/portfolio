<?php
// Публичная отдача контента, который редактируется в админке (работы, тарифы, FAQ, контакты, фото).
// Если файла нет — отдаём пустой объект, и сайт использует тексты по умолчанию.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
$file = __DIR__ . '/data/content.json';
echo is_file($file) ? file_get_contents($file) : '{}';

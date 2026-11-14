<?php
// Скопируй в config.php рядом с этим файлом и заполни. config.php в репозиторий НЕ попадает.
return [
	'admin_user' => 'topikan',
	// Хеш пароля: php -r "echo password_hash('ПАРОЛЬ', PASSWORD_DEFAULT);"
	'admin_hash' => '',
	'tg_token' => '',          // токен бота от @BotFather
	'tg_chat' => '',           // твой chat id
	'admin_url' => '',         // например https://example.ru/admin/
	'salt' => 'любая-случайная-строка',
	'db_file' => 'requests-случайный-суффикс.sqlite',
];

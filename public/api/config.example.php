<?php
// Скопируй в config.php рядом с этим файлом и заполни. config.php в репозиторий НЕ попадает.
return [
	'admin_user' => 'topikan',
	// Хеш пароля: php -r "echo password_hash('ПАРОЛЬ', PASSWORD_DEFAULT);"
	'admin_hash' => '',
	'tg_token' => '',          // токен бота от @BotFather
	'tg_chat' => '',           // твой chat id
	'tg_relay_url' => '',      // необязательно: URL веб-приложения Google Apps Script (см. relay/google-apps-script.gs)
	'tg_relay_secret' => '',   // тот же SECRET, что в свойствах скрипта
	'admin_url' => '',         // например https://example.ru/admin/
	'salt' => 'любая-случайная-строка',
	'db_file' => 'requests-случайный-суффикс.sqlite',
];

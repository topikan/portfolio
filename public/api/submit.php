<?php
// Приём заявки с сайта: проверка → запись в базу → уведомление в Telegram.
// Заявка сохраняется в любом случае, даже если Telegram не ответил.

declare(strict_types=1);
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out(int $code, array $data): void
{
	http_response_code($code);
	echo json_encode($data, JSON_UNESCAPED_UNICODE);
	exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
	out(405, ['ok' => false, 'error' => 'method']);
}

$in = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($in)) {
	out(400, ['ok' => false, 'error' => 'bad_json']);
}

// Скрытое поле-ловушка для ботов: делаем вид, что всё принято.
if (!empty($in['botcheck'])) {
	out(200, ['ok' => true]);
}

$clip = static fn($v, int $n): string => mb_substr(trim((string) ($v ?? '')), 0, $n);
$name = $clip($in['name'] ?? '', 80);
$contact = $clip($in['contact'] ?? '', 120);
$type = $clip($in['type'] ?? '', 80);
$budget = $clip($in['budget'] ?? '', 80);
$message = $clip($in['message'] ?? '', 2000);
$lang = ($in['lang'] ?? '') === 'en' ? 'en' : 'ru';

if ($name === '' || $contact === '' || $message === '' || empty($in['consent'])) {
	out(422, ['ok' => false, 'error' => 'required']);
}

if (too_many('submit', 5, 3600)) {
	out(429, ['ok' => false, 'error' => 'rate']);
}
add_hit('submit');

$pdo = db();
$pdo->prepare('INSERT INTO requests (created_at, name, contact, type, budget, message, lang) VALUES (?, ?, ?, ?, ?, ?, ?)')
	->execute([date('Y-m-d H:i:s'), $name, $contact, $type, $budget, $message, $lang]);
$id = (int) $pdo->lastInsertId();

$text = "🆕 Новая заявка #{$id}\n\n"
	. "Имя: {$name}\n"
	. "Контакт: {$contact}\n"
	. "Тип: {$type}\n"
	. "Бюджет: {$budget}\n\n"
	. $message;
if (!empty(cfg()['admin_url'])) {
	$text .= "\n\n" . cfg()['admin_url'];
}
telegram_send($text);

out(200, ['ok' => true]);

<?php
// Общие функции для приёма заявок и админки.
// Секреты (токен бота, хеш пароля) лежат в config.php — он НЕ в репозитории.

declare(strict_types=1);

function cfg(): array
{
	static $cfg = null;
	if ($cfg === null) {
		$file = __DIR__ . '/config.php';
		if (!is_file($file)) {
			http_response_code(500);
			exit('config.php not found');
		}
		$cfg = require $file;
	}
	return $cfg;
}

function db(): PDO
{
	static $pdo = null;
	if ($pdo === null) {
		$dir = __DIR__ . '/data';
		if (!is_dir($dir)) {
			mkdir($dir, 0750, true);
		}
		// Запрет прямого доступа к базе по ссылке (Apache).
		if (!is_file($dir . '/.htaccess')) {
			file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
		}
		$name = preg_replace('/[^a-z0-9_.-]/i', '', (string) (cfg()['db_file'] ?? 'requests.sqlite'));
		$pdo = new PDO('sqlite:' . $dir . '/' . $name);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
		$pdo->exec('CREATE TABLE IF NOT EXISTS requests (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at TEXT NOT NULL,
			name TEXT NOT NULL,
			contact TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT "",
			budget TEXT NOT NULL DEFAULT "",
			message TEXT NOT NULL,
			lang TEXT NOT NULL DEFAULT "",
			status TEXT NOT NULL DEFAULT "new",
			note TEXT NOT NULL DEFAULT ""
		)');
		// Счётчики попыток (отправка формы и вход в админку) — по хешу IP, сам IP не хранится.
		$pdo->exec('CREATE TABLE IF NOT EXISTS hits (
			kind TEXT NOT NULL,
			ip_hash TEXT NOT NULL,
			at INTEGER NOT NULL
		)');
	}
	return $pdo;
}

function ip_hash(): string
{
	$ip = $_SERVER['REMOTE_ADDR'] ?? '';
	return hash('sha256', $ip . '|' . (cfg()['salt'] ?? 'salt'));
}

// true, если за $window секунд этот посетитель уже сделал $limit и более попыток вида $kind.
function too_many(string $kind, int $limit, int $window): bool
{
	$pdo = db();
	$pdo->prepare('DELETE FROM hits WHERE at < ?')->execute([time() - 86400]);
	$st = $pdo->prepare('SELECT COUNT(*) FROM hits WHERE kind = ? AND ip_hash = ? AND at > ?');
	$st->execute([$kind, ip_hash(), time() - $window]);
	return (int) $st->fetchColumn() >= $limit;
}

function add_hit(string $kind): void
{
	db()->prepare('INSERT INTO hits (kind, ip_hash, at) VALUES (?, ?, ?)')->execute([$kind, ip_hash(), time()]);
}

function clear_hits(string $kind): void
{
	db()->prepare('DELETE FROM hits WHERE kind = ? AND ip_hash = ?')->execute([$kind, ip_hash()]);
}

function h(string $s): string
{
	return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function telegram_send(string $text): bool
{
	$c = cfg();
	if (empty($c['tg_token']) || empty($c['tg_chat'])) {
		return false;
	}
	$ch = curl_init('https://api.telegram.org/bot' . $c['tg_token'] . '/sendMessage');
	curl_setopt_array($ch, [
		CURLOPT_POST => true,
		CURLOPT_POSTFIELDS => [
			'chat_id' => $c['tg_chat'],
			'text' => $text,
			'disable_web_page_preview' => true,
		],
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_TIMEOUT => 8,
	]);
	$res = curl_exec($ch);
	$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
	return $res !== false && $code === 200;
}

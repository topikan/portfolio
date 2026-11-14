<?php
// Админка заявок: вход по логину и паролю, список, статусы, заметки, удаление.

declare(strict_types=1);
require __DIR__ . '/../api/lib.php';

session_name('adm');
session_set_cookie_params([
	'lifetime' => 0,
	'path' => '/',
	'secure' => !empty($_SERVER['HTTPS']),
	'httponly' => true,
	'samesite' => 'Strict',
]);
session_start();

header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header("Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'");

const STATUSES = ['new' => 'Новая', 'work' => 'В работе', 'done' => 'Готово', 'spam' => 'Спам'];
$cfg = cfg();
$error = '';

// ---- выход
if (isset($_GET['logout'])) {
	$_SESSION = [];
	session_destroy();
	header('Location: ./');
	exit;
}

// ---- вход
if (empty($_SESSION['ok'])) {
	if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['login'])) {
		if (too_many('login', 5, 900)) {
			$error = 'Слишком много попыток. Подождите 15 минут.';
		} else {
			$userOk = hash_equals((string) $cfg['admin_user'], (string) ($_POST['user'] ?? ''));
			$passOk = password_verify((string) ($_POST['pass'] ?? ''), (string) $cfg['admin_hash']);
			if ($userOk && $passOk) {
				clear_hits('login');
				session_regenerate_id(true);
				$_SESSION['ok'] = true;
				$_SESSION['csrf'] = bin2hex(random_bytes(16));
				header('Location: ./');
				exit;
			}
			add_hit('login');
			$error = 'Неверный логин или пароль.';
		}
	}
	page_head('Вход');
	echo '<form method="post" class="login"><h1>Вход</h1>';
	if ($error) echo '<p class="err">' . h($error) . '</p>';
	echo '<label>Логин<input name="user" autocomplete="username" required autofocus></label>
	<label>Пароль<input name="pass" type="password" autocomplete="current-password" required></label>
	<button name="login" value="1">Войти</button></form></body></html>';
	exit;
}

$csrf = (string) $_SESSION['csrf'];
$pdo = db();

// ---- действия
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
	if (!hash_equals($csrf, (string) ($_POST['csrf'] ?? ''))) {
		http_response_code(403);
		exit('CSRF');
	}
	$id = (int) ($_POST['id'] ?? 0);
	$act = (string) ($_POST['act'] ?? '');
	if ($act === 'save' && isset(STATUSES[$_POST['status'] ?? ''])) {
		$pdo->prepare('UPDATE requests SET status = ?, note = ? WHERE id = ?')
			->execute([$_POST['status'], mb_substr((string) ($_POST['note'] ?? ''), 0, 2000), $id]);
	} elseif ($act === 'delete') {
		$pdo->prepare('DELETE FROM requests WHERE id = ?')->execute([$id]);
	}
	$back = './' . (isset($_GET['s']) ? '?s=' . urlencode((string) $_GET['s']) : '');
	header('Location: ' . $back . '#r' . $id);
	exit;
}

// ---- экспорт CSV
if (isset($_GET['csv'])) {
	header('Content-Type: text/csv; charset=utf-8');
	header('Content-Disposition: attachment; filename="requests.csv"');
	$f = fopen('php://output', 'w');
	fwrite($f, "\xEF\xBB\xBF");
	fputcsv($f, ['id', 'дата', 'имя', 'контакт', 'тип', 'бюджет', 'сообщение', 'статус', 'заметка']);
	foreach ($pdo->query('SELECT * FROM requests ORDER BY id DESC') as $r) {
		// Защита от формул в Excel: значения, начинающиеся с = + - @, экранируем.
		$cells = [$r['id'], $r['created_at'], $r['name'], $r['contact'], $r['type'], $r['budget'], $r['message'], STATUSES[$r['status']] ?? $r['status'], $r['note']];
		$cells = array_map(static fn($v) => preg_match('/^[=+\-@]/', (string) $v) ? "'" . $v : $v, $cells);
		fputcsv($f, $cells);
	}
	exit;
}

// ---- список
$filter = isset(STATUSES[$_GET['s'] ?? '']) ? (string) $_GET['s'] : '';
$counts = array_fill_keys(array_keys(STATUSES), 0);
foreach ($pdo->query('SELECT status, COUNT(*) c FROM requests GROUP BY status') as $r) {
	$counts[$r['status']] = (int) $r['c'];
}
$st = $filter
	? $pdo->prepare('SELECT * FROM requests WHERE status = ? ORDER BY id DESC')
	: $pdo->prepare('SELECT * FROM requests ORDER BY id DESC');
$st->execute($filter ? [$filter] : []);
$rows = $st->fetchAll();

page_head('Заявки');
echo '<header><h1>Заявки</h1><nav>';
echo '<a href="./"' . ($filter === '' ? ' class="on"' : '') . '>Все (' . array_sum($counts) . ')</a>';
foreach (STATUSES as $k => $label) {
	echo '<a href="./?s=' . $k . '"' . ($filter === $k ? ' class="on"' : '') . '>' . h($label) . ' (' . $counts[$k] . ')</a>';
}
echo '<a href="./?csv=1">CSV</a><a href="./?logout=1">Выйти</a></nav></header><main>';
if (!$rows) echo '<p class="muted">Заявок пока нет.</p>';
foreach ($rows as $r) {
	$status = STATUSES[$r['status']] ?? $r['status'];
	echo '<article id="r' . (int) $r['id'] . '" class="card s-' . h($r['status']) . '"><details' . ($r['status'] === 'new' ? ' open' : '') . '><summary>'
		. '<b>#' . (int) $r['id'] . ' ' . h($r['name']) . '</b> <span class="tag">' . h($status) . '</span>'
		. '<span class="muted"> ' . h($r['created_at']) . ' · ' . h($r['type']) . '</span></summary>'
		. '<dl><dt>Контакт</dt><dd>' . h($r['contact']) . '</dd>'
		. '<dt>Тип проекта</dt><dd>' . h($r['type']) . '</dd>'
		. '<dt>Бюджет</dt><dd>' . h($r['budget']) . '</dd>'
		. '<dt>Язык сайта</dt><dd>' . h(strtoupper($r['lang'])) . '</dd>'
		. '<dt>Сообщение</dt><dd class="msg">' . nl2br(h($r['message'])) . '</dd></dl>'
		. '<form method="post" action="./' . ($filter ? '?s=' . h($filter) : '') . '"><input type="hidden" name="csrf" value="' . h($csrf) . '"><input type="hidden" name="id" value="' . (int) $r['id'] . '">'
		. '<label>Статус <select name="status">';
	foreach (STATUSES as $k => $label) {
		echo '<option value="' . $k . '"' . ($r['status'] === $k ? ' selected' : '') . '>' . h($label) . '</option>';
	}
	echo '</select></label><label>Заметка<textarea name="note" rows="2" maxlength="2000">' . h($r['note']) . '</textarea></label>'
		. '<div class="row"><button name="act" value="save">Сохранить</button>'
		. '<button name="act" value="delete" class="danger" onclick="return confirm(\'Удалить заявку навсегда?\')">Удалить</button></div></form>'
		. '</details></article>';
}
echo '</main></body></html>';

function page_head(string $title): void
{
	echo '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>' . h($title) . '</title><style>
*{box-sizing:border-box}body{margin:0;background:#060608;color:#f5f6f8;font:16px/1.5 system-ui,sans-serif}
header{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;padding:16px clamp(16px,4vw,40px);border-bottom:1px solid #222}
h1{margin:0;font-size:22px}nav{display:flex;flex-wrap:wrap;gap:8px}nav a{padding:8px 12px;border-radius:999px;border:1px solid #2a2d36;color:#c8ccd6;text-decoration:none;font-size:14px}nav a.on{background:#2f6bff;border-color:#2f6bff;color:#fff}
main{max-width:860px;margin:0 auto;padding:24px clamp(16px,4vw,40px)}.muted{color:#8b8f98;font-size:14px}
.card{margin:0 0 14px;border:1px solid #1f222a;border-radius:14px;background:#0c0d11;padding:4px 18px}.card.s-new{border-color:#2f6bff}.card.s-spam{opacity:.55}
summary{cursor:pointer;padding:14px 0;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}.tag{font-size:12px;padding:2px 8px;border-radius:999px;background:#1a1d26;color:#9db8ff}
dl{display:grid;grid-template-columns:130px 1fr;gap:6px 14px;margin:0 0 14px}dt{color:#8b8f98}dd{margin:0;word-break:break-word}.msg{white-space:normal}
form label{display:block;margin:0 0 12px;color:#8b8f98;font-size:14px}input,select,textarea{display:block;width:100%;margin-top:6px;padding:10px 12px;background:#060608;color:#f5f6f8;border:1px solid #2a2d36;border-radius:10px;font:inherit}
.row{display:flex;gap:10px;margin-bottom:16px}button{padding:10px 18px;border:0;border-radius:10px;background:#2f6bff;color:#fff;font:inherit;cursor:pointer}button.danger{background:#3a1216;color:#ff8d95}
.login{max-width:340px;margin:12vh auto;padding:0 20px}.login label{display:block;margin:0 0 14px;color:#8b8f98}.err{color:#ff8d95}
@media(max-width:560px){dl{grid-template-columns:1fr}}
</style></head><body>';
}

<?php
// Редактор контента сайта: работы, тарифы, FAQ, контакты, фото. Двуязычные поля RU/EN.
declare(strict_types=1);
require __DIR__ . '/../api/lib.php';

session_name('adm');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Strict']);
session_start();
if (empty($_SESSION['ok'])) {
	header('Location: ./');
	exit;
}
$csrf = (string) $_SESSION['csrf'];
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

$dataDir = __DIR__ . '/../api/data';
$contentFile = $dataDir . '/content.json';
$uploadDir = __DIR__ . '/../uploads';

function jout($data, int $code = 200): void
{
	http_response_code($code);
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($data, JSON_UNESCAPED_UNICODE);
	exit;
}

function clean_str($v, int $max = 2000): string
{
	return mb_substr(trim((string) $v), 0, $max);
}

function clean_bi($v, int $max = 2000): array
{
	$v = is_array($v) ? $v : [];
	return ['ru' => clean_str($v['ru'] ?? '', $max), 'en' => clean_str($v['en'] ?? '', $max)];
}

function clean_url($v): string
{
	$v = clean_str($v, 500);
	if ($v === '') return '';
	if (preg_match('#^(https?://|/)[^\s"\'<>]*$#i', $v) && !str_starts_with($v, '//')) return $v;
	return '';
}

// ---- API
$action = (string) ($_GET['a'] ?? '');
if ($action !== '') {
	$sent = (string) ($_SERVER['HTTP_X_CSRF'] ?? '');
	if (!hash_equals($csrf, $sent)) jout(['ok' => false, 'error' => 'csrf'], 403);

	if ($action === 'save' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
		$in = json_decode((string) file_get_contents('php://input'), true);
		if (!is_array($in)) jout(['ok' => false, 'error' => 'bad json'], 400);
		$out = [];
		if (isset($in['works']) && is_array($in['works'])) {
			$out['works'] = [];
			foreach (array_slice($in['works'], 0, 60) as $w) {
				$tags = is_array($w['tags'] ?? null) ? $w['tags'] : [];
				$out['works'][] = [
					'title' => clean_bi($w['title'] ?? [], 200),
					'description' => clean_bi($w['description'] ?? [], 600),
					'tags' => array_values(array_filter(array_map(static fn($t) => clean_str($t, 30), array_slice($tags, 0, 10)))),
					'image' => clean_url($w['image'] ?? ''),
					'url' => clean_url($w['url'] ?? ''),
				];
			}
		}
		if (isset($in['plans']) && is_array($in['plans'])) {
			$out['plans'] = [];
			foreach (array_slice($in['plans'], 0, 8) as $p) {
				$feat = is_array($p['features'] ?? null) ? $p['features'] : [];
				$plan = clean_str($p['plan'] ?? '', 20);
				$out['plans'][] = [
					'plan' => in_array($plan, ['landing', 'site', 'frontend', 'other'], true) ? $plan : 'other',
					'featured' => !empty($p['featured']),
					'name' => clean_bi($p['name'] ?? [], 120),
					'price' => clean_bi($p['price'] ?? [], 80),
					'time' => clean_bi($p['time'] ?? [], 80),
					'features' => array_map(static fn($f) => clean_bi($f, 200), array_slice($feat, 0, 12)),
				];
			}
		}
		if (isset($in['terms']) && is_array($in['terms'])) {
			$out['terms'] = array_map(static fn($f) => clean_bi($f, 300), array_slice($in['terms'], 0, 10));
		}
		if (isset($in['faq']) && is_array($in['faq'])) {
			$out['faq'] = [];
			foreach (array_slice($in['faq'], 0, 40) as $f) {
				$out['faq'][] = ['q' => clean_bi($f['q'] ?? [], 300), 'a' => clean_bi($f['a'] ?? [], 3000)];
			}
		}
		if (isset($in['contacts']) && is_array($in['contacts'])) {
			$out['contacts'] = [];
			foreach (['telegram', 'email', 'whatsapp', 'linkedin', 'upwork', 'github'] as $k) {
				$val = clean_str($in['contacts'][$k] ?? '', 200);
				if ($k === 'upwork') $val = clean_url($val);
				else $val = preg_replace('/[\s"\'<>\/\\\\]/u', '', $val);
				$out['contacts'][$k] = $val;
			}
		}
		if (array_key_exists('photo', $in)) {
			$out['photo'] = clean_url($in['photo']); // пустая строка = фото скрыто
		}
		if (!is_dir($dataDir)) mkdir($dataDir, 0750, true);
		if (is_file($contentFile)) @copy($contentFile, $dataDir . '/content.prev.json'); // одна резервная копия
		$ok = file_put_contents($contentFile, json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
		jout(['ok' => $ok]);
	}

	if ($action === 'reset' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
		if (is_file($contentFile)) @copy($contentFile, $dataDir . '/content.prev.json');
		@unlink($contentFile);
		jout(['ok' => true]);
	}

	if ($action === 'upload' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
		$f = $_FILES['file'] ?? null;
		if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK) jout(['ok' => false, 'error' => 'Файл не загрузился'], 400);
		if ($f['size'] > 6 * 1024 * 1024) jout(['ok' => false, 'error' => 'Файл больше 6 МБ'], 400);
		$info = @getimagesize($f['tmp_name']);
		$types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
		if (!$info || !isset($types[$info[2]])) jout(['ok' => false, 'error' => 'Нужна картинка JPG, PNG или WebP'], 400);
		if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
		// В папке загрузок запрещаем выполнение скриптов.
		if (!is_file($uploadDir . '/.htaccess')) {
			file_put_contents($uploadDir . '/.htaccess', "Options -Indexes -ExecCGI\nRemoveHandler .php .phtml .php3 .php4 .php5 .php7 .phps\nphp_flag engine off\n<FilesMatch \"\\.(php|phtml|phar)$\">\nRequire all denied\n</FilesMatch>\n");
		}
		$name = date('ymd-His') . '-' . bin2hex(random_bytes(3)) . '.' . $types[$info[2]];
		if (!move_uploaded_file($f['tmp_name'], $uploadDir . '/' . $name)) jout(['ok' => false, 'error' => 'Не удалось сохранить файл'], 500);
		jout(['ok' => true, 'url' => '/uploads/' . $name]);
	}

	if ($action === 'translate' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
		$in = json_decode((string) file_get_contents('php://input'), true);
		$cfgv = cfg();
		if (empty($cfgv['tg_relay_url'])) jout(['ok' => false, 'error' => 'Реле не настроено'], 400);
		$texts = is_array($in['texts'] ?? null) ? array_slice($in['texts'], 0, 40) : [];
		$from = ($in['from'] ?? 'ru') === 'en' ? 'en' : 'ru';
		$to = $from === 'ru' ? 'en' : 'ru';
		[$res, $code, $err] = http_post($cfgv['tg_relay_url'], [
			CURLOPT_POSTFIELDS => json_encode(['secret' => $cfgv['tg_relay_secret'] ?? '', 'action' => 'translate', 'from' => $from, 'to' => $to, 'texts' => array_map(static fn($t) => clean_str($t, 3000), $texts)], JSON_UNESCAPED_UNICODE),
			CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
		]);
		$j = json_decode((string) $res, true);
		if (!is_array($j) || empty($j['ok']) || !is_array($j['texts'] ?? null)) jout(['ok' => false, 'error' => 'Переводчик недоступен (' . $code . ')'], 502);
		jout(['ok' => true, 'texts' => $j['texts']]);
	}
	jout(['ok' => false, 'error' => 'unknown'], 404);
}

// ---- страница
$defaults = is_file(__DIR__ . '/../content-defaults.json') ? file_get_contents(__DIR__ . '/../content-defaults.json') : '{}';
$current = is_file($contentFile) ? file_get_contents($contentFile) : '{}';
$canTranslate = !empty(cfg()['tg_relay_url']);
?><!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Редактор сайта</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#060608;color:#f5f6f8;font:16px/1.5 system-ui,sans-serif}
header{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;padding:16px clamp(16px,4vw,40px);border-bottom:1px solid #222;position:sticky;top:0;background:#060608;z-index:5}
h1{margin:0;font-size:22px}nav{display:flex;flex-wrap:wrap;gap:8px}nav a,nav button.tab{padding:8px 12px;border-radius:999px;border:1px solid #2a2d36;color:#c8ccd6;text-decoration:none;font-size:14px;background:none;cursor:pointer;font-family:inherit}nav .on{background:#2f6bff;border-color:#2f6bff;color:#fff}
main{max-width:900px;margin:0 auto;padding:24px clamp(16px,4vw,40px) 120px}
.box{border:1px solid #1f222a;border-radius:14px;background:#0c0d11;padding:16px 18px;margin:0 0 14px}
.box h3{margin:0 0 10px;font-size:16px}.muted{color:#8b8f98;font-size:14px}
label{display:block;margin:0 0 12px;color:#8b8f98;font-size:13px}
input[type=text],input[type=url],textarea,select{display:block;width:100%;margin-top:5px;padding:10px 12px;background:#060608;color:#f5f6f8;border:1px solid #2a2d36;border-radius:10px;font:inherit;font-size:15px}
textarea{min-height:70px;resize:vertical}
.two{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
button{padding:9px 16px;border:0;border-radius:10px;background:#2f6bff;color:#fff;font:inherit;font-size:14px;cursor:pointer}
button.ghost{background:#1a1d26;color:#c8ccd6}button.danger{background:#3a1216;color:#ff8d95}button:disabled{opacity:.5}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.bar{position:fixed;left:0;right:0;bottom:0;background:#0c0d11;border-top:1px solid #222;padding:12px clamp(16px,4vw,40px);display:flex;gap:12px;align-items:center;justify-content:space-between;z-index:6}
.thumb{width:140px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #2a2d36;background:#111}.photo{width:160px;height:160px;object-fit:cover;border-radius:12px;border:1px solid #2a2d36}
.img-row{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.lang{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;background:#1a1d26;color:#9db8ff;margin-right:6px}
.msg{color:#7ee2a8}.err{color:#ff8d95}
.feat{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:start;margin-bottom:6px}.feat input{margin-top:0}
@media(max-width:640px){.two,.feat{grid-template-columns:1fr}}
</style></head><body>
<header><h1>Редактор сайта</h1><nav id="tabs">
<a href="./">← Заявки</a>
<button class="tab on" data-tab="works">Работы</button><button class="tab" data-tab="plans">Тарифы</button><button class="tab" data-tab="faq">FAQ</button><button class="tab" data-tab="contacts">Контакты</button><button class="tab" data-tab="photo">Фото</button>
<a href="/" target="_blank">Сайт ↗</a></nav></header>
<main id="app"></main>
<div class="bar"><span id="status" class="muted">Загрузка…</span><span class="row"><button class="ghost" id="reset">Сбросить к исходным</button><button id="save">Сохранить на сайт</button></span></div>
<script>
const CSRF = <?= json_encode($csrf) ?>;
const DEFAULTS = <?= json_encode(json_decode($defaults, true) ?: new stdClass, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
const SAVED = <?= json_encode(json_decode($current, true) ?: new stdClass, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
const CAN_TRANSLATE = <?= $canTranslate ? 'true' : 'false' ?>;
const KEYS = ['works','plans','terms','faq','contacts','photo'];
// Рабочая копия: сохранённое, а чего нет — берём исходное с сайта.
const data = {};
KEYS.forEach(k => { data[k] = structuredClone(SAVED[k] !== undefined ? SAVED[k] : DEFAULTS[k]); });
if (data.photo === undefined) data.photo = DEFAULTS.photo;
let tab = 'works', dirty = false;
const $ = (s, r=document) => r.querySelector(s);
const app = $('#app'), statusEl = $('#status');
function setDirty(v){ dirty=v; statusEl.className='muted'; statusEl.textContent = v ? 'Есть несохранённые изменения.' : 'Все изменения сохранены.'; }
function el(tag, attrs={}, ...kids){ const n=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==='class')n.className=v; else if(k.startsWith('on'))n.addEventListener(k.slice(2),v); else if(v!==false&&v!==undefined)n.setAttribute(k,v);} kids.flat().forEach(c=>n.append(c instanceof Node?c:document.createTextNode(c))); return n; }
function touch(){ setDirty(true); }

// Поле: строка / многострочное, привязано к obj[key]
function field(label, obj, key, opts={}){
  const inp = opts.area ? el('textarea',{}) : el('input',{type: opts.type||'text'});
  inp.value = obj[key] ?? '';
  inp.addEventListener('input', ()=>{ obj[key]=inp.value; touch(); });
  return el('label',{}, label, inp);
}
// Двуязычное поле: два input RU/EN (obj[key] = {ru,en})
function bi(label, obj, key, opts={}){
  obj[key] = obj[key] && typeof obj[key]==='object' ? obj[key] : {ru:'',en:''};
  const mk = (lang)=>{ const i = opts.area ? el('textarea',{}) : el('input',{type:'text'}); i.value = obj[key][lang]||''; i.addEventListener('input',()=>{obj[key][lang]=i.value;touch();}); i.dataset.lang=lang; return i; };
  const ru = mk('ru'), en = mk('en');
  const wrap = el('div',{class:'two'},
    el('label',{}, el('span',{class:'lang'},'RU'), label, ru),
    el('label',{}, el('span',{class:'lang'},'EN'), label, en));
  wrap._ru = ru; wrap._en = en; wrap._obj = obj[key];
  return wrap;
}
// Перевод всех пустых/любых EN-полей внутри контейнера по RU
async function translateIn(container, btn, force){
  if(!CAN_TRANSLATE){ alert('Автоперевод не настроен'); return; }
  const pairs = [...container.querySelectorAll('.two')].filter(w=>w._ru && w._ru.value.trim() && (force || !w._en.value.trim()));
  if(!pairs.length){ btn.textContent='Нечего переводить'; setTimeout(()=>btn.textContent=btn._t,1500); return; }
  btn.disabled=true; btn.textContent='Перевожу…';
  try{
    const r = await fetch('?a=translate',{method:'POST',headers:{'X-CSRF':CSRF,'Content-Type':'application/json'},body:JSON.stringify({from:'ru',texts:pairs.map(w=>w._ru.value)})});
    const j = await r.json();
    if(!j.ok) throw new Error(j.error||'ошибка');
    pairs.forEach((w,i)=>{ w._en.value=j.texts[i]||''; w._obj.en=w._en.value; });
    touch();
  }catch(e){ alert('Не получилось перевести: '+e.message); }
  btn.disabled=false; btn.textContent=btn._t;
}
function trBtn(container){ const b=el('button',{class:'ghost',type:'button',onclick:()=>translateIn(container,b,false)},'Перевести пустые EN автоматически'); b._t=b.textContent; return b; }

async function upload(file){
  const fd=new FormData(); fd.append('file',file);
  const r=await fetch('?a=upload',{method:'POST',headers:{'X-CSRF':CSRF},body:fd}); const j=await r.json();
  if(!j.ok) throw new Error(j.error||'ошибка'); return j.url;
}
function imagePicker(obj,key,cls){
  const img = el('img',{class:cls}); const set=()=>{ img.src=obj[key]||''; img.style.visibility=obj[key]?'visible':'hidden'; }; set();
  const file = el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',style:'display:none'});
  const msg = el('span',{class:'muted'});
  file.addEventListener('change', async()=>{ if(!file.files[0])return; msg.textContent='Загружаю…'; try{ obj[key]=await upload(file.files[0]); set(); touch(); msg.textContent='Загружено — не забудь «Сохранить на сайт».'; }catch(e){ msg.className='err'; msg.textContent=e.message; } file.value=''; });
  return {img, ctrls: el('div',{}, el('div',{class:'row'}, el('button',{class:'ghost',type:'button',onclick:()=>file.click()},'Загрузить картинку'), obj[key]!==undefined ? el('button',{class:'danger',type:'button',onclick:()=>{obj[key]='';set();touch();}},'Убрать') : ''), msg, file)};
}

function moveBtns(arr,i,rerender){
  return [ el('button',{class:'ghost',type:'button',disabled:i===0,onclick:()=>{[arr[i-1],arr[i]]=[arr[i],arr[i-1]];touch();rerender();}},'↑'),
           el('button',{class:'ghost',type:'button',disabled:i===arr.length-1,onclick:()=>{[arr[i+1],arr[i]]=[arr[i],arr[i+1]];touch();rerender();}},'↓') ];
}

const views = {
  works(){
    const box = el('div');
    box.append(el('p',{class:'muted'},'Карточки в блоке «Работы». Порядок — как здесь. Если убрать все — блок покажет пустые заготовки.'));
    data.works.forEach((w,i)=>{
      const c = el('div',{class:'box'});
      c.append(el('h3',{}, `Проект ${i+1}`));
      c.append(bi('Название',w,'title'), bi('Описание',w,'description',{area:true}));
      const tagsObj = { v:(w.tags||[]).join(', ') };
      const tg = field('Технологии через запятую (например: HTML, SCSS, JS)', tagsObj,'v'); tg.querySelector('input').addEventListener('input',()=>{ w.tags=tagsObj.v.split(',').map(s=>s.trim()).filter(Boolean); });
      c.append(tg, field('Ссылка на проект (https://…)', w,'url'));
      const ip = imagePicker(w,'image','thumb'); c.append(el('div',{class:'img-row'}, ip.img, ip.ctrls));
      c.append(el('div',{class:'row'}, trBtn(c), ...moveBtns(data.works,i,render), el('button',{class:'danger',type:'button',onclick:()=>{ if(confirm('Удалить проект?')){ data.works.splice(i,1); touch(); render(); } }},'Удалить')));
      box.append(c);
    });
    box.append(el('button',{type:'button',onclick:()=>{ data.works.push({title:{ru:'',en:''},description:{ru:'',en:''},tags:[],image:'',url:''}); touch(); render(); }},'+ Добавить проект'));
    return box;
  },
  plans(){
    const box = el('div');
    box.append(el('p',{class:'muted'},'Карточки тарифов. «Тип» связывает кнопку «Заказать» с выбором типа проекта в форме.'));
    data.plans.forEach((p,i)=>{
      const c = el('div',{class:'box'});
      c.append(el('h3',{}, `Тариф ${i+1}`));
      c.append(bi('Название',p,'name'), bi('Цена',p,'price'), bi('Срок',p,'time'));
      p.features = p.features||[];
      c.append(el('div',{class:'muted'},'Что входит:'));
      p.features.forEach((f,j)=>{
        const fw = bi('Пункт',p.features,j);
        fw.append(el('div',{class:'row'}, el('button',{class:'danger',type:'button',onclick:()=>{p.features.splice(j,1);touch();render();}},'Удалить пункт')));
        c.append(fw);
      });
      c.append(el('div',{class:'row'}, el('button',{class:'ghost',type:'button',onclick:()=>{p.features.push({ru:'',en:''});touch();render();}},'+ Пункт')));
      const sel = el('select',{}, ...[['landing','Лендинг'],['site','Сайт для бизнеса'],['frontend','Вёрстка по Figma'],['other','Другое']].map(([v,l])=>el('option',{value:v},l)));
      sel.value=p.plan||'other'; sel.addEventListener('change',()=>{p.plan=sel.value;touch();});
      const feat = el('input',{type:'checkbox'}); feat.checked=!!p.featured; feat.addEventListener('change',()=>{p.featured=feat.checked;touch();});
      c.append(el('label',{},'Тип проекта в форме', sel), el('label',{}, feat,' Выделить карточку как рекомендуемую'));
      c.append(el('div',{class:'row'}, trBtn(c), ...moveBtns(data.plans,i,render), el('button',{class:'danger',type:'button',onclick:()=>{ if(confirm('Удалить тариф?')){ data.plans.splice(i,1); touch(); render(); } }},'Удалить')));
      box.append(c);
    });
    box.append(el('button',{type:'button',onclick:()=>{ data.plans.push({plan:'other',featured:false,name:{ru:'',en:''},price:{ru:'',en:''},time:{ru:'',en:''},features:[]}); touch(); render(); }},'+ Добавить тариф'));
    const tb = el('div',{class:'box',style:'margin-top:18px'}, el('h3',{},'Условия под тарифами'));
    data.terms = data.terms||[];
    data.terms.forEach((t,j)=>{ const w=bi('Условие',data.terms,j); w.append(el('div',{class:'row'}, el('button',{class:'danger',type:'button',onclick:()=>{data.terms.splice(j,1);touch();render();}},'Удалить'))); tb.append(w); });
    tb.append(el('div',{class:'row'}, el('button',{class:'ghost',type:'button',onclick:()=>{data.terms.push({ru:'',en:''});touch();render();}},'+ Условие'), trBtn(tb)));
    box.append(tb);
    return box;
  },
  faq(){
    const box = el('div');
    data.faq.forEach((f,i)=>{
      const c = el('div',{class:'box'}); c.append(el('h3',{}, `Вопрос ${i+1}`));
      c.append(bi('Вопрос',f,'q'), bi('Ответ',f,'a',{area:true}));
      c.append(el('div',{class:'row'}, trBtn(c), ...moveBtns(data.faq,i,render), el('button',{class:'danger',type:'button',onclick:()=>{ if(confirm('Удалить вопрос?')){ data.faq.splice(i,1); touch(); render(); } }},'Удалить')));
      box.append(c);
    });
    box.append(el('button',{type:'button',onclick:()=>{ data.faq.push({q:{ru:'',en:''},a:{ru:'',en:''}}); touch(); render(); }},'+ Добавить вопрос'));
    return box;
  },
  contacts(){
    const c = el('div',{class:'box'}); const o=data.contacts||(data.contacts={});
    c.append(el('p',{class:'muted'},'Пустое поле — канал не показывается на сайте.'),
      field('Telegram (ник без @)',o,'telegram'), field('Email',o,'email'), field('WhatsApp (номер без + и пробелов)',o,'whatsapp'),
      field('LinkedIn (хвост ссылки после /in/)',o,'linkedin'), field('Upwork (полная ссылка)',o,'upwork'), field('GitHub (ник)',o,'github'));
    return c;
  },
  photo(){
    const c = el('div',{class:'box'}); c.append(el('h3',{},'Фото в блоке «Обо мне»'));
    const ip = imagePicker(data,'photo','photo');
    c.append(el('div',{class:'img-row'}, ip.img, ip.ctrls), el('p',{class:'muted'},'Лучше квадрат от 800×800 px. Если нажать «Убрать» и сохранить, фото на сайте скроется.'));
    return c;
  }
};
function render(){
  document.querySelectorAll('#tabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  app.replaceChildren(views[tab]());
}
document.querySelectorAll('#tabs .tab').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;render();}));
$('#save').addEventListener('click', async()=>{
  const b=$('#save'); b.disabled=true; statusEl.className='muted'; statusEl.textContent='Сохраняю…';
  try{
    const r=await fetch('?a=save',{method:'POST',headers:{'X-CSRF':CSRF,'Content-Type':'application/json'},body:JSON.stringify(data)}); const j=await r.json();
    if(!j.ok) throw new Error(j.error||'ошибка'); setDirty(false); statusEl.className='msg'; statusEl.textContent='Сохранено. Сайт уже показывает новые данные.';
  }catch(e){ statusEl.className='err'; statusEl.textContent='Не сохранилось: '+e.message; }
  b.disabled=false;
});
$('#reset').addEventListener('click', async()=>{
  if(!confirm('Вернуть всё к исходному содержимому сайта? Ваши правки будут удалены (резервная копия сохранится на сервере).')) return;
  const r=await fetch('?a=reset',{method:'POST',headers:{'X-CSRF':CSRF}}); const j=await r.json();
  if(j.ok) location.reload();
});
window.addEventListener('beforeunload',e=>{ if(dirty){ e.preventDefault(); e.returnValue=''; } });
statusEl.textContent='Выбери раздел и редактируй. Внизу — «Сохранить на сайт».';
render();
</script></body></html>

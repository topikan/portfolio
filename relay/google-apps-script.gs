/**
 * Реле «сайт → Google → Telegram».
 * Нужно, если хостинг не достучивается до api.telegram.org: запрос на Google проходит,
 * а в Telegram отправляет уже сервер Google.
 *
 * Настройка: Project Settings → Script properties:
 *   SECRET   — любая длинная случайная строка (та же будет в секрете GitHub TG_RELAY_SECRET)
 *   TG_TOKEN — токен бота от @BotFather
 *   TG_CHAT  — твой chat id
 */
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var out = function (obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  };
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data.secret || data.secret !== props.getProperty('SECRET')) return out({ ok: false, error: 'forbidden' });
    if (data.action === 'translate') {
      var texts = (data.texts || []).map(function (t) {
        return t ? LanguageApp.translate(String(t), data.from || 'ru', data.to || 'en') : '';
      });
      return out({ ok: true, texts: texts });
    }
    var url = 'https://api.telegram.org/bot' + props.getProperty('TG_TOKEN') + '/sendMessage';
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: props.getProperty('TG_CHAT'), text: String(data.text || '').slice(0, 4000), disable_web_page_preview: true }),
      muteHttpExceptions: true,
    });
    return out({ ok: res.getResponseCode() === 200, status: res.getResponseCode() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

// Проверка из браузера: открой URL веб-приложения — должно показать "relay alive".
function doGet() {
  return ContentService.createTextOutput('relay alive');
}

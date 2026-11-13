// src/config.js
//
// ЕДИНОЕ МЕСТО ДЛЯ ТВОИХ ДАННЫХ. Заполни — и всё остальное подхватится само.
// Пустая строка '' = канал не показывается на сайте.
// Здесь только то, что и так публично (ники, почта, публичный ключ формы).
// Секретные токены (например, токен Telegram-бота) сюда НЕЛЬЗЯ — они видны всем.

export const CONTACTS = {
	telegram: '', // ник без @, например 'rodion_dev'
	email: '', // например 'hello@example.com'
	whatsapp: '', // номер в международном формате без + и пробелов, например '375291234567'
	linkedin: '', // хвост ссылки: https://www.linkedin.com/in/<ЭТО>
	upwork: '', // полная ссылка на профиль, если есть
	github: '', // https://github.com/<ЭТО> (необязательно)
};

// Форма заявки: публичный ключ Web3Forms (бесплатно, https://web3forms.com —
// вводишь почту, на неё приходит ключ, письма с заявками идут на эту почту).
// Пока ключа нет, кнопка формы откроет почтовую программу (нужен CONTACTS.email).
export const FORM = {
	web3formsKey: '',
};

// Аналитика без cookie. Пример для Plausible:
//   src: 'https://plausible.io/js/script.js', attrs: { 'data-domain': 'topikan.github.io' }
// Пример для Umami:
//   src: 'https://cloud.umami.is/script.js', attrs: { 'data-website-id': '...' }
export const ANALYTICS = {
	src: '',
	attrs: {},
};

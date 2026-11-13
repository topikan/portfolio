// src/js/i18n.js
//
// i18n + плавная анимация высоты .hero__content при смене языка (GSAP FLIP).
// Работает по атрибутам data-i18n, расставленным в index.html.
//
// Как добавить новый переводимый текст:
// 1. В index.html повесь data-i18n="ключ" на нужный элемент.
// 2. Добавь этот ключ в оба словаря ниже (en и ru).
//
// Если у элемента есть вложенный .hero__cta-text (как в кнопках hero__cta),
// текст подставляется именно в него, чтобы не затереть соседнюю иконку-стрелку.

import { flipHeight } from './utils/animate.js';
import { sectionTranslations } from './i18n-sections.js';

const STORAGE_KEY = 'site-lang';
const CONTENT_SELECTOR = '.hero__content';

const translations = {
	en: {
		'nav.about': 'About',
		'nav.services': 'Services',
		'nav.work': 'Works',
		'nav.contact': 'Contact',
		'nav.pricing': 'Pricing',
		'nav.cta': 'Let\u2019s talk',

		'hero.eyebrow': 'HEY, I\u2019M RODION.',
		'hero.title.line1': 'WEBSITES THAT',
		'hero.title.line2': 'BRING CLIENTS.',
		'hero.description':
			'Landing pages and websites for small businesses and startups: fast, responsive and built to turn visitors into enquiries. Launch from 5 days.',
		'hero.cta.primary': 'Discuss your project',
		'hero.cta.secondary': 'View my work',
		'hero.meta': 'WEB DEVELOPER',
		'hero.scroll': 'SCROLL',

		'services.eyebrow': 'WHAT I DO',
		'services.title.line1': 'I BUILD DIGITAL',
		'services.title.line2': 'EXPERIENCES.',
		'services.intro':
			'I help businesses and individuals bring their ideas to life through modern, fast and responsive web interfaces.',
		'services.quality.label': 'FOCUS ON QUALITY',
		'services.quality.text': 'Clean code. Smooth animations. Perfect responsiveness. That\u2019s my standard.',
		'services.cta': 'View all works',
		'services.footer.line1': 'SEE REAL PROJECTS',
		'services.footer.line2': 'I\u2019VE WORKED ON',

		'a11y.skip': 'Skip to content',
		'a11y.home': 'ON \u2014 Rodion, home',
		'a11y.nav': 'Main navigation',
		'a11y.mobileNav': 'Mobile navigation',
		'a11y.lang': 'Language',
		'a11y.menuOpen': 'Open menu',
		'a11y.menuClose': 'Close menu',
		'a11y.hero': 'Introduction',
		'a11y.services': 'Services',
		'a11y.servicesList': 'Services list',

		'works.back': 'Back',
		'works.eyebrow': 'PORTFOLIO',
		'works.title.line1': 'SELECTED',
		'works.title.line2': 'WORKS',
		'works.note':
			'My projects will appear here soon. These templates are ready and waiting for their first cases.',
		'works.card.soon': 'COMING SOON',
		'works.card.title': 'Project name',
		'works.card.desc': 'A short description of the project and the result it delivered.',
		'works.card.cta': 'View project',

		'meta.title': 'Rodion \u2014 Websites for business that bring clients',
		'meta.description':
			'Rodion \u2014 web developer. Landing pages and business websites for small businesses and startups: fast, responsive, from $200, launch from 5 days.',
	},

	ru: {
		'nav.about': 'Обо мне',
		'nav.services': 'Услуги',
		'nav.work': 'Работы',
		'nav.contact': 'Контакты',
		'nav.pricing': 'Цены',
		'nav.cta': 'Обсудим проект',

		'hero.eyebrow': 'ПРИВЕТ, Я РОДИОН.',
		'hero.title.line1': 'САЙТЫ, КОТОРЫЕ',
		'hero.title.line2': 'ПРИВОДЯТ КЛИЕНТОВ.',
		'hero.description':
			'Лендинги и сайты для малого бизнеса и стартапов: быстрые, адаптивные, заточенные под то, чтобы посетитель оставил заявку. Запуск от 5 дней.',
		'hero.cta.primary': 'Обсудить проект',
		'hero.cta.secondary': 'Мои работы',
		'hero.meta': 'ВЕБ-РАЗРАБОТЧИК',
		'hero.scroll': 'СКРОЛЛ',

		'services.eyebrow': 'ЧТО Я ДЕЛАЮ',
		'services.title.line1': 'Я СОЗДАЮ ЦИФРОВЫЕ',
		'services.title.line2': 'ПРОДУКТЫ.',
		'services.intro':
			'Помогаю бизнесам и людям воплощать идеи через современные, быстрые и адаптивные веб-интерфейсы.',
		'services.quality.label': 'ФОКУС НА КАЧЕСТВЕ',
		'services.quality.text': 'Чистый код. Плавные анимации. Идеальная адаптивность. Это мой стандарт.',
		'services.cta': 'Смотреть все работы',
		'services.footer.line1': 'РЕАЛЬНЫЕ ПРОЕКТЫ,',
		'services.footer.line2': 'НАД КОТОРЫМИ Я РАБОТАЛ',

		'a11y.skip': 'Перейти к содержимому',
		'a11y.home': 'ON — Родион, на главную',
		'a11y.nav': 'Основная навигация',
		'a11y.mobileNav': 'Мобильная навигация',
		'a11y.lang': 'Язык',
		'a11y.menuOpen': 'Открыть меню',
		'a11y.menuClose': 'Закрыть меню',
		'a11y.hero': 'Введение',
		'a11y.services': 'Услуги',
		'a11y.servicesList': 'Список услуг',

		'works.back': 'Назад',
		'works.eyebrow': 'ПОРТФОЛИО',
		'works.title.line1': 'ИЗБРАННЫЕ',
		'works.title.line2': 'РАБОТЫ',
		'works.note':
			'Здесь скоро появятся мои проекты. Эти шаблоны уже готовы и ждут первые кейсы.',
		'works.card.soon': 'СКОРО',
		'works.card.title': 'Название проекта',
		'works.card.desc': 'Короткое описание проекта и результата, которого удалось достичь.',
		'works.card.cta': 'Смотреть проект',

		'meta.title': 'Родион — сайты для бизнеса, которые приводят клиентов',
		'meta.description':
			'Родион — веб-разработчик. Лендинги и сайты для малого бизнеса и стартапов: быстро, адаптивно, от 15 000 ₽, запуск от 5 дней.',
	},
};

Object.assign(translations.en, sectionTranslations.en);
Object.assign(translations.ru, sectionTranslations.ru);

const SUPPORTED_LANGS = Object.keys(translations);
const DEFAULT_LANG = 'en';

// Перевод по ключу для JS-кода (например, подписи кнопки меню).
export function t(key) {
	const lang = document.documentElement.getAttribute('lang');
	const dict = translations[lang] || translations[DEFAULT_LANG];
	return dict[key] ?? translations[DEFAULT_LANG][key] ?? key;
}

// Язык по умолчанию — по настройкам браузера: русскоязычные (ru, be, uk, kk)
// видят русский, все остальные — английский. Сохранённый выбор важнее.
function detectBrowserLang() {
	const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
	const first = String(langs[0] || '').toLowerCase().slice(0, 2);
	return ['ru', 'be', 'uk', 'kk'].includes(first) ? 'ru' : DEFAULT_LANG;
}

function getStoredLang() {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch (e) {
		return null;
	}
}

function setStoredLang(lang) {
	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch (e) {
		// localStorage может быть недоступен (приватный режим и т.п.) — не критично.
	}
}

function setElementText(el, text) {
	// 1) Кнопки со вложенным текстовым span (+ иконка-стрелка рядом): обновляем
	//    только этот span, чтобы не потерять иконку.
	const textSpan = el.querySelector(':scope > .hero__cta-text, :scope > .services__cta-text');

	if (textSpan) {
		textSpan.textContent = text;
		return;
	}

	// 2) Элемент с вложенными тегами (например, точка-маркер .services__eyebrow-dot
	//    перед текстом): меняем только текстовый узел. Раньше здесь был
	//    el.textContent = text, который стирал вложенные теги.
	if (el.children.length > 0) {
		const textNode = Array.from(el.childNodes).find(
			(node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
		);

		if (textNode) {
			textNode.textContent = text;
		} else {
			el.append(text);
		}
		return;
	}

	// 3) Обычный элемент только с текстом.
	el.textContent = text;
}

function applyLang(lang) {
	const dict = translations[lang] || translations[DEFAULT_LANG];

	document.querySelectorAll('[data-i18n]').forEach((el) => {
		const key = el.getAttribute('data-i18n');
		const value = dict[key];

		if (value !== undefined) {
			setElementText(el, value);
		} else {
			console.warn(`[i18n] Нет перевода для ключа "${key}" в языке "${lang}"`);
		}
	});

	// Подписи для скринридеров (aria-label) переводятся так же, как текст.
	document.querySelectorAll('[data-i18n-label]').forEach((el) => {
		const value = dict[el.getAttribute('data-i18n-label')];
		if (value !== undefined) el.setAttribute('aria-label', value);
	});

	// Подсказки внутри полей формы.
	document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
		const value = dict[el.getAttribute('data-i18n-placeholder')];
		if (value !== undefined) el.setAttribute('placeholder', value);
	});

	document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
		const isActive = btn.getAttribute('data-lang-switch') === lang;
		btn.classList.toggle('is-active', isActive);
		btn.setAttribute('aria-pressed', String(isActive));
	});

	// Заголовок вкладки и описание страницы — на языке интерфейса.
	document.title = dict['meta.title'];
	document
		.querySelector('meta[name="description"]')
		?.setAttribute('content', dict['meta.description']);

	document.documentElement.setAttribute('lang', lang);
	setStoredLang(lang);

	// Сообщаем остальным модулям (например, меню), что язык сменился.
	document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

function switchLangAnimated(lang) {
	const contentEl = document.querySelector(CONTENT_SELECTOR);

	flipHeight(contentEl, () => applyLang(lang));
}

export function initI18n() {
	const stored = getStoredLang();
	const initialLang = SUPPORTED_LANGS.includes(stored) ? stored : detectBrowserLang();

	// Первое применение — мгновенно, без анимации (иначе будет дёргаться при загрузке страницы).
	applyLang(initialLang);

	document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const lang = btn.getAttribute('data-lang-switch');

			if (SUPPORTED_LANGS.includes(lang) && lang !== document.documentElement.getAttribute('lang')) {
				switchLangAnimated(lang);
			}
		});
	});
}
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

const STORAGE_KEY = 'site-lang';
const CONTENT_SELECTOR = '.hero__content';

const translations = {
	en: {
		'nav.about': 'About',
		'nav.services': 'Services',
		'nav.work': 'Works',
		'nav.contact': 'Contact',
		'nav.cta': 'Let\u2019s talk',

		'hero.eyebrow': 'HEY, I\u2019M RODION.',
		'hero.title.line1': 'LET\u2019S BUILD',
		'hero.title.line2': 'SOMETHING GREAT.',
		'hero.description':
			'Frontend developer building fast, responsive and visually expressive websites \u2014 from pixel-perfect Figma layouts to full frontend development.',
		'hero.cta.primary': 'View my work',
		'hero.cta.secondary': 'Let\u2019s talk',
		'hero.meta': 'FRONTEND DEVELOPER',
		'hero.scroll': 'SCROLL',

		'services.eyebrow': 'WHAT I DO',
		'services.title.line1': 'I BUILD DIGITAL',
		'services.title.line2': 'EXPERIENCES.',
		'services.intro':
			'I help businesses and individuals bring their ideas to life through modern, fast and responsive web interfaces.',
		'services.quality.label': 'FOCUS ON QUALITY',
		'services.quality.text': 'Clean code. Smooth animations. Perfect responsiveness. That\\u2019s my standard.',
		'services.cta': 'View all works',
		'services.footer.line1': 'SEE REAL PROJECTS',
		'services.footer.line2': 'I\\u2019VE WORKED ON',
	},

	ru: {
		'nav.about': 'Обо мне',
		'nav.services': 'Услуги',
		'nav.work': 'Работы',
		'nav.contact': 'Контакты',
		'nav.cta': 'Обсудим проект',

		'hero.eyebrow': 'ПРИВЕТ, Я РОДИОН.',
		'hero.title.line1': 'ДАВАЙТЕ СОЗДАВАТЬ',
		'hero.title.line2': 'КРАСОТУ.',
		'hero.description':
			'Frontend-разработчик. Делаю быстрые, адаптивные и визуально выразительные сайты — от pixel-perfect вёрстки по Figma до полноценной фронтенд-разработки.',
		'hero.cta.primary': 'Мои работы',
		'hero.cta.secondary': 'Связаться',
		'hero.meta': 'ФРОНТЕНД-РАЗРАБОТЧИК',
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
	},
};

const SUPPORTED_LANGS = Object.keys(translations);
const DEFAULT_LANG = 'en';

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
	// Кнопки hero__cta содержат текстовый span + span с иконкой-стрелкой.
	// Если он есть — обновляем только его, чтобы не потерять иконку.
	const textSpan = el.querySelector(':scope > .hero__cta-text');

	if (textSpan) {
		textSpan.textContent = text;
	} else {
		el.textContent = text;
	}
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

	document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
		const isActive = btn.getAttribute('data-lang-switch') === lang;
		btn.classList.toggle('is-active', isActive);
		btn.setAttribute('aria-pressed', String(isActive));
	});

	document.documentElement.setAttribute('lang', lang);
	setStoredLang(lang);
}

function switchLangAnimated(lang) {
	const contentEl = document.querySelector(CONTENT_SELECTOR);

	flipHeight(contentEl, () => applyLang(lang));
}

export function initI18n() {
	const stored = getStoredLang();
	const initialLang = SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;

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
// src/js/sections/works.js
//
// Блок "Работы": рисует сетку карточек проектов.
//
// КАК ДОБАВИТЬ СВОЙ ПРОЕКТ: впиши объект в массив PROJECTS ниже. Пока массив
// пустой, показываются 6 пустых шаблонов-заготовок. Когда проектов станет
// больше — они встанут на свои места, а недостающие до полного ряда клетки
// останутся заготовками ("скоро").

import { t } from '../i18n.js';

export const PROJECTS = [
	{
		title: { en: 'Nedetsky Prazdnik — party venue', ru: 'Недетский праздник — пространство праздников' },
		description: {
			en: 'Website for a party venue in Krasnodar: gallery, video tour, pricing, FAQ and booking.',
			ru: 'Сайт пространства праздников в Краснодаре: галерея, видеоэкскурсия, цены, FAQ и бронирование.',
		},
		tags: ['HTML', 'SCSS', 'JS', 'UI'],
		image: `${import.meta.env.BASE_URL}images/nd-prazdnik.jpg`,
		url: 'https://nd-prazdnik.com/',
	},
	{
		title: { en: 'Mainfood — catering redesign', ru: 'Mainfood — редизайн кейтеринга' },
		description: {
			en: 'Redesign concept for a catering company: services, event formats, price request in 24 hours.',
			ru: 'Концепт редизайна сайта кейтеринга: услуги, форматы мероприятий, расчёт за 24 часа.',
		},
		tags: ['HTML', 'SCSS', 'JS', 'UI'],
		image: `${import.meta.env.BASE_URL}images/mainfood.jpg`,
		url: 'https://topikan.github.io/mainfood-redesign/',
	},
	{
		title: { en: 'Vasilich Design — 3D studio', ru: 'Vasilich Design — студия 3D' },
		description: {
			en: 'Design reference for a 3D visualization studio: interactive hero, services, packages, RU/EN.',
			ru: 'Дизайн-референс сайта студии 3D-визуализации: интерактивный первый экран, услуги, пакеты, RU/EN.',
		},
		tags: ['Three.js', 'HTML', 'SCSS', 'JS'],
		image: `${import.meta.env.BASE_URL}images/vasilich-design.jpg`,
		url: 'https://topikan.github.io/vasilich-design/site/',
	},
];

const MIN_CARDS = 6; // минимум карточек в сетке
const COLUMNS = 3; // чтобы последний ряд не был неполным
const PLACEHOLDER_TAGS = ['FIGMA', 'HTML', 'SCSS', 'JS'];

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

// Берём перевод для текущего языка (или английский, если нет русского).
function pick(field) {
	if (!field) return '';
	if (typeof field === 'string') return field;
	const lang = document.documentElement.getAttribute('lang');
	return field[lang] ?? field.en ?? '';
}

function buildCard(project, index) {
	const isEmpty = !project;
	const card = el('li', `works__card${isEmpty ? ' works__card--empty' : ''}`);

	// Превью
	const thumb = el('div', 'works__thumb');
	if (project?.image) {
		const img = el('img', 'works__image');
		img.src = project.image;
		img.alt = '';
		img.loading = 'lazy';
		thumb.append(img);
	} else {
		const frame = el('div', 'works__thumb-frame');
		frame.setAttribute('aria-hidden', 'true');
		frame.append(el('span', 'works__thumb-plus', '+'));
		thumb.append(frame);
	}
	if (isEmpty) thumb.append(el('span', 'works__chip', t('works.card.soon')));

	// Текст
	const body = el('div', 'works__body');
	body.append(el('span', 'works__number', String(index + 1).padStart(2, '0')));
	body.append(el('h3', 'works__card-title', isEmpty ? t('works.card.title') : pick(project.title)));
	body.append(el('p', 'works__card-desc', isEmpty ? t('works.card.desc') : pick(project.description)));

	const tags = el('p', 'works__tags');
	tags.textContent = (project?.tags?.length ? project.tags : PLACEHOLDER_TAGS)
		.join(' \u2022 ')
		.toUpperCase();
	body.append(tags);

	// Ссылка
	const ctaText = `${t('works.card.cta')} \u2197`;
	if (project?.url) {
		const link = el('a', 'works__link', ctaText);
		link.href = project.url;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		body.append(link);
	} else {
		const link = el('span', 'works__link works__link--disabled', ctaText);
		link.setAttribute('aria-disabled', 'true');
		body.append(link);
	}

	card.append(thumb, body);
	return card;
}

export function initWorks() {
	const grid = document.querySelector('[data-works-grid]');
	if (!grid) return;

	const render = () => {
		const total = Math.max(MIN_CARDS, Math.ceil(PROJECTS.length / COLUMNS) * COLUMNS);
		const cards = Array.from({ length: total }, (_, i) => buildCard(PROJECTS[i], i));
		grid.replaceChildren(...cards);
	};

	render();
	// Язык сменился — перерисовываем тексты карточек.
	document.addEventListener('langchange', render);
}

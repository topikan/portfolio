// src/js/content.js
//
// Контент, который Родион редактирует в админке (/admin/ → «Редактор сайта»):
// работы, тарифы, FAQ, контакты, фото. Сервер отдаёт его на /api/content.php.
// Пока ответа нет (или в админке ничего не меняли) — остаются тексты по умолчанию
// из index.html и i18n.

import { t } from './i18n.js';
import { CONTACTS } from '../config.js';
import { setWorks } from './sections/works.js';
import { renderLinks } from './sections/contact.js';
import { ScrollTrigger } from './utils/animate.js';

let content = {};

const lang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ru');

// Берём текст на текущем языке; если его нет — на другом, чтобы блок не остался пустым.
function pick(field) {
	if (!field) return '';
	if (typeof field === 'string') return field;
	const l = lang();
	return field[l] || field[l === 'ru' ? 'en' : 'ru'] || '';
}

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

function renderPricing() {
	if (Array.isArray(content.plans)) {
		const grid = document.querySelector('.pricing__grid');
		if (grid) {
			const cards = content.plans.map((p) => {
				const card = el('article', `plan${p.featured ? ' plan--featured' : ''}`);
				card.append(el('h3', 'plan__name', pick(p.name)), el('p', 'plan__price', pick(p.price)), el('p', 'plan__time', pick(p.time)));
				const list = el('ul', 'plan__list');
				(p.features || []).forEach((f) => {
					const text = pick(f);
					if (text) list.append(el('li', '', text));
				});
				const cta = el('a', 'plan__cta', t('pricing.cta'));
				cta.href = '#contact';
				cta.dataset.plan = p.plan || 'other';
				card.append(list, cta);
				return card;
			});
			grid.replaceChildren(...cards);
		}
	}
	if (Array.isArray(content.terms)) {
		const ul = document.querySelector('.pricing__terms');
		if (ul) ul.replaceChildren(...content.terms.map((f) => el('li', '', pick(f))).filter((li) => li.textContent));
	}
}

function renderFaq() {
	if (!Array.isArray(content.faq)) return;
	const list = document.querySelector('.faq__list');
	if (!list) return;
	const items = content.faq.map((f) => {
		const d = el('details', 'faq__item');
		d.append(el('summary', '', pick(f.q)), el('p', '', pick(f.a)));
		return d;
	});
	// Раскрытые вопросы не схлопываем при смене языка.
	const open = new Set([...list.querySelectorAll('.faq__item')].map((d, i) => (d.open ? i : -1)));
	items.forEach((d, i) => (d.open = open.has(i)));
	list.replaceChildren(...items);
}

function applyPhoto() {
	if (content.photo === undefined) return;
	const card = document.querySelector('.about__card');
	const img = document.querySelector('.about__photo');
	const grid = document.querySelector('.about__grid');
	if (!card || !img) return;
	if (content.photo) {
		img.src = content.photo;
		card.hidden = false;
		grid?.classList.remove('about__grid--no-photo');
	} else {
		card.hidden = true;
		grid?.classList.add('about__grid--no-photo');
	}
}

function renderAll() {
	renderPricing();
	renderFaq();
}

export function applyContent(data) {
	if (!data || typeof data !== 'object') return;
	content = data;
	if (Array.isArray(data.works)) setWorks(data.works);
	if (data.contacts && typeof data.contacts === 'object') {
		Object.assign(CONTACTS, data.contacts);
		renderLinks();
	}
	applyPhoto();
	renderAll();
	ScrollTrigger.refresh();
}

export function initContent() {
	document.addEventListener('langchange', () => {
		if (Object.keys(content).length) renderAll();
	});
	// Запрос стартует из <head> (window.__content), чтобы не ждать загрузки скриптов.
	const request = window.__content || Promise.resolve({});
	const timeout = new Promise((resolve) => setTimeout(() => resolve({}), 2500));
	return Promise.race([request, timeout]).then(applyContent);
}

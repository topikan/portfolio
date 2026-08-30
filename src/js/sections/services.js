// src/js/sections/services.js
//
// Секция Services: аккордеон из 3 пунктов слева, справа — витрина
// (showcase), которая перерисовывается под выбранный пункт.
//
// Тексты пунктов и витрины не идут через общий data-i18n (src/js/i18n.js),
// т.к. они завязаны ещё и на активный индекс — держим свой маленький
// словарь SERVICES_DATA[lang][index] и перерисовываем его вручную:
// при клике по пункту и при смене языка (слушаем те же [data-lang-switch]
// кнопки, что и общий i18n).
//
// Как добавить/поменять контент: правь SERVICES_DATA ниже, разметка и
// анимация трогать не нужно.

import { gsap } from '../utils/animate.js';

const STORAGE_KEY = 'site-lang';
const DEFAULT_LANG = 'en';

const SERVICES_DATA = {
	en: [
		{
			number: '01',
			title: 'LANDING PAGES',
			desc: 'High-converting landing pages built to achieve real results.',
			tags: 'FIGMA • HTML • SCSS • JS • GSAP',
			label: '01 / LANDING PAGES',
			headingA: 'FROM IDEA',
			headingB: 'TO LAUNCH',
			panelDesc: 'I design and develop landing pages that grab attention and turn visitors into customers.',
			stats: [
				{ value: '+35%', label: 'conversion increase' },
				{ value: '100%', label: 'responsive' },
				{ value: 'fast', label: 'loading speed' },
				{ value: 'clean', label: 'code' },
			],
		},
		{
			number: '02',
			title: 'BUSINESS WEBSITES',
			desc: 'Modern and responsive websites that represent your brand.',
			tags: 'FIGMA • HTML • SCSS • JS • VITE',
			label: '02 / BUSINESS WEBSITES',
			headingA: 'BUILT TO REPRESENT',
			headingB: 'YOUR BRAND',
			panelDesc: 'I craft business websites that communicate trust and professionalism at first glance.',
			stats: [
				{ value: '+40%', label: 'engagement' },
				{ value: '100%', label: 'responsive' },
				{ value: 'fast', label: 'loading speed' },
				{ value: 'clean', label: 'code' },
			],
		},
		{
			number: '03',
			title: 'FRONTEND DEVELOPMENT',
			desc: 'Pixel-perfect implementation from Figma to production.',
			tags: 'FIGMA • HTML • SCSS • JS • API',
			label: '03 / FRONTEND DEVELOPMENT',
			headingA: 'PIXEL-PERFECT,',
			headingB: 'IN PRODUCTION',
			panelDesc: 'I turn Figma designs into pixel-perfect, production-ready interfaces wired to real APIs.',
			stats: [
				{ value: '100%', label: 'pixel accuracy' },
				{ value: '100%', label: 'responsive' },
				{ value: 'fast', label: 'build time' },
				{ value: 'clean', label: 'code' },
			],
		},
	],

	ru: [
		{
			number: '01',
			title: 'ЛЕНДИНГИ',
			desc: 'Конверсионные лендинги, нацеленные на реальный результат.',
			tags: 'FIGMA • HTML • SCSS • JS • GSAP',
			label: '01 / ЛЕНДИНГИ',
			headingA: 'ОТ ИДЕИ',
			headingB: 'ДО ЗАПУСКА',
			panelDesc: 'Проектирую и верстаю лендинги, которые цепляют внимание и превращают посетителей в клиентов.',
			stats: [
				{ value: '+35%', label: 'рост конверсии' },
				{ value: '100%', label: 'адаптивность' },
				{ value: 'быстрая', label: 'загрузка' },
				{ value: 'чистый', label: 'код' },
			],
		},
		{
			number: '02',
			title: 'САЙТЫ ДЛЯ БИЗНЕСА',
			desc: 'Современные адаптивные сайты, отражающие ваш бренд.',
			tags: 'FIGMA • HTML • SCSS • JS • VITE',
			label: '02 / САЙТЫ ДЛЯ БИЗНЕСА',
			headingA: 'ОТРАЖАЮТ',
			headingB: 'ВАШ БРЕНД',
			panelDesc: 'Делаю сайты для бизнеса, которые с первого взгляда вызывают доверие и выглядят профессионально.',
			stats: [
				{ value: '+40%', label: 'вовлечённость' },
				{ value: '100%', label: 'адаптивность' },
				{ value: 'быстрая', label: 'загрузка' },
				{ value: 'чистый', label: 'код' },
			],
		},
		{
			number: '03',
			title: 'ФРОНТЕНД-РАЗРАБОТКА',
			desc: 'Pixel-perfect вёрстка — от Figma до продакшена.',
			tags: 'FIGMA • HTML • SCSS • JS • API',
			label: '03 / ФРОНТЕНД-РАЗРАБОТКА',
			headingA: 'PIXEL-PERFECT',
			headingB: 'В ПРОДАКШЕНЕ',
			panelDesc: 'Превращаю макеты Figma в точную, готовую к продакшену вёрстку, подключённую к реальным API.',
			stats: [
				{ value: '100%', label: 'точность вёрстки' },
				{ value: '100%', label: 'адаптивность' },
				{ value: 'быстрая', label: 'сборка' },
				{ value: 'чистый', label: 'код' },
			],
		},
	],
};

function getCurrentLang() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return SERVICES_DATA[stored] ? stored : DEFAULT_LANG;
	} catch (e) {
		return DEFAULT_LANG;
	}
}

export function initServices() {
	const root = document.querySelector('[data-services-root]');
	if (!root) return;

	const items = Array.from(root.querySelectorAll('[data-service-item]'));
	const showcase = root.querySelector('[data-service-showcase]');

	const labelEl = root.querySelector('[data-service-label]');
	const headingAEl = root.querySelector('[data-service-heading-a]');
	const headingBEl = root.querySelector('[data-service-heading-b]');
	const panelDescEl = root.querySelector('[data-service-panel-desc]');
	const statEls = Array.from(root.querySelectorAll('[data-service-stats] [data-stat-value]'));
	const statLabelEls = Array.from(root.querySelectorAll('[data-service-stats] [data-stat-label]'));

	let currentLang = getCurrentLang();
	let activeIndex = 0;

	function renderItems() {
		const data = SERVICES_DATA[currentLang];

		items.forEach((item, i) => {
			const entry = data[i];
			item.querySelector('[data-service-number]').textContent = entry.number;
			item.querySelector('[data-service-title]').textContent = entry.title;
			item.querySelector('[data-service-desc]').textContent = entry.desc;
			item.querySelector('[data-service-tags]').textContent = entry.tags;
		});
	}

	function renderShowcase(animate) {
		const entry = SERVICES_DATA[currentLang][activeIndex];

		const apply = () => {
			labelEl.textContent = entry.label;
			headingAEl.textContent = entry.headingA;
			headingBEl.textContent = entry.headingB;
			panelDescEl.textContent = entry.panelDesc;
			entry.stats.forEach((stat, i) => {
				if (statEls[i]) statEls[i].textContent = stat.value;
				if (statLabelEls[i]) statLabelEls[i].textContent = stat.label;
			});
		};

		if (!animate) {
			apply();
			return;
		}

		gsap.timeline()
			.to(showcase, { opacity: 0, y: 8, duration: 0.18, ease: 'power1.out' })
			.call(apply)
			.to(showcase, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
	}

	function setActive(index, animate) {
		if (index === activeIndex && animate) return;
		activeIndex = index;

		items.forEach((item, i) => {
			const isActive = i === index;
			item.classList.toggle('is-active', isActive);
			item.setAttribute('aria-selected', String(isActive));
		});

		renderShowcase(animate);
	}

	items.forEach((item) => {
		item.addEventListener('click', () => {
			setActive(Number(item.dataset.serviceIndex), true);
		});
	});

	document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const lang = btn.getAttribute('data-lang-switch');
			if (!SERVICES_DATA[lang] || lang === currentLang) return;

			currentLang = lang;
			renderItems();
			renderShowcase(false);
		});
	});

	renderItems();
	renderShowcase(false);
}

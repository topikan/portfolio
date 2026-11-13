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
				{ value: '90+', label: 'Google PageSpeed goal' },
				{ value: 'any', label: 'screen size' },
				{ value: 'from 5d', label: 'to launch' },
				{ value: 'SEO', label: 'basics included' },
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
				{ value: '90+', label: 'Google PageSpeed goal' },
				{ value: 'any', label: 'screen size' },
				{ value: 'from 14d', label: 'to launch' },
				{ value: 'SEO', label: 'basics included' },
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
				{ value: '1:1', label: 'match with Figma' },
				{ value: 'any', label: 'screen size' },
				{ value: '90+', label: 'Google PageSpeed goal' },
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
				{ value: '90+', label: 'цель по Google PageSpeed' },
				{ value: 'любой', label: 'размер экрана' },
				{ value: 'от 5 дн.', label: 'до запуска' },
				{ value: 'SEO', label: 'основы включены' },
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
				{ value: '90+', label: 'цель по Google PageSpeed' },
				{ value: 'любой', label: 'размер экрана' },
				{ value: 'от 14 дн.', label: 'до запуска' },
				{ value: 'SEO', label: 'основы включены' },
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
				{ value: '1:1', label: 'совпадение с Figma' },
				{ value: 'любой', label: 'размер экрана' },
				{ value: '90+', label: 'цель по Google PageSpeed' },
				{ value: 'чистый', label: 'код' },
			],
		},
	],
};

function getCurrentLang() {
	// Язык уже выбран общим i18n (хранилище или язык браузера) и записан в <html lang>.
	const current = document.documentElement.getAttribute('lang');
	return SERVICES_DATA[current] ? current : DEFAULT_LANG;
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
	let showcaseTimeline = null;

	// Декоративный макет: у каждой услуги своя "сцена" (лендинг / бизнес-сайт /
	// разработка). Активную сцену показываем вместе со сменой текста.
	const mockup = root.querySelector('[data-service-mockup]');
	const scenes = mockup ? Array.from(mockup.querySelectorAll('[data-mock-scene]')) : [];
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

	// Элементы активной сцены появляются по очереди. Важно: у [data-mock] в CSS
	// не должно быть своего transform — GSAP пишет y через transform.
	function playMockup() {
		if (reduceMotion.matches) return;

		const parts = scenes[activeIndex]?.querySelectorAll('[data-mock]');
		if (!parts || parts.length === 0) return;

		// Сначала сбрасываем возможные "хвосты" прерванной анимации, потом
		// gsap.from: он анимирует К значению из CSS (например, у акцентных линий
		// своя opacity: 0.6), а не к жёсткой единице.
		gsap.set(parts, { clearProps: 'opacity,transform' });
		gsap.from(parts, {
			opacity: 0,
			y: 10,
			duration: 0.45,
			stagger: 0.04,
			ease: 'power2.out',
			overwrite: 'auto',
			clearProps: 'opacity,transform',
		});
	}

	function renderShowcase(animate) {
		const entry = SERVICES_DATA[currentLang][activeIndex];

		const apply = () => {
			scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === activeIndex));
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

		// Быстрые клики по пунктам не должны наслаиваться друг на друга.
		showcaseTimeline?.kill();
		showcaseTimeline = gsap
			.timeline()
			.to(showcase, { opacity: 0, y: 8, duration: 0.18, ease: 'power1.out' })
			.call(() => {
				apply();
				playMockup();
			})
			.to(showcase, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
	}

	function setActive(index, animate) {
		if (index === activeIndex && animate) return;
		activeIndex = index;

		items.forEach((item, i) => {
			const isActive = i === index;
			item.classList.toggle('is-active', isActive);
			item.setAttribute('aria-selected', String(isActive));
			// Roving tabindex: в Tab-порядке только активная вкладка,
			// между вкладками ходим стрелками.
			item.tabIndex = isActive ? 0 : -1;
		});

		// Панель называем по короткому заголовку вкладки, а не по всему её тексту.
		showcase.setAttribute('aria-labelledby', items[index].querySelector('[data-service-title]').id);
		renderShowcase(animate);
	}

	items.forEach((item) => {
		item.addEventListener('click', () => {
			setActive(Number(item.dataset.serviceIndex), true);
		});
	});

	// Клавиатура по паттерну WAI-ARIA Tabs (вертикальный список):
	// ↑/← — предыдущая, ↓/→ — следующая, Home/End — первая/последняя.
	const list = root.querySelector('[data-services-list]');
	list?.addEventListener('keydown', (event) => {
		const current = items.indexOf(document.activeElement);
		if (current === -1) return;

		let next = null;
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % items.length;
		else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = items.length - 1;
		if (next === null) return;

		event.preventDefault();
		items[next].focus();
		setActive(next, true);
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

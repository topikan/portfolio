// src/js/effects/smooth-anchors.js
//
// Плавная прокрутка к разделам по якорным ссылкам (#about, #pricing, #contact…).
// Ссылки #work (куб) и #privacy (окно) обрабатываются своими модулями и сюда
// не попадают. Если открыт блок «Работы», ссылки обрабатывает works-flip.js.
// При prefers-reduced-motion прокрутка мгновенная.

const SKIP = new Set(['#', '#privacy']);
const OFFSET = 24; // зазор сверху, чтобы заголовок не прилипал к краю

export function initSmoothAnchors() {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (document.documentElement.classList.contains('is-works-open')) return;

		const link = event.target.closest('a[href^="#"]');
		const hash = link?.getAttribute('href');
		if (!hash || SKIP.has(hash)) return;

		const target = document.querySelector(hash);
		if (!target) return;

		event.preventDefault();
		const top = hash === '#hero' ? 0 : target.getBoundingClientRect().top + window.scrollY - OFFSET;
		window.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
	});
}

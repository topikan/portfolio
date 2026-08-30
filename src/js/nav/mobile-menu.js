// src/js/nav/mobile-menu.js
//
// Открытие/закрытие мобильного меню по бургеру:
// - toggle класса .is-active на бургере (анимация линий в крестик через CSS)
// - toggle класса .is-open на .hero__mobile-menu (fade + translateY через CSS)
// - лок скролла body, пока меню открыто
// - закрытие по клику на ссылку, по Escape и при переходе на десктопную ширину

export function initMobileMenu() {
	const toggle = document.querySelector('[data-menu-toggle]');
	const menu = document.querySelector('[data-mobile-menu]');

	if (!toggle || !menu) return;

	let isOpen = false;

	const setOpen = (next) => {
		isOpen = next;
		toggle.classList.toggle('is-active', isOpen);
		menu.classList.toggle('is-open', isOpen);
		toggle.setAttribute('aria-expanded', String(isOpen));
		toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
	document.documentElement.style.overflow = isOpen ? 'hidden' : '';
		document.body.style.overflow = isOpen ? 'hidden' : '';
	};

	toggle.addEventListener('click', () => setOpen(!isOpen));

	menu.querySelectorAll('[data-menu-link]').forEach((link) => {
		link.addEventListener('click', () => setOpen(false));
	});

	document.addEventListener('keydown', (event) => {
		if (isOpen && event.key === 'Escape') setOpen(false);
	});

	// tablet-брейкпоинт того же значения, что и в SCSS ($bp-tablet)
	const desktopQuery = window.matchMedia('(min-width: 1024.01px)');
	desktopQuery.addEventListener('change', (event) => {
		if (event.matches) setOpen(false);
	});
}

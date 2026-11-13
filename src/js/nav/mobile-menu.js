// src/js/nav/mobile-menu.js
//
// Открытие/закрытие мобильного меню по бургеру:
// - toggle класса .is-active на бургере (анимация линий в крестик через CSS)
// - toggle класса .is-open на .hero__mobile-menu (fade + translateY через CSS)
// - лок скролла body, пока меню открыто
// - закрытие по клику на ссылку, по Escape и при переходе на десктопную ширину
//
// Доступность:
// - закрытое меню помечено inert, поэтому его невидимые ссылки не попадают
//   в Tab-порядок и к скринридеру;
// - пока меню открыто, страница под ним (main и skip-link) inert — фокус
//   не "утекает" в невидимое содержимое;
// - при открытии фокус уходит в меню, при закрытии (Esc / бургер)
//   возвращается на кнопку-бургер;
// - подпись кнопки ("Открыть/Закрыть меню") переводится вместе с сайтом.

import { t } from '../i18n.js';

export function initMobileMenu() {
	const toggle = document.querySelector('[data-menu-toggle]');
	const menu = document.querySelector('[data-mobile-menu]');
	const page = document.querySelector('.page');
	const skipLink = document.querySelector('.skip-link');

	if (!toggle || !menu) return;

	let isOpen = false;

	const updateLabel = () => {
		toggle.setAttribute('aria-label', t(isOpen ? 'a11y.menuClose' : 'a11y.menuOpen'));
	};

	const setOpen = (next, { restoreFocus = true } = {}) => {
		const wasOpen = isOpen;
		isOpen = next;

		toggle.classList.toggle('is-active', isOpen);
		menu.classList.toggle('is-open', isOpen);
		toggle.setAttribute('aria-expanded', String(isOpen));
		updateLabel();

		menu.inert = !isOpen;
		if (page) page.inert = isOpen;
		if (skipLink) skipLink.inert = isOpen;

		// Лок скролла — через класс (стили в style.scss): так он не конфликтует
		// с другими блокировками, например с открытым блоком "Работы".
		document.documentElement.classList.toggle('is-menu-open', isOpen);

		if (isOpen) {
			menu.querySelector('a, button')?.focus();
		} else if (wasOpen && restoreFocus) {
			toggle.focus();
		}
	};

	setOpen(false, { restoreFocus: false });

	toggle.addEventListener('click', () => setOpen(!isOpen));

	menu.querySelectorAll('[data-menu-link]').forEach((link) => {
		// Фокус не возвращаем: пользователь переходит по якорю к разделу.
		link.addEventListener('click', () => setOpen(false, { restoreFocus: false }));
	});

	document.addEventListener('keydown', (event) => {
		if (isOpen && event.key === 'Escape') setOpen(false);
	});

	// Язык сменился — обновляем подпись бургера.
	document.addEventListener('langchange', updateLabel);

	// tablet-брейкпоинт того же значения, что и в SCSS ($bp-tablet)
	const desktopQuery = window.matchMedia('(min-width: 1024.01px)');
	desktopQuery.addEventListener('change', (event) => {
		if (event.matches) setOpen(false, { restoreFocus: false });
	});
}

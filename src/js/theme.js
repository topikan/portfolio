// Переключатель светлой / тёмной темы.
// По умолчанию тёмная (фирменный вид). Выбор запоминается в браузере; лёгкий
// скрипт в <head> применяет его до отрисовки, чтобы не было вспышки.

import { t } from './i18n.js';

const KEY = 'site-theme';
const root = document.documentElement;

function currentTheme() {
	return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function paint() {
	const light = currentTheme() === 'light';
	document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
		btn.setAttribute('aria-pressed', String(light));
		btn.setAttribute('aria-label', t(light ? 'a11y.themeToDark' : 'a11y.themeToLight'));
	});
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f5f8' : '#060608');
}

export function initTheme() {
	paint();
	document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const next = currentTheme() === 'light' ? 'dark' : 'light';
			if (next === 'light') root.setAttribute('data-theme', 'light');
			else root.removeAttribute('data-theme');
			try {
				localStorage.setItem(KEY, next);
			} catch (e) {
				// localStorage может быть недоступен — тема просто не запомнится.
			}
			paint();
			document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
		});
	});
	document.addEventListener('langchange', paint);
}

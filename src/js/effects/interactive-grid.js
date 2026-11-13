// src/js/effects/interactive-grid.js
//
// Подсветка сетки в hero, которая следует за курсором.
//
// Оптимизация: раньше на КАЖДОЕ движение мыши вызывался getBoundingClientRect()
// (заставляет браузер пересчитать раскладку). Теперь размеры .hero__bg
// кешируются и перемеряются только при входе курсора, скролле и ресайзе,
// а обновление свечения идёт не чаще одного раза за кадр (requestAnimationFrame).

import { gsap } from '../utils/animate.js';

export function initInteractiveGrid() {
	const hero = document.querySelector('.hero');
	const bg = document.querySelector('.hero__bg');
	const glow = document.querySelector('.hero__grid-glow');

	if (!hero || !bg || !glow) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const setX = gsap.quickSetter(glow, '--gx', '%');
	const setY = gsap.quickSetter(glow, '--gy', '%');

	let rect = null; // кеш размеров; null = нужно перемерить
	let pointer = null; // последняя позиция курсора, ещё не применённая
	let frame = 0;

	const flush = () => {
		frame = 0;
		if (!pointer) return;

		rect ??= bg.getBoundingClientRect();
		setX(((pointer.x - rect.left) / rect.width) * 100);
		setY(((pointer.y - rect.top) / rect.height) * 100);
		pointer = null;
	};

	hero.addEventListener(
		'pointermove',
		(event) => {
			pointer = { x: event.clientX, y: event.clientY };
			if (!frame) frame = requestAnimationFrame(flush);
		},
		{ passive: true }
	);

	hero.addEventListener('pointerenter', () => {
		rect = null;
		gsap.to(glow, { '--glow-opacity': 1, duration: 0.4, ease: 'power2.out', overwrite: true });
	});

	hero.addEventListener('pointerleave', () => {
		gsap.to(glow, { '--glow-opacity': 0, duration: 0.6, ease: 'power2.out', overwrite: true });
	});

	const invalidate = () => {
		rect = null;
	};
	window.addEventListener('scroll', invalidate, { passive: true });
	window.addEventListener('resize', invalidate, { passive: true });
}

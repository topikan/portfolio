// src/js/effects/hero-snap.js
//
// Тот самый "наезд блока на блок": hero запинен через ScrollTrigger
// (pin: true) ровно на один экран скролла, пока .services физически
// проезжает поверх него снизу вверх. Разница с обычным scroll-scrub
// пином — пользователь НЕ управляет процессом напрямую: один жест
// скролла (колесо/тачпад/клавиша) форсированно проигрывает весь
// переход как единую анимацию заданной длительности, а не пиксель-в-
// пиксель следует за курсором мыши. Пока анимация идёт — весь
// остальной ввод скролла игнорируется (locked).
//
// Как только пользователь долистал глубже .services (там контента
// больше одного экрана — аккордеон, статы, футер) — perехват
// отключается, скролл дальше обычный, нативный.

import { gsap, ScrollTrigger } from '../utils/animate.js';

const JUMP_DURATION = 1;
const EASE = 'power3.inOut';
const EDGE = 2; // px допуска на границах pin-диапазона

export function initHeroSnap() {
	const hero = document.querySelector('.hero');
	const services = document.querySelector('.services');
	const fadeTargets = [
		document.querySelector('.hero__content'),
		document.querySelector('.hero__wordmark'),
		document.querySelector('.hero__visual'),
	].filter(Boolean);

	if (!hero || !services) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (!window.matchMedia('(min-width: 1025px)').matches) return;

	// pin: true — hero остаётся на экране, пока страница "прокручивается"
	// ровно на один дополнительный viewport (end: '+=100%'); pinSpacing:
	// false — без этого ScrollTrigger сам добавил бы пустой отступ под
	// hero на время пина, а нам нужно, чтобы .services физически
	// наезжала поверх, а не начиналась только после паузы.
	const pin = ScrollTrigger.create({
		trigger: hero,
		start: 'top top',
		end: '+=100%',
		pin: true,
		pinSpacing: false,
	});

	let locked = false;

	function inPinZone(y) {
		return y >= pin.start - EDGE && y <= pin.end + EDGE;
	}

	function jump(direction) {
		if (locked) return;

		const current = window.scrollY;
		let target = null;

		if (direction > 0 && current < pin.end - EDGE) {
			target = pin.end;
		} else if (direction < 0 && current > pin.start + EDGE) {
			target = pin.start;
		}

		if (target === null) return;

		locked = true;

		const tl = gsap.timeline({
			defaults: { duration: JUMP_DURATION, ease: EASE },
			onComplete: () => {
				locked = false;
			},
		});

		tl.to(window, { scrollTo: { y: target, autoKill: false } }, 0);

		if (fadeTargets.length) {
			const covering = target === pin.end;
			tl.to(fadeTargets, { opacity: covering ? 0.25 : 1, scale: covering ? 0.96 : 1 }, 0);
		}
	}

	function handleIntent(direction, event) {
		if (locked) {
			event.preventDefault();
			return;
		}
		if (!inPinZone(window.scrollY)) return; // глубже в services — обычный скролл

		event.preventDefault();
		jump(direction);
	}

	window.addEventListener(
		'wheel',
		(event) => handleIntent(Math.sign(event.deltaY), event),
		{ passive: false }
	);

	let touchStartY = 0;

	window.addEventListener(
		'touchstart',
		(event) => {
			touchStartY = event.touches[0].clientY;
		},
		{ passive: true }
	);

	window.addEventListener(
		'touchmove',
		(event) => {
			const deltaY = touchStartY - event.touches[0].clientY;
			if (Math.abs(deltaY) < 24) return;
			handleIntent(Math.sign(deltaY), event);
		},
		{ passive: false }
	);

	window.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowDown' || event.key === 'PageDown') {
			handleIntent(1, event);
		} else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
			handleIntent(-1, event);
		}
	});
}

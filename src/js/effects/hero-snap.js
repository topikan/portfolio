// src/js/effects/hero-snap.js
//
// "Наезд блока на блок": hero запинен через ScrollTrigger (pin: true) на
// один экран скролла, пока .services физически проезжает поверх него
// снизу вверх. Работает на всех размерах экрана — и на десктопе, и на
// телефоне.
//
// Где именно закрепляется hero:
// - на десктопе и планшете hero ровно в высоту экрана, поэтому он
//   закрепляется, как только страница на самом верху;
// - на телефоне hero ВЫШЕ экрана (контент и куб идут друг под другом).
//   Если закрепить его за верхний край, нижняя часть контента была бы
//   отрезана. Поэтому start = 'bottom bottom': сначала hero прокручивается
//   как обычно, и когда его низ дошёл до низа экрана, он замирает, а
//   Services наезжает сверху.
//
// Скролл остаётся НАТИВНЫМ (колесо, тачпад, палец, полоса справа, клавиши,
// якорные ссылки). Никаких перехватов wheel/touch/keydown и preventDefault —
// поэтому ввод пользователя никогда не "съедается".
//
// "Доводка" до конца перехода (snap) включена только там, где есть мышь или
// тачпад: как только пользователь остановился внутри зоны перехода,
// страница плавно доезжает до ближайшего края в сторону его движения. На
// сенсорных экранах snap выключен: он конфликтует с инерцией прокрутки
// пальцем (особенно в iOS Safari), и наезд там просто следует за пальцем.
//
// Затухание hero (opacity/scale) считается от прогресса скролла, поэтому
// всегда соответствует положению страницы, каким бы способом её ни листали.
//
// ВАЖНО: затухание задаётся через CSS-переменные --hero-fade-opacity и
// --hero-fade-scale (стили — в конце style.scss), а НЕ через gsap.set(scale).
// GSAP, записав scale, забирает под себя весь `transform` элемента и
// "замораживает" CSS-значения вроде translateY(-50%) у .hero__visual в
// пикселях. После смены размера окна (поворот планшета, DevTools) этот
// устаревший transform перебивал мобильный CSS и куб уезжал на кнопки.
// Отдельное CSS-свойство `scale` с `transform` не конфликтует.
//
// gsap.matchMedia включает/выключает эффект при смене prefers-reduced-motion
// и типа указателя без перезагрузки страницы.

import { gsap, ScrollTrigger } from '../utils/animate.js';

const FADE_OPACITY = 0.25; // opacity hero, когда он полностью накрыт
const FADE_SCALE = 0.96; // scale hero, когда он полностью накрыт

const SNAP = {
	snapTo: [0, 1], // 0 — hero открыт, 1 — services полностью накрыла hero
	directional: true, // доводим в сторону движения пользователя
	duration: { min: 0.3, max: 0.8 },
	delay: 0.08, // пауза после остановки скролла перед доводкой
	ease: 'power3.inOut',
};

export function initHeroSnap() {
	const hero = document.querySelector('.hero');
	const services = document.querySelector('.services');
	const root = document.documentElement;

	if (!hero || !services) return;

	const mm = gsap.matchMedia();

	mm.add(
		{
			motion: '(prefers-reduced-motion: no-preference)',
			finePointer: '(hover: hover) and (pointer: fine)',
		},
		(context) => {
			const { motion, finePointer } = context.conditions;
			// Если пользователь просит меньше анимаций — страница скроллится обычно.
			if (!motion) return;

			const applyFade = (self) => {
				// Погрешность прогресса (0.000001) не должна давать opacity < 1 в покое.
				const p = self.progress < 0.001 ? 0 : self.progress;
				root.style.setProperty('--hero-fade-opacity', String(1 - (1 - FADE_OPACITY) * p));
				root.style.setProperty('--hero-fade-scale', String(1 - (1 - FADE_SCALE) * p));

				// Когда Services полностью накрыла hero, его ссылки и кнопки не видны —
				// исключаем их из Tab-порядка и из дерева доступности (inert), чтобы
				// фокус с клавиатуры не уходил "под" секцию.
				hero.inert = p >= 0.999;
			};

			// Длина пина = высота окна: ровно столько нужно .services, чтобы
			// доехать до верха экрана и полностью накрыть hero. Если страница
			// короче (например, планшет в портретной ориентации: Services ниже
			// экрана), конец эффекта привязываем к концу страницы — тогда
			// затухание hero завершается ровно там, где можно доскроллить.
			// pinSpacing: false — .services должна накрывать hero, а не
			// начинаться после паузы.
			const trigger = ScrollTrigger.create({
				trigger: hero,
				start: 'bottom bottom',
				end: (self) =>
				Math.max(
					self.start + 1,
					Math.min(self.start + window.innerHeight, ScrollTrigger.maxScroll(window))
				),
				invalidateOnRefresh: true,
				pin: true,
				pinSpacing: false,
				anticipatePin: 1, // без "вспышки" при быстром флике пальцем
				snap: finePointer ? SNAP : false,
				onUpdate: applyFade,
				onRefresh: applyFade,
			});

			// При смене языка высота страницы меняется (тексты разной длины) —
			// пересчитываем позиции эффекта.
			const onLangChange = () => requestAnimationFrame(() => ScrollTrigger.refresh());
			document.addEventListener('langchange', onLangChange);

			return () => {
				document.removeEventListener('langchange', onLangChange);
				trigger.kill();
				hero.inert = false;
				root.style.removeProperty('--hero-fade-opacity');
				root.style.removeProperty('--hero-fade-scale');
			};
		}
	);
}

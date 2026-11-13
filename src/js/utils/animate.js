// src/js/utils/animate.js
//
// Общее место для GSAP в проекте.
// Импортируй gsap отсюда (а не напрямую из пакета 'gsap') во всех новых блоках —
// если позже понадобится подключить плагин (например ScrollTrigger),
// его достаточно будет зарегистрировать один раз здесь.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger };

/**
 * FLIP-анимация высоты блока при изменении его содержимого
 * (смена текста, раскрытие/закрытие, добавление/удаление элементов и т.д.).
 *
 * Как использовать в новом блоке, например в аккордеоне:
 *
 *   import { flipHeight } from '../utils/animate.js';
 *
 *   flipHeight(accordionBodyEl, () => {
 *     accordionBodyEl.classList.toggle('is-open');
 *   });
 *
 * @param {HTMLElement} el - элемент, чья высота может измениться
 * @param {() => void} mutate - функция, которая вносит изменение в DOM
 *   (меняет текст, класс, добавляет/убирает детей и т.п.)
 * @param {{ duration?: number, ease?: string, onComplete?: () => void }} [options]
 */
export function flipHeight(el, mutate, options = {}) {
	const { duration = 0.45, ease = 'power2.inOut', onComplete } = options;

	if (!el) {
		mutate();
		return;
	}

	// "F" — First: высота до изменения.
	const fromHeight = el.getBoundingClientRect().height;

	// Собственно изменение контента.
	mutate();

	// "L" — Last: сбрасываем инлайновую высоту (могла остаться от прошлой
	// анимации) и замеряем новую, "естественную" высоту после изменения.
	el.style.height = 'auto';
	const toHeight = el.getBoundingClientRect().height;

	if (Math.round(fromHeight) === Math.round(toHeight)) {
		onComplete?.();
		return;
	}

	// "I" + "P" — Invert + Play: анимируем от старой высоты к новой.
	gsap.fromTo(
		el,
		{ height: fromHeight },
		{
			height: toHeight,
			duration,
			ease,
			onComplete: () => {
				el.style.height = 'auto';
				onComplete?.();
			},
		}
	);
}
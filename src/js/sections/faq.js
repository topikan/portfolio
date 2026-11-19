// src/js/sections/faq.js
//
// Плавное раскрытие/сворачивание вопросов FAQ (нативный <details> по умолчанию
// открывается рывком). Клавиатура и скринридеры работают как у обычного
// <details>: мы лишь анимируем высоту. При prefers-reduced-motion — без анимации.

import { gsap, ScrollTrigger } from '../utils/animate.js';

export function initFaq() {
	const list = document.querySelector('.faq__list');
	if (!list) return;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

	// Делегирование: список вопросов может перерисоваться (правки из админки).
	{
		list.addEventListener('click', (event) => {
			const summary = event.target.closest('summary');
			const item = summary?.closest('.faq__item');
			if (!summary || !item) return;
			if (reduce.matches) return; // обычное поведение <details>
			event.preventDefault();

			gsap.killTweensOf(item);
			const opening = !item.open;
			const closedHeight = summary.offsetHeight;

			item.classList.add('is-animating');

			if (opening) {
				item.open = true;
				const full = item.scrollHeight;
				gsap.fromTo(
					item,
					{ height: closedHeight },
					{ height: full, duration: 0.4, ease: 'power3.out', onComplete: done }
				);
			} else {
				gsap.fromTo(
					item,
					{ height: item.offsetHeight },
					{
						height: closedHeight,
						duration: 0.3,
						ease: 'power2.inOut',
						onComplete: () => {
							item.open = false;
							done();
						},
					}
				);
			}

			function done() {
				gsap.set(item, { clearProps: 'height' });
				item.classList.remove('is-animating');
				// Высота страницы изменилась — пересчитываем позиции скролл-эффектов.
				ScrollTrigger.refresh();
			}
		});
	}
}

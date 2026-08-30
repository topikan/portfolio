import { gsap } from '../utils/animate.js';
export function initInteractiveGrid() {
	const hero = document.querySelector('.hero');
	const bg = document.querySelector('.hero__bg');
	const glow = document.querySelector('.hero__grid-glow');

	if (!hero || !bg || !glow) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const setX = gsap.quickSetter(glow, '--gx', '%');
	const setY = gsap.quickSetter(glow, '--gy', '%');
	const handleMove = (event) => {
		const rect = bg.getBoundingClientRect();
		setX(((event.clientX - rect.left) / rect.width) * 100);
		setY(((event.clientY - rect.top) / rect.height) * 100);
	};
	hero.addEventListener('pointermove', handleMove);
	hero.addEventListener('pointerenter', () => {
		gsap.to(glow, { '--glow-opacity': 1, duration: 0.4, ease: 'power2.out', overwrite: true });
	});
	hero.addEventListener('pointerleave', () => {
		gsap.to(glow, { '--glow-opacity': 0, duration: 0.6, ease: 'power2.out', overwrite: true });
	});
}

import './fonts.css';
import './style.scss';
import './sections.scss';
import { ANALYTICS } from './config.js';
import { initI18n } from './js/i18n.js';
import { initInteractiveGrid } from './js/effects/interactive-grid.js';
import { initMobileMenu } from './js/nav/mobile-menu.js';
import { initServices } from './js/sections/services.js';
import { initHeroSnap } from './js/effects/hero-snap.js';
import { initWorks } from './js/sections/works.js';
import { initFaq } from './js/sections/faq.js';
import { initSmoothAnchors } from './js/effects/smooth-anchors.js';
import { initContact, initAnalytics } from './js/sections/contact.js';

// Каждый блок стартует независимо: ошибка в одном (например, в браузере
// нет WebGL и 3D-куб не создался) не должна ронять остальные — язык, меню,
// услуги и скролл-эффект продолжают работать.
function safeInit(name, init) {
	try {
		init();
	} catch (error) {
		console.error(`[init] "${name}" не запустился:`, error);
	}
}

safeInit('i18n', initI18n);
safeInit('interactive-grid', initInteractiveGrid);
safeInit('mobile-menu', initMobileMenu);
safeInit('services', initServices);
safeInit('hero-snap', initHeroSnap);
safeInit('works', initWorks);
safeInit('contact', initContact);
safeInit('faq', initFaq);
safeInit('smooth-anchors', initSmoothAnchors);
safeInit('analytics', () => initAnalytics(ANALYTICS));

// Самый тяжёлый блок (three.js, ~600 КБ JS) грузим отдельным чанком уже
// после первой отрисовки и полной загрузки страницы, в момент простоя
// браузера. Текст, меню и скролл-эффект работают сразу, куб плавно
// проявляется следом.
function loadHeroCubeLater() {
	const load = () =>
		import('./js/three/hero-cube.js')
			.then(({ initHeroCube }) => safeInit('hero-cube', initHeroCube))
			.catch((error) => console.error('[init] не удалось загрузить hero-cube:', error));

	const schedule = () => {
		if ('requestIdleCallback' in window) {
			window.requestIdleCallback(load, { timeout: 2000 });
		} else {
			setTimeout(load, 200);
		}
	};

	if (document.readyState === 'complete') {
		schedule();
	} else {
		window.addEventListener('load', schedule, { once: true });
	}
}

loadHeroCubeLater();

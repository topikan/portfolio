// src/js/effects/works-flip.js
//
// Куб: страница — передняя грань, блок "Работы" — правая грань.
// По клику на любую ссылку href="#work" куб поворачивается ВПРАВО (в сторону
// стрелки на кнопке) и спереди оказывается правая грань с работами.
// Обратно (кнопка "Назад", Esc, "назад" в браузере) — поворот влево.
//
// Геометрия (в системе координат вращающегося элемента .cube__rotor):
// - передняя грань A — вся страница, плоскость z = 0, x ∈ [0, W];
// - правая грань B — плоскость размером с экран (W × высота окна), приставленная
//   к правому краю A (x = W) и повёрнутая на 90°; она стоит на уровне текущего
//   скролла, поэтому после поворота ровно совпадает с экраном;
// - ось вращения вертикальная и проходит через центр куба: x = W/2, z = -W/2.
//   Поворот rotateY(0 → -90°) выводит вперёд грань B.
//
// Важные детали:
// - Перспектива/transform включаются только на время анимации (класс .is-3d и
//   inline-стили): любой transform у предка делает его containing block для
//   position: fixed, а у нас внутри страницы есть закреплённый hero. Если hero
//   закреплён, на время поворота сдвигаем его свойством translate на величину
//   скролла, чтобы он не "прыгал".
// - В покое блок .works — обычный fixed-оверлей на весь экран с собственным
//   скроллом; в момент поворота он становится гранью куба и обратно.
// - Адрес: открытие добавляет #work в историю (кнопка "назад" закрывает блок),
//   ссылка site/#work открывает блок сразу.
// - prefers-reduced-motion: вместо 3D — короткое плавное проявление.

import { gsap } from '../utils/animate.js';

const TRIGGER_SELECTOR = 'a[href="#work"]';
const HASH = '#work';
const PERSPECTIVE = 2200; // px — чем больше, тем "плоскее" куб
const DURATION = 1.3; // сек — полный поворот
const DEPTH = 220; // px — на сколько куб "отъезжает" назад посередине поворота

export function initWorksFlip() {
	const cube = document.querySelector('[data-cube]');
	const rotor = document.querySelector('[data-cube-rotor]');
	const stage = document.querySelector('[data-page-stage]');
	const works = document.querySelector('[data-works]');
	const hero = document.querySelector('.hero');
	if (!cube || !rotor || !stage || !works) return;

	const root = document.documentElement;
	const backButton = works.querySelector('[data-works-back]');
	const title = works.querySelector('#works-title');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	let state = 'closed'; // closed | opening | open | closing
	let timeline = null;
	let lastTrigger = null;
	let onClosed = null; // resolve для requestClose()
	let pendingClose = false; // Esc / «Назад» нажали, пока шёл поворот открытия

	// ─── Вспомогательное ────────────────────────────────────────────────

	// Пока идёт поворот, страницу нельзя листать: геометрия граней считается
	// от текущего скролла.
	const blockInput = (event) => event.preventDefault();
	const blockKeys = (event) => {
		const keys = [' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'];
		if (keys.includes(event.key)) event.preventDefault();
	};
	// Перетаскивание полосы прокрутки колесом/клавишами не заблокировать, поэтому
	// на время поворота возвращаем скролл на место (геометрия граней считается от него).
	let lockedY = 0;
	const holdScroll = () => {
		if (window.scrollY !== lockedY) window.scrollTo(0, lockedY);
	};
	const lockInput = (on) => {
		lockedY = window.scrollY;
		const method = on ? 'addEventListener' : 'removeEventListener';
		window[method]('scroll', holdScroll);
		window[method]('wheel', blockInput, { passive: false });
		window[method]('touchmove', blockInput, { passive: false });
		window[method]('keydown', blockKeys);
	};

	const isHeroPinned = () => hero && getComputedStyle(hero).position === 'fixed';

	// Собирает 3D-сцену: перспектива, размеры граней, ось вращения.
	function prepare3D() {
		const width = rotor.clientWidth;
		const scrollY = window.scrollY;
		const centerY = scrollY + window.innerHeight / 2;

		cube.classList.add('is-3d');
		rotor.classList.add('is-3d');

		// Передняя грань — ровно один экран страницы (как и грань "Работы"). Без
		// обрезки браузер рисует и вращает всю страницу целиком (теперь это
		// несколько экранов) — это тяжело и давало подёргивания.
		const pageHeight = stage.offsetHeight;
		const bottom = Math.max(0, pageHeight - scrollY - window.innerHeight);
		stage.style.clipPath = `inset(${scrollY}px 0 ${bottom}px 0)`;

		cube.style.perspective = `${PERSPECTIVE}px`;
		cube.style.perspectiveOrigin = `50% ${centerY}px`;

		rotor.style.setProperty('--cube-w', `${width}px`);
		rotor.style.setProperty('--face-top', `${scrollY}px`);
		rotor.style.setProperty('--face-h', `${window.innerHeight}px`);

		// Ось вращения: центр куба (x = W/2, z = -W/2).
		gsap.set(rotor, { transformOrigin: `50% 50% ${-width / 2}px`, willChange: 'transform' });

		// Закреплённый hero внутри transform-предка начинает позиционироваться
		// относительно страницы, а не окна — компенсируем сдвигом.
		if (isHeroPinned()) hero.style.translate = `0 ${scrollY}px`;
	}

	function cleanup3D() {
		gsap.set(rotor, { clearProps: 'transform,transformOrigin,willChange' });
		['--cube-w', '--face-top', '--face-h', '--shade-a', '--shade-b'].forEach((name) =>
			rotor.style.removeProperty(name)
		);
		rotor.classList.remove('is-3d');
		cube.classList.remove('is-3d');
		cube.style.perspective = '';
		cube.style.perspectiveOrigin = '';
		stage.style.clipPath = '';
		if (hero) hero.style.translate = '';
	}

	// Анимация поворота rotor от угла from до угла to. Куб слегка "отъезжает"
	// назад посередине (чтобы ближний угол не вылетал за экран) и возвращается.
	function spin(from, to, onComplete) {
		// Затемнение граней: уходящая темнеет почти до чёрного, приходящая
		// начинает чуть затемнённой и светлеет до нормальной.
		const SHADE_A = 0.85;
		const SHADE_B = 0.7;
		const shadeFrom = from === 0 ? { a: 0, b: SHADE_B } : { a: SHADE_A, b: 0 };
		const shadeTo = from === 0 ? { a: SHADE_A, b: 0 } : { a: 0, b: SHADE_B };

		return gsap
			.timeline({ onComplete })
			.fromTo(
				rotor,
				{ rotationY: from, '--shade-a': shadeFrom.a, '--shade-b': shadeFrom.b },
				{
					rotationY: to,
					'--shade-a': shadeTo.a,
					'--shade-b': shadeTo.b,
					duration: DURATION,
					ease: 'power3.inOut',
				},
				0
			)
			// sine.inOut в обе стороны: отъезд плавно разгоняется и плавно
			// замирает, как и сам поворот (power3.inOut). Иначе в конце грань
			// на долю секунды "довыпрыгивает" до полного размера экрана.
			.fromTo(rotor, { z: 0 }, { z: -DEPTH, duration: DURATION / 2, ease: 'sine.inOut' }, 0)
			.to(rotor, { z: 0, duration: DURATION / 2, ease: 'sine.inOut' }, DURATION / 2);
	}

	function setPageHidden(hidden) {
		stage.style.visibility = hidden ? 'hidden' : '';
		stage.inert = hidden;
	}

	function setWorksActive(active) {
		works.inert = !active;
		works.style.visibility = active ? 'visible' : '';
	}

	// ─── Открытие ───────────────────────────────────────────────────────

	function finishOpen() {
		cleanup3D(); // грань B превращается обратно в fixed-оверлей — те же пиксели
		gsap.set(stage, { clearProps: 'opacity' });
		setPageHidden(true);
		root.classList.add('is-works-open'); // убирает скролл страницы
		works.inert = false;
		lockInput(false);
		state = 'open';

		title?.focus({ preventScroll: true });

		// Закрытие запросили во время поворота — выполняем сразу после него.
		if (pendingClose) {
			pendingClose = false;
			requestClose();
			return;
		}

		// Пока шла анимация, адрес мог измениться (например, нажали "назад").
		if (location.hash !== HASH) close();
	}

	function open() {
		if (state !== 'closed') return;
		state = 'opening';

		works.scrollTop = 0;
		works.style.visibility = 'visible';
		works.inert = true; // пока идёт поворот, фокус внутрь не пускаем
		stage.inert = true;
		lockInput(true);

		timeline?.kill();

		if (reduceMotion.matches) {
			// Без 3D: страница плавно растворяется, под ней проступают "Работы".
			timeline = gsap
				.timeline({ onComplete: finishOpen })
				.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'power1.out' });
			return;
		}

		prepare3D();

		const head = works.querySelectorAll('.works__back, .works__head > *');
		const cards = works.querySelectorAll('.works__card');

		timeline = spin(0, -90, finishOpen);
		// Содержимое грани "Работы" появляется, когда куб почти довернулся.
		timeline
			.from(
				head,
				{
					opacity: 0,
					y: 20,
					duration: 0.55,
					stagger: 0.07,
					ease: 'power3.out',
					clearProps: 'opacity,transform',
				},
				DURATION * 0.55
			)
			.from(
				cards,
				{
					opacity: 0,
					y: 28,
					duration: 0.6,
					stagger: 0.06,
					ease: 'power3.out',
					clearProps: 'opacity,transform',
				},
				DURATION * 0.65
			);
	}

	// Открыто сразу, без анимации (ссылка site/#work).
	function openInstant() {
		setWorksActive(true);
		setPageHidden(true);
		root.classList.add('is-works-open');
		state = 'open';
	}

	// ─── Закрытие ───────────────────────────────────────────────────────

	function finishClose() {
		cleanup3D();
		gsap.set(stage, { clearProps: 'opacity' });
		setWorksActive(false);
		setPageHidden(false);
		lockInput(false);
		state = 'closed';

		lastTrigger?.focus({ preventScroll: true });
		lastTrigger = null;

		onClosed?.();
		onClosed = null;

		// Пока шла анимация, адрес мог снова стать #work.
		if (location.hash === HASH) open();
	}

	function close() {
		if (state !== 'open') return;
		state = 'closing';

		root.classList.remove('is-works-open'); // вернуть скролл страницы
		works.inert = true;
		stage.inert = true;
		stage.style.visibility = ''; // страница снова видна (на передней грани)
		lockInput(true);

		timeline?.kill();

		if (reduceMotion.matches) {
			// Без 3D: страница плавно проявляется поверх "Работ".
			timeline = gsap
				.timeline({ onComplete: finishClose })
				.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.in' });
			return;
		}

		prepare3D();
		timeline = spin(-90, 0, finishClose);
	}

	// ─── История браузера ───────────────────────────────────────────────

	function requestOpen(trigger) {
		if (state !== 'closed') return;
		lastTrigger = trigger ?? null;
		history.pushState({ works: true }, '', HASH);
		open();
	}

	// Возвращает Promise, который выполнится, когда блок полностью закроется.
	function requestClose() {
		if (state === 'opening') {
			pendingClose = true;
			return new Promise((resolve) => {
				onClosed = resolve;
			});
		}
		if (state !== 'open') return Promise.resolve();

		const done = new Promise((resolve) => {
			onClosed = resolve;
		});

		if (history.state?.works) {
			history.back(); // popstate сам вызовет close()
		} else {
			// Открыли по прямой ссылке — просто убираем #work из адреса.
			history.replaceState(null, '', location.pathname + location.search);
			close();
		}
		return done;
	}

	window.addEventListener('popstate', () => {
		if (location.hash === HASH) {
			if (state === 'closed') open();
		} else if (state === 'open') {
			close();
		}
	});

	// ─── События ────────────────────────────────────────────────────────

	document.addEventListener('click', (event) => {
		// Пропускаем клики с модификаторами (открыть в новой вкладке и т.п.).
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const trigger = event.target.closest(TRIGGER_SELECTOR);
		if (trigger) {
			event.preventDefault();
			requestOpen(trigger);
			return;
		}

		// Пока блок "Работы" открыт, ссылки шапки (Services, логотип и т.д.)
		// сначала закрывают его, а потом ведут к своему разделу.
		if (state !== 'open') return;
		const anchor = event.target.closest('a[href^="#"]');
		const hash = anchor?.getAttribute('href');
		if (!anchor || !hash || hash === '#') return;

		event.preventDefault();
		requestClose().then(() => {
			document.querySelector(hash)?.scrollIntoView();
		});
	});

	backButton?.addEventListener('click', () => requestClose());

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && (state === 'open' || state === 'opening')) requestClose();
	});

	// Прямая ссылка site/#work
	if (location.hash === HASH) openInstant();
}

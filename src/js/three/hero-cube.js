// src/js/three/hero-cube.js
//
// 3D-куб в hero. Модуль тяжёлый (three.js), поэтому main.js подгружает его
// динамически уже ПОСЛЕ первой отрисовки страницы — текст и вёрстка
// появляются мгновенно, куб "подъезжает" следом.

import {
	AgXToneMapping,
	AmbientLight,
	Box3,
	Color,
	DirectionalLight,
	Group,
	HemisphereLight,
	PerspectiveCamera,
	PointLight,
	Scene,
	SRGBColorSpace,
	Vector3,
	WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// ─── Модель ──────────────────────────────────────────────────────────────
// GLB сжат (quantization + meshopt): ~115 КБ вместо ~720 КБ.
// Оригинал лежит в git-истории (public/models/rodion-cube-desktop.glb).
const MODEL_URL = `${import.meta.env.BASE_URL}models/rodion-cube-desktop.glb`;
const MODEL_SIZE = 1.65; // во сколько единиц сцены вписываем модель

// ─── Палитра ─────────────────────────────────────────────────────────────
const ELECTRIC_BLUE = 0x2f6bff;
const PURE_BLUE = 0x0055ff;
const TEXT_BLUE = 0x5d91ff;
const INNER_GLOW_COLOR = 0x0055ff;
const INNER_GLOW_INTENSITY = 0.65;
const TEXT_EMISSIVE = 0x123b9c;
const BRIGHT_TINT = new Color(0x304a78);

// ─── Вращение ────────────────────────────────────────────────────────────
const AUTO_ROTATE_SPEED = -0.1; // рад/с
const DRAG_ROTATE_SPEED = 0.005;
const DAMPING = 0.92; // затухание "броска" после отпускания
const IDLE_RESUME_DELAY = 1500; // мс до возврата к автовращению
const INITIAL_ROTATION_DELAY = 300; // мс до старта автовращения
const REST_TILT_X = -0.25; // к этому наклону куб возвращается
const MAX_TILT_X = Math.PI / 4;

const MAX_PIXEL_RATIO = 2;

// Логи материалов полезны при разработке (npm run dev), в проде молчим.
const debugLog = (...args) => {
	if (import.meta.env.DEV) console.log(...args);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// ─── Сцена ───────────────────────────────────────────────────────────────

function createRenderer(width, height) {
	// Без WebGL (отключено ускорение, старое устройство) конструктор бросает
	// исключение — возвращаем null, чтобы остальной сайт работал без куба.
	try {
		const renderer = new WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
		renderer.setSize(width, height);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = AgXToneMapping;
		renderer.toneMappingExposure = 0.7;
		return renderer;
	} catch (error) {
		console.warn('[hero-cube] WebGL недоступен, 3D-блок пропущен.', error);
		return null;
	}
}

function addLights(scene) {
	const key = new DirectionalLight(0x8dbaff, 0.55);
	key.position.set(4, 6, 6);

	const rim = new PointLight(ELECTRIC_BLUE, 0.8, 12, 2);
	rim.position.set(-3, 2, -4);

	const accent = new PointLight(PURE_BLUE, 0.6, 10, 2);
	accent.position.set(3, -2, 2);

	const textFill = new DirectionalLight(ELECTRIC_BLUE, 0.12);
	textFill.position.set(0, -1, 6);

	scene.add(
		new AmbientLight(0x101a30, 0.22),
		new HemisphereLight(0x183b80, 0x03050a, 0.22),
		key,
		rim,
		accent,
		textFill
	);
}

// ─── Материалы модели ────────────────────────────────────────────────────

const TEXT_PATTERN = /text|rodion|frontend|logo|label/i;

function styleMaterial(node, mat) {
	const nodeName = (node.name || '').toLowerCase();
	const materialName = (mat.name || '').toLowerCase();

	debugLog('[hero-cube] material:', {
		node: node.name,
		material: mat.name,
		color: mat.color?.getHexString() ?? null,
		emissive: mat.emissive?.getHexString() ?? null,
		emissiveIntensity: mat.emissiveIntensity,
	});

	const isText = TEXT_PATTERN.test(nodeName) || TEXT_PATTERN.test(materialName);

	const hasEmissive = Boolean(
		mat.emissive && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)
	);
	const brightness = mat.color ? (mat.color.r + mat.color.g + mat.color.b) / 3 : 0;
	const isVeryBright = brightness > 0.65;

	// Внутреннее свечение куба: яркий материал с emissive (или яркая часть
	// модели с именем cube001/002/003).
	const isInnerGlow =
		!isText &&
		((hasEmissive && isVeryBright) ||
			(isVeryBright && /cube00[123]/.test(nodeName)));

	if ('envMapIntensity' in mat) {
		mat.envMapIntensity = isInnerGlow ? 0.05 : 0.12;
	}

	if (isInnerGlow) {
		debugLog('[hero-cube] INNER BLUE GLOW:', node.name, mat.name);
		mat.color?.setHex(INNER_GLOW_COLOR);
		if (mat.emissive) {
			mat.emissive.setHex(INNER_GLOW_COLOR);
			mat.emissiveIntensity = INNER_GLOW_INTENSITY;
		}
		if ('roughness' in mat) mat.roughness = 0.32;
		if ('metalness' in mat) mat.metalness = 0.15;
		return;
	}

	if (isText) {
		mat.color?.setHex(TEXT_BLUE);
		if (mat.emissive) {
			mat.emissive.setHex(TEXT_EMISSIVE);
			mat.emissiveIntensity = 0.3;
		}
		if ('metalness' in mat) mat.metalness = 0.1;
		if ('roughness' in mat) mat.roughness = 0.4;
		return;
	}

	if (mat.type === 'MeshBasicMaterial' || mat.type === 'MeshMatcapMaterial') {
		mat.color?.setHex(ELECTRIC_BLUE);
	}

	if (mat.color && 'metalness' in mat && 'roughness' in mat) {
		const current = (mat.color.r + mat.color.g + mat.color.b) / 3;
		if (current > 0.75) mat.color.lerp(BRIGHT_TINT, 0.25);
		mat.roughness = Math.max(mat.roughness, 0.32);
	}
}

function prepareModel(model) {
	// Центрируем и масштабируем модель под сцену.
	const box = new Box3().setFromObject(model);
	const center = box.getCenter(new Vector3());
	const size = box.getSize(new Vector3());

	model.position.sub(center);

	const maxDim = Math.max(size.x, size.y, size.z);
	if (maxDim > 0) model.scale.setScalar(MODEL_SIZE / maxDim);

	model.traverse((node) => {
		if (!node.isMesh) return;
		const materials = Array.isArray(node.material) ? node.material : [node.material];
		materials.forEach((mat) => mat && styleMaterial(node, mat));
	});
}

// ─── Точка входа ─────────────────────────────────────────────────────────

export function initHeroCube() {
	const container = document.querySelector('[data-three-target]');
	if (!container) {
		console.error('[hero-cube] Контейнер [data-three-target] не найден.');
		return;
	}

	let width = container.clientWidth;
	let height = container.clientHeight;
	if (width === 0 || height === 0) {
		console.warn('[hero-cube] Размер контейнера равен 0.');
		return;
	}

	const renderer = createRenderer(width, height);
	if (!renderer) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const canvas = renderer.domElement;

	// pan-y: вертикальный свайп по кубу листает страницу (на телефоне куб
	// занимает пол-экрана), горизонтальный drag вращает куб.
	canvas.style.touchAction = 'pan-y';
	canvas.style.cursor = 'grab';
	// Куб плавно проявляется, когда модель загружена.
	canvas.style.opacity = '0';
	canvas.style.transition = reduceMotion ? 'none' : 'opacity 0.6s ease';
	container.appendChild(canvas);

	const scene = new Scene();
	const camera = new PerspectiveCamera(35, width / height, 0.1, 100);
	camera.position.set(0, -0.6, window.innerWidth < 640 ? 4.6 : 5);
	camera.lookAt(0, 0, 0);
	addLights(scene);

	const cubeGroup = new Group();
	scene.add(cubeGroup);

	const loader = new GLTFLoader();
	loader.setMeshoptDecoder(MeshoptDecoder);
	loader.load(
		MODEL_URL,
		(gltf) => {
			prepareModel(gltf.scene);
			cubeGroup.add(gltf.scene);
			canvas.style.opacity = '1';
			debugLog('[hero-cube] GLB-модель успешно загружена.');
		},
		undefined,
		(error) => console.error('[hero-cube] Ошибка загрузки GLB-модели:', error)
	);

	// ── Управление вращением ──
	const autoRotateSpeed = reduceMotion ? 0 : AUTO_ROTATE_SPEED;
	const rotation = { x: REST_TILT_X, y: -0.6 };
	const dragVelocity = { x: 0, y: 0 };
	const pointer = { x: 0, y: 0 };
	const startTime = performance.now();
	let lastInteraction = startTime;
	let isDragging = false;

	const clampTilt = () => {
		rotation.x = clamp(rotation.x, -MAX_TILT_X, MAX_TILT_X);
	};

	canvas.addEventListener('pointerdown', (event) => {
		isDragging = true;
		pointer.x = event.clientX;
		pointer.y = event.clientY;
		dragVelocity.x = 0;
		dragVelocity.y = 0;
		canvas.style.cursor = 'grabbing';
	});

	window.addEventListener('pointermove', (event) => {
		if (!isDragging) return;

		dragVelocity.x = (event.clientX - pointer.x) * DRAG_ROTATE_SPEED;
		dragVelocity.y = (event.clientY - pointer.y) * DRAG_ROTATE_SPEED;
		pointer.x = event.clientX;
		pointer.y = event.clientY;

		rotation.y += dragVelocity.x;
		rotation.x += dragVelocity.y;
		clampTilt();
		lastInteraction = performance.now();
	});

	const endDrag = () => {
		isDragging = false;
		canvas.style.cursor = 'grab';
		lastInteraction = performance.now();
	};
	window.addEventListener('pointerup', endDrag);
	window.addEventListener('pointercancel', endDrag);

	// ── Размер ──
	new ResizeObserver(() => {
		width = container.clientWidth;
		height = container.clientHeight;
		if (width === 0 || height === 0) return;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
		renderer.setSize(width, height);
	}).observe(container);

	// ── Пауза, когда hero не виден ──
	// Пока hero прокручен или накрыт секцией Services, куб не виден — не
	// тратим GPU и батарею на 60 fps впустую.
	const hero = container.closest('.hero');
	let isHeroVisible = true;
	const updateVisibility = () => {
		isHeroVisible = !hero || window.scrollY < hero.offsetHeight;
	};
	window.addEventListener('scroll', updateVisibility, { passive: true });
	updateVisibility();

	const flipRoot = document.documentElement;
	const flipCube = document.querySelector('[data-cube]');
	const pageFlipping = () => flipRoot.classList.contains('is-works-open') || flipCube?.classList.contains('is-3d');

	// ── Цикл анимации ──
	cubeGroup.rotation.set(rotation.x, rotation.y, 0);
	let lastFrame = performance.now();

	function animate(now) {
		requestAnimationFrame(animate);

		const delta = Math.max(0, Math.min((now - lastFrame) / 1000, 0.1));
		lastFrame = now;
		// Пока страница поворачивается кубом к «Работам» или блок «Работы» открыт,
		// hero не нужен: не рендерим, чтобы не тормозить поворот.
		if (!isHeroVisible || pageFlipping()) return;

		const idleFor = now - lastInteraction;
		const isCoasting =
			Math.abs(dragVelocity.x) > 0.0001 || Math.abs(dragVelocity.y) > 0.0001;

		if (!isDragging) {
			if (idleFor < IDLE_RESUME_DELAY && isCoasting) {
				// После броска куб ещё немного вращается по инерции.
				rotation.y += dragVelocity.x;
				rotation.x += dragVelocity.y;
				clampTilt();
				dragVelocity.x *= DAMPING;
				dragVelocity.y *= DAMPING;
			} else if (now - startTime >= INITIAL_ROTATION_DELAY) {
				// Автовращение и плавный возврат к исходному наклону.
				rotation.y += autoRotateSpeed * delta;
				rotation.x += (REST_TILT_X - rotation.x) * 0.02;
			}
		}

		cubeGroup.rotation.set(rotation.x, rotation.y, 0);
		renderer.render(scene, camera);
	}

	requestAnimationFrame(animate);
}

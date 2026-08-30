// src/js/three/hero-cube.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const ELECTRIC_BLUE =
	0x2f6bff;

const PURE_BLUE =
	0x0055ff;

const CYAN_BLUE =
	0x35aaff;

const LIGHT_BLUE =
	0x72b7ff;

const TEXT_BLUE =
	0x5d91ff;

const DARK_BASE =
	0x0d1016;

const INNER_GLOW_COLOR =
	0x0055ff;
const INNER_GLOW_INTENSITY =
	0.65;

export function initHeroCube() {

	const container =
		document.querySelector(
			'[data-three-target]'
		);
	if (!container) {
		console.error(
			'[hero-cube] Контейнер [data-three-target] не найден.'
		);
		return;
	}
	let width =
		container.clientWidth;
	let height =
		container.clientHeight;
	if (
		width === 0 ||
		height === 0
	) {
		console.warn(
			'[hero-cube] Размер контейнера равен 0.'
		);

		return;

	}
	const scene =
		new THREE.Scene();
	const camera =
		new THREE.PerspectiveCamera(

			35,

			width / height,

			0.1,

			100

		);
	camera.position.set(
		0,
		-0.6,
		5
	);
	camera.lookAt(
		0,
		0,
		0
	);
	const renderer =
		new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
	renderer.setPixelRatio(
		Math.min(
			window.devicePixelRatio,
			2
		)
	);
	renderer.setSize(
		width,
		height
	);


	renderer.outputColorSpace =
		THREE.SRGBColorSpace;
	renderer.toneMapping =
		THREE.AgXToneMapping;
	renderer.toneMappingExposure =
		0.7;
	container.appendChild(
		renderer.domElement
	);
	const ambientLight =
		new THREE.AmbientLight(
			0x101a30,
			0.22
		);
	scene.add(
		ambientLight
	);

	const hemiLight =
		new THREE.HemisphereLight(
			0x183b80,
			0x03050a,
			0.22
		);


	scene.add(

		hemiLight

	);

	const keyLight =
		new THREE.DirectionalLight(

			0x8dbaff,

			0.55

		);


	keyLight.position.set(

		4,
		6,
		6

	);


	scene.add(

		keyLight

	);

	const rimLight =
		new THREE.PointLight(

			ELECTRIC_BLUE,

			0.8,

			12,

			2

		);


	rimLight.position.set(

		-3,
		2,
		-4

		);


	scene.add(

		rimLight

	);

	const accentLight =
		new THREE.PointLight(

			PURE_BLUE,

			0.6,

			10,

			2

		);


	accentLight.position.set(

		3,
		-2,
		2

		);


	scene.add(

		accentLight

	);

	const textFillLight =
		new THREE.DirectionalLight(

			0x2f6bff,

			0.12

		);


	textFillLight.position.set(

		0,
		-1,
		6

		);


	scene.add(

		textFillLight

	);


	const dracoLoader =
		new DRACOLoader();


	dracoLoader.setDecoderPath(

		'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

	);

	const gltfLoader =
		new GLTFLoader();


	gltfLoader.setDRACOLoader(

		dracoLoader

	);

	const cubeGroup =
		new THREE.Group();


	scene.add(

		cubeGroup

	);


	gltfLoader.load(

		'/portfolio/models/rodion-cube-desktop.glb',


		(gltf) => {

			const cubeModel =
				gltf.scene;


			const box =
				new THREE.Box3().setFromObject(

					cubeModel

				);


			const center =
				box.getCenter(

					new THREE.Vector3()

				);


			const size =
				box.getSize(

					new THREE.Vector3()

				);


			cubeModel.position.sub(

				center

			);


			const maxDim =
				Math.max(

					size.x,
					size.y,
					size.z

				);


			if (

				maxDim > 0

			) {

				const desiredSize =
					1.65;


				const scale =
					desiredSize /
					maxDim;


				cubeModel.scale.setScalar(

					scale

				);

			}

			cubeModel.traverse(

				(node) => {

					if (

						!node.isMesh

					) {

						return;

					}


					const materials =
						Array.isArray(

							node.material

						)

							? node.material

							: [

								node.material

							];


					materials.forEach(

						(mat, materialIndex) => {

							if (!mat) {

								return;

							}


							const nodeName =
								(

									node.name ||
									''

								).toLowerCase();



							const materialName =
								(

									mat.name ||
									''

								).toLowerCase();


							console.log(

								'[hero-cube] material:',

								{

									node:
										node.name,

									material:
										mat.name,

									color:
										mat.color
											? mat.color.getHexString()
											: null,

									emissive:
										mat.emissive
											? mat.emissive.getHexString()
											: null,

									emissiveIntensity:
										mat.emissiveIntensity,

								}

							);


							const isText =
								/text|rodion|frontend|logo|label/i.test(

									nodeName

								) ||

								/text|rodion|frontend|logo|label/i.test(

									materialName

								);


							const hasEmissive =
								Boolean(

									mat.emissive &&

									(

										mat.emissive.r > 0 ||
										mat.emissive.g > 0 ||
										mat.emissive.b > 0

									)

								);
							let brightness =
								0;


							if (

								mat.color

							) {

								brightness =

									(

										mat.color.r +
										mat.color.g +
										mat.color.b

									) / 3;

							}



							const isVeryBrightMaterial =
								brightness > 0.65;


							const isInnerGlow =

								!isText &&

								(

									(
										hasEmissive &&
										isVeryBrightMaterial
									)

									||

									(
										isVeryBrightMaterial &&
										(
											nodeName.includes(
												'cube001'
											)

											||

											nodeName.includes(
												'cube002'
											)

											||

											nodeName.includes(
												'cube003'
											)
										)
									)

								);


							if (

								'envMapIntensity' in mat

							) {

								mat.envMapIntensity =

									isInnerGlow

										? 0.05

										: 0.12;

							}


							if (

								isInnerGlow

							) {

								console.log(

									'[hero-cube] INNER BLUE GLOW:',

									node.name,

									mat.name

								);

								if (

									mat.color

								) {

									mat.color.setHex(

										INNER_GLOW_COLOR

									);

								}
								if (

									mat.emissive

								) {

									mat.emissive.setHex(

										INNER_GLOW_COLOR

									);


									mat.emissiveIntensity =

										INNER_GLOW_INTENSITY;

								}

								if (

									'roughness' in mat

								) {

									mat.roughness =

										0.32;

								}

								if (

									'metalness' in mat

								) {

									mat.metalness =

										0.15;

								}


								return;

							}

							if (

								isText

							) {

								if (

									mat.color

								) {

									mat.color.setHex(

										TEXT_BLUE

									);

								}


								if (

									mat.emissive

								) {

									mat.emissive.setHex(

										0x123b9c

									);


									mat.emissiveIntensity =

										0.3;

								}


								if (

									'metalness' in mat

								) {

									mat.metalness =

										0.1;

								}


								if (

									'roughness' in mat

								) {

									mat.roughness =

										0.4;

								}


								return;

							}

							if (

								mat.type ===
									'MeshBasicMaterial'

								||

								mat.type ===
									'MeshMatcapMaterial'

							) {

								if (

									mat.color

								) {

									mat.color.setHex(

										ELECTRIC_BLUE

									);

								}

							}

							if (

								mat.color &&

								'metalness' in mat &&

								'roughness' in mat

							) {

								const currentBrightness =

									(

										mat.color.r +
										mat.color.g +
										mat.color.b

									) / 3;


								if (

									currentBrightness > 0.75

								) {

									mat.color.lerp(

										new THREE.Color(

											0x304a78

										),

										0.25

									);

								}


								mat.roughness =

									Math.max(

										mat.roughness,

										0.32

									);

							}

						}

					);

				}

			);


			cubeGroup.add(

				cubeModel

			);


			console.log(

				'[hero-cube] GLB-модель успешно загружена.'

			);

		},


		undefined,


		(error) => {

			console.error(

				'[hero-cube] Ошибка загрузки GLB-модели:',

				error

			);

		}

	);


	const AUTO_ROTATE_SPEED =
		-0.1;


	const DRAG_ROTATE_SPEED =
		0.005;


	const DAMPING =
		0.92;


	const IDLE_RESUME_DELAY =
		1500;


	const INITIAL_ROTATION_DELAY =
		300;


	let isDragging =
		false;


	let previousPointer = {

		x: 0,

		y: 0,

	};


	let dragVelocity = {

		x: 0,

		y: 0,

	};


	let targetRotation = {

		x: -0.25,

		y: -0.60,

	};


	const animationStartTime =
		performance.now();


	let lastInteractionTime =
		animationStartTime;


	function onPointerDown(

		event

	) {

		isDragging =

			true;


		previousPointer.x =

			event.clientX;


		previousPointer.y =

			event.clientY;


		dragVelocity.x =

			0;


		dragVelocity.y =

			0;

	}

	function onPointerMove(

		event

	) {

		if (

			!isDragging

		) {

			return;

		}


		const deltaX =

			event.clientX -

			previousPointer.x;


		const deltaY =

			event.clientY -

			previousPointer.y;


		previousPointer.x =

			event.clientX;


		previousPointer.y =

			event.clientY;


		dragVelocity.x =

			deltaX *

			DRAG_ROTATE_SPEED;


		dragVelocity.y =

			deltaY *

			DRAG_ROTATE_SPEED;


		targetRotation.y +=

			dragVelocity.x;


		targetRotation.x +=

			dragVelocity.y;


		const maxTiltX =

			Math.PI / 4;


		targetRotation.x =

			Math.max(

				-maxTiltX,

				Math.min(

					maxTiltX,

					targetRotation.x

				)

			);


		lastInteractionTime =

			performance.now();

	}

	function onPointerUp() {

		isDragging =

			false;


		lastInteractionTime =

			performance.now();

	}

	renderer.domElement.style.touchAction =

		'none';


	renderer.domElement.style.cursor =

		'grab';


	renderer.domElement.addEventListener(

		'pointerdown',

		(event) => {

			renderer.domElement.style.cursor =

				'grabbing';


			onPointerDown(

				event

			);

		}

	);


	window.addEventListener(

		'pointermove',

		onPointerMove

	);


	window.addEventListener(

		'pointerup',

		() => {

			renderer.domElement.style.cursor =

				'grab';


			onPointerUp();

		}

	);


	window.addEventListener(

		'pointercancel',

		onPointerUp

	);

	function handleResize() {

		width =

			container.clientWidth;


		height =

			container.clientHeight;


		if (

			width === 0 ||

			height === 0

		) {

			return;

		}


		camera.aspect =

			width /

			height;


		camera.updateProjectionMatrix();


		renderer.setPixelRatio(

			Math.min(

				window.devicePixelRatio,

				2

			)

		);


		renderer.setSize(

			width,

			height

		);

	}


	window.addEventListener(

		'resize',

		handleResize

	);

	const clock =

		new THREE.Clock();


	cubeGroup.rotation.y =

		targetRotation.y;


	cubeGroup.rotation.x =

		targetRotation.x;


	function animate() {

		requestAnimationFrame(

			animate

		);


		const delta =

			clock.getDelta();


		const now =

			performance.now();


		const idleSince =

			now -

			lastInteractionTime;
		if (

			isDragging

		) {

			cubeGroup.rotation.y =

				targetRotation.y;


			cubeGroup.rotation.x =

				targetRotation.x;

		}
		else if (

			idleSince <

				IDLE_RESUME_DELAY &&

			(

				Math.abs(

					dragVelocity.x

				) > 0.0001

				||

				Math.abs(

					dragVelocity.y

				) > 0.0001

			)

		) {

			targetRotation.y +=

				dragVelocity.x;


			targetRotation.x +=

				dragVelocity.y;


			const maxTiltX =

				Math.PI / 4;


			targetRotation.x =

				Math.max(

					-maxTiltX,

					Math.min(

						maxTiltX,

						targetRotation.x

					)

				);


			dragVelocity.x *=

				DAMPING;


			dragVelocity.y *=

				DAMPING;


			cubeGroup.rotation.y =

				targetRotation.y;


			cubeGroup.rotation.x =

				targetRotation.x;

		}

		else {

			const timeSinceStart =

				now -

				animationStartTime;


			if (

				timeSinceStart >=

				INITIAL_ROTATION_DELAY

			) {

				targetRotation.y +=

					AUTO_ROTATE_SPEED *

					delta;


				targetRotation.x +=

					(

						-0.25 -

						targetRotation.x

					) *

					0.02;

			}


			cubeGroup.rotation.y =

				targetRotation.y;


			cubeGroup.rotation.x =

				targetRotation.x;

		}

		renderer.render(

			scene,

			camera

		);

	}


	animate();

}
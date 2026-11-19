// Работы по умолчанию (если в админке ничего не менялось). Чистый модуль без DOM —
// его же читает scripts/gen-defaults.mjs для редактора в админке.
export const DEFAULT_WORKS = [
	{
		title: { en: 'Nedetsky Prazdnik — party venue', ru: 'Недетский праздник — пространство праздников' },
		description: {
			en: 'Website for a party venue in Krasnodar: gallery, video tour, pricing, FAQ and booking.',
			ru: 'Сайт пространства праздников в Краснодаре: галерея, видеоэкскурсия, цены, FAQ и бронирование.',
		},
		tags: ['HTML', 'SCSS', 'JS', 'UI'],
		image: '/images/nd-prazdnik.jpg',
		url: 'https://nd-prazdnik.com/',
	},
	{
		title: { en: 'Vasilich Design — 3D studio', ru: 'Vasilich Design — студия 3D' },
		description: {
			en: 'Design reference for a 3D visualization studio: interactive hero, services, packages, RU/EN.',
			ru: 'Дизайн-референс сайта студии 3D-визуализации: интерактивный первый экран, услуги, пакеты, RU/EN.',
		},
		tags: ['Three.js', 'HTML', 'SCSS', 'JS'],
		image: '/images/vasilich-design.jpg',
		url: 'https://topikan.github.io/vasilich-design/site/',
	},
];

// Собирает public/content-defaults.json из текущих текстов сайта — с него
// стартует редактор в админке (чтобы там сразу были все нынешние тарифы, FAQ и т.д.).
import { writeFileSync } from 'node:fs';
import { sectionTranslations as s } from '../src/js/i18n-sections.js';
import { DEFAULT_WORKS } from '../src/js/works-data.js';
import { CONTACTS } from '../src/config.js';

const both = (key) => ({ ru: s.ru[key] ?? '', en: s.en[key] ?? '' });
const plans = [
	{ n: 1, plan: 'landing', featured: false },
	{ n: 2, plan: 'site', featured: true },
	{ n: 3, plan: 'frontend', featured: false },
].map(({ n, plan, featured }) => ({
	plan,
	featured,
	name: both(`pricing.${n}.name`),
	price: both(`pricing.${n}.price`),
	time: both(`pricing.${n}.time`),
	features: [1, 2, 3, 4].map((i) => both(`pricing.${n}.f${i}`)),
}));
const out = {
	works: DEFAULT_WORKS,
	plans,
	terms: [1, 2, 3].map((i) => both(`pricing.t${i}`)),
	faq: [1, 2, 3, 4, 5].map((i) => ({ q: both(`faq.${i}.q`), a: both(`faq.${i}.a`) })),
	contacts: CONTACTS,
	photo: '/me-2.jpg',
};
writeFileSync(new URL('../public/content-defaults.json', import.meta.url), JSON.stringify(out, null, 1));
console.log('content-defaults.json written');

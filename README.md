# Rodion — сайт-портфолио (услуги веб-разработки)

Vite + SCSS + GSAP + three.js. Два языка (RU/EN), форма заявки, 3D-переход к работам.

## Запуск

```bash
npm install
npm run dev      # разработка
npm run build    # сборка в dist/
```

## Что править

- `src/config.js` — контакты, ключ формы (Web3Forms), аналитика.
- `src/js/i18n.js`, `src/js/i18n-sections.js` — все тексты RU/EN.
- `src/js/sections/works.js` — список проектов в блоке «Работы».
- `vite.config.js` — `SITE_URL` и `base` (для своего домена: `base: '/'`).

Публикация: пуш в `main` → GitHub Actions собирает и выкладывает на GitHub Pages.

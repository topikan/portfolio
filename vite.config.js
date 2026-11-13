import { defineConfig } from 'vite'

// Адрес, по которому сайт будет доступен (обязательно со слэшем на конце).
// Нужен для превью ссылки в мессенджерах и соцсетях (og:image и og:url
// должны быть абсолютными) и для canonical. Переедешь на свой домен —
// поменяй SITE_URL и base (на '/').
const SITE_URL = 'https://topikan.github.io/portfolio/'

export default defineConfig({
  base: '/portfolio/',
  // three.js подгружается лениво (import() в main.js). Без этого списка Vite в
  // режиме разработки находит его только на лету и перезагружает страницу.
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/loaders/GLTFLoader.js',
      'three/examples/jsm/libs/meshopt_decoder.module.js',
    ],
  },
  plugins: [
    {
      // В собранной странице нет HTML-комментариев: в DevTools / "исходном коде"
      // остаётся только разметка. (JS и CSS комментарии убирает минификатор.)
      name: 'strip-html-comments',
      enforce: 'post',
      transformIndexHtml: (html) => html.replace(/<!--[\s\S]*?-->/g, ''),
    },
    {
      name: 'inject-site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
    },
  ],
})

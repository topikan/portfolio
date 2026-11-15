import { defineConfig } from 'vite'

// Адрес, по которому сайт будет доступен (обязательно со слэшем на конце).
// Нужен для превью ссылки в мессенджерах и соцсетях (og:image и og:url
// должны быть абсолютными) и для canonical. Переедешь на свой домен —
// поменяй SITE_URL и base (на '/').
const SITE_URL = 'https://rodionfrontend.ru/'


// ─── Светлая тема ─────────────────────────────────────────────────────────
// Тёмная палитра зашита в стилях цветами. Чтобы не дублировать каждое правило
// вручную, на сборке для каждого правила с «тёмными» цветами добавляется копия
// `html[data-theme="light"] <селектор>` с тем же правилом в светлой палитре.
function lightTheme() {
  const SHADOW_PROPS = /shadow|filter/
  const alpha = (a, k = 1) => Math.min(1, +(parseFloat(a) * k).toFixed(3))
  const convert = (prop, value) => {
    let v = value
    // белые полупрозрачные линии/подложки → тёмные
    v = v.replace(/rgba\(\s*255,\s*255,\s*255,\s*([\d.]+)\s*\)/g, (_, a) => `rgba(12, 16, 32, ${alpha(a, 1.25)})`)
    // чёрные/почти чёрные: тени → мягкие синеватые, фоны → светлые
    v = v.replace(/rgba\(\s*(?:0,\s*0,\s*0|6,\s*6,\s*8|10,\s*10,\s*13),\s*([\d.]+)\s*\)/g, (_, a) =>
      SHADOW_PROPS.test(prop) ? `rgba(30, 45, 90, ${alpha(a, 0.28)})` : `rgba(229, 232, 239, ${a})`
    )
    v = v.replace(/#060608\b/gi, '#e5e8ef').replace(/#0a0a0d\b/gi, '#f0f2f7')
    if (/^(color|--color-text|--color-accent-text)$/.test(prop) || prop.startsWith('--')) {
      v = v.replace(/#f5f6f8\b/gi, '#242b3f')
    }
    v = v
      .replace(/#5d91ff\b/gi, '#2457d6')
      .replace(/#5b8cff\b/gi, '#2457d6')
      .replace(/#9db9ff\b/gi, '#2f5fd0')
      .replace(/#8b8f98\b/gi, '#596078')
      .replace(/#6f737c\b/gi, '#6b7080')
    return v
  }
  const prefix = (sel) =>
    sel
      .split(',')
      .map((s) => s.trim())
      .map((s) => (/^(html|:root)$/.test(s) ? 'html[data-theme="light"]' : `html[data-theme="light"] ${s}`))
      .join(', ')
  return {
    postcssPlugin: 'light-theme',
    Once(root) {
      const clones = []
      root.walkRules((rule) => {
        const parent = rule.parent
        if (parent && parent.type === 'atrule' && /keyframes/.test(parent.name)) return
        if (/__mock|\.services__showcase|\.cube|html\[data-theme/.test(rule.selector)) return
        const changed = []
        rule.each((d) => {
          if (d.type !== 'decl') return
          const nv = convert(d.prop, d.value)
          if (nv !== d.value) changed.push([d.prop, nv, d.important])
        })
        if (!changed.length) return
        const clone = rule.clone({ selector: prefix(rule.selector) })
        clone.removeAll()
        changed.forEach(([prop, value, important]) => clone.append({ prop, value, important }))
        clones.push([rule, clone])
      })
      clones.forEach(([rule, clone]) => rule.after(clone))
    },
  }
}
lightTheme.postcss = true

export default defineConfig({
  css: { postcss: { plugins: [lightTheme()] } },
  base: '/',
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

import './style.scss';
import { initHeroCube } from './js/three/hero-cube.js';
import { initI18n } from './js/i18n.js';
import { initInteractiveGrid } from './js/effects/interactive-grid.js';
import { initMobileMenu } from './js/nav/mobile-menu.js';
import { initServices } from './js/sections/services.js';
import { initHeroSnap } from './js/effects/hero-snap.js';

initHeroCube();
initI18n();
initInteractiveGrid();
initMobileMenu();
initServices();
initHeroSnap();
import { initSocket } from './network.js';
import { startRenderLoop } from './render.js';
import { initUI } from './ui.js';

initSocket(() => {
  initUI();
  startRenderLoop();
});
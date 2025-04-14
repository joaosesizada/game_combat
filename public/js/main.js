import { initSocket } from './network.js';
import { setupInputListeners } from './input.js';
import { startRenderLoop } from './render.js';
import { initUI } from './ui.js';

initSocket(() => {
  setupInputListeners();
  initUI();
  startRenderLoop();
});
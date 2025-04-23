import { initSocket } from './network.js';
import { startRenderLoop } from './render.js';
import { initUI } from './ui.js';
import { setupCanvas } from './configCanvas.js';

initSocket(() => {
  initUI();
  startRenderLoop();
  setupCanvas()
});
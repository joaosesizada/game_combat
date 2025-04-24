import { initSocket } from './network.js';
import { startRenderLoop } from './render.js';
import { setupCanvas } from './configCanvas.js';

initSocket(() => {
  startRenderLoop();
  setupCanvas()
});
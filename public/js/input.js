import { getSocket } from './network.js';

const keys = { w: false, a: false, d: false, s: false, ' ': false };

export function setupInputListeners() {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
      keys[key] = true;
      if (key === ' ') getSocket().emit('attack');
      getSocket().emit('move', keys);
    }
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
      keys[key] = false;
      getSocket().emit('move', keys);
    }
  });
}

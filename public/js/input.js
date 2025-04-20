import { getSocket } from './network.js';

const keys = { w: false, a: false, d: false, s: false, ' ': false };

export function setupInputListeners() {
  let lastKey = null;

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (!keys.hasOwnProperty(key)) return;
    keys[key] = true;
  
    if (key === 'a' || key === 'd') {
      lastKey = key;
    }
    
    if (key === ' ') getSocket().emit('attack');
      getSocket().emit('move', { keys, lastKey });
  });
  
  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (!keys.hasOwnProperty(key)) return;
    keys[key] = false;
    getSocket().emit('move', { keys, lastKey });
  });
}

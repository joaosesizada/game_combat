import { getSocket } from './network.js';

function handleMovement(keys) {
  const socket = getSocket(); // Obtém o socket ativo
  const localData = {
    userId: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
    photo_user: localStorage.getItem("photo_user"),
    victory: parseInt(localStorage.getItem("victory") || "0", 10),
    lose: parseInt(localStorage.getItem("lose") || "0", 10),
  };

  socket.emit("move", {
    keys,
    localData,
  });
}

// Exporta a função para ser usada em outros lugares
export { handleMovement };

const keys = { w: false, a: false, d: false, s: false, mouseLeft: false, mouseRight: false, scroll: false, lastHorizontal : ''};

export function setupInputListeners() {

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
      keys[key] = true;
      if (key === 'a' || key === 'd') {
        keys.lastHorizontal  = key
      }

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

  window.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (e.button === 0) {
      keys.mouseLeft = true;
    } else if (e.button === 1) {
      keys.scroll = true;
    } else if (e.button === 2) {
      keys.mouseRight = true;
    }

    getSocket().emit('move', keys);
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      keys.mouseLeft = false;
    } else if (e.button === 1) {
      keys.scroll = false;
    } else if (e.button === 2) {
      keys.mouseRight = false;
    }
    getSocket().emit('move', keys);
  });

  window.addEventListener("contextmenu", e => e.preventDefault());
}

import { getSocket } from './network.js';

export function initUI() {
  const play = document.getElementById("play");
  play.addEventListener("click", () => {
    const roomId = window.location.pathname.split('/').pop();
    getSocket().emit("startGame", { roomId });
  });
}
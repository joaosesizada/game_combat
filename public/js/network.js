import setup from './setup.js';
import Animator from './Animator.js';

const socket = io();
const animators = {};
let players = {};
let lastTimestamp = performance.now();

export function initSocket(onConnected) {
  socket.on('connect', () => {
    const roomId = getRoomIdFromURL();
    setTimeout(() => {
      socket.emit('addPlayer', { roomId });
    }, 500);
    onConnected();
  });

  socket.on('update', (serverPlayers) => {
    players = serverPlayers;
  });

  socket.on('goToGame', () => {
    document.getElementById("game").style.display = "block";
    document.getElementById("room").style.display = "none";
  });

  socket.on("updateRoom", ({ room }) => {
    document.getElementById('infoSala').innerHTML = room.id;
  });
}

export function getSocket() {
  return socket;
}

export function getPlayers() {
  return players;
}

export function getAnimator(playerId, playerData) {
  if (!animators[playerId]) {
    animators[playerId] = new Animator(setup, playerData.person, 'idle');
  }
  return animators[playerId];
}

export function cleanupAnimators() {
  for (const playerId in animators) {
    if (!players[playerId]) {
      delete animators[playerId];
    }
  }
}

function getRoomIdFromURL() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

import setup from './setup.js';
import Animator from './Animator.js';

const socket = io();
const animators = {};

let players = {};
let effects = []; 

let gameOver = false;
let gameOverData = null;

export function initSocket(onConnected) {
  socket.on('connect', () => {
    onConnected();
  });
  
  socket.on('update', (serverPlayers, serverEffects) => {
    players = serverPlayers;
    effects = serverEffects || [];
  });

  socket.on('goToGame', () => {
    document.getElementById("game").style.display = "block";
    document.getElementById("room").style.display = "none";
  });

  socket.on("updateRoom", ({ room }) => {
    document.getElementById('infoSala').innerHTML = room.id;
  });

  socket.on("gameOver", (data) => {
    gameOver = false;
    gameOverData = data;
  });
  
  socket.on("goToLobby", () => {
    window.location.href = '/';
  })
}

export function isGameOver() {
  return gameOver;
}

export function getGameOverData() {
  return gameOverData;
}

export function getSocket() {
  return socket;
}

export function getPlayers() {
  return players;
}

export function getEffects() {
  return effects;
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

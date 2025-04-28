import setup from './setup.js';
import Animator from './Animator.js';
import { setupInputListeners } from './input.js';

const socket = io();
const animators = {};
let players = {};
let effects = [];
let gameOver = false;
let gameOverData = null;

function getRoomIdFromURL() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

export function initSocket(onConnected) {
  socket.on('connect', () => {
    onConnected();
  });

  socket.on('updateRoom', ({ room }) => {
    document.getElementById('infoSala').textContent = room.id;
    const ids = Object.keys(room.players);
    document.getElementById('host').textContent = ids[0] || '';
    document.getElementById('player2').textContent = ids[1] || '';
  });

  socket.on('playerCount', ({ count }) => {
    document.getElementById('placar').textContent = `${count}/2`;
  });

  socket.on('update', (serverPlayers, serverEffects) => {
    players = serverPlayers;
    effects = serverEffects || [];
  });

  socket.on('goToGame', () => {
    document.getElementById('game').style.display = 'block';
    document.getElementById('room').style.display = 'none';
    setupInputListeners();
  });

  socket.on('gameOver', data => {
    gameOver = true;
    gameOverData = data;
  });

  socket.on('goToLobby', () => {
    window.location.href = '/';
  });

  // **Play** só ao clicar
  document.getElementById('play').addEventListener('click', () => {
    const character = document.getElementById('characterSelect').value;
    const roomId = getRoomIdFromURL();
    socket.emit('addPlayer', { roomId, characterType: character });
  });
}

export function isGameOver() { return gameOver; }
export function getGameOverData() { return gameOverData; }
export function getSocket() { return socket; }
export function getPlayers() { return players; }
export function getEffects() { return effects; }

export function getAnimator(playerId, playerData) {
  if (!animators[playerId]) {
    animators[playerId] = new Animator(setup, playerData.person, 'idle');
  }
  return animators[playerId];
}

export function cleanupAnimators() {
  for (const id in animators) {
    if (!players[id]) delete animators[id];
  }
}
